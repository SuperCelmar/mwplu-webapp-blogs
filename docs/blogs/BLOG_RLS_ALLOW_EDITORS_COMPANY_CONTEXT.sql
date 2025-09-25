-- MWPLU Blog: Allow editors to manage company context
-- Safe, idempotent policy setup for public.company_context
-- Apply in Supabase SQL editor or via CLI.

begin;

-- Ensure RLS enabled
alter table public.company_context enable row level security;

-- Optional: relax select policy (keep as-is if it already exists)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'company_context'
      and policyname = 'Users can view active company context'
  ) then
    create policy "Users can view active company context"
      on public.company_context for select
      using (is_active = true);
  end if;
end $$;

-- Drop any previous admin-only manage policy and recreate for admins+editors
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'company_context'
      and policyname = 'Admins can manage company context'
  ) then
    drop policy "Admins can manage company context" on public.company_context;
  end if;
end $$;

-- Create the new manage policy (idempotent: create only if not existing)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'company_context'
      and policyname = 'Admins and editors can manage company context'
  ) then
    create policy "Admins and editors can manage company context"
      on public.company_context for all
      using (
        exists (
          select 1 from auth.users
          where auth.users.id = auth.uid()
            and (auth.users.raw_user_meta_data->>'role') in ('admin','editor')
        )
      )
      with check (
        exists (
          select 1 from auth.users
          where auth.users.id = auth.uid()
            and (auth.users.raw_user_meta_data->>'role') in ('admin','editor')
        )
      );
  end if;
end $$;

-- Enforce a single active record (partial unique index)
create unique index if not exists company_context_one_active_row
  on public.company_context ((is_active)) where is_active = true;

commit;


