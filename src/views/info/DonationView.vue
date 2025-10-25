<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="main-content">
      <section class="page-header-section">
        <h1 class="page-title">Soutenez MWPLU</h1>
        <p class="page-subtitle">
          Votre soutien nous aide à améliorer l'accès aux documents d'urbanisme pour tous.
        </p>
      </section>

      <div class="donation-content">
        <div class="donation-form-container">
          <div class="donation-card card">
            <div class="donation-header">
              <h2 class="donation-title">Faire un don</h2>
              <p class="donation-description">
                Choisissez le montant qui vous convient. Chaque contribution compte.
              </p>
            </div>

            <form @submit.prevent="handleDonation" class="donation-form">
              <!-- Preset Amount Buttons -->
              <div class="amount-selection">
                <h3 class="selection-title">Montant du don</h3>
                <div class="amount-buttons">
                  <button
                    v-for="amount in presetAmounts"
                    :key="amount"
                    type="button"
                    class="amount-btn"
                    :class="{ selected: selectedAmount === amount && !customAmountInput }"
                    @click="selectPresetAmount(amount)"
                    :disabled="isProcessing"
                  >
                    {{ amount }}€
                  </button>
                </div>
              </div>

              <!-- Custom Amount Input -->
              <div class="custom-amount-section">
                <label for="customAmount" class="form-label">Ou entrez un montant personnalisé</label>
                <div class="custom-input-container">
                  <input
                    id="customAmount"
                    v-model.number="customAmountInput"
                    type="number"
                    min="1"
                    max="10000"
                    class="form-input custom-input"
                    placeholder="Montant en €"
                    :disabled="isProcessing"
                    @input="handleCustomAmount"
                  />
                  <span class="currency-symbol">€</span>
                </div>
              </div>

              <!-- Donate Button -->
              <button
                type="submit"
                class="donate-btn btn"
                :disabled="!canDonate"
                :class="{ processing: isProcessing }"
              >
                <BaseSpinner v-if="isProcessing" size="small" color="white" />
                <span v-else>
                  Faire un don de {{ selectedAmount }}€
                </span>
              </button>
            </form>
          </div>

          <!-- Info Section -->
          <div class="donation-info">
            <div class="info-item">
              <h4>🔒 Paiement sécurisé</h4>
              <p>Transactions protégées par Stripe</p>
            </div>
            <div class="info-item">
              <h4>💳 Moyens de paiement</h4>
              <p>Carte bancaire, PayPal, Apple Pay</p>
            </div>
            <div class="info-item">
              <h4>📄 Reçu fiscal</h4>
              <p>Reçu envoyé par email automatiquement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { useDonation } from '@/composables/useDonation'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'DonationView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner
  },

  setup() {
    // Use donation composable
    const donation = useDonation()

    const breadcrumbItems = [
      { label: 'Nous soutenir', to: '/info/donation' }
    ]

    return {
      ...donation,
      breadcrumbItems
    }
  }
}
</script>

<style scoped>
.main-content {
  padding: var(--space-8);
  max-width: 900px;
  margin: 0 auto;
}

.page-header-section {
  text-align: center;
  margin-bottom: var(--space-12);
}

.page-title {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-bold);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  line-height: var(--line-height-relaxed);
  max-width: 600px;
  margin: 0 auto;
}

.donation-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.donation-form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.donation-card {
  background: var(--color-white);
  border-radius: var(--radius-form);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
}

.donation-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.donation-title {
  font-size: var(--font-size-2xl);
  color: var(--color-black);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-semibold);
}

.donation-description {
  font-size: var(--font-size-base);
  color: var(--color-gray-600);
  line-height: var(--line-height-normal);
}

.donation-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.amount-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.selection-title {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.amount-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--space-3);
}

.amount-btn {
  padding: var(--space-4) var(--space-3);
  border: 2px solid var(--color-gray-300);
  background: var(--color-white);
  color: var(--color-gray-700);
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.amount-btn:hover:not(:disabled) {
  border-color: var(--color-black);
  color: var(--color-black);
}

.amount-btn.selected {
  border-color: var(--color-black);
  background: var(--color-black);
  color: var(--color-white);
}

.amount-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-amount-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-base);
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}

.custom-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  padding: var(--space-4);
  padding-right: var(--space-8);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.custom-input:focus {
  outline: none;
  border-color: var(--color-black);
}

.custom-input:disabled {
  background: var(--color-gray-50);
  cursor: not-allowed;
}

.currency-symbol {
  position: absolute;
  right: var(--space-4);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-medium);
  pointer-events: none;
}

.donate-btn {
  width: 100%;
  padding: var(--space-5) var(--space-6);
  background: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 54px;
}

.donate-btn:hover:not(:disabled) {
  background: var(--color-gray-800);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.donate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.donate-btn.processing {
  background: var(--color-gray-600);
}

.donation-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.info-item {
  text-align: center;
  padding: var(--space-4);
}

.info-item h4 {
  font-size: var(--font-size-base);
  color: var(--color-black);
  margin: 0 0 var(--space-2) 0;
  font-weight: var(--font-weight-medium);
}

.info-item p {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: var(--space-6);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-subtitle {
    font-size: var(--font-size-base);
  }

  .donation-card {
    padding: var(--space-6);
  }

  .amount-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .amount-btn {
    padding: var(--space-4);
  }

  .donation-info {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .info-item {
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--space-4);
  }

  .amount-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }

  .amount-btn {
    padding: var(--space-3);
    font-size: var(--font-size-sm);
  }
}
</style>
