<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <main class="policy-container">
      <div v-if="isLoading" class="loading-state">
        <p>Chargement de la politique de confidentialité...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadContent" class="retry-button">Réessayer</button>
      </div>
      <div v-else v-html="policyContent" class="policy-content"></div>
    </main>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import { policyService, POLICY_TYPES } from '@/services/policyService'

// Reactive data
const policyContent = ref('')
const isLoading = ref(true)
const error = ref(null)

// Breadcrumb configuration
const breadcrumbItems = [
  { label: "Politique de confidentialité", to: '/policies/privacy' }
]

// Load policy content
const loadContent = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Use centralized policy service
    const content = policyService.getPolicyHTML(POLICY_TYPES.PRIVACY)

    if (content) {
      policyContent.value = content
    } else {
      error.value = 'Le contenu de la politique de confidentialité n\'a pas pu être chargé.'
    }
  } catch (err) {
    console.error('Privacy content loading error:', err)
    error.value = 'Une erreur s\'est produite lors du chargement du contenu.'
  } finally {
    isLoading.value = false
  }
}

// Load content on component mount
onMounted(() => {
  loadContent()
})
</script>

<style>
/* Import global policy styles - not scoped because of v-html content */
@import '../../styles/pages/policy-styles.css';

.loading-state, .error-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-600);
}

.retry-button {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-6);
  background: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.retry-button:hover {
  background: var(--color-gray-800);
}
</style>
