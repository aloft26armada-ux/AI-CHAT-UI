import React, { useEffect, useRef } from 'react'
import Message from './Message.jsx'

export default function ChatWindow({ conversation, isGenerating, onCopy, onRegenerate, onEdit, onDelete }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages?.length, isGenerating])

  useEffect(() => {
    if (!isGenerating) return
    const id = setInterval(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 120)
    return () => clearInterval(id)
  }, [isGenerating])

  if (!conversation || conversation.messages.length === 0) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div className="empty-title">Where should we start?</div>
          <div className="empty-subtitle">Chat privately with open models running 100% in your browser. No server, no tracking.</div>
          <div className="empty-cards">
            <div className="empty-card"><h4>✍️ Explain a concept</h4><p>“Explain WebGPU vs WebGL like I’m 12”</p></div>
            <div className="empty-card"><h4>💻 Debug code</h4><p>“Why is this React useEffect running twice?”</p></div>
            <div className="empty-card"><h4>🧠 Summarize</h4><p>“Summarize this article into 5 bullets”</p></div>
            <div className="empty-card"><h4>🛠️ Plan a project</h4><p>“Help me plan a WebLLM app architecture”</p></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-inner">
        {conversation.messages.map((m) => (
          <Message
            key={m.id}
            message={m}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            onEdit={onEdit}
            onDelete={onDelete}
            isGenerating={isGenerating}
          />
        ))}
        {isGenerating && conversation.messages[conversation.messages.length - 1]?.role === 'user' && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-body">
              <div className="message-role">Assistant</div>
              <div className="typing-indicator"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  )
}
