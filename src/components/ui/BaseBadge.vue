<template>
  <span :class="['base-badge', `base-badge--${variant}`, { 'base-badge--clickable': clickable }]" @click="handleClick">
    <slot></slot>
  </span>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'secondary', 'outline', 'success', 'warning', 'error'].includes(value),
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.base-badge--clickable {
  cursor: pointer;
}

.base-badge--clickable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.base-badge--default {
  background-color: var(--color-black);
  color: var(--color-white);
  border: 1px solid var(--color-black);
}

.base-badge--secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-200);
}

.base-badge--outline {
  background-color: transparent;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.base-badge--success {
  background-color: var(--color-green-50);
  color: var(--color-green-700);
  border: 1px solid var(--color-green-200);
}

.base-badge--warning {
  background-color: var(--color-yellow-50);
  color: var(--color-yellow-700);
  border: 1px solid var(--color-yellow-200);
}

.base-badge--error {
  background-color: var(--color-red-50);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-200);
}
</style>
