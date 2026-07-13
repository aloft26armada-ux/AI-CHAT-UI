import React, { useRef, useState, useEffect } from 'react'

export default function ChatInput({ onSend, onStop, isGenerating, disabled }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [value])

  const handleSend = () => {
    const text = value.trim()
    if (!text) return
    if (isGenerating) return
    onSend(text)
    setValue('')
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = '52px'
    })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' &&!e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && isGenerating) {
      e.preventDefault()
      onStop?.()
    }
  }

  return (
    <div className="input-area">
      <div className="input-container">
        <textarea
          ref={taRef}
          className="input-textarea"
          placeholder={disabled? 'Model is loading...' : 'Message WebLLM... (Shift+Enter for new line)'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled &&!isGenerating}
          rows={1}
        />
        <div className="input-actions">
          {isGenerating? (
            <button className="stop-btn" onClick={onStop} title="Stop generation (Esc)">■</button>
          ) : (
            <button className="send-btn" onClick={handleSend} disabled={!value.trim() || disabled} title="Send (Enter)">↑</button>
          )}
        </div>
      </div>
      <div className="input-footer">WebLLM runs locally. No data leaves your device.</div>
    </div>
  )
}
