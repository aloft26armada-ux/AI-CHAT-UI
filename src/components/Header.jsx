import React from 'react'
import ModelSelector from './ModelSelector.jsx'

export default function Header({ sidebarOpen, onToggleSidebar, onOpenSettings, modelId, isReady, onModelChange }) {
  return (
    <div style={{
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      gap: 12,
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="icon-btn" onClick={onToggleSidebar} title={sidebarOpen? 'Close sidebar' : 'Open sidebar'}>
          {sidebarOpen? '✕' : '☰'}
        </button>
        <ModelSelector modelId={modelId} onChange={onModelChange} isReady={isReady} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: window.innerWidth < 600? 'none' : 'block' }}>
          {isReady? '● Ready • Local' : '○ Loading...'}
        </div>
        <button className="icon-btn" onClick={onOpenSettings} title="Settings (Ctrl+,)">⚙</button>
      </div>
    </div>
  )
}
