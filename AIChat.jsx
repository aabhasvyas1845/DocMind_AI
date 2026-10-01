import React, { useState, useEffect } from "react";
import { ArrowUp, Paperclip, Settings, Sparkles, X, FileText, CheckCircle2 } from "lucide-react";
import { sendChatMessageApi } from "./api";

function AIChat({ document, onClose, onSelectSourcePage, initialQuestion, onClearInitialQuestion, onUploadNew, isFullWidth }) {
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: document 
        ? `I have indexed "${document.name}". Ask me any questions, request explanations, or test your understanding. I will answer directly based on your document with exact page citations!`
        : "Upload or attach a PDF to start asking questions."
    }
  ]);

  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      ask(initialQuestion.trim());
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion]);

  async function ask(text = question) {
    const value = text.trim();
    if (!value || thinking) return;

    setMessages((current) => [...current, { role: "user", text: value }]);
    setQuestion("");
    setThinking(true);

    try {
      if (document?.id && typeof document.id === "number") {
        const response = await sendChatMessageApi(document.id, value);
        setMessages((current) => [
          ...current,
          {
            role: "ai",
            text: response.text,
            source: response.source
          }
        ]);
      } else {
        setTimeout(() => {
          setMessages((current) => [
            ...current,
            {
              role: "ai",
              text: "Please attach a real PDF document first to get precise, cited answers.",
              source: 1
            }
          ]);
          setThinking(false);
        }, 500);
      }
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: `Error: ${err.message}. Make sure your backend is running on port 8000 and your GEMINI_API_KEY is configured.`
        }
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <aside 
      className="right-panel chat-panel" 
      style={{
        border: "1px solid var(--border)",
        borderRadius: "14px",
        minHeight: "650px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0d0c12"
      }}
    >
      <div className="right-panel-head">
        <div>
          <span className="small-label">DOCMIND AI CHAT</span>
          <h2>Ask anything about your document</h2>
        </div>

        {onClose && (
          <button className="close-panel" onClick={onClose}><X size={16} /></button>
        )}
      </div>

      {/* ACTIVE DOCUMENT HEADER IN CHAT */}
      <div className="chat-document" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="file-badge">PDF</span>
          <div>
            <strong style={{ display: "block", maxWidth: isFullWidth ? "600px" : "190px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {document?.name || "No document loaded"}
            </strong>
            <small style={{ color: "#38d39f" }}>● Active Document Context</small>
          </div>
        </div>

        {onUploadNew && (
          <button 
            type="button" 
            onClick={onUploadNew}
            style={{ background: "#211b2c", border: "1px solid #362947", borderRadius: "6px", color: "#c48aff", padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}
          >
            Switch PDF
          </button>
        )}
      </div>

      <div className="messages" style={{ flex: 1, minHeight: "450px", overflowY: "auto", padding: "20px" }}>
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={index} style={{ marginBottom: "22px" }}>
            <span className="message-who" style={{ fontSize: "10px" }}>
              {message.role === "ai" ? "DOCMIND AI" : "YOU"}
            </span>
            <p style={{ whiteSpace: "pre-wrap", fontSize: "12px", lineHeight: "1.7" }}>{message.text}</p>

            {message.source && (
              <button 
                className="source" 
                onClick={() => onSelectSourcePage && onSelectSourcePage(message.source)}
                title={`Open PDF and jump to Page ${message.source}`}
                style={{ fontSize: "10px", padding: "6px 0", cursor: "pointer" }}
              >
                CITED SOURCE · PAGE {message.source} (Click to inspect) →
              </button>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="suggestions" style={{ marginTop: "24px" }}>
            <span className="small-label">SUGGESTED QUESTIONS</span>
            {[
              "Tell me what this document is about.",
              "Summarize the key topics and definitions.",
              "What are the most important points for exams?"
            ].map((item) => (
              <button key={item} onClick={() => ask(item)} style={{ cursor: "pointer" }}>{item}</button>
            ))}
          </div>
        )}

        {thinking && (
          <div className="thinking" style={{ fontSize: "12px", padding: "10px 0" }}>
            <Sparkles size={16} />
            DocMind AI is analyzing document pages with Gemini...
          </div>
        )}
      </div>

      {/* CHAT INPUT FORM */}
      <form
        className="chat-box"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
        style={{ margin: "14px", border: "1px solid #7937dc" }}
      >
        {document && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            margin: "10px 14px 0",
            background: "#1e1828",
            border: "1px solid #573381",
            padding: "4px 10px",
            borderRadius: "14px",
            fontSize: "11px",
            color: "#dcd4e7"
          }}>
            <FileText size={13} color="#a85cff" />
            <span style={{ maxWidth: isFullWidth ? "500px" : "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {document.name}
            </span>
          </div>
        )}

        <div className="chat-box-top" style={{ padding: "12px 14px" }}>
          <Sparkles size={19} />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={document ? `Ask anything about "${document.name}"...` : "Type a question..."}
            style={{ fontSize: "13px" }}
          />
        </div>

        <div className="chat-box-bottom" style={{ padding: "6px 14px 10px" }}>
          <div>
            {onUploadNew && (
              <button type="button" onClick={onUploadNew} title="Attach or change PDF">
                <Paperclip size={14} /> Attach PDF
              </button>
            )}
            <span className="online"><i /> Gemini 3.6 Online</span>
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
