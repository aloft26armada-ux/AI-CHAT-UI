import React, { useMemo } from 'react'
import { parseMarkdown } from '../utils/markdown.js'
import CodeBlock from './CodeBlock.jsx'

export default function MarkdownRenderer({ content }) {
  const html = useMemo(() => parseMarkdown(content || ''), [content])

  const parts = useMemo(() => {
    if (!content) return []
    const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
    let lastIndex = 0
    const out = []
    let m
    while ((m = regex.exec(content))!== null) {
      if (m.index > lastIndex) {
        out.push({ type: 'md', value: content.slice(lastIndex, m.index) })
      }
      out.push({ type: 'code', lang: m[1] || '', value: m[2] })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < content.length) {
      out.push({ type: 'md', value: content.slice(lastIndex) })
    }
    return out.length? out : [{ type: 'md', value: content }]
  }, [content])

  if (!content) return null

  if (parts.length === 1 && parts[0].type === 'md') {
    return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="markdown-body">
      {parts.map((p, i) => {
        if (p.type === 'code') {
          return <CodeBlock key={i} language={p.lang} code={p.value} />
        }
        const h = parseMarkdown(p.value)
        return <div key={i} dangerouslySetInnerHTML={{ __html: h }} />
      })}
    </div>
  )
}
