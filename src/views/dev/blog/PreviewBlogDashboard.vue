<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Dashboard Blog</h1>
    <BlogDashboard />
    </div>
  </div>
</template>

<script setup>
import BlogDashboard from '@/components/blog/BlogDashboard.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
</script>


