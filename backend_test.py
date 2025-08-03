#!/usr/bin/env python3
"""
Backend API Testing for Parent Empowerment Tools
Tests all API endpoints for IEP management system
"""

import requests
import json
import os
import sys
from datetime import datetime, timedelta

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://71ed9b88-179e-492f-884d-cb26519732a8.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        
    def log_result(self, test_name, success, details, response_data=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()

    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'endpoints' in data:
                    self.log_result(
                        "Root API endpoint", 
                        True, 
                        f"Root endpoint working, returned API info with {len(data.get('endpoints', {}))} endpoints",
                        data
                    )
                else:
                    self.log_result(
                        "Root API endpoint", 
                        False, 
                        "Root endpoint returned 200 but missing expected fields",
                        data
                    )
            else:
                self.log_result(
                    "Root API endpoint", 
                    False, 
                    f"Root endpoint returned status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("Root API endpoint", False, f"Request failed: {str(e)}")

    def test_health_endpoint(self):
        """Test GET /api/health - Health check"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and 'database' in data:
                    db_status = data.get('database', 'unknown')
                    self.log_result(
                        "Health check endpoint", 
                        True, 
                        f"Health check working, database status: {db_status}",
                        data
                    )
                else:
                    self.log_result(
                        "Health check endpoint", 
                        False, 
                        "Health endpoint returned 200 but missing expected fields",
                        data
                    )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Health check endpoint", 
                    False, 
                    f"Health endpoint returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Health check endpoint", False, f"Request failed: {str(e)}")

    def test_goals_crud(self):
        """Test Goals CRUD operations"""
        created_goal_id = None
        
        # Test GET /api/goals
        try:
            response = self.session.get(f"{API_BASE}/goals")
            
            if response.status_code == 200:
                goals = response.json()
                self.log_result(
                    "Get all goals", 
                    True, 
                    f"Retrieved {len(goals)} goals successfully",
                    {"count": len(goals), "sample": goals[:2] if goals else []}
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Get all goals", 
                    False, 
                    f"GET goals returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Get all goals", False, f"Request failed: {str(e)}")

        # Test POST /api/goals
        try:
            goal_data = {
                "title": "Improve Reading Comprehension Skills",
                "status": "in_progress",
                "notes": "Working with reading specialist twice weekly",
                "targetDate": (datetime.now() + timedelta(days=90)).isoformat()
            }
            
            response = self.session.post(f"{API_BASE}/goals", json=goal_data)
            
            if response.status_code == 200:
                created_goal = response.json()
                created_goal_id = created_goal.get('id')
                self.log_result(
                    "Create new goal", 
                    True, 
                    f"Goal created successfully with ID: {created_goal_id}",
                    created_goal
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Create new goal", 
                    False, 
                    f"POST goals returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Create new goal", False, f"Request failed: {str(e)}")

        # Test PUT /api/goals/{id} - only if we created a goal
        if created_goal_id:
            try:
                update_data = {
                    "status": "completed",
                    "notes": "Goal achieved ahead of schedule!"
                }
                
                response = self.session.put(f"{API_BASE}/goals/{created_goal_id}", json=update_data)
                
                if response.status_code == 200:
                    updated_goal = response.json()
                    self.log_result(
                        "Update goal", 
                        True, 
                        f"Goal {created_goal_id} updated successfully",
                        updated_goal
                    )
                else:
                    data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                    self.log_result(
                        "Update goal", 
                        False, 
                        f"PUT goals returned status {response.status_code}",
                        data
                    )
                    
            except Exception as e:
                self.log_result("Update goal", False, f"Request failed: {str(e)}")

        # Test DELETE /api/goals/{id} - only if we created a goal
        if created_goal_id:
            try:
                response = self.session.delete(f"{API_BASE}/goals/{created_goal_id}")
                
                if response.status_code == 200:
                    result = response.json()
                    self.log_result(
                        "Delete goal", 
                        True, 
                        f"Goal {created_goal_id} deleted successfully",
                        result
                    )
                else:
                    data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                    self.log_result(
                        "Delete goal", 
                        False, 
                        f"DELETE goals returned status {response.status_code}",
                        data
                    )
                    
            except Exception as e:
                self.log_result("Delete goal", False, f"Request failed: {str(e)}")

    def test_reminders_crud(self):
        """Test Reminders CRUD operations"""
        created_reminder_id = None
        
        # Test GET /api/reminders
        try:
            response = self.session.get(f"{API_BASE}/reminders")
            
            if response.status_code == 200:
                reminders = response.json()
                self.log_result(
                    "Get all reminders", 
                    True, 
                    f"Retrieved {len(reminders)} reminders successfully",
                    {"count": len(reminders), "sample": reminders[:2] if reminders else []}
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Get all reminders", 
                    False, 
                    f"GET reminders returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Get all reminders", False, f"Request failed: {str(e)}")

        # Test POST /api/reminders
        try:
            reminder_data = {
                "title": "Annual IEP Review Meeting",
                "meetingDate": (datetime.now() + timedelta(days=14)).isoformat(),
                "notes": "Prepare progress reports and assessment data",
                "reminderType": "3_day"
            }
            
            response = self.session.post(f"{API_BASE}/reminders", json=reminder_data)
            
            if response.status_code == 200:
                created_reminder = response.json()
                created_reminder_id = created_reminder.get('id')
                self.log_result(
                    "Create new reminder", 
                    True, 
                    f"Reminder created successfully with ID: {created_reminder_id}",
                    created_reminder
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Create new reminder", 
                    False, 
                    f"POST reminders returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Create new reminder", False, f"Request failed: {str(e)}")

        # Test PUT /api/reminders/{id} - only if we created a reminder
        if created_reminder_id:
            try:
                update_data = {
                    "notes": "Updated: Include behavior intervention plan review",
                    "reminderType": "7_day"
                }
                
                response = self.session.put(f"{API_BASE}/reminders/{created_reminder_id}", json=update_data)
                
                if response.status_code == 200:
                    updated_reminder = response.json()
                    self.log_result(
                        "Update reminder", 
                        True, 
                        f"Reminder {created_reminder_id} updated successfully",
                        updated_reminder
                    )
                else:
                    data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                    self.log_result(
                        "Update reminder", 
                        False, 
                        f"PUT reminders returned status {response.status_code}",
                        data
                    )
                    
            except Exception as e:
                self.log_result("Update reminder", False, f"Request failed: {str(e)}")

    def test_ai_insights(self):
        """Test AI insights endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/ai-insights")
            
            if response.status_code == 200:
                insights = response.json()
                self.log_result(
                    "AI insights endpoint", 
                    True, 
                    f"AI insights retrieved successfully with {len(insights.get('topConcerns', []))} concerns",
                    insights
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "AI insights endpoint", 
                    False, 
                    f"GET ai-insights returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("AI insights endpoint", False, f"Request failed: {str(e)}")

    def test_send_reminders(self):
        """Test email reminder processing"""
        try:
            response = self.session.post(f"{API_BASE}/send-reminders")
            
            if response.status_code == 200:
                result = response.json()
                processed_count = result.get('processed', 0)
                self.log_result(
                    "Email reminder processing", 
                    True, 
                    f"Reminder processing completed, processed {processed_count} reminders",
                    result
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Email reminder processing", 
                    False, 
                    f"POST send-reminders returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Email reminder processing", False, f"Request failed: {str(e)}")

    def test_email_functionality(self):
        """Test email functionality"""
        try:
            test_data = {
                "email": "test@example.com"
            }
            
            response = self.session.post(f"{API_BASE}/test-email", json=test_data)
            
            if response.status_code == 200:
                result = response.json()
                self.log_result(
                    "Test email functionality", 
                    True, 
                    f"Test email sent successfully, email ID: {result.get('emailId', 'N/A')}",
                    result
                )
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_result(
                    "Test email functionality", 
                    False, 
                    f"POST test-email returned status {response.status_code}",
                    data
                )
                
        except Exception as e:
            self.log_result("Test email functionality", False, f"Request failed: {str(e)}")

    def test_cors_headers(self):
        """Test CORS headers configuration"""
        try:
            # Test OPTIONS request
            response = self.session.options(f"{API_BASE}/goals")
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            if response.status_code == 200 and cors_headers['Access-Control-Allow-Origin']:
                self.log_result(
                    "CORS headers configuration", 
                    True, 
                    "CORS headers properly configured",
                    cors_headers
                )
            else:
                self.log_result(
                    "CORS headers configuration", 
                    False, 
                    f"CORS OPTIONS returned status {response.status_code} or missing headers",
                    cors_headers
                )
                
        except Exception as e:
            self.log_result("CORS headers configuration", False, f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Backend API Tests for Parent Empowerment Tools")
        print(f"📍 Testing API at: {API_BASE}")
        print("=" * 80)
        print()
        
        # Run tests in priority order
        self.test_root_endpoint()
        self.test_health_endpoint()
        self.test_goals_crud()
        self.test_reminders_crud()
        self.test_ai_insights()
        self.test_send_reminders()
        self.test_email_functionality()
        self.test_cors_headers()
        
        # Summary
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        # Failed tests details
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        else:
            print("🎉 ALL TESTS PASSED!")
        
        print()
        return self.test_results

if __name__ == "__main__":
    tester = APITester()
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    failed_count = sum(1 for result in results if not result['success'])
    sys.exit(failed_count)