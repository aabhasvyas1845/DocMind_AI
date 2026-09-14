import React from "react";
import { useState } from "react";
import { ArrowUp, Paperclip, Settings, Sparkles, X } from "lucide-react";

function AIChat({ document, onClose }) {
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Ask me anything about this document. I can explain topics simply and point you back to the relevant page."
    }
  ]);

  function ask(text = question) {
    const value = text.trim();

    if (!value || thinking) return;

    setMessages((current) => [...current, { role: "user", text: value }]);
    setQuestion("");
    setThinking(true);

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: "Polymorphism allows a single interface to represent different forms. In Java, it is commonly explained through method overloading and method overriding. The same operation can therefore behave differently depending on the object or arguments involved.",
          source: 42
        }
      ]);
      setThinking(false);
    }, 800);
  }

  return (
    <aside className="right-panel chat-panel">
      <div className="right-panel-head">
        <div>
          <span className="small-label">DOCMIND AI</span>
          <h2>Ask about your document.</h2>
        </div>

        <button className="close-panel" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="chat-document">
        <span className="file-badge">PDF</span>
        <div>
          <strong>{document?.name || "Academic document"}</strong>
          <small>Answers stay focused on this document</small>
        </div>
      </div>

      <div className="messages">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={index}>
            <span className="message-who">
              {message.role === "ai" ? "DOCMIND" : "YOU"}
            </span>
            <p>{message.text}</p>

            {message.source && (
              <button className="source">
                SOURCE · PAGE {message.source} →
              </button>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="suggestions">
            <span className="small-label">TRY ASKING</span>
            {[
              "What is polymorphism?",
              "Explain this in simple words.",
              "What should I remember for my exam?"
            ].map((item) => (
              <button key={item} onClick={() => ask(item)}>{item}</button>
            ))}
          </div>
        )}

        {thinking && (
          <div className="thinking">
            <Sparkles size={14} />
            DocMind is thinking...
          </div>
        )}
      </div>

      <form
        className="chat-box"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <div className="chat-box-top">
          <Sparkles size={17} />
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything about your document..."
          />
        </div>

        <div className="chat-box-bottom">
          <div>
            <button type="button"><Paperclip size={14} /> Attach</button>
            <button type="button"><Settings size={14} /> Settings</button>
            <span className="online"><i /> Online</span>
          </div>

          <button className="chat-send" type="submit">
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
    </aside>
  );
}

export default AIChat;
