<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="`Basculer en mode ${nextLabel}`"
    @click="toggleTheme"
    data-test="theme-toggle"
  >
    <span v-if="isDark" class="icon">☾</span>
    <span v-else class="icon">☀</span>
    <span class="label">{{ isDark ? 'Sombre' : 'Clair' }}</span>
  </button>
  
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const effectiveTheme = computed(() => {
  if (ui.theme === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return ui.theme
})

const isDark = computed(() => effectiveTheme.value === 'dark')
const nextLabel = computed(() => (isDark.value ? 'clair' : 'sombre'))

const toggleTheme = () => {
  ui.setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-gray, #e5e7eb);
  background: var(--color-white);
  color: var(--color-black);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.theme-toggle:hover {
  background: rgba(0,0,0,0.04);
}
.icon {
  font-size: 14px;
  line-height: 1;
}
.label {
  font-size: 14px;
}
[data-theme="dark"] .theme-toggle {
  background: var(--mobile-nav-bg);
  border-color: var(--header-border);
}
[data-theme="dark"] .theme-toggle:hover {
  background: rgba(255,255,255,0.06);
}
</style>



