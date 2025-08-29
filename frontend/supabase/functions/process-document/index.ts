import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const emergentApiKey = Deno.env.get('EMERGENT_LLM_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    const analysisType = formData.get('analysisType') as string || 'iep';
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header for user context
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Extract user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Invalid authorization token');
    }

    let extractedText = '';
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    console.log(`Attempting to extract text from ${fileName} (${fileType})`);

    // Handle different file types with enhanced extraction
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      extractedText = await extractTextFromDOCX(file);
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      extractedText = await extractTextFromDOC(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      extractedText = await file.text();
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Supported types: PDF, DOC, DOCX, TXT`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the file. The document may be image-based or corrupted.');
    }

    console.log(`Successfully extracted ${extractedText.length} characters from ${file.name}`);
    console.log(`Text preview: "${extractedText.substring(0, 200).replace(/\s+/g, ' ')}..."`);

    // Clean and normalize the extracted text specifically for IEP analysis
    const cleanedText = normalizeIEPText(extractedText);
    console.log(`Text after normalization: ${cleanedText.length} characters`);

    // Store the document in the database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        student_id: studentId || null,
        title: file.name,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: `processed/${file.name}_${Date.now()}` // More descriptive path
      })
      .select()
      .single();

    if (docError) {
      console.error('Error storing document:', docError);
      throw new Error('Failed to store document information');
    }

    console.log(`Document stored with ID: ${document.id}`);

    // Call the analyze-document function with the cleaned text
    const analysisResponse = await supabase.functions.invoke('analyze-document', {
      body: {
        documentText: cleanedText,
        analysisType: analysisType,
        documentId: document.id,
        fileName: file.name
      }
    });

    if (analysisResponse.error) {
      console.error('Analysis error:', analysisResponse.error);
      throw new Error(`Failed to analyze document content: ${analysisResponse.error.message || 'Unknown analysis error'}`);
    }

    // Store the AI analysis result with enhanced structure
    const analysisData = analysisResponse.data?.analysis || analysisResponse.data || {};
    
    const { data: aiReview, error: reviewError } = await supabase
      .from('ai_reviews')
      .insert({
        user_id: user.id,
        student_id: studentId || null,
        document_id: document.id,
        review_type: analysisType,
        ai_analysis: {
          analysis: analysisData,
          metadata: {
            extractedTextLength: cleanedText.length,
            originalFileName: file.name,
            fileSize: file.size,
            processedAt: new Date().toISOString()
          }
        },
        status: 'completed',
        priority_level: 'medium'
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error storing AI review:', reviewError);
      throw new Error('Failed to store analysis results');
    }

    console.log('Document processing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        documentId: document.id,
        reviewId: aiReview.id,
        analysis: analysisData,
        extractedTextLength: cleanedText.length,
        message: 'Document processed and analyzed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred during document processing',
        details: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Completely rewritten PDF text extraction using a different approach
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting new PDF text extraction approach...');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Method 1: Simple but effective text extraction
    let extractedText = '';
    
    // Convert buffer to string for pattern matching
    const pdfData = new TextDecoder('latin1').decode(uint8Array);
    
    // Look for readable text patterns in the PDF
    const textPatterns = [
      // Pattern 1: Text between parentheses (most common in PDFs)
      /\(([^)]{4,200}?)\)/g,
      // Pattern 2: Text in brackets for some PDFs
      /\[([^\]]{4,200}?)\]/g,
      // Pattern 3: Text after Tj operators
      /(\w+(?:\s+\w+){2,20})\s+Tj/g,
      // Pattern 4: Simple word patterns
      /\b([A-Za-z]+(?:\s+[A-Za-z]+){3,30})\b/g
    ];
    
    const foundTexts = new Set<string>();
    
    for (const pattern of textPatterns) {
      let match;
      while ((match = pattern.exec(pdfData)) !== null) {
        let text = match[1];
        if (text && text.length > 10) {
          // Clean the text
          text = cleanExtractedPDFText(text);
          if (text.length > 10 && isValidText(text)) {
            foundTexts.add(text);
          }
        }
      }
    }
    
    if (foundTexts.size > 0) {
      extractedText = Array.from(foundTexts).join(' ');
    }
    
    // Method 2: If pattern matching fails, try byte-level scanning
    if (extractedText.length < 200) {
      console.log('Pattern matching insufficient, trying byte scanning...');
      
      const words: string[] = [];
      let currentWord = '';
      let consecutiveReadable = 0;
      
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        const char = String.fromCharCode(byte);
        
        if (byte >= 32 && byte <= 126) { // Printable ASCII
          currentWord += char;
          consecutiveReadable++;
          
          if (byte === 32) { // Space
            if (currentWord.trim().length > 2 && /[A-Za-z]{2,}/.test(currentWord)) {
              words.push(currentWord.trim());
            }
            currentWord = '';
          }
        } else {
          if (currentWord.trim().length > 2 && /[A-Za-z]{2,}/.test(currentWord)) {
            words.push(currentWord.trim());
          }
          currentWord = '';
          consecutiveReadable = 0;
        }
        
        // If we've found enough consecutive readable characters, we're in a text section
        if (consecutiveReadable > 50 && currentWord.length > 20) {
          if (/[A-Za-z]{3,}/.test(currentWord)) {
            words.push(currentWord.trim());
          }
          currentWord = '';
        }
      }
      
      if (words.length > 0) {
        extractedText = words.join(' ');
      }
    }
    
    // Method 3: Last resort - look for any readable sequences
    if (extractedText.length < 200) {
      console.log('Byte scanning insufficient, trying sequence detection...');
      
      const sequences: string[] = [];
      let currentSeq = '';
      
      for (let i = 0; i < uint8Array.length - 10; i++) {
        const chunk = uint8Array.slice(i, i + 10);
        const text = new TextDecoder('utf-8', {fatal: false}).decode(chunk);
        
        if (text && /[A-Za-z]{3,}/.test(text)) {
          currentSeq += text.replace(/[^\x20-\x7E]/g, ' ');
          
          if (currentSeq.length > 100) {
            sequences.push(currentSeq.trim());
            currentSeq = '';
          }
        } else {
          if (currentSeq.length > 20) {
            sequences.push(currentSeq.trim());
          }
          currentSeq = '';
        }
      }
      
      if (sequences.length > 0) {
        extractedText = sequences.join(' ');
      }
    }
    
    // Final text processing
    if (extractedText.length > 0) {
      extractedText = finalTextCleanup(extractedText);
      console.log(`Successfully extracted ${extractedText.length} characters`);
      console.log(`Sample: "${extractedText.substring(0, 200)}..."`);
      
      if (extractedText.length > 100) {
        return extractedText;
      }
    }
    
    throw new Error(`PDF text extraction failed. Only extracted ${extractedText.length} characters. This PDF may be image-based, encrypted, or use an unsupported format. Please ensure the PDF contains selectable text.`);
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

function cleanExtractedPDFText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove PDF escape sequences
    .replace(/\\[nrt]/g, ' ')
    .replace(/\\[()]/g, '')
    .replace(/\\\\/g, '\\')
    .replace(/\\[0-7]{1,3}/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Clean whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidText(text: string): boolean {
  if (!text || text.length < 10) return false;
  
  // Check for reasonable letter-to-total ratio
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  const total = text.length;
  
  return (letters / total) > 0.5 && text.split(' ').length > 2;
}

function finalTextCleanup(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s([,.!?;:])/g, '$1')
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .trim();
}

// Enhanced DOCX text extraction
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    console.log('Extracting text from DOCX file...');
    
    // Use mammoth.js for DOCX text extraction
    const mammoth = await import('https://esm.sh/mammoth@1.6.0');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in DOCX file');
    }
    
    console.log(`Extracted ${result.value.length} characters from DOCX`);
    return result.value;
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error.message}`);
  }
}

// Enhanced DOC text extraction (legacy format)
async function extractTextFromDOC(file: File): Promise<string> {
  try {
    console.log('Extracting text from legacy DOC file...');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For legacy DOC files, use a more sophisticated approach
    let text = '';
    let readableChars = 0;
    
    // DOC files have a more complex structure, so we'll be more selective
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = uint8Array[i];
      const nextChar = uint8Array[i + 1];
      
      // Include printable ASCII characters
      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char);
        readableChars++;
      } else if (char === 13 || char === 10) { // CR/LF
        text += '\n';
      } else if (char === 9) { // Tab
        text += '\t';
      }
    }
    
    // Clean up the extracted text more aggressively for DOC files
    text = text
      .replace(/\x00+/g, ' ')
      .replace(/[^\x20-\x7E\n\r\t]+/g, ' ')
      .replace(/\s{3,}/g, ' ')
      .replace(/(.)\1{10,}/g, '$1')
      .trim();
    
    console.log(`Extracted ${text.length} characters (${readableChars} readable) from DOC`);
    
    if (text.length < 100) {
      throw new Error('Insufficient readable text extracted from DOC file. Please convert to DOCX or PDF format for better results.');
    }
    
    return text;
    
  } catch (error) {
    console.error('DOC extraction error:', error);
    throw new Error(`Failed to extract text from DOC file: ${error.message}`);
  }
}

// Enhanced text normalization specifically for IEP documents
function normalizeIEPText(input: string): string {
  if (!input) return '';

  console.log(`Normalizing text: ${input.length} characters`);

  // Replace common problematic Unicode characters with ASCII equivalents
  const unicodeMap: Record<string, string> = {
    '\u2018': "'", '\u2019': "'", // Smart quotes
    '\u201C': '"', '\u201D': '"', // Smart double quotes
    '\u2013': '-', '\u2014': '--', // En dash, em dash
    '\u2026': '...', // Ellipsis
    '\u00A0': ' ', // Non-breaking space
    '\u00AD': '', // Soft hyphen
    '\u200B': '', // Zero-width space
    '\u200C': '', // Zero-width non-joiner
    '\u200D': '', // Zero-width joiner
    '\u2060': '', // Word joiner
    '\uFEFF': '', // Zero-width no-break space
  };
  
  let text = input.replace(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u00A0\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g, 
    (match) => unicodeMap[match] || ' ');

  // Remove or replace control characters except useful whitespace
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');

  // Fix common PDF extraction artifacts
  text = text
    // Fix hyphenated line breaks: "word-\nnext" -> "word next"
    .replace(/([A-Za-z])-(\r?\n)\s*([A-Za-z])/g, '$1 $3')
    // Fix broken words: "w o r d" -> "word" (but preserve intentional spacing)
    .replace(/\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\b/g, '$1$2$3$4')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Reduce multiple newlines but preserve paragraph breaks
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n{3}/g, '\n\n')
    // Normalize spaces but preserve intentional formatting
    .replace(/[ \t]{3,}/g, '  ')
    .replace(/[ \t]{2,}/g, ' ')
    // Remove space before punctuation
    .replace(/\s+([,.!?;:])/g, '$1')
    // Add space after punctuation if missing
    .replace(/([,.!?;:])([A-Za-z])/g, '$1 $2');

  // Remove extremely long runs of the same character (artifacts)
  text = text.replace(/(.)\1{20,}/g, '$1');

  // Trim and ensure reasonable length
  text = text.trim();
  
  // Truncate if extremely long to avoid token limits (keep first part as it's usually most important)
  const MAX_LENGTH = 100000; // About 25k tokens
  if (text.length > MAX_LENGTH) {
    text = text.substring(0, MAX_LENGTH) + '\n\n[Document truncated for processing...]';
    console.log(`Text truncated to ${MAX_LENGTH} characters`);
  }

  console.log(`Text normalized: ${text.length} characters`);
  return text;
}
