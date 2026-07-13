import { useState, useCallback, useEffect, useMemo } from 'react'
import { storage } from '../services/storage.js'
import { generateId, truncate } from '../utils/helpers.js'
import { ROLES, MESSAGE_STATUS } from '../utils/constants.js'

export function useChat() {
  const [conversations, setConversations] = useState(() => storage.getConversations())
  const [activeId, setActiveId] = useState(() => {
    const convs = storage.getConversations()
    return convs[0]?.id || null
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // persist conversations
  useEffect(() => {
    storage.saveConversations(conversations)
  }, [conversations])

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeId) || null
  }, [conversations, activeId])

  const createNewChat = useCallback(() => {
    const conv = storage.createConversation('New chat')
    setConversations(prev => [conv,...prev])
    setActiveId(conv.id)
    return conv.id
  }, [])

  const selectConversation = useCallback((id) => {
    setActiveId(id)
  }, [])

  const updateConversation = useCallback((id, updater) => {
    setConversations(prev => prev.map(c => {
      if (c.id!== id) return c
      const updated = typeof updater === 'function'? updater(c) : {...c,...updater }
      return {...updated, updatedAt: Date.now() }
    }))
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id!== id)
      if (activeId === id) {
        setActiveId(filtered[0]?.id || null)
      }
      return filtered
    })
  }, [activeId])

  const renameConversation = useCallback((id, newTitle) => {
    updateConversation(id, { title: newTitle })
  }, [updateConversation])

  const clearAllConversations = useCallback(() => {
    setConversations([])
    setActiveId(null)
    storage.clearAll()
  }, [])

  const addMessage = useCallback((conversationId, message) => {
    const msg = {
      id: generateId(),
      timestamp: Date.now(),
      status: MESSAGE_STATUS.DONE,
     ...message
    }
    updateConversation(conversationId, (conv) => {
      const isFirstUser = conv.messages.length === 0 && message.role === ROLES.USER
      return {
       ...conv,
        title: isFirstUser? truncate(message.content, 40) : conv.title,
        messages: [...conv.messages, msg]
      }
    })
    return msg.id
  }, [updateConversation])

  const updateMessage = useCallback((conversationId, messageId, patch) => {
    updateConversation(conversationId, (conv) => ({
     ...conv,
      messages: conv.messages.map(m => m.id === messageId? {...m,...patch } : m)
    }))
  }, [updateConversation])

  const deleteMessage = useCallback((conversationId, messageId) => {
    updateConversation(conversationId, (conv) => ({
     ...conv,
      messages: conv.messages.filter(m => m.id!== messageId)
    }))
  }, [updateConversation])

  const setMessages = useCallback((conversationId, messages) => {
    updateConversation(conversationId, { messages })
  }, [updateConversation])

  // Ensure at least one conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const conv = storage.createConversation('New chat')
      setConversations([conv])
      setActiveId(conv.id)
    } else if (!activeId) {
      setActiveId(conversations[0].id)
    }
  }, []) // eslint-disable-line

  return {
    conversations,
    activeId,
    activeConversation,
    isGenerating,
    setIsGenerating,
    createNewChat,
    selectConversation,
    updateConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations,
    addMessage,
    updateMessage,
    deleteMessage,
    setMessages
  }
}
