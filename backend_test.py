#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class AdvocateMatchingAPITester:
    def __init__(self, base_url="https://match-flow.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_student_id = None
        self.test_proposal_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details and success:
            print(f"   Details: {details}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            return success, response
            
        except requests.exceptions.RequestException as e:
            return False, str(e)

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.make_request('GET', '')
        if success:
            try:
                data = response.json()
                self.log_test("API Root", True, f"Message: {data.get('message', 'No message')}")
            except:
                self.log_test("API Root", False, "Invalid JSON response")
        else:
            self.log_test("API Root", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def test_get_students(self):
        """Test getting students list"""
        success, response = self.make_request('GET', 'students')
        if success:
            try:
                students = response.json()
                self.log_test("Get Students", True, f"Found {len(students)} students")
                
                # Check if we have pre-seeded students
                if len(students) >= 3:
                    student_names = [s.get('name', 'Unknown') for s in students]
                    print(f"   Pre-seeded students: {', '.join(student_names[:3])}")
                    
                    # Store first student ID for later tests
                    if students:
                        self.test_student_id = students[0]['id']
                        print(f"   Using student ID for tests: {self.test_student_id}")
                
                return students
            except Exception as e:
                self.log_test("Get Students", False, f"JSON parsing error: {e}")
                return []
        else:
            self.log_test("Get Students", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return []

    def test_create_student(self):
        """Test creating a new student"""
        student_data = {
            "name": f"Test Student {datetime.now().strftime('%H%M%S')}",
            "grade": 5,
            "needs": ["autism", "speech"],
            "languages": ["en"],
            "timezone": "America/New_York",
            "budget": 75.0,
            "narrative": "Test student for API testing"
        }
        
        success, response = self.make_request('POST', 'students', student_data, 200)
        if success:
            try:
                created_student = response.json()
                self.log_test("Create Student", True, f"Created: {created_student.get('name')}")
                return created_student
            except Exception as e:
                self.log_test("Create Student", False, f"JSON parsing error: {e}")
        else:
            self.log_test("Create Student", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
        return None

    def test_get_advocate_profiles(self):
        """Test getting advocate profiles"""
        success, response = self.make_request('GET', 'advocate-profiles')
        if success:
            try:
                advocates = response.json()
                self.log_test("Get Advocate Profiles", True, f"Found {len(advocates)} advocates")
                
                if advocates:
                    # Show sample advocate info
                    sample = advocates[0]
                    tags = sample.get('tags', [])
                    rate = sample.get('hourly_rate', 'Not set')
                    print(f"   Sample advocate: ID {sample.get('id', 'Unknown')}, Tags: {tags}, Rate: ${rate}/hr")
                
                return advocates
            except Exception as e:
                self.log_test("Get Advocate Profiles", False, f"JSON parsing error: {e}")
                return []
        else:
            self.log_test("Get Advocate Profiles", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return []

    def test_match_suggest(self, student_id):
        """Test match suggestion algorithm"""
        if not student_id:
            self.log_test("Match Suggest", False, "No student ID available")
            return []
            
        suggest_data = {
            "student_id": student_id,
            "top_n": 5
        }
        
        success, response = self.make_request('POST', 'match/suggest', suggest_data)
        if success:
            try:
                suggestions = response.json()
                self.log_test("Match Suggest", True, f"Got {len(suggestions)} suggestions")
                
                if suggestions:
                    # Analyze scoring
                    for i, suggestion in enumerate(suggestions[:3]):
                        advocate = suggestion.get('advocate', {})
                        score = suggestion.get('score', 0)
                        reasons = suggestion.get('reasons', {})
                        
                        print(f"   Suggestion {i+1}: Advocate {advocate.get('id', 'Unknown')}, Score: {score:.1f}%")
                        print(f"     Tag overlap: {reasons.get('tag_overlap', 0):.2f}")
                        print(f"     Language match: {reasons.get('language_match', False)}")
                        print(f"     Price fit: {reasons.get('price_fit', False)}")
                
                return suggestions
            except Exception as e:
                self.log_test("Match Suggest", False, f"JSON parsing error: {e}")
                return []
        else:
            self.log_test("Match Suggest", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return []

    def test_match_propose(self, student_id, suggestions):
        """Test creating match proposals"""
        if not student_id or not suggestions:
            self.log_test("Match Propose", False, "No student ID or suggestions available")
            return None
            
        # Use first advocate from suggestions
        advocate_id = suggestions[0]['advocate']['id']
        
        propose_data = {
            "student_id": student_id,
            "advocate_ids": [advocate_id],
            "reason": {
                "source": "api_test",
                "timestamp": datetime.now().isoformat()
            }
        }
        
        success, response = self.make_request('POST', 'match/propose', propose_data)
        if success:
            try:
                result = response.json()
                created_count = result.get('created', 0)
                proposals = result.get('proposals', [])
                
                self.log_test("Match Propose", True, f"Created {created_count} proposals")
                
                if proposals:
                    proposal = proposals[0]
                    self.test_proposal_id = proposal['id']
                    print(f"   Proposal ID: {self.test_proposal_id}")
                    print(f"   Score: {proposal.get('score', 0):.1f}%")
                
                return result
            except Exception as e:
                self.log_test("Match Propose", False, f"JSON parsing error: {e}")
        else:
            self.log_test("Match Propose", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
        return None

    def test_get_my_matches(self):
        """Test getting user's matches"""
        success, response = self.make_request('GET', 'match/my')
        if success:
            try:
                matches = response.json()
                self.log_test("Get My Matches", True, f"Found {len(matches)} matches")
                
                if matches:
                    # Show match details
                    for i, match in enumerate(matches[:3]):
                        proposal = match.get('proposal', {})
                        student = match.get('student', {})
                        advocate = match.get('advocate', {})
                        
                        print(f"   Match {i+1}: {student.get('name', 'Unknown')} -> Advocate {advocate.get('id', 'Unknown')}")
                        print(f"     Status: {proposal.get('status', 'Unknown')}, Score: {proposal.get('score', 0):.1f}%")
                
                return matches
            except Exception as e:
                self.log_test("Get My Matches", False, f"JSON parsing error: {e}")
                return []
        else:
            self.log_test("Get My Matches", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return []

    def test_notifications(self):
        """Test getting notifications"""
        success, response = self.make_request('GET', 'notifications')
        if success:
            try:
                notifications = response.json()
                self.log_test("Get Notifications", True, f"Found {len(notifications)} notifications")
                
                if notifications:
                    unread_count = sum(1 for n in notifications if not n.get('read', True))
                    print(f"   Unread notifications: {unread_count}")
                    
                    # Show recent notifications
                    for i, notif in enumerate(notifications[:3]):
                        title = notif.get('title', 'No title')
                        read_status = "Read" if notif.get('read', False) else "Unread"
                        print(f"   Notification {i+1}: {title} ({read_status})")
                
                return notifications
            except Exception as e:
                self.log_test("Get Notifications", False, f"JSON parsing error: {e}")
                return []
        else:
            self.log_test("Get Notifications", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")
            return []

    def test_match_actions(self, proposal_id):
        """Test match proposal actions (intro request)"""
        if not proposal_id:
            self.log_test("Match Actions", False, "No proposal ID available")
            return
            
        # Test intro request
        intro_data = {
            "channel": "zoom",
            "notes": "API test intro request"
        }
        
        success, response = self.make_request('POST', f'match/{proposal_id}/intro', intro_data)
        if success:
            try:
                result = response.json()
                self.log_test("Match Intro Request", True, f"Status: {result.get('status', 'Unknown')}")
            except Exception as e:
                self.log_test("Match Intro Request", False, f"JSON parsing error: {e}")
        else:
            self.log_test("Match Intro Request", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Advocate Matching API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_api_root()
        
        # Student management
        students = self.test_get_students()
        new_student = self.test_create_student()
        
        # Use existing student or newly created one
        if not self.test_student_id and students:
            self.test_student_id = students[0]['id']
        elif not self.test_student_id and new_student:
            self.test_student_id = new_student['id']
        
        # Advocate profiles
        advocates = self.test_get_advocate_profiles()
        
        # Matching system
        if self.test_student_id:
            suggestions = self.test_match_suggest(self.test_student_id)
            if suggestions:
                self.test_match_propose(self.test_student_id, suggestions)
        
        # Match management
        self.test_get_my_matches()
        
        # Notifications
        self.test_notifications()
        
        # Match actions (if we have a proposal)
        if self.test_proposal_id:
            self.test_match_actions(self.test_proposal_id)
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            failed_count = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_count} tests failed. Check the issues above.")
            return 1

def main():
    tester = AdvocateMatchingAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())