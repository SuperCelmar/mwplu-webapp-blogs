import { ref } from 'vue'
import axios from 'axios'
import { getUserContext } from '@/utils/helpers'

export function useAiChat() {
  const isLoading = ref(false)
  const error = ref(null)

  const sendMessage = async (message, documentId, userId = null) => {
    if (!message || !message.trim()) {
      error.value = 'Le message ne peut pas être vide'
      return { success: false, error: error.value }
    }

    if (!documentId) {
      error.value = 'ID du document manquant'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const userContext = getUserContext()

      const response = await axios.post(
        'https://n8n.automationdfy.com/webhook/mwplu/chat',
        {
          message: message.trim(),
          document_id: documentId,
          user_id: userId || userContext.user_id,
          user_email: userContext.user_email,
          is_authenticated: userContext.is_authenticated
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      isLoading.value = false
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error sending message to webhook:', err)
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message'
      isLoading.value = false
      return { success: false, error: error.value }
    }
  }

  return {
    isLoading,
    error,
    sendMessage,
  }
}
