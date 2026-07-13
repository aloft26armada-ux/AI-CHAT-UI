import React, { useState } from 'react'
import { formatDate, downloadAsJson, isValidJson } from '../utils/helpers.js'

export default function Sidebar({ open, conversations, activeId, onSelect, onNew, onDelete, onRename, onClearAll, onClose, showToast }) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return c.title.toLowerCase().includes(q) || c.messages.some(m => m.content.toLowerCase().includes(q))
  })

  const handleStartEdit = (c) => {
    setEditingId(c.id)
    setEditTitle(c.title)
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) onRename(editingId, editTitle.trim())
    setEditingId(null)
  }

  const handleExport = () => {
    downloadAsJson(conversations, `webllm-chats-${Date.now()}.json`)
    showToast?.('Exported chats')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = reader.result
        if (!isValidJson(text)) throw new Error('Invalid JSON')
        const data = JSON.parse(text)
        if (!Array.isArray(data)) throw new Error('Expected array')
        localStorage.setItem('webllm_conversations', JSON.stringify(data))
        window.location.reload()
      } catch (err) {
        showToast?.('Import failed: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className={`sidebar ${open? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>W</div>
          WebLLM
        </div>
        <button className="icon-btn" onClick={onClose} title="Close" style={{ display: window.innerWidth <= 768? 'inline-flex' : 'none' }}>✕</button>
      </div>

      <div style={{ padding: '12px' }}>
        <button className="new-chat-btn" onClick={onNew}>+ New chat</button>
      </div>

      <div className="sidebar-search">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input className="search-input" placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="conversation-list">
        {filtered.length === 0 && (
          <div style={{ padding: '20px 10px', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            No conversations
          </div>
        )}
        {filtered.map(c => (
          <div key={c.id} className={`conv-item ${c.id === activeId? 'active' : ''}`} onClick={() => onSelect(c.id)}>
            {editingId === c.id? (
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', color: 'var(--text-primary)', fontSize: 13 }}
              />
            ) : (
              <>
                <div className="conv-title">{c.title || 'Untitled'}</div>
                <div className="conv-actions" onClick={e => e.stopPropagation()}>
                  <button className="conv-action-btn" onClick={() => handleStartEdit(c)} title="Rename">✎</button>
                  <button className="conv-action-btn" onClick={() => onDelete(c.id)} title="Delete">✕</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <label className="footer-btn" style={{ cursor: 'pointer' }}>
          ⬆ Import JSON
          <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        <button className="footer-btn" onClick={handleExport}>⬇ Export chats</button>
        <button className="footer-btn" onClick={() => { if (confirm('Clear all chats? This cannot be undone.')) onClearAll() }} style={{ color: '#f87171' }}>🗑 Clear history</button>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 4 }}>
          Runs 100% locally • WebGPU required
        </div>
      </div>
    </div>
  )
}
