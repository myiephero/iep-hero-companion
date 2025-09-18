// PDF text extraction for client-side processing
export async function extractPdfText({ file }: { file: File }): Promise<{ text: string; characters: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
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
    
    let extractedText = '';
    if (foundTexts.size > 0) {
      extractedText = Array.from(foundTexts).join(' ');
    }
    
    // Method 2: If pattern matching fails, try byte-level scanning
    if (extractedText.length < 200) {
      const words: string[] = [];
      let currentWord = '';
      
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        const char = String.fromCharCode(byte);
        
        if (byte >= 32 && byte <= 126) { // Printable ASCII
          currentWord += char;
          
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
        }
      }
      
      if (words.length > 5) {
        extractedText = words.join(' ');
      }
    }
    
    if (extractedText.length < 100) {
      throw new Error(`PDF text extraction failed. Only extracted ${extractedText.length} characters. This PDF may be image-based, encrypted, or use an unsupported format.`);
    }
    
    const normalizedText = normalizeIEPText(extractedText);
    return {
      text: normalizedText,
      characters: normalizedText.length
    };
    
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

function cleanExtractedPDFText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidText(text: string): boolean {
  const wordCount = text.split(/\s+/).length;
  const letterRatio = (text.match(/[A-Za-z]/g) || []).length / text.length;
  return wordCount >= 3 && letterRatio > 0.6;
}

function normalizeIEPText(input: string): string {
  if (!input) return '';

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
    // Fix hyphenated line breaks: "word-\\nnext" -> "word next"
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
  
  // Truncate if extremely long to avoid token limits
  const MAX_LENGTH = 100000; // About 25k tokens
  if (text.length > MAX_LENGTH) {
    text = text.substring(0, MAX_LENGTH) + '\n\n[Document truncated for processing...]';
  }

  return text;
}