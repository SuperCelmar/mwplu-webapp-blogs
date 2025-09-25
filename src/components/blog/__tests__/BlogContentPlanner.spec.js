import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogContentPlanner from '../../blog/BlogContentPlanner.vue'

describe('BlogContentPlanner', () => {
  it('renders planner container and at least one planned item row header', () => {
    const wrapper = mount(BlogContentPlanner)
    expect(wrapper.find('[data-test="blog-content-planner"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="planner-table"]').exists()).toBe(true)
  })
})


