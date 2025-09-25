import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPreviewCarousel from '../../blog/BlogPreviewCarousel.vue'

function factory(article = {}) {
  return mount(BlogPreviewCarousel, {
    props: {
      article: {
        title: 'Titre de test',
        slug: 'mon-article',
        excerpt: 'Petit résumé de test',
        content: '# Titre\n\nContenu de test',
        cover_image_url: 'https://example.com/image.jpg',
        ...article,
      },
    },
  })
}

describe('BlogPreviewCarousel', () => {
  it('renders 4 slides and navigation controls', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-test="carousel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slide-article"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slide-listing"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slide-serp"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slide-twitter"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="prev"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="next"]').exists()).toBe(true)
  })

  it('toggles SERP theme between light and dark', async () => {
    const wrapper = factory()
    // Move to SERP slide
    await wrapper.find('[data-test="next"]').trigger('click')
    await wrapper.find('[data-test="next"]').trigger('click')
    const serp = wrapper.find('[data-test="slide-serp"] .serp')
    expect(serp.exists()).toBe(true)

    // Toggle theme
    await wrapper.find('[data-test="serp-theme-toggle"]').trigger('click')
    expect(serp.classes()).toContain('serp-dark')

    await wrapper.find('[data-test="serp-theme-toggle"]').trigger('click')
    expect(serp.classes()).not.toContain('serp-dark')
  })

  it('shows SERP toggle only on SERP slide', async () => {
    const wrapper = factory()
    // Initially on Article
    expect(wrapper.find('[data-test="serp-theme-toggle"]').exists()).toBe(false)
    // Move to Listing
    await wrapper.find('[data-test="next"]').trigger('click')
    expect(wrapper.find('[data-test="serp-theme-toggle"]').exists()).toBe(false)
    // Move to SERP
    await wrapper.find('[data-test="next"]').trigger('click')
    expect(wrapper.find('[data-test="serp-theme-toggle"]').exists()).toBe(true)
    // Move to Twitter
    await wrapper.find('[data-test="next"]').trigger('click')
    expect(wrapper.find('[data-test="serp-theme-toggle"]').exists()).toBe(false)
  })

  it('applies SERP and Twitter brand cues and listing hover semantics', async () => {
    const wrapper = factory()
    const serp = wrapper.find('[data-test="slide-serp"] .serp')
    const twitter = wrapper.find('[data-test="slide-twitter"] .twitter-card')
    const listing = wrapper.find('[data-test="slide-listing"] .listing-row')
    expect(serp.exists()).toBe(true)
    expect(twitter.exists()).toBe(true)
    expect(listing.exists()).toBe(true)

    // Simulate hover on listing (class should toggle via :hover CSS; here we assert role/pointer)
    expect(listing.attributes('role')).toBe('link')
    expect(listing.attributes('tabindex')).toBe('0')
  })

  it('navigates between slides with next/prev', async () => {
    const wrapper = factory()
    const getVisible = () => wrapper.findAll('[data-test^="slide-"]').find(el => el.attributes('aria-hidden') === 'false')

    // Initial: first slide visible
    expect(getVisible()?.attributes('data-test')).toBe('slide-article')

    // Next
    await wrapper.find('[data-test="next"]').trigger('click')
    expect(getVisible()?.attributes('data-test')).toBe('slide-listing')

    // Next
    await wrapper.find('[data-test="next"]').trigger('click')
    expect(getVisible()?.attributes('data-test')).toBe('slide-serp')

    // Prev
    await wrapper.find('[data-test="prev"]').trigger('click')
    expect(getVisible()?.attributes('data-test')).toBe('slide-listing')
  })

  it('applies sensible fallbacks for SEO and social fields', () => {
    const wrapper = factory({
      meta_title: '',
      meta_description: '',
      og_title: '',
      og_description: '',
      twitter_title: '',
      twitter_description: '',
      twitter_image_url: '',
      og_image_url: '',
      cover_image_url: '',
    })

    // SERP: title falls back to article title, description to excerpt
    const serp = wrapper.find('[data-test="slide-serp"]')
    expect(serp.text()).toContain('Titre de test')
    expect(serp.text()).toContain('Petit résumé de test')

    // Twitter: falls back to article fields for title/description
    const tw = wrapper.find('[data-test="slide-twitter"]')
    expect(tw.text()).toContain('Titre de test')
    expect(tw.text()).toContain('Petit résumé de test')
  })

  it('renders markdown-like content in article preview (basic transform presence)', () => {
    const wrapper = factory({ content: '# Heading\n\n**bold** _italic_' })
    const article = wrapper.find('[data-test="slide-article"]')
    // We expect at least the raw text to include the heading word
    expect(article.text()).toContain('Heading')
    // And presence of bold/italic words raw content
    expect(article.text()).toContain('bold')
    expect(article.text()).toContain('italic')
  })
})
