#!/usr/bin/env python3
"""
Quick test script to verify EMERGENT_LLM_KEY configuration
Tests if the API key works with a simple request
"""

import asyncio
import os
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

async def test_emergent_key():
    """Test if the Emergent API key is working"""
    
    # Get the API key
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    
    if not api_key:
        print("❌ EMERGENT_LLM_KEY not found in environment")
        print("⚠️  This key needs to be configured in Supabase Edge Functions environment")
        return False
    
    print(f"✅ Found EMERGENT_LLM_KEY: {api_key[:15]}...")
    print(f"🔑 Key format check: {'✅ Correct' if api_key.startswith('sk-emergent-') else '❌ Invalid format'}")
    
    try:
        # Test with gpt-4o-mini (Pass 1 model)
        print("\n🧪 Testing Pass 1 model (gpt-4o-mini)...")
        
        chat1 = LlmChat(
            api_key=api_key,
            session_id="test-pass1",
            system_message="You are a test assistant. Return only JSON."
        ).with_model("openai", "gpt-4o-mini")
        
        test_message = UserMessage(text='''Analyze this sample and return JSON:
        
Sample: "Student has goals for reading comprehension at 85% accuracy."

Return: {"analysis": "sample analysis", "score": 75}''')
        
        response1 = await chat1.send_message(test_message)
        print(f"✅ GPT-4o-mini response: {response1[:100]}...")
        
        # Test parsing
        try:
            parsed = json.loads(response1)
            print(f"✅ JSON parsing successful: {parsed}")
        except:
            print(f"⚠️  Response not JSON, but API call succeeded")
        
        # Test with Claude (Pass 2 model)
        print("\n🧪 Testing Pass 2 model (claude-sonnet-4)...")
        
        chat2 = LlmChat(
            api_key=api_key,
            session_id="test-pass2", 
            system_message="You are an IEP analyst. Return only JSON."
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        response2 = await chat2.send_message(test_message)
        print(f"✅ Claude response: {response2[:100]}...")
        
        print("\n🎉 SUCCESS: Both models working correctly!")
        print("✅ EMERGENT_LLM_KEY is properly configured")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: API call failed - {e}")
        print("🔧 This indicates the API key may not be configured in Supabase")
        return False

if __name__ == "__main__":
    print("🔍 Testing EMERGENT_LLM_KEY Configuration")
    print("=" * 50)
    
    success = asyncio.run(test_emergent_key())
    
    if not success:
        print("\n📋 CONFIGURATION STEPS:")
        print("1. Go to Supabase Dashboard")
        print("2. Navigate to Settings → Edge Functions")  
        print("3. Add environment variable: EMERGENT_LLM_KEY = your_key_here")
        print("4. Redeploy Edge Functions")
        print("5. Test the IEP analysis again")