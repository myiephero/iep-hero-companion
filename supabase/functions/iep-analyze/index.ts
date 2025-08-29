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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { docId, kind = 'quality', model = 'gpt-4.1-2025-04-14', studentContext = {} } = await req.json();
    
    if (!docId) {
      throw new Error('Document ID is required');
    }

    if (!['quality', 'compliance'].includes(kind)) {
      throw new Error('Analysis kind must be "quality" or "compliance"');
    }

    console.log(`Analyzing document ${docId} for ${kind}`);
    
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

    // Get the document and text chunks
    const { data: document, error: docError } = await supabase
      .from('iep_documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      throw new Error('Document not found or access denied');
    }

    const { data: chunks, error: chunksError } = await supabase
      .from('iep_text_chunks')
      .select('*')
      .eq('doc_id', docId)
      .order('idx');

    if (chunksError || !chunks || chunks.length === 0) {
      throw new Error('No text chunks found. Please ingest the document first.');
    }

    // Combine chunks into full text (up to reasonable limit)
    const fullText = chunks.slice(0, 20).map(chunk => chunk.content).join('\n\n');
    console.log(`Using ${fullText.length} characters for analysis`);

    // Get system prompt and schema based on analysis kind
    const { systemPrompt, userPrompt, schema } = getAnalysisPrompts(kind, fullText, studentContext);

    console.log('Sending request to OpenAI for IEP analysis');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let analysisResult;
    
    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Get current max version for this document and analysis kind
    const { data: existingAnalyses } = await supabase
      .from('iep_analysis')
      .select('version')
      .eq('doc_id', docId)
      .eq('kind', kind)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingAnalyses && existingAnalyses.length > 0 
      ? existingAnalyses[0].version + 1 
      : 1;

    // Store the analysis result
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('iep_analysis')
      .insert({
        doc_id: docId,
        user_id: user.id,
        model: model,
        kind: kind,
        version: nextVersion,
        summary: analysisResult.summary || {},
        scores: analysisResult.scores || {},
        flags: analysisResult.flags || [],
        recommendations: analysisResult.recommendations || []
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw new Error('Failed to store analysis results');
    }

    console.log(`IEP ${kind} analysis completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysisId: analysisRecord.id,
        analysis: analysisResult,
        version: nextVersion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in iep-analyze function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during IEP analysis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getAnalysisPrompts(kind: string, iepText: string, studentContext: any) {
  if (kind === 'quality') {
    return {
      systemPrompt: `You are an expert special education advocate and IEP analyst. Analyze the provided IEP text for quality and internal alignment. Be precise, quote short snippets, and return VALID JSON only.

CRITICAL INSTRUCTIONS:
- Never claim the document is unreadable or garbled. Even if formatting is odd, analyze whatever content is available.
- If sections are missing or incomplete, lower the relevant scores and add flags with clear notes.
- Only when the text contains truly insufficient content (e.g., fewer than ~500 readable characters), include a single critical flag 'insufficient_text' but still provide helpful recommendations.
- Ensure all numeric scores are integers between 0 and 100 and include an 'overall' score.
- Keep language parent-friendly and actionable.`,

      userPrompt: `Analyze this IEP document for quality. Use the student context if helpful.

Student Context: ${JSON.stringify(studentContext)}

IEP Text (may include formatting artifacts; ignore noise and extract useful content):
${iepText}

Return JSON in EXACTLY this shape:
{
  "summary": {
    "strengths": ["specific strength 1"],
    "needs": ["identified need 1"],
    "goals_overview": "brief goals quality overview",
    "services_overview": "brief services adequacy overview",
    "accommodations_overview": "brief accommodations overview"
  },
  "scores": {
    "goals_quality": 0-100,
    "services_sufficiency": 0-100,
    "alignment": 0-100,
    "progress_reporting": 0-100,
    "parent_participation": 0-100,
    "overall": 0-100
  },
  "flags": [
    {"type": "flag_category", "where": "specific location or section", "notes": "clear explanation"}
  ],
  "recommendations": [
    {"title": "recommendation title", "suggestion": "specific, actionable suggestion"}
  ]
}`,
      schema: "quality_analysis_schema"
    };
  } else {
    return {
      systemPrompt: `You are a special education compliance analyst. Check this IEP against IDEA requirements and best practices. Return VALID JSON only.

CRITICAL INSTRUCTIONS:
- Never claim the document is unreadable; analyze whatever content is available.
- If sections are missing, create clear flags with citations and lower scores accordingly.
- Only when content is truly insufficient (e.g., < ~500 readable characters), include a critical 'insufficient_text' flag, but still provide remediation steps.
- Ensure all scores are integers 0–100 and include an 'overall' score.`,

      userPrompt: `Analyze this IEP for IDEA compliance and procedural requirements.

Student Context: ${JSON.stringify(studentContext)}

IEP Text (may include formatting artifacts; ignore noise and extract useful content):
${iepText}

Return JSON in EXACTLY this shape:
{
  "summary": {
    "compliance_overview": "overall compliance status summary",
    "critical_issues": ["critical issue 1"],
    "minor_issues": ["minor issue 1"],
    "strengths": ["compliance strength 1"]
  },
  "scores": {
    "required_sections": 0-100,
    "timelines": 0-100,
    "procedural_safeguards": 0-100,
    "lre_ecy_consideration": 0-100,
    "accommodations_compliance": 0-100,
    "overall": 0-100
  },
  "flags": [
    {"type": "compliance_flag", "severity": "critical|warning|info", "where": "specific section", "citation": "IDEA citation", "notes": "detailed explanation"}
  ],
  "recommendations": [
    {"title": "compliance recommendation", "priority": "high|medium|low", "suggestion": "specific remediation steps"}
  ]
}`,
      schema: "compliance_analysis_schema"
    };
  }
}