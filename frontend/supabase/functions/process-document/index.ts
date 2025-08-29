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

// Working PDF text extraction for Deno/Supabase Edge Functions
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction for Deno environment...');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and extract readable text patterns
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    // Extract text using multiple PDF text patterns
    const extractedTexts = new Set<string>();
    
    // Pattern 1: Text in parentheses (most reliable for PDFs)
    const parenPattern = /\(([^)]{10,500}?)\)/g;
    let match;
    while ((match = parenPattern.exec(pdfString)) !== null) {
      let text = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\(/g, '(')
        .replace(/\\)/g, ')')
        .replace(/\\\\/g, '\\');
      
      if (text.length > 10 && /[A-Za-z]/.test(text)) {
        extractedTexts.add(text);
      }
    }
    
    // Pattern 2: Text after stream markers
    const streamPattern = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    while ((match = streamPattern.exec(pdfString)) !== null) {
      const content = match[1];
      const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (readable.length > 20 && /[A-Za-z]{3,}/.test(readable)) {
        extractedTexts.add(readable);
      }
    }
    
    // Pattern 3: Look for readable sequences in the binary data
    let readableChunks = '';
    let currentChunk = '';
    
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      
      if (byte >= 32 && byte <= 126) { // Printable ASCII
        currentChunk += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) { // Line breaks
        currentChunk += '\n';
      } else {
        if (currentChunk.length > 15 && /[A-Za-z]{3,}/.test(currentChunk)) {
          readableChunks += currentChunk + ' ';
        }
        currentChunk = '';
      }
    }
    
    // Add the final chunk
    if (currentChunk.length > 15 && /[A-Za-z]{3,}/.test(currentChunk)) {
      readableChunks += currentChunk;
    }
    
    // Combine all extracted text
    let allText = Array.from(extractedTexts).join(' ') + ' ' + readableChunks;
    
    // Clean and normalize the text
    allText = allText
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/(.)\1{5,}/g, '$1')    // Remove excessive repetition
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // ASCII only
      .trim();
    
    console.log(`PDF extraction completed: ${allText.length} characters`);
    console.log(`Sample: "${allText.substring(0, 300)}..."`);
    
    // Validate extraction quality
    if (allText.length < 500) {
      throw new Error('Insufficient text extracted - PDF may be image-based or encrypted');
    }
    
    // Check for IEP-specific content to validate extraction
    const iepIndicators = [
      'IEP', 'Individualized Education Program', 'goals', 'services', 
      'accommodations', 'student', 'special education'
    ];
    
    const foundIndicators = iepIndicators.filter(indicator => 
      allText.toLowerCase().includes(indicator.toLowerCase())
    );
    
    console.log(`Found IEP indicators: ${foundIndicators.join(', ')}`);
    
    if (foundIndicators.length < 2) {
      console.warn('Warning: Limited IEP content detected in extracted text');
    }
    
    return allText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract readable text from PDF: ${error.message}`);
  }
}

// Fallback simple extraction method
async function simpleByteExtraction(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  
  let text = '';
  const chunks = [];
  
  // Process in chunks to handle large files
  for (let i = 0; i < uint8Array.length; i += 1000) {
    const chunk = uint8Array.slice(i, i + 1000);
    const decodedChunk = decoder.decode(chunk);
    
    // Extract readable text sequences
    const readableText = decodedChunk
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')  // ASCII only
      .replace(/\s+/g, ' ')                 // Normalize spaces
      .trim();
      
    if (readableText.length > 10 && /[A-Za-z]{3,}/.test(readableText)) {
      chunks.push(readableText);
    }
  }
  
  text = chunks.join(' ');
  
  // Clean up the extracted text
  text = text
    .replace(/\s+/g, ' ')
    .replace(/(.)\1{5,}/g, '$1')  // Remove repeated characters
    .trim();
  
  if (text.length < 100) {
    throw new Error('PDF text extraction failed - insufficient readable content found');
  }
  
  console.log(`Fallback extraction: ${text.length} characters`);
  return text;
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
