import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogSchedulingCalendar from '../../blog/BlogSchedulingCalendar.vue'

describe('BlogSchedulingCalendar', () => {
  it('renders calendar container and header', () => {
    const wrapper = mount(BlogSchedulingCalendar)
    expect(wrapper.find('[data-test="blog-scheduling-calendar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="calendar-header"]').exists()).toBe(true)
  })
})


