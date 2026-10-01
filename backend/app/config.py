import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
DB_PATH = BASE_DIR / os.getenv("DB_PATH", "docmind.db")

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
