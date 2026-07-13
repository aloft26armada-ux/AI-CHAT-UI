import { useState, useCallback, useRef } from 'react'
import { initEngine, getEngine, stopGeneration, createAbortSignal, getCurrentModel } from '../services/webllm.js'
import { STORAGE_KEYS } from '../utils/constants.js'

export function useWebLLM(defaultModel) {
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState({ text: '', progress: 0 })
  const [error, setError] = useState(null)
  const [modelId, setModelId] = useState(defaultModel)
  const engineRef = useRef(null)

  const loadModel = useCallback(async (newModelId) => {
    const target = newModelId || modelId
    if (!target) return

    setIsLoading(true)
    setIsReady(false)
    setError(null)
    setProgress({ text: 'Initializing...', progress: 0 })

    try {
      const engine = await initEngine(target, (report) => {
        // report: { text, progress }
        setProgress({
          text: report.text || 'Downloading...',
          progress: report.progress?? 0
        })
      })
      engineRef.current = engine
      setModelId(target)
      setIsReady(true)
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, target)
      } catch {}
    } catch (err) {
      console.error('Model load failed', err)
      setError(err.message || 'Failed to load model')
      setIsReady(false)
    } finally {
      setIsLoading(false)
    }
  }, [modelId])

  const abortSignalRef = useRef(null)

  const generate = useCallback(async ({ messages, settings, onChunk }) => {
    const engine = getEngine()
    if (!engine) throw new Error('Model not loaded')

    abortSignalRef.current = createAbortSignal()
    const { generateChatCompletion } = await import('../services/webllm.js')

    try {
      const text = await generateChatCompletion({
        messages,
        settings,
        onChunk,
        signal: abortSignalRef.current
      })
      return text
    } catch (e) {
      if (e.name === 'AbortError') {
        return null
      }
      throw e
    }
  }, [])

  const stop = useCallback(async () => {
    await stopGeneration()
  }, [])

  const reload = useCallback(() => {
    if (modelId) loadModel(modelId)
  }, [loadModel, modelId])

  return {
    isLoading,
    isReady,
    progress,
    error,
    modelId,
    engine: engineRef.current,
    currentModel: getCurrentModel(),
    loadModel,
    generate,
    stop,
    reload,
    setModelId
  }
}
