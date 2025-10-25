import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function useAiChat() {
  const isLoading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const sendMessage = async (message, documentId, onStreamChunk = null) => {
    if (!message || !message.trim()) {
      error.value = 'Le message ne peut pas être vide'
      return { success: false, error: error.value }
    }

    if (!documentId) {
      error.value = 'ID du document manquant'
      return { success: false, error: error.value }
    }

    if (!authStore.userId) {
      error.value = 'Utilisateur non authentifié'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post(
        'https://n8n.automationdfy.com/webhook/mwplu/chat',
        {
          message: message.trim(),
          document_id: documentId,
          user_id: authStore.userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      )

      isLoading.value = false

      if (response.data && response.data.response) {
        return { success: true, data: response.data, message: response.data.response }
      }

      return { success: true, data: response.data, message: response.data.message || 'Réponse reçue' }
    } catch (err) {
      console.error('Error sending message to webhook:', err)
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message'
      isLoading.value = false
      return { success: false, error: error.value }
    }
  }

  const sendMessageWithStreaming = async (message, documentId, onStreamChunk) => {
    if (!message || !message.trim()) {
      error.value = 'Le message ne peut pas être vide'
      return { success: false, error: error.value }
    }

    if (!documentId) {
      error.value = 'ID du document manquant'
      return { success: false, error: error.value }
    }

    if (!authStore.userId) {
      error.value = 'Utilisateur non authentifié'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('https://n8n.automationdfy.com/webhook/mwplu/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          document_id: documentId,
          user_id: authStore.userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk

          if (onStreamChunk) {
            onStreamChunk(chunk, fullText)
          }
        }
      } else {
        const data = await response.json()
        fullText = data.response || data.message || 'Réponse reçue'
        if (onStreamChunk) {
          onStreamChunk(fullText, fullText)
        }
      }

      isLoading.value = false
      return { success: true, message: fullText }
    } catch (err) {
      console.error('Error sending streaming message:', err)
      error.value = err.message || 'Erreur lors de l\'envoi du message'
      isLoading.value = false
      return { success: false, error: error.value }
    }
  }

  return {
    isLoading,
    error,
    sendMessage,
    sendMessageWithStreaming,
  }
}
