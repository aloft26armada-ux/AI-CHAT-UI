import React from 'react'
import { DEFAULT_SETTINGS } from '../utils/constants.js'

export default function Settings({ settings, onChange, onClose, modelId, showToast }) {
  const update = (patch) => onChange(prev => ({...prev,...patch }))

  const handleReset = () => {
    onChange({...DEFAULT_SETTINGS })
    showToast?.('Settings reset')
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">Settings</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <div className="settings-label">Model</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontFamily: 'JetBrains Mono, monospace' }}>{modelId}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Change model from the header dropdown. Larger models need more VRAM.</div>
          </div>

          <div className="settings-section">
            <div className="settings-label">System Prompt</div>
            <textarea
              className="textarea-setting"
              value={settings.systemPrompt}
              onChange={e => update({ systemPrompt: e.target.value })}
              placeholder="You are a helpful assistant..."
            />
          </div>

          <div className="settings-section">
            <div className="settings-label">Temperature: {settings.temperature}</div>
            <div className="slider-row">
              <input className="slider" type="range" min="0" max="2" step="0.05" value={settings.temperature} onChange={e => update({ temperature: parseFloat(e.target.value) })} />
              <div className="slider-value">{settings.temperature.toFixed(2)}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Lower = more deterministic, higher = more creative.</div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Top-P: {settings.top_p}</div>
            <div className="slider-row">
              <input className="slider" type="range" min="0" max="1" step="0.05" value={settings.top_p} onChange={e => update({ top_p: parseFloat(e.target.value) })} />
              <div className="slider-value">{settings.top_p.toFixed(2)}</div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Max Tokens: {settings.max_tokens}</div>
            <div className="slider-row">
              <input className="slider" type="range" min="64" max="4096" step="64" value={settings.max_tokens} onChange={e => update({ max_tokens: parseInt(e.target.value) })} />
              <div className="slider-value">{settings.max_tokens}</div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Browser Requirements</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
              • Chrome 113+ or Edge 113+ with WebGPU enabled<br />
              • 4GB+ VRAM recommended for 3B models, 8GB+ for 7-8B<br />
              • First load downloads model files and caches them<br />
              • No data leaves your device - fully private
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-danger" onClick={handleReset}>Reset defaults</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}
