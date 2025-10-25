<template>
  <div class="ai-chat-input-wrapper">
    <form @submit.prevent="handleSubmit" class="ai-chat-input-container" @click="handleInputClick">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :disabled="isLoading || disabled"
        class="ai-chat-input"
        @keydown.enter.exact.prevent="handleSubmit"
        @focus="handleInputFocus"
      />
      <button
        type="submit"
        :disabled="isLoading || disabled || !inputValue.trim()"
        class="ai-chat-submit-btn"
        :aria-label="isLoading ? 'Envoi en cours...' : 'Envoyer le message'"
      >
        <ArrowUp :size="16" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import { useAiChat } from '@/composables/useAiChat'
import { useUIStore } from '@/stores/ui'
import { useChatStore } from '@/stores/chat'

const props = defineProps({
  documentId: {
    type: [String, Number],
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Posez une question sur ce document...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const inputRef = ref(null)
const inputValue = ref('')
const uiStore = useUIStore()
const chatStore = useChatStore()
const { isLoading, sendMessage } = useAiChat()

onMounted(async () => {
  await chatStore.initializeChat(props.documentId)
})

const handleInputClick = () => {
  if (chatStore.hasMessages) {
    chatStore.openPopup()
  }
}

const handleInputFocus = () => {
  if (chatStore.hasMessages) {
    chatStore.openPopup()
    if (inputRef.value) {
      inputRef.value.blur()
    }
  }
}

const handleSubmit = async () => {
  if (!inputValue.value.trim() || isLoading.value || props.disabled) {
    return
  }

  const message = inputValue.value.trim()
  const result = await sendMessage(message, props.documentId)

  if (result.success) {
    inputValue.value = ''
    if (inputRef.value) {
      inputRef.value.focus()
    }
  } else {
    uiStore.showNotification({
      type: 'error',
      message: result.error || 'Erreur lors de l\'envoi du message',
      autoDismiss: true,
      autoDismissDelay: 5000,
    })
  }
}
</script>

<style scoped>
.ai-chat-input-wrapper {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.ai-chat-input-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.ai-chat-input-container:focus-within {
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.ai-chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-md);
  color: var(--color-black);
  padding: var(--space-2);
}

.ai-chat-input::placeholder {
  color: var(--color-gray-500);
}

.ai-chat-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ai-chat-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background-color: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.ai-chat-submit-btn:hover:not(:disabled) {
  background-color: var(--color-gray-700);
  transform: translateY(-1px);
}

.ai-chat-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.ai-chat-submit-btn:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .ai-chat-input-wrapper {
    padding: 0 var(--space-3);
  }

  .ai-chat-input-container {
    padding: var(--space-2);
  }

  .ai-chat-input {
    font-size: var(--font-size-sm);
  }
}
</style>
