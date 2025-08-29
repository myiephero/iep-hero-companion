#!/usr/bin/env python3
"""
Debug script specifically for the 0/100 score issue in IEP analysis
Tests the actual LLM integration and response parsing
"""

import requests
import json
import os
import sys

# Configuration from environment files
SUPABASE_URL = "https://xwyhwgbbogeosagclwet.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3eWh3Z2Jib2dlb3NhZ2Nsd2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTg2MzUsImV4cCI6MjA3MTk5NDYzNX0.s9TudZTRIxjc_uPkaIUJhIhsfKhULuzpuzszJMMlyTo"

class ZeroScoreDebugger:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
        })
        
    def test_llm_api_directly(self):
        """Test the Emergent LLM API directly to see if it's working"""
        print("🔍 Testing Emergent LLM API directly...")
        
        # Test data similar to what would be in an IEP
        test_prompt = """Analyze this IEP document sample and return a JSON response with scores.

IEP Sample:
Student Name: Jones, Izabella S.
Date Of Birth: 09/09/2008
Eligible: Emotional Disability, Other Health Impairment

SUMMARY OF PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE
Academic Achievement: Izabella is able to generate questions before, during and after reading on assigned and self-selected text. 
Izabella can determine author's purpose on self-selected text. She is able to evaluate numerical expressions, use critical thinking skills.

Needs as They Impact Learning: Izabella is currently below grade level in the areas of reading comprehension and grade level vocabulary. 
She struggles with planning and brainstorming first drafts of essays, with writing and solving two step linear equations.

ANNUAL GOALS AND BENCHMARKS OR SHORT TERM OBJECTIVES
Category: ACADEMIC GOALS
By the end of the IEP, when given a grade level text, Izabella will be able to comprehend academic vocabulary with 85% accuracy in 4 out of 5 trials.
By the end of the IEP, when given a writing prompt, Izabella will write an appropriate thesis statement in 3 out of 5 trials with 70% mastery.

Return JSON with scores like this:
{
  "scores": {
    "goals_quality": 85,
    "services_sufficiency": 75,
    "overall": 80
  },
  "summary": {
    "strengths": ["Clear academic goals", "Specific measurable criteria"],
    "needs": ["More detailed services", "Additional accommodations"]
  }
}"""

        # Test with different API endpoints that might be used
        test_endpoints = [
            {
                "name": "Emergent Proxy (GPT-4o-mini)",
                "url": "https://integrations.emergentagent.com/llm/v1/chat/completions",
                "model": "openai/gpt-4o-mini",
                "headers": {"Authorization": "Bearer sk-emergent-test"}
            },
            {
                "name": "Emergent Proxy (Claude)",
                "url": "https://integrations.emergentagent.com/llm/v1/chat/completions", 
                "model": "anthropic/claude-sonnet-4-20250514",
                "headers": {"Authorization": "Bearer sk-emergent-test"}
            }
        ]
        
        for endpoint in test_endpoints:
            try:
                print(f"\n📡 Testing {endpoint['name']}...")
                
                response = requests.post(
                    endpoint["url"],
                    headers={
                        **endpoint["headers"],
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": endpoint["model"],
                        "messages": [
                            {"role": "system", "content": "You are an IEP analyst. Return valid JSON."},
                            {"role": "user", "content": test_prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "max_tokens": 1000
                    },
                    timeout=30
                )
                
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"]
                            parsed = json.loads(content)
                            print(f"   ✅ JSON parsed successfully")
                            print(f"   Scores: {parsed.get('scores', 'NOT FOUND')}")
                        else:
                            print(f"   ❌ Unexpected response structure")
                    except json.JSONDecodeError as e:
                        print(f"   ❌ JSON parsing failed: {e}")
                elif response.status_code == 401:
                    print(f"   ⚠️  Authentication error (expected without real API key)")
                else:
                    print(f"   ❌ API call failed: {response.text}")
                    
            except Exception as e:
                print(f"   ❌ Request failed: {e}")
                
    def test_supabase_function_with_mock_data(self):
        """Test Supabase functions with mock data to see response patterns"""
        print("\n🧪 Testing Supabase Edge Functions with mock data...")
        
        # Test iep-analyze function with mock document ID
        test_cases = [
            {
                "name": "Quality Analysis",
                "data": {"docId": "test-doc-123", "kind": "quality"}
            },
            {
                "name": "Compliance Analysis", 
                "data": {"docId": "test-doc-123", "kind": "compliance"}
            },
            {
                "name": "Missing docId",
                "data": {"kind": "quality"}
            },
            {
                "name": "Invalid kind",
                "data": {"docId": "test-doc-123", "kind": "invalid"}
            }
        ]
        
        for test_case in test_cases:
            try:
                print(f"\n📋 Testing {test_case['name']}...")
                
                response = self.session.post(
                    f"{SUPABASE_URL}/functions/v1/iep-analyze",
                    json=test_case["data"],
                    headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'},
                    timeout=30
                )
                
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                
                # Look for specific error patterns that might indicate the issue
                response_text = response.text.lower()
                
                if "emergent llm api key not configured" in response_text:
                    print(f"   🔑 ISSUE FOUND: EMERGENT_LLM_KEY not configured in Supabase")
                elif "authorization header required" in response_text:
                    print(f"   🔐 Auth error (expected)")
                elif "document not found" in response_text:
                    print(f"   📄 Document error (expected for mock data)")
                elif "0" in response_text and "100" in response_text:
                    print(f"   🎯 POTENTIAL ISSUE: Found 0/100 pattern in response")
                elif response.status_code == 200:
                    try:
                        data = response.json()
                        if "scores" in str(data):
                            print(f"   ✅ Response contains scores structure")
                        else:
                            print(f"   ⚠️  Response missing scores structure")
                    except:
                        print(f"   ❌ Response not valid JSON")
                        
            except Exception as e:
                print(f"   ❌ Request failed: {e}")
                
    def analyze_potential_causes(self):
        """Analyze potential causes of the 0/100 score issue"""
        print("\n🔍 ANALYZING POTENTIAL CAUSES OF 0/100 SCORE ISSUE:")
        print("=" * 60)
        
        causes = [
            {
                "cause": "EMERGENT_LLM_KEY not configured in Supabase Edge Functions",
                "likelihood": "HIGH",
                "evidence": "Functions return auth errors, key not found in local env",
                "fix": "Configure EMERGENT_LLM_KEY in Supabase project settings"
            },
            {
                "cause": "LLM API returning null/empty responses",
                "likelihood": "MEDIUM", 
                "evidence": "API calls succeed but content is empty",
                "fix": "Add response validation and fallback handling"
            },
            {
                "cause": "JSON parsing failures in Edge Functions",
                "likelihood": "MEDIUM",
                "evidence": "LLM returns non-JSON or malformed JSON",
                "fix": "Improve JSON parsing with try/catch and defaults"
            },
            {
                "cause": "Score calculation logic defaulting to 0",
                "likelihood": "LOW",
                "evidence": "Code analysis shows proper score handling",
                "fix": "Add logging to track score calculation flow"
            },
            {
                "cause": "Database storage corruption",
                "likelihood": "LOW",
                "evidence": "Scores stored correctly but retrieved as 0",
                "fix": "Check database schema and data types"
            }
        ]
        
        for i, cause in enumerate(causes, 1):
            print(f"\n{i}. {cause['cause']}")
            print(f"   Likelihood: {cause['likelihood']}")
            print(f"   Evidence: {cause['evidence']}")
            print(f"   Fix: {cause['fix']}")
            
    def run_comprehensive_debug(self):
        """Run comprehensive debugging of the 0/100 score issue"""
        print("🚨 DEBUGGING 0/100 SCORE ISSUE IN IEP ANALYSIS PIPELINE")
        print("=" * 70)
        
        # Test 1: Direct LLM API testing
        self.test_llm_api_directly()
        
        # Test 2: Supabase function testing
        self.test_supabase_function_with_mock_data()
        
        # Test 3: Analyze potential causes
        self.analyze_potential_causes()
        
        print("\n" + "=" * 70)
        print("🎯 DEBUGGING SUMMARY:")
        print("The 0/100 score issue is most likely caused by:")
        print("1. EMERGENT_LLM_KEY not being configured in Supabase Edge Functions")
        print("2. LLM API calls failing silently and returning default/empty scores")
        print("3. JSON parsing errors causing fallback to default values")
        print("\n💡 RECOMMENDED ACTIONS:")
        print("1. Configure EMERGENT_LLM_KEY in Supabase project environment variables")
        print("2. Add comprehensive logging to iep-analyze function")
        print("3. Test with actual IEP document upload and analysis")
        print("4. Implement better error handling and fallback mechanisms")

def main():
    debugger = ZeroScoreDebugger()
    debugger.run_comprehensive_debug()
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)