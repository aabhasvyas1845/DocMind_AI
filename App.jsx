import React from "react";
import { useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  ChevronDown,
  FileText,
  GraduationCap,
  Library,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Send,
  Settings,
  Sparkles,
  Sun,
  UploadCloud,
  X
} from "lucide-react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Upload from "./components/Upload";
import PDFViewer from "./components/PDFViewer";
import AIChat from "./components/AIChat";
import StudyTools from "./components/StudyTools";

const starterDocuments = [
  { id: 1, name: "DBMS Notes.pdf", meta: "96 pages · 3.2 MB" },
  { id: 2, name: "Operating Systems.pdf", meta: "114 pages · 5.1 MB" },
  { id: 3, name: "CN Lecture 1.pdf", meta: "72 pages · 2.4 MB" },
  { id: 4, name: "Python Notes.pdf", meta: "88 pages · 3.7 MB" },
  { id: 5, name: "Aptitude Handbook.pdf", meta: "124 pages · 6.1 MB" }
];

const quickTools = [
  { title: "Summarize Content", text: "Get concise summaries of long documents.", icon: FileText },
  { title: "Ask Questions", text: "Find answers with page references.", icon: MessageCircle },
  { title: "Exam Mode", text: "Generate MCQs, true/false and more.", icon: GraduationCap },
  { title: "Flashcards", text: "Create revision flashcards automatically.", icon: BookOpen }
];

function App() {
  const fileInput = useRef(null);
  const [documents, setDocuments] = useState(starterDocuments);
  const [activeDocument, setActiveDocument] = useState(null);
  const [view, setView] = useState("home");
  const [tool, setTool] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.docMindToast);
    window.docMindToast = window.setTimeout(() => setToast(""), 2200);
  }

  function openDocument(document) {
    setActiveDocument(document);
    setView("document");
    setChatOpen(true);
    setTool(null);
  }

  function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please choose a PDF file.");
      return;
    }

    const document = {
      id: Date.now(),
      name: file.name,
      meta: `${Math.max(1, Math.ceil(file.size / 1000000))} MB · just uploaded`,
      fileUrl: URL.createObjectURL(file)
    };

    setDocuments((current) => [document, ...current]);
    setActiveDocument(document);
    setView("document");
    setChatOpen(true);
    showToast("Document added to DocMind.");
  }

  function newChat() {
    setActiveDocument(null);
    setView("home");
    setTool(null);
    setChatOpen(false);
  }

  function openTool(toolName) {
    if (!activeDocument) {
      showToast("Upload a document first.");
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
          onSettings={() => showToast("Settings panel coming next.")}
          onTheme={() => showToast("Dark theme is already active.")}
        />

        {view === "home" && (
          <Home
            fileInput={fileInput}
            onUpload={() => fileInput.current?.click()}
            onFile={handleFile}
            onOpenTool={openTool}
            onOpenDocument={openDocument}
            documents={documents}
            quickTools={quickTools}
          />
        )}

        {view === "document" && (
          <DocumentWorkspace
            document={activeDocument}
            tool={tool}
            chatOpen={chatOpen}
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
          onChange={(event) => handleFile(event.target.files?.[0])}
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
  onOpenTool,
  onOpenDocument,
  documents,
  quickTools
}) {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-orb">
          <div className="orb-core" />
        </div>

        <p className="hero-kicker">PERSONAL AI ASSISTANT FOR DOCUMENTS</p>

        <h1>
          Your Documents. <span>Understood.</span>
        </h1>

        <p className="hero-copy">
          Upload your academic PDFs and start asking questions.
          Get summaries, generate exam questions, find useful pages,
          and build revision material.
        </p>

        <div className="hero-actions">
          <button className="hero-action" onClick={onUpload}>
            <UploadCloud size={17} />
            Upload PDF
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

        <div className="home-prompt">
          <div className="prompt-top">
            <Sparkles size={18} />
            <input placeholder="Ask anything about your document..." />
          </div>

          <div className="prompt-bottom">
            <div className="prompt-links">
              <button onClick={onUpload}><Paperclip size={14} /> Attach</button>
              <button><Settings size={14} /> Settings</button>
              <span className="online"><i /> Online</span>
            </div>

            <button className="send-circle" onClick={onUpload}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <h2>Explore What You Can Do</h2>
          <button>See All <span>→</span></button>
        </div>

        <div className="feature-grid">
          {quickTools.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="feature-card"
                key={item.title}
                onClick={() => onOpenTool(item.title.includes("Summarize") ? "summary" : item.title.includes("Exam") ? "exam" : item.title.includes("Flash") ? "flashcards" : "chat")}
              >
                <div className="feature-icon"><Icon size={19} /></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="feature-arrow">→</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="recent-section">
        <div className="section-title">
          <h2>Recent Chats</h2>
          <button>View All <span>→</span></button>
        </div>

        <div className="recent-grid">
          {[
            ["Explain normalization", "DBMS Notes.pdf", "2 hours ago"],
            ["What is a deadlock?", "Operating Systems.pdf", "5 hours ago"],
            ["Summarize chapter 4", "CN Lecture 1.pdf", "1 day ago"]
          ].map(([title, file, time]) => (
            <button
              className="recent-card"
              key={title}
              onClick={() => onOpenDocument(documents.find((d) => d.name === file) || documents[0])}
            >
              <div className="recent-icon"><MessageCircle size={16} /></div>
              <div className="recent-copy">
                <strong>{title}</strong>
                <span>{file} · {time}</span>
              </div>
              <MoreHorizontal size={17} />
            </button>
          ))}
        </div>
      </section>

      <Upload compact onFile={onFile} fileInput={fileInput} />
    </main>
  );
}

function DocumentWorkspace({
  document,
  tool,
  chatOpen,
  onChat,
  onTool,
  onClosePanel,
  onUpload,
  onFile
}) {
  return (
    <main className="document-page">
      <div className="document-topbar">
        <div>
          <span className="small-label">CURRENT DOCUMENT</span>
          <h1>{document?.name || "Document"}</h1>
        </div>

        <button className="change-doc" onClick={onUpload}>
          <UploadCloud size={15} /> Add another PDF
        </button>
      </div>

      <div className="document-layout">
        <PDFViewer document={document} />

        {chatOpen && (
          <AIChat document={document} onClose={onClosePanel} />
        )}

        {tool && (
          <StudyTools
            tool={tool}
            onTool={onTool}
            onClose={onClosePanel}
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
