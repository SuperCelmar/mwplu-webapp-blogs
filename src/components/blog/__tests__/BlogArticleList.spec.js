import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogArticleList from '../../blog/BlogArticleList.vue'

function factory() {
  return mount(BlogArticleList)
}

describe('BlogArticleList', () => {
  it('renders list container and empty state', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-test="blog-article-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="empty-state"]').exists()).toBe(true)
  })

  it('has status filter options including draft', () => {
    const wrapper = factory()
    const options = wrapper.findAll('select#filter option').map((o) => o.element.value)
    expect(options).toContain('draft')
  })
})


