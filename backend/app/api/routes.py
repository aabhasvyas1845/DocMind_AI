import shutil
import time
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

from app.config import UPLOAD_DIR
from app.db.database import (
    insert_document,
    get_all_documents,
    get_document_by_id,
    insert_chunks,
    get_chunks_for_document,
    save_chat_message,
    get_chat_history
)
from app.services.pdf_service import extract_pdf_content, chunk_pages_data
from app.services.ai_service import (
    retrieve_relevant_chunks,
    answer_question,
    generate_summary,
    generate_exam_questions,
    generate_flashcards,
    get_client,
    get_embedding
)

router = APIRouter()

class ChatRequest(BaseModel):
    document_id: int
    question: str

class SummarizeRequest(BaseModel):
    document_id: int

class ExamRequest(BaseModel):
    document_id: int
    count: Optional[int] = 5
    difficulty: Optional[str] = "MEDIUM"

class FlashcardRequest(BaseModel):
    document_id: int
    count: Optional[int] = 8

@router.post("/documents/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    safe_filename = f"{int(time.time())}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    size_bytes = file_path.stat().st_size
    size_mb = max(1, round(size_bytes / (1024 * 1024), 1))
    
    try:
        total_pages, pages_data = extract_pdf_content(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
        
    meta = f"{total_pages} pages · {size_mb} MB"
    doc_id = insert_document(
        name=file.filename,
        file_path=str(file_path),
        size_bytes=size_bytes,
        meta=meta,
        total_pages=total_pages
    )
    
    chunks = chunk_pages_data(pages_data)
    insert_chunks(doc_id, chunks)
    
    return {
        "id": doc_id,
        "name": file.filename,
        "meta": meta,
        "total_pages": total_pages,
        "file_url": f"/api/documents/{doc_id}/pdf"
    }

@router.get("/documents")
async def list_documents():
    docs = get_all_documents()
    for d in docs:
        d["file_url"] = f"/api/documents/{d['id']}/pdf"
    return docs

@router.get("/documents/{doc_id}")
async def get_document(doc_id: int):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc["file_url"] = f"/api/documents/{doc_id}/pdf"
    return doc

@router.get("/documents/{doc_id}/pdf")
async def serve_pdf(doc_id: int):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = Path(doc["file_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found on server")
        
    headers = {
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400"
    }
    return FileResponse(path, media_type="application/pdf", headers=headers)

@router.get("/documents/{doc_id}/chat")
async def get_messages(doc_id: int):
    return get_chat_history(doc_id)

@router.post("/chat")
async def chat_with_doc(req: ChatRequest):
    doc = get_document_by_id(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = get_chunks_for_document(req.document_id)
    relevant_chunks = retrieve_relevant_chunks(chunks, req.question, top_k=8)
    
    ai_result = answer_question(doc["name"], req.question, relevant_chunks)
    
    save_chat_message(req.document_id, "user", req.question)
    save_chat_message(req.document_id, "ai", ai_result["answer"], ai_result.get("source_page"))
    
    return {
        "role": "ai",
        "text": ai_result["answer"],
        "source": ai_result.get("source_page")
    }

@router.post("/summarize")
async def summarize_doc(req: SummarizeRequest):
    doc = get_document_by_id(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = get_chunks_for_document(req.document_id)
    summary_data = generate_summary(doc["name"], chunks)
    return summary_data

@router.post("/exam")
async def exam_mode(req: ExamRequest):
    doc = get_document_by_id(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = get_chunks_for_document(req.document_id)
    exam_data = generate_exam_questions(doc["name"], chunks, count=req.count or 5, difficulty=req.difficulty or "MEDIUM")
    return exam_data

@router.post("/flashcards")
async def flashcards(req: FlashcardRequest):
    doc = get_document_by_id(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = get_chunks_for_document(req.document_id)
    flashcard_data = generate_flashcards(doc["name"], chunks, count=req.count or 8)
    return flashcard_data
