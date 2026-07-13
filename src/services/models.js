/**
 * Model registry - safe ESM version for Vite build
 */

export const BUILTIN_MODELS = [
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B Instruct',
    family: 'Llama 3',
    size: '3B',
    vram: '~3.2GB',
    context: '8K',
    description: 'Best balance of speed and quality'
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.1 8B Instruct',
    family: 'Llama 3',
    size: '8B',
    vram: '~6.8GB',
    context: '8K',
    description: 'High quality, needs powerful GPU'
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 3B Instruct',
    family: 'Qwen 2.5',
    size: '3B',
    vram: '~3.1GB',
    context: '32K',
    description: 'Strong multilingual and coding'
  },
  {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 7B Instruct',
    family: 'Qwen 2.5',
    size: '7B',
    vram: '~6.5GB',
    context: '32K',
    description: 'Excellent coding and reasoning'
  },
  {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B Instruct',
    family: 'Gemma 2',
    size: '2B',
    vram: '~2.3GB',
    context: '8K',
    description: 'Fastest, great for low-end devices'
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini Instruct',
    family: 'Phi-3',
    size: '3.8B',
    vram: '~3.4GB',
    context: '128K',
    description: 'Long context, efficient reasoning'
  },
  {
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    name: 'Mistral 7B Instruct v0.3',
    family: 'Mistral',
    size: '7B',
    vram: '~6.2GB',
    context: '32K',
    description: 'Strong general purpose model'
  },
  {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    name: 'DeepSeek R1 Distill 7B',
    family: 'DeepSeek',
    size: '7B',
    vram: '~6.5GB',
    context: '32K',
    description: 'Reasoning-focused distilled model'
  }
]

var cachedModels = null

export function fetchModels() {
  if (cachedModels) {
    return Promise.resolve(cachedModels)
  }
  try {
    return fetch('/models.json')
     .then(function(res) {
        if (!res.ok) throw new Error('no manifest')
        return res.json()
      })
     .then(function(data) {
        if (Array.isArray(data) && data.length) {
          cachedModels = data
          return data
        }
        cachedModels = BUILTIN_MODELS
        return BUILTIN_MODELS
      })
     .catch(function() {
        cachedModels = BUILTIN_MODELS
        return BUILTIN_MODELS
      })
  } catch (e) {
    cachedModels = BUILTIN_MODELS
    return Promise.resolve(BUILTIN_MODELS)
  }
}

export function getModelById(id) {
  var list = cachedModels || BUILTIN_MODELS
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i]
  }
  return null
}