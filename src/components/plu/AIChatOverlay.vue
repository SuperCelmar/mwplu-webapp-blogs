<template>
  <div class="ai-chat-overlay">
    <Transition name="fade">
      <div v-if="isOpen" class="chat-backdrop" @click="closeChat"></div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="isOpen" class="chat-container" @click.stop>
        <div class="chat-header">
          <div class="chat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Assistant PLU</span>
          </div>
          <button @click="closeChat" class="close-button" aria-label="Fermer le chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>Posez une question sur ce PLU</h3>
            <p>Je peux vous aider à comprendre les règlements et contraintes de ce document.</p>
          </div>

          <div v-for="(message, index) in messages" :key="index"
               :class="['message', message.role === 'user' ? 'message-user' : 'message-assistant']">
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <div v-if="isSending" class="message message-assistant">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea
              v-model="userMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.shift.enter.exact="handleShiftEnter"
              placeholder="Posez votre question..."
              class="chat-textarea"
              rows="1"
              :disabled="isSending"
              ref="textareaRef"
            ></textarea>
            <button
              @click="sendMessage"
              class="send-button"
              :disabled="!userMessage.trim() || isSending"
              aria-label="Envoyer le message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="input-hint">
            Appuyez sur <kbd>Entrée</kbd> pour envoyer, <kbd>Maj + Entrée</kbd> pour une nouvelle ligne
          </div>
        </div>
      </div>
    </Transition>

    <button
      v-if="!isOpen"
      @click="openChat"
      class="chat-toggle-button"
      aria-label="Ouvrir l'assistant PLU"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  documentId: {
    type: [String, Number],
    required: true
  }
})

const uiStore = useUIStore()

const isOpen = ref(false)
const userMessage = ref('')
const messages = ref([])
const isSending = ref(false)
const messagesContainer = ref(null)
const textareaRef = ref(null)

const openChat = () => {
  isOpen.value = true
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const closeChat = () => {
  isOpen.value = false
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const messageText = userMessage.value.trim()
  if (!messageText || isSending.value) return

  const userMsg = {
    role: 'user',
    content: messageText,
    timestamp: Date.now()
  }

  messages.value.push(userMsg)
  userMessage.value = ''
  isSending.value = true
  scrollToBottom()

  try {
    const response = await fetch('https://n8n.automationdfy.com/webhook/mwplu/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
        document_id: props.documentId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    const assistantMsg = {
      role: 'assistant',
      content: data.response || data.message || 'Réponse reçue',
      timestamp: Date.now()
    }

    messages.value.push(assistantMsg)
    scrollToBottom()

  } catch (error) {
    console.error('Error sending message:', error)

    const errorMsg = {
      role: 'assistant',
      content: 'Désolé, une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.',
      timestamp: Date.now()
    }
    messages.value.push(errorMsg)

    uiStore.showError('Erreur lors de l\'envoi du message')
    scrollToBottom()
  } finally {
    isSending.value = false
  }
}

const handleShiftEnter = (e) => {
  const textarea = e.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value

  textarea.value = value.substring(0, start) + '\n' + value.substring(end)
  textarea.selectionStart = textarea.selectionEnd = start + 1

  userMessage.value = textarea.value
}

watch(userMessage, () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
})
</script>

<style scoped>
.ai-chat-overlay {
  position: fixed;
  z-index: var(--z-modal);
}

.chat-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
}

.chat-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 420px;
  max-width: calc(100vw - var(--space-8));
  height: 600px;
  max-height: calc(100vh - var(--space-12));
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: calc(var(--z-modal) + 1);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background-color: var(--color-black);
  color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  padding: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-button);
  transition: background-color var(--transition-fast);
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--color-gray-50);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: var(--space-8);
  color: var(--color-gray-600);
}

.empty-icon {
  margin-bottom: var(--space-4);
  color: var(--color-gray-400);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.message {
  display: flex;
  animation: slideIn 0.3s ease-out;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.message-user .message-content {
  background-color: var(--color-black);
  color: var(--color-white);
  border-bottom-right-radius: var(--radius-button);
}

.message-assistant .message-content {
  background-color: var(--color-white);
  color: var(--color-black);
  border: 1px solid var(--color-gray-200);
  border-bottom-left-radius: var(--radius-button);
}

.message-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-time {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2) 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--color-gray-400);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-container {
  padding: var(--space-4);
  background-color: var(--color-white);
  border-top: 1px solid var(--color-gray-200);
}

.input-wrapper {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.chat-textarea {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  resize: none;
  min-height: 40px;
  max-height: 120px;
  transition: border-color var(--transition-fast);
  background-color: var(--color-white);
  color: var(--color-black);
}

.chat-textarea:focus {
  outline: none;
  border-color: var(--color-black);
}

.chat-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  padding: var(--space-3);
  background-color: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  min-width: 44px;
  min-height: 44px;
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-gray-800);
  transform: translateY(-1px);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  text-align: center;
}

.input-hint kbd {
  padding: 2px var(--space-1);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-300);
  border-radius: 2px;
  font-size: var(--font-size-xs);
  font-family: monospace;
}

.chat-toggle-button {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 56px;
  height: 56px;
  background-color: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-fast);
  z-index: var(--z-modal);
}

.chat-toggle-button:hover {
  background-color: var(--color-gray-800);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.chat-toggle-button:active {
  transform: scale(0.95);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-base);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .chat-container {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }

  .chat-toggle-button {
    bottom: var(--space-4);
    right: var(--space-4);
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
