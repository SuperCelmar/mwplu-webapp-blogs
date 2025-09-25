-- BLOG_PHASE_2_VALIDATION.sql
-- Idempotent migration to add 'ready' to blog_articles.status CHECK constraint
-- Safe for production: does not drop or recreate table; adjusts constraint only if needed.

DO $$
BEGIN
  -- Check if constraint already allows 'ready'
  IF EXISTS (
    SELECT 1
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc
      ON cc.constraint_name = tc.constraint_name
     AND cc.constraint_schema = tc.constraint_schema
   WHERE tc.table_name = 'blog_articles'
     AND tc.constraint_type = 'CHECK'
     AND cc.check_clause ILIKE '%status%' AND cc.check_clause ILIKE '%ready%'
  ) THEN
    RAISE NOTICE 'blog_articles.status already allows \"ready\"';
  ELSE
    -- Find the existing check constraint name
    DECLARE chk_name text;
    BEGIN
      SELECT tc.constraint_name INTO chk_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc
        ON cc.constraint_name = tc.constraint_name
       AND cc.constraint_schema = tc.constraint_schema
      WHERE tc.table_name = 'blog_articles'
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause ILIKE '%status%';

      IF chk_name IS NULL THEN
        RAISE EXCEPTION 'Could not find CHECK constraint on blog_articles.status';
      END IF;

      -- Drop existing constraint and recreate with added 'ready'
      EXECUTE format('ALTER TABLE public.blog_articles DROP CONSTRAINT %I', chk_name);
      ALTER TABLE public.blog_articles
        ADD CONSTRAINT blog_articles_status_check
        CHECK (status IN ('draft','ready','scheduled','published','archived'));
      RAISE NOTICE 'Updated blog_articles.status CHECK to include \"ready\"';
    END;
  END IF;
END$$;

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


