<template>
  <div class="chat-header">
    <div class="header-content">
      <div class="header-icon">
        <MessageSquare :size="20" />
      </div>
      <div class="header-info">
        <h3 class="header-title">Assistant PLU</h3>
        <p v-if="documentName" class="header-subtitle">{{ documentName }}</p>
      </div>
    </div>
    <div class="header-actions">
      <Button variant="ghost" size="icon" @click="handleClear" title="Nouvelle conversation">
        <RotateCcw :size="18" />
      </Button>
      <Button variant="ghost" size="icon" @click="handleClose" title="Fermer">
        <X :size="18" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, X, RotateCcw } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const emit = defineEmits(['close', 'clear'])

defineProps({
  documentName: {
    type: String,
    default: '',
  },
})

const handleClose = () => {
  emit('close')
}

const handleClear = () => {
  if (confirm('Êtes-vous sûr de vouloir commencer une nouvelle conversation ?')) {
    emit('clear')
  }
}
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  border-top-left-radius: var(--radius-card);
  border-top-right-radius: var(--radius-card);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: 50%;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .chat-header {
    padding: var(--space-3);
  }

  .header-icon {
    width: 36px;
    height: 36px;
  }

  .header-title {
    font-size: var(--font-size-sm);
  }

  .header-subtitle {
    font-size: var(--font-size-xs);
  }
}
</style>
