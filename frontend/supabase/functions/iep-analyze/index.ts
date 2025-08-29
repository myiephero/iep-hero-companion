import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured in Supabase environment');
      throw new Error('AI analysis unavailable: OPENAI_API_KEY not configured. Please contact support.');
    }

    console.log(`Starting two-pass analysis for document ${docId} - ${kind}`);
    console.log(`API Key configured: ${openAIApiKey ? 'Yes' : 'No'}`);
    console.log(`API Key prefix: ${openAIApiKey?.substring(0, 15)}...`);
    
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
    const outlineResult = await performOutlineScan(chunks, openAIApiKey);
    
    // PASS 2: Structured Analysis with gpt-4o (since we're using OpenAI)
    console.log('Starting Pass 2: Detailed section analysis');
    const analysisResult = await performStructuredAnalysis(outlineResult, chunks, kind, studentContext, openAIApiKey);

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

  // Use Emergent proxy endpoint for LLM integration
  const apiEndpoint = emergentApiKey.startsWith('sk-emergent-') 
    ? 'https://integrations.emergentagent.com/llm/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emergentApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: emergentApiKey.startsWith('sk-emergent-') ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an IEP document structure analyzer. Identify key sections and organization patterns.' },
        { role: 'user', content: outlinePrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Outline scan failed: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Pass 1 analysis failed: ${response.status} - ${errorText.substring(0, 200)}`);
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

  // Use Emergent proxy endpoint for LLM integration
  const apiEndpoint = emergentApiKey.startsWith('sk-emergent-') 
    ? 'https://integrations.emergentagent.com/llm/v1/chat/completions'
    : 'https://api.anthropic.com/v1/messages';

  const modelName = emergentApiKey.startsWith('sk-emergent-') 
    ? 'anthropic/claude-sonnet-4-20250514' 
    : 'claude-sonnet-4-20250514';

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emergentApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are an expert IEP analyst with deep knowledge of special education law and best practices.' },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Claude analysis failed: ${response.status} ${response.statusText}`, errorText);
    
    // Fallback to gpt-4o if claude fails
    console.log('Claude request failed, falling back to gpt-4o');
    const fallbackModel = emergentApiKey.startsWith('sk-emergent-') ? 'openai/gpt-4o' : 'gpt-4o';
    const fallbackEndpoint = emergentApiKey.startsWith('sk-emergent-') 
      ? 'https://integrations.emergentagent.com/llm/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
      
    const fallbackResponse = await fetch(fallbackEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emergentApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: fallbackModel,
        messages: [
          { role: 'system', content: 'You are an expert IEP analyst with deep knowledge of special education law and best practices.' },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500
      }),
    });
    
    if (!fallbackResponse.ok) {
      const fallbackError = await fallbackResponse.text();
      console.error(`Fallback GPT-4o also failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`, fallbackError);
      throw new Error(`Both Claude and GPT-4o failed. Check API key configuration. Error: ${fallbackError.substring(0, 200)}`);
    }
    
    const fallbackData = await fallbackResponse.json();
    const result = JSON.parse(fallbackData.choices[0].message.content);
    result.evidence = priorityChunks.map(c => c.id);
    return result;
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  result.evidence = priorityChunks.map(c => c.id);
  return result;
}

function selectPriorityChunks(chunks: any[], keyAreas: string[]): any[] {
  // Combine section-tagged chunks with quality-based selection
  const sectionMap: { [key: string]: string[] } = {
    'Present Levels': ['present', 'level', 'academic', 'achievement', 'functional', 'performance', 'plaafp'],
    'Goals': ['goal', 'objective', 'measurable', 'annual', 'benchmark'],
    'Services': ['service', 'specially', 'designed', 'instruction', 'related', 'frequency', 'duration'],
    'Accommodations': ['accommodation', 'modification', 'support', 'testing', 'instructional'],
    'LRE': ['lre', 'least', 'restrictive', 'environment', 'placement', 'inclusion'],
    'Transition': ['transition', 'postsecondary', 'employment', 'independent', 'living']
  };

  let priorityChunks: any[] = [];
  
  // First, get chunks from tagged sections
  for (const area of keyAreas) {
    const areaTerms = getAreaTerms(area, sectionMap);
    const matchingChunks = chunks.filter(chunk => {
      // Check section tag first
      if (chunk.section_tag && chunk.section_tag !== 'Untagged') {
        return areaTerms.some(term => chunk.section_tag.toLowerCase().includes(term));
      }
      // Fallback to content matching
      const content = chunk.content.toLowerCase();
      return areaTerms.some(term => content.includes(term));
    });
    
    // Add highest quality chunks from this area
    matchingChunks
      .sort((a, b) => (b.text_quality_score || 0) - (a.text_quality_score || 0))
      .slice(0, 3)
      .forEach(chunk => {
        if (!priorityChunks.find(p => p.id === chunk.id)) {
          priorityChunks.push(chunk);
        }
      });
  }
  
  // If we don't have enough, add highest quality chunks overall
  if (priorityChunks.length < 8) {
    const remaining = chunks
      .filter(c => !priorityChunks.find(p => p.id === c.id))
      .sort((a, b) => (b.text_quality_score || 0) - (a.text_quality_score || 0))
      .slice(0, 8 - priorityChunks.length);
    
    priorityChunks.push(...remaining);
  }
  
  // Ensure we don't exceed token limits (~15k chars max)
  let totalChars = 0;
  const finalChunks = [];
  for (const chunk of priorityChunks) {
    if (totalChars + chunk.content.length > 15000) break;
    finalChunks.push(chunk);
    totalChars += chunk.content.length;
  }
  
  return finalChunks;
}

function getAreaTerms(area: string, sectionMap: { [key: string]: string[] }): string[] {
  // Find matching section terms for the area
  for (const [section, terms] of Object.entries(sectionMap)) {
    if (section.toLowerCase().includes(area.toLowerCase()) || 
        area.toLowerCase().includes(section.toLowerCase())) {
      return terms;
    }
  }
  // Default terms
  return area.toLowerCase().split(' ');
}

function buildQualityAnalysisPrompt(text: string, studentContext: any, outlineResult: any): string {
  return `Perform a comprehensive IEP quality analysis based on the document structure identified.

Document Structure: ${outlineResult.documentStructure}
Sections Found: ${outlineResult.sectionsFound.join(', ')}
Student Context: ${JSON.stringify(studentContext)}

IEP Document Content:
${text}

Analyze this IEP for educational quality and effectiveness. Provide evidence-backed analysis focusing on:

1. **Goals Quality**: Are goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)?
2. **Services Appropriateness**: Do services match student needs and goals?
3. **Accommodations Effectiveness**: Are accommodations comprehensive and properly specified?
4. **Progress Monitoring**: Is there a clear plan for tracking progress?
5. **Educational Benefit**: Will this IEP provide meaningful educational benefit?

CRITICAL: Reference specific evidence from the document text. Never claim content is missing if it exists in the text provided.

Return JSON in this exact format:
{
  "summary": {
    "strengths": ["List key educational strengths with evidence"],
    "needs": ["Areas needing improvement with specific citations"],
    "goals_overview": "Assessment of goals quality with examples",
    "services_overview": "Assessment of services with specifics",
    "accommodations_overview": "Assessment of accommodations with details"
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
    {"type": "goals", "where": "Goals section line X", "notes": "Specific concern with evidence"}
  ],
  "recommendations": [
    {"title": "Improve Goal Measurability", "suggestion": "Specific actionable suggestion based on document content", "priority": "high"}
  ]
}`;
}

function buildComplianceAnalysisPrompt(text: string, studentContext: any, outlineResult: any): string {
  return `Perform a comprehensive IEP compliance analysis based on IDEA requirements.

Document Structure: ${outlineResult.documentStructure}
Sections Found: ${outlineResult.sectionsFound.join(', ')}
Student Context: ${JSON.stringify(studentContext)}

IEP Document Content:
${text}

Analyze this IEP for compliance with IDEA federal requirements. Check for:

1. **Required Components**: Present Levels, Annual Goals, Special Education Services, Related Services, Accommodations, etc.
2. **Procedural Safeguards**: Evidence of parent participation and rights
3. **LRE Considerations**: Justification for placement decisions
4. **Transition Planning**: Age-appropriate transition components (14+)
5. **Assessment Accommodations**: State assessment participation decisions

CRITICAL: Base compliance findings only on evidence present in the document text provided.

Return JSON in this exact format:
{
  "summary": {
    "compliance_overview": "Overall compliance assessment with evidence",
    "critical_issues": ["List critical compliance gaps with citations"],
    "minor_issues": ["List minor compliance concerns with references"],
    "strengths": ["List compliance strengths with evidence"]
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
    {"type": "compliance", "severity": "critical", "where": "Services section", "citation": "34 CFR 300.320", "notes": "Missing required component with evidence"}
  ],
  "recommendations": [
    {"title": "Add Missing Component", "priority": "critical", "citation": "34 CFR 300.320", "suggestion": "Specific remediation steps based on findings"}
  ]
}`;
}

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