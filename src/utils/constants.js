/**
 * App-wide constants
 */

export const APP_NAME = 'WebLLM WebUI'
export const APP_VERSION = '1.0.0'

export const STORAGE_KEYS = {
  CONVERSATIONS: 'webllm_conversations',
  SETTINGS: 'webllm_settings',
  SELECTED_MODEL: 'webllm_selected_model',
  SIDEBAR_OPEN: 'webllm_sidebar_open'
}

export const DEFAULT_SETTINGS = {
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 1024,
  systemPrompt: 'You are a helpful, harmless, and honest AI assistant. You run 100% locally in the browser.',
  stream: true,
  showTimestamps: false
}

export const DEFAULT_MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC'

export const ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
}

export const MESSAGE_STATUS = {
  IDLE: 'idle',
  STREAMING: 'streaming',
  DONE: 'done',
  ERROR: 'error',
  STOPPED: 'stopped'
}

export const TOAST_DURATION = 3000

export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: 'ctrl+n',
  SEARCH: 'ctrl+k',
  SETTINGS: 'ctrl+,',
  SEND: 'enter',
  NEW_LINE: 'shift+enter',
  STOP: 'escape'
}
