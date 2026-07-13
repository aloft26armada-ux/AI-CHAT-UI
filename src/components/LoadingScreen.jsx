import React from 'react'

export default function LoadingScreen({ progress, error, onRetry }) {
  const pct = Math.round((progress?.progress || 0) * 100)
  const text = progress?.text || 'Loading model...'

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      color: '#ececec',
      flexDirection: 'column',
      gap: 20,
      padding: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>W</div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>WebLLM</div>
      </div>

      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, color: '#9ca3af', minHeight: 20, textAlign: 'center' }}>{text}</div>

        <div style={{ height: 8, background: '#212121', borderRadius: 999, overflow: 'hidden', border: '1px solid #2f2f2f' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6c5ce7, #a78bfa)',
            transition: 'width 0.25s ease',
            borderRadius: 999
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
          <span>{pct}%</span>
          <span>{pct < 100? 'Downloading shards...' : 'Initializing WebGPU...'}</span>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#fca5a5', fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Failed to load</div>
            <div style={{ opacity: 0.9, wordBreak: 'break-word' }}>{error}</div>
            <button onClick={onRetry} style={{ marginTop: 10, height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #3a3a3a', background: '#212121', color: '#ececec', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
          First load downloads the model (2-6GB). It runs 100% locally afterwards.<br />
          Requires a browser with WebGPU support: Chrome 113+, Edge 113+, or Chrome Canary.
        </div>
      </div>
    </div>
  )
}
