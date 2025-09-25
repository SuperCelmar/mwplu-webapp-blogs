import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import BlogArticleEditorView from '../BlogArticleEditorView.vue'

vi.mock('@/services/supabase', () => {
  return {
    dbService: {
      getBlogCategories: vi.fn().mockResolvedValue({ success: true, data: [] }),
      getBlogTags: vi.fn().mockResolvedValue({ success: true, data: [] }),
      getBlogArticleById: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '123',
          title: 'Sample',
          slug: 'sample',
          excerpt: 'ex',
          category_id: null,
          markdown_content: '# Hello',
          cover_image_url: null,
          og_image_url: null,
          twitter_image_url: null,
          status: 'ready',
        },
      }),
      getArticleTagIds: vi.fn().mockResolvedValue({ success: true, data: [] }),
      validateSEO: vi.fn().mockResolvedValue({ success: true, data: { score: 90 } }),
      upsertBlogDraft: vi.fn().mockResolvedValue({ success: true, data: {} }),
      scheduleArticle: vi.fn().mockResolvedValue({ success: true, data: { status: 'scheduled' } }),
    },
  }
})

describe('BlogArticleEditorView banner', () => {
  it('renders the admin banner at the top of the editor view', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/admin/blog/editor/:id', name: 'admin-blog-editor', component: BlogArticleEditorView },
      ],
    })
    router.push('/admin/blog/editor/123')
    await router.isReady()

    const pinia = createPinia()
    const wrapper = mount(BlogArticleEditorView, {
      global: { plugins: [router, pinia] },
    })

    expect(wrapper.find('[data-test="admin-banner"]').exists()).toBe(true)
  })

  it('shows "Planifier" button when article status is ready and opens schedule modal', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/admin/blog/editor/:id', name: 'admin-blog-editor', component: BlogArticleEditorView },
      ],
    })
    router.push('/admin/blog/editor/123')
    await router.isReady()

    const pinia = createPinia()
    const wrapper = mount(BlogArticleEditorView, {
      global: { plugins: [router, pinia] },
    })

    const actionBtn = wrapper.get('[data-test="action-publish"]')
    expect(actionBtn.text()).toContain('Planifier')

    await actionBtn.trigger('click')
    expect(wrapper.find('[data-test="schedule-modal"]').exists()).toBe(true)
  })

  it('schedules article via service when saving schedule', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/admin/blog/editor/:id', name: 'admin-blog-editor', component: BlogArticleEditorView },
      ],
    })
    router.push('/admin/blog/editor/123')
    await router.isReady()

    const pinia = createPinia()
    const wrapper = mount(BlogArticleEditorView, {
      global: { plugins: [router, pinia] },
    })

    await wrapper.get('[data-test="action-publish"]').trigger('click')
    // set a schedule date
    const inOneHour = new Date(Date.now() + 3600 * 1000).toISOString()
    await wrapper.get('[data-test="schedule-datetime"]').setValue(inOneHour)
    await wrapper.get('[data-test="schedule-save"]').trigger('click')

    const { dbService } = await import('@/services/supabase')
    expect(dbService.scheduleArticle).toHaveBeenCalledWith('123', expect.objectContaining({ scheduled_at: inOneHour }))
  })
})


