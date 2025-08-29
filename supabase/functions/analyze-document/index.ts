import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, analysisType = 'general' } = await req.json();
    
    if (!documentText) {
      throw new Error('Document text is required');
    }

    // Normalize and salvage potentially messy text before analysis
    const cleanedText = normalizeIEPText(String(documentText));
    const textPreview = cleanedText.slice(0, 200).replace(/\s+/g, ' ');
    console.log(`Normalized text length: ${cleanedText.length}. Preview: ${textPreview}...`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'iep':
        systemPrompt = `You are an expert special education advocate and IEP analyst with extensive experience analyzing IEP documents. Your role is to provide helpful, practical analysis of IEP content.

IMPORTANT: You are analyzing real IEP documents that may contain various formatting, tables, and standard IEP language. This is normal and expected. Under no circumstances should you conclude the document is unreadable or garbled. If sections are missing or text quality is imperfect, analyze what is present, infer reasonable structure, and explicitly list missing sections.

Analyze the provided IEP document focusing on:
1. GOALS ANALYSIS: Review goals for specificity, measurability, and appropriateness
2. SERVICES ADEQUACY: Evaluate if services match identified needs  
3. ACCOMMODATIONS: Review accommodations and modifications
4. PRESENT LEVELS: Assess baseline and current performance data
5. COMPLIANCE: Check for required IEP components
6. RECOMMENDATIONS: Provide specific, actionable suggestions

Format your response as a concise, parent-friendly analysis.`;
        userPrompt = `Please analyze this IEP document and provide detailed insights. If content seems partial, proceed and call out gaps at the end.\n\n${cleanedText}`;
        break;
        
      case 'accommodations':
        systemPrompt = `You are a special education expert specializing in accommodations. Analyze the document for:
        
        1. CURRENT ACCOMMODATIONS: List and evaluate existing accommodations
        2. MISSING ACCOMMODATIONS: Suggest additional accommodations based on the student's needs
        3. IMPLEMENTATION GUIDANCE: Provide specific implementation strategies
        4. EFFECTIVENESS MEASURES: Suggest how to measure accommodation effectiveness
        
        Focus on practical, research-based accommodations.`;
        userPrompt = `Analyze this document for accommodation needs and recommendations. If content is imperfect, continue anyway and note gaps.\n\n${cleanedText}`;
        break;
        
      case 'meeting_prep':
        systemPrompt = `You are an expert IEP meeting preparation specialist. Help parents prepare by:
        
        1. KEY DISCUSSION POINTS: Identify main areas for discussion
        2. QUESTIONS TO ASK: Provide specific questions for the team
        3. CONCERNS TO RAISE: Highlight potential issues
        4. DOCUMENTATION NEEDS: Suggest what additional documents may be needed
        5. ADVOCACY STRATEGY: Recommend approach for the meeting
        
        Make recommendations parent-friendly and empowering.`;
        userPrompt = `Help me prepare for an IEP meeting based on this document. If information is incomplete, proceed with best-available details and list open questions.\n\n${cleanedText}`;
        break;
        
      default:
        systemPrompt = `You are a helpful special education advocate assistant. Analyze the provided document and provide insights that would be valuable for parents navigating special education services.`;
        userPrompt = `Please analyze this document and provide helpful insights. If content quality is imperfect, proceed and list any assumptions.\n\n${cleanedText}`;
    }

    console.log('Sending request to OpenAI for document analysis');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Document analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis,
        analysisType,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during document analysis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Text normalization tailored for IEP documents
function normalizeIEPText(input: string): string {
  if (!input) return '';

  // Replace common Windows-1252/Unicode punctuation with ASCII equivalents
  const map: Record<string, string> = {
    '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
    '\u2013': '-', '\u2014': '-', '\u2026': '...', '\u00A0': ' '
  };
  let text = input.replace(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u00A0]/g, (m) => map[m] || ' ');

  // Remove nulls and control chars except newlines/tabs
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');

  // Fix hyphenated line breaks: word-\nnext -> wordnext
  text = text.replace(/([A-Za-z])-(\r?\n)\s*([A-Za-z])/g, '$1$3');

  // Normalize multiple newlines and spaces
  text = text.replace(/\r\n/g, '\n')
             .replace(/\n{3,}/g, '\n\n')
             .replace(/\s{2,}/g, ' ')
             .trim();

  // If extremely long, truncate safely to ~80k chars to stay under token limits
  const MAX_LEN = 80000;
  if (text.length > MAX_LEN) {
    text = text.slice(0, MAX_LEN);
  }

  return text;
}