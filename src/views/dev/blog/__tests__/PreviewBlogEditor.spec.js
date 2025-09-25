import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PreviewBlogEditor from '../PreviewBlogEditor.vue'
import { dbService } from '@/services/supabase'

vi.mock('@/services/supabase', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    dbService: {
      ...actual.dbService,
      validateSEO: vi.fn().mockResolvedValue({ success: true, data: { score: 88 } }),
      saveBlogDraft: vi.fn().mockResolvedValue({ success: true, data: { id: 'draft-1' } }),
      upsertBlogDraft: vi.fn().mockResolvedValue({ success: true, data: { id: 'draft-1', status: 'draft' } }),
      getBlogCategories: vi.fn().mockResolvedValue({ success: true, data: [{ id: 'c1', name: 'Cat' }] }),
      getBlogTags: vi.fn().mockResolvedValue({ success: true, data: [{ id: 't1', name: 'Tag' }, { id: 't2', name: 'Tag 2' }] }),
      setArticleTags: vi.fn().mockResolvedValue({ success: true }),
      markArticleReady: vi.fn().mockResolvedValue({ success: true, data: { id: 'draft-1', status: 'ready' } }),
    },
  }
})

describe('PreviewBlogEditor (integration)', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(PreviewBlogEditor, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {},
      },
    })
  })

  it('opens metadata modal and validates metadata', async () => {
    // Open metadata
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    // In modal, set minimal fields
    await wrapper.find('[data-test="meta-title"]').setValue('Title')
    await wrapper.find('[data-test="meta-slug"]').setValue('title')
    // Validate SEO from modal
    await wrapper.find('[data-test="meta-validate"]').trigger('click')
    expect(dbService.validateSEO).toHaveBeenCalled()
  })

  it('saves draft and marks ready with gating', async () => {
    await wrapper.find('[data-test="editor-input"]').setValue('Content')

    // open modal and save minimal valid meta
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-title"]').setValue('Title')
    await wrapper.find('[data-test="meta-slug"]').setValue('title')
    await wrapper.find('[data-test="meta-save"]').trigger('click')

    // save draft
    await wrapper.find('[data-test="action-save-draft"]').trigger('click')
    expect(dbService.saveBlogDraft).toHaveBeenCalled()

    // validate to enable publish
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-validate"]').trigger('click')

    // mark ready
    await wrapper.find('[data-test="action-publish"]').trigger('click')
    expect(dbService.markArticleReady).toHaveBeenCalled()
  })

  it('persist metadata on modal save when no draft exists (category, tags, cover)', async () => {
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-title"]').setValue('Meta Title')
    await wrapper.find('[data-test="meta-slug"]').setValue('meta-slug')
    await wrapper.find('[data-test="meta-excerpt"]').setValue('Desc')
    // choose category
    await wrapper.find('[data-test="meta-category"]').setValue('c1')
    // choose tags: checkboxes
    const tagInputs = wrapper.findAll('input[type="checkbox"]')
    await tagInputs[0].setValue(true)
    await wrapper.find('[data-test="meta-cover"]').setValue('https://img.test/cover.jpg')

    await wrapper.find('[data-test="meta-save"]').trigger('click')

    expect(dbService.saveBlogDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        meta_title: 'Meta Title',
        meta_description: 'Desc',
        canonical_url: '/blog/meta-slug',
        category_id: 'c1',
        cover_image_url: 'https://img.test/cover.jpg',
      }),
    )
    // After draft creation, tags should be set
    expect(dbService.setArticleTags).toHaveBeenCalledWith('draft-1', expect.arrayContaining(['t1']))
  })

  it('persist metadata on modal save when draft exists (uses upsert and sets tags)', async () => {
    // Create draft first via save draft button
    await wrapper.find('[data-test="editor-input"]').setValue('Some content')
    await wrapper.find('[data-test="action-save-draft"]').trigger('click')
    expect(dbService.saveBlogDraft).toHaveBeenCalled()

    // Open metadata and change fields
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-title"]').setValue('Meta Title 2')
    await wrapper.find('[data-test="meta-slug"]').setValue('meta-slug-2')
    await wrapper.find('[data-test="meta-excerpt"]').setValue('Desc 2')
    await wrapper.find('[data-test="meta-category"]').setValue('c1')
    const tagInputs = wrapper.findAll('input[type="checkbox"]')
    await tagInputs[1].setValue(true)
    await wrapper.find('[data-test="meta-cover"]').setValue('https://img.test/cover2.jpg')

    await wrapper.find('[data-test="meta-save"]').trigger('click')

    expect(dbService.upsertBlogDraft).toHaveBeenCalledWith(
      'draft-1',
      expect.objectContaining({
        meta_title: 'Meta Title 2',
        meta_description: 'Desc 2',
        canonical_url: '/blog/meta-slug-2',
        category_id: 'c1',
        cover_image_url: 'https://img.test/cover2.jpg',
        tag_ids: expect.arrayContaining(['t2']),
      }),
    )
    expect(dbService.setArticleTags).toHaveBeenCalledWith('draft-1', expect.arrayContaining(['t2']))
  })

  it('redirects to dashboard immediately on save draft', async () => {
    // Provide content to enable save
    await wrapper.find('[data-test="editor-input"]').setValue('Content for redirect test')

    // Spy on router
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()

    await wrapper.find('[data-test="action-save-draft"]').trigger('click')

    expect(dbService.saveBlogDraft).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith({ name: 'dev-blog-dashboard' })
  })

  it('redirects to dashboard after marking ready', async () => {
    // Fake timers to control setTimeout
    vi.useFakeTimers()

    // Provide content and minimal valid metadata
    await wrapper.find('[data-test="editor-input"]').setValue('Content for ready redirect')
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-title"]').setValue('Title')
    await wrapper.find('[data-test="meta-slug"]').setValue('title')
    await wrapper.find('[data-test="meta-save"]').trigger('click')
    await wrapper.find('[data-test="action-open-metadata"]').trigger('click')
    await wrapper.find('[data-test="meta-validate"]').trigger('click')

    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()

    await wrapper.find('[data-test="action-publish"]').trigger('click')
    // Fast-forward timers
    vi.runAllTimers()

    expect(dbService.markArticleReady).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith({ name: 'dev-blog-dashboard' })

    vi.useRealTimers()
  })
})


