export const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function uploadDocumentApi(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Failed to upload document");
  }
  return await response.json();
}

export async function fetchDocumentsApi() {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return await response.json();
}

export async function sendChatMessageApi(documentId, question) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, question }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(err.detail || "Failed to get AI response");
  }
  return await response.json();
}

export async function fetchSummaryApi(documentId) {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId }),
  });
  if (!response.ok) throw new Error("Failed to generate summary");
  return await response.json();
}

export async function fetchExamQuestionsApi(documentId, count = 5, difficulty = "MEDIUM") {
  const response = await fetch(`${API_BASE_URL}/exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, count, difficulty }),
  });
  if (!response.ok) throw new Error("Failed to generate exam questions");
  return await response.json();
}

export async function fetchFlashcardsApi(documentId, count = 8) {
  const response = await fetch(`${API_BASE_URL}/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, count }),
  });
  if (!response.ok) throw new Error("Failed to generate flashcards");
  return await response.json();
}
