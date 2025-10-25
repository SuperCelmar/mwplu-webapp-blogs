<template>
  <div :class="['chat-message', `chat-message--${message.role}`]">
    <div class="message-content">
      <div class="message-text" v-html="formattedMessage"></div>
      <div class="message-timestamp">{{ formatTime(message.created_at) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const formattedMessage = computed(() => {
  const text = props.message.message || ''
  return text.replace(/\n/g, '<br>')
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: var(--space-4);
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message--user {
  justify-content: flex-end;
}

.chat-message--assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 75%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-card);
  word-wrap: break-word;
}

.chat-message--user .message-content {
  background-color: var(--color-black);
  color: var(--color-white);
  border-bottom-right-radius: var(--space-1);
}

.chat-message--assistant .message-content {
  background-color: var(--color-gray-100);
  color: var(--color-black);
  border-bottom-left-radius: var(--space-1);
}

.message-text {
  font-size: var(--font-size-md);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.message-text :deep(br) {
  display: block;
  content: '';
  margin: var(--space-1) 0;
}

.message-timestamp {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  text-align: right;
}

.chat-message--user .message-timestamp {
  color: var(--color-gray-300);
}

.chat-message--assistant .message-timestamp {
  color: var(--color-gray-600);
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .message-text {
    font-size: var(--font-size-sm);
  }
}
</style>
