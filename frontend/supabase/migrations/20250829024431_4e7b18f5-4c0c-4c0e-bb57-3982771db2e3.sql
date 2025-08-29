-- Create IEP tables with RLS (owner-only + admin override)
-- Helper: ensure gen_random_uuid is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- profiles table assumed exists with user_id unique and role column
-- Students table assumed exists

CREATE TABLE IF NOT EXISTS public.iep_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  title text,
  storage_path text not null,
  pages int,
  uploaded_at timestamptz not null default now()
);

ALTER TABLE public.iep_documents ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD their docs
CREATE POLICY "iep_documents_select_owner" ON public.iep_documents FOR SELECT USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_documents_insert_owner" ON public.iep_documents FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_documents_update_owner" ON public.iep_documents FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_documents_delete_owner" ON public.iep_documents FOR DELETE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

-- Parsed text chunks
CREATE TABLE IF NOT EXISTS public.iep_text_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.iep_documents (id) on delete cascade,
  idx int not null,
  content text not null,
  tokens int,
  created_at timestamptz not null default now()
);

ALTER TABLE public.iep_text_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iep_text_chunks_owner_select" ON public.iep_text_chunks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.iep_documents d WHERE d.id = doc_id AND (d.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')))
);
CREATE POLICY "iep_text_chunks_owner_insert" ON public.iep_text_chunks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.iep_documents d WHERE d.id = doc_id AND (d.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')))
);
CREATE POLICY "iep_text_chunks_owner_update" ON public.iep_text_chunks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.iep_documents d WHERE d.id = doc_id AND (d.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')))
);
CREATE POLICY "iep_text_chunks_owner_delete" ON public.iep_text_chunks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.iep_documents d WHERE d.id = doc_id AND (d.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')))
);

-- Analyses
CREATE TABLE IF NOT EXISTS public.iep_analysis (
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

ALTER TABLE public.iep_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iep_analysis_owner_select" ON public.iep_analysis FOR SELECT USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_analysis_owner_insert" ON public.iep_analysis FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_analysis_owner_update" ON public.iep_analysis FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_analysis_owner_delete" ON public.iep_analysis FOR DELETE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

-- Action drafts
CREATE TABLE IF NOT EXISTS public.iep_action_drafts (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.iep_analysis (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

ALTER TABLE public.iep_action_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iep_action_drafts_owner_select" ON public.iep_action_drafts FOR SELECT USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_action_drafts_owner_insert" ON public.iep_action_drafts FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_action_drafts_owner_update" ON public.iep_action_drafts FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));
CREATE POLICY "iep_action_drafts_owner_delete" ON public.iep_action_drafts FOR DELETE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

-- Storage bucket: private 'iep-docs'
INSERT INTO storage.buckets (id, name, public)
VALUES ('iep-docs','iep-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for owner-only access via path prefix auth.uid()
CREATE POLICY "iep_docs_read_own" ON storage.objects FOR SELECT USING (
  bucket_id = 'iep-docs' AND auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);
CREATE POLICY "iep_docs_insert_own" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'iep-docs' AND auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);
CREATE POLICY "iep_docs_update_own" ON storage.objects FOR UPDATE USING (
  bucket_id = 'iep-docs' AND auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);
CREATE POLICY "iep_docs_delete_own" ON storage.objects FOR DELETE USING (
  bucket_id = 'iep-docs' AND auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);