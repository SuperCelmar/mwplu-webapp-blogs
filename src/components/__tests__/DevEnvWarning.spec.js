import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import DevEnvWarning from '../common/DevEnvWarning.vue'

vi.stubEnv('DEV', 'true')

describe('DevEnvWarning', () => {
  it('renders message when Supabase is not configured', () => {
    const wrapper = mount(DevEnvWarning, {
      props: { isSupabaseConfigured: false },
    })
    expect(wrapper.text()).toContain('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  })

  it('does not render when Supabase is configured', () => {
    const wrapper = mount(DevEnvWarning, {
      props: { isSupabaseConfigured: true },
    })
    expect(wrapper.find('div').exists()).toBe(false)
  })
})
