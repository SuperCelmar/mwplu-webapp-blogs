<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Calendrier des publications</h1>
    <BlogSchedulingCalendar />
    </div>
  </div>
</template>

<script setup>
import BlogSchedulingCalendar from '@/components/blog/BlogSchedulingCalendar.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
</script>


