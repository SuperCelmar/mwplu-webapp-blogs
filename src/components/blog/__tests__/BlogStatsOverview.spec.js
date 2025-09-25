import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogStatsOverview from '../../blog/BlogStatsOverview.vue'

describe('BlogStatsOverview', () => {
  it('renders stats cards placeholders', () => {
    const wrapper = mount(BlogStatsOverview)
    expect(wrapper.find('[data-test="blog-stats-overview"]').exists()).toBe(true)
    const cards = wrapper.findAll('[data-test="stat-card"]')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })
})


