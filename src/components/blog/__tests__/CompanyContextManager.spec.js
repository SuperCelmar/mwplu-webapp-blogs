import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CompanyContextManager from '../CompanyContextManager.vue'
import { useCompanyContextStore } from '@/stores/companyContext'
import { useAuthStore } from '@/stores/auth'

function factory() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(CompanyContextManager, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('CompanyContextManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows welcome first when no active record and no history section', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-test="company-context-manager"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="welcome"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="context-form"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="context-preview"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="context-history"]').exists()).toBe(false)
  })

  it('validates all required fields on save', async () => {
    const wrapper = factory()
    await wrapper.find('[data-test="action-start"]').trigger('click')

    const saveBtn = wrapper.find('[data-test="action-save"]')
    await saveBtn.trigger('click')

    expect(wrapper.find('[data-test="error-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="error-mission"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="error-tone"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="error-messaging"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="error-brand"]').exists()).toBe(true)
  })

  it('updates preview when inputs change', async () => {
    const wrapper = factory()
    await wrapper.find('[data-test="action-start"]').trigger('click')

    const nameInput = wrapper.find('input[name="name"]')
    const missionInput = wrapper.find('textarea[name="mission"]')

    await nameInput.setValue('MWPLU')
    await missionInput.setValue('Empower cities with transparent urban planning')

    const namePreview = wrapper.find('[data-test="preview-name"]')
    const missionPreview = wrapper.find('[data-test="preview-mission"]')

    expect(namePreview.text()).toContain('MWPLU')
    expect(missionPreview.text()).toContain('Empower cities with transparent urban planning')
  })

  it('calls save once when clicking save rapidly', async () => {
    const wrapper = factory()
    await wrapper.find('[data-test="action-start"]').trigger('click')

    const store = useCompanyContextStore()
    const saveMock = vi.spyOn(store, 'saveContext').mockResolvedValue({ success: true })

    // Fill required fields
    await wrapper.find('input[name="name"]').setValue('MWPLU')
    await wrapper.find('textarea[name="mission"]').setValue('Mission')
    await wrapper.find('input[name="tone"]').setValue('Professional')
    await wrapper.find('textarea[name="messaging"]').setValue('Clear messaging')
    await wrapper.find('textarea[name="brand"]').setValue('Brand guide')

    const saveBtn = wrapper.find('[data-test="action-save"]')
    await Promise.all([saveBtn.trigger('click'), saveBtn.trigger('click')])

    expect(saveMock).toHaveBeenCalledTimes(1)
  })

  it('follows welcome → edit → view, and shows Edit only when authenticated', async () => {
    const wrapper = factory()

    // shows welcome if no record
    expect(wrapper.find('[data-test="welcome"]').exists()).toBe(true)

    // enter edit mode
    await wrapper.find('[data-test="action-start"]').trigger('click')
    expect(wrapper.find('[data-test="context-form"]').exists()).toBe(true)

    // stub save success
    const store = useCompanyContextStore()
    vi.spyOn(store, 'saveContext').mockResolvedValue({ success: true })

    // fill required fields and save
    await wrapper.find('input[name="name"]').setValue('MWPLU')
    await wrapper.find('textarea[name="mission"]').setValue('Mission')
    await wrapper.find('input[name="tone"]').setValue('Professional')
    await wrapper.find('textarea[name="messaging"]').setValue('Clear messaging')
    await wrapper.find('textarea[name="brand"]').setValue('Brand guide')
    await wrapper.find('[data-test="action-save"]').trigger('click')

    // view mode, edit hidden when not authenticated
    expect(wrapper.find('[data-test="context-view"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="action-edit"]').exists()).toBe(false)

    // authenticate user, Edit should appear
    const auth = useAuthStore()
    // simulate a session and user in the store (auth store uses refs)
    auth.$patch({ session: { access_token: 'token' }, user: { id: 'u1', email: 'a@b.c' } })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="action-edit"]').exists()).toBe(true)
  })
})


