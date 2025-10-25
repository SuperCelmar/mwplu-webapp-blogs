<template>
  <textarea
    :class="['textarea-component', { 'has-error': error }]"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows"
    :maxlength="maxlength"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 3,
  },
  maxlength: {
    type: Number,
    default: null,
  },
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.textarea-component {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  font-family: inherit;
  color: var(--color-black);
  background-color: var(--color-white);
  resize: vertical;
  transition: all var(--transition-fast);
  line-height: 1.5;
}

.textarea-component:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.textarea-component:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.textarea-component.has-error {
  border-color: var(--color-red-600);
}

.textarea-component.has-error:focus {
  border-color: var(--color-red-600);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea-component::placeholder {
  color: var(--color-gray-500);
}
</style>
