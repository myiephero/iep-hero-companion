-- Create table for storing expert analysis results
CREATE TABLE IF NOT EXISTS public.expert_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints (assuming iep_documents table exists)
  CONSTRAINT fk_expert_analysis_document 
    FOREIGN KEY (document_id) 
    REFERENCES public.iep_documents(id) 
    ON DELETE CASCADE,
    
  -- Ensure one analysis result per document
  CONSTRAINT unique_analysis_per_document 
    UNIQUE (document_id)
);

-- Enable Row Level Security
ALTER TABLE public.expert_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expert_analysis_results

-- Policy 1: Users can only access their own analysis results
CREATE POLICY "Users can access own expert analysis results" ON public.expert_analysis_results
  FOR ALL USING (auth.uid() = user_id);

-- Policy 2: Advocates can access analysis results for assigned clients
-- Note: This assumes a client_assignments table exists with advocate_id and client_id
CREATE POLICY "Advocates can access client analysis results" ON public.expert_analysis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.advocate_id = auth.uid() 
      AND ca.client_id = user_id
      AND ca.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expert_analysis_document_id ON public.expert_analysis_results(document_id);
CREATE INDEX IF NOT EXISTS idx_expert_analysis_user_id ON public.expert_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_analysis_created_at ON public.expert_analysis_results(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.expert_analysis_results IS 'Stores expert IEP analysis results with legal compliance scoring and recommendations';
COMMENT ON COLUMN public.expert_analysis_results.document_id IS 'Reference to the analyzed IEP document';
COMMENT ON COLUMN public.expert_analysis_results.user_id IS 'User who owns this analysis result';
COMMENT ON COLUMN public.expert_analysis_results.analysis_data IS 'Complete expert analysis data including compliance scores, flags, and recommendations';
COMMENT ON COLUMN public.expert_analysis_results.created_at IS 'When the analysis was first created';
COMMENT ON COLUMN public.expert_analysis_results.updated_at IS 'When the analysis was last updated';