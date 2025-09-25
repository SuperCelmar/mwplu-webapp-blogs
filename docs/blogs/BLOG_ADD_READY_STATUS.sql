-- BLOG_ADD_READY_STATUS.sql
-- Idempotent migration to include 'ready' in blog_articles.status CHECK constraint
-- Safe operation: adjusts only the check constraint when needed.

DO $$
DECLARE chk_name text;
BEGIN
  -- If 'ready' is already allowed, skip
  IF EXISTS (
    SELECT 1
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc
      ON cc.constraint_name = tc.constraint_name
     AND cc.constraint_schema = tc.constraint_schema
   WHERE tc.table_name = 'blog_articles'
     AND tc.table_schema = 'public'
     AND tc.constraint_type = 'CHECK'
     AND cc.check_clause ILIKE '%status%'
     AND cc.check_clause ILIKE '%ready%'
  ) THEN
    RAISE NOTICE 'blog_articles.status already includes "ready"';
  ELSE
    -- Find existing CHECK constraint name
    SELECT tc.constraint_name INTO chk_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
      ON cc.constraint_name = tc.constraint_name
     AND cc.constraint_schema = tc.constraint_schema
    WHERE tc.table_name = 'blog_articles'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'CHECK'
      AND cc.check_clause ILIKE '%status%';

    IF chk_name IS NULL THEN
      RAISE EXCEPTION 'CHECK constraint on blog_articles.status not found';
    END IF;

    -- Replace constraint allowing 'ready'
    EXECUTE format('ALTER TABLE public.blog_articles DROP CONSTRAINT %I', chk_name);
    ALTER TABLE public.blog_articles
      ADD CONSTRAINT blog_articles_status_check
      CHECK (status IN ('draft','ready','scheduled','published','archived'));
    RAISE NOTICE 'Added "ready" to blog_articles.status CHECK.';
  END IF;
END$$;


