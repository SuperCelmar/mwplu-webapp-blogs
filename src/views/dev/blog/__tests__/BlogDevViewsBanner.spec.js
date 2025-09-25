import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import PreviewBlogDashboard from '@/views/dev/blog/PreviewBlogDashboard.vue'
import PreviewBlogStatsOverview from '@/views/dev/blog/PreviewBlogStatsOverview.vue'
import PreviewBlogContentPlanner from '@/views/dev/blog/PreviewBlogContentPlanner.vue'
import PreviewBlogArticleList from '@/views/dev/blog/PreviewBlogArticleList.vue'
import PreviewBlogSchedulingCalendar from '@/views/dev/blog/PreviewBlogSchedulingCalendar.vue'
import PreviewBlogEditor from '@/views/dev/blog/PreviewBlogEditor.vue'

const mountWithRouter = (component) => {
  const router = createRouter({ history: createWebHistory(), routes: [] })
  const pinia = createPinia()
  return mount(component, { global: { plugins: [router, pinia] } })
}

describe('Dev blog preview views banner', () => {
  it('shows banner in dashboard preview', () => {
    const wrapper = mountWithRouter(PreviewBlogDashboard)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows banner in stats overview preview', () => {
    const wrapper = mountWithRouter(PreviewBlogStatsOverview)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows banner in content planner preview', () => {
    const wrapper = mountWithRouter(PreviewBlogContentPlanner)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows banner in article list preview', () => {
    const wrapper = mountWithRouter(PreviewBlogArticleList)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows banner in scheduling calendar preview', () => {
    const wrapper = mountWithRouter(PreviewBlogSchedulingCalendar)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows banner in editor preview', () => {
    const wrapper = mountWithRouter(PreviewBlogEditor)
    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })
})


