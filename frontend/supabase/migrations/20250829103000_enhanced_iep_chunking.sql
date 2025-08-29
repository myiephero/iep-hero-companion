-- Add enhanced fields for IEP text chunk section tagging and metadata
ALTER TABLE public.iep_text_chunks 
ADD COLUMN IF NOT EXISTS section_tag TEXT,
ADD COLUMN IF NOT EXISTS page_index INTEGER,
ADD COLUMN IF NOT EXISTS chunk_hash TEXT,
ADD COLUMN IF NOT EXISTS text_quality_score NUMERIC(4,3) DEFAULT 0.000;

-- Add index for efficient section-based queries
CREATE INDEX IF NOT EXISTS idx_iep_text_chunks_section_tag ON public.iep_text_chunks(section_tag);
CREATE INDEX IF NOT EXISTS idx_iep_text_chunks_hash ON public.iep_text_chunks(chunk_hash);

-- Add evidence field to iep_analysis for tracking chunk references
ALTER TABLE public.iep_analysis 
ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb;

-- Update comments for documentation
COMMENT ON COLUMN public.iep_text_chunks.section_tag IS 'IEP section identifier (e.g., "Present_Levels", "Goals", "Services", "Accommodations", "LRE")';
COMMENT ON COLUMN public.iep_text_chunks.page_index IS 'Page number where this chunk was extracted from';
COMMENT ON COLUMN public.iep_text_chunks.chunk_hash IS 'MD5 hash of chunk content for deduplication and caching';
COMMENT ON COLUMN public.iep_text_chunks.text_quality_score IS 'Readability/quality score for chunk prioritization (0.0-1.0)';
COMMENT ON COLUMN public.iep_analysis.evidence IS 'Array of chunk IDs that support this analysis result';