<template>
  <section class="company-context-manager" data-test="company-context-manager">
    <div v-if="mode === 'welcome'" class="context-card welcome-card" data-test="welcome">
      <div class="welcome-content">
        <h2 class="card-title">Company Context</h2>
        <p class="muted">Set mission, tone, and guidelines once to reuse across articles.</p>
      </div>
      <button class="btn" data-test="action-start" @click="onStart">Ajouter le contexte</button>
    </div>

    <div v-else class="context-grid">
      <!-- Form -->
      <div v-if="mode === 'edit'" class="context-card" data-test="context-form">
        <h2 class="card-title">Company Context</h2>
        <form @submit.prevent="onSave">
          <div class="form-group">
            <label for="name" class="form-label">Name *</label>
            <div class="input-wrapper">
              <input id="name" name="name" type="text" class="form-input" v-model="name" />
            </div>
            <div v-if="errors.name" class="error-message" data-test="error-name">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label for="mission" class="form-label">Mission</label>
            <div class="input-wrapper">
              <textarea id="mission" name="mission" rows="3" class="form-input" v-model="mission" />
            </div>
            <div v-if="errors.mission" class="error-message" data-test="error-mission">{{ errors.mission }}</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tone" class="form-label">Tone</label>
              <div class="input-wrapper">
                <input id="tone" name="tone" type="text" class="form-input" v-model="tone" />
              </div>
              <div v-if="errors.tone" class="error-message" data-test="error-tone">{{ errors.tone }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Active</label>
              <label class="checkbox-wrapper">
                <input id="isActive" name="isActive" type="checkbox" v-model="isActive" />
                <span class="checkbox-label">Use this context as active</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="messaging" class="form-label">Messaging</label>
            <div class="input-wrapper">
              <textarea id="messaging" name="messaging" rows="3" class="form-input" v-model="messaging" />
            </div>
            <div v-if="errors.messaging" class="error-message" data-test="error-messaging">{{ errors.messaging }}</div>
          </div>

          <div class="form-group">
            <label for="brand" class="form-label">Brand Voice Guidelines</label>
            <div class="input-wrapper">
              <textarea id="brand" name="brand" rows="3" class="form-input" v-model="brandVoiceGuidelines" />
            </div>
            <div v-if="errors.brandVoiceGuidelines" class="error-message" data-test="error-brand">{{ errors.brandVoiceGuidelines }}</div>
          </div>

          <div class="actions">
            <button type="button" class="btn-secondary" data-test="action-reset" @click="onReset">Reset</button>
            <button type="submit" class="btn" :disabled="saving || submitting" data-test="action-save" @click="onSave">Save</button>
          </div>
          <p v-if="saveError" class="error-message" data-test="save-error">{{ saveError }}</p>
          <p v-if="saveSuccess" class="muted" data-test="save-success">Saved successfully.</p>
        </form>
      </div>

      <!-- Preview or View -->
      <div v-if="mode !== 'welcome'" class="context-card" :data-test="mode === 'view' ? 'context-view' : 'context-preview'">
        <h2 class="card-title">Preview</h2>
        <ul class="preview-list">
          <li><strong>Name:</strong> <span data-test="preview-name">{{ name || '—' }}</span></li>
          <li><strong>Mission:</strong> <span data-test="preview-mission">{{ mission || '—' }}</span></li>
          <li><strong>Tone:</strong> <span data-test="preview-tone">{{ tone || '—' }}</span></li>
          <li><strong>Active:</strong> <span data-test="preview-active">{{ isActive ? 'Yes' : 'No' }}</span></li>
        </ul>
        <div v-if="mode === 'view' && isAuthenticated" class="actions">
          <button class="btn" data-test="action-edit" @click="onEdit">Edit</button>
        </div>
      </div>

      <!-- No history list per simplified UX -->
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyContextStore } from '@/stores/companyContext'
import { useAuthStore } from '@/stores/auth'

const store = useCompanyContextStore()
const { name, mission, tone, messaging, brandVoiceGuidelines, isActive, mode, saving } = storeToRefs(store)
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const errors = reactive({ name: '', mission: '', tone: '', messaging: '', brandVoiceGuidelines: '' })
const saveError = ref('')
const saveSuccess = ref(false)
const submitting = ref(false)

const onReset = () => {
  store.reset()
  errors.name = ''
}

const validate = () => {
  errors.name = name.value.trim() ? '' : 'Name is required'
  errors.mission = mission.value.trim() ? '' : 'Mission is required'
  errors.tone = tone.value.trim() ? '' : 'Tone is required'
  errors.messaging = messaging.value.trim() ? '' : 'Messaging is required'
  errors.brandVoiceGuidelines = brandVoiceGuidelines.value.trim() ? '' : 'Brand Voice Guidelines are required'
  return !errors.name && !errors.mission && !errors.tone && !errors.messaging && !errors.brandVoiceGuidelines
}

const handleSave = async () => {
  if (saving.value || submitting.value) return
  if (!validate()) return
  saveError.value = ''
  saveSuccess.value = false
  submitting.value = true
  const res = await store.saveContext()
  if (!res || !res.success) {
    saveError.value = res?.error || 'Unable to save. You may not have permission.'
    submitting.value = false
    return
  }
  saveSuccess.value = true
  // Ensure view mode even if store.saveContext is mocked in tests
  mode.value = 'view'
  submitting.value = false
}

const onSave = () => handleSave()

const onStart = () => store.start()
const onEdit = () => (store.mode = 'edit')

onMounted(() => {
  store.loadActive()
})
</script>

<style scoped>
.company-context-manager {
  display: block;
}
.context-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}
.context-card {
  background: var(--color-white);
  color: var(--color-black);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}
.welcome-card {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}
.welcome-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.card-title {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-2xl);
}
.welcome-card .card-title {
  margin-bottom: 0;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
}
.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}
.muted {
  color: var(--color-gray-600);
}
.preview-list,
.history-list {
  margin: 0;
  padding-left: 1rem;
}
@media (max-width: 900px) {
  .context-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .welcome-card .btn {
    width: 100%;
  }
}
</style>


