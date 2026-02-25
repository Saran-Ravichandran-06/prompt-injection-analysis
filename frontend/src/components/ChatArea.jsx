import React, { useEffect, useRef, useState } from 'react'
import Message from './Message'

function ChatArea({ chatHistory, documentName, mode, systemInstruction }) {
  const messagesEndRef = useRef(null)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (isNearBottom || chatHistory.length <= 1) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [chatHistory])

  return (
    <div className="chat-area">
      <div className="system-prompt-container glass">
        <div
          className="system-prompt-header"
          onClick={() => setIsSystemPromptOpen(!isSystemPromptOpen)}
        >
          <div className="system-prompt-title">
            <span style={{ color: mode === 'v2' ? 'var(--defend-green)' : 'var(--vulnerable-red)' }}>
              {mode === 'v2' ? '🛡️' : '⚠️'}
            </span>
            System Context & Rules
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', transition: 'transform 0.3s', transform: isSystemPromptOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▼
          </div>
        </div>

        {isSystemPromptOpen && (
          <div className="system-prompt-content">
            {mode === 'v2' ? (
              <div style={{ color: 'var(--defend-green)', marginBottom: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                [REINFORCED DEFENSE ACTIVE]
              </div>
            ) : (
              <div style={{ color: 'var(--vulnerable-red)', marginBottom: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                [SECURITY OVERRIDE DETECTED]
              </div>
            )}
            {systemInstruction}
          </div>
        )}
      </div>

      <div className="messages-container">
        {chatHistory.length === 0 ? (
          <div className="welcome-message">
            {!documentName ? (
              <>
                <h2 style={{ color: 'var(--safe-cyan)', fontSize: '1.5rem', marginBottom: '1rem' }}>RECONNAISSANCE MODE</h2>
                <p>Upload a target document to begin injection analysis.</p>
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  border: '1px dashed var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}>
                  ACCEPTED ASSETS: .TXT, .PDF
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--safe-cyan)', fontWeight: 'bold' }}>ASSET LOADED: {documentName}</p>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>Awaiting user query for injection analysis...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {chatHistory.map((msg, index) => (
              <Message
                key={index}
                role={msg.role}
                content={msg.content}
                mode={msg.mode}
                riskFlags={msg.risk_flags || []}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  )
}

export default ChatArea
