# DocMind AI

> **AI-powered academic document companion for studying textbooks, notes, and research papers.**

DocMind AI is a full-stack web application that helps students understand and revise large PDF documents using AI.

Users can upload a PDF, ask questions about its content, generate summaries, create exam questions, and make flashcards. The system keeps track of the original page numbers so users can easily check where the information came from.

### Main workflow

**Upload PDF → Process → Ask Questions → Get AI Answers → Revise**

---

## Features

- **PDF Upload** — Upload academic PDFs directly from the application.
- **AI Document Chat** — Ask questions about the uploaded document.
- **Page References** — Answers include the relevant source page.
- **AI Summaries** — Generate short summaries and key points.
- **Exam Mode** — Generate MCQs and True/False questions with answers and explanations.
- **Flashcards** — Generate question-and-answer cards for revision.
- **PDF Viewer** — View the original document while studying.
- **Math Support** — Display mathematical expressions using KaTeX.
- **Chat History** — Save and access previous conversations.
- **Dark/Light Mode** — Switch between application themes.

---

## How It Works

DocMind processes the document before sending questions to the AI.

```text
                    PDF Upload
                        │
                        ▼
                 PDF Text Extraction
                        │
                        ▼
                   Text Chunking
                        │
                        ▼
                  SQLite Database
                        │
                        ▼
                  User Question
                        │
                        ▼
               Find Relevant Chunks
                        │
                        ▼
                 Google Gemini
                        │
                        ▼
                  AI Response
                        │
                        ▼
               Answer + Page Number
```

### 1. PDF Processing

When a PDF is uploaded:

1. PyMuPDF reads the document page by page.
2. Text is extracted from each page.
3. Large text is divided into smaller overlapping chunks.
4. Each chunk keeps its original page number.
5. The document and chunks are stored in SQLite.

Current chunk settings:

```text
Chunk size: 800 characters
Overlap:    150 characters
```

### 2. Document Retrieval

When a user asks a question, DocMind searches the stored document chunks.

The current retrieval system uses **keyword and phrase matching** to find relevant sections.

```text
Question
   ↓
Extract important words
   ↓
Search document chunks
   ↓
Score matching chunks
   ↓
Select relevant content
   ↓
Send context to Gemini
```

The selected content is then given to Gemini so that the answer is based on the uploaded document.

### 3. Page References

Because every chunk keeps its original page number, the AI can provide references such as:

```text
[PAGE: 42]
```

This makes it easier to verify an answer against the original PDF.

---

# Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| Vite | Development and build tool |
| CSS3 | Styling |
| Lucide React | Icons |
| KaTeX | Mathematical expressions |
| Fetch API | Backend communication |
| localStorage | Theme and local chat data |

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API |
| Uvicorn | Server |
| PyMuPDF | PDF processing |
| SQLite | Database |
| Pydantic | Data validation |
| NumPy | Vector/numerical operations |
| Google GenAI | Gemini integration |
| python-dotenv | Environment configuration |

### AI

Google Gemini is used for:

- Question answering
- Summaries
- Exam questions
- Flashcards

Gemini embedding support is also included in the backend for semantic retrieval and future improvements.

---

# Project Structure

```text
DocMind_AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── pdf_service.py
│   │   │   └── retrieval_service.py
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── .env.example
│   └── requirements.txt
│
├── AIChat.jsx
├── App.css
├── App.jsx
├── FormattedMessage.jsx
├── Navbar.jsx
├── PDFViewer.jsx
├── SettingsModal.jsx
├── Sidebar.jsx
├── StudyTools.jsx
├── Upload.jsx
├── api.js
├── index.html
├── main.jsx
├── package.json
└── README.md
```

### Important Files

| File | Purpose |
|---|---|
| `App.jsx` | Main application and state management |
| `AIChat.jsx` | AI chat interface |
| `StudyTools.jsx` | Summary, Exam Mode and Flashcards |
| `PDFViewer.jsx` | PDF display |
| `Sidebar.jsx` | Document navigation |
| `Upload.jsx` | PDF upload |
| `FormattedMessage.jsx` | Formats AI responses and math |
| `api.js` | Frontend API communication |
| `routes.py` | Backend API endpoints |
| `database.py` | SQLite database operations |
| `pdf_service.py` | PDF extraction and chunking |
| `retrieval_service.py` | Document retrieval |
| `ai_service.py` | Gemini AI operations |
| `main.py` | FastAPI application entry point |

---

# Database

DocMind uses **SQLite**, so no separate database server is required.

The main tables are:

```text
documents
    │
    ├── document_chunks
    │
    └── chat_messages
```

### Documents

Stores information such as:

- Document name
- File path
- File size
- Number of pages
- Upload time

### Document Chunks

Stores:

- Document ID
- Page number
- Extracted text
- Embedding data

### Chat Messages

Stores:

- Document ID
- User/AI role
- Message
- Source page
- Timestamp

---

# Requirements

Before running the project, install:

- **Node.js 18+**
- **Python 3.10+**
- **npm**
- **Google Gemini API key**

An internet connection is required for Gemini AI features.

No MySQL, MongoDB, PostgreSQL, or other database server is required.

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/DocMind_AI.git
cd DocMind_AI
```

---

## 2. Backend Setup

Go to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
.\venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Configure Gemini API

Create a `.env` file inside the `backend` folder.

You can copy the example:

### Windows

```powershell
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Add your configuration:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=127.0.0.1
UPLOAD_DIR=uploads
DB_PATH=docmind.db
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

**Do not upload your `.env` file to GitHub.**

---

## 4. Start the Backend

From the `backend` folder:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 5. Start the Frontend

Open a **new terminal** and return to the project root:

```bash
cd ..
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

Open this address in your browser.

---

# Running the Project

Two terminals are required.

### Terminal 1 — Backend

```bash
cd backend
```

Activate the virtual environment:

```powershell
.\venv\Scripts\activate
```

Start FastAPI:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2 — Frontend

From the project root:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# How to Use

1. Open the application.
2. Upload a PDF.
3. Wait for the document to finish processing.
4. Select the uploaded document.
5. Ask questions in the AI chat.
6. Check the page reference in the answer.
7. Use the Study Tools for:
   - Summary
   - Exam Mode
   - Flashcards
8. Use the PDF viewer to verify information from the original document.

### Example

Upload:

```text
Computer Networks.pdf
```

Ask:

```text
What is the difference between TCP and UDP?
```

DocMind will search the document, find relevant content, send it to Gemini, and return an answer with the relevant page reference.

---

# API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Backend status |
| `/api/documents/upload` | POST | Upload and process a PDF |
| `/api/documents` | GET | List uploaded documents |
| `/api/documents/{id}` | GET | Get document details |
| `/api/documents/{id}/pdf` | GET | Open the PDF |
| `/api/documents/{id}/chat` | GET | Get chat history |
| `/api/chat` | POST | Ask a question |
| `/api/summarize` | POST | Generate a summary |
| `/api/exam` | POST | Generate exam questions |
| `/api/flashcards` | POST | Generate flashcards |

---

# Security

Keep your Gemini API key private.

Never commit:

```text
.env
```

to GitHub.

Use:

```text
.env.example
```

to show which environment variables are required.

The current project is mainly designed for local and academic use. A production version should add authentication, access control, HTTPS, upload limits, and stronger security.

---

# Current Limitations

- Retrieval currently uses keyword and phrase matching.
- Scanned PDFs without selectable text may not work correctly.
- Gemini features require an API key and internet connection.
- Documents are stored locally.
- There is currently no user authentication.
- Large or image-heavy PDFs may take longer to process.
- The application is mainly designed for local/single-user use.

---

# Future Improvements

- Semantic vector search
- Hybrid keyword + vector retrieval
- OCR for scanned PDFs
- Better table and image extraction
- Streaming AI responses
- User authentication
- Cloud document storage
- Multi-user support
- Multiple document search
- Improved citation verification
- Cloud deployment

---

# Production Build

Create a production frontend build:

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

Preview the build:

```bash
npm run preview
```

---

# Troubleshooting

### Backend does not start

Check your Python version:

```bash
python --version
```

Make sure it is **3.10 or newer**.

Then reinstall the dependencies:

```bash
pip install -r requirements.txt
```

### Frontend cannot connect to backend

Make sure FastAPI is running:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Then check:

```text
http://127.0.0.1:8000/
```

### Gemini is not responding

Check the `.env` file and make sure:

```env
GEMINI_API_KEY=your_actual_key
```

is present.

Restart the backend after changing the API key.

### PDF upload fails

Check that:

- The file is a PDF.
- The backend is running.
- The `uploads` folder is available.
- The PDF is not corrupted.
- All Python dependencies are installed.

---

# License

This project is developed for **educational and academic purposes**.
