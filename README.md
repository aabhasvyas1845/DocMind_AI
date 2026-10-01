# DocMind AI 🧠📚

> **Intelligent Academic Document Companion & RAG Learning Platform**  
> *An AI-powered document analysis system that transforms complex textbooks and academic research papers into interactive study material with exact page-level citations.*

---

## 📌 Overview

**DocMind AI** is a full-stack, Retrieval-Augmented Generation (RAG) platform designed to eliminate the friction of studying lengthy academic textbooks (1,000+ pages) and lecture notes. 

Rather than reading through hundreds of pages or relying on generic AI hallucinations, DocMind AI indexes documents page-by-page, queries them in sub-second timeframes, and allows students to:
- Chat with documents while citing **exact physical page numbers** (`[PAGE: X]`).
- Generate concise **academic summaries** and key concept takeaways.
- Practice with auto-generated **Exam Quizzes** (Multiple Choice Questions & True/False with full rationale).
- Revise key formulas and concepts using **Interactive Flashcards**.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **📄 Page-Preserving PDF Parsing** | High-performance extraction of text and metadata across 1,000+ page PDFs using PyMuPDF (`fitz`). |
| **🔍 Sub-Second Vector Retrieval** | Optimized keyword-weighted semantic search that isolates relevant text chunks in `<0.02s`. |
| **💬 Verified Source Q&A** | Grounded question-answering with clickable `[PAGE: X]` citations linking answers directly to source pages. |
| **📝 Automated Summaries** | Synthesizes complex chapters into structured executive summaries and bullet points. |
| **🎯 Exam Mode Generator** | Produces rigorous practice test questions with answer keys and in-depth explanations. |
| **🗂️ Interactive Flashcard Decks** | Generates digital study cards with question prompts on the front and detailed answers on the back. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (v18)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Modern Responsive CSS3 (Glassmorphism & dark-themed dashboard)
- **API Client**: Native Fetch API (`api.js`)

### Backend & AI
- **Web Framework**: FastAPI (Asynchronous Python REST API)
- **Server**: Uvicorn ASGI
- **Document Processing**: PyMuPDF (`fitz`)
- **Database**: SQLite (Relational schema for documents, chunks, and chat history)
- **AI & LLM**: Google Gemini API (`gemini-3.5-flash-lite`, `gemini-embedding-001`)
- **Data Validation**: Pydantic v2

---

## 📁 Repository Structure

```text
DocMind_AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py              # FastAPI REST endpoints
│   │   ├── db/
│   │   │   └── database.py            # SQLite schema & database operations
│   │   ├── services/
│   │   │   ├── pdf_service.py         # PyMuPDF extraction & page chunking
│   │   │   ├── retrieval_service.py   # Vector search & similarity algorithms
│   │   │   └── ai_service.py          # Gemini LLM prompts (Chat, Exam, Cards)
│   │   ├── config.py                  # Environment configuration & settings
│   │   └── main.py                    # FastAPI entrypoint & CORS middleware
│   ├── uploads/                       # Document storage directory
│   ├── .env.example                   # Backend environment template
│   └── requirements.txt               # Python package dependencies
│
├── AIChat.jsx                         # AI conversation interface with citations
├── api.js                             # Frontend API service connector
├── App.css                            # Global styles and responsive layout
├── App.jsx                            # Main layout coordinator
├── index.html                         # Single Page Application entrypoint
├── main.jsx                           # React DOM root renderer
├── Navbar.jsx                         # Top header and status bar
├── PDFViewer.jsx                      # Side-by-side PDF rendering component
├── Sidebar.jsx                        # Document selector and tool navigation
├── StudyTools.jsx                     # Summary, Exam Test, and Flashcard tabs
├── Upload.jsx                         # Drag-and-drop document uploader
├── package.json                       # Node dependencies and scripts
└── README.md                          # Project documentation
```

---

## ⚙️ Prerequisites

Before running the project, ensure you have installed:
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
3. **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

## 🏁 Quick Start Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/DocMind_AI.git
cd DocMind_AI
```

---

### Step 2: Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment** *(recommended)*:
   ```bash
   # Windows (PowerShell / Command Prompt)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your Environment Variables**:
   Create a `.env` file in the `backend/` directory by copying `.env.example`:
   ```bash
   # Windows
   copy .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```
   Open `.env` and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   HOST=127.0.0.1
   UPLOAD_DIR=uploads
   DB_PATH=docmind.db
   ```

5. **Start the FastAPI Backend Server**:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The backend will be running at: `http://127.0.0.1:8000`*  
   *Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`*

---

### Step 3: Frontend Setup

Open a **new terminal window** in the project root directory (`DocMind_AI`):

1. **Install Node dependencies**:
   ```bash
   npm install
   ```

2. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The frontend will launch at: `http://localhost:5173`*

---

## 🌐 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload` | `POST` | Upload and process a PDF file into chunks with page numbers. |
| `/api/documents` | `GET` | List all processed documents in the database. |
| `/api/documents/{id}/chunks` | `GET` | Fetch all extracted chunks and page references for a document. |
| `/api/chat` | `POST` | Ask a question and receive an answer with source page citations. |
| `/api/summarize` | `POST` | Generate an academic summary and bullet takeaways. |
| `/api/exam` | `POST` | Generate practice MCQs and True/False test questions. |
| `/api/flashcards` | `POST` | Generate interactive study flashcards. |

---

## 🛡️ License

This project is developed for educational and academic research purposes.
