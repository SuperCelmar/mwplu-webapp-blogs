import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogDashboard from '../../blog/BlogDashboard.vue'

describe('BlogDashboard', () => {
  it('renders the dashboard container and child sections', () => {
    const wrapper = mount(BlogDashboard)
    expect(wrapper.find('[data-test="blog-dashboard"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-stats-overview"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-content-planner"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-article-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-scheduling-calendar"]').exists()).toBe(true)
  })
})


