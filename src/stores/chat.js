import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dbService } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  const isPopupOpen = ref(false)
  const isLoading = ref(false)
  const currentSessionId = ref(null)
  const currentDocumentId = ref(null)
  const messages = ref([])
  const error = ref(null)
  const isStreaming = ref(false)

  const hasMessages = computed(() => messages.value.length > 0)
  const hasSession = computed(() => !!currentSessionId.value)

  /**
   * Initialize chat for a document
   */
  const initializeChat = async (documentId) => {
    if (!authStore.userId) {
      error.value = 'User must be authenticated'
      return { success: false, error: error.value }
    }

    try {
      currentDocumentId.value = documentId

      const sessionResult = await dbService.hasActiveChatSession(authStore.userId, documentId)

      if (sessionResult.success && sessionResult.hasSession) {
        currentSessionId.value = sessionResult.sessionId
        await loadMessages()
        return { success: true, hasExistingChat: true }
      }

      return { success: true, hasExistingChat: false }
    } catch (err) {
      console.error('Error initializing chat:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Load messages for the current session
   */
  const loadMessages = async () => {
    if (!currentSessionId.value) return

    try {
      isLoading.value = true
      const result = await dbService.getChatMessages(currentSessionId.value)

      if (result.success) {
        messages.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new chat session
   */
  const createSession = async () => {
    if (!authStore.userId || !currentDocumentId.value) {
      error.value = 'User and document are required'
      return { success: false, error: error.value }
    }

    try {
      const result = await dbService.getOrCreateChatSession(
        authStore.userId,
        currentDocumentId.value
      )

      if (result.success) {
        currentSessionId.value = result.data.id
        return { success: true, sessionId: result.data.id }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error creating session:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Add a message to the chat
   */
  const addMessage = async (role, content, metadata = {}) => {
    if (!currentSessionId.value) {
      const sessionResult = await createSession()
      if (!sessionResult.success) {
        return { success: false, error: sessionResult.error }
      }
    }

    try {
      const result = await dbService.saveChatMessage(
        currentSessionId.value,
        authStore.userId,
        currentDocumentId.value,
        role,
        content,
        metadata
      )

      if (result.success) {
        messages.value.push(result.data)
        return { success: true, data: result.data }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error adding message:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Add a temporary message (for optimistic updates)
   */
  const addTemporaryMessage = (role, content) => {
    const tempMessage = {
      id: `temp-${Date.now()}`,
      role,
      message: content,
      created_at: new Date().toISOString(),
      isTemporary: true,
    }
    messages.value.push(tempMessage)
    return tempMessage
  }

  /**
   * Update a temporary message with the saved version
   */
  const replaceTemporaryMessage = (tempId, savedMessage) => {
    const index = messages.value.findIndex((m) => m.id === tempId)
    if (index !== -1) {
      messages.value[index] = savedMessage
    }
  }

  /**
   * Remove a temporary message
   */
  const removeTemporaryMessage = (tempId) => {
    const index = messages.value.findIndex((m) => m.id === tempId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  /**
   * Open the chat popup
   */
  const openPopup = () => {
    isPopupOpen.value = true
  }

  /**
   * Close the chat popup
   */
  const closePopup = () => {
    isPopupOpen.value = false
  }

  /**
   * Toggle the chat popup
   */
  const togglePopup = () => {
    isPopupOpen.value = !isPopupOpen.value
  }

  /**
   * Clear the current chat
   */
  const clearChat = async () => {
    if (currentSessionId.value) {
      await dbService.deactivateChatSession(currentSessionId.value)
    }
    messages.value = []
    currentSessionId.value = null
    isPopupOpen.value = false
    error.value = null
  }

  /**
   * Reset chat state (when navigating to different document)
   */
  const resetChat = () => {
    messages.value = []
    currentSessionId.value = null
    currentDocumentId.value = null
    isPopupOpen.value = false
    isLoading.value = false
    isStreaming.value = false
    error.value = null
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  /**
   * Set streaming state
   */
  const setStreaming = (streaming) => {
    isStreaming.value = streaming
  }

  /**
   * Set error
   */
  const setError = (err) => {
    error.value = err
  }

  return {
    isPopupOpen,
    isLoading,
    isStreaming,
    currentSessionId,
    currentDocumentId,
    messages,
    error,
    hasMessages,
    hasSession,
    initializeChat,
    loadMessages,
    createSession,
    addMessage,
    addTemporaryMessage,
    replaceTemporaryMessage,
    removeTemporaryMessage,
    openPopup,
    closePopup,
    togglePopup,
    clearChat,
    resetChat,
    setLoading,
    setStreaming,
    setError,
  }
})
