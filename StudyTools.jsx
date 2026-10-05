import React, { useState, useEffect } from "react";
import { FileText, GraduationCap, X, Sparkles, CheckCircle2 } from "lucide-react";
import { fetchSummaryApi, fetchExamQuestionsApi } from "./api";

function StudyTools({ tool, onTool, onClose, document, isFullWidth }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [examData, setExamData] = useState(null);
  
  // Quiz state for exam mode
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!document?.id) return;

    if (tool === "summary" && !summaryData) {
      loadSummary();
    } else if (tool === "exam" && !examData) {
      loadExam();
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
      </div>
    </aside>
  );
}

export default StudyTools;
