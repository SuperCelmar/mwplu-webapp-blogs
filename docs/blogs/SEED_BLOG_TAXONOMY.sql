-- Blog taxonomy seed (idempotent)
-- Categories
WITH data(name, slug, description, color) AS (
  VALUES
    ('Urban Planning', 'urban-planning', 'Articles about urban planning principles', '#2B6CB0'),
    ('Zoning', 'zoning', 'Zoning rules and practices', '#9B2C2C'),
    ('PLU Guides', 'plu-guides', 'Guides on PLU usage and compliance', '#2F855A'),
    ('Case Studies', 'case-studies', 'Real-world examples and analyses', '#805AD5'),
    ('Regulatory Updates', 'regulatory-updates', 'Latest rules and changes', '#B7791F'),
    ('Tutorials', 'tutorials', 'How-to tutorials and walkthroughs', '#2C5282'),
    ('Tools & Methods', 'tools-methods', 'Methods, frameworks and tools', '#744210'),
    ('News & Events', 'news-events', 'Announcements and events', '#4A5568')
)
INSERT INTO blog_categories (name, slug, description, color, is_active)
SELECT name, slug, description, color, true
FROM data
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = COALESCE(EXCLUDED.color, blog_categories.color),
    is_active = true;

-- Tags
WITH data(name, slug, description) AS (
  VALUES
    ('SEO', 'seo', 'Search engine optimization'),
    ('Zoning', 'zoning', 'Zoning rules'),
    ('PLU', 'plu', 'Plan Local d’Urbanisme'),
    ('Urban Planning', 'urban-planning', 'Urbanism and city design'),
    ('Regulations', 'regulations', 'Regulatory content'),
    ('Case Study', 'case-study', 'Case studies'),
    ('Guide', 'guide', 'Guides and how-to'),
    ('Tutorial', 'tutorial', 'Tutorials'),
    ('Tools', 'tools', 'Tools and utilities'),
    ('Methods', 'methods', 'Methods and frameworks'),
    ('Analytics', 'analytics', 'Measurement and reporting'),
    ('Policy', 'policy', 'Policies'),
    ('Environment', 'environment', 'Environmental topics'),
    ('Housing', 'housing', 'Housing topics'),
    ('Mobility', 'mobility', 'Transport and mobility')
)
INSERT INTO blog_tags (name, slug, description)
SELECT name, slug, description
FROM data
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = COALESCE(EXCLUDED.description, blog_tags.description);


