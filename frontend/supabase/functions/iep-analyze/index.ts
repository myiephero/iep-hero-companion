import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const emergentApiKey = Deno.env.get('EMERGENT_LLM_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { docId, kind = 'quality', studentContext = {} } = await req.json();
    
    if (!docId) {
      throw new Error('Document ID is required');
    }

    if (!['quality', 'compliance'].includes(kind)) {
      throw new Error('Analysis kind must be "quality" or "compliance"');
    }

    if (!emergentApiKey) {
      throw new Error('Emergent LLM API key not configured');
    }

    console.log(`Starting two-pass analysis for document ${docId} - ${kind}`);
    
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

    // Get the document and enhanced text chunks
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

    console.log(`Found ${chunks.length} text chunks for analysis`);

    // Two-Pass Analysis Pipeline
    
    // PASS 1: Outline Scan with gpt-4o-mini
    console.log('Starting Pass 1: Outline scan and section mapping');
    const outlineResult = await performOutlineScan(chunks, emergentApiKey);
    
    // PASS 2: Structured Analysis with claude-sonnet-4
    console.log('Starting Pass 2: Detailed section analysis');
    const analysisResult = await performStructuredAnalysis(outlineResult, chunks, kind, studentContext, emergentApiKey);

    // Store analysis results with evidence
    const nextVersion = await getNextVersion(supabase, docId, kind);
    
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('iep_analysis')
      .insert({
        doc_id: docId,
        user_id: user.id,
        model: 'two-pass-gpt4omini-claude4',
        kind: kind,
        version: nextVersion,
        summary: analysisResult.summary || {},
        scores: analysisResult.scores || {},
        flags: analysisResult.flags || [],
        recommendations: analysisResult.recommendations || [],
        evidence: analysisResult.evidence || []
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw new Error('Failed to store analysis results');
    }

    console.log(`Two-pass IEP ${kind} analysis completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysisId: analysisRecord.id,
        analysis: analysisResult,
        version: nextVersion,
        sectionsAnalyzed: outlineResult.sectionsFound
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in two-pass iep-analyze function:', error);
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

async function getNextVersion(supabase: any, docId: string, kind: string): Promise<number> {
  const { data: existingAnalyses } = await supabase
    .from('iep_analysis')
    .select('version')
    .eq('doc_id', docId)
    .eq('kind', kind)
    .order('version', { ascending: false })
    .limit(1);

  return existingAnalyses && existingAnalyses.length > 0 
    ? existingAnalyses[0].version + 1 
    : 1;
}

async function performOutlineScan(chunks: any[], emergentApiKey: string): Promise<any> {
  // PASS 1: Quick outline scan with gpt-4o-mini to identify sections
  const sampleText = chunks.slice(0, 5).map(c => c.content).join('\n\n').substring(0, 8000);
  
  const outlinePrompt = `Analyze this IEP document sample and identify the main sections present. Focus on structural organization.

IEP Sample Text:
${sampleText}

Return JSON with this structure:
{
  "sectionsFound": ["Present Levels", "Goals", "Services", "Accommodations", "etc"],
  "documentStructure": "Brief description of how the document is organized",
  "keyAreas": ["List 3-5 most important areas to focus detailed analysis on"]
}`;

  const response = await fetch('https://api.emergentmind.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emergentApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an IEP document structure analyzer. Identify key sections and organization patterns.' },
        { role: 'user', content: outlinePrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`Outline scan failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performStructuredAnalysis(outlineResult: any, chunks: any[], kind: string, studentContext: any, emergentApiKey: string): Promise<any> {
  // PASS 2: Detailed analysis with claude-sonnet-4 using outline guidance
  
  // Smart chunk selection based on outline findings
  const priorityChunks = selectPriorityChunks(chunks, outlineResult.keyAreas);
  const analysisText = priorityChunks.map(c => c.content).join('\n\n');
  
  const analysisPrompt = kind === 'quality' 
    ? buildQualityAnalysisPrompt(analysisText, studentContext, outlineResult)
    : buildComplianceAnalysisPrompt(analysisText, studentContext, outlineResult);

  const response = await fetch('https://api.emergentmind.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emergentApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: 'You are an expert IEP analyst providing detailed, evidence-based analysis.' },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`Structured analysis failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function selectPriorityChunks(chunks: any[], keyAreas: string[]): any[] {
  // Score chunks based on relevance to key areas identified in outline
  const scoredChunks = chunks.map(chunk => {
    let relevanceScore = 0;
    const content = chunk.content.toLowerCase();
    
    keyAreas.forEach(area => {
      const areaTerms = getAreaTerms(area.toLowerCase());
      areaTerms.forEach(term => {
        if (content.includes(term)) {
          relevanceScore += 1;
        }
      });
    });
    
    // Also score for general IEP quality indicators
    const qualityTerms = ['goal', 'objective', 'service', 'accommodation', 'progress', 'assessment'];
    qualityTerms.forEach(term => {
      if (content.includes(term)) {
        relevanceScore += 0.5;
      }
    });
    
    return { ...chunk, relevanceScore };
  });
  
  // Sort by relevance and select top chunks up to ~16k chars
  scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  const selected = [];
  let totalChars = 0;
  const LIMIT = 16000;
  
  for (const chunk of scoredChunks) {
    if (totalChars + chunk.content.length > LIMIT) break;
    selected.push(chunk);
    totalChars += chunk.content.length;
  }
  
  return selected.length > 0 ? selected : chunks.slice(0, 10); // fallback
}

function getAreaTerms(area: string): string[] {
  const termMap: { [key: string]: string[] } = {
    'present levels': ['present level', 'current performance', 'baseline', 'strengths', 'needs'],
    'goals': ['goal', 'objective', 'target', 'measurable', 'annual goal'],
    'services': ['service', 'instruction', 'therapy', 'support', 'minutes', 'frequency'],
    'accommodations': ['accommodation', 'modification', 'support', 'assistive'],
    'assessment': ['assessment', 'evaluation', 'test', 'measure', 'data'],
    'transition': ['transition', 'post-secondary', 'employment', 'independent living']
  };
  
  return termMap[area] || [area];
}

function buildQualityAnalysisPrompt(text: string, studentContext: any, outlineResult: any): string {
  return `Conduct a comprehensive quality analysis of this IEP document. Use the structural insights provided.

Document Structure: ${outlineResult.documentStructure}
Sections Found: ${outlineResult.sectionsFound.join(', ')}
Key Focus Areas: ${outlineResult.keyAreas.join(', ')}

Student Context: ${JSON.stringify(studentContext)}

IEP Document Text:
${text}

Analyze for educational quality focusing on:
1. Goals quality and measurability with specific evidence
2. Services appropriateness and sufficiency 
3. Accommodations and modifications effectiveness
4. Progress monitoring and data collection plans
5. Alignment between needs, goals, and services

Return JSON with evidence-backed analysis:
{
  "summary": {
    "strengths": ["Specific strengths with evidence"],
    "needs": ["Areas needing improvement with examples"],
    "goals_overview": "Assessment of goals quality with specifics",
    "services_overview": "Assessment of services with details", 
    "accommodations_overview": "Assessment of accommodations with examples"
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
    {"type": "goals", "where": "Goal 2", "notes": "Specific concern with evidence"}
  ],
  "recommendations": [
    {"title": "Improve Goal Measurability", "suggestion": "Specific actionable suggestion with examples"}
  ],
  "evidence": [
    {"finding": "Goals lack measurable criteria", "quote": "Exact text from document", "location": "Goals section"}
  ]
}`;
}

function buildComplianceAnalysisPrompt(text: string, studentContext: any, outlineResult: any): string {
  return `Conduct a comprehensive compliance analysis of this IEP document against IDEA requirements.

Document Structure: ${outlineResult.documentStructure}
Sections Found: ${outlineResult.sectionsFound.join(', ')}
Key Focus Areas: ${outlineResult.keyAreas.join(', ')}

Student Context: ${JSON.stringify(studentContext)}

IEP Document Text:
${text}

Check compliance with IDEA requirements:
1. Required IEP components (34 CFR 300.320)
2. Procedural safeguards and timelines
3. LRE considerations and justification
4. Transition planning (if age 14+)
5. Assessment accommodations

Return JSON with compliance analysis:
{
  "summary": {
    "compliance_overview": "Overall compliance assessment with specifics",
    "critical_issues": ["Critical compliance gaps with citations"],
    "minor_issues": ["Minor compliance concerns"],
    "strengths": ["Compliance strengths with examples"]
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
    {"title": "Add Missing Component", "priority": "high", "suggestion": "Specific remediation steps with regulatory basis"}
  ],
  "evidence": [
    {"finding": "Missing LRE justification", "quote": "Relevant text or absence noted", "location": "Placement section", "citation": "34 CFR 300.114"}
  ]
}`;
}