<template>
  <div :class="['chat-message-bubble', `chat-message-bubble--${role}`]">
    <div class="chat-message-bubble__avatar">
      <div v-if="role === 'user'" class="avatar avatar--user">
        {{ userInitials }}
      </div>
      <div v-else class="avatar avatar--assistant">
        <svg
          fill="none"
          height="24"
          viewBox="0 0 48 48"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#0A0D12" height="48" rx="12" width="48" />
          <path
            clip-rule="evenodd"
            d="m6 24c11.4411 0 18-6.5589 18-18 0 11.4411 6.5589 18 18 18-11.4411 0-18 6.5589-18 18 0-11.4411-6.5589-18-18-18z"
            fill="url(#gradient)"
            fill-rule="evenodd"
          />
          <defs>
            <linearGradient id="gradient" x1="24" x2="24" y1="6" y2="42">
              <stop offset="0" stop-color="#fff" stop-opacity="0.8" />
              <stop offset="1" stop-color="#fff" stop-opacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    <div class="chat-message-bubble__content">
      <div class="chat-message-bubble__text">{{ message }}</div>
      <div class="chat-message-bubble__time">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (value) => ['user', 'assistant'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: [String, Date],
    default: () => new Date(),
  },
  userName: {
    type: String,
    default: '',
  },
})

const userInitials = computed(() => {
  if (!props.userName) return 'U'
  const names = props.userName.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return props.userName.substring(0, 2).toUpperCase()
})

const formattedTime = computed(() => {
  const date = new Date(props.timestamp)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})
</script>

<style scoped>
.chat-message-bubble {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  animation: slideIn 0.3s ease-out;
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

.chat-message-bubble--user {
  flex-direction: row-reverse;
}

.chat-message-bubble__avatar {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.avatar--user {
  background-color: var(--color-black);
  color: var(--color-white);
}

.avatar--assistant {
  background-color: var(--color-gray-100);
  padding: 4px;
}

.avatar--assistant svg {
  width: 100%;
  height: 100%;
}

.chat-message-bubble__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: 70%;
}

.chat-message-bubble--user .chat-message-bubble__content {
  align-items: flex-end;
}

.chat-message-bubble__text {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-message-bubble--user .chat-message-bubble__text {
  background-color: var(--color-black);
  color: var(--color-white);
  border-bottom-right-radius: 4px;
}

.chat-message-bubble--assistant .chat-message-bubble__text {
  background-color: var(--color-gray-100);
  color: var(--color-black);
  border-bottom-left-radius: 4px;
}

.chat-message-bubble__time {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  padding: 0 var(--space-2);
}

@media (max-width: 768px) {
  .chat-message-bubble__content {
    max-width: 85%;
  }
}
</style>
