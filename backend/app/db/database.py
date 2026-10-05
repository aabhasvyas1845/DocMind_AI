import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.config import DB_PATH

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        meta TEXT NOT NULL,
        total_pages INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        page_number INTEGER NOT NULL,
        chunk_text TEXT NOT NULL,
        embedding TEXT,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        source_page INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def insert_document(name: str, file_path: str, size_bytes: int, meta: str, total_pages: int) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO documents (name, file_path, size_bytes, meta, total_pages) VALUES (?, ?, ?, ?, ?)",
        (name, file_path, size_bytes, meta, total_pages)
    )
    doc_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return doc_id

def get_all_documents() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents ORDER BY id DESC")
    rows = cursor.fetchall()
    valid_docs = []
    
    for row in rows:
        d = dict(row)
        file_path = d.get("file_path")
        # If the file was deleted from disk, automatically clean it out of the database
        if file_path and Path(file_path).exists():
            valid_docs.append(d)
        else:
            cursor.execute("DELETE FROM document_chunks WHERE document_id = ?", (d["id"],))
            cursor.execute("DELETE FROM chat_messages WHERE document_id = ?", (d["id"],))
            cursor.execute("DELETE FROM documents WHERE id = ?", (d["id"],))
            
    conn.commit()
    conn.close()
    return valid_docs

def get_document_by_id(doc_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    if not row:
        cursor.execute("SELECT * FROM documents ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def insert_chunks(document_id: int, chunks: List[Dict[str, Any]]):
    conn = get_db()
    cursor = conn.cursor()
    for chunk in chunks:
        cursor.execute(
            "INSERT INTO document_chunks (document_id, page_number, chunk_text, embedding) VALUES (?, ?, ?, ?)",
            (document_id, chunk["page_number"], chunk["chunk_text"], chunk.get("embedding"))
        )
    conn.commit()
    conn.close()

def get_chunks_for_document(document_id: int) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM document_chunks WHERE document_id = ? ORDER BY page_number ASC", (document_id,))
    rows = cursor.fetchall()
    chunks = [dict(row) for row in rows]
    
    # If this specific duplicate upload has no chunks, check if another doc with the same name has chunks
    if not chunks:
        cursor.execute("SELECT name FROM documents WHERE id = ?", (document_id,))
        doc = cursor.fetchone()
        if doc:
            cursor.execute("""
                SELECT c.* FROM document_chunks c 
                JOIN documents d ON c.document_id = d.id 
                WHERE d.name = ? 
                ORDER BY c.page_number ASC
            """, (doc["name"],))
            rows = cursor.fetchall()
            chunks = [dict(row) for row in rows]
            
    conn.close()
    return chunks

def save_chat_message(document_id: int, role: str, text: str, source_page: Optional[int] = None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_messages (document_id, role, text, source_page) VALUES (?, ?, ?, ?)",
        (document_id, role, text, source_page)
    )
    conn.commit()
    conn.close()

def get_chat_history(document_id: int) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, text, source_page, created_at FROM chat_messages WHERE document_id = ? ORDER BY id ASC",
        (document_id,)
    )
    rows = cursor.fetchall()
    history = [dict(row) for row in rows]
    conn.close()
    return history
