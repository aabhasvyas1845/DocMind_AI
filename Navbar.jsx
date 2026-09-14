import React from "react";
import { ChevronDown, Settings, Sun, User } from "lucide-react";

function Navbar({ onSettings, onTheme }) {
  return (
    <header className="topbar">
      <button className="model-picker">
        <span>DocMind AI</span>
        <ChevronDown size={14} />
      </button>

      <div className="topbar-right">
        <button className="top-button" onClick={onSettings}>
          <Settings size={15} />
          Settings
        </button>

        <button className="top-button" onClick={onTheme}>
          <Sun size={16} />
          Theme
        </button>

        <button className="profile">
          <span>A</span>
          <strong>Aabhas</strong>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
