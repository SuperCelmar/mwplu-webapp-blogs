<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <div class="auth-header">
          <h2 class="auth-title">Confirmation de votre email</h2>
        </div>

        <div class="confirmation-card">
          <div class="confirmation-icon">
            <img src="@/assets/icons/elements/confirmation.svg" alt="Confirmation icon" class="confirmation-icon" />
          </div>

          <div class="confirmation-content">
            <p class="confirmation-content-text">
              Nous avons envoyé un lien de confirmation à votre adresse email.
              Cliquez sur le lien dans l'email pour activer votre compte.
            </p>

            <div class="confirmation-info card-light">
              <h4 class="confirmation-info-title">Vous n'avez pas reçu l'email ?</h4>
              <ul class="confirmation-info-list">
                <li>Vérifiez votre dossier de courriers indésirables</li>
                <li>Assurez-vous que l'adresse email est correcte</li>
                <li>Vous disposez d'un délai de 15 minutes pour activer votre compte</li>
              </ul>
            </div>

            <div class="confirmation-actions">
              <button @click="resendConfirmation" :disabled="isResending || !canResend" class="btn btn-primary">
                <BaseSpinner v-if="isResending" size="small" color="white" />
                {{ isResending ? 'Envoi...' : 'Renvoyer l\'email' }}
              </button>

              <router-link to="/signup" class="btn btn-secondary">
                Retour à la création de compte
              </router-link>
            </div>

            <!-- Success/Error Messages -->
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>

            <div v-if="errorMessage" class="alert alert-error">
              {{ errorMessage }}
            </div>

            <div v-if="!canResend" class="alert alert-info">
              Vous pourrez renvoyer l'email dans {{ countdown }} secondes
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Composables
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// Local state
const isResending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const canResend = ref(true)
const countdown = ref(0)
let countdownInterval = null

// Get email from query params or auth store
const userEmail = route.query.email || authStore.userEmail || ''

// Countdown for resend cooldown
const startCountdown = () => {
  canResend.value = false
  countdown.value = 60

  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canResend.value = true
      clearInterval(countdownInterval)
    }
  }, 1000)
}

// Resend confirmation email
const resendConfirmation = async () => {
  if (!userEmail) {
    uiStore.showNotification('Aucune adresse email trouvée pour le renvoi.', 'error')
    return
  }

  isResending.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const result = await authStore.resendConfirmation(userEmail)

    if (result.success) {
      uiStore.showNotification(result.message || 'Email de confirmation renvoyé avec succès.', 'success')
      successMessage.value = result.message
      startCountdown()
    } else {
      errorMessage.value = result.error || 'Erreur lors de l\'envoi de l\'email de confirmation.'
      uiStore.showNotification(errorMessage.value, 'error')
    }
  } catch (error) {
    console.error('Resend confirmation error:', error)
    errorMessage.value = 'Une erreur inattendue est survenue lors du renvoi de l\'email.'
    uiStore.showNotification(errorMessage.value, 'error')
  } finally {
    isResending.value = false
  }
}

// Cleanup
onMounted(() => {
  // Start with initial cooldown to prevent spam
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.auth-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: var(--space-6) var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: var(--space-2);
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
}

.auth-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  line-height: 1.5;
}

/* Confirmation Card */
.confirmation-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  text-align: center;
}

.confirmation-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
}

.confirmation-content-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-2);
}

.confirmation-content-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.confirmation-info {
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  text-align: left;
  margin-bottom: var(--space-6);
}

.confirmation-info-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-3);
}

.confirmation-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.6;
}

.confirmation-info-list li {
  margin-bottom: var(--space-2);
  position: relative;
  padding-left: var(--space-4);
}

.confirmation-info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-blue);
  font-weight: var(--font-weight-bold);
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

/* Alerts (Success/Error/Info) */
.alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  margin-top: var(--space-4);
  text-align: center;
}

.alert-success {
  background-color: var(--color-green-50);
  color: var(--color-green-700);
  border: 1px solid var(--color-green-200);
}

.alert-error {
  background-color: var(--color-red-50);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-200);
}

.alert-info {
  background-color: var(--color-blue-50);
  color: var(--color-blue-700);
  border: 1px solid var(--color-blue-200);
}

/* General Button Styles (for this page) */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 100%;
  /* Full width buttons */
}

.btn-primary {
  background-color: var(--color-black);
  color: var(--color-white);
  border: 1px solid var(--color-black);
}

.btn-primary:hover {
  background-color: var(--color-gray-500);
  border-color: var(--color-gray-500);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .auth-page-wrapper {
    padding: var(--space-4);
  }

  .auth-container {
    padding: var(--space-6);
    gap: var(--space-6);
  }

  .auth-title {
    font-size: var(--font-size-xl);
  }

  .auth-subtitle {
    font-size: var(--font-size-sm);
  }

  .confirmation-card {
    padding: var(--space-6);
  }

  .confirmation-content-title {
    font-size: var(--font-size-lg);
  }

  .confirmation-content-text {
    font-size: var(--font-size-sm);
  }

  .confirmation-info {
    padding: var(--space-3);
  }

  .confirmation-info-title {
    font-size: var(--font-size-sm);
  }

  .confirmation-info-list {
    font-size: var(--font-size-xs);
  }

  .alert {
    font-size: var(--font-size-xs);
    padding: var(--space-2) var(--space-3);
  }
}
</style>
