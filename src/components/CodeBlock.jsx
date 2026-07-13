import React, { useState } from 'react'
import { copyToClipboard } from '../utils/helpers.js'

export default function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ position: 'relative', margin: '12px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#15151a',
        border: '1px solid #2a2a32',
        borderBottom: 'none',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        fontSize: 12,
        color: '#9ca3af'
      }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'lowercase' }}>{language || 'text'}</span>
        <button
          onClick={onCopy}
          style={{
            height: 26,
            padding: '0 10px',
            borderRadius: 6,
            border: '1px solid #2f2f3a',
            background: '#23232d',
            color: '#d1d5db',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {copied? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <code className={language? `language-${language}` : ''} style={{ display: 'block', padding: '12px 14px', overflowX: 'auto' }}>
          {code}
        </code>
      </pre>
    </div>
  )
}
