-- 1) Create IEP tables with RLS (owner-only + admin override)
-- Helper: ensure gen_random_uuid is available
create extension if not exists pgcrypto;

-- profiles table assumed exists with user_id unique and role column
-- Students table assumed exists

create table if not exists public.iep_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  title text,
  storage_path text not null,
  pages int,
  uploaded_at timestamptz not null default now()
);

alter table public.iep_documents enable row level security;

-- Owner can CRUD their docs
create policy if not exists "iep_documents_select_owner" on public.iep_documents for select using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_documents_insert_owner" on public.iep_documents for insert with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_documents_update_owner" on public.iep_documents for update using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_documents_delete_owner" on public.iep_documents for delete using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));

-- Parsed text chunks
create table if not exists public.iep_text_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.iep_documents (id) on delete cascade,
  idx int not null,
  content text not null,
  tokens int,
  created_at timestamptz not null default now()
);

alter table public.iep_text_chunks enable row level security;
create policy if not exists "iep_text_chunks_owner_select" on public.iep_text_chunks for select using (
  exists (select 1 from public.iep_documents d where d.id = doc_id and (d.user_id = auth.uid() or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')))
);
create policy if not exists "iep_text_chunks_owner_insert" on public.iep_text_chunks for insert with check (
  exists (select 1 from public.iep_documents d where d.id = doc_id and (d.user_id = auth.uid() or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')))
);
create policy if not exists "iep_text_chunks_owner_update" on public.iep_text_chunks for update using (
  exists (select 1 from public.iep_documents d where d.id = doc_id and (d.user_id = auth.uid() or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')))
);
create policy if not exists "iep_text_chunks_owner_delete" on public.iep_text_chunks for delete using (
  exists (select 1 from public.iep_documents d where d.id = doc_id and (d.user_id = auth.uid() or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')))
);

-- Analyses
create table if not exists public.iep_analysis (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.iep_documents (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  model text not null,
  kind text not null check (kind in ('quality','compliance')),
  version int not null default 1,
  summary jsonb not null,
  scores jsonb not null,
  flags jsonb not null,
  recommendations jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.iep_analysis enable row level security;
create policy if not exists "iep_analysis_owner_select" on public.iep_analysis for select using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_analysis_owner_insert" on public.iep_analysis for insert with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_analysis_owner_update" on public.iep_analysis for update using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_analysis_owner_delete" on public.iep_analysis for delete using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));

-- Action drafts
create table if not exists public.iep_action_drafts (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.iep_analysis (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.iep_action_drafts enable row level security;
create policy if not exists "iep_action_drafts_owner_select" on public.iep_action_drafts for select using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_action_drafts_owner_insert" on public.iep_action_drafts for insert with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_action_drafts_owner_update" on public.iep_action_drafts for update using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));
create policy if not exists "iep_action_drafts_owner_delete" on public.iep_action_drafts for delete using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
));

-- 2) Storage bucket: private 'iep-docs'
insert into storage.buckets (id, name, public)
values ('iep-docs','iep-docs', false)
on conflict (id) do nothing;

-- Storage policies for owner-only access via path prefix auth.uid()
create policy if not exists "iep_docs_read_own" on storage.objects for select using (
  bucket_id = 'iep-docs' and auth.uid()::text = (storage.foldername(name))[1] or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
  )
);
create policy if not exists "iep_docs_insert_own" on storage.objects for insert with check (
  bucket_id = 'iep-docs' and auth.uid()::text = (storage.foldername(name))[1] or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
  )
);
create policy if not exists "iep_docs_update_own" on storage.objects for update using (
  bucket_id = 'iep-docs' and auth.uid()::text = (storage.foldername(name))[1] or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
  )
);
create policy if not exists "iep_docs_delete_own" on storage.objects for delete using (
  bucket_id = 'iep-docs' and auth.uid()::text = (storage.foldername(name))[1] or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'
  )
);
