import React from 'react'

function TopBar({ mode, confidence, onModeToggle, onToggleSidebar, sidebarOpen }) {
  const handleToggle = () => {
    const newMode = mode === 'v1' ? 'v2' : 'v1'
    onModeToggle(newMode)
  }

  return (
    <div className="top-bar glass">
      <div className="top-bar-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          type="button"
          title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
        <h1>Injection Analysis Lab</h1>
      </div>

      <div className="top-bar-right">
        <div className="confidence-meter">
          <div className="meter-header">
            <span>Threat Level</span>
            <span>{confidence}%</span>
          </div>
          <div className="meter-bar-bg">
            <div
              className="meter-fill"
              style={{
                width: `${confidence}%`,
                backgroundColor: confidence > 50 ? 'var(--vulnerable-red)' : 'var(--safe-cyan)',
                boxShadow: confidence > 50 ? '0 0 10px rgba(239, 68, 68, 0.4)' : '0 0 10px rgba(6, 182, 212, 0.4)'
              }}
            ></div>
          </div>
        </div>

        <div className="mode-toggle-wrapper">
          <div
            className={`security-toggle ${mode === 'v1' ? 'vulnerable' : 'defend'}`}
            onClick={handleToggle}
            title={mode === 'v1' ? "Switch to DEFEND mode" : "Switch to VULNERABLE mode"}
          >
            <div className="toggle-knob">
              {mode === 'v2' ? '🛡️' : '⚠️'}
            </div>
            <div className="toggle-label-content">
              {mode === 'v1' ? 'WEAK' : 'DEFEND'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar
