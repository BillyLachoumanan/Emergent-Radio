
import requests
import sys
import json
from datetime import datetime

class RadioAPITester:
    def __init__(self, base_url="https://d6033a80-baff-4b32-ac10-3c352226a0b4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status=200, params=None, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return success, response.json()
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                return success, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def validate_stations_response(self, response):
        """Validate the structure of stations response"""
        if not response or 'stations' not in response:
            print("❌ Invalid response structure: 'stations' field missing")
            return False
            
        stations = response['stations']
        if not isinstance(stations, list):
            print("❌ Invalid 'stations' field: expected a list")
            return False
            
        if len(stations) == 0:
            print("⚠️ Warning: No stations returned")
            return True
            
        # Check first station for required fields
        first_station = stations[0]
        required_fields = ['stationuuid', 'name', 'url', 'country', 'countrycode']
        missing_fields = [field for field in required_fields if field not in first_station]
        
        if missing_fields:
            print(f"❌ Station missing required fields: {', '.join(missing_fields)}")
            return False
            
        print(f"✅ Response structure valid - {len(stations)} stations returned")
        return True

    def validate_countries_response(self, response):
        """Validate the structure of countries response"""
        if not response or 'countries' not in response:
            print("❌ Invalid response structure: 'countries' field missing")
            return False
            
        countries = response['countries']
        if not isinstance(countries, list):
            print("❌ Invalid 'countries' field: expected a list")
            return False
            
        if len(countries) == 0:
            print("⚠️ Warning: No countries returned")
            return True
            
        # Check first country for required fields
        first_country = countries[0]
        required_fields = ['name', 'iso_3166_1', 'stationcount']
        missing_fields = [field for field in required_fields if field not in first_country]
        
        if missing_fields:
            print(f"❌ Country missing required fields: {', '.join(missing_fields)}")
            return False
            
        print(f"✅ Response structure valid - {len(countries)} countries returned")
        return True

    def test_popular_stations(self):
        """Test the popular stations endpoint"""
        success, response = self.run_test(
            "Popular Stations",
            "GET",
            "api/stations/popular",
            200
        )
        
        if success:
            return self.validate_stations_response(response)
        return False

    def test_countries(self):
        """Test the countries endpoint"""
        success, response = self.run_test(
            "Countries List",
            "GET",
            "api/countries",
            200
        )
        
        if success:
            return self.validate_countries_response(response)
        return False

    def test_stations_by_country(self, country_code="US"):
        """Test the stations by country endpoint"""
        success, response = self.run_test(
            f"Stations by Country ({country_code})",
            "GET",
            f"api/stations/by-country/{country_code}",
            200
        )
        
        if success:
            return self.validate_stations_response(response)
        return False

    def test_search_stations(self, search_term="BBC"):
        """Test the station search endpoint"""
        success, response = self.run_test(
            f"Search Stations ('{search_term}')",
            "GET",
            "api/stations/search",
            200,
            params={"name": search_term}
        )
        
        if success:
            return self.validate_stations_response(response)
        return False

    def test_click_station(self, station_uuid):
        """Test the station click endpoint"""
        success, response = self.run_test(
            "Station Click",
            "POST",
            f"api/station/{station_uuid}/click",
            200
        )
        
        if success and 'success' in response:
            return response['success']
        return False

def main():
    # Setup
    tester = RadioAPITester()
    
    # Run tests
    print("\n===== GLOBAL RADIO API TESTS =====\n")
    
    # Test 1: Popular Stations
    popular_test = tester.test_popular_stations()
    
    # Test 2: Countries List
    countries_test = tester.test_countries()
    
    # Test 3: Stations by Country
    country_test = tester.test_stations_by_country("US")
    
    # Test 4: Search Stations
    search_test = tester.test_search_stations("BBC")
    
    # Test 5: Station Click (only if we have a station UUID from previous tests)
    click_test = False
    if popular_test:
        success, response = tester.run_test(
            "Get Popular Stations for UUID",
            "GET",
            "api/stations/popular",
            200
        )
        if success and 'stations' in response and len(response['stations']) > 0:
            station_uuid = response['stations'][0]['stationuuid']
            click_test = tester.test_click_station(station_uuid)
    
    # Print results
    print(f"\n===== TEST RESULTS =====")
    print(f"Popular Stations API: {'✅ PASS' if popular_test else '❌ FAIL'}")
    print(f"Countries List API: {'✅ PASS' if countries_test else '❌ FAIL'}")
    print(f"Stations by Country API: {'✅ PASS' if country_test else '❌ FAIL'}")
    print(f"Search Stations API: {'✅ PASS' if search_test else '❌ FAIL'}")
    print(f"Station Click API: {'✅ PASS' if click_test else '❌ FAIL'}")
    
    tests_passed = sum([popular_test, countries_test, country_test, search_test, click_test])
    print(f"\n📊 Tests passed: {tests_passed}/5")
    
    return 0 if tests_passed == 5 else 1

if __name__ == "__main__":
    sys.exit(main())
