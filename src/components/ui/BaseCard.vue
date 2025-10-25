<template>
  <div :class="['base-card', { 'base-card--hover': hover }]">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </div>
    <div class="base-card__content">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hover: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.base-card {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
}

.base-card--hover {
  transition: all var(--transition-fast);
}

.base-card--hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.base-card__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.base-card__content {
  padding: var(--space-6);
}

.base-card__footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
}
</style>
