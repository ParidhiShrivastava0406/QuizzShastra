import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import saveQuizz from "./saveToDb";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateQuiz(fullPrompt: string): Promise<any> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not provided");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Generate content from the model
      const result = await model.generateContent(fullPrompt);

      // Extract response text correctly from Gemini API
      let rawResponseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawResponseText || typeof rawResponseText !== "string") {
        throw new Error("Invalid response format from Gemini API.");
      }

      console.log("Raw response from Gemini API:", rawResponseText);

      // ✅ Fix: Clean JSON response aggressively
      let cleanedText = rawResponseText
        .replace(/^```json\s*|\s*```$/g, "") // Remove ```json ... ```
        .replace(/`/g, "") // Remove stray backticks (`)
        .replace(/(\r\n|\n|\r)/gm, "") // Remove all newlines
        .trim();

      // ✅ Validate JSON format before parsing
      if (!cleanedText.startsWith("{") || !cleanedText.endsWith("}")) {
        console.error("Invalid JSON format detected:", cleanedText);
        throw new Error("Response is not valid JSON format.");
      }

      console.log("Cleaned JSON response:", cleanedText);

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === 2) {
        throw new Error(`Failed to generate quiz after multiple attempts: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const document = body.get("pdf");

  try {
    const pdfLoader = new PDFLoader(document as Blob, {
      parsedItemSeparator: " ",
    });
    const docs = await pdfLoader.load();

    const selectedDocuments = docs.filter(
      (doc) => doc.pageContent !== undefined
    );
    const texts = selectedDocuments.map((doc) => doc.pageContent);

    const prompt = `Given the text which is a summary of the document, generate a quiz based on the text using the following JSON schema:

Quiz = {
  "name": string,
  "description": string,
  "questions": Array<{
    "questionText": string,
    "answers": Array<{
      "answerText": string,
      "isCorrect": boolean
    }>
  }>
}

Return: Quiz`;

    const fullPrompt = prompt + "\n" + texts.join("\n");

    // Call the quiz generation function
    const quizData = await generateQuiz(fullPrompt);

    // Log the parsed quiz data
    console.log("Parsed quiz data:", quizData);

    // Save the quiz data
    const { quizzId } = await saveQuizz(quizData);

    return NextResponse.json({ quizzId }, { status: 200 });
  } catch (error: unknown) {
    // Default error message
    let errorMessage = "An unknown error occurred.";

    // Check if the error is an instance of Error
    if (error instanceof Error) {
      errorMessage = `Error occurred: ${error.message}`;
    } else if (typeof error === "string") {
      errorMessage = `Error occurred: ${error}`;
    } else if (error && typeof error === "object" && "message" in error) {
      // Handle if error is an object with a message property
      errorMessage = `Error occurred: ${(error as { message: string }).message}`;
    }

    console.error("Error occurred while processing request:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
