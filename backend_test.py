#!/usr/bin/env python3
"""
QSE Industrial App API Test Suite
Tests all the backend API endpoints as requested in the review.
"""

import requests
import json
from datetime import datetime
import os
import time
import sys

# Backend URL from environment
BASE_URL = "https://atelier-form.preview.emergentagent.com/api"

class QSEAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_id = None
        self.fiche_id = None
        
    def log(self, message, level="INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_health_check(self):
        """Test 1: Health Check - GET /api/"""
        self.log("=== Testing Health Check ===")
        try:
            response = self.session.get(f"{self.base_url}/")
            self.log(f"GET / - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"Response: {data}")
                self.log("✅ Health check passed")
                return True
            else:
                self.log(f"❌ Health check failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Health check failed - Error: {str(e)}", "ERROR")
            return False
    
    def test_user_management(self):
        """Test 2: User Management - Create, Login, List users"""
        self.log("=== Testing User Management ===")
        
        # Test create user
        try:
            user_data = {
                "code": "EMP002", 
                "name": "Martin", 
                "first_name": "Pierre", 
                "service": "Affinage PPC"
            }
            
            self.log("Testing user creation...")
            response = self.session.post(f"{self.base_url}/users", json=user_data)
            self.log(f"POST /users - Status: {response.status_code}")
            
            if response.status_code == 200:
                user = response.json()
                self.user_id = user["id"]
                self.log(f"✅ User created - ID: {self.user_id}")
                self.log(f"User data: {user}")
            else:
                self.log(f"❌ User creation failed - Status: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ User creation failed - Error: {str(e)}", "ERROR")
            return False
        
        # Test login
        try:
            login_data = {"code": "EMP002"}
            self.log("Testing user login...")
            response = self.session.post(f"{self.base_url}/users/login", json=login_data)
            self.log(f"POST /users/login - Status: {response.status_code}")
            
            if response.status_code == 200:
                user = response.json()
                self.log(f"✅ Login successful - User: {user['first_name']} {user['name']}")
            else:
                self.log(f"❌ Login failed - Status: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Login failed - Error: {str(e)}", "ERROR")
            return False
            
        # Test list users
        try:
            self.log("Testing user list...")
            response = self.session.get(f"{self.base_url}/users")
            self.log(f"GET /users - Status: {response.status_code}")
            
            if response.status_code == 200:
                users = response.json()
                self.log(f"✅ User list retrieved - Count: {len(users)}")
                for user in users:
                    self.log(f"User: {user['code']} - {user['first_name']} {user['name']}")
            else:
                self.log(f"❌ User list failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ User list failed - Error: {str(e)}", "ERROR")
            return False
            
        return True
    
    def test_fiche_lifecycle(self):
        """Test 3: Fiche Creation and Lifecycle"""
        self.log("=== Testing Fiche Creation and Lifecycle ===")
        
        if not self.user_id:
            self.log("❌ Cannot test fiche lifecycle - no user_id available", "ERROR")
            return False
            
        # Create fiche
        try:
            fiche_data = {
                "type": "Qualité",
                "date_evenement": "2026-02-17T15:00:00",
                "heure_evenement": "15:00",
                "constate_par": "Pierre Martin",
                "service_emetteur": "Affinage PPC",
                "non_conformite_constatee": "Produit Fini",
                "defaut": "Moisissures",
                "produit": "Fromage Affiné",
                "numero_lot": "LOT2026021702",
                "description": "Présence de moisissures non conformes sur plusieurs meules",
                "criticite": "Majeure",
                "traitement_blocage": True,
                "created_by": self.user_id
            }
            
            self.log("Testing fiche creation...")
            response = self.session.post(f"{self.base_url}/fiches", json=fiche_data)
            self.log(f"POST /fiches - Status: {response.status_code}")
            
            if response.status_code == 200:
                fiche = response.json()
                self.fiche_id = fiche["id"]
                self.log(f"✅ Fiche created - ID: {self.fiche_id}")
                self.log(f"Fiche type: {fiche['type']}, Status: {fiche['statut']}")
            else:
                self.log(f"❌ Fiche creation failed - Status: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Fiche creation failed - Error: {str(e)}", "ERROR")
            return False
        
        # List fiches
        try:
            self.log("Testing fiche list...")
            response = self.session.get(f"{self.base_url}/fiches")
            self.log(f"GET /fiches - Status: {response.status_code}")
            
            if response.status_code == 200:
                fiches = response.json()
                self.log(f"✅ Fiche list retrieved - Count: {len(fiches)}")
                for fiche in fiches:
                    self.log(f"Fiche: {fiche['id']} - {fiche['type']} - {fiche['statut']}")
            else:
                self.log(f"❌ Fiche list failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Fiche list failed - Error: {str(e)}", "ERROR")
            return False
        
        # Validate fiche and generate Excel
        try:
            self.log("Testing fiche validation and Excel generation...")
            response = self.session.post(f"{self.base_url}/fiches/{self.fiche_id}/validate")
            self.log(f"POST /fiches/{self.fiche_id}/validate - Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Fiche validated and Excel generated")
                self.log(f"Excel filename: {result.get('excel_filename')}")
                self.log(f"Status: {result.get('statut')}")
            else:
                self.log(f"❌ Fiche validation failed - Status: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Fiche validation failed - Error: {str(e)}", "ERROR")
            return False
        
        # Test send email (should say not configured)
        try:
            self.log("Testing email sending...")
            response = self.session.post(f"{self.base_url}/fiches/{self.fiche_id}/send-email")
            self.log(f"POST /fiches/{self.fiche_id}/send-email - Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Email endpoint working")
                self.log(f"Message: {result.get('message')}")
                if "Configuration email non définie" in result.get('message', ''):
                    self.log("✅ Email configuration correctly reports as not configured")
                else:
                    self.log("⚠️ Unexpected email response")
            else:
                self.log(f"❌ Email endpoint failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Email endpoint failed - Error: {str(e)}", "ERROR")
            return False
            
        return True
    
    def test_configuration(self):
        """Test 4: Configuration endpoints"""
        self.log("=== Testing Configuration ===")
        
        # Test get config
        try:
            self.log("Testing configuration retrieval...")
            response = self.session.get(f"{self.base_url}/config")
            self.log(f"GET /config - Status: {response.status_code}")
            
            if response.status_code == 200:
                config = response.json()
                self.log(f"✅ Configuration retrieved")
                
                # Check key configuration items
                expected_keys = ['services', 'non_conformites', 'defauts', 'criticites']
                for key in ['services', 'non_conformites', 'defauts']:
                    if key in config:
                        self.log(f"Config {key}: {len(config[key])} items")
                    else:
                        self.log(f"⚠️ Missing config key: {key}")
                        
            else:
                self.log(f"❌ Configuration failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Configuration failed - Error: {str(e)}", "ERROR")
            return False
        
        # Test stats
        try:
            self.log("Testing statistics...")
            response = self.session.get(f"{self.base_url}/stats")
            self.log(f"GET /stats - Status: {response.status_code}")
            
            if response.status_code == 200:
                stats = response.json()
                self.log(f"✅ Statistics retrieved")
                self.log(f"Total fiches: {stats.get('total')}")
                self.log(f"By status: {stats.get('by_status')}")
                self.log(f"By type: {stats.get('by_type')}")
            else:
                self.log(f"❌ Statistics failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Statistics failed - Error: {str(e)}", "ERROR")
            return False
            
        return True
    
    def test_excel_generation(self):
        """Test 5: Verify Excel file generation"""
        self.log("=== Verifying Excel Generation ===")
        
        try:
            # Check if generated_files directory exists and contains files
            generated_files_path = "/app/backend/generated_files"
            if os.path.exists(generated_files_path):
                files = os.listdir(generated_files_path)
                excel_files = [f for f in files if f.endswith('.xlsm')]
                
                self.log(f"Generated files directory exists")
                self.log(f"Total files: {len(files)}")
                self.log(f"Excel files (.xlsm): {len(excel_files)}")
                
                for excel_file in excel_files:
                    file_path = os.path.join(generated_files_path, excel_file)
                    file_size = os.path.getsize(file_path)
                    self.log(f"Excel file: {excel_file} (Size: {file_size} bytes)")
                
                if excel_files:
                    self.log("✅ Excel files generated successfully")
                    return True
                else:
                    self.log("❌ No Excel files found in generated_files directory", "ERROR")
                    return False
            else:
                self.log(f"❌ Generated files directory not found: {generated_files_path}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Excel verification failed - Error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting QSE Industrial App API Tests")
        self.log(f"Base URL: {self.base_url}")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Management", self.test_user_management),
            ("Fiche Lifecycle", self.test_fiche_lifecycle),
            ("Configuration", self.test_configuration),
            ("Excel Generation", self.test_excel_generation)
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            self.log(f"\n{'='*50}")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    self.log(f"✅ {test_name} - PASSED")
                else:
                    self.log(f"❌ {test_name} - FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} - ERROR: {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log(f"\n{'='*50}")
        self.log("📊 TEST SUMMARY")
        self.log(f"{'='*50}")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{test_name:<20}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All tests PASSED!")
            return True
        else:
            self.log(f"⚠️  {total - passed} test(s) FAILED")
            return False

def main():
    """Main function to run tests"""
    tester = QSEAPITester()
    success = tester.run_all_tests()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()