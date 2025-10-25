<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="isOpen" class="chat-popup-overlay" @click="handleOverlayClick">
        <div class="chat-popup" @click.stop>
          <div class="chat-popup__header">
            <div class="chat-popup__header-title">
              <h3>Assistant PLU</h3>
              <span v-if="documentName" class="chat-popup__document">{{ documentName }}</span>
            </div>
            <div class="chat-popup__header-actions">
              <BaseButton variant="ghost" size="icon" @click="handleClose">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </BaseButton>
            </div>
          </div>

          <div class="chat-popup__body">
            <ChatWelcome
              v-if="!hasMessages"
              :user-name="userName"
              @prompt-selected="handlePromptSelected"
            />
            <ChatMessages
              v-else
              ref="chatMessagesRef"
              :messages="messages"
              :is-loading="isLoading"
              :user-name="userName"
            />
          </div>

          <div class="chat-popup__footer">
            <div class="chat-input-container">
              <BaseTextarea
                v-model="inputValue"
                :placeholder="inputPlaceholder"
                :disabled="isLoading"
                :rows="1"
                :auto-resize="true"
                class="chat-input"
                @keydown.enter.exact.prevent="handleSubmit"
              />
              <BaseButton
                variant="default"
                size="icon"
                :disabled="!canSend"
                class="chat-submit-button"
                @click="handleSubmit"
              >
                <ArrowUp :size="16" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import ChatWelcome from './ChatWelcome.vue'
import ChatMessages from './ChatMessages.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  userName: {
    type: String,
    default: 'Utilisateur',
  },
  documentName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'send-message'])

const inputValue = ref('')
const chatMessagesRef = ref(null)

const hasMessages = computed(() => props.messages.length > 0)

const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !props.isLoading
})

const inputPlaceholder = computed(() => {
  return props.isLoading ? 'Réponse en cours...' : 'Posez votre question...'
})

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  handleClose()
}

const handleSubmit = () => {
  if (!canSend.value) return

  const message = inputValue.value.trim()
  emit('send-message', message)
  inputValue.value = ''
}

const handlePromptSelected = (promptText) => {
  inputValue.value = promptText
  handleSubmit()
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.chat-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: var(--space-4);
}

.chat-popup {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
}

.chat-popup__header-title h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.chat-popup__document {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  display: block;
  margin-top: var(--space-1);
}

.chat-popup__body {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-white);
}

.chat-popup__footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
}

.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  padding: var(--space-2);
  transition: all var(--transition-fast);
}

.chat-input-container:focus-within {
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  max-height: 120px;
  min-height: 36px;
}

.chat-input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.chat-submit-button {
  flex-shrink: 0;
  align-self: flex-end;
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}

.popup-enter-active .chat-popup,
.popup-leave-active .chat-popup {
  transition: transform 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-from .chat-popup {
  transform: scale(0.9) translateY(20px);
}

.popup-leave-to .chat-popup {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 768px) {
  .chat-popup-overlay {
    padding: 0;
    align-items: stretch;
  }

  .chat-popup {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
