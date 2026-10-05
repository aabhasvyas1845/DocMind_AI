import React from "react";
import { ChevronDown, Moon, Settings, Sun } from "lucide-react";

function Navbar({ onSettings, onTheme, currentTheme = "dark" }) {
  return (
    <header className="topbar">
      <div className="topbar-brand-badge">
        <span>DocMind AI</span>
      </div>

      <div className="topbar-right">
        <button className="top-button" onClick={onSettings} title="Open System Settings">
          <Settings size={15} />
          <span>Settings</span>
        </button>

        <button 
          className="top-button theme-toggle-btn" 
          onClick={onTheme} 
          title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} mode`}
        >
          {currentTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          <span>{currentTheme === "dark" ? "Light" : "Dark"}</span>
        </button>

        <div className="profile">
          <span>T</span>
          <strong>Team 58</strong>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
