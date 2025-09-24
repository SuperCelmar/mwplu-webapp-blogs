-- MWPLU Blog - Phase 2 (Policies & Triggers)
-- This migration adds idempotent updated_at triggers and ensures RLS is enabled.

BEGIN;

-- Ensure helper function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on target tables (idempotent)
ALTER TABLE public.company_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content_planner ENABLE ROW LEVEL SECURITY;

-- Create triggers if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'company_context'
      AND t.tgname = 'update_company_context_updated_at'
  ) THEN
    CREATE TRIGGER update_company_context_updated_at
    BEFORE UPDATE ON public.company_context
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'blog_articles'
      AND t.tgname = 'update_blog_articles_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_articles_updated_at
    BEFORE UPDATE ON public.blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'blog_content_planner'
      AND t.tgname = 'update_blog_content_planner_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_content_planner_updated_at
    BEFORE UPDATE ON public.blog_content_planner
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

COMMIT;

-- Notes:
-- - Policies for these tables already exist and are validated by BLOG_PHASE_2_VALIDATION.sql
-- - This file is safe to run multiple times.


