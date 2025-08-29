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
    const emergentApiKey = Deno.env.get('EMERGENT_LLM_KEY');
    
    console.log('=== EMERGENT KEY TEST ===');
    console.log(`Key exists: ${!!emergentApiKey}`);
    console.log(`Key prefix: ${emergentApiKey?.substring(0, 15)}...`);
    console.log(`Key format check: ${emergentApiKey?.startsWith('sk-emergent-')}`);
    
    if (!emergentApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'EMERGENT_LLM_KEY not found in environment',
        debug: {
          allEnvKeys: Object.keys(Deno.env.toObject()).filter(k => k.includes('KEY') || k.includes('API'))
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test API call
    console.log('Testing API call...');
    const response = await fetch('https://integrations.emergentagent.com/llm/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emergentApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "API test successful" and nothing else.' }],
        max_tokens: 10
      }),
    });

    console.log(`API Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`API Response: ${responseText}`);

    return new Response(JSON.stringify({
      success: true,
      keyConfigured: true,
      apiTest: {
        status: response.status,
        response: responseText,
        working: response.ok
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});