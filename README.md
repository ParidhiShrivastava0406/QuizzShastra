# 🧠 QuizzShastra  
**AI-powered quiz generator using Gemini AI**  

---

## 🚀 About the Project  
**QuizzShastra** is a web application that generates quizzes from PDFs using **Google Generative AI**. Upload a document, and the AI will parse the content to create a structured quiz automatically!  

### ✨ Features:  
✅ Upload a PDF file 📄  
✅ AI-powered content extraction 🤖  
✅ Automatically generates quizzes 📝  
✅ Uses **Gemini AI** for intelligent quiz creation 💡  
✅ Secure authentication with **NextAuth** 🔐  
✅ Beautiful UI with **ShadCN/UI** 🎨  
✅ Scalable backend with **Drizzle ORM, PostgreSQL, and Supabase** 🗄️  
✅ **User Dashboard** to view and manage quizzes 📊    

---

## 🛠️ Tech Stack  
- **Frontend:** Next.js, TypeScript, ShadCN/UI  
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL  
- **AI Integration:** Google Gemini AI  
- **Authentication:** NextAuth.js  
- **Database:** PostgreSQL (via Supabase)  

---

## 🔧 Setup & Installation  
### 1️⃣ Clone the Repository & Install Dependencies 
```bash
git clone https://github.com/ParidhiShrivastava0406/QuizzShastra.git
cd QuizzShastra
npm install
```
### 2️⃣ Setup Environment Variables
Create a new .env file and add your keys in the following manner:
```
API_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
AUTH_SECRET=""
DATABASE_URL=""
```
### 3️⃣ Run the Development Server
```bash
npx drizzle-kit push:pg
npm run dev
```
