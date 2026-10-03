import React from "react";
import {
  BookOpen,
  MessageSquare,
  Plus,
  Settings,
  Trash2
} from "lucide-react";

function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings
}) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BookOpen size={22} />
        </div>
        <strong>DocMind AI</strong>
      </div>

      {/* New Conversation Button */}
      <button className="new-chat" onClick={onNewChat}>
        <Plus size={18} />
        <span>New Chat</span>
      </button>

      {/* Conversations / Recent Chats (Antigravity-style list) */}
      <div className="sidebar-group recent-chats-group">
        <div className="sidebar-group-header">
          <span className="sidebar-heading">CONVERSATIONS</span>
          {chats.length > 0 && <span className="chat-count">{chats.length}</span>}
        </div>

        <div className="recent-chats-list">
          {chats.length === 0 ? (
            <div className="empty-chats-hint">
              <MessageSquare size={16} />
              <p>No conversations yet.<br />Ask a question to start chatting!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item-wrapper ${activeChatId === chat.id ? "active" : ""}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-title" title={chat.title}>
                      {chat.title}
                    </span>
                    <span className="chat-time">{chat.time || "Recent"}</span>
                  </div>
                  {chat.preview && (
                    <p className="chat-preview" title={chat.preview}>
                      {chat.preview}
                    </p>
                  )}
                </div>

                {onDeleteChat && (
                  <button
                    className="chat-delete-btn"
                    title="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Footer with Settings */}
      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={onOpenSettings}>
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
