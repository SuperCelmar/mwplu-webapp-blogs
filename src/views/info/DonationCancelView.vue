<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="main-content">
      <div class="cancel-container">
        <div class="cancel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <h1 class="cancel-title">Don annulé</h1>
        <p class="cancel-message">
          Votre don n'a pas été traité. Aucune somme n'a été prélevée sur votre compte.
        </p>

        <div class="cancel-reasons">
          <h3>Raisons possibles :</h3>
          <ul>
            <li>Annulation volontaire du paiement</li>
            <li>Problème avec le moyen de paiement</li>
            <li>Session expirée</li>
            <li>Erreur technique temporaire</li>
          </ul>
        </div>

        <div class="cancel-actions">
          <router-link to="/info/donation" class="btn btn-primary">
            Réessayer le don
          </router-link>
          <router-link to="/dashboard" class="btn btn-secondary">
            Retour au tableau de bord
          </router-link>
        </div>

        <div class="help-section">
          <h3>Besoin d'aide ?</h3>
          <p>
            Si vous rencontrez des difficultés avec le processus de don,
            n'hésitez pas à nous contacter.
          </p>
          <router-link to="/contact" class="contact-link">
            Nous contacter
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

export default {
  name: 'DonationCancelView',

  components: {
    AppLayout,
    BreadcrumbNav
  },

  setup() {
    const uiStore = useUIStore()

    const breadcrumbItems = [
      { label: 'Don', to: '/info/donation' },
      { label: 'Annulé', to: '/donation/cancel' }
    ]

    onMounted(() => {
      // Show info notification
      uiStore.showInfo(
        'Votre don a été annulé.',
        'Aucune somme n\'a été prélevée sur votre compte.'
      )
    })

    return {
      breadcrumbItems
    }
  }
}
</script>

<style scoped>
.main-content {
  padding: var(--space-8);
  max-width: 800px;
  margin: 0 auto;
}

.cancel-container {
  text-align: center;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
}

.cancel-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  color: var(--color-gray-500);
}

.cancel-icon svg {
  width: 100%;
  height: 100%;
}

.cancel-title {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-bold);
}

.cancel-message {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: var(--line-height-relaxed);
}

.cancel-reasons {
  text-align: left;
  background: var(--color-gray-50);
  border-radius: var(--radius-form);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.cancel-reasons h3 {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.cancel-reasons ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cancel-reasons li {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
  padding-left: var(--space-6);
  position: relative;
}

.cancel-reasons li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-gray-400);
  font-weight: var(--font-weight-bold);
}

.cancel-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}

.btn {
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--color-black);
  color: var(--color-white);
  border: 2px solid var(--color-black);
}

.btn-primary:hover {
  background: var(--color-gray-800);
  border-color: var(--color-gray-800);
}

.btn-secondary {
  background: var(--color-white);
  color: var(--color-black);
  border: 2px solid var(--color-gray-300);
}

.btn-secondary:hover {
  border-color: var(--color-black);
}

.help-section {
  background: var(--color-info-bg);
  border-radius: var(--radius-form);
  padding: var(--space-6);
  text-align: center;
}

.help-section h3 {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-semibold);
}

.help-section p {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-4);
  line-height: var(--line-height-normal);
}

.contact-link {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--color-info);
  color: var(--color-white);
  text-decoration: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.contact-link:hover {
  background: var(--color-blue);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: var(--space-6);
  }

  .cancel-container {
    padding: var(--space-6);
  }

  .cancel-title {
    font-size: var(--font-size-2xl);
  }

  .cancel-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>
