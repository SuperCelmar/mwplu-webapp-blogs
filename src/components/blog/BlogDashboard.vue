<template>
  <div class="container" data-test="blog-dashboard">
    <section class="card" style="margin-bottom: var(--space-6);">
      <h2 class="card__title">Vue d’ensemble</h2>
      <BlogStatsOverview data-test="blog-stats-overview" />
    </section>

    <section class="card" style="margin-bottom: var(--space-6);">
      <h2 class="card__title">Planification de contenu</h2>
      <BlogContentPlanner data-test="blog-content-planner" />
    </section>

    <section class="card" style="margin-bottom: var(--space-6);">
      <h2 class="card__title">Articles</h2>
      <BlogArticleList data-test="blog-article-list" />
    </section>

    <section class="card">
      <h2 class="card__title">Calendrier</h2>
      <BlogSchedulingCalendar data-test="blog-scheduling-calendar" />
    </section>
  </div>
  
</template>

<script setup>
import BlogStatsOverview from './BlogStatsOverview.vue'
import BlogContentPlanner from './BlogContentPlanner.vue'
import BlogArticleList from './BlogArticleList.vue'
import BlogSchedulingCalendar from './BlogSchedulingCalendar.vue'
</script>

<style scoped>
.card__title {
  margin-bottom: var(--space-4);
}
</style>


