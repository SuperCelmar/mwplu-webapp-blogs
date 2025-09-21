<template>
  <div
    v-if="show"
    :style="containerStyle"
  >
    <div :style="rowStyle">
      <svg :style="iconStyle" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div :style="textStyle">
        <p :style="titleStyle">Dev-only: Supabase config missing</p>
        <p :style="bodyStyle">
          Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to use the app locally.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isSupabaseConfigured: { type: Boolean, required: true },
})

const show = computed(() => import.meta.env.DEV && !props.isSupabaseConfigured)

// Detect system theme (light/dark)
const isDark = ref(false)
onMounted(() => {
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
  if (mq) {
    isDark.value = mq.matches
    const handler = (e) => (isDark.value = e.matches)
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
    // Save remover
    cleanup = () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler)
    }
  }
})

let cleanup = () => {}
onUnmounted(() => cleanup())

// Inline styles to avoid accidental global CSS overrides
const containerStyle = computed(() => ({
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  zIndex: 9999,
  maxWidth: '360px',
  width: 'calc(100vw - 32px)',
  background: isDark.value ? '#111827' : '#ffffff',
  boxShadow: isDark.value
    ? '0 10px 15px -3px rgba(0,0,0,0.6), 0 4px 6px -2px rgba(0,0,0,0.5)'
    : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  borderRadius: '8px',
  border: isDark.value ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.08)',
  padding: '10px 12px',
}))

const rowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
}

const iconStyle = computed(() => ({
  width: '16px',
  height: '16px',
  color: '#ef4444',
  flex: '0 0 16px',
}))

const textStyle = computed(() => ({
  fontSize: '12px',
  lineHeight: 1.3,
  color: isDark.value ? '#f9fafb' : '#111827',
}))

const titleStyle = {
  fontWeight: 600,
  margin: 0,
}

const bodyStyle = {
  margin: '4px 0 0 0',
}
</script>
