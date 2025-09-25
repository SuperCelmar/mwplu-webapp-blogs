<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Métadonnées de l’article</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-content">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="title">Titre</label>
            <input id="title" class="form-input" v-model="local.title" type="text" data-test="meta-title" />
          </div>

          <div class="form-group">
            <label class="form-label" for="slug">Slug</label>
            <input id="slug" class="form-input" v-model="local.slug" type="text" placeholder="mon-article" data-test="meta-slug" />
            <small class="hint">Minuscule, kebab-case</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="excerpt">Extrait</label>
            <textarea id="excerpt" class="form-input" rows="3" v-model="local.excerpt" data-test="meta-excerpt" />
          </div>

          <div class="form-group">
            <label class="form-label" for="category">Catégorie</label>
            <select id="category" class="form-input" v-model="local.category_id" data-test="meta-category">
              <option value="">—</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="tags">Tags</label>
            <div class="input-wrapper tags-list" data-test="meta-tags">
              <label v-for="t in tags" :key="t.id" class="tag-item">
                <input type="checkbox" :value="t.id" v-model="local.tag_ids" />
                <span>{{ t.name }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="cover">Image de couverture (URL)</label>
            <input id="cover" class="form-input" v-model="local.cover_image_url" type="url" placeholder="https://…" data-test="meta-cover" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" :disabled="!isValidForValidation" @click="onValidate" data-test="meta-validate">Valider SEO</button>
        <button class="btn" :disabled="!isValidForSave" @click="onSave" data-test="meta-save">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'validate', 'save', 'update:modelValue'])

const local = reactive({
  title: '',
  slug: '',
  excerpt: '',
  category_id: '',
  tag_ids: [],
  cover_image_url: '',
})

watch(
  () => props.modelValue,
  (v) => {
    Object.assign(local, v || {})
  },
  { immediate: true },
)

const isValidForValidation = computed(() => Boolean(local.title && local.slug))
const isValidForSave = computed(() => Boolean(local.title && local.slug && local.category_id))

function close() {
  emit('close')
}

function onValidate() {
  emit('validate', { ...local })
}

function onSave() {
  emit('save', { ...local })
  emit('update:modelValue', { ...local })
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-container { background: var(--color-white); border-radius: var(--radius-card); box-shadow: var(--shadow-lg); width: 96%; max-width: 860px; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--border-gray); }
.modal-title { margin: 0; font-size: var(--font-size-xl); }
.close-button { background: none; border: none; font-size: 2rem; cursor: pointer; }
.modal-content { padding: var(--space-5); overflow: auto; }
.form-grid { display: grid; gap: var(--space-4); grid-template-columns: 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-weight: 600; }
.form-input { padding: 10px 12px; border: 1px solid var(--border-gray); border-radius: var(--radius-input); }
.tags-list { display: flex; flex-wrap: wrap; gap: 10px; padding: 8px; border: 1px solid var(--border-gray); border-radius: var(--radius-input); }
.tag-item { display: inline-flex; gap: 6px; align-items: center; }
.hint { color: var(--color-gray-600); font-size: 12px; }
.modal-footer { display: flex; gap: var(--space-3); justify-content: flex-end; padding: var(--space-4); border-top: 1px solid var(--border-gray); }
.btn { background: var(--color-black); color: var(--color-white); border: none; border-radius: var(--radius-button); padding: 10px 14px; }
.btn-secondary { background: transparent; color: var(--color-black); border: 1px solid var(--border-gray); border-radius: var(--radius-button); padding: 10px 14px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
</style>


