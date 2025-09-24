-- MWPLU Blog - Phase 2 Validation (Policies & Triggers)
-- Read-only checks to verify policies, functions, triggers, and indexes

-- 1) Policies present on blog tables
SELECT schemaname,
       tablename,
       policyname,
       cmd,
       permissive,
       roles,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'company_context',
    'blog_categories',
    'blog_tags',
    'blog_articles',
    'blog_article_tags',
    'blog_content_planner'
  )
ORDER BY tablename, policyname;

-- 2) RLS enabled flags
SELECT n.nspname AS schema,
       c.relname AS table,
       c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('company_context','blog_categories','blog_tags','blog_articles','blog_article_tags','blog_content_planner')
ORDER BY c.relname;

-- 3) Updated-at function exists
SELECT proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname = 'update_updated_at_column';

-- 4) Triggers created on target tables
SELECT t.tgname,
       c.relname AS table_name,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('company_context','blog_articles','blog_content_planner')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 5) Company context single active row index
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'company_context'
  AND indexname = 'company_context_one_active_row';


