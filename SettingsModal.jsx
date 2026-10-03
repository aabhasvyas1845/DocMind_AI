import React, { useState } from "react";
import { X, CheckCircle, Database, Cpu, Trash2, Key, Sliders } from "lucide-react";

function SettingsModal({ isOpen, onClose, onClearChats, currentModel, onModelChange }) {
  const [model, setModel] = useState(currentModel || "gemini-3.5-flash-lite");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  function handleSave() {
    if (onModelChange) onModelChange(model);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={18} color="var(--purple)" />
            <h3>DocMind Settings</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* AI Model Selection */}
          <div className="settings-section">
            <label className="settings-label">
              <Cpu size={14} />
              <span>AI Engine / LLM</span>
            </label>
            <select 
              className="settings-select"
              value={model} 
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Fast & Recommended)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard)</option>
            </select>
            <small className="settings-hint">
              Optimized for sub-second retrieval across large academic textbooks.
            </small>
          </div>

          {/* System & Connection Status */}
          <div className="settings-section">
            <label className="settings-label">
              <Database size={14} />
              <span>Backend & Database</span>
            </label>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-name">Backend API:</span>
                <span className="status-val success">
                  <CheckCircle size={12} /> http://127.0.0.1:8000
                </span>
              </div>
              <div className="status-item">
                <span className="status-name">Database:</span>
                <span className="status-val">SQLite (docmind.db)</span>
              </div>
              <div className="status-item">
                <span className="status-name">API Key:</span>
                <span className="status-val success">
                  <CheckCircle size={12} /> Active in backend/.env
                </span>
              </div>
            </div>
          </div>

          {/* Manage Storage & History */}
          <div className="settings-section">
            <label className="settings-label">
              <Trash2 size={14} />
              <span>Conversation History</span>
            </label>
            <button 
              type="button" 
              className="btn-danger-outline" 
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your recent conversations?")) {
                  onClearChats();
                  onClose();
                }
              }}
            >
              Clear All Recent Chats
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <span className="app-version">DocMind AI v2.0 · Academic RAG</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
