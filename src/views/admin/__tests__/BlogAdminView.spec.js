import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BlogAdminView from '../BlogAdminView.vue'

describe('BlogAdminView', () => {
  it('composes the BlogDashboard and CompanyContextManager inside the admin view and shows admin banner with theme toggle', async () => {
    const pinia = createPinia()
    const router = createRouter({ history: createWebHistory(), routes: [] })
    const wrapper = mount(BlogAdminView, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.find('[data-test="blog-dashboard"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="company-context-section"]').exists()).toBe(true)

    // New banner and toggle
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="theme-toggle"]').exists()).toBe(true)
  })
})


