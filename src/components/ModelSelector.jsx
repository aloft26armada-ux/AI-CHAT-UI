import React, { useEffect, useState } from 'react'
import { fetchModels } from '../services/models.js'

export default function ModelSelector({ modelId, onChange, isReady }) {
  const [models, setModels] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchModels().then(setModels)
  }, [])

  const current = models.find(m => m.id === modelId) || { name: modelId, size: '', vram: '' }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v =>!v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 36,
          padding: '0 12px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: 13.5,
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: isReady? 'var(--success)' : 'var(--warning)', display: 'inline-block' }} />
        <span>{current.name}</span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{current.size}</span>
        <span style={{ marginLeft: 4, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: '44px',
            left: 0,
            width: 360,
            maxHeight: 420,
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            zIndex: 20,
            padding: 6
          }}>
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false) }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid transparent',
                  background: m.id === modelId? 'var(--bg-tertiary)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 999 }}>{m.size} • {m.vram}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.35 }}>{m.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.family} • {m.context} context</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
