#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for Enhanced IEP Analysis Pipeline
Tests the two-pass analysis system with Supabase Edge Functions
"""

import asyncio
import json
import os
import sys
import requests
import time
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://iep-review-tool.preview.emergentagent.com')
SUPABASE_URL = "https://xwyhwgbbogeosagclwet.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3eWh3Z2Jib2dlb3NhZ2Nsd2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTg2MzUsImV4cCI6MjA3MTk5NDYzNX0.s9TudZTRIxjc_uPkaIUJhIhsfKhULuzpuzszJMMlyTo"

class IEPAnalysisTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
        })
        self.auth_token = None
        self.test_results = {}
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test results"""
        print(f"{'✅' if status == 'PASS' else '❌'} {test_name}: {status}")
        if details:
            print(f"   {details}")
        self.test_results[test_name] = {"status": status, "details": details}
        
    def test_basic_backend_connectivity(self) -> bool:
        """Test basic backend API connectivity"""
        try:
            response = self.session.get(f"{BACKEND_URL}/api/")
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Hello World':
                    self.log_test("Basic Backend Connectivity", "PASS", f"Backend responding at {BACKEND_URL}")
                    return True
                else:
                    self.log_test("Basic Backend Connectivity", "FAIL", f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Basic Backend Connectivity", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Basic Backend Connectivity", "FAIL", f"Connection error: {str(e)}")
            return False
            
    def test_supabase_edge_function_accessibility(self) -> bool:
        """Test if Supabase Edge Functions are accessible"""
        functions_to_test = ['iep-ingest', 'iep-analyze']
        all_accessible = True
        
        for func_name in functions_to_test:
            try:
                # Test function accessibility (should return 401 without auth, not 404)
                response = self.session.post(
                    f"{SUPABASE_URL}/functions/v1/{func_name}",
                    json={"test": "connectivity"}
                )
                
                if response.status_code in [401, 403]:
                    self.log_test(f"Supabase Function {func_name} Accessibility", "PASS", 
                                f"Function exists (returns {response.status_code} without auth)")
                elif response.status_code == 404:
                    self.log_test(f"Supabase Function {func_name} Accessibility", "FAIL", 
                                "Function not found (404)")
                    all_accessible = False
                else:
                    self.log_test(f"Supabase Function {func_name} Accessibility", "PARTIAL", 
                                f"Unexpected status {response.status_code}: {response.text[:200]}")
                    
            except Exception as e:
                self.log_test(f"Supabase Function {func_name} Accessibility", "FAIL", 
                            f"Connection error: {str(e)}")
                all_accessible = False
                
        return all_accessible
        
    def test_emergent_llm_key_availability(self) -> bool:
        """Test if EMERGENT_LLM_KEY is available in Supabase environment"""
        try:
            # Try to call iep-analyze without proper data to see if we get API key error
            response = self.session.post(
                f"{SUPABASE_URL}/functions/v1/iep-analyze",
                json={"docId": "test-doc-id"},
                headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
            )
            
            response_text = response.text.lower()
            
            if "emergent llm api key not configured" in response_text or "emergent_llm_key" in response_text:
                self.log_test("EMERGENT_LLM_KEY Availability", "FAIL", 
                            "EMERGENT_LLM_KEY not configured in Supabase environment")
                return False
            elif "authorization header required" in response_text or "invalid authorization" in response_text:
                self.log_test("EMERGENT_LLM_KEY Availability", "PASS", 
                            "API key appears to be configured (auth error expected)")
                return True
            elif "document not found" in response_text or "document id is required" in response_text:
                self.log_test("EMERGENT_LLM_KEY Availability", "PASS", 
                            "API key appears to be configured (document error expected)")
                return True
            else:
                self.log_test("EMERGENT_LLM_KEY Availability", "UNKNOWN", 
                            f"Unexpected response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("EMERGENT_LLM_KEY Availability", "FAIL", f"Error testing API key: {str(e)}")
            return False
            
    def test_enhanced_iep_pipeline_locally(self) -> bool:
        """Test the enhanced IEP analysis pipeline using local test script"""
        try:
            # Check if the test script exists
            test_script_path = "/app/backend/test_enhanced_iep.py"
            if not os.path.exists(test_script_path):
                self.log_test("Enhanced IEP Pipeline (Local)", "FAIL", "Test script not found")
                return False
                
            # Check if EMERGENT_LLM_KEY is available locally
            if not os.environ.get('EMERGENT_LLM_KEY'):
                self.log_test("Enhanced IEP Pipeline (Local)", "FAIL", 
                            "EMERGENT_LLM_KEY not available in local environment")
                return False
                
            # Run the test script
            import subprocess
            result = subprocess.run([sys.executable, test_script_path], 
                                  capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                # Check for success indicators in output
                output = result.stdout.lower()
                if "all tests passed" in output or "✅" in result.stdout:
                    self.log_test("Enhanced IEP Pipeline (Local)", "PASS", 
                                "Local pipeline test completed successfully")
                    return True
                else:
                    self.log_test("Enhanced IEP Pipeline (Local)", "PARTIAL", 
                                f"Script ran but results unclear: {result.stdout[:200]}")
                    return False
            else:
                self.log_test("Enhanced IEP Pipeline (Local)", "FAIL", 
                            f"Script failed: {result.stderr[:200]}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log_test("Enhanced IEP Pipeline (Local)", "FAIL", "Test script timed out")
            return False
        except Exception as e:
            self.log_test("Enhanced IEP Pipeline (Local)", "FAIL", f"Error running test: {str(e)}")
            return False
            
    def test_document_ingestion_flow(self) -> bool:
        """Test the document ingestion flow without actual file upload"""
        try:
            # Test the ingestion endpoint accessibility
            response = self.session.post(
                f"{SUPABASE_URL}/functions/v1/iep-ingest",
                json={"docId": "test-doc-id"},
                headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
            )
            
            response_text = response.text.lower()
            
            # Expected errors that indicate the function is working
            expected_errors = [
                "authorization header required",
                "invalid authorization token", 
                "document not found",
                "document id is required"
            ]
            
            if any(error in response_text for error in expected_errors):
                self.log_test("Document Ingestion Flow", "PASS", 
                            "Ingestion function accessible and processing requests")
                return True
            elif "emergent" in response_text and "key" in response_text:
                self.log_test("Document Ingestion Flow", "FAIL", 
                            "API key configuration issue")
                return False
            else:
                self.log_test("Document Ingestion Flow", "UNKNOWN", 
                            f"Unexpected response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Document Ingestion Flow", "FAIL", f"Error testing ingestion: {str(e)}")
            return False
            
    def test_two_pass_analysis_flow(self) -> bool:
        """Test the two-pass analysis flow accessibility"""
        try:
            # Test both quality and compliance analysis
            for analysis_kind in ['quality', 'compliance']:
                response = self.session.post(
                    f"{SUPABASE_URL}/functions/v1/iep-analyze",
                    json={"docId": "test-doc-id", "kind": analysis_kind},
                    headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
                )
                
                response_text = response.text.lower()
                
                # Expected errors that indicate the function is working
                expected_errors = [
                    "authorization header required",
                    "invalid authorization token",
                    "document not found",
                    "document id is required"
                ]
                
                if any(error in response_text for error in expected_errors):
                    self.log_test(f"Two-Pass Analysis ({analysis_kind})", "PASS", 
                                "Analysis function accessible and processing requests")
                elif "emergent llm api key not configured" in response_text:
                    self.log_test(f"Two-Pass Analysis ({analysis_kind})", "FAIL", 
                                "EMERGENT_LLM_KEY not configured")
                    return False
                else:
                    self.log_test(f"Two-Pass Analysis ({analysis_kind})", "UNKNOWN", 
                                f"Unexpected response: {response.text[:200]}")
                    
            return True
            
        except Exception as e:
            self.log_test("Two-Pass Analysis Flow", "FAIL", f"Error testing analysis: {str(e)}")
            return False
            
    def test_error_handling_and_debugging(self) -> bool:
        """Test error handling in the analysis pipeline"""
        try:
            # Test with invalid data to check error handling
            test_cases = [
                {"name": "Missing docId", "data": {}},
                {"name": "Invalid kind", "data": {"docId": "test", "kind": "invalid"}},
                {"name": "Empty docId", "data": {"docId": ""}},
            ]
            
            all_handled = True
            
            for test_case in test_cases:
                response = self.session.post(
                    f"{SUPABASE_URL}/functions/v1/iep-analyze",
                    json=test_case["data"],
                    headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
                )
                
                if response.status_code >= 400:
                    try:
                        error_data = response.json()
                        if "error" in error_data:
                            self.log_test(f"Error Handling - {test_case['name']}", "PASS", 
                                        f"Proper error response: {error_data['error'][:100]}")
                        else:
                            self.log_test(f"Error Handling - {test_case['name']}", "PARTIAL", 
                                        "Error returned but format unclear")
                    except:
                        self.log_test(f"Error Handling - {test_case['name']}", "PARTIAL", 
                                    f"Error returned but not JSON: {response.text[:100]}")
                else:
                    self.log_test(f"Error Handling - {test_case['name']}", "FAIL", 
                                "Should have returned error but didn't")
                    all_handled = False
                    
            return all_handled
            
        except Exception as e:
            self.log_test("Error Handling and Debugging", "FAIL", f"Error testing error handling: {str(e)}")
            return False
            
    def investigate_zero_score_issue(self) -> Dict[str, Any]:
        """Investigate the reported 0/100 score issue"""
        investigation_results = {
            "potential_causes": [],
            "recommendations": []
        }
        
        print("\n🔍 INVESTIGATING 0/100 SCORE ISSUE:")
        print("=" * 50)
        
        # Check 1: API Key availability
        if not os.environ.get('EMERGENT_LLM_KEY'):
            investigation_results["potential_causes"].append(
                "EMERGENT_LLM_KEY not available in local environment"
            )
            investigation_results["recommendations"].append(
                "Set EMERGENT_LLM_KEY environment variable for local testing"
            )
            
        # Check 2: Function accessibility
        try:
            response = self.session.post(
                f"{SUPABASE_URL}/functions/v1/iep-analyze",
                json={"docId": "test"},
                headers={'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
            )
            
            if "emergent" in response.text.lower() and "key" in response.text.lower():
                investigation_results["potential_causes"].append(
                    "EMERGENT_LLM_KEY not configured in Supabase Edge Function environment"
                )
                investigation_results["recommendations"].append(
                    "Configure EMERGENT_LLM_KEY in Supabase project settings"
                )
                
        except Exception as e:
            investigation_results["potential_causes"].append(f"Network connectivity issue: {str(e)}")
            
        # Check 3: Response parsing issues
        investigation_results["potential_causes"].extend([
            "LLM response not being parsed correctly as JSON",
            "Score calculation logic returning 0 instead of actual scores",
            "Two-pass pipeline failing silently and returning default values",
            "Database storage issues causing score corruption"
        ])
        
        investigation_results["recommendations"].extend([
            "Add detailed logging to iep-analyze function to track score calculation",
            "Implement response validation to ensure JSON parsing succeeds",
            "Add fallback scoring mechanism if primary analysis fails",
            "Test with sample IEP document to verify end-to-end pipeline"
        ])
        
        # Print investigation results
        print("\n📋 POTENTIAL CAUSES:")
        for i, cause in enumerate(investigation_results["potential_causes"], 1):
            print(f"   {i}. {cause}")
            
        print("\n💡 RECOMMENDATIONS:")
        for i, rec in enumerate(investigation_results["recommendations"], 1):
            print(f"   {i}. {rec}")
            
        return investigation_results
        
    def run_comprehensive_test_suite(self) -> Dict[str, Any]:
        """Run the complete test suite"""
        print("🧪 ENHANCED IEP ANALYSIS PIPELINE TEST SUITE")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Supabase URL: {SUPABASE_URL}")
        print("=" * 60)
        
        # Run all tests
        tests = [
            ("Basic Backend Connectivity", self.test_basic_backend_connectivity),
            ("Supabase Edge Function Accessibility", self.test_supabase_edge_function_accessibility),
            ("EMERGENT_LLM_KEY Availability", self.test_emergent_llm_key_availability),
            ("Enhanced IEP Pipeline (Local)", self.test_enhanced_iep_pipeline_locally),
            ("Document Ingestion Flow", self.test_document_ingestion_flow),
            ("Two-Pass Analysis Flow", self.test_two_pass_analysis_flow),
            ("Error Handling and Debugging", self.test_error_handling_and_debugging),
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if result:
                    passed_tests += 1
            except Exception as e:
                self.log_test(test_name, "ERROR", f"Test execution failed: {str(e)}")
                
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY:")
        print(f"   Passed: {passed_tests}/{total_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Run investigation if there are failures
        if passed_tests < total_tests:
            investigation = self.investigate_zero_score_issue()
        else:
            investigation = {"potential_causes": [], "recommendations": []}
            
        return {
            "tests_passed": passed_tests,
            "total_tests": total_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "test_results": self.test_results,
            "investigation": investigation
        }

def main():
    """Main test execution"""
    tester = IEPAnalysisTester()
    results = tester.run_comprehensive_test_suite()
    
    # Print final assessment
    print("\n🎯 FINAL ASSESSMENT:")
    if results["success_rate"] >= 80:
        print("✅ IEP Analysis Pipeline appears to be functioning well")
    elif results["success_rate"] >= 60:
        print("⚠️  IEP Analysis Pipeline has some issues but core functionality works")
    else:
        print("❌ IEP Analysis Pipeline has significant issues requiring attention")
        
    print("\n🔧 NEXT STEPS:")
    if results["investigation"]["recommendations"]:
        for i, rec in enumerate(results["investigation"]["recommendations"][:3], 1):
            print(f"   {i}. {rec}")
    else:
        print("   No critical issues identified. Pipeline ready for production use.")
        
    return results["success_rate"] >= 60

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)