import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus } from "lucide-react";
import { API_BASE_URL } from "./api";

function PDFViewer({ document, currentPage, onPageChange }) {
  const [zoom, setZoom] = useState(100);

  const totalPages = document?.total_pages || 128;
  const activePage = currentPage || 1;

  function changePage(amount) {
    const newPage = Math.min(totalPages, Math.max(1, activePage + amount));
    if (onPageChange) {
      onPageChange(newPage);
    }
  }

  // Generate full URL if it's served from the backend
  const pdfSource = document?.file_url 
    ? (document.file_url.startsWith("http") ? document.file_url : `http://127.0.0.1:8000${document.file_url}`)
    : document?.fileUrl;

  return (
    <section className="pdf-viewer">
      <div className="viewer-toolbar">
        <div>
          <span className="small-label">DOCUMENT</span>
          <strong>{document?.name || "Academic document"}</strong>
        </div>

        <div className="viewer-actions">
          <button onClick={() => setZoom((z) => Math.max(70, z - 10))}><Minus size={14} /></button>
          <span>{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(140, z + 10))}><Plus size={14} /></button>
          <button onClick={() => window.open(pdfSource, "_blank")} title="Open PDF in new tab"><Maximize2 size={14} /></button>
        </div>
      </div>

      <div className="pdf-canvas">
        {pdfSource ? (
          <iframe
            key={`${document?.id}-${activePage}`}
            title="Uploaded PDF"
            src={`${pdfSource}#page=${activePage}&zoom=${zoom}`}
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
          />
        ) : (
          <div className="fake-pdf">
            <div className="pdf-meta">
              <span>{document?.name || "ACADEMIC DOCUMENT"}</span>
              <span>PAGE {activePage}</span>
            </div>

            <h2>DOCUMENT PREVIEW</h2>

            <div className="pdf-rule-lines">
              <span />
              <span />
              <span className="short" />
            </div>

            <p>
              Please upload or select an academic PDF document to view and study with DocMind AI.
            </p>

            <div className="fake-page-number">{activePage}</div>
          </div>
        )}
      </div>

      <div className="viewer-footer">
        <button onClick={() => changePage(-1)}><ChevronLeft size={15} /></button>
        <span>Page {activePage} of {totalPages}</span>
        <button onClick={() => changePage(1)}><ChevronRight size={15} /></button>
      </div>
    </section>
  );
}

export default PDFViewer;
