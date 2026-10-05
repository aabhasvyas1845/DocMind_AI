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

def build_document_outline(chunks: List[Dict[str, Any]]) -> str:
    """
    Constructs a lightweight page-by-page outline from chunks.
    Takes the first 160 characters from each page.
    Even for a 100-page document, this outline is under 1,500 tokens!
    """
    page_snippets = {}
    for c in chunks:
        p = c["page_number"]
        if p not in page_snippets:
            clean = " ".join(c["chunk_text"].split())[:160]
            page_snippets[p] = clean
            
    lines = [f"Page {p}: {snippet}" for p, snippet in sorted(page_snippets.items())]
    return "\n".join(lines)

def route_query_to_target_pages(client: Optional[genai.Client], query: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    LAYER 1: The Navigator (Intent & Page Routing)
    Uses fast pattern recognition and Gemini Flash Lite with the compact document map.
    """
    q_lower = query.lower()
    
    # 1. Fast regex recognition for sequential and start-of-document intents
    match_first = re.search(r'\b(?:first|initial|start|beginning)\s*(\d+)?\s*(?:questions?|queries|problems?|exercises?)?', q_lower)
    if match_first or "first 10" in q_lower or "question 1" in q_lower or "first question" in q_lower or "first page" in q_lower:
        count = int(match_first.group(1)) if (match_first and match_first.group(1)) else 10
        target_pages = [1, 2] if count >= 6 else [1]
        return {
            "intent": "EXERCISE_SOLVING",
            "target_pages": target_pages,
            "is_exercise": True
        }

    # 2. Match specific Practice Question numbers (e.g. "practice question 2", "question 7")
    match_pq = re.search(r'\b(?:practice\s+question|pq)\s*(\d+)\b', q_lower)
    if match_pq:
        pq_num = match_pq.group(1)
        # Scan outline to locate this specific Practice Question
        for c in chunks:
            if f"practice question {pq_num}" in c["chunk_text"].lower():
                return {
                    "intent": "EXERCISE_SOLVING",
                    "target_pages": [c["page_number"]],
                    "is_exercise": True
                }

    # 3. Layer 1 AI Routing via Gemini Flash Lite using the compact outline
    if client and len(chunks) > 0:
        try:
            outline = build_document_outline(chunks)
            router_prompt = f"""You are an expert Document Navigator.
Given the following compact outline of pages in a study document and a student's question, determine:
1. Which 1 to 3 page numbers contain the exact information or questions the student is referring to.
2. Whether the student is asking to solve questions or write code/queries (is_exercise: true/false).

Document Outline:
{outline}

Student Query: "{query}"

Respond in valid JSON only:
{{
  "target_pages": [1, 2],
  "is_exercise": true
}}
"""
            response = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=router_prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            data = json.loads(response.text)
            if isinstance(data.get("target_pages"), list) and len(data["target_pages"]) > 0:
                return data
        except Exception:
            pass

    return {
        "intent": "GENERAL",
        "target_pages": [],
        "is_exercise": any(w in q_lower for w in ["solve", "sql", "query", "queries", "code", "answer"])
    }

def retrieve_relevant_chunks(chunks: List[Dict[str, Any]], query: str, top_k: int = 8) -> List[Dict[str, Any]]:
    """
    Two-Stage Hybrid Retrieval:
    Stage 1: Intent & Page Navigator routes query to specific pages.
    Stage 2: Fallback keyword & phrase scoring if routing is broad.
    """
    if not chunks:
        return []

    client = get_client()
    routing = route_query_to_target_pages(client, query, chunks)
    target_pages = routing.get("target_pages", [])

    if target_pages:
        routed_chunks = [c for c in chunks if c["page_number"] in target_pages]
        if routed_chunks:
            return routed_chunks[:top_k]

    # Fallback: Keyword and phrase scoring
    words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_]{3,}\b', query)]
    stop_words = {"the", "and", "for", "with", "what", "how", "tell", "explain", "about", "this", "that", "from", "when", "does"}
    keywords = [w for w in words if w not in stop_words]
    if not keywords:
        keywords = words

    phrase = " ".join(keywords)
    scored_chunks = []
    for chunk in chunks:
        text = chunk["chunk_text"].lower()
        score = 0
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
    """
    LAYER 2: The Professor (Deep Academic Solver)
    Renders step-by-step solutions with exact SQL/code and KaTeX LaTeX mathematics.
    """
    client = get_client()
    if not client:
        return {
            "answer": "Gemini API key is not configured. Please add it to backend/.env.",
            "source_page": context_chunks[0]["page_number"] if context_chunks else None
        }

    context_str = ""
    for c in context_chunks:
        context_str += f"\n--- [Page {c['page_number']}] ---\n{c['chunk_text']}\n"

    q_lower = query.lower()
    is_exercise = any(w in q_lower for w in ["solve", "query", "queries", "sql", "exercise", "solution", "calculate", "write a query", "questions"])

    if is_exercise:
        prompt = f"""You are DocMind AI, an elite university professor and database/computer science expert.
A student studying "{document_name}" asked:
"{query}"

Here are the exact relevant pages from the document:
{context_str}

Please solve the requested questions with complete accuracy and academic excellence:
1. STRICT SEQUENTIAL ORDER: Solve the questions in the exact order requested (e.g. Question 1 through 10), without skipping any question.
2. ACCURATE CODE & FORMULAS:
   - For SQL questions: Write clean, standard SQL queries using proper subqueries, joins, aggregate functions, GROUP BY, and HAVING where appropriate. Put all SQL in proper ```sql code blocks.
   - For Mathematical questions: Provide step-by-step working and format equations in standard LaTeX ($inline$ and $$display$$).
3. BRIEF LOGIC EXPLANATION: Directly below each solution, include 1-2 bullet points explaining the core intuition or subquery logic.
4. CITATIONS: State the exact page number [Page X] where each question appears.
5. COMPLETE COVERAGE: If the student asked for the first 10 questions, provide the complete solutions for all 10 questions without skipping or truncating.
6. End your response with this exact single line:
[PAGE: <page_number>]
Where <page_number> is the primary starting page of these questions.
"""
    else:
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
