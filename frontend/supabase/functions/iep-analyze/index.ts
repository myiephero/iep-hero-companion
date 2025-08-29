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
    const { docId, kind = 'quality', model = 'gpt-4o-mini', studentContext = {} } = await req.json();
    
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

    // Rank chunks by readability and select up to ~14k chars to control cost
    const computeReadability = (t: string) => {
      if (!t) return 0;
      const ascii = t.replace(/[^\x20-\x7E\s]/g, '');
      const letters = (ascii.match(/[A-Za-z]/g)?.length || 0);
      const total = ascii.length || 1;
      const words = ascii.trim().split(/\s+/).length || 1;
      const avgWord = ascii.length / words; // rough proxy for readability
      return (letters/total) * 0.7 + Math.min(avgWord/6, 1) * 0.3;
    };

    const normalizeIEP = (t: string) => t
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/([A-Za-z])-(\s*\n)\s*([A-Za-z])/g, '$1 $3')
      .replace(/\s+/g, ' ')
      .trim();

    const scored = (chunks as any[]).map(c => ({ ...c, score: computeReadability(c.content) }));
    scored.sort((a, b) => b.score - a.score);
    const threshold = 0.35;
    const filtered = scored.filter(c => c.score >= threshold);

    let selected: string[] = [];
    let totalChars = 0;
    const LIMIT = 14000;
    for (const c of (filtered.length ? filtered : scored)) {
      if (totalChars + c.content.length > LIMIT) break;
      selected.push(c.content);
      totalChars += c.content.length;
    }

    const fullText = normalizeIEP(selected.join('\n\n'));
    console.log(`Selected ${selected.length} chunks; ${fullText.length} chars for analysis`);

    // Get system prompt and schema based on analysis kind
    const { systemPrompt, userPrompt, schema } = getAnalysisPrompts(kind, fullText, studentContext);

    console.log('Sending request to OpenAI for IEP analysis');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const payload: any = {
      model,
      messages,
      response_format: { type: "json_object" }
    };

    if (String(model).includes('gpt-4o')) {
      payload.max_tokens = 1200; // cheaper cap for 4o-mini
    } else {
      payload.max_completion_tokens = 1200; // newer models param
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
  const baseInstructions = `You are analyzing an IEP document. The text may have formatting artifacts from PDF extraction - focus on the substantive content and ignore formatting issues.

CRITICAL: This is a real IEP document that needs to be analyzed. Never claim it's unreadable or corrupted. Extract and analyze whatever educational content is present, even if formatting is imperfect.

Key principles:
- Look for educational goals, services, accommodations, student information
- Ignore PDF artifacts, strange characters, or formatting oddities  
- Focus on substantive content about the student's education
- If specific sections seem missing, note that in flags but still analyze what's available
- Provide constructive, actionable recommendations`;

  if (kind === 'quality') {
    return {
      systemPrompt: `${baseInstructions}

You are an expert special education advocate analyzing IEP quality. Focus on educational substance over formatting.`,

      userPrompt: `Analyze this IEP document for educational quality and effectiveness. 

Student Context: ${JSON.stringify(studentContext)}

IEP Document Text:
${iepText}

Provide a comprehensive analysis focusing on:
1. Goals quality and measurability
2. Services appropriateness and sufficiency  
3. Accommodations and modifications
4. Progress monitoring plans
5. Parent input and participation

Return JSON in this exact format:
{
  "summary": {
    "strengths": ["List key educational strengths found"],
    "needs": ["Areas needing improvement"],
    "goals_overview": "Assessment of goals quality",
    "services_overview": "Assessment of services adequacy", 
    "accommodations_overview": "Assessment of accommodations"
  },
  "scores": {
    "goals_quality": 85,
    "services_sufficiency": 75,
    "alignment": 80,
    "progress_reporting": 70,
    "parent_participation": 65,
    "overall": 75
  },
  "flags": [
    {"type": "goals", "where": "Goals section", "notes": "Specific concern about goals"}
  ],
  "recommendations": [
    {"title": "Improve Goal Measurability", "suggestion": "Specific actionable suggestion"}
  ]
}`,
      schema: "quality_analysis_schema"
    };
  } else {
    return {
      systemPrompt: `${baseInstructions}

You are a special education compliance analyst checking IEP adherence to IDEA requirements.`,

      userPrompt: `Analyze this IEP for compliance with IDEA federal requirements.

Student Context: ${JSON.stringify(studentContext)}

IEP Document Text:
${iepText}

Check for:
1. Required IEP components (Present Levels, Goals, Services, etc.)
2. Procedural safeguards and timelines
3. LRE considerations
4. Transition planning (if age-appropriate)
5. Assessment accommodations

Return JSON in this exact format:
{
  "summary": {
    "compliance_overview": "Overall compliance assessment",
    "critical_issues": ["List any critical compliance gaps"],
    "minor_issues": ["List minor compliance concerns"],
    "strengths": ["List compliance strengths"]
  },
  "scores": {
    "required_sections": 85,
    "timelines": 90,
    "procedural_safeguards": 80,
    "lre_consideration": 75,
    "accommodations_compliance": 85,
    "overall": 83
  },
  "flags": [
    {"type": "compliance", "severity": "warning", "where": "Services section", "citation": "34 CFR 300.320", "notes": "Specific compliance concern"}
  ],
  "recommendations": [
    {"title": "Add Missing Component", "priority": "high", "suggestion": "Specific remediation steps"}
  ]
}`,
      schema: "compliance_analysis_schema"
    };
  }
}