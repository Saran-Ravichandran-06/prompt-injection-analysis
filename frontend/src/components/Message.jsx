import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function ExploitModal({ isOpen, onClose, flags, mode }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ color: 'var(--vulnerable-red)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ TECHNICAL ANALYSIS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Detected Vectors</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {flags.map((f, i) => (
                <span key={i} className="risk-flag injection">{f}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Analysis</div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              The system detected patterns consistent with <strong>Prompt Injection</strong>.
              {mode === 'v1' ?
                " In VULNERABLE mode, the system prompt was overridden by the user's input, leading to unauthorized behavior." :
                " In DEFEND mode, the reinforced system prompt successfully neutralized the attack, but the attempt was logged."
              }
            </p>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--vulnerable-red)', fontWeight: 'bold' }}>EXPLOIT TYPE: Indirect Injection</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>User attempted to coerce the model into ignoring its primary instructions using role-play or system instruction overrides.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Message({ role, content, mode, riskFlags }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isFlagged = riskFlags && riskFlags.length > 0

  const components = {
    p: ({ children }) => {
      const shouldFlag = mode === 'v1' && isFlagged

      return (
        <p className={shouldFlag ? "flagged-content glitch-text" : ""}>
          {children}
        </p>
      )
    }
  }

  return (
    <div className={`message ${role}`}>
      <div className="message-bubble">
        <div className="message-content">
          {role === 'assistant' ? (
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>

        {role === 'assistant' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={`mode-badge ${mode}`}>
              {mode === 'v1' ? 'VULNERABLE' : 'DEFEND'}
            </div>

            {isFlagged && (
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--vulnerable-red)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginRight: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}></span> EXPLAIN WHY
              </button>
            )}
          </div>
        )}
      </div>

      <ExploitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flags={riskFlags}
        mode={mode}
      />
    </div>
  )
}

export default Message
