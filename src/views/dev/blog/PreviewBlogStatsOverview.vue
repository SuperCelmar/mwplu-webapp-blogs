<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Stats Overview</h1>
    <BlogStatsOverview />
    </div>
  </div>
</template>

<script setup>
import BlogStatsOverview from '@/components/blog/BlogStatsOverview.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
</script>


