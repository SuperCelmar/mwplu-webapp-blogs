<template>
  <button
    :class="['button-component', variant, size]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <BaseSpinner v-if="loading" size="small" class="button-spinner" />
    <slot v-else />
  </button>
</template>

<script setup>
import BaseSpinner from '@/components/common/BaseSpinner.vue'

const emit = defineEmits(['click'])

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'ghost', 'outline', 'danger', 'link'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'icon'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
})

const handleClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
.button-component {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-button);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  text-decoration: none;
  font-family: inherit;
}

.button-component:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-component.sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.button-component.md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-md);
}

.button-component.lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-lg);
}

.button-component.icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
}

.button-component.primary {
  background-color: var(--color-black);
  color: var(--color-white);
}

.button-component.primary:hover:not(:disabled) {
  background-color: var(--color-gray-700);
}

.button-component.secondary {
  background-color: var(--color-gray-200);
  color: var(--color-black);
}

.button-component.secondary:hover:not(:disabled) {
  background-color: var(--color-gray-300);
}

.button-component.ghost {
  background-color: transparent;
  color: var(--color-gray-700);
}

.button-component.ghost:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.button-component.outline {
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  color: var(--color-black);
}

.button-component.outline:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.button-component.danger {
  background-color: var(--color-red-600);
  color: var(--color-white);
}

.button-component.danger:hover:not(:disabled) {
  background-color: var(--color-red-700);
}

.button-component.link {
  background-color: transparent;
  color: var(--color-black);
  text-decoration: underline;
  padding: 0;
}

.button-component.link:hover:not(:disabled) {
  opacity: 0.8;
}

.button-spinner {
  width: 16px;
  height: 16px;
}
</style>
