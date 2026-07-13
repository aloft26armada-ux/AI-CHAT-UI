/**
 * WebLLM engine singleton wrapper
 */
import { CreateMLCEngine } from '@mlc-ai/web-llm'

let engine = null
let currentModel = null
let abortController = null

export function getEngine() {
  return engine
}

export function isEngineLoaded() {
  return!!engine
}

export function getCurrentModel() {
  return currentModel
}

export async function initEngine(modelId, onProgress) {
  // reuse if same model
  if (engine && currentModel === modelId) return engine

  // cleanup previous
  if (engine) {
    try { await engine.unload?.() } catch {}
    engine = null
  }

  abortController = new AbortController()

  const initProgressCallback = (report) => {
    if (typeof onProgress === 'function') {
      onProgress(report)
    }
  }

  engine = await CreateMLCEngine(modelId, {
    initProgressCallback,
    logLevel: 'WARN'
  })

  currentModel = modelId
  return engine
}

export async function generateChatCompletion({ messages, settings, onChunk, signal }) {
  if (!engine) throw new Error('Engine not initialized')

  const { temperature, top_p, max_tokens } = settings

  const stream = await engine.chat.completions.create({
    messages,
    temperature,
    top_p,
    max_tokens,
    stream: true,
    stream_options: { include_usage: true }
  })

  let fullText = ''

  for await (const chunk of stream) {
    if (signal?.aborted) {
      try { await engine.interruptGenerate() } catch {}
      throw new DOMException('Aborted', 'AbortError')
    }
    const delta = chunk?.choices?.[0]?.delta?.content || ''
    if (delta) {
      fullText += delta
      onChunk?.(delta, fullText)
    }
  }

  return fullText
}

export async function stopGeneration() {
  if (engine) {
    try {
      await engine.interruptGenerate()
    } catch {}
  }
  if (abortController) {
    abortController.abort()
  }
}

export function createAbortSignal() {
  abortController = new AbortController()
  return abortController.signal
}

export async function unloadEngine() {
  if (engine) {
    try { await engine.unload() } catch {}
    engine = null
    currentModel = null
  }
}
