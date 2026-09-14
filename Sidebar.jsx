import React from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Library,
  MessageCircle,
  Plus,
  Sparkles
} from "lucide-react";

function Sidebar({
  documents,
  activeDocument,
  view,
  onNewChat,
  onOpenDocument,
  onOpenTool
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BookOpen size={25} />
        </div>
        <strong>DocMind AI</strong>
      </div>

      <button className="new-chat" onClick={onNewChat}>
        <Plus size={19} />
        New Chat
      </button>

      <div className="sidebar-group">
        <span className="sidebar-heading">FEATURES</span>

        <button className={view === "document" ? "side-link active" : "side-link"} onClick={onNewChat}>
          <MessageCircle size={15} />
          Chat
        </button>

        <button className="side-link" onClick={() => onOpenTool("summary")}>
          <FileText size={15} />
          Summaries
        </button>

        <button className="side-link" onClick={() => onOpenTool("exam")}>
          <GraduationCap size={15} />
          Exam Mode
        </button>

        <button className="side-link" onClick={() => onOpenTool("flashcards")}>
          <BookOpen size={15} />
          Flashcards
        </button>

        <button className="side-link" onClick={() => onOpenTool("library")}>
          <Library size={15} />
          Library
        </button>
      </div>

      <div className="sidebar-group recent-docs">
        <span className="sidebar-heading">RECENT DOCUMENTS</span>

        {documents.map((document) => (
          <button
            className={`side-document ${activeDocument?.id === document.id ? "selected" : ""}`}
            key={document.id}
            onClick={() => onOpenDocument(document)}
          >
            <FileText size={14} />
            <span>
              <strong>{document.name}</strong>
              <small>{document.meta}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="upgrade-card">
        <Sparkles size={21} />
        <h3>Upgrade to Pro</h3>
        <p>Get unlimited documents, advanced AI models and more study tools.</p>
        <button>Upgrade</button>
      </div>
    </aside>
  );
}

export default Sidebar;
