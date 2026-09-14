import React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus } from "lucide-react";

function PDFViewer({ document }) {
  const [page, setPage] = useState(42);
  const [zoom, setZoom] = useState(100);

  const totalPages = 128;

  function changePage(amount) {
    setPage((current) => Math.min(totalPages, Math.max(1, current + amount)));
  }

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
          <button><Maximize2 size={14} /></button>
        </div>
      </div>

      <div className="pdf-canvas">
        {document?.fileUrl ? (
          <iframe
            title="Uploaded PDF"
            src={`${document.fileUrl}#page=${page}`}
          />
        ) : (
          <div className="fake-pdf">
            <div className="pdf-meta">
              <span>JAVA PROGRAMMING</span>
              <span>PAGE {page}</span>
            </div>

            <h2>POLYMORPHISM</h2>

            <div className="pdf-rule-lines">
              <span />
              <span />
              <span className="short" />
            </div>

            <p>
              Polymorphism is the ability of an object or method to take
              different forms. It allows a common interface to work with
              different implementations.
            </p>

            <h4>5.1 RUNTIME POLYMORPHISM</h4>

            <div className="pdf-rule-lines">
              <span />
              <span />
              <span />
              <span className="medium" />
            </div>

            <div className="fake-page-number">{page}</div>
          </div>
        )}
      </div>

      <div className="viewer-footer">
        <button onClick={() => changePage(-1)}><ChevronLeft size={15} /></button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => changePage(1)}><ChevronRight size={15} /></button>
      </div>
    </section>
  );
}

export default PDFViewer;
