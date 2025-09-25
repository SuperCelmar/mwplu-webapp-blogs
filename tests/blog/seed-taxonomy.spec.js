import { describe, it, expect, beforeAll, test } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { seedBlogTaxonomy, seedCategories, seedTags } from '../../scripts/seedTaxonomy.js'

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const hasEnv = requiredEnv.every((k) => !!process.env[k])

const expectedCategorySlugs = seedCategories.map((c) => c.slug)
const expectedTagSlugs = seedTags.map((t) => t.slug)

// Skip tests when env is not set to avoid accidental remote usage
const describeMaybe = hasEnv ? describe : describe.skip

describeMaybe('blog taxonomy seed', () => {
  const supabase = hasEnv
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null

  beforeAll(async () => {
    await seedBlogTaxonomy(supabase)
  })

  it('categories are present', async () => {
    const { data, error } = await supabase.from('blog_categories').select('slug')
    expect(error).toBeNull()
    const slugs = new Set((data ?? []).map((r) => r.slug))
    expectedCategorySlugs.forEach((s) => expect(slugs.has(s)).toBe(true))
  })

  it('tags are present', async () => {
    const { data, error } = await supabase.from('blog_tags').select('slug')
    expect(error).toBeNull()
    const slugs = new Set((data ?? []).map((r) => r.slug))
    expectedTagSlugs.forEach((s) => expect(slugs.has(s)).toBe(true))
  })

  it('seeding is idempotent (counts unchanged)', async () => {
    const { count: catBefore } = await supabase.from('blog_categories').select('*', { count: 'exact', head: true })
    const { count: tagBefore } = await supabase.from('blog_tags').select('*', { count: 'exact', head: true })

    await seedBlogTaxonomy(supabase)

    const { count: catAfter } = await supabase.from('blog_categories').select('*', { count: 'exact', head: true })
    const { count: tagAfter } = await supabase.from('blog_tags').select('*', { count: 'exact', head: true })

    expect(catAfter).toBe(catBefore)
    expect(tagAfter).toBe(tagBefore)
  })
})

// Informative test explaining how to run these in dev
test('info: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to run taxonomy seed tests', () => {
  expect(true).toBe(true)
})


