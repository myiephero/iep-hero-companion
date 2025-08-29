import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createHash } from "https://deno.land/std@0.190.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { docId } = await req.json();
    
    if (!docId) {
      throw new Error('Document ID is required');
    }

    console.log(`Ingesting document: ${docId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header for user context
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Invalid authorization token');
    }

    // Get the document
    const { data: document, error: docError } = await supabase
      .from('iep_documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      throw new Error('Document not found or access denied');
    }

    // Get the file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('iep-docs')
      .download(document.storage_path);

    if (storageError || !fileData) {
      throw new Error('Failed to download file from storage');
    }

    // Extract text based on file type
    let extractedText = '';
    const fileName = document.storage_path.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(fileData);
    } else if (fileName.endsWith('.docx')) {
      extractedText = await extractTextFromDOCX(fileData);
    } else if (fileName.endsWith('.txt')) {
      extractedText = await fileData.text();
    } else {
      throw new Error(`Unsupported file type: ${fileName}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    console.log(`Extracted ${extractedText.length} characters from ${document.title}`);

    // Enhanced chunking with section tagging and OCR fallback
    const enhancedChunks = await enhancedIEPChunking(extractedText, document.title);
    console.log(`Created ${enhancedChunks.length} tagged chunks`);

    // Store enhanced chunks in database
    const chunkInserts = enhancedChunks.map((chunk, index) => ({
      doc_id: docId,
      idx: index,
      content: chunk.content,
      tokens: estimateTokens(chunk.content),
      section_tag: chunk.section_tag,
      page_index: chunk.page_index,
      chunk_hash: chunk.chunk_hash,
      text_quality_score: chunk.quality_score
    }));

    const { error: chunkError } = await supabase
      .from('iep_text_chunks')
      .insert(chunkInserts);

    if (chunkError) {
      console.error('Error storing text chunks:', chunkError);
      throw new Error('Failed to store text chunks');
    }

    console.log('Document ingestion completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        extractedTextLength: extractedText.length,
        chunksCreated: chunks.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in iep-ingest function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during document ingestion'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Enhanced PDF text extraction designed for IEPs
async function extractTextFromPDF(file: Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert PDF bytes to a Latin-1 string for pattern scanning
    const pdfString = new TextDecoder('latin1').decode(uint8Array);

    let extractedTexts: string[] = [];

    // Method 1: Extract text between BT ... ET blocks
    const btPattern = /BT\s+.*?ET/gs;
    const blocks = pdfString.match(btPattern) || [];
    for (const block of blocks) {
      const parts = block.match(/\([^)]*\)/g) || [];
      for (const p of parts) {
        const clean = p
          .slice(1, -1)
          .replace(/\\[rn]/g, ' ')
          .replace(/\\[()]/g, '')
          .trim();
        if (clean.length > 1) extractedTexts.push(clean);
      }
    }

    // Method 2: Tj operators
    const tjPattern = /\([^)]+\)\s*Tj/g;
    let match;
    while ((match = tjPattern.exec(pdfString)) !== null) {
      const content = match[0];
      const text = (content.match(/\(([^)]*)\)/)?.[1] || '')
        .replace(/\\[rn]/g, ' ')
        .trim();
      if (text.length > 1) extractedTexts.push(text);
    }

    // Method 3: TJ arrays
    const tjArrayPattern = /\[\s*(?:\([^)]*\)\s*(?:-?\d+(?:\.\d+)?\s*)?)+\]\s*TJ/g;
    while ((match = tjArrayPattern.exec(pdfString)) !== null) {
      const arr = match[0];
      const strings = arr.match(/\([^)]*\)/g) || [];
      for (const s of strings) {
        const text = s.slice(1, -1).trim();
        if (text.length > 1) extractedTexts.push(text);
      }
    }

    // Combine & normalize
    let combined = extractedTexts.join(' ')
      .replace(/\\[rn]/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .replace(/\\([()])/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .trim();

    // Fallback simple extraction if needed
    if (combined.length < 100) {
      let simple = '';
      let inText = false;
      for (let i = 0; i < uint8Array.length; i++) {
        const b = uint8Array[i];
        if (b === 40) { inText = true; continue; }
        if (b === 41 && inText) { inText = false; simple += ' '; continue; }
        if (inText && b >= 32 && b <= 126) simple += String.fromCharCode(b);
      }
      if (simple.length > combined.length) combined = simple.replace(/\s+/g, ' ').trim();
    }

    if (combined.length < 50) {
      throw new Error('Could not extract sufficient readable text from PDF');
    }

    return combined;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF file');
  }
}

// DOCX text extraction
async function extractTextFromDOCX(file: Blob): Promise<string> {
  try {
    const mammoth = await import('https://esm.sh/mammoth@1.6.0');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

// Chunk text into segments
function chunkText(text: string, maxTokens: number): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const testChunk = currentChunk + (currentChunk ? '. ' : '') + sentence.trim();
    
    if (estimateTokens(testChunk) > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

// Estimate token count (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}