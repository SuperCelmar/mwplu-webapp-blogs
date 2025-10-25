import { ref, computed } from 'vue'

export function useChatSession(documentId) {
  const messages = ref([])
  const sessionId = ref(null)
  const isPopupOpen = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  const hasMessages = computed(() => messages.value.length > 0)

  const addMessage = (role, message, metadata = {}) => {
    const newMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      role,
      message,
      created_at: new Date().toISOString(),
      metadata,
    }
    messages.value.push(newMessage)
    return newMessage
  }

  const addUserMessage = (message) => {
    return addMessage('user', message)
  }

  const addAssistantMessage = (message, metadata = {}) => {
    return addMessage('assistant', message, metadata)
  }

  const updateLastMessage = (message) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      lastMessage.message = message
    }
  }

  const clearMessages = () => {
    messages.value = []
    sessionId.value = null
  }

  const openPopup = () => {
    isPopupOpen.value = true
  }

  const closePopup = () => {
    isPopupOpen.value = false
  }

  const togglePopup = () => {
    isPopupOpen.value = !isPopupOpen.value
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const setSessionId = (id) => {
    sessionId.value = id
  }

  const loadMessages = (loadedMessages) => {
    messages.value = loadedMessages
  }

  return {
    messages,
    sessionId,
    isPopupOpen,
    isLoading,
    error,
    hasMessages,
    addUserMessage,
    addAssistantMessage,
    updateLastMessage,
    clearMessages,
    openPopup,
    closePopup,
    togglePopup,
    setLoading,
    setError,
    clearError,
    setSessionId,
    loadMessages,
  }
}
