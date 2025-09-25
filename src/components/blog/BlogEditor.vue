<template>
  <div class="container" data-test="blog-editor">
    <!-- Header -->
    <header class="editor-header" data-test="blog-editor-header">
      <h1 class="editor-title">Éditeur d’article</h1>
      <div class="editor-actions">
        <button class="btn-secondary" type="button" data-test="action-open-metadata" @click="emitOpenMetadata">
          Valider Metadonnée
        </button>
        <button class="btn-secondary" type="button" data-test="action-save-draft" @click="emitSaveDraft">
          Enregistrer Brouillon
        </button>
        <button class="btn" type="button" :disabled="!canPublish" data-test="action-publish" @click="emitPublish">
          {{ actionLabel }}
        </button>
      </div>
    </header>

    <div class="editor-body">
      <!-- Main: Markdown editor + Preview -->
      <main class="editor-main card" data-test="blog-editor-main">
        <h2 class="card__title">Contenu</h2>
        <div class="editor-main-grid">
          <div class="editor-input">
            <label class="form-label" for="editorContent">Markdown</label>
            <div class="input-wrapper">
              <textarea
                id="editorContent"
                class="form-input"
                rows="14"
                v-model="content"
                placeholder="# Titre\n\nVotre contenu en markdown…"
                data-test="editor-input"
              ></textarea>
            </div>
          </div>
          <div class="editor-preview">
            <div class="preview-header">Aperçu</div>
            <BlogPreviewCarousel :article="previewArticle" />
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="editor-footer" data-test="blog-editor-footer">
      <small class="status-message">Les champs SEO utilisent les tokens de style pour une cohérence visuelle.</small>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BlogPreviewCarousel from './BlogPreviewCarousel.vue'

const props = defineProps({
  canPublish: { type: Boolean, default: false },
  metadata: { type: Object, default: () => ({}) },
  initialContent: { type: String, default: '' },
  actionLabel: { type: String, default: 'Enregistrer l’article' },
})

const content = ref('')

// Initialize editor content from prop whenever it changes, if user hasn't typed yet
watch(
  () => props.initialContent,
  (v) => {
    if ((content.value || '').trim().length === 0) {
      content.value = v || ''
    }
  },
  { immediate: true },
)

// Merge editor content and provided metadata for previews
const previewArticle = computed(() => ({
  content: content.value,
  ...(props.metadata || {}),
}))

const emit = defineEmits(['open-metadata', 'save-draft', 'publish'])

function basePayload() {
  return { content: content.value }
}

function emitOpenMetadata() {
  emit('open-metadata', basePayload())
}

function emitSaveDraft() {
  emit('save-draft', basePayload())
}

function emitPublish() {
  emit('publish', basePayload())
}
</script>

<style scoped>
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--space-6) 0;
}

.editor-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0;
}

.editor-actions {
  display: inline-flex;
  gap: var(--space-3);
}

.editor-body {
  display: block;
}

.editor-main {
  padding: var(--space-4);
}

.editor-main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.editor-input textarea {
  min-height: 280px;
}

.editor-preview {
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-card);
  background: var(--color-white);
  color: var(--color-black);
}

.preview-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-gray);
  font-weight: 600;
}

.preview-body {
  padding: var(--space-4);
  white-space: pre-wrap;
}

.editor-footer {
  margin: var(--space-6) 0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .editor-body {
    grid-template-columns: 1fr;
  }
  .editor-main-grid {
    grid-template-columns: 1fr;
  }
}
</style>


