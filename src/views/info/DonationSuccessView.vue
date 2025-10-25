<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="main-content">
      <div class="success-container">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <h1 class="success-title">Merci pour votre don !</h1>
        <p class="success-message">
          Votre contribution a été traitée avec succès. Un reçu vous a été envoyé par email.
        </p>

        <div class="success-details">
          <div class="detail-item" v-if="donationAmount">
            <strong>Montant :</strong> {{ donationAmount }}€
          </div>
          <div class="detail-item" v-if="donationId">
            <strong>Référence :</strong> {{ donationId }}
          </div>
        </div>

        <div class="success-actions">
          <router-link to="/dashboard" class="btn btn-primary">
            Retour au tableau de bord
          </router-link>
          <router-link to="/info/donation" class="btn btn-secondary">
            Faire un autre don
          </router-link>
        </div>

        <div class="success-info">
          <h3>Ce que votre don nous permet de faire :</h3>
          <ul>
            <li>Améliorer la qualité de nos synthèses PLU</li>
            <li>Développer de nouvelles fonctionnalités</li>
            <li>Maintenir un accès gratuit pour tous</li>
            <li>Supporter l'infrastructure technique</li>
          </ul>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

export default {
  name: 'DonationSuccessView',

  components: {
    AppLayout,
    BreadcrumbNav
  },

  setup() {
    const route = useRoute()
    const uiStore = useUIStore()

    const donationAmount = ref('')
    const donationId = ref('')

    const breadcrumbItems = [
      { label: 'Don', to: '/info/donation' },
      { label: 'Confirmation', to: '/donation/success' }
    ]

    // Extract donation details from URL parameters if available
    onMounted(() => {
      const { amount, session_id, payment_intent } = route.query

      if (amount) {
        donationAmount.value = amount
      }

      if (session_id) {
        donationId.value = session_id
      } else if (payment_intent) {
        donationId.value = payment_intent
      }

      // Show success notification
      uiStore.showSuccess(
        'Votre don a été traité avec succès !',
        'Un reçu de votre contribution vous a été envoyé par email.'
      )
    })

    return {
      donationAmount,
      donationId,
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

.success-container {
  text-align: center;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  color: var(--color-success);
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.success-title {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-bold);
}

.success-message {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: var(--line-height-relaxed);
}

.success-details {
  background: var(--color-gray-50);
  border-radius: var(--radius-form);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.detail-item {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
}

.detail-item:last-child {
  margin-bottom: 0;
}

.success-actions {
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

.success-info {
  text-align: left;
  background: var(--color-info-bg);
  border-radius: var(--radius-form);
  padding: var(--space-6);
}

.success-info h3 {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-semibold);
}

.success-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.success-info li {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
  padding-left: var(--space-6);
  position: relative;
}

.success-info li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: var(--space-6);
  }

  .success-container {
    padding: var(--space-6);
  }

  .success-title {
    font-size: var(--font-size-2xl);
  }

  .success-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>
