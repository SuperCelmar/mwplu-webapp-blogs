<template>
  <ComingSoonView
    page-title="Documentation"
    page-description="Notre centre de documentation complet sera bientôt disponible avec des guides détaillés et des ressources pour utiliser MWPLU."
    :breadcrumb-items="breadcrumbItems"
    :alternative-route="{ path: '/contact', label: 'Nous contacter' }"
  />
</template>

<script setup>
import ComingSoonView from '@/components/common/ComingSoonView.vue'

const breadcrumbItems = [
  { label: 'Documentation', to: '/docs/documentation' }
]
</script>

<style scoped>
.container {
  padding: var(--space-8);
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
}

p {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  line-height: 1.6;
}
</style>
