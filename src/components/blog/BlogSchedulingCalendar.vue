<template>
  <div data-test="blog-scheduling-calendar">
    <div class="grid" style="align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
      <h3 class="card__title" data-test="calendar-header">Calendrier des publications</h3>
      <div class="grid" style="gap: var(--space-2);">
        <button class="btn-secondary">Précédent</button>
        <button class="btn">Aujourd’hui</button>
        <button class="btn-secondary">Suivant</button>
      </div>
    </div>
    <div class="card">
      <div class="status-message">Calendrier minimal à venir…</div>
    </div>
  </div>
</template>

<script setup>
</script>


