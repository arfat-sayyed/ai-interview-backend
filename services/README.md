# AI Interview Assistant - Backend

Node.js backend API for AI-powered interview system with OpenAI integration.

## 🚀 Features

- RESTful API with Express.js
- PostgreSQL database with Prisma ORM
- PDF parsing for resume analysis
- OpenAI GPT integration for intelligent questions
- Comprehensive feedback generation
- File upload handling with Multer
- CORS enabled for frontend integration

## 🛠️ Tech Stack

- **Node.js** with Express.js
- **Prisma ORM** for database management
- **PostgreSQL** (via Supabase)
- **OpenAI API** for AI capabilities
- **Groq Console** for AI capabilities
- **PDF-Parse** for resume parsing
- **Multer** for file uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Supabase recommended)
- OpenAI API key (optional - has fallback)

## 🔧 Installation & Setup

1. Clone the repository:
git clone <https://github.com/arfat-sayyed/ai-interview-backend.git>
cd ai-interview-backend
Install dependencies: npm install

## Create .env file

## Database - Supabase

DATABASE_URL="postgresql://postgres:arfatSupabase99@db.usujkjjfvlgevqkbsjvi.supabase.co:5432/postgres"

## You can also add these for client-side usage later

SUPABASE_URL="<https://----ID---.supabase.co>"
SUPABASE_ANON_KEY="------"

## OpenAI

OPENAI_API_KEY="------"
GROQ_API_KEY="----"

## Server

PORT=5000

## Setup database

npx prisma db push
npx prisma generate

## Start the server

npm run dev

Server will run on <http://localhost:5000>

🔗 Frontend Integration
This backend is designed to work with the AI Interview Frontend.
Frontend repository: <https://github.com/arfat-sayyed/ai-interview-frontend.git>
