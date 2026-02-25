import React from 'react'

function Sidebar({
  isOpen,
  allChats,
  currentChatId,
  onLoadChat,
  onCreateNewChat,
  onDeleteChat,
}) {
  const handleChatClick = (chatId, e) => {
    if (e.target.closest('.chat-delete-btn')) return
    onLoadChat(chatId)
  }

  const sortedChats = Object.values(allChats)
    .filter(chat => chat && chat.timestamp)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''} glass`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onCreateNewChat}>
          <span>+</span> NEW ANALYSIS
        </button>
      </div>
      <div className="sidebar-chats-label">Analysis History</div>
      <div className="chat-history">
        {sortedChats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={(e) => handleChatClick(chat.id, e)}
          >
            <div className="chat-info">
              <span className="chat-title">{chat.title || 'Untitled Session'}</span>
            </div>
            <button
              className="chat-delete-btn"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteChat(chat.id)
              }}
              title="Delete Session"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px' }}>
          PROMPT INJECTION LAB v2.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar
