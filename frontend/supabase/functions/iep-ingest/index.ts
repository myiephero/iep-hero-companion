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
        chunksCreated: enhancedChunks.length,
        sectionsIdentified: [...new Set(enhancedChunks.map(c => c.section_tag))].length
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

// Enhanced IEP chunking with section detection and tagging
async function enhancedIEPChunking(text: string, documentTitle: string): Promise<EnhancedChunk[]> {
  console.log('Starting enhanced IEP chunking with section detection');
  
  // Step 1: Normalize and clean text
  const cleanedText = normalizeIEPText(text);
  
  // Step 2: Detect IEP sections using regex patterns
  const sections = detectIEPSections(cleanedText);
  console.log(`Detected ${sections.length} IEP sections`);
  
  // Step 3: Create chunks within each section
  const allChunks: EnhancedChunk[] = [];
  let globalIndex = 0;
  
  for (const section of sections) {
    const sectionChunks = createSectionChunks(section, globalIndex);
    allChunks.push(...sectionChunks);
    globalIndex += sectionChunks.length;
  }
  
  // Step 4: Add fallback chunks for untagged content if needed
  if (allChunks.length === 0) {
    console.log('No sections detected, falling back to basic chunking');
    const basicChunks = chunkText(cleanedText, 1500);
    return basicChunks.map((content, idx) => createEnhancedChunk(content, 'Untagged', 0, idx));
  }
  
  return allChunks;
}

interface EnhancedChunk {
  content: string;
  section_tag: string;
  page_index: number;
  chunk_hash: string;
  quality_score: number;
}

interface IEPSection {
  tag: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

function normalizeIEPText(text: string): string {
  return text
    .replace(/[-\x1F\x7F]/g, ' ')                    // Remove control chars
    .replace(/([A-Za-z])-(\s*\n)\s*([A-Za-z])/g, '$1 $3')  // Fix hyphenated words
    .replace(/\s+/g, ' ')                           // Normalize whitespace
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')           // ASCII only
    .trim();
}

function detectIEPSections(text: string): IEPSection[] {
  // IEP section patterns - ordered by priority
  const sectionPatterns = [
    {
      tag: 'Present_Levels',
      patterns: [
        /PRESENT\s+LEVEL[S]?\s+(OF\s+)?(ACADEMIC\s+ACHIEVEMENT|PERFORMANCE)/i,
        /PLAAFP/i,
        /CURRENT\s+LEVEL[S]?\s+OF\s+PERFORMANCE/i,
        /SUMMARY\s+OF\s+PRESENT\s+LEVEL/i,
        /ACADEMIC\s+ACHIEVEMENT.*?FUNCTIONAL\s+PERFORMANCE/i
      ]
    },
    {
      tag: 'Goals',
      patterns: [
        /ANNUAL\s+GOAL[S]?/i,
        /MEASURABLE\s+(ANNUAL\s+)?GOAL[S]?/i,
        /GOAL[S]?\s+AND\s+OBJECTIVE[S]?/i,
        /IEP\s+GOAL[S]?/i,
        /SHORT[- ]?TERM\s+OBJECTIVE[S]?/i
      ]
    },
    {
      tag: 'Services', 
      patterns: [
        /SPECIAL\s+EDUCATION.*?SERVICE[S]?/i,
        /RELATED\s+SERVICE[S]?/i,
        /SERVICE[S]?\s+(DELIVERY|STATEMENT)/i,
        /SPECIALLY\s+DESIGNED\s+INSTRUCTION/i,
        /STATEMENT\s+OF.*?SERVICE[S]?/i
      ]
    },
    {
      tag: 'Accommodations',
      patterns: [
        /ACCOMMODATION[S]?(?!\s+LIST)/i,
        /MODIFICATION[S]?/i,
        /TESTING\s+ACCOMMODATION[S]?/i,
        /INSTRUCTIONAL\s+ACCOMMODATION[S]?/i,
        /SUPPLEMENTARY\s+AIDS/i
      ]
    },
    {
      tag: 'LRE',
      patterns: [
        /LEAST\s+RESTRICTIVE\s+ENVIRONMENT/i,
        /LRE/i,
        /PLACEMENT\s+(DECISION|DETERMINATION)/i,
        /EDUCATIONAL\s+PLACEMENT/i,
        /CONTINUUM\s+OF\s+PLACEMENT/i
      ]
    },
    {
      tag: 'Transition',
      patterns: [
        /TRANSITION\s+(PLAN|GOAL[S]?|SERVICE[S]?)/i,
        /POST[- ]?SECONDARY\s+GOAL[S]?/i,
        /MEASURABLE\s+POST[- ]?SECONDARY/i,
        /COORDINATED\s+ACTIVIT/i,
        /COURSE\s+OF\s+STUDY/i
      ]
    },
    {
      tag: 'Assessment',
      patterns: [
        /STATE.*?ASSESSMENT/i,
        /STANDARDIZED\s+TEST/i,
        /TESTING\s+(PARTICIPATION|PROGRAM)/i,
        /ASSESSMENT\s+RESULT[S]?/i,
        /EVALUATION\s+RESULT[S]?/i
      ]
    },
    {
      tag: 'ESY',
      patterns: [
        /EXTENDED\s+SCHOOL\s+YEAR/i,
        /ESY/i,
        /SUMMER\s+(PROGRAM|SERVICE[S]?)/i,
        /YEAR[- ]?ROUND\s+SERVICE[S]?/i
      ]
    }
  ];

  const sections: IEPSection[] = [];
  const text_length = text.length;

  // Find all section matches
  for (const { tag, patterns } of sectionPatterns) {
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(new RegExp(pattern.source, 'gi')));
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const startIndex = Math.max(0, match.index - 50); // Include some context before
          const nextSectionStart = findNextSectionStart(text, match.index + match[0].length, sectionPatterns);
          const endIndex = Math.min(nextSectionStart || text_length, match.index + 3000); // Reasonable section size
          
          if (endIndex > startIndex + 100) { // Ensure minimum content
            sections.push({
              tag,
              content: text.substring(startIndex, endIndex).trim(),
              startIndex,
              endIndex
            });
          }
        }
      }
    }
  }

  // Remove overlapping sections (keep the first one found)
  const uniqueSections = sections
    .sort((a, b) => a.startIndex - b.startIndex)
    .filter((section, index, arr) => {
      // Check if this section significantly overlaps with a previous one
      return !arr.slice(0, index).some(prev => 
        Math.max(section.startIndex, prev.startIndex) < Math.min(section.endIndex, prev.endIndex) - 200
      );
    });

  console.log(`Section detection complete. Found: ${uniqueSections.map(s => s.tag).join(', ')}`);
  return uniqueSections;
}

function findNextSectionStart(text: string, fromIndex: number, patterns: any[]): number | null {
  let nearestIndex = null;
  
  for (const { patterns: sectionPatterns } of patterns) {
    for (const pattern of sectionPatterns) {
      const match = new RegExp(pattern.source, 'gi');
      match.lastIndex = fromIndex;
      const result = match.exec(text);
      if (result && result.index) {
        if (nearestIndex === null || result.index < nearestIndex) {
          nearestIndex = result.index;
        }
      }
    }
  }
  
  return nearestIndex;
}

function createSectionChunks(section: IEPSection, startingIndex: number): EnhancedChunk[] {
  const maxChunkSize = 1500; // tokens
  const chunks = chunkText(section.content, maxChunkSize);
  
  return chunks.map((content, idx) => 
    createEnhancedChunk(content, section.tag, 0, startingIndex + idx)
  );
}

function createEnhancedChunk(content: string, sectionTag: string, pageIndex: number, index: number): EnhancedChunk {
  return {
    content,
    section_tag: sectionTag,
    page_index: pageIndex,
    chunk_hash: generateMD5Hash(content),
    quality_score: computeReadabilityScore(content)
  };
}

function generateMD5Hash(content: string): string {
  const hasher = createHash("md5");
  hasher.update(content);
  return hasher.toString();
}

function computeReadabilityScore(text: string): number {
  if (!text) return 0;
  
  const ascii = text.replace(/[^\x20-\x7E\s]/g, '');
  const letters = (ascii.match(/[A-Za-z]/g)?.length || 0);
  const total = ascii.length || 1;
  const words = ascii.trim().split(/\s+/).length || 1;
  const avgWordLength = ascii.length / words;
  
  // Score based on letter ratio and reasonable word length
  const letterRatio = letters / total;
  const wordLengthScore = Math.min(avgWordLength / 6, 1);
  
  return Math.round((letterRatio * 0.7 + wordLengthScore * 0.3) * 1000) / 1000;
}