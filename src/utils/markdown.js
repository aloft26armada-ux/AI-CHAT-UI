/**
 * Markdown parsing with marked + highlight.js + DOMPurify
 */
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (_) {
        // fallthrough
      }
    }
    try {
      return hljs.highlightAuto(code).value
    } catch (_) {
      return code
    }
  }
})

const renderer = new marked.Renderer()

// Open links in new tab
const originalLink = renderer.link.bind(renderer)
renderer.link = (href, title, text) => {
  const html = originalLink(href, title, text)
  return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
}

marked.use({ renderer })

export function parseMarkdown(md) {
  if (!md) return ''
  const raw = marked.parse(md)
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel'],
    ALLOWED_TAGS: [
      'h1','h2','h3','h4','h5','h6',
      'p','a','ul','ol','li','blockquote','code','pre',
      'em','strong','del','hr','br','table','thead','tbody','tr','th','td',
      'span','div','img','input'
    ]
  })
}

export function stripMarkdown(md) {
  return md.replace(/[#*_`>\[\]()!|]/g, '').slice(0, 200)
}
