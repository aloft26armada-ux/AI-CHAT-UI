/**
 * LocalStorage persistence layer
 */
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants.js'
import { generateId } from '../utils/helpers.js'

export const storage = {
  getConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed)? parsed : []
    } catch {
      return []
    }
  },

  saveConversations(conversations) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations))
    } catch (e) {
      console.warn('Failed to save conversations', e)
    }
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!raw) return {...DEFAULT_SETTINGS }
      return {...DEFAULT_SETTINGS,...JSON.parse(raw) }
    } catch {
      return {...DEFAULT_SETTINGS }
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch {}
  },

  getSelectedModel() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || null
    } catch {
      return null
    }
  },

  saveSelectedModel(modelId) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId)
    } catch {}
  },

  createConversation(title = 'New chat') {
    return {
      id: generateId(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    }
  },

  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS)
    } catch {}
  }
}
