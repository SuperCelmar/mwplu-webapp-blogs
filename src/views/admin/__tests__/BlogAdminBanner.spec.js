import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'

describe('BlogAdminBanner', () => {
  it('renders banner with nav links and theme toggle', async () => {
    const router = createRouter({ history: createWebHistory(), routes: [] })
    const pinia = createPinia()
    const wrapper = mount(BlogAdminBanner, {
      global: { plugins: [router, pinia] },
    })

    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="theme-toggle"]').exists()).toBe(true)
    const links = wrapper.findAll('.admin-link')
    expect(links.length).toBeGreaterThanOrEqual(5)
  })
})


