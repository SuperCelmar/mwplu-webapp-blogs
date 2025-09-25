<template>
  <AppLayout>
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <BlogAdminBanner />

    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
      <BlogDashboard data-test="blog-dashboard" />
      <div style="margin-top: var(--space-8);" data-test="company-context-section">
        <h2 style="margin-bottom: var(--space-4);">Company Context Manager</h2>
        <CompanyContextManager />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
import BlogDashboard from '../../components/blog/BlogDashboard.vue'
import CompanyContextManager from '../../components/blog/CompanyContextManager.vue'

const breadcrumbItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Admin', to: '/dashboard' },
  { label: 'Blog', to: '/admin/blog' },
]
</script>

<style scoped>
</style>


