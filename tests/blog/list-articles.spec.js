import { describe, it, expect } from 'vitest'
import { dbService } from '../../src/services/supabase'

describe('dbService.listBlogArticles', () => {
  it('returns simulated drafts when Supabase is not configured', async () => {
    const { success, data } = await dbService.listBlogArticles({ status: 'draft', page: 1, pageSize: 10 })
    expect(success).toBe(true)
    expect(Array.isArray(data.items)).toBe(true)
    expect(data.items.length).toBeGreaterThanOrEqual(1)
    expect(data.items.every((a) => a.status === 'draft')).toBe(true)
    expect(typeof data.total).toBe('number')
  })

  it('supports pagination shape', async () => {
    const { success, data } = await dbService.listBlogArticles({ status: 'all', page: 1, pageSize: 2 })
    expect(success).toBe(true)
    expect(data.items.length).toBeLessThanOrEqual(2)
    expect(typeof data.total).toBe('number')
    expect(typeof data.page).toBe('number')
    expect(typeof data.pageSize).toBe('number')
  })
})
