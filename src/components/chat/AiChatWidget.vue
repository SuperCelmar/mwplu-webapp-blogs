<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="chatStore.isPopupOpen" class="chat-widget-overlay" @click="handleOverlayClick">
        <div class="chat-widget-container" @click.stop>
          <Card variant="elevated" class="chat-widget-card">
            <AiChatHeader
              :document-name="documentName"
              @close="handleClose"
              @clear="handleClear"
            />

            <div ref="messagesContainer" class="chat-messages">
              <AiChatWelcome
                v-if="!chatStore.hasMessages"
                @prompt-selected="handlePromptSelected"
              />

              <template v-else>
                <AiChatMessage
                  v-for="message in chatStore.messages"
                  :key="message.id"
                  :message="message"
                />

                <div v-if="chatStore.isLoading" class="typing-indicator">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <span class="typing-text">L'assistant réfléchit...</span>
                </div>
              </template>
            </div>

            <div class="chat-input-area">
              <div class="input-wrapper">
                <Textarea
                  v-model="inputMessage"
                  placeholder="Posez une question sur ce document..."
                  :rows="2"
                  :disabled="chatStore.isLoading"
                  @keydown.enter.exact.prevent="handleSend"
                />
                <Button
                  variant="primary"
                  size="icon"
                  class="send-button"
                  :disabled="!inputMessage.trim() || chatStore.isLoading"
                  @click="handleSend"
                >
                  <Send :size="18" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Send } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import AiChatHeader from './AiChatHeader.vue'
import AiChatMessage from './AiChatMessage.vue'
import AiChatWelcome from './AiChatWelcome.vue'
import { useChatStore } from '@/stores/chat'
import { useAiChat } from '@/composables/useAiChat'

const props = defineProps({
  documentId: {
    type: [String, Number],
    required: true,
  },
  documentName: {
    type: String,
    default: '',
  },
})

const chatStore = useChatStore()
const { sendMessage } = useAiChat()

const inputMessage = ref('')
const messagesContainer = ref(null)

const handleClose = () => {
  chatStore.closePopup()
}

const handleClear = async () => {
  await chatStore.clearChat()
}

const handlePromptSelected = (promptText) => {
  inputMessage.value = promptText
  handleSend()
}

const handleSend = async () => {
  if (!inputMessage.value.trim() || chatStore.isLoading) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  await sendMessage(message, props.documentId)

  nextTick(() => {
    scrollToBottom()
  })
}

const handleOverlayClick = () => {
  handleClose()
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(
  () => chatStore.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  }
)

watch(
  () => chatStore.isPopupOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        scrollToBottom()
      })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.chat-widget-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.chat-widget-container {
  width: 100%;
  max-width: 480px;
  height: 100%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
}

.chat-widget-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background-color: var(--color-white);
  scroll-behavior: smooth;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-card);
  width: fit-content;
  margin-bottom: var(--space-4);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-gray-500);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

.typing-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-left: var(--space-2);
}

.chat-input-area {
  padding: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  border-bottom-left-radius: var(--radius-card);
  border-bottom-right-radius: var(--radius-card);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.input-wrapper :deep(textarea) {
  flex: 1;
  min-height: 60px;
  max-height: 120px;
  padding-right: var(--space-12);
}

.send-button {
  flex-shrink: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .chat-widget-container,
.modal-leave-active .chat-widget-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .chat-widget-container {
  transform: translateY(50px) scale(0.9);
}

.modal-leave-to .chat-widget-container {
  transform: translateY(50px) scale(0.9);
}

@media (max-width: 768px) {
  .chat-widget-overlay {
    padding: 0;
  }

  .chat-widget-container {
    max-width: 100%;
    max-height: 100%;
    height: 100vh;
  }

  .chat-widget-card {
    border-radius: 0;
  }

  .chat-messages {
    padding: var(--space-3);
  }

  .chat-input-area {
    padding: var(--space-3);
  }
}
</style>
