import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PDF DEBUG TEST ===');
    
    // Download the test PDF directly
    const pdfUrl = 'https://customer-assets.emergentagent.com/job_c59ba201-f6a3-45b7-bfa0-4071bb9d458f/artifacts/l2sflmpa_IEP%20Test%20%2A%2A.pdf';
    
    console.log('Downloading test PDF...');
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
    }
    
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`PDF downloaded: ${arrayBuffer.byteLength} bytes`);
    
    // Simple extraction - look for text patterns
    const decoder = new TextDecoder('latin1');
    const pdfString = decoder.decode(uint8Array);
    
    // Extract readable text
    let extractedText = '';
    const textMatches = pdfString.match(/\(([^)]{5,200}?)\)/g);
    
    if (textMatches) {
      const cleanTexts = textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 5 && /[A-Za-z]{3,}/.test(text))
        .map(text => text.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\\/g, '\\'));
      
      extractedText = cleanTexts.join(' ');
    }
    
    console.log(`Extracted ${extractedText.length} characters`);
    console.log(`Sample: ${extractedText.substring(0, 500)}`);
    
    // Check for key content
    const keyContent = {
      hasStudentName: extractedText.includes('Jones, Izabella'),
      hasGoals: /goal/i.test(extractedText),
      hasServices: /service/i.test(extractedText),
      hasAccommodations: /accommodation/i.test(extractedText),
      hasIEP: /IEP|Individualized Education Program/i.test(extractedText)
    };
    
    console.log('Content check:', keyContent);
    
    return new Response(JSON.stringify({
      success: true,
      pdfSize: arrayBuffer.byteLength,
      extractedLength: extractedText.length,
      keyContent,
      sample: extractedText.substring(0, 1000),
      message: 'PDF extraction test completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});