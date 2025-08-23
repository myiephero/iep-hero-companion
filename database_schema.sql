-- ===================================================================
-- GIFTED SNAPSHOT MODULE - SUPABASE DATABASE SCHEMA
-- ===================================================================
-- Execute this SQL in your Supabase SQL Editor
-- This script is resilient - creates tables/policies only if they don't exist

-- === SCHEMA: Gifted Snapshot module =========================

-- 1) Gifted Strength Profiles (per student)
create table if not exists gifted_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  owner_id uuid not null, -- parent user id (or creator)
  domain text not null,   -- e.g., Math, Language, Arts, STEM, Leadership, etc.
  strengths jsonb not null default '[]'::jsonb, -- [{label, evidence, level}]
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enrichment Goals
create table if not exists gifted_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  owner_id uuid not null, -- parent (or creator)
  title text not null,
  status text not null default 'active', -- active|completed|paused|cancelled
  target_date date,
  resources_hint text,  -- freeform text for recommended materials
  progress_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Resources (links or files)
create table if not exists gifted_resources (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  owner_id uuid not null,
  kind text not null default 'link',   -- link|file
  title text not null,
  url text,                            -- if kind=link
  storage_path text,                   -- if kind=file (Supabase Storage)
  created_at timestamptz not null default now()
);

-- 4) Comments on goals
create table if not exists gifted_comments (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- Light indexes
create index if not exists idx_gifted_profiles_student on gifted_profiles(student_id);
create index if not exists idx_gifted_goals_student on gifted_goals(student_id);
create index if not exists idx_gifted_resources_student on gifted_resources(student_id);
create index if not exists idx_gifted_comments_goal on gifted_comments(goal_id);

-- === STORAGE BUCKET (for file resources) =====================
-- Create a storage bucket for gifted resources
-- If it already exists, this is a no-op.
select
  case
    when exists (select 1 from storage.buckets where id = 'gifted-resources') then 'exists'
    else (select storage.create_bucket('gifted-resources', public := false))
  end as bucket_status;

-- === RLS: enable and policies ================================
alter table gifted_profiles enable row level security;
alter table gifted_goals enable row level security;
alter table gifted_resources enable row level security;
alter table gifted_comments enable row level security;

-- Helper: is_advocate_of(parent_id) via assignments
create or replace function is_advocate_of(parent uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from assignments a
    where a.parent_id = parent
      and a.advocate_id = auth.uid()
  );
$$;

-- Helper: is_owner_or_advocate(row_owner uuid)
create or replace function is_owner_or_advocate(row_owner uuid)
returns boolean language sql stable as $$
  select auth.uid() = row_owner or is_advocate_of(row_owner);
$$;

-- Determine owner (parent user) via students.parent_id
create or replace function student_owner(sid uuid)
returns uuid language sql stable as $$
  select s.parent_id from students s where s.id = sid
$$;

-- Policies: owner or assigned advocate can read
-- Gifted Profiles
drop policy if exists "gifted_profiles_read" on gifted_profiles;
create policy "gifted_profiles_read"
  on gifted_profiles for select
  using ( is_owner_or_advocate(student_owner(student_id)) );

drop policy if exists "gifted_profiles_write" on gifted_profiles;
create policy "gifted_profiles_write"
  on gifted_profiles for all
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

-- Gifted Goals
drop policy if exists "gifted_goals_read" on gifted_goals;
create policy "gifted_goals_read"
  on gifted_goals for select
  using ( is_owner_or_advocate(student_owner(student_id)) );

drop policy if exists "gifted_goals_write" on gifted_goals;
create policy "gifted_goals_write"
  on gifted_goals for all
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

-- Gifted Resources
drop policy if exists "gifted_resources_read" on gifted_resources;
create policy "gifted_resources_read"
  on gifted_resources for select
  using ( is_owner_or_advocate(student_owner(student_id)) );

drop policy if exists "gifted_resources_write" on gifted_resources;
create policy "gifted_resources_write"
  on gifted_resources for all
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

-- Gifted Comments (read if can read goal; write = author only)
drop policy if exists "gifted_comments_read" on gifted_comments;
create policy "gifted_comments_read"
  on gifted_comments for select
  using (
    exists (
      select 1 from gifted_goals g
      where g.id = gifted_comments.goal_id
        and is_owner_or_advocate(student_owner(g.student_id))
    )
  );

drop policy if exists "gifted_comments_write" on gifted_comments;  
create policy "gifted_comments_write"
  on gifted_comments for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- === VERIFICATION QUERIES =====================================
-- Run these to verify the schema was created correctly:

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'gifted_%';

-- Check policies exist  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename LIKE 'gifted_%';

-- Check storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'gifted-resources';