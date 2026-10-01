from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.db.database import init_db

app = FastAPI(
    title="DocMind AI API",
    description="Backend for DocMind AI - Personal AI Assistant for Understanding Academic Documents",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default is http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "DocMind AI Backend",
        "version": "1.0.0",
        "endpoints": [
            "/api/documents",
            "/api/documents/upload",
            "/api/chat",
            "/api/summarize",
            "/api/exam",
            "/api/flashcards"
        ]
    }
