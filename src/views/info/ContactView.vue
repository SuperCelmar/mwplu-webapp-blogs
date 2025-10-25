<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="main-content">
      <section class="page-header-section">
        <h1 class="page-title">Contactez-nous</h1>
        <p class="page-subtitle">
          Une question ? Besoin d'aide ? Notre équipe est là pour vous aider.
        </p>
      </section>

      <div class="contact-content-grid">
        <!-- Contact Form Section -->
        <section class="contact-form-section">
          <form @submit.prevent="handleSubmit" class="contact-form card">
            <h3 class="form-title">Envoyez-nous un message</h3>
            <!-- Name Field -->
            <div class="form-group">
              <label for="name" class="form-label">Nom complet *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="form-input"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">Adresse email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="form-input"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Subject Field -->
            <div class="form-group">
              <label for="subject" class="form-label">Sujet *</label>
              <select
                id="subject"
                v-model="form.subject"
                required
                class="form-input"
                :disabled="isSubmitting"
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="question">Question générale</option>
                <option value="bug">Signaler un bug</option>
                <option value="feature">Demande de fonctionnalité</option>
                <option value="account">Problème de compte</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <!-- Message Field -->
            <div class="form-group">
              <label for="message" class="form-label">Message *</label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="6"
                class="form-textarea"
                placeholder="Décrivez votre demande..."
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!canSubmit"
              class="btn btn-primary"
            >
              <BaseSpinner v-if="isSubmitting" size="small" color="white" />
              {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
            </button>
          </form>
        </section>

        <!-- Contact Info Section -->
        <section class="contact-info-section">
          <div class="info-card card">
            <h3 class="info-title">Autres moyens de contact</h3>
            <div class="info-items">
              <div class="info-item">
                <strong>Email direct :</strong>
                <a href="mailto:contact@mwplu.com" class="info-link">contact@mwplu.com</a>
              </div>
              <div class="info-item">
                <strong>Téléphone :</strong>
                <a href="tel:+33601842720" class="info-link">06 01 84 27 20</a>
              </div>
              <div class="info-item">
                <strong>Temps de réponse :</strong>
                <span>24-48 heures ouvrables</span>
              </div>
            </div>
          </div>

          <div class="faq-card card">
            <h3 class="info-title">Questions fréquentes</h3>
            <div class="faq-links-container">
              <router-link to="/docs/faq" class="btn btn-secondary btn-full-width">
                Consulter la FAQ
              </router-link>
              <router-link to="/docs/documentation" class="btn btn-secondary btn-full-width">
                Lire la documentation
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'ContactView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner
  },

  setup() {
    const uiStore = useUIStore()

    const isSubmitting = ref(false)

    const form = reactive({
      name: '',
      email: '',
      subject: '',
      message: ''
    })

    const breadcrumbItems = [
      { label: 'Contact', to: '/contact' }
    ]

    const canSubmit = computed(() => {
      return form.name && form.email && form.subject && form.message && !isSubmitting.value
    })

    const handleSubmit = async () => {
      if (!canSubmit.value) return

      isSubmitting.value = true

      try {
        // Import contact service dynamically to avoid import errors
        const { contactService } = await import('@/services/contactService')
        
        const result = await contactService.submitMessage(form)

        if (result.success) {
          const methodText = {
            discord: 'Discord'
          }[result.method] || 'notre système'

          uiStore.showNotification(
            `Votre message a été envoyé avec succès via ${methodText}. Nous vous répondrons bientôt.`, 
            'success'
          )

          // Reset form
          Object.assign(form, {
            name: '',
            email: '',
            subject: '',
            message: ''
          })
        } else {
          throw new Error('Échec de l\'envoi du message')
        }

      } catch (error) {
        console.error('Contact form submission error:', error)
        uiStore.showNotification(
          error.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement.', 
          'error'
        )
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      form,
      isSubmitting,
      canSubmit,
      breadcrumbItems,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: var(--space-4) auto;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header-section {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: var(--font-size-3xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-700);
  line-height: 1.5;
}

.contact-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
  align-items: start;
}

@media (max-width: 1024px) {
  .contact-content-grid {
    grid-template-columns: 1fr;
  }
}

/* Contact Form Section */
.contact-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.contact-form {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
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

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  background-color: var(--color-white);
  font-size: var(--font-size-md);
  color: var(--color-color-black);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.form-input:disabled,
.form-textarea:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Contact Info Section */
.contact-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.info-card,
.faq-card {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.info-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-item {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-2);
  border-bottom: 1px dashed var(--color-gray-200);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item strong {
  color: var(--color-color-black);
  font-weight: var(--font-weight-medium);
}

.info-link {
  color: var(--color-blue);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.info-link:hover {
  color: var(--color-blue-dark);
  text-decoration: underline;
}

.faq-links-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.btn-full-width {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header-section {
    padding: var(--space-6) var(--space-4);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-subtitle {
    font-size: var(--font-size-md);
  }

  .contact-form,
  .info-card,
  .faq-card {
    padding: var(--space-6);
  }

  .form-title,
  .info-title {
    font-size: var(--font-size-lg);
  }
}
</style>
