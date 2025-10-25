<template>
  <div :class="['card-component', variant]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined'].includes(value),
  },
})
</script>

<style scoped>
.card-component {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  transition: all var(--transition-fast);
}

.card-component.default {
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
}

.card-component.elevated {
  border: none;
  box-shadow: var(--shadow-md);
}

.card-component.outlined {
  border: 1px solid var(--color-gray-300);
  box-shadow: none;
}
</style>
