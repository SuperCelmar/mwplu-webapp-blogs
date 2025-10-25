<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['base-button', `base-button--${variant}`, `base-button--${size}`]"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'secondary', 'ghost', 'outline', 'danger'].includes(value),
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
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-button);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  height: 28px;
}

.base-button--md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-md);
  height: 36px;
}

.base-button--lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-lg);
  height: 44px;
}

.base-button--icon {
  padding: var(--space-2);
  width: 36px;
  height: 36px;
}

.base-button--icon.base-button--sm {
  width: 28px;
  height: 28px;
}

.base-button--default {
  background-color: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

.base-button--default:hover:not(:disabled) {
  background-color: var(--color-gray-700);
  border-color: var(--color-gray-700);
}

.base-button--secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border-color: var(--color-gray-200);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--color-gray-200);
  border-color: var(--color-gray-300);
}

.base-button--ghost {
  background-color: transparent;
  color: var(--color-gray-700);
  border-color: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.base-button--outline {
  background-color: transparent;
  color: var(--color-black);
  border-color: var(--color-gray-300);
}

.base-button--outline:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.base-button--danger {
  background-color: var(--color-red-600);
  color: var(--color-white);
  border-color: var(--color-red-600);
}

.base-button--danger:hover:not(:disabled) {
  background-color: var(--color-red-700);
  border-color: var(--color-red-700);
}
</style>
