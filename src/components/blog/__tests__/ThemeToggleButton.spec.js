import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggleButton from '../ThemeToggleButton.vue'
import { useUIStore } from '@/stores/ui'

describe('ThemeToggleButton', () => {
  it('toggles theme between light and dark', async () => {
    setActivePinia(createPinia())
    const ui = useUIStore()
    ui.setTheme('light')

    const wrapper = mount(ThemeToggleButton)

    expect(ui.theme).toBe('light')

    await wrapper.trigger('click')
    expect(ui.theme).toBe('dark')

    await wrapper.trigger('click')
    expect(ui.theme).toBe('light')
  })
})



