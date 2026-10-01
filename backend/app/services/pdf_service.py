import pymupdf
from typing import List, Dict, Any, Tuple
from pathlib import Path

def extract_pdf_content(file_path: Path) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Extracts text page-by-page from a PDF using PyMuPDF.
    Returns (total_pages, list of page dicts with page_number and text).
    """
    doc = pymupdf.open(str(file_path))
    total_pages = len(doc)
    pages_data = []

    for page_idx in range(total_pages):
        page = doc[page_idx]
        text = page.get_text("text").strip()
        pages_data.append({
            "page_number": page_idx + 1,
            "text": text
        })

    doc.close()
    return total_pages, pages_data

def chunk_pages_data(pages_data: List[Dict[str, Any]], chunk_size: int = 800, chunk_overlap: int = 150) -> List[Dict[str, Any]]:
    """
    Splits text from pages into manageable chunks while preserving the exact source page number.
    """
    chunks = []
    
    for page_item in pages_data:
        page_num = page_item["page_number"]
        text = page_item["text"]
        
        if not text:
            continue
            
        # Split page text into overlapping windows
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunk_str = text[start:end].strip()
            
            if chunk_str:
                chunks.append({
                    "page_number": page_num,
                    "chunk_text": chunk_str
                })
            
            if end >= text_len:
                break
            start += chunk_size - chunk_overlap

    return chunks
