import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogEditor from '../../blog/BlogEditor.vue'

describe('BlogEditor', () => {
  it('renders header, sidebar, main, and footer sections', () => {
    const wrapper = mount(BlogEditor)
    expect(wrapper.find('[data-test="blog-editor"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-editor-header"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-editor-sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-editor-main"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="blog-editor-footer"]').exists()).toBe(true)
  })

  it('shows live preview mirroring markdown input', async () => {
    const wrapper = mount(BlogEditor)
    const textarea = wrapper.find('[data-test="editor-input"]')
    await textarea.setValue('# Hello\n\nThis is **bold** and *italic*.')
    const preview = wrapper.find('[data-test="editor-preview"]')
    expect(preview.text()).toContain('Hello')
    expect(preview.text()).toContain('This is')
  })

  it('emits save and validate events with payload including content and SEO fields', async () => {
    const wrapper = mount(BlogEditor)

    // Fill inputs
    await wrapper.find('[data-test="editor-input"]').setValue('Content body')
    await wrapper.find('[data-test="seo-meta-title"]').setValue('Meta Title')
    await wrapper.find('[data-test="seo-meta-description"]').setValue('Meta Description')
    await wrapper.find('[data-test="seo-canonical-url"]').setValue('https://example.com/blog/post')

    // Trigger save
    await wrapper.find('[data-test="action-save"]').trigger('click')
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents[0][0]).toMatchObject({
      content: 'Content body',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      canonicalUrl: 'https://example.com/blog/post'
    })

    // Trigger validate
    await wrapper.find('[data-test="action-validate"]').trigger('click')
    const validateEvents = wrapper.emitted('validate')
    expect(validateEvents).toBeTruthy()
    expect(validateEvents[0][0]).toMatchObject({
      content: 'Content body',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      canonicalUrl: 'https://example.com/blog/post'
    })
  })
})


