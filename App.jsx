import React, { useRef, useState, useEffect } from "react";
import {
  BookOpen,
  Bot,
  CheckCircle,
  FileCheck,
  FileText,
  GraduationCap,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  UploadCloud,
  X,
  Eye,
  EyeOff
} from "lucide-react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Upload from "./Upload";
import PDFViewer from "./PDFViewer";
import AIChat from "./AIChat";
import StudyTools from "./StudyTools";
import SettingsModal from "./SettingsModal";
import { uploadDocumentApi, fetchDocumentsApi, sendChatMessageApi } from "./api";

function App() {
  const fileInput = useRef(null);
  
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("docmind_theme") || "dark";
  });

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");

  // Document & Workspace states
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [view, setView] = useState("home"); // "home" or "document"
  const [tool, setTool] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [toast, setToast] = useState("");

  // Prompt & Chat states
  const [homeQuestion, setHomeQuestion] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [thinking, setThinking] = useState(false);

  // Upload Progress state
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);

  // Conversations / Recent Chats list (stored in localStorage)
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("docmind_chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply theme attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("docmind_theme", theme);
  }, [theme]);

  // Persist chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("docmind_chats", JSON.stringify(chats));
    } catch (err) {
      console.warn("Failed to persist chats:", err);
    }
  }, [chats]);

  // Load existing backend documents on initial mount
  useEffect(() => {
    async function loadDocs() {
      try {
        const backendDocs = await fetchDocumentsApi();
        if (backendDocs && backendDocs.length > 0) {
          setDocuments(backendDocs);
          // If no active doc and user hasn't chosen one, set the first one as default
          if (!activeDocument) {
            setActiveDocument(backendDocs[0]);
          }
        }
      } catch (err) {
        console.log("Documents init:", err.message);
      }
    }
    loadDocs();
  }, []);

  function toggleTheme() {
    setTheme((curr) => (curr === "dark" ? "light" : "dark"));
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.docMindToast);
    window.docMindToast = window.setTimeout(() => setToast(""), 3200);
  }

  // Handle PDF Upload with detailed progress status modal
  async function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please choose a valid PDF file.");
      return;
    }

    const fileSizeStr = `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB`;
    setUploadInfo({
      filename: file.name,
      size: fileSizeStr,
      step: 1,
      statusText: "Uploading file to DocMind backend..."
    });
    setUploading(true);

    // Simulate progressive status updates for user feedback
    const stepTimer1 = setTimeout(() => {
      setUploadInfo((curr) => curr ? {
        ...curr,
        step: 2,
        statusText: "Extracting pages & text chunks with PyMuPDF..."
      } : null);
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setUploadInfo((curr) => curr ? {
        ...curr,
        step: 3,
        statusText: "Indexing document chunks into SQLite database..."
      } : null);
    }, 2000);

    try {
      const uploadedDoc = await uploadDocumentApi(file);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // Finish progress
      setUploadInfo((curr) => curr ? {
        ...curr,
        step: 4,
        statusText: "Complete! Ready to chat."
      } : null);

      setTimeout(() => {
        setDocuments((current) => [uploadedDoc, ...current]);
        setActiveDocument(uploadedDoc);
        setActivePage(1);
        setUploading(false);
        setUploadInfo(null);
        showToast(`"${file.name}" ready to chat!`);
      }, 500);

    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error("Upload error:", err);

      const localDoc = {
        id: Date.now(),
        name: file.name,
        meta: `${fileSizeStr} · local preview`,
        fileUrl: URL.createObjectURL(file),
        total_pages: 1
      };
      setDocuments((current) => [localDoc, ...current]);
      setActiveDocument(localDoc);
      setActivePage(1);
      setUploading(false);
      setUploadInfo(null);
      showToast(`Document loaded in offline mode.`);
    }
  }

  // Start a fresh new chat session
  function handleNewChat() {
    setActiveChatId(null);
    setChatMessages([
      {
        role: "ai",
        text: activeDocument
          ? `I have indexed "${activeDocument.name}". Ask me any questions, request explanations, or test your understanding. I will cite the exact page numbers from your document!`
          : "Attach a PDF document to start asking questions with verified source page citations."
      }
    ]);
    setView("home");
    setHomeQuestion("");
    setTool(null);
  }

  // Switch to a selected previous conversation
  function handleSelectChat(chat) {
    setActiveChatId(chat.id);
    if (chat.document) {
      setActiveDocument(chat.document);
    } else if (chat.documentId) {
      const matched = documents.find((d) => d.id === chat.documentId);
      if (matched) setActiveDocument(matched);
    }
    setChatMessages(chat.messages || []);
    setView("document");
    setChatOpen(true);
    setTool(null);
  }

  // Delete a specific chat
  function handleDeleteChat(chatId) {
    setChats((current) => current.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      handleNewChat();
    }
    showToast("Conversation deleted.");
  }

  // Clear all chats from settings
  function handleClearAllChats() {
    setChats([]);
    handleNewChat();
    showToast("All conversation history cleared.");
  }

  // Open an uploaded document directly
  function openDocument(doc) {
    setActiveDocument(doc);
    setActivePage(1);
    
    // Check if an existing chat exists for this document
    const existing = chats.find((c) => c.documentId === doc.id || c.document?.id === doc.id);
    if (existing) {
      handleSelectChat(existing);
    } else {
      setActiveChatId(null);
      setChatMessages([
        {
          role: "ai",
          text: `I have indexed "${doc.name}". Ask me any questions, request explanations, or test your understanding. I will cite the exact page numbers from your document!`
        }
      ]);
      setView("document");
      setChatOpen(true);
      setTool(null);
    }
  }

  // Send a chat message (from either Home or AIChat)
  async function handleSendMessage(query) {
    const text = query.trim();
    if (!text || thinking) return;

    if (!activeDocument) {
      showToast("Please attach a PDF document first.");
      fileInput.current?.click();
      return;
    }

    // Switch view to document workspace immediately
    if (view !== "document") {
      setView("document");
      setChatOpen(true);
      setTool(null);
    }

    const userMsg = { role: "user", text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setThinking(true);

    try {
      let aiResponseText = "";
      let aiSourcePage = null;

      if (typeof activeDocument.id === "number") {
        const response = await sendChatMessageApi(activeDocument.id, text);
        aiResponseText = response.text;
        aiSourcePage = response.source;
      } else {
        aiResponseText = "Please attach an indexed PDF document to get precise, cited answers.";
        aiSourcePage = 1;
      }

      const aiMsg = {
        role: "ai",
        text: aiResponseText,
        source: aiSourcePage
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setChatMessages(finalMessages);

      // Save or update in recent chats list (Antigravity-style)
      const currentChatId = activeChatId || `chat_${Date.now()}`;
      setActiveChatId(currentChatId);

      setChats((prevChats) => {
        const existingIdx = prevChats.findIndex((c) => c.id === currentChatId);
        const chatSnippet = text.length > 55 ? text.slice(0, 52) + "..." : text;
        const chatTitle = activeDocument.name.replace(/\.[^/.]+$/, "");

        const chatEntry = {
          id: currentChatId,
          title: chatTitle,
          preview: chatSnippet,
          time: "Just now",
          timestamp: Date.now(),
          documentId: activeDocument.id,
          document: activeDocument,
          messages: finalMessages
        };

        if (existingIdx >= 0) {
          const updated = [...prevChats];
          updated[existingIdx] = chatEntry;
          return updated;
        } else {
          return [chatEntry, ...prevChats];
        }
      });

    } catch (err) {
      setChatMessages((curr) => [
        ...curr,
        {
          role: "ai",
          text: `Error: ${err.message}. Make sure your backend server is running.`
        }
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleHomeSubmit(e) {
    if (e) e.preventDefault();
    const query = homeQuestion.trim();
    if (!query) return;
    setHomeQuestion("");
    handleSendMessage(query);
  }

  function openTool(toolName) {
    if (!activeDocument) {
      showToast("Please attach a PDF first to use " + toolName + ".");
      fileInput.current?.click();
      return;
    }
    setView("document");
    setTool(toolName);
    setChatOpen(false);
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="content">
        <Navbar
          currentTheme={theme}
          onTheme={toggleTheme}
          onSettings={() => setShowSettings(true)}
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
            onOpenDocument={openDocument}
            documents={documents}
            onGoToDocument={() => {
              if (activeDocument) {
                setView("document");
                setChatOpen(true);
              }
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
            messages={chatMessages}
            thinking={thinking}
            onSendMessage={handleSendMessage}
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

      {/* Upload Progress Modal / Overlay */}
      {uploading && uploadInfo && (
        <div className="modal-backdrop">
          <div className="upload-progress-card" style={{ position: "relative" }}>
            <button 
              className="modal-close" 
              style={{ position: "absolute", top: "14px", right: "14px" }}
              onClick={() => {
                setUploading(false);
                setUploadInfo(null);
              }}
              title="Close"
            >
              <X size={16} />
            </button>
            <div className="upload-progress-icon">
              <UploadCloud size={30} className="pulse-icon" />
            </div>

            <h3>Uploading & Indexing Document</h3>
            <p className="upload-filename">
              <strong>{uploadInfo.filename}</strong> ({uploadInfo.size})
            </p>

            {/* Stepper indicator */}
            <div className="upload-stepper">
              <div className={`step-item ${uploadInfo.step >= 1 ? "done" : "active"}`}>
                <div className="step-circle">{uploadInfo.step > 1 ? "✓" : "1"}</div>
                <span>Upload</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${uploadInfo.step >= 2 ? (uploadInfo.step > 2 ? "done" : "active") : ""}`}>
                <div className="step-circle">{uploadInfo.step > 2 ? "✓" : "2"}</div>
                <span>PyMuPDF Extract</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${uploadInfo.step >= 3 ? (uploadInfo.step > 3 ? "done" : "active") : ""}`}>
                <div className="step-circle">{uploadInfo.step > 3 ? "✓" : "3"}</div>
                <span>SQLite Index</span>
              </div>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: uploadInfo.step === 1 ? "35%" : uploadInfo.step === 2 ? "70%" : "100%" }} />
            </div>

            <div className="upload-status-subtext">
              <Loader2 size={13} className="spin-icon" />
              <span>{uploadInfo.statusText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentModel={selectedModel}
        onModelChange={setSelectedModel}
        onClearChats={handleClearAllChats}
      />

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

        {/* Note: The 4 buttons were removed as requested! */}

        <form className="home-prompt" onSubmit={onSubmitQuestion}>
          {activeDocument && (
            <div className="attached-document-badge">
              <FileCheck size={14} color="var(--green)" />
              <strong className="badge-name">{activeDocument.name}</strong>
              <span className="badge-meta">({activeDocument.meta || `${activeDocument.total_pages || 1} pages`})</span>
              <button
                type="button"
                className="badge-remove-btn"
                onClick={onRemoveDocument}
                title="Detach document"
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
                <button type="button" onClick={onGoToDocument} className="open-chat-link">
                  <MessageCircle size={14} /> Open Chat →
                </button>
              )}
              <span className="online-badge"><i /> Ready</span>
            </div>

            <button className="send-circle" type="submit" disabled={uploading || !homeQuestion.trim()}>
              <Send size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <section className="recent-section" style={{ marginTop: "36px" }}>
          <div className="section-title">
            <h2>Your Uploaded Documents ({documents.length})</h2>
          </div>

          <div className="recent-grid">
            {documents.slice(0, 3).map((doc) => (
              <button
                className={`recent-card ${activeDocument?.id === doc.id ? "active-doc-card" : ""}`}
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
              >
                <div className="recent-icon"><FileText size={16} /></div>
                <div className="recent-copy">
                  <strong>{doc.name}</strong>
                  <span>{doc.meta || `${doc.total_pages || 1} pages`}</span>
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
  messages,
  thinking,
  onSendMessage,
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

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Quick study tools buttons inside workspace */}
          <button 
            className={`tool-pill ${tool === "summary" ? "active" : ""}`} 
            onClick={() => onTool(tool === "summary" ? null : "summary")}
          >
            <FileText size={14} /> Summary
          </button>
          <button 
            className={`tool-pill ${tool === "exam" ? "active" : ""}`} 
            onClick={() => onTool(tool === "exam" ? null : "exam")}
          >
            <GraduationCap size={14} /> Exam
          </button>
          <button 
            className={`tool-pill ${tool === "flashcards" ? "active" : ""}`} 
            onClick={() => onTool(tool === "flashcards" ? null : "flashcards")}
          >
            <BookOpen size={14} /> Cards
          </button>

          <button 
            className="change-doc" 
            onClick={onTogglePdf}
            style={{ color: showPdfViewer ? "var(--purple)" : "var(--muted)" }}
            title="Toggle PDF document preview"
          >
            {showPdfViewer ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPdfViewer ? "Hide PDF" : "Split PDF"}
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

        {chatOpen && !tool && (
          <AIChat 
            document={document} 
            messages={messages}
            thinking={thinking}
            onSendMessage={onSendMessage}
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
            onClose={() => {
              onTool(null);
              onChat();
            }}
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
