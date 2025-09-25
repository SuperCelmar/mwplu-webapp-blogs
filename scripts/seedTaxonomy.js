import { createClient } from '@supabase/supabase-js'

export const seedCategories = [
  { name: 'Urban Planning', slug: 'urban-planning', description: 'Articles about urban planning principles', color: '#2B6CB0', is_active: true },
  { name: 'Zoning', slug: 'zoning', description: 'Zoning rules and practices', color: '#9B2C2C', is_active: true },
  { name: 'PLU Guides', slug: 'plu-guides', description: 'Guides on PLU usage and compliance', color: '#2F855A', is_active: true },
  { name: 'Case Studies', slug: 'case-studies', description: 'Real-world examples and analyses', color: '#805AD5', is_active: true },
  { name: 'Regulatory Updates', slug: 'regulatory-updates', description: 'Latest rules and changes', color: '#B7791F', is_active: true },
  { name: 'Tutorials', slug: 'tutorials', description: 'How-to tutorials and walkthroughs', color: '#2C5282', is_active: true },
  { name: 'Tools & Methods', slug: 'tools-methods', description: 'Methods, frameworks and tools', color: '#744210', is_active: true },
  { name: 'News & Events', slug: 'news-events', description: 'Announcements and events', color: '#4A5568', is_active: true },
]

export const seedTags = [
  { name: 'SEO', slug: 'seo', description: 'Search engine optimization' },
  { name: 'Zoning', slug: 'zoning', description: 'Zoning rules' },
  { name: 'PLU', slug: 'plu', description: 'Plan Local d’Urbanisme' },
  { name: 'Urban Planning', slug: 'urban-planning', description: 'Urbanism and city design' },
  { name: 'Regulations', slug: 'regulations', description: 'Regulatory content' },
  { name: 'Case Study', slug: 'case-study', description: 'Case studies' },
  { name: 'Guide', slug: 'guide', description: 'Guides and how-to' },
  { name: 'Tutorial', slug: 'tutorial', description: 'Tutorials' },
  { name: 'Tools', slug: 'tools', description: 'Tools and utilities' },
  { name: 'Methods', slug: 'methods', description: 'Methods and frameworks' },
  { name: 'Analytics', slug: 'analytics', description: 'Measurement and reporting' },
  { name: 'Policy', slug: 'policy', description: 'Policies' },
  { name: 'Environment', slug: 'environment', description: 'Environmental topics' },
  { name: 'Housing', slug: 'housing', description: 'Housing topics' },
  { name: 'Mobility', slug: 'mobility', description: 'Transport and mobility' },
]

async function upsertRows(supabaseClient, tableName, rows, conflictColumn) {
  if (!rows.length) return
  const { error } = await supabaseClient
    .from(tableName)
    .upsert(rows, { onConflict: conflictColumn, ignoreDuplicates: false })
  if (error) throw error
}

export async function seedBlogTaxonomy(supabaseClient) {
  await upsertRows(supabaseClient, 'blog_categories', seedCategories, 'slug')
  await upsertRows(supabaseClient, 'blog_tags', seedTags, 'slug')
}

async function runCli() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
    process.exit(1)
  }
  const supabase = createClient(url, serviceRoleKey)
  await seedBlogTaxonomy(supabase)
  console.log('Seeded blog categories and tags.')
}

// Allow CLI execution via `npm run seed:blog` while remaining importable for tests
if (process.env.RUN_SEED === 'true') {
  runCli().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}


