# Person 1: Frontend User Interface (React.js + Vite)

## 📌 Role & Slide References:
- **Slide 10**: Frontend User Interface & Document Interaction
- **Slide 11**: Frontend Tech Stack (React.js + Vite + Modern CSS)
- **Slide 13**: Student Dashboard, Citation Inspection & Study Tools UI

---

## 🚀 Key Modules & Implemented Features:
1. **Antigravity-Style Conversation History**:
   - Replaced document lists with interactive recent chats showing titles, preview snippets, and relative timestamps (`Just now`, `15m`).
   - Clicking any conversation restores its message thread and document context.
2. **Dynamic Dark / Light Theme System**:
   - Instant Sun/Moon toggle in the top Navbar.
   - Comprehensive light-mode and dark-mode CSS variables with persistence in `localStorage`.
3. **Dedicated Settings Modal (`SettingsModal.jsx`)**:
   - Model selector (Gemini 3.5 Flash-Lite vs Gemini 3.5 Flash).
   - Real-time connection checks for FastAPI backend (`http://127.0.0.1:8000`) and SQLite database.
   - Conversation history cache management.
4. **Enhanced Upload Progress Tracker**:
   - Live 3-step progress modal (`Upload` → `PyMuPDF Extract` → `SQLite Index`).
   - File size badge, animated progress bar, and safe dismiss button.
   - Automatically attaches the uploaded PDF directly to the chat input bar.
5. **Streamlined Academic Chat (`AIChat.jsx`)**:
   - Minimalist, clean `Working...` status without intrusive logs.
   - Clickable `[PAGE: X]` source citations linking answers directly to source pages.

---

## 📁 Files Assigned to Person 1:
- `App.jsx`
- `AIChat.jsx`
- `Sidebar.jsx`
- `Navbar.jsx`
- `SettingsModal.jsx` *(New)*
- `StudyTools.jsx`
- `PDFViewer.jsx`
- `Upload.jsx`
- `api.js`
- `App.css`
- `index.html`
- `main.jsx`
- `package.json`
- `package-lock.json`
- `.gitignore`

---

## 💬 Recommended GitHub Commit:

### In GitHub Desktop:
* **Summary (required)**:
  ```text
  feat(frontend): refine UI with Antigravity-style chat history, themes, and settings
  ```

* **Description**:
  ```text
  - Replace recent docs with Antigravity-style conversations list and snippets
  - Implement dynamic Dark & Light theme toggle in Navbar
  - Add Settings modal for model selection and cache management
  - Add Upload Progress modal with live 3-stage status tracker
  - Streamline thinking indicator to minimal "Working..." state
  ```
