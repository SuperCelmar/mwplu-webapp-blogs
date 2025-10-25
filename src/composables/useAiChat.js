import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

export function useAiChat() {
  const isLoading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const sendMessage = async (message, documentId) => {
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
    chatStore.setLoading(true)
    error.value = null

    try {
      const userMessage = message.trim()

      const userMessageResult = await chatStore.addMessage('user', userMessage)

      if (!userMessageResult.success) {
        throw new Error(userMessageResult.error)
      }

      chatStore.openPopup()

      const response = await axios.post(
        'https://n8n.automationdfy.com/webhook/mwplu/chat',
        {
          message: userMessage,
          document_id: documentId,
          user_id: authStore.userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const aiResponse = response.data?.response || response.data?.message || 'Réponse reçue'

      const assistantMessageResult = await chatStore.addMessage('assistant', aiResponse, {
        webhook_response: response.data,
      })

      if (!assistantMessageResult.success) {
        throw new Error(assistantMessageResult.error)
      }

      isLoading.value = false
      chatStore.setLoading(false)
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Error sending message to webhook:', err)
      error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi du message'

      await chatStore.addMessage('assistant', `Désolé, une erreur s'est produite : ${error.value}`, {
        isError: true,
      })

      isLoading.value = false
      chatStore.setLoading(false)
      return { success: false, error: error.value }
    }
  }

  return {
    isLoading,
    error,
    sendMessage,
  }
}
