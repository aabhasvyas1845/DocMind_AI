import React from "react";
import { useState } from "react";
import { BookOpen, FileText, GraduationCap, X } from "lucide-react";

function StudyTools({ tool, onTool, onClose }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <aside className="right-panel study-panel">
      <div className="right-panel-head">
        <div>
          <span className="small-label">STUDY TOOLS</span>
          <h2>Turn the document into study material.</h2>
        </div>

        <button className="close-panel" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="study-tabs">
        <button className={tool === "summary" ? "active" : ""} onClick={() => onTool("summary")}>
          <FileText size={14} /> Summary
        </button>
        <button className={tool === "exam" ? "active" : ""} onClick={() => onTool("exam")}>
          <GraduationCap size={14} /> Exam Mode
        </button>
        <button className={tool === "flashcards" ? "active" : ""} onClick={() => onTool("flashcards")}>
          <BookOpen size={14} /> Flashcards
        </button>
      </div>

      <div className="study-content">
        {tool === "summary" && (
          <>
            <span className="small-label">01 / SUMMARY</span>
            <h3>Polymorphism, in simple terms.</h3>
            <p>
              Polymorphism lets different objects respond to the same operation
              in their own way. In Java, it is commonly discussed through
              method overloading and method overriding.
            </p>

            <div className="key-points">
              <span>KEY POINTS</span>
              <strong>01 · Compile-time polymorphism</strong>
              <strong>02 · Runtime polymorphism</strong>
              <strong>03 · Method overriding</strong>
            </div>
          </>
        )}

        {tool === "exam" && (
          <>
            <span className="small-label">02 / EXAM MODE</span>
            <h3>Test what you know.</h3>
            <p>
              Generate MCQs, True/False and short or long-answer questions
              from the uploaded document.
            </p>

            <div className="exam-settings">
              <div><span>QUESTIONS</span><strong>10</strong></div>
              <div><span>DIFFICULTY</span><strong>MEDIUM</strong></div>
            </div>

            <button className="generate-button">GENERATE QUESTIONS →</button>
          </>
        )}

        {tool === "flashcards" && (
          <>
            <span className="small-label">03 / FLASHCARDS</span>
            <h3>Quick revision.</h3>
            <p>Click the card to flip between the question and answer.</p>

            <button className="flashcard" onClick={() => setFlipped(!flipped)}>
              <span>{flipped ? "ANSWER" : "QUESTION"}</span>
              <strong>
                {flipped
                  ? "A technique where one interface can represent different underlying forms."
                  : "What is polymorphism?"}
              </strong>
              <small>CLICK TO FLIP</small>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

export default StudyTools;
