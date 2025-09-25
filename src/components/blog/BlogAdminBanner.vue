<template>
  <section class="admin-banner" data-test="admin-banner">
    <div class="banner-left">
      <h1 class="page-title">Administration du Blog</h1>
      <nav class="admin-menu">
        <router-link class="admin-link" to="/dev/blog/dashboard">Dashboard</router-link>
        <router-link class="admin-link" to="/dev/blog/planner">Planner</router-link>
        <router-link class="admin-link" to="/dev/blog/list">Articles</router-link>
        <router-link class="admin-link" to="/dev/blog/calendar">Calendrier</router-link>
        <router-link class="admin-link" to="/dev/blog/editor">Éditeur</router-link>
      </nav>
    </div>
    <div class="banner-right">
      <ThemeToggleButton />
    </div>
  </section>
</template>

<script setup>
import ThemeToggleButton from '@/components/blog/ThemeToggleButton.vue'
</script>

<style scoped>
.admin-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-gray, #e5e7eb);
  background: var(--color-white);
}
.banner-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.page-title {
  margin: 0;
  font-size: 22px;
}
.admin-menu {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.admin-link {
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--color-black);
  background: transparent;
}
.admin-link:hover {
  background: rgba(0,0,0,0.05);
}
.banner-right {
  display: flex;
  align-items: center;
}
[data-theme="dark"] .admin-banner {
  background: var(--mobile-nav-bg);
}
</style>


