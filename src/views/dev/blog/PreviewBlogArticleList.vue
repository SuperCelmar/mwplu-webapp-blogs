<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Liste des Articles</h1>
    <BlogArticleList />
    </div>
  </div>
</template>

<script setup>
import BlogArticleList from '@/components/blog/BlogArticleList.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
</script>


