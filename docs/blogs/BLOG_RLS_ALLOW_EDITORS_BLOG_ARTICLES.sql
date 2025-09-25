-- MWPLU Blog: Allow editors and admins to manage blog articles
-- Match approach used in public.company_context (role in auth.users.raw_user_meta_data)
-- Safe, idempotent. Apply in Supabase SQL editor or via CLI.

begin;

-- Ensure table exists assumptions:
-- public.blog_articles(author_id uuid null, status text, ...)
-- public.profiles(id uuid primary key) maps 1:1 to auth.users.id

-- 1) Ensure RLS enabled
alter table public.blog_articles enable row level security;

-- 2) Author FK -> public.profiles(id)
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints c
    where c.table_schema = 'public'
      and c.table_name = 'blog_articles'
      and c.constraint_type = 'FOREIGN KEY'
      and c.constraint_name = 'blog_articles_author_id_fkey'
  ) then
    alter table public.blog_articles
      drop constraint blog_articles_author_id_fkey;
  end if;
end $$;

alter table public.blog_articles
  add constraint blog_articles_author_id_fkey
  foreign key (author_id) references public.profiles(id)
  on update cascade on delete set null;

-- 3) Policies
-- Drop old manage policies if present
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'blog_articles'
      and policyname = 'Admins and editors can manage blog articles'
  ) then
    drop policy "Admins and editors can manage blog articles" on public.blog_articles;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'blog_articles'
      and policyname = 'Anyone can read blog articles'
  ) then
    drop policy "Anyone can read blog articles" on public.blog_articles;
  end if;
end $$;

-- Helper function: check current user's roles from auth.users via SECURITY DEFINER
-- Avoids granting SELECT on auth.users to client roles
create or replace function public.has_any_roles(p_roles text[])
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_has boolean := false;
begin
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and (u.raw_user_meta_data->>'role') = any (p_roles)
  ) into v_has;
  return coalesce(v_has, false);
end;
$$;

-- Read access for all (adjust as needed)
create policy "Anyone can read blog articles"
  on public.blog_articles for select
  using (true);

-- Manage (insert/update/delete) for admins and editors from auth.users metadata
create policy "Admins and editors can manage blog articles"
  on public.blog_articles for all
  to authenticated
  using (
    has_any_roles(array['admin','editor'])
    or author_id = auth.uid()
  )
  with check (
    has_any_roles(array['admin','editor'])
    or author_id = auth.uid()
  );

commit;

-- 4) Grants to allow policy evaluation that references auth.users
-- If policies (legacy or other tables) still read auth.users, ensure roles can SELECT it
grant usage on schema auth to authenticated;
grant select on table auth.users to authenticated;


