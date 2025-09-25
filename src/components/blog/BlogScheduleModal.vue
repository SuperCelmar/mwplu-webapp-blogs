<template>
  <div v-if="visible" class="modal-overlay" data-test="schedule-modal" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Planifier la publication</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label class="form-label" for="scheduleAt">Date et heure</label>
          <input id="scheduleAt" class="form-input" type="datetime-local" v-model="local.scheduleAt" data-test="schedule-datetime" />
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" v-model="local.autoPublish" /> Publication automatique
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" type="button" @click="$emit('close')">Annuler</button>
        <button class="btn" type="button" data-test="schedule-save" @click="save">Planifier</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultDate: { type: String, default: '' },
  defaultAutoPublish: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'save'])

const local = reactive({ scheduleAt: props.defaultDate, autoPublish: props.defaultAutoPublish })

watch(
  () => [props.defaultDate, props.visible],
  () => {
    if (props.visible) {
      local.scheduleAt = props.defaultDate
      local.autoPublish = props.defaultAutoPublish
    }
  },
)

function save() {
  emit('save', { scheduled_at: local.scheduleAt ? new Date(local.scheduleAt).toISOString() : null, auto_publish: !!local.autoPublish })
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { width: 560px; max-width: 92vw; background: var(--color-white); border-radius: var(--radius-card); box-shadow: var(--shadow-lg); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--border-gray); }
.modal-title { margin: 0; font-size: var(--font-size-xl); }
.close-button { background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; }
.modal-content { padding: var(--space-4); }
.modal-footer { display: flex; gap: var(--space-3); justify-content: flex-end; padding: var(--space-4); border-top: 1px solid var(--border-gray); }
.form-group { margin-bottom: var(--space-4); }
</style>


