import React, { useState, useEffect } from "react";
import { BookOpen, FileText, GraduationCap, X, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { fetchSummaryApi, fetchExamQuestionsApi, fetchFlashcardsApi } from "./api";

function StudyTools({ tool, onTool, onClose, document, isFullWidth }) {
  const [flipped, setFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [examData, setExamData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);
  
  // Quiz state for exam mode
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!document?.id) return;

    if (tool === "summary" && !summaryData) {
      loadSummary();
    } else if (tool === "exam" && !examData) {
      loadExam();
    } else if (tool === "flashcards" && !flashcardsData) {
      loadFlashcards();
    }
  }, [tool, document?.id]);

  async function loadSummary() {
    if (!document?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSummaryApi(document.id);
      setSummaryData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExam() {
    if (!document?.id) return;
    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    setShowResults(false);
    try {
      const data = await fetchExamQuestionsApi(document.id);
      setExamData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFlashcards() {
    if (!document?.id) return;
    setLoading(true);
    setError(null);
    setCurrentCardIndex(0);
    setFlipped(false);
    try {
      const data = await fetchFlashcardsApi(document.id);
      setFlashcardsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const cards = flashcardsData?.cards || [
    {
      question: "Sample Question",
      answer: "Sample Answer from your document."
    }
  ];
  const activeCard = cards[currentCardIndex] || cards[0];

  return (
    <aside 
      className="right-panel study-panel"
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
          <span className="small-label">STUDY TOOLS</span>
          <h2>Turn your document into study material</h2>
        </div>

        {onClose && (
          <button className="close-panel" onClick={onClose}><X size={16} /></button>
        )}
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

      <div className="study-content" style={{ padding: "24px" }}>
        {loading && (
          <div className="thinking" style={{ margin: "20px 0" }}>
            <Sparkles size={16} /> Generating AI study content with Gemini...
          </div>
        )}

        {error && (
          <div style={{ color: "#ff7b7b", fontSize: "11px", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        {/* SUMMARY TOOL */}
        {tool === "summary" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="small-label">01 / SUMMARY</span>
              <button 
                onClick={loadSummary} 
                disabled={loading}
                style={{ background: "transparent", border: "1px solid #332d3f", borderRadius: "6px", fontSize: "11px", padding: "5px 10px", color: "#a85cff", cursor: "pointer" }}
              >
                Regenerate
              </button>
            </div>
            
            <h3 style={{ fontSize: "20px", marginTop: "12px" }}>{summaryData?.title || "Document Summary"}</h3>
            <p style={{ fontSize: "12px", lineHeight: "1.7" }}>
              {summaryData?.summary ||
                "Click below or wait a moment while Gemini summarizes your document."}
            </p>

            <div className="key-points" style={{ marginTop: "20px" }}>
              <span>KEY TAKEAWAYS</span>
              {summaryData?.key_points && summaryData.key_points.length > 0 ? (
                summaryData.key_points.map((point, idx) => (
                  <strong key={idx} style={{ fontSize: "12px", padding: "10px 0" }}>0{idx + 1} · {point}</strong>
                ))
              ) : (
                <>
                  <strong>01 · Core definitions and principles</strong>
                  <strong>02 · Mechanisms & structures</strong>
                  <strong>03 · High-yield exam points</strong>
                </>
              )}
            </div>
          </>
        )}

        {/* EXAM MODE TOOL */}
        {tool === "exam" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="small-label">02 / EXAM MODE</span>
              <button 
                onClick={loadExam} 
                disabled={loading}
                style={{ background: "transparent", border: "1px solid #332d3f", borderRadius: "6px", fontSize: "11px", padding: "5px 10px", color: "#a85cff", cursor: "pointer" }}
              >
                New Questions
              </button>
            </div>
            
            <h3 style={{ fontSize: "20px", marginTop: "12px" }}>Test What You Know</h3>
            <p style={{ fontSize: "12px" }}>
              AI-generated Multiple Choice Questions & answers extracted from your document.
            </p>

            <div className="exam-questions-list" style={{ marginTop: "18px", maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
              {examData?.questions && examData.questions.length > 0 ? (
                examData.questions.map((q, idx) => (
                  <div key={q.id || idx} style={{ marginBottom: "20px", background: "#131019", padding: "16px", borderRadius: "10px", border: "1px solid #272132" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "10px", color: "#e4ddec" }}>
                      Q{idx + 1}. {q.question}
                    </div>

                    {q.options && q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[idx] === opt;
                      const isCorrect = showResults && opt === q.correct_answer;
                      const isWrong = showResults && isSelected && opt !== q.correct_answer;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            if (!showResults) setSelectedAnswers(prev => ({ ...prev, [idx]: opt }));
                          }}
                          style={{
                            padding: "8px 12px",
                            margin: "5px 0",
                            borderRadius: "7px",
                            fontSize: "11px",
                            cursor: showResults ? "default" : "pointer",
                            background: isCorrect ? "#1e4620" : isWrong ? "#4a1c1c" : isSelected ? "#2a1e3d" : "#1a1622",
                            border: isCorrect ? "1px solid #38d39f" : isSelected ? "1px solid #a85cff" : "1px solid #282233",
                            color: isCorrect ? "#a9f5d3" : "#cfc6db"
                          }}
                        >
                          {opt}
                        </div>
                      );
                    })}

                    {showResults && q.explanation && (
                      <div style={{ marginTop: "10px", fontSize: "11px", color: "#a39caf", fontStyle: "italic" }}>
                        💡 {q.explanation} {q.source_page && `(Referenced on Page ${q.source_page})`}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "12px", color: "#8a8195" }}>
                  Generating exam questions based on this document...
                </div>
              )}
            </div>

            {examData?.questions && examData.questions.length > 0 ? (
              <button 
                className="generate-button" 
                onClick={() => setShowResults(!showResults)}
                style={{ marginTop: "16px", padding: "12px", fontSize: "11px", cursor: "pointer" }}
              >
                {showResults ? "HIDE ANSWERS" : "SUBMIT & CHECK ANSWERS →"}
              </button>
            ) : (
              <button className="generate-button" onClick={loadExam} disabled={loading} style={{ cursor: "pointer" }}>
                GENERATE QUESTIONS →
              </button>
            )}
          </>
        )}

        {/* FLASHCARDS TOOL */}
        {tool === "flashcards" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="small-label">03 / FLASHCARDS</span>
              <button 
                onClick={loadFlashcards} 
                disabled={loading}
                style={{ background: "transparent", border: "1px solid #332d3f", borderRadius: "6px", fontSize: "11px", padding: "5px 10px", color: "#a85cff", cursor: "pointer" }}
              >
                Regenerate Deck
              </button>
            </div>

            <h3 style={{ fontSize: "20px", marginTop: "12px" }}>Quick Revision</h3>
            <p style={{ fontSize: "12px" }}>Click the card to flip between question and answer.</p>

            <button 
              className="flashcard" 
              onClick={() => setFlipped(!flipped)}
              style={{ cursor: "pointer" }}
            >
              <span>{flipped ? "ANSWER" : "QUESTION"}</span>
              <strong>
                {flipped ? activeCard.answer : activeCard.question}
              </strong>
              <small>CLICK TO FLIP {activeCard.source_page ? `· REF PG ${activeCard.source_page}` : ""}</small>
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px" }}>
              <button
                onClick={() => {
                  setFlipped(false);
                  setCurrentCardIndex(c => Math.max(0, c - 1));
                }}
                disabled={currentCardIndex === 0}
                style={{ background: "#181421", border: "1px solid #2d2638", color: "#ccc", borderRadius: "6px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span style={{ fontSize: "11px", color: "#8a8195" }}>
                Card {currentCardIndex + 1} of {cards.length}
              </span>

              <button
                onClick={() => {
                  setFlipped(false);
                  setCurrentCardIndex(c => Math.min(cards.length - 1, c + 1));
                }}
                disabled={currentCardIndex === cards.length - 1}
                style={{ background: "#181421", border: "1px solid #2d2638", color: "#ccc", borderRadius: "6px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default StudyTools;
