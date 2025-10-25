<template>
  <div :class="['badge-component', variant, size]" @click="handleClick">
    <slot />
  </div>
</template>

<script setup>
const emit = defineEmits(['click'])

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'secondary', 'outline', 'success', 'warning', 'error'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const handleClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
.badge-component {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
  white-space: nowrap;
}

.badge-component.sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
}

.badge-component.md {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
}

.badge-component.lg {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-md);
}

.badge-component.default {
  background-color: var(--color-black);
  color: var(--color-white);
}

.badge-component.secondary {
  background-color: var(--color-gray-200);
  color: var(--color-gray-800);
}

.badge-component.outline {
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-700);
}

.badge-component.success {
  background-color: var(--color-green-100);
  color: var(--color-green-700);
}

.badge-component.warning {
  background-color: var(--color-yellow-100);
  color: var(--color-yellow-700);
}

.badge-component.error {
  background-color: var(--color-red-100);
  color: var(--color-red-700);
}

.badge-component:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.badge-component:active {
  transform: translateY(0);
}
</style>
