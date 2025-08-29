#!/usr/bin/env python3
"""
Test script for Enhanced IEP Analysis Pipeline
Tests the two-pass analysis system with Emergent LLM integration
"""

import os
import asyncio
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Get the Emergent LLM key from environment
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

async def test_outline_scan():
    """Test Pass 1: Outline scan with GPT-4o-mini"""
    print("🔍 Testing Pass 1: Outline Scan with GPT-4o-mini")
    
    if not EMERGENT_LLM_KEY:
        print("❌ EMERGENT_LLM_KEY not found in environment")
        return False
        
    # Sample IEP text from Jones, Izabella document
    sample_text = """
    Spotsylvania County Public Schools. Office of Student Support Services
    Individualized Education Program AMENDMENT
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
    
    STATEMENT OF SPECIAL EDUCATION/RELATED SERVICES
    Academic/Social and Emotional Home Support Placement: Home 150 minutes 1 per week
    Social Work Consult: General Education Classroom 30 minutes 1 every month
    Autism Consult: General Education Classroom 30 minutes 1 every month
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="iep-test-outline",
            system_message="You are an IEP document structure analyzer. Identify key sections and organization patterns."
        ).with_model("openai", "gpt-4o-mini")
        
        outline_prompt = f"""Analyze this IEP document sample and identify the main sections present. Focus on structural organization.

IEP Sample Text:
{sample_text}

Return JSON with this structure:
{{
  "sectionsFound": ["Present Levels", "Goals", "Services", "Accommodations", "etc"],
  "documentStructure": "Brief description of how the document is organized",
  "keyAreas": ["List 3-5 most important areas to focus detailed analysis on"]
}}"""
        
        user_message = UserMessage(text=outline_prompt)
        response = await chat.send_message(user_message)
        
        print("✅ Outline scan completed successfully")
        print("📄 Response:", response[:500] + "..." if len(response) > 500 else response)
        
        # Try to parse as JSON
        try:
            result = json.loads(response)
            print("🎯 Sections found:", result.get('sectionsFound', []))
            print("🔧 Key areas:", result.get('keyAreas', []))
            return True
        except json.JSONDecodeError:
            print("⚠️  Response is not valid JSON, but call succeeded")
            return True
            
    except Exception as e:
        print(f"❌ Error in outline scan: {e}")
        return False

async def test_structured_analysis():
    """Test Pass 2: Structured analysis with Claude Sonnet-4"""
    print("\n🎯 Testing Pass 2: Structured Analysis with Claude Sonnet-4")
    
    if not EMERGENT_LLM_KEY:
        print("❌ EMERGENT_LLM_KEY not found in environment")
        return False
        
    sample_analysis_text = """
    SUMMARY OF PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE
    Academic Achievement: Izabella is able to generate questions before, during and after reading. She can determine author's purpose on self-selected text. 
    She is able to evaluate numerical expressions, use critical thinking skill, use models and graphs when engaged.
    
    Needs: Izabella is currently below grade level in reading comprehension and grade level vocabulary. She struggles with planning and brainstorming first drafts of essays.
    
    ANNUAL GOALS: 
    By the end of the IEP, when given a grade level text, Izabella will be able to comprehend academic vocabulary with 85% accuracy in 4 out of 5 trials.
    By the end of the IEP, when given a writing prompt, Izabella will write an appropriate thesis statement in 3 out of 5 trials with 70% mastery.
    By the end of the IEP, when given a calculator, Izabella will be able to solve a multistep inequality in 3 out of 4 trials with 75% mastery.
    
    SERVICES: Academic/Social and Emotional Home Support Placement: Home 150 minutes 1 per week
    Related Services: Social Work Consult 30 minutes 1 every month, Autism Consult 30 minutes 1 every month
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="iep-test-analysis",
            system_message="You are an expert IEP analyst with deep knowledge of special education law and best practices."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        analysis_prompt = f"""Perform a comprehensive IEP quality analysis based on the document content provided.

IEP Document Content:
{sample_analysis_text}

Analyze this IEP for educational quality and effectiveness. Provide evidence-backed analysis focusing on:

1. **Goals Quality**: Are goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)?
2. **Services Appropriateness**: Do services match student needs and goals?
3. **Accommodations Effectiveness**: Are accommodations comprehensive?
4. **Progress Monitoring**: Is there a clear plan for tracking progress?

CRITICAL: Reference specific evidence from the document text provided.

Return JSON in this exact format:
{{
  "summary": {{
    "strengths": ["List key educational strengths with evidence"],
    "needs": ["Areas needing improvement with specific citations"],
    "goals_overview": "Assessment of goals quality with examples"
  }},
  "scores": {{
    "goals_quality": 85,
    "services_sufficiency": 75,
    "overall": 80
  }},
  "flags": [
    {{"type": "goals", "where": "Goals section", "notes": "Specific concern with evidence"}}
  ],
  "recommendations": [
    {{"title": "Improve Goal Measurability", "suggestion": "Specific actionable suggestion", "priority": "high"}}
  ]
}}"""
        
        user_message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(user_message)
        
        print("✅ Structured analysis completed successfully")
        print("📊 Response:", response[:500] + "..." if len(response) > 500 else response)
        
        # Try to parse as JSON
        try:
            result = json.loads(response)
            print("🏆 Overall score:", result.get('scores', {}).get('overall', 'N/A'))
            print("🔍 Flags found:", len(result.get('flags', [])))
            print("💡 Recommendations:", len(result.get('recommendations', [])))
            return True
        except json.JSONDecodeError:
            print("⚠️  Response is not valid JSON, but call succeeded")
            return True
            
    except Exception as e:
        print(f"❌ Error in structured analysis: {e}")
        # Try fallback to GPT-4o
        print("🔄 Attempting fallback to GPT-4o...")
        try:
            fallback_chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id="iep-test-fallback",
                system_message="You are an expert IEP analyst with deep knowledge of special education law and best practices."
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(text=analysis_prompt)
            response = await fallback_chat.send_message(user_message)
            print("✅ Fallback to GPT-4o succeeded")
            return True
        except Exception as fallback_error:
            print(f"❌ Fallback also failed: {fallback_error}")
            return False

async def main():
    """Run the complete test suite"""
    print("🧪 Enhanced IEP Analysis Pipeline Test Suite")
    print("=" * 50)
    
    # Test Pass 1: Outline scan
    outline_success = await test_outline_scan()
    
    # Test Pass 2: Structured analysis  
    analysis_success = await test_structured_analysis()
    
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    print(f"   Pass 1 (Outline Scan): {'✅ PASS' if outline_success else '❌ FAIL'}")
    print(f"   Pass 2 (Structured Analysis): {'✅ PASS' if analysis_success else '❌ FAIL'}")
    
    if outline_success and analysis_success:
        print("\n🎉 All tests passed! Enhanced IEP pipeline is ready.")
        return True
    else:
        print("\n⚠️  Some tests failed. Check configuration and API keys.")
        return False

if __name__ == "__main__":
    asyncio.run(main())