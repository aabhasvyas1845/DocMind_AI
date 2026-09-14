import React from "react";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

function Upload({ onFile, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function chooseFile(file) {
    if (file) onFile(file);
  }

  if (compact) {
    return (
      <div
        className="compact-upload"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          chooseFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />

        <button className={dragging ? "dragging" : ""} onClick={() => inputRef.current?.click()}>
          <UploadCloud size={15} />
          {dragging ? "Drop PDF here" : "Drop another PDF or click to upload"}
        </button>
      </div>
    );
  }

  return null;
}

export default Upload;
