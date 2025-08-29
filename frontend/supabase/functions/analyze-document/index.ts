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
    const { documentText, analysisType = 'general', documentId, fileName } = await req.json();
    
    if (!documentText) {
      throw new Error('Document text is required');
    }

    console.log(`Analyzing document ${documentId || 'unknown'} (${fileName || 'unknown file'})`);
    console.log(`Analysis type: ${analysisType}`);
    console.log(`Text length: ${documentText.length} characters`);

    // Ensure we have the OpenAI API key
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured. Please check your environment variables.');
    }

    // Normalize and clean text for analysis
    const cleanedText = normalizeIEPText(String(documentText));
    const textPreview = cleanedText.slice(0, 200).replace(/\s+/g, ' ');
    console.log(`Cleaned text length: ${cleanedText.length}. Preview: ${textPreview}...`);

    // Validate text length
    if (cleanedText.length < 50) {
      throw new Error('Document text is too short for meaningful analysis. Please ensure the document contains substantial content.');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'iep':
        systemPrompt = `You are an expert special education advocate and IEP analyst with extensive experience analyzing IEP documents. Your role is to provide helpful, practical analysis of IEP content to help parents understand their child's educational plan and advocate effectively.

CRITICAL ANALYSIS GUIDELINES:
- You are analyzing real IEP documents that may contain formatting artifacts, tables, and standard IEP language
- NEVER conclude that a document is unreadable, garbled, or corrupted
- If formatting is imperfect, focus on extracting meaningful content and insights
- If sections appear incomplete, analyze what is present and note what might be missing
- Provide specific, actionable recommendations that parents can use

ANALYSIS FOCUS AREAS:
1. PRESENT LEVELS OF PERFORMANCE: Assess baseline data and current performance descriptions
2. GOALS AND OBJECTIVES: Review specificity, measurability, and appropriateness of IEP goals
3. SERVICES AND SUPPORTS: Evaluate adequacy of special education services, related services, and supplementary aids
4. ACCOMMODATIONS AND MODIFICATIONS: Review classroom and testing accommodations
5. LEAST RESTRICTIVE ENVIRONMENT: Assess placement decisions and inclusion opportunities
6. TRANSITION PLANNING: For older students, review transition services and post-secondary planning
7. PROGRESS MONITORING: Evaluate methods for tracking and reporting progress

Provide your analysis in a clear, parent-friendly format with specific examples from the document.`;

        userPrompt = `Please provide a comprehensive analysis of this IEP document. Focus on helping the parent understand their child's educational plan and identify areas for improvement or questions to ask the IEP team.

If any part of the text appears to have formatting issues, work with what's available and note any limitations in your analysis.

IEP Document:
${cleanedText}

Please structure your response to cover:
1. Overview of the student's current performance and needs
2. Analysis of IEP goals (are they specific, measurable, appropriate?)
3. Evaluation of services and supports (are they sufficient?)
4. Review of accommodations and modifications
5. Assessment of progress monitoring methods
6. Specific recommendations for the parent
7. Questions the parent should consider asking at the next IEP meeting`;
        break;
        
      case 'accommodations':
        systemPrompt = `You are a special education expert specializing in accommodations and modifications. Your expertise helps parents understand and advocate for appropriate accommodations for their child.

ANALYSIS OBJECTIVES:
1. IDENTIFY CURRENT ACCOMMODATIONS: List and evaluate existing accommodations in the document
2. ASSESS ACCOMMODATION ADEQUACY: Determine if accommodations match the student's identified needs
3. SUGGEST ADDITIONAL ACCOMMODATIONS: Recommend evidence-based accommodations that might be beneficial
4. IMPLEMENTATION GUIDANCE: Provide practical advice on how accommodations should be implemented
5. EFFECTIVENESS MONITORING: Suggest how to measure accommodation effectiveness

Focus on practical, research-based accommodations that can make a real difference in the student's educational experience.`;

        userPrompt = `Analyze this document specifically for accommodations and modifications. Help the parent understand what accommodations are currently in place and what additional supports might be beneficial.

Document Content:
${cleanedText}

Please provide:
1. List of current accommodations and modifications
2. Assessment of whether accommodations match identified needs
3. Suggestions for additional accommodations to consider
4. Guidance on proper implementation of accommodations
5. Recommendations for monitoring accommodation effectiveness`;
        break;
        
      case 'meeting_prep':
        systemPrompt = `You are an expert IEP meeting preparation specialist. Your role is to help parents prepare effectively for IEP meetings by analyzing documents and providing strategic guidance.

PREPARATION FOCUS:
1. KEY DISCUSSION POINTS: Identify the most important topics for the meeting
2. STRATEGIC QUESTIONS: Provide specific questions parents should ask
3. AREAS OF CONCERN: Highlight potential issues that need attention
4. DOCUMENTATION NEEDS: Suggest additional documents or data that might be helpful
5. ADVOCACY STRATEGIES: Recommend approaches for effective advocacy
6. FOLLOW-UP ACTIONS: Suggest next steps and follow-up items

Make all recommendations empowering and practical for parents to implement.`;

        userPrompt = `Help me prepare for an upcoming IEP meeting based on this document. Provide strategic guidance to help me advocate effectively for my child.

Document for Analysis:
${cleanedText}

Please provide:
1. Key issues to discuss at the meeting
2. Specific questions I should ask the IEP team
3. Areas where I might need to push for improvements
4. Documentation I should bring or request
5. Strategies for productive dialogue with the team
6. Follow-up actions to take after the meeting`;
        break;
        
      default:
        systemPrompt = `You are a helpful special education advocate assistant. Analyze the provided document and provide insights that would be valuable for parents navigating special education services. Focus on practical, actionable information.`;
        userPrompt = `Please analyze this special education document and provide helpful insights for the parent:

${cleanedText}`;
    }

    console.log('Sending request to OpenAI for document analysis');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // Using the flagship model for best results
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000, // Increased for more comprehensive analysis
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    if (!analysis || analysis.trim().length === 0) {
      throw new Error('Empty response from AI analysis. Please try again.');
    }

    console.log('Document analysis completed successfully');
    console.log(`Analysis length: ${analysis.length} characters`);

    return new Response(
      JSON.stringify({ 
        analysis,
        analysisType,
        timestamp: new Date().toISOString(),
        documentInfo: {
          documentId,
          fileName,
          textLength: cleanedText.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during document analysis',
        details: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No additional details available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Enhanced text normalization for IEP documents
function normalizeIEPText(input: string): string {
  if (!input) return '';

  // Replace common problematic Unicode characters with ASCII equivalents
  const unicodeMap: Record<string, string> = {
    '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
    '\u2013': '-', '\u2014': '-', '\u2026': '...', '\u00A0': ' '
  };
  
  let text = input.replace(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u00A0]/g, (m) => unicodeMap[m] || ' ');

  // Remove control characters except newlines and tabs
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');

  // Fix common PDF extraction issues
  text = text
    .replace(/([A-Za-z])-(\r?\n)\s*([A-Za-z])/g, '$1$3') // Fix hyphenated line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Ensure reasonable length for processing
  const MAX_LEN = 80000;
  if (text.length > MAX_LEN) {
    text = text.slice(0, MAX_LEN) + '\n\n[Document truncated for analysis...]';
  }

  return text;
}