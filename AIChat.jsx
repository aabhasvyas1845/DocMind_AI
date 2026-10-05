import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Paperclip, Sparkles, X, FileText } from "lucide-react";
import FormattedMessage from "./FormattedMessage";

function AIChat({
  document,
  messages = [],
  onSendMessage,
  thinking = false,
  onClose,
  onSelectSourcePage,
  onUploadNew,
  isFullWidth
}) {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function handleSubmit(e) {
    if (e) e.preventDefault();
    const value = question.trim();
    if (!value || thinking) return;
    setQuestion("");
    onSendMessage(value);
  }

  return (
    <aside className="right-panel chat-panel" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div className="right-panel-head">
        <div>
          <span className="small-label">DOCMIND AI CHAT</span>
          <h2>Ask anything about your document</h2>
        </div>

        {onClose && (
          <button className="close-panel" onClick={onClose} title="Close Chat Panel">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Active Document Context Header */}
      <div className="chat-document">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="file-badge">PDF</span>
          <div>
            <strong
              style={{
                display: "block",
                maxWidth: isFullWidth ? "600px" : "220px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {document?.name || "No document loaded"}
            </strong>
            <small style={{ color: "var(--green)" }}>● Active Document Context</small>
          </div>
        </div>

        {onUploadNew && (
          <button type="button" className="switch-pdf-btn" onClick={onUploadNew}>
            Switch PDF
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="messages" style={{ flex: 1, minHeight: "450px", overflowY: "auto", padding: "20px" }}>
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={index}>
            <span className="message-who">
              {message.role === "ai" ? "DOCMIND AI" : "YOU"}
            </span>
            {message.role === "ai" ? (
              <FormattedMessage text={message.text} />
            ) : (
              <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
            )}

            {message.source && (
              <button
                className="source"
                onClick={() => onSelectSourcePage && onSelectSourcePage(message.source)}
                title={`Open PDF and jump to Page ${message.source}`}
              >
                CITED SOURCE · PAGE {message.source} (Click to inspect) →
              </button>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="suggestions">
            <span className="small-label">SUGGESTED QUESTIONS</span>
            {[
              "Tell me what this document is about.",
              "Summarize the key topics and definitions.",
              "What are the most important points for exams?"
            ].map((item) => (
              <button key={item} onClick={() => onSendMessage(item)}>
                {item}
              </button>
            ))}
          </div>
        )}

        {thinking && (
          <div className="thinking">
            <Sparkles size={14} className="spin-icon" />
            <span>Working...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form className="chat-box" onSubmit={handleSubmit}>
        {document && (
          <div className="attached-chip">
            <FileText size={13} color="var(--purple)" />
            <span
              style={{
                maxWidth: isFullWidth ? "500px" : "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {document.name}
            </span>
          </div>
        )}

        <div className="chat-box-top">
          <Sparkles size={18} />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={document ? `Ask anything about "${document.name}"...` : "Type a question..."}
          />
        </div>

        <div className="chat-box-bottom">
          <div className="chat-box-bottom-left">
            {onUploadNew && (
              <button type="button" onClick={onUploadNew} title="Attach or change PDF">
                <Paperclip size={14} /> Attach PDF
              </button>
            )}
            <span className="online-badge">
              <i /> Ready
            </span>
          </div>

          <button className="chat-send" type="submit" disabled={thinking || !question.trim()}>
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
    </aside>
  );
}

export default AIChat;
