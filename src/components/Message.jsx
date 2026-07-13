import React, { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer.jsx'

export default function Message({ message, onCopy, onRegenerate, onEdit, onDelete, isLast, isGenerating }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)

  const isUser = message.role === 'user'

  const handleCopy = () => {
    onCopy?.(message.content)
  }

  const handleSaveEdit = () => {
    if (!editText.trim()) return
    onEdit?.(message.id, editText.trim())
    setIsEditing(false)
  }

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {isUser? 'U' : 'AI'}
      </div>

      <div className="message-body">
        <div className="message-role">{isUser? 'You' : 'Assistant'}</div>

        <div className="message-content">
          {isEditing? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 80,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 10,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  resize: 'vertical',
                  outline: 'none'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleSaveEdit} style={{ height: 32 }}>Save & Resend</button>
                <button className="btn" onClick={() => { setIsEditing(false); setEditText(message.content) }} style={{ height: 32 }}>Cancel</button>
              </div>
            </div>
          ) : isUser? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {message.status === 'streaming' &&!message.content && (
                <div className="typing-indicator"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="message-actions">
            <button className="action-btn" onClick={handleCopy} title="Copy">📋 Copy</button>
            {isUser && (
              <button className="action-btn" onClick={() => setIsEditing(true)} title="Edit">✏️ Edit</button>
            )}
            {!isUser && (
              <button className="action-btn" onClick={() => onRegenerate?.(message.id)} title="Regenerate" disabled={isGenerating}>↻ Regenerate</button>
            )}
            <button className="action-btn" onClick={() => onDelete?.(message.id)} title="Delete">🗑 Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}
