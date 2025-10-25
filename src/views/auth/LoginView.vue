<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <!-- Header -->
        <div class="auth-header">
          <h2 class="auth-title">Connexion</h2>
          <p class="auth-subtitle">Accédez à votre compte MWPLU</p>
        </div>

        <!-- Single column form -->
        <div class="login-form-container">
          <form @submit.prevent="handleSubmit" class="login-form-inner">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">
                Adresse e-mail
                <span class="required">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="votre@email.com"
                required
                autocomplete="email"
                @blur="validateEmail"
                @input="clearFieldError('email')"
              />
              <span v-if="errors.email" class="error-message">
                {{ errors.email }}
              </span>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password" class="form-label">
                Mot de passe
                <span class="required">*</span>
              </label>
              <div class="password-input-container">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  :class="{ 'error': errors.password }"
                  placeholder="Votre mot de passe"
                  required
                  autocomplete="current-password"
                  @blur="validatePassword"
                  @input="clearFieldError('password')"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="password-toggle"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="errors.password" class="error-message">
                {{ errors.password }}
              </span>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <label class="checkbox-container">
                <input
                  v-model="form.rememberMe"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="checkmark"></span>
                <span class="checkbox-label">Se souvenir de moi</span>
              </label>
              
              <button
                type="button"
                @click="handleForgotPassword"
                class="link-button"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <!-- Turnstile CAPTCHA -->
            <TurnstileWidget
              v-if="showCaptcha"
              :site-key="turnstileSiteKey"
              @verified="onCaptchaVerified"
              @error="onCaptchaError"
              @expired="onCaptchaExpired"
            />

            <!-- Global Error Message -->
            <div v-if="globalError" class="global-error">
              {{ globalError }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-button"
              :disabled="!canSubmit"
            >
              <BaseSpinner v-if="isLoading" size="small" color="white" />
              <span v-else>Se connecter</span>
            </button>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-text">ou</span>
            </div>

            <!-- Google Sign In Button -->
            <button
              type="button"
              @click="handleGoogleSignIn"
              class="social-button google-button"
              :disabled="isLoading"
            >
              <img src="@/assets/icons/socials/google.svg" alt="Google" class="social-icon" />
              <span>Continuer avec Google</span>
            </button>

            <!-- Navigation Links -->
            <div class="auth-navigation-links">
              <p class="nav-text">
                Pas encore de compte ?
                <router-link to="/signup" class="nav-link">
                  Créer un compte
                </router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
/**
 * LoginView Component
 * @description Complete login page with validation, CAPTCHA, and auth integration
 *
 * Why this pattern:
 * - Full page view for login functionality
 * - Handles all validation and error states
 * - Integrates with Pinia auth store
 *
 * Form Validation Strategy:
 * - Real-time validation on blur for better UX
 * - Clear errors on input to avoid frustration
 * - Global error handling for auth failures
 * - CAPTCHA integration for security
 *
 * Communication:
 * - Uses Pinia auth store for login logic
 * - Direct router navigation on success
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import TurnstileWidget from '@/components/common/TurnstileWidget.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'LoginView',

  components: {
    AppLayout,
    TurnstileWidget,
    BaseSpinner
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Form data - reactive for two-way binding
    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    // Validation and UI state
    const errors = reactive({})
    const globalError = ref('')
    const showPassword = ref(false)
    const showCaptcha = ref(true) // Always show for security
    const captchaToken = ref('')
    const isLoading = ref(false)

    // Environment variables
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

    /**
     * Email validation
     * Uses HTML5 email pattern + additional checks
     */
    const validateEmail = () => {
      const email = form.email.trim()
      if (!email) {
        errors.email = 'L\'adresse e-mail est requise'
        return false
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email)) {
        errors.email = 'Format d\'e-mail invalide'
        return false
      }

      if (email.length > 254) {
        errors.email = 'L\'adresse e-mail est trop longue'
        return false
      }

      delete errors.email
      return true
    }

    /**
     * Password validation
     * Basic validation for login (not as strict as signup)
     */
    const validatePassword = () => {
      const password = form.password
      if (!password) {
        errors.password = 'Le mot de passe est requis'
        return false
      }

      if (password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        return false
      }

      delete errors.password
      return true
    }

    /**
     * Clear specific field error
     * Called when user starts typing to remove error state
     */
    const clearFieldError = (field) => {
      delete errors[field]
      if (globalError.value) {
        globalError.value = ''
      }
    }

    /**
     * Toggle password visibility
     * Improves UX by letting users see what they're typing
     */
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    /**
     * Check if form can be submitted
     * All validation must pass + CAPTCHA verified
     */
    const canSubmit = computed(() => {
      return validateEmail() &&
             validatePassword() &&
             captchaToken.value &&
             !isLoading.value
    })

    /**
     * CAPTCHA event handlers
     */
    const onCaptchaVerified = (token) => {
      captchaToken.value = token
      globalError.value = ''
    }

    const onCaptchaError = (error) => {
      captchaToken.value = ''
      globalError.value = `Erreur de vérification: ${error}`
    }

    const onCaptchaExpired = () => {
      captchaToken.value = ''
      globalError.value = 'La vérification a expiré. Veuillez recommencer.'
    }

    /**
     * Handle forgot password
     * Emits event to parent component
     */
    const handleForgotPassword = () => {
      router.push({
        name: 'reset-password',
        query: { email: form.email || undefined }
      })
    }

    /**
     * Handle form submission
     * Main login logic with comprehensive error handling
     */
    const handleSubmit = async () => {
      // Final validation check
      if (!validateEmail() || !validatePassword()) {
        globalError.value = 'Veuillez corriger les erreurs ci-dessus'
        return
      }

      if (!captchaToken.value) {
        globalError.value = 'Veuillez compléter la vérification'
        return
      }

      try {
        isLoading.value = true
        globalError.value = ''

        // Call auth store login method
        const result = await authStore.login(form.email, form.password)

        if (result.success) {
          // Navigate to dashboard or intended route
          const redirect = router.currentRoute.value.query.redirect || '/dashboard'
          await router.push(redirect)
        } else {
          // Handle login failure
          globalError.value = result.error || 'Échec de la connexion'

          // Don't clear captcha token for login failures - user can retry immediately
          // Don't clear password field - let user see what they typed and correct it
          // Only clear on successful login or major errors
        }

      } catch (error) {
        console.error('Login submission error:', error)
        globalError.value = 'Une erreur inattendue s\'est produite'
        // Clear captcha and password only for unexpected errors
        captchaToken.value = ''
        form.password = ''
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Handle Google sign-in
     */
    const handleGoogleSignIn = async () => {
      try {
        isLoading.value = true
        globalError.value = ''

        const result = await authStore.signInWithGoogle()

        if (result.success) {
          // Google OAuth redirects automatically, so we don't need to handle navigation here
          const redirect = router.currentRoute.value.query.redirect || '/dashboard'
          await router.push(redirect)
        } else {
          globalError.value = result.error || 'Échec de la connexion avec Google'
        }
      } catch (error) {
        console.error('Google sign-in error:', error)
        globalError.value = 'Une erreur inattendue s\'est produite avec Google'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Initialize component
     * Setup any needed initial state
     */
    onMounted(() => {
      // Clear any existing auth errors
      authStore.clearError()

      // Focus email field for better UX
      const emailInput = document.getElementById('email')
      if (emailInput) {
        emailInput.focus()
      }
    })

    // Expose to template
    return {
      form,
      errors,
      globalError,
      showPassword,
      showCaptcha,
      captchaToken,
      isLoading,
      turnstileSiteKey,
      canSubmit,
      validateEmail,
      validatePassword,
      clearFieldError,
      togglePasswordVisibility,
      onCaptchaVerified,
      onCaptchaError,
      onCaptchaExpired,
      handleForgotPassword,
      handleSubmit,
      handleGoogleSignIn
    }
  }
}
</script>

<style scoped>
/* Main wrapper for the authentication page */
.auth-page-wrapper {
  display: flex;
  min-height: 80vh;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 364px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
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
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0;
}

.auth-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-2) 0;
}

.auth-subtitle {
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.5;
}

/* Single column layout */
.login-form-container {
  max-width: 400px;
  margin: 0 auto;
}

.social-button {
  width: 100%;
  padding: var(--space-3);
  background-color: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.social-button:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
  box-shadow: var(--shadow-sm);
}

.social-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-icon {
  width: 18px;
  height: 18px;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: var(--space-4) 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-gray-200);
}

.divider-text {
  background-color: var(--color-white);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  padding: 0 var(--space-4);
  position: relative;
}

.login-form-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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

.required {
  color: var(--color-error);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  background-color: var(--color-white);
  color: var(--color-gray-900);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-input.error {
  border-color: var(--color-error);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: var(--space-10);
}

.password-toggle {
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  border: none;
  background: transparent;
  padding: 0 var(--space-3);
  cursor: pointer;
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 18px;
  width: 18px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  transition: background-color var(--transition-fast);
  margin-right: var(--space-3);
  flex-shrink: 0;
}

.checkbox-container:hover .checkmark {
  border-color: var(--color-gray-400);
}

.checkbox:checked ~ .checkmark {
  background-color: var(--color-blue);
  border-color: var(--color-blue);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid var(--color-white);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label {
  color: var(--color-gray-600);
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-blue);
  text-decoration: underline;
  cursor: pointer;
}

/* Submit Button */
.submit-button {
  width: 100%;
  background-color: var(--color-black);
  color: var(--color-white);
  border: 2px solid var(--color-black);
  padding: var(--space-3);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  gap: var(--space-2);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-gray-800);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Remove old button spinner styles */
.button-spinner {
  display: none;
}

/* Messages */
.global-error {
  padding: var(--space-4);
  border-radius: var(--radius-form);
  font-size: var(--font-size-sm);
  text-align: center;
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  border: 1px solid var(--color-error);
}

/* Navigation */
.auth-navigation-links {
  text-align: center;
}

.nav-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.nav-link {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.nav-link:hover {
  text-decoration: underline;
}

/* Animations removed - no longer needed */

/* Responsive Styles */
@media (max-width: 768px) {
  .auth-container {
    padding: var(--space-6);
    gap: var(--space-4);
  }

  .auth-title {
    font-size: var(--font-size-lg);
  }
  .auth-subtitle {
    font-size: var(--font-size-sm);
  }

  .login-form-container {
    max-width: none;
  }
}
</style>
