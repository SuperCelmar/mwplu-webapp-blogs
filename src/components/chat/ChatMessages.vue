<template>
  <div ref="messagesContainer" class="chat-messages">
    <ChatMessageBubble
      v-for="message in messages"
      :key="message.id"
      :role="message.role"
      :message="message.message"
      :timestamp="message.created_at"
      :user-name="userName"
    />
    <ChatLoadingIndicator v-if="isLoading" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import ChatMessageBubble from './ChatMessageBubble.vue'
import ChatLoadingIndicator from './ChatLoadingIndicator.vue'

const props = defineProps({
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
    default: '',
  },
})

const messagesContainer = ref(null)

const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }
}

watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => props.isLoading,
  () => {
    scrollToBottom()
  }
)

defineExpose({
  scrollToBottom,
})
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 300px;
  max-height: 500px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

@media (max-width: 768px) {
  .chat-messages {
    max-height: 400px;
  }
}
</style>
