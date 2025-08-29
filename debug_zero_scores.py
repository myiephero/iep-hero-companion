#!/usr/bin/env python3
"""
Debug script to investigate the 0/100 score issue in IEP analysis
"""

import json
import re
from typing import Dict, Any

def analyze_iep_analysis_logic():
    """Analyze the IEP analysis logic to identify potential causes of 0/100 scores"""
    
    print("🔍 DEBUGGING 0/100 SCORE ISSUE")
    print("=" * 50)
    
    # Simulate the analysis response structure expected by the frontend
    sample_analysis_responses = [
        # Case 1: Properly formatted response
        {
            "summary": {
                "strengths": ["Clear goal statements", "Appropriate services identified"],
                "needs": ["More specific measurable criteria needed"],
                "goals_overview": "Goals are present but lack specific measurement criteria"
            },
            "scores": {
                "goals_quality": 75,
                "services_sufficiency": 80,
                "alignment": 70,
                "progress_reporting": 65,
                "parent_participation": 70,
                "overall": 72
            },
            "flags": [
                {"type": "goals", "where": "Goal 1", "notes": "Lacks specific measurement criteria"}
            ],
            "recommendations": [
                {"title": "Improve Goal Measurability", "suggestion": "Add specific criteria", "priority": "high"}
            ]
        },
        
        # Case 2: Response with missing scores (potential cause of 0/100)
        {
            "summary": {
                "strengths": ["Some strengths identified"],
                "needs": ["Various needs noted"]
            },
            "scores": {},  # Empty scores object
            "flags": [],
            "recommendations": []
        },
        
        # Case 3: Response with null/undefined scores
        {
            "summary": {"strengths": [], "needs": []},
            "scores": {
                "goals_quality": None,
                "services_sufficiency": None,
                "overall": None
            },
            "flags": [],
            "recommendations": []
        },
        
        # Case 4: Response with string scores instead of numbers
        {
            "summary": {"strengths": [], "needs": []},
            "scores": {
                "goals_quality": "75",
                "services_sufficiency": "80", 
                "overall": "77"
            },
            "flags": [],
            "recommendations": []
        }
    ]
    
    print("Testing different response scenarios:")
    
    for i, response in enumerate(sample_analysis_responses, 1):
        print(f"\n📊 Scenario {i}:")
        
        # Test score extraction
        scores = response.get('scores', {})
        overall_score = scores.get('overall', 0)
        
        print(f"   Raw overall score: {overall_score} (type: {type(overall_score)})")
        
        # Test score conversion
        try:
            if overall_score is None:
                converted_score = 0
                print(f"   ❌ Converted score: {converted_score} (None converted to 0)")
            elif isinstance(overall_score, str):
                converted_score = int(float(overall_score))
                print(f"   ✅ Converted score: {converted_score} (string converted to int)")
            elif isinstance(overall_score, (int, float)):
                converted_score = int(overall_score)
                print(f"   ✅ Converted score: {converted_score} (number converted to int)")
            else:
                converted_score = 0
                print(f"   ❌ Converted score: {converted_score} (unknown type converted to 0)")
        except (ValueError, TypeError) as e:
            converted_score = 0
            print(f"   ❌ Converted score: {converted_score} (conversion error: {e})")
            
        # Check if this would result in 0/100 display
        if converted_score == 0:
            print(f"   🚨 This scenario would show 0/100 in the UI!")
            
    print("\n" + "=" * 50)
    print("🔍 POTENTIAL ROOT CAUSES OF 0/100 SCORES:")
    
    causes = [
        "1. LLM API calls failing silently, returning empty responses",
        "2. JSON parsing errors causing scores object to be empty",
        "3. LLM returning scores as strings instead of numbers",
        "4. LLM returning null/undefined values for scores",
        "5. Database storage corrupting numeric values",
        "6. Frontend not handling score conversion properly",
        "7. Two-pass analysis pipeline failing at Pass 2 (Claude Sonnet)",
        "8. EMERGENT_LLM_KEY authentication failing but not throwing errors"
    ]
    
    for cause in causes:
        print(f"   {cause}")
        
    print("\n💡 DEBUGGING RECOMMENDATIONS:")
    
    recommendations = [
        "1. Add comprehensive logging to iep-analyze Edge Function",
        "2. Implement response validation before storing in database",
        "3. Add fallback scoring when LLM analysis fails",
        "4. Test with known good IEP document to verify pipeline",
        "5. Check Supabase function logs for runtime errors",
        "6. Verify EMERGENT_LLM_KEY is properly configured in Supabase",
        "7. Test Claude Sonnet-4 model availability and fallback to GPT-4o",
        "8. Add client-side validation for score display"
    ]
    
    for rec in recommendations:
        print(f"   {rec}")

def simulate_frontend_score_display():
    """Simulate how the frontend displays scores"""
    
    print("\n🖥️  FRONTEND SCORE DISPLAY SIMULATION")
    print("=" * 50)
    
    # Test cases that might result in 0/100 display
    test_cases = [
        {"name": "Normal score", "scores": {"overall": 75}},
        {"name": "Zero score", "scores": {"overall": 0}},
        {"name": "Null score", "scores": {"overall": None}},
        {"name": "Missing score", "scores": {}},
        {"name": "String score", "scores": {"overall": "75"}},
        {"name": "Invalid score", "scores": {"overall": "invalid"}},
    ]
    
    for test_case in test_cases:
        scores = test_case["scores"]
        overall = scores.get('overall', 0)
        
        # Simulate frontend score display logic
        try:
            if overall is None or overall == "":
                display_score = 0
            elif isinstance(overall, str):
                display_score = int(float(overall))
            else:
                display_score = int(overall)
        except (ValueError, TypeError):
            display_score = 0
            
        print(f"   {test_case['name']}: {display_score}/100")
        
        if display_score == 0 and test_case['name'] != "Zero score":
            print(f"      ⚠️  This would incorrectly show 0/100!")

def check_analysis_function_structure():
    """Check the structure of the analysis functions"""
    
    print("\n🔧 ANALYSIS FUNCTION STRUCTURE CHECK")
    print("=" * 50)
    
    # Read the iep-analyze function to check for potential issues
    try:
        with open('/app/frontend/supabase/functions/iep-analyze/index.ts', 'r') as f:
            content = f.read()
            
        print("✅ iep-analyze function file found")
        
        # Check for key components
        checks = [
            ("EMERGENT_LLM_KEY usage", "EMERGENT_LLM_KEY" in content),
            ("Two-pass analysis", "performOutlineScan" in content and "performStructuredAnalysis" in content),
            ("Score handling", "scores" in content),
            ("Error handling", "try" in content and "catch" in content),
            ("JSON parsing", "JSON.parse" in content),
            ("Fallback mechanism", "fallback" in content.lower()),
        ]
        
        for check_name, result in checks:
            status = "✅" if result else "❌"
            print(f"   {status} {check_name}: {'Present' if result else 'Missing'}")
            
        # Look for potential score-related issues
        if "scores:" in content:
            print("✅ Score assignment logic found in function")
        else:
            print("❌ Score assignment logic not clearly visible")
            
        # Check for model names
        if "claude-sonnet-4" in content or "claude-3-5-sonnet" in content:
            print("✅ Claude model configuration found")
        else:
            print("⚠️  Claude model configuration not found")
            
        if "gpt-4o-mini" in content:
            print("✅ GPT-4o-mini configuration found")
        else:
            print("⚠️  GPT-4o-mini configuration not found")
            
    except FileNotFoundError:
        print("❌ iep-analyze function file not found")
    except Exception as e:
        print(f"❌ Error reading function file: {e}")

def main():
    """Main debugging function"""
    analyze_iep_analysis_logic()
    simulate_frontend_score_display()
    check_analysis_function_structure()
    
    print("\n🎯 SUMMARY OF FINDINGS:")
    print("The 0/100 score issue is most likely caused by:")
    print("1. LLM API authentication or response parsing failures")
    print("2. Missing error handling in the two-pass analysis pipeline") 
    print("3. Improper score conversion from LLM responses")
    print("4. Silent failures in the Supabase Edge Function")
    
    print("\n🚀 IMMEDIATE ACTION ITEMS:")
    print("1. Check Supabase function logs for runtime errors")
    print("2. Verify EMERGENT_LLM_KEY configuration in Supabase dashboard")
    print("3. Test with a sample document to trace the full pipeline")
    print("4. Add comprehensive error logging to the analysis function")

if __name__ == "__main__":
    main()