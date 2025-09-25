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
        },
      }),
      getArticleTagIds: vi.fn().mockResolvedValue({ success: true, data: [] }),
      validateSEO: vi.fn().mockResolvedValue({ success: true, data: { score: 90 } }),
      upsertBlogDraft: vi.fn().mockResolvedValue({ success: true, data: {} }),
      publishArticle: vi.fn().mockResolvedValue({ success: true, data: {} }),
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
})


