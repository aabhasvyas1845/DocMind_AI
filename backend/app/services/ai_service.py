import json
import re
from typing import List, Dict, Any, Optional
import numpy as np
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY

GENERATION_MODEL = "gemini-3.5-flash-lite"
EMBEDDING_MODEL = "gemini-embedding-001"

def get_client() -> Optional[genai.Client]:
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return None
    return genai.Client(api_key=GEMINI_API_KEY)

def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def get_embedding(client: genai.Client, text: str) -> List[float]:
    try:
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text
        )
        return response.embedding.values
    except Exception:
        return []

def retrieve_relevant_chunks(chunks: List[Dict[str, Any]], query: str, top_k: int = 7) -> List[Dict[str, Any]]:
    """
    Intelligent high-speed retrieval:
    1. Scores chunks with keyword & phrase weighting.
    2. Retrieves top 7 relevant chunks to provide deep academic context to the LLM.
    """
    if not chunks:
        return []

    words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_]{3,}\b', query)]
    stop_words = {"the", "and", "for", "with", "what", "how", "tell", "explain", "about", "this", "that", "from", "when", "does"}
    keywords = [w for w in words if w not in stop_words]
    if not keywords:
        keywords = words

    # Multi-term phrase for bonus scoring
    phrase = " ".join(keywords)

    scored_chunks = []
    for chunk in chunks:
        text = chunk["chunk_text"].lower()
        score = 0
        
        # Exact multi-word phrase bonus
        if len(keywords) > 1 and phrase in text:
            score += 15
            
        for kw in keywords:
            if kw in text:
                score += text.count(kw) * (len(kw) ** 1.3)
                
        if score > 0:
            scored_chunks.append((score, chunk))

    if scored_chunks:
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_chunks[:top_k]]

    return chunks[:top_k]

def answer_question(document_name: str, query: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    client = get_client()
    if not client:
        return {
            "answer": "Gemini API key is not configured. Please add it to backend/.env.",
            "source_page": context_chunks[0]["page_number"] if context_chunks else None
        }

    context_str = ""
    for c in context_chunks:
        context_str += f"\n--- [Page {c['page_number']}] ---\n{c['chunk_text']}\n"

    prompt = f"""You are DocMind AI, a world-class university professor and academic mentor.
A student studying "{document_name}" asked:
"{query}"

Here are relevant excerpts from the document with page numbers:
{context_str}

Please provide an exceptionally smart, structured, and pedagogical answer following these standards:
1. INTUITION & CORE CONCEPT: Begin with a clear, conceptual explanation of what the topic means and why it matters in practical/geometric terms.
2. RIGOROUS FORMULAS & DEFINITIONS: Present the exact mathematical definitions and equations from the document using standard LaTeX:
   - Use $...$ for inline variables and equations (e.g. $x \\in \\mathbb{{R}}^n$, $\\|x\\|$).
   - Use $$...$$ on their own separate lines for main equations, matrices, or fractions (e.g. $$\\frac{{x}}{{\\|x\\|}}$$).
   - Explicitly define what each variable and operator represents.
3. KEY PROPERTIES & AXIOMS: List the essential rules, properties, or theorems mentioned in the text using clean bullet points.
4. CITATIONS: Throughout your answer, cite the specific page from the excerpts (e.g. [Page X]) whenever stating a definition or formula.
5. FORMATTING: Use structured Markdown with clear headers (###), bold terminology, and bullet points. Avoid dense unbroken paragraphs.
6. End your response with this exact single line:
[PAGE: <page_number>]
Where <page_number> is the single most important page for this topic.
"""

    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt
        )
        full_text = response.text.strip()
        
        # Extract cited page if present
        source_page = None
        match = re.search(r'\[PAGE:\s*(\d+)\]', full_text, re.IGNORECASE)
        if match:
            source_page = int(match.group(1))
            full_text = re.sub(r'\[PAGE:\s*\d+\]', '', full_text).strip()
        elif context_chunks:
            source_page = context_chunks[0]["page_number"]

        return {
            "answer": full_text,
            "source_page": source_page
        }
    except Exception as e:
        return {
            "answer": f"Gemini is currently processing your request. Please try asking again in a few moments: {str(e)}",
            "source_page": context_chunks[0]["page_number"] if context_chunks else None
        }

def generate_summary(document_name: str, all_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    client = get_client()
    if not client:
        return {
            "title": f"Summary: {document_name}",
            "summary": "Configure GEMINI_API_KEY in backend/.env to generate intelligent summaries.",
            "key_points": ["API Key required", "FastAPI backend active"]
        }

    sample_text = "\n".join([f"[Page {c['page_number']}] {c['chunk_text'][:400]}" for c in all_chunks[:15]])
    
    prompt = f"""You are DocMind AI. Provide a concise, student-friendly academic summary of "{document_name}".
Excerpts:
{sample_text}

Respond in valid JSON with:
"title": "A short, engaging title summarizing the main subject",
"summary": "A 2 to 4 sentence clear explanation in simple terms",
"key_points": ["Point 1", "Point 2", "Point 3", "Point 4"]
"""
    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "title": f"Key concepts of {document_name}",
            "summary": "This document covers key academic concepts and practical principles.",
            "key_points": ["Core definitions", "Mechanisms and rules", "Key exam highlights"]
        }

def generate_exam_questions(document_name: str, all_chunks: List[Dict[str, Any]], count: int = 5, difficulty: str = "MEDIUM") -> Dict[str, Any]:
    client = get_client()
    if not client:
        return {
            "title": f"Exam Preparation - {document_name}",
            "questions": []
        }

    sample_text = "\n".join([f"[Page {c['page_number']}] {c['chunk_text'][:400]}" for c in all_chunks[:15]])
    
    prompt = f"""Generate {count} academic exam questions based on "{document_name}" at {difficulty} difficulty.
Include a mix of Multiple Choice Questions (MCQs) and True/False questions.
Excerpts:
{sample_text}

Respond in valid JSON:
{{
  "title": "Exam Questions for {document_name}",
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this answer is correct",
      "source_page": 1
    }}
  ]
}}
"""
    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "title": f"Exam Questions for {document_name}",
            "questions": []
        }

def generate_flashcards(document_name: str, all_chunks: List[Dict[str, Any]], count: int = 8) -> Dict[str, Any]:
    client = get_client()
    if not client:
        return {
            "cards": []
        }

    sample_text = "\n".join([f"[Page {c['page_number']}] {c['chunk_text'][:400]}" for c in all_chunks[:15]])
    
    prompt = f"""Generate {count} high-yield revision flashcards for students from "{document_name}".
Each flashcard must have a concise Question/Term on the front and a clear Answer/Definition on the back.
Excerpts:
{sample_text}

Respond in valid JSON:
{{
  "cards": [
    {{
      "id": 1,
      "question": "Question or Key Term",
      "answer": "Concise answer or definition",
      "source_page": 1
    }}
  ]
}}
"""
    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "cards": []
        }
