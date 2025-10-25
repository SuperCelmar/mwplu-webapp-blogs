<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <!-- Header -->
        <div class="auth-header">
          <div class="brand-logo">
            <h1 class="logo-text">MWPLU</h1>
          </div>
          <h2 class="auth-title">Réinitialiser le mot de passe</h2>
          <p class="auth-subtitle">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <!-- Reset Form -->
        <div class="auth-form-section">
          <!-- Recovery mode: set new password -->
          <form v-if="isRecovery" @submit.prevent="handleSetNewPassword" class="reset-password-form">
            <div class="form-group">
              <label for="new-password" class="form-label">Nouveau mot de passe</label>
              <input id="new-password" v-model="newPasswordForm.newPassword" type="password" required class="form-input"
                :class="{ 'input-error': errors.newPassword }" placeholder="Votre nouveau mot de passe"
                :disabled="isSubmitting" @input="onNewPasswordInput" @blur="validateNewPassword" />
              <div class="password-requirements-condensed">
                <ul class="requirements-list">
                  <li :class="{ 'met': newPasswordChecks.length }">8+ caractères</li>
                  <li :class="{ 'met': newPasswordChecks.uppercase }">1 majuscule</li>
                  <li :class="{ 'met': newPasswordChecks.lowercase }">1 minuscule</li>
                  <li :class="{ 'met': newPasswordChecks.number }">1 chiffre</li>
                </ul>
              </div>
              <span v-if="errors.newPassword" class="field-error">{{ errors.newPassword }}</span>
            </div>

            <div class="form-group">
              <label for="confirm-password" class="form-label">Confirmer le mot de passe</label>
              <input id="confirm-password" v-model="newPasswordForm.confirmPassword" type="password" required
                class="form-input" :class="{ 'input-error': errors.confirmPassword }"
                placeholder="Confirmez le mot de passe" :disabled="isSubmitting"
                @input="clearFieldError('confirmPassword')" @blur="validateConfirmNewPassword" />
              <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
            </div>

            <button type="submit" :disabled="!canSubmitNewPassword || isSubmitting"
              class="btn btn-primary btn-full-width">
              <BaseSpinner v-if="isSubmitting" size="small" color="white" />
              {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
            </button>
          </form>

          <!-- Request reset link mode -->
          <form v-else @submit.prevent="handleResetPassword" class="reset-password-form">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">Adresse email</label>
              <input id="email" v-model="form.email" type="email" required class="form-input"
                placeholder="votre@email.com" :disabled="isSubmitting" />
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="!form.email || isSubmitting" class="btn btn-primary btn-full-width">
              <BaseSpinner v-if="isSubmitting" size="small" color="white" />
              {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien' }}
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="emailSent && !isRecovery" class="alert alert-success">
            <div class="alert-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="alert-title">Email envoyé</h3>
              <p class="alert-message-text">Un lien de réinitialisation a été envoyé à <strong>{{ form.email }}</strong>
              </p>
              <p class="alert-help-text">Vérifiez votre boîte email et vos spams</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="auth-navigation-links">
            <router-link to="/login" class="nav-link">
              Retour à la connexion
            </router-link>
            <span class="nav-separator">•</span>
            <router-link to="/signup" class="nav-link">
              Créer un compte
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'ResetPasswordView',

  components: {
    AppLayout,
    BaseSpinner
  },

  setup() {
    const authStore = useAuthStore()
    const uiStore = useUIStore()

    const isSubmitting = ref(false)
    const emailSent = ref(false)
    const isRecovery = ref(false)

    const form = reactive({
      email: ''
    })

    const newPasswordForm = reactive({
      newPassword: '',
      confirmPassword: ''
    })

    const errors = reactive({})

    const newPasswordChecks = computed(() => {
      const pwd = newPasswordForm.newPassword || ''
      return {
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /\d/.test(pwd),
      }
    })

    const validateNewPassword = () => {
      const pwd = newPasswordForm.newPassword
      if (!pwd) {
        errors.newPassword = 'Le mot de passe est requis'
        return false
      }
      const checks = newPasswordChecks.value
      if (!checks.length) {
        errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
        return false
      }
      if (!checks.uppercase) {
        errors.newPassword = 'Le mot de passe doit contenir au moins une majuscule'
        return false
      }
      if (!checks.lowercase) {
        errors.newPassword = 'Le mot de passe doit contenir au moins une minuscule'
        return false
      }
      if (!checks.number) {
        errors.newPassword = 'Le mot de passe doit contenir au moins un chiffre'
        return false
      }
      delete errors.newPassword
      return true
    }

    const validateConfirmNewPassword = () => {
      if (!newPasswordForm.confirmPassword) {
        errors.confirmPassword = 'Veuillez confirmer votre mot de passe'
        return false
      }
      if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        return false
      }
      delete errors.confirmPassword
      return true
    }

    const onNewPasswordInput = () => {
      clearFieldError('newPassword')
      if (newPasswordForm.confirmPassword) {
        validateConfirmNewPassword()
      }
    }

    const clearFieldError = (field) => {
      delete errors[field]
    }

    const canSubmitNewPassword = computed(() => {
      return validateNewPassword() && validateConfirmNewPassword() && !isSubmitting.value
    })

    const handleResetPassword = async () => {
      if (!form.email) return

      isSubmitting.value = true

      try {
        const { error } = await authStore.resetPassword(form.email)
        if (error) {
          throw error
        }
        emailSent.value = true
        uiStore.showNotification('Email de réinitialisation envoyé.', 'success')
      } catch (error) {
        console.error('Reset password error:', error)
        uiStore.showNotification(`Erreur lors de l'envoi de l'email : ${error.message || error.description || 'Une erreur inattendue est survenue.'}`, 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    const detectRecovery = () => {
      // Supabase redirects with hash parameters: #access_token=...&type=recovery
      const hash = window.location.hash || ''
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const type = params.get('type')
      isRecovery.value = type === 'recovery'
    }

    const handleSetNewPassword = async () => {
      if (!validateNewPassword() || !validateConfirmNewPassword()) return
      isSubmitting.value = true
      try {
        const { error } = await authStore.updatePassword(newPasswordForm.newPassword)
        if (error) throw error
        uiStore.showNotification('Votre mot de passe a été mis à jour.', 'success')
        // Clear form
        newPasswordForm.newPassword = ''
        newPasswordForm.confirmPassword = ''
      } catch (error) {
        console.error('Set new password error:', error)
        const message = (error && error.message) || (error && error.description) || ''
        // Surface common server message patterns (e.g., same password)
        const normalized = String(message)
        const friendly = normalized.includes('same as the previous') || normalized.includes('previously used')
          ? 'Le nouveau mot de passe ne peut pas être identique à l\'ancien.'
          : (message || 'Une erreur inattendue est survenue.')
        // Also map basic length rule if backend returns it
        if (!errors.newPassword && normalized.includes('at least 6')) {
          errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
        }
        uiStore.showNotification(`Erreur lors de la mise à jour : ${friendly}`, 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      detectRecovery()
    })

    return {
      form,
      isSubmitting,
      emailSent,
      isRecovery,
      newPasswordForm,
      errors,
      newPasswordChecks,
      validateNewPassword,
      validateConfirmNewPassword,
      clearFieldError,
      onNewPasswordInput,
      canSubmitNewPassword,
      handleResetPassword,
      handleSetNewPassword
    }
  }
}
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
  max-width: 400px;
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
}

.brand-logo {
  margin-bottom: var(--space-4);
}

.logo-text {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-color-black);
  letter-spacing: -0.02em;
  margin: 0;
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.auth-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.5;
}

/* Form Section */
.auth-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  background-color: var(--color-white);
  font-size: var(--font-size-md);
  color: var(--color-color-black);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.form-input:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

/* Inline error styles for recovery form */
.input-error {
  border-color: var(--color-red-500);
}

.field-error {
  color: var(--color-red-600);
  font-size: var(--font-size-sm);
}

.password-requirements-condensed {
  margin-top: var(--space-2);
}

.password-requirements-condensed .requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.password-requirements-condensed .requirements-list li {
  position: relative;
  padding-left: 16px;
}

.password-requirements-condensed .requirements-list li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: var(--color-red-500);
  font-weight: var(--font-weight-bold);
}

.password-requirements-condensed .requirements-list li.met {
  color: var(--color-green-600);
}

.password-requirements-condensed .requirements-list li.met::before {
  content: '✓';
  color: var(--color-green-600);
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  margin-top: var(--space-4);
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

.alert-icon {
  flex-shrink: 0;
  width: var(--space-5);
  height: var(--space-5);
  color: var(--color-green-500);
}

.alert-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-1);
}

.alert-message-text,
.alert-help-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
}

.alert-message-text strong {
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
}

/* Navigation */
.auth-navigation-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
}

.nav-link {
  color: var(--color-blue);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-blue-dark);
  text-decoration: underline;
}

.nav-link:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
  border-radius: var(--radius-button);
}

.nav-separator {
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
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
  gap: var(--space-2);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--color-blue);
  color: var(--color-white);
  border-color: var(--color-blue);
}

.btn-primary:hover {
  background-color: var(--color-blue-dark);
  border-color: var(--color-blue-dark);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-color-black);
  border-color: var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.btn-full-width {
  width: 100%;
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

  .logo-text {
    font-size: var(--font-size-2xl);
  }

  .auth-title {
    font-size: var(--font-size-xl);
    margin-top: var(--space-3);
  }

  .auth-subtitle {
    font-size: var(--font-size-sm);
  }

  .alert {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
  }

  .alert-icon {
    width: var(--space-4);
    height: var(--space-4);
  }

  .alert-title {
    font-size: var(--font-size-sm);
    margin-bottom: 0;
  }

  .alert-message-text,
  .alert-help-text {
    font-size: var(--font-size-xs);
  }

  .auth-navigation-links {
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-4);
    padding-top: var(--space-3);
  }

  .nav-link {
    font-size: var(--font-size-sm);
  }

  .nav-separator {
    display: none;
  }
}

/* Print Styles */
@media print {
  .auth-page-wrapper {
    display: none;
  }
}
</style>
