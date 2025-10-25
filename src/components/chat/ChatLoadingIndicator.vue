<template>
  <div class="chat-loading-indicator">
    <div class="chat-loading-indicator__avatar">
      <div class="avatar avatar--assistant">
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
    <div class="chat-loading-indicator__content">
      <div class="chat-loading-indicator__bubbles">
        <span class="bubble"></span>
        <span class="bubble"></span>
        <span class="bubble"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.chat-loading-indicator {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chat-loading-indicator__avatar {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar--assistant {
  background-color: var(--color-gray-100);
  padding: 4px;
}

.avatar--assistant svg {
  width: 100%;
  height: 100%;
}

.chat-loading-indicator__content {
  display: flex;
  align-items: center;
}

.chat-loading-indicator__bubbles {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-button);
  border-bottom-left-radius: 4px;
}

.bubble {
  width: 8px;
  height: 8px;
  background-color: var(--color-gray-500);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.bubble:nth-child(1) {
  animation-delay: -0.32s;
}

.bubble:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
