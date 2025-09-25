<template>
  <div data-test="blog-article-list">
    <div class="form-group" style="margin-bottom: var(--space-4);">
      <label class="form-label" for="filter">Filtrer par statut</label>
      <div class="input-wrapper">
        <select id="filter" class="form-select" v-model="status" @change="load">
          <option value="all">Tous</option>
          <option value="draft">Brouillon</option>
          <option value="scheduled">Planifié</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>
    </div>

    <div class="card" v-if="isLoading">
      <div class="status-message">Chargement…</div>
    </div>

    <div class="card" v-else-if="items.length === 0">
      <div class="status-message" data-test="empty-state">Aucun article pour le moment.</div>
    </div>

    <div class="card" v-else>
      <table class="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Statut</th>
            <th>Mis à jour</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id">
            <td>{{ a.title || 'Sans titre' }}</td>
            <td><span class="badge">{{ a.status }}</span></td>
            <td>{{ formatDate(a.updated_at) }}</td>
            <td style="text-align:right;">
              <button class="btn-secondary" @click="continueEditing(a)" data-test="action-edit">Continuer l’édition</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <button class="btn-secondary" :disabled="page<=1" @click="prev">Précédent</button>
        <span>Page {{ page }}</span>
        <button class="btn-secondary" :disabled="items.length < pageSize" @click="next">Suivant</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { dbService } from '@/services/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const status = ref('all')
const isLoading = ref(false)
const items = ref([])
const page = ref(1)
const pageSize = ref(10)

function formatDate(v) {
  if (!v) return ''
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}

async function load() {
  isLoading.value = true
  const { success, data } = await dbService.listBlogArticles({ status: status.value, page: page.value, pageSize: pageSize.value })
  items.value = success && data?.items ? data.items : []
  isLoading.value = false
}

function prev() { if (page.value > 1) { page.value -= 1; load() } }
function next() { page.value += 1; load() }

function continueEditing(article) {
  if (article?.id) {
    router.push({ name: 'admin-blog-editor', params: { id: article.id } })
  }
}

onMounted(load)
</script>

<style scoped>
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 10px; border-bottom: 1px solid var(--border-gray); }
.badge { display: inline-block; padding: 2px 8px; border: 1px solid var(--border-gray); border-radius: 999px; font-size: 12px; }
.table-footer { display: flex; gap: var(--space-3); align-items: center; justify-content: flex-end; padding: var(--space-3); }
</style>


