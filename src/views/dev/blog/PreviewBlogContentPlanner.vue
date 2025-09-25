<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Planificateur de Contenu</h1>
    <BlogContentPlanner />
    </div>
  </div>
</template>

<script setup>
import BlogContentPlanner from '@/components/blog/BlogContentPlanner.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
</script>


