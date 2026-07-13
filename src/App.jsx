import React, { useEffect, useState, useCallback } from 'react'
import { useChat } from './hooks/useChat.js'
import { useWebLLM } from './hooks/useWebLLM.js'
import { storage } from './services/storage.js'
import { DEFAULT_MODEL, DEFAULT_SETTINGS, ROLES } from './utils/constants.js'
import { copyToClipboard } from './utils/helpers.js'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ChatInput from './components/ChatInput.jsx'
import Settings from './components/Settings.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (window.innerWidth < 768) return false
    return true
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => storage.getSettings())
  const [toasts, setToasts] = useState([])

  const chat = useChat()

  const selectedModelId = (() => {
    try { return localStorage.getItem('webllm_selected_model') || DEFAULT_MODEL } catch { return DEFAULT_MODEL }
  })()

  const webllm = useWebLLM(selectedModelId)

  // Load model on mount if not ready
  useEffect(() => {
    if (!webllm.isReady &&!webllm.isLoading) {
      webllm.loadModel(selectedModelId)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    storage.saveSettings(settings)
  }, [settings])

  const showToast = useCallback((msg) => {
    const id = Date.now().toString()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id!== id)), 3000)
  }, [])

  const handleSend = useCallback(async (text) => {
    if (!text?.trim()) return
    const convId = chat.activeId || chat.createNewChat()
    const activeId = convId

    // add user message
    chat.addMessage(activeId, { role: ROLES.USER, content: text })

    // prepare messages for LLM
    const conversation = chat.conversations.find(c => c.id === activeId)
    const history = conversation? conversation.messages : []
    const messagesForModel = [
      { role: 'system', content: settings.systemPrompt },
     ...history.map(m => ({ role: m.role, content: m.content })),
      { role: ROLES.USER, content: text }
    ]

    // add empty assistant placeholder
    const assistantId = chat.addMessage(activeId, {
      role: ROLES.ASSISTANT,
      content: '',
      status: 'streaming'
    })

    chat.setIsGenerating(true)

    try {
      let full = ''
      await webllm.generate({
        messages: messagesForModel,
        settings,
        onChunk: (delta, fullText) => {
          full = fullText
          chat.updateMessage(activeId, assistantId, { content: fullText, status: 'streaming' })
        }
      })
      chat.updateMessage(activeId, assistantId, { content: full, status: 'done' })
    } catch (err) {
      const isAbort = err?.name === 'AbortError'
      chat.updateMessage(activeId, assistantId, {
        content: isAbort? (chat.conversations.find(c=>c.id===activeId)?.messages.find(m=>m.id===assistantId)?.content || '') + ' \n\n*Generation stopped.*' : `**Error:** ${err.message}`,
        status: isAbort? 'stopped' : 'error'
      })
      if (!isAbort) showToast('Generation failed: ' + err.message)
    } finally {
      chat.setIsGenerating(false)
    }
  }, [chat, webllm, settings, showToast])

  const handleStop = useCallback(async () => {
    await webllm.stop()
    chat.setIsGenerating(false)
  }, [webllm, chat])

  const handleRegenerate = useCallback(async (messageId) => {
    const conv = chat.activeConversation
    if (!conv) return
    const idx = conv.messages.findIndex(m => m.id === messageId)
    if (idx === -1) return
    const target = conv.messages[idx]
    // find last user message before this assistant
    let userMsg = null
    for (let i = idx - 1; i >= 0; i--) {
      if (conv.messages[i].role === ROLES.USER) { userMsg = conv.messages[i]; break }
    }
    if (!userMsg) return

    // remove assistant message and recreate
    chat.updateMessage(conv.id, messageId, { content: '', status: 'streaming' })
    chat.setIsGenerating(true)

    const history = conv.messages.slice(0, idx)
    const messagesForModel = [
      { role: 'system', content: settings.systemPrompt },
     ...history.filter(m => m.id!== messageId).map(m => ({ role: m.role, content: m.content })),
      { role: ROLES.USER, content: userMsg.content }
    ]

    try {
      let full = ''
      await webllm.generate({
        messages: messagesForModel,
        settings,
        onChunk: (d, ft) => {
          full = ft
          chat.updateMessage(conv.id, messageId, { content: ft, status: 'streaming' })
        }
      })
      chat.updateMessage(conv.id, messageId, { content: full, status: 'done' })
    } catch (e) {
      chat.updateMessage(conv.id, messageId, { content: `Error: ${e.message}`, status: 'error' })
    } finally {
      chat.setIsGenerating(false)
    }
  }, [chat, webllm, settings])

  const handleEditPrompt = useCallback(async (messageId, newContent) => {
    const conv = chat.activeConversation
    if (!conv) return
    // update user message
    chat.updateMessage(conv.id, messageId, { content: newContent })
    // remove all messages after this user message
    const idx = conv.messages.findIndex(m => m.id === messageId)
    const newMessages = conv.messages.slice(0, idx + 1)
    chat.setMessages(conv.id, newMessages)
    // re-send as new prompt
    await handleSend(newContent)
  }, [chat, handleSend])

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        chat.createNewChat()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setSettingsOpen(v =>!v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chat])

  if (webllm.isLoading) {
    return <LoadingScreen progress={webllm.progress} error={webllm.error} onRetry={webllm.reload} />
  }

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.selectConversation}
        onNew={chat.createNewChat}
        onDelete={chat.deleteConversation}
        onRename={chat.renameConversation}
        onClearAll={chat.clearAllConversations}
        onClose={() => setSidebarOpen(false)}
        showToast={showToast}
      />
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v =>!v)}
          onOpenSettings={() => setSettingsOpen(true)}
          modelId={webllm.modelId}
          isReady={webllm.isReady}
          isLoading={webllm.isLoading}
          onModelChange={(id) => webllm.loadModel(id)}
        />

        <div className="main-content">
          <ChatWindow
            conversation={chat.activeConversation}
            isGenerating={chat.isGenerating}
            onCopy={(t) => { copyToClipboard(t); showToast('Copied to clipboard') }}
            onRegenerate={handleRegenerate}
            onEdit={handleEditPrompt}
            onDelete={(mid) => chat.deleteMessage(chat.activeId, mid)}
          />

          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isGenerating={chat.isGenerating}
            disabled={!webllm.isReady}
          />
        </div>
      </div>

      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
          modelId={webllm.modelId}
          showToast={showToast}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  )
    }
