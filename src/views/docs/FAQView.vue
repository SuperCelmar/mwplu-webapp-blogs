<template>
  <ComingSoonView
    page-title="Foire aux questions"
    page-description="Notre section FAQ sera bientôt disponible avec toutes les réponses aux questions les plus fréquemment posées."
    :breadcrumb-items="breadcrumbItems"
    :alternative-route="{ path: '/contact', label: 'Nous contacter' }"
  />
</template>

<script setup>
import ComingSoonView from '@/components/common/ComingSoonView.vue'

const breadcrumbItems = [
  { label: 'Documentation', to: '/docs' },
  { label: 'FAQ', to: '/docs/faq' }
]
</script>
