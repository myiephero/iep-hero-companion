import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Handle different file types
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
      throw new Error('No text could be extracted from the file');
    }

    console.log(`Extracted ${extractedText.length} characters from ${file.name}`);

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
        category: 'iep_document',
        confidential: true,
        file_path: `temp/${file.name}` // Temporary path since we're processing content directly
      })
      .select()
      .single();

    if (docError) {
      console.error('Error storing document:', docError);
      throw new Error('Failed to store document information');
    }

    // Call the analyze-document function with the extracted text
    const analysisResponse = await supabase.functions.invoke('analyze-document', {
      body: {
        documentText: extractedText,
        analysisType: analysisType
      }
    });

    if (analysisResponse.error) {
      console.error('Analysis error:', analysisResponse.error);
      throw new Error('Failed to analyze document content');
    }

    // Store the AI analysis result
    const { data: aiReview, error: reviewError } = await supabase
      .from('ai_reviews')
      .insert({
        user_id: user.id,
        student_id: studentId || null,
        document_id: document.id,
        review_type: analysisType,
        ai_analysis: analysisResponse.data,
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
        analysis: analysisResponse.data,
        extractedTextLength: extractedText.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during document processing'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// PDF text extraction using a simpler approach
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    
    // For now, we'll use a fallback approach for PDFs
    // Convert PDF to raw text by extracting readable content
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Look for text streams in PDF structure
    let text = '';
    let currentString = '';
    let inTextObject = false;
    
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const byte = uint8Array[i];
      const nextByte = uint8Array[i + 1];
      
      // Look for text objects and streams
      if (byte === 40) { // '(' - start of text string
        inTextObject = true;
        currentString = '';
      } else if (byte === 41 && inTextObject) { // ')' - end of text string
        if (currentString.length > 2) { // Only keep meaningful strings
          text += currentString + ' ';
        }
        inTextObject = false;
        currentString = '';
      } else if (inTextObject && byte >= 32 && byte <= 126) {
        // Printable ASCII characters
        currentString += String.fromCharCode(byte);
      }
    }
    
    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/[^\w\s.,!?;:()\-]/g, '') // Remove special characters except basic punctuation
      .trim();
    
    console.log(`Extracted ${text.length} characters from PDF`);
    
    if (text.length < 100) {
      throw new Error('Insufficient text extracted from PDF. The document may be image-based or corrupted.');
    }
    
    return text;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF file. Please ensure the PDF contains selectable text, not just images.');
  }
}

// DOCX text extraction
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Use mammoth.js for DOCX text extraction
    const mammoth = await import('https://esm.sh/mammoth@1.6.0');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

// DOC text extraction (legacy format)
async function extractTextFromDOC(file: File): Promise<string> {
  try {
    // For legacy DOC files, we'll use a simpler approach
    // Note: This is a basic implementation and may not work for all DOC files
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and try to extract readable text
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const char = uint8Array[i];
      // Only include printable ASCII characters
      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char);
      } else if (char === 13 || char === 10) { // CR/LF
        text += '\n';
      }
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\x00+/g, ' ') // Remove null bytes
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
    
    if (text.length < 50) {
      throw new Error('Insufficient text extracted from DOC file');
    }
    
    return text;
  } catch (error) {
    console.error('DOC extraction error:', error);
    throw new Error('Failed to extract text from DOC file. Please convert to DOCX or PDF format for better results.');
  }
}