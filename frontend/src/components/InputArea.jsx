import React, { useState } from 'react'

function InputArea({
  onSendMessage,
  onFileUpload,
  fileInputRef,
  currentDocument,
  documentName,
}) {
  const [queryValue, setQueryValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendClick()
    }
  }

  const handleSendClick = () => {
    if (!queryValue.trim()) return
    if (!currentDocument) {
      alert('Please upload a target document first.')
      return
    }
    onSendMessage(queryValue)
    setQueryValue('')
  }

  return (
    <div className="input-area-wrapper">
      <div className="input-container">
        <textarea
          className="query-input"
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={documentName ? `ANALYZE ASSET: ${documentName}` : 'Upload a document ...'}
          rows="1"
        />

        <div className="input-actions">
          <button
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Asset (TXT/PDF)"
          >
            <span>+</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".txt,.pdf"
            style={{ display: 'none' }}
          />

          <button
            className="action-btn send-btn"
            onClick={handleSendClick}
            disabled={!currentDocument || !queryValue.trim()}
            title="Execute Analysis"
          >
            <span>➤</span>
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '9px', color: 'var(--text-dim)', opacity: 0.7 }}>
        PRESS ENTER TO EXECUTE ANALYSIS • SHIFT+ENTER FOR NEW LINE
      </div>
    </div>
  )
}

export default InputArea
