import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dbService } from '@/services/supabase'

/**
 * Company Context Store
 * Manages the global company context used across blog authoring.
 * Persistence will be added later (e.g., Supabase).
 */
export const useCompanyContextStore = defineStore('companyContext', () => {
  // State
  const name = ref('')
  const mission = ref('')
  const values = ref([])
  const tone = ref('')
  const messaging = ref('')
  const brandVoiceGuidelines = ref('')
  const isActive = ref(true)

  // UI state
  // 'welcome' when no active record found, 'edit' while editing, 'view' after save/load
  const mode = ref('welcome')
  const saving = ref(false)

  // Getters
  const isValid = computed(() => name.value.trim().length > 0)

  // Actions
  const setField = (field, value) => {
    switch (field) {
      case 'name':
        name.value = value
        break
      case 'mission':
        mission.value = value
        break
      case 'values':
        values.value = Array.isArray(value) ? value : []
        break
      case 'tone':
        tone.value = value
        break
      case 'messaging':
        messaging.value = value
        break
      case 'brandVoiceGuidelines':
        brandVoiceGuidelines.value = value
        break
      case 'isActive':
        isActive.value = !!value
        break
      default:
        break
    }
  }

  const reset = () => {
    name.value = ''
    mission.value = ''
    values.value = []
    tone.value = ''
    messaging.value = ''
    brandVoiceGuidelines.value = ''
    isActive.value = true
  }

  const loadActive = async () => {
    const { success, data } = await dbService.getActiveCompanyContext()
    if (success && data) {
      name.value = data.name || ''
      mission.value = data.mission || ''
      values.value = Array.isArray(data.values) ? data.values : []
      tone.value = data.tone || ''
      messaging.value = data.messaging || ''
      brandVoiceGuidelines.value = data.brand_voice_guidelines || ''
      isActive.value = Boolean(data.is_active)
      mode.value = 'view'
    } else {
      mode.value = 'welcome'
    }
  }

  const start = () => {
    mode.value = 'edit'
  }

  const cancel = () => {
    if (mode.value === 'edit') {
      // Return to view if there is data, otherwise welcome
      if (name.value || mission.value || tone.value || messaging.value || brandVoiceGuidelines.value) {
        mode.value = 'view'
      } else {
        mode.value = 'welcome'
      }
    }
  }

  const saveContext = async () => {
    if (saving.value) return { success: false, skipped: true }
    saving.value = true
    try {
      const payload = {
        name: name.value,
        mission: mission.value,
        values: [...values.value],
        tone: tone.value,
        messaging: messaging.value,
        brandVoiceGuidelines: brandVoiceGuidelines.value,
        isActive: isActive.value,
      }
      const { success, data, error } = await dbService.saveCompanyContext(payload)
      if (!success) throw new Error(error || 'Save failed')
      mode.value = 'view'
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      saving.value = false
    }
  }

  return {
    // State
    name,
    mission,
    values,
    tone,
    messaging,
    brandVoiceGuidelines,
    isActive,
    mode,
    saving,

    // Getters
    isValid,

    // Actions
    setField,
    reset,
    loadActive,
    start,
    cancel,
    saveContext,
  }
})


