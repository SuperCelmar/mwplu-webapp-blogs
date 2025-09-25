<template>
  <div data-test="blog-content-planner">
    <div class="form-group" style="margin-bottom: var(--space-4);">
      <label class="form-label" for="search">Recherche</label>
      <div class="input-wrapper">
        <input id="search" class="form-input" type="text" placeholder="Rechercher un sujet…" />
      </div>
    </div>

    <div class="card" data-test="planner-table">
      <div class="grid" style="gap: var(--space-3);">
        <div><strong>Sujet</strong></div>
        <div><strong>Mots-clés</strong></div>
        <div><strong>Date cible</strong></div>
        <div><strong>Priorité</strong></div>
      </div>
      <div class="status-message" style="margin-top: var(--space-3);">Aucune planification pour le moment.</div>
    </div>
  </div>
</template>

<script setup>
</script>


