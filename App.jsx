import React, { useRef, useState, useEffect } from "react";
import {
  BookOpen,
  Bot,
  FileText,
  GraduationCap,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  UploadCloud,
  X,
  FileCheck,
  Eye,
  EyeOff
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Upload from "./Upload";
import PDFViewer from "./PDFViewer";
import AIChat from "./AIChat";
import StudyTools from "./StudyTools";
import { uploadDocumentApi, fetchDocumentsApi } from "./api";

function App() {
  const fileInput = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [view, setView] = useState("home"); // "home" or "document"
  const [tool, setTool] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [toast, setToast] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [homeQuestion, setHomeQuestion] = useState("");
  const [initialChatMessage, setInitialChatMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false); // Default to clean full-screen chat!

  useEffect(() => {
    async function loadDocs() {
      try {
        const backendDocs = await fetchDocumentsApi();
        if (backendDocs && backendDocs.length > 0) {
          setDocuments(backendDocs);
        }
      } catch (err) {
        console.log("Documents init:", err.message);
      }
    }
    loadDocs();
  }, []);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.docMindToast);
    window.docMindToast = window.setTimeout(() => setToast(""), 3000);
  }

  function openDocument(document) {
    setActiveDocument(document);
    setActivePage(1);
    setView("document");
    setChatOpen(true);
    setTool(null);
  }

  async function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please choose a valid PDF file.");
      return;
    }

    setUploading(true);
    showToast(`Uploading and extracting "${file.name}"...`);

    try {
      const uploadedDoc = await uploadDocumentApi(file);
      setDocuments((current) => [uploadedDoc, ...current]);
      setActiveDocument(uploadedDoc);
      setActivePage(1);
      showToast(`"${file.name}" ready! (${uploadedDoc.total_pages} pages indexed)`);
    } catch (err) {
      console.error("Upload error:", err);
      const localDoc = {
        id: Date.now(),
        name: file.name,
        meta: `${Math.max(1, Math.ceil(file.size / 1000000))} MB · local preview`,
        fileUrl: URL.createObjectURL(file),
        total_pages: 1
      };
      setDocuments((current) => [localDoc, ...current]);
      setActiveDocument(localDoc);
      setActivePage(1);
      showToast(`Document loaded.`);
    } finally {
      setUploading(false);
    }
  }

  function handleHomeSubmit(e) {
    if (e) e.preventDefault();
    const query = homeQuestion.trim();
    if (!query) return;

    if (!activeDocument) {
      showToast("Please attach a PDF first so DocMind can answer your question.");
      fileInput.current?.click();
      return;
    }

    setInitialChatMessage(query);
    setHomeQuestion("");
    setView("document");
    setChatOpen(true);
    setTool(null);
  }

  function newChat() {
    setActiveDocument(null);
    setView("home");
    setTool(null);
    setChatOpen(false);
    setHomeQuestion("");
    setInitialChatMessage("");
  }

  function openTool(toolName) {
    if (!activeDocument) {
      showToast("Please upload a PDF first to use " + toolName + ".");
      fileInput.current?.click();
      return;
    }
    setView("document");
    setTool(toolName);
    setChatOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        documents={documents}
        activeDocument={activeDocument}
        view={view}
        onNewChat={newChat}
        onOpenDocument={openDocument}
        onOpenTool={openTool}
      />

      <div className="content">
        <Navbar
          onNewChat={newChat}
          onSettings={() => showToast("DocMind AI & Gemini 3.6 Flash connected.")}
          onTheme={() => showToast("Dark theme is active.")}
        />

        {view === "home" && (
          <Home
            fileInput={fileInput}
            onUpload={() => fileInput.current?.click()}
            onFile={handleFile}
            activeDocument={activeDocument}
            onRemoveDocument={() => setActiveDocument(null)}
            uploading={uploading}
            homeQuestion={homeQuestion}
            setHomeQuestion={setHomeQuestion}
            onSubmitQuestion={handleHomeSubmit}
            onOpenTool={openTool}
            onOpenDocument={openDocument}
            documents={documents}
            onGoToDocument={() => {
              if (activeDocument) setView("document");
            }}
          />
        )}

        {view === "document" && (
          <DocumentWorkspace
            document={activeDocument}
            tool={tool}
            chatOpen={chatOpen}
            activePage={activePage}
            showPdfViewer={showPdfViewer}
            onTogglePdf={() => setShowPdfViewer(!showPdfViewer)}
            initialQuestion={initialChatMessage}
            onClearInitialQuestion={() => setInitialChatMessage("")}
            onPageChange={setActivePage}
            onChat={() => {
              setChatOpen(true);
              setTool(null);
            }}
            onTool={setTool}
            onClosePanel={() => {
              setChatOpen(false);
              setTool(null);
            }}
            onUpload={() => fileInput.current?.click()}
            onFile={handleFile}
          />
        )}

        <input
          ref={fileInput}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Home({
  fileInput,
  onUpload,
  onFile,
  activeDocument,
  onRemoveDocument,
  uploading,
  homeQuestion,
  setHomeQuestion,
  onSubmitQuestion,
  onOpenTool,
  onOpenDocument,
  documents,
  onGoToDocument
}) {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-orb">
          <div className="orb-core" />
        </div>

        <p className="hero-kicker">PERSONAL AI ASSISTANT FOR ACADEMIC DOCUMENTS</p>

        <h1>
          Your Documents. <span>Understood.</span>
        </h1>

        <p className="hero-copy">
          Upload any academic PDF, ask questions just like ChatGPT, and get clear answers with exact page citations,
          exam questions, and flashcards.
        </p>

        <div className="hero-actions">
          <button className="hero-action" onClick={onUpload} disabled={uploading}>
            <UploadCloud size={17} />
            {uploading ? "Extracting..." : "Upload PDF"}
          </button>
          <button className="hero-action" onClick={() => onOpenTool("summary")}>
            <FileText size={17} />
            Summarize
          </button>
          <button className="hero-action" onClick={() => onOpenTool("exam")}>
            <GraduationCap size={17} />
            Generate Questions
          </button>
          <button className="hero-action" onClick={() => onOpenTool("flashcards")}>
            <BookOpen size={17} />
            Create Flashcards
          </button>
        </div>

        <form className="home-prompt" onSubmit={onSubmitQuestion}>
          {activeDocument && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 20px 0",
              background: "#1e1828",
              border: "1px solid #7937dc",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#e2d8ee"
            }}>
              <FileCheck size={14} color="#38d39f" />
              <strong>{activeDocument.name}</strong>
              <span style={{ color: "#8a8195", fontSize: "10px" }}>({activeDocument.meta})</span>
              <button
                type="button"
                onClick={onRemoveDocument}
                style={{ background: "transparent", border: "none", color: "#b9b0c2", display: "flex", padding: 0 }}
                title="Remove attached document"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="prompt-top">
            <Sparkles size={18} />
            <input
              value={homeQuestion}
              onChange={(e) => setHomeQuestion(e.target.value)}
              placeholder={activeDocument ? `Ask anything about "${activeDocument.name}"...` : "Attach a PDF or ask anything about your study notes..."}
            />
          </div>

          <div className="prompt-bottom">
            <div className="prompt-links">
              <button type="button" onClick={onUpload} disabled={uploading}>
                <Paperclip size={14} /> {activeDocument ? "Change PDF" : "Attach PDF"}
              </button>
              {activeDocument && (
                <button type="button" onClick={onGoToDocument} style={{ color: "#a85cff" }}>
                  <MessageCircle size={14} /> Open Chat →
                </button>
              )}
              <span className="online"><i /> Gemini 3.6 Online</span>
            </div>

            <button className="send-circle" type="submit" disabled={uploading}>
              <Send size={16} />
            </button>
          </div>
        </form>
      </section>

      {documents.length > 0 && (
        <section className="recent-section" style={{ marginTop: "36px" }}>
          <div className="section-title">
            <h2>Your Uploaded Documents ({documents.length})</h2>
          </div>

          <div className="recent-grid">
            {documents.slice(0, 3).map((doc) => (
              <button
                className="recent-card"
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
              >
                <div className="recent-icon"><FileText size={16} /></div>
                <div className="recent-copy">
                  <strong>{doc.name}</strong>
                  <span>{doc.meta}</span>
                </div>
                <MoreHorizontal size={17} />
              </button>
            ))}
          </div>
        </section>
      )}

      <Upload compact onFile={onFile} fileInput={fileInput} />
    </main>
  );
}

function DocumentWorkspace({
  document,
  tool,
  chatOpen,
  activePage,
  showPdfViewer,
  onTogglePdf,
  initialQuestion,
  onClearInitialQuestion,
  onPageChange,
  onChat,
  onTool,
  onClosePanel,
  onUpload,
  onFile
}) {
  return (
    <main className="document-page" style={{ maxWidth: showPdfViewer ? "1500px" : "1000px" }}>
      <div className="document-topbar">
        <div>
          <span className="small-label">DOCMIND ASSISTANT</span>
          <h1>{document?.name || "Document Chat"}</h1>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className="change-doc" 
            onClick={onTogglePdf}
            style={{ color: showPdfViewer ? "#c48aff" : "#999" }}
            title="Toggle PDF document preview"
          >
            {showPdfViewer ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPdfViewer ? "Hide PDF Split View" : "View PDF Split View"}
          </button>

          <button className="change-doc" onClick={onUpload}>
            <UploadCloud size={15} /> Switch PDF
          </button>
        </div>
      </div>

      <div 
        className="document-layout" 
        style={{ 
          gridTemplateColumns: showPdfViewer ? "minmax(0, 1fr) 460px" : "1fr",
          background: "transparent",
          border: "none"
        }}
      >
        {showPdfViewer && (
          <PDFViewer 
            document={document} 
            currentPage={activePage} 
            onPageChange={onPageChange} 
          />
        )}

        {chatOpen && (
          <AIChat 
            document={document} 
            initialQuestion={initialQuestion}
            onClearInitialQuestion={onClearInitialQuestion}
            onClose={onClosePanel} 
            onSelectSourcePage={(pg) => {
              onPageChange(pg);
              if (!showPdfViewer) onTogglePdf();
            }} 
            onUploadNew={onUpload}
            isFullWidth={!showPdfViewer}
          />
        )}

        {tool && (
          <StudyTools
            tool={tool}
            onTool={onTool}
            onClose={onClosePanel}
            document={document}
            isFullWidth={!showPdfViewer}
          />
        )}
      </div>

      {!chatOpen && !tool && (
        <div className="empty-panel">
          <Bot size={25} />
          <h2>What do you want to do with this document?</h2>
          <p>Ask a question or choose a study tool below.</p>
          <div className="mini-tools">
            <button onClick={onChat}><MessageCircle size={15} /> Ask Questions</button>
            <button onClick={() => onTool("summary")}><FileText size={15} /> Summary</button>
            <button onClick={() => onTool("exam")}><GraduationCap size={15} /> Exam Mode</button>
            <button onClick={() => onTool("flashcards")}><BookOpen size={15} /> Flashcards</button>
          </div>
        </div>
      )}

      <Upload compact onFile={onFile} />
    </main>
  );
}

export default App;
