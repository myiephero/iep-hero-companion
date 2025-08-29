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
    const { analysisId, templateType = 'goal_revision_request', userInputs = {} } = await req.json();
    
    if (!analysisId) {
      throw new Error('Analysis ID is required');
    }

    console.log(`Generating action draft for analysis ${analysisId}, template: ${templateType}`);
    
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

    // Get the analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('iep_analysis')
      .select('*, iep_documents!inner(*)')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      throw new Error('Analysis not found or access denied');
    }

    // Generate the action draft based on template and analysis
    const draftContent = await generateActionDraft(templateType, analysis, userInputs);

    // Store the action draft
    const { data: actionDraft, error: draftError } = await supabase
      .from('iep_action_drafts')
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        title: draftContent.title,
        body: draftContent.body
      })
      .select()
      .single();

    if (draftError) {
      console.error('Error storing action draft:', draftError);
      throw new Error('Failed to store action draft');
    }

    console.log('Action draft generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        draftId: actionDraft.id,
        title: draftContent.title,
        body: draftContent.body
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in iep-action-draft function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during action draft generation'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateActionDraft(templateType: string, analysis: any, userInputs: any) {
  // Get template and variables
  const template = getTemplate(templateType);
  
  // Extract key information from analysis
  const flags = analysis.flags || [];
  const recommendations = analysis.recommendations || [];
  const scores = analysis.scores || {};
  
  // Find specific issues to address
  const goalIssues = flags.filter((f: any) => f.type?.includes('goal') || f.where?.toLowerCase().includes('goal'));
  const serviceIssues = flags.filter((f: any) => f.type?.includes('service') || f.where?.toLowerCase().includes('service'));
  
  // Generate content based on template type
  let generatedContent;
  
  switch (templateType) {
    case 'goal_revision_request':
      generatedContent = generateGoalRevisionLetter(template, analysis, goalIssues, userInputs);
      break;
    case 'service_request':
      generatedContent = generateServiceRequestLetter(template, analysis, serviceIssues, userInputs);
      break;
    case 'evaluation_request':
      generatedContent = generateEvaluationRequestLetter(template, analysis, userInputs);
      break;
    default:
      generatedContent = generateGenericLetter(template, analysis, userInputs);
  }

  return generatedContent;
}

function getTemplate(templateType: string) {
  const templates = {
    goal_revision_request: {
      title: "Request for IEP Goal Revision",
      body: `Dear {caseManager},

I am writing to request a revision to my child's IEP goals based on concerns identified during my recent review of the current IEP.

{studentName}'s Current Situation:
{currentSituation}

Specific Goals Requiring Revision:
{goalConcerns}

Requested Changes:
{requestedChanges}

Justification:
{justification}

I would appreciate the opportunity to discuss these revisions at an upcoming IEP team meeting. Please let me know when we can schedule a meeting to address these concerns.

Thank you for your attention to {studentName}'s educational needs.

Sincerely,
{parentName}
{date}`
    },
    service_request: {
      title: "Request for Additional IEP Services",
      body: `Dear {caseManager},

I am writing to request additional services for my child, {studentName}, based on ongoing concerns about their progress and identified gaps in current service provision.

Current Services Analysis:
{currentServices}

Areas of Concern:
{serviceConcerns}

Requested Additional Services:
{requestedServices}

Supporting Evidence:
{supportingEvidence}

I believe these additional services are necessary for {studentName} to receive a free appropriate public education (FAPE) and make meaningful progress toward their IEP goals.

Please schedule an IEP team meeting to discuss these service requests.

Thank you for your consideration.

Sincerely,
{parentName}
{date}`
    },
    evaluation_request: {
      title: "Request for Educational Evaluation",
      body: `Dear {caseManager},

I am formally requesting a comprehensive educational evaluation for my child, {studentName}, in the following areas:

Requested Evaluation Areas:
{evaluationAreas}

Reasons for Request:
{evaluationReasons}

Supporting Concerns:
{supportingConcerns}

As you know, under IDEA, the school district has 15 school days to respond to this request and, if agreed upon, must complete the evaluation within 60 school days.

Please provide me with a written response to this request and the necessary consent forms to proceed with the evaluation.

Thank you for your prompt attention to this matter.

Sincerely,
{parentName}
{date}`
    }
  };
  
  return templates[templateType as keyof typeof templates] || templates.goal_revision_request;
}

function generateGoalRevisionLetter(template: any, analysis: any, goalIssues: any[], userInputs: any) {
  const studentName = userInputs.studentName || '[Student Name]';
  const parentName = userInputs.parentName || '[Parent Name]';
  const caseManager = userInputs.caseManager || '[Case Manager Name]';
  
  // Extract goal-related concerns
  const goalConcerns = goalIssues.length > 0 
    ? goalIssues.map(issue => `• ${issue.where}: ${issue.notes}`).join('\n')
    : 'Goals lack measurable criteria and specific benchmarks for progress monitoring.';
  
  // Get relevant recommendations
  const goalRecommendations = (analysis.recommendations || [])
    .filter((rec: any) => rec.title?.toLowerCase().includes('goal'))
    .map((rec: any) => `• ${rec.suggestion}`)
    .join('\n');
  
  const requestedChanges = goalRecommendations || 'Please revise goals to include specific, measurable criteria with clear baselines and progress monitoring methods.';
  
  const justification = `Based on my review of the current IEP, the goals need to be more specific and measurable to ensure appropriate progress monitoring. Current goal quality score: ${analysis.scores?.goals_quality || 'N/A'}/100.`;
  
  const body = template.body
    .replace(/{studentName}/g, studentName)
    .replace(/{parentName}/g, parentName)
    .replace(/{caseManager}/g, caseManager)
    .replace(/{currentSituation}/g, userInputs.currentSituation || 'Ongoing concerns about goal clarity and measurability.')
    .replace(/{goalConcerns}/g, goalConcerns)
    .replace(/{requestedChanges}/g, requestedChanges)
    .replace(/{justification}/g, justification)
    .replace(/{date}/g, new Date().toLocaleDateString());
  
  return {
    title: template.title,
    body: body
  };
}

function generateServiceRequestLetter(template: any, analysis: any, serviceIssues: any[], userInputs: any) {
  const studentName = userInputs.studentName || '[Student Name]';
  const parentName = userInputs.parentName || '[Parent Name]';
  const caseManager = userInputs.caseManager || '[Case Manager Name]';
  
  const serviceConcerns = serviceIssues.length > 0
    ? serviceIssues.map(issue => `• ${issue.notes}`).join('\n')
    : 'Current services appear insufficient to meet identified student needs.';
  
  const body = template.body
    .replace(/{studentName}/g, studentName)
    .replace(/{parentName}/g, parentName)
    .replace(/{caseManager}/g, caseManager)
    .replace(/{currentServices}/g, userInputs.currentServices || 'Current service levels need review based on student progress.')
    .replace(/{serviceConcerns}/g, serviceConcerns)
    .replace(/{requestedServices}/g, userInputs.requestedServices || 'Additional direct instruction and support services.')
    .replace(/{supportingEvidence}/g, userInputs.supportingEvidence || 'IEP analysis indicates gaps in current service provision.')
    .replace(/{date}/g, new Date().toLocaleDateString());
  
  return {
    title: template.title,
    body: body
  };
}

function generateEvaluationRequestLetter(template: any, analysis: any, userInputs: any) {
  const studentName = userInputs.studentName || '[Student Name]';
  const parentName = userInputs.parentName || '[Parent Name]';
  const caseManager = userInputs.caseManager || '[Case Manager Name]';
  
  const body = template.body
    .replace(/{studentName}/g, studentName)
    .replace(/{parentName}/g, parentName)
    .replace(/{caseManager}/g, caseManager)
    .replace(/{evaluationAreas}/g, userInputs.evaluationAreas || 'Academic, cognitive, and behavioral assessment areas.')
    .replace(/{evaluationReasons}/g, userInputs.evaluationReasons || 'Concerns about current educational progress and service needs.')
    .replace(/{supportingConcerns}/g, userInputs.supportingConcerns || 'IEP analysis indicates need for updated assessment data.')
    .replace(/{date}/g, new Date().toLocaleDateString());
  
  return {
    title: template.title,
    body: body
  };
}

function generateGenericLetter(template: any, analysis: any, userInputs: any) {
  return {
    title: template.title,
    body: template.body
  };
}