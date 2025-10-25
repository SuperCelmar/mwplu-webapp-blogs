// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { errorHandlerPlugin } from './services/errorHandler'
import { useAuthStore } from '@/stores/auth'
import { useAnalytics } from '@/composables/useAnalytics'
import { useUIStore } from '@/stores/ui'
import './services/firebase' // Initialize Firebase Analytics

// Import global styles
import './styles/variables.css'
import './styles/reset.css'
import './styles/base.css'
import './styles/focus.css'
import './styles/utilities.css'
import './styles/forms.css'
import './styles/buttons.css'
import './styles/messages.css'

const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
app.use(pinia)

// Setup Router
app.use(router)

// Setup global error handling
app.use(errorHandlerPlugin)

// Initialize auth store and setup auth listener
const initializeApp = async () => {
  const authStore = useAuthStore()
  const { initialize: initializeAnalytics } = useAnalytics()
  const uiStore = useUIStore()

  // Setup auth state change listener
  authStore.setupAuthListener()

  // Initialize auth state (check for existing session)
  await authStore.initializeAuth()

  // Initialize analytics
  initializeAnalytics()

  // Initialize and apply theme
  uiStore.initializeTheme()

  // Mount app after auth initialization
  app.mount('#app')
}

// Initialize the app
initializeApp().catch((error) => {
  console.error('Failed to initialize app:', error)
  // Mount app anyway to show error state
  app.mount('#app')
})
