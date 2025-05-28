
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
        
    def validate_genres_response(self, response):
        """Validate the structure of genres response"""
        if not response or 'genres' not in response:
            print("❌ Invalid response structure: 'genres' field missing")
            return False
            
        genres = response['genres']
        if not isinstance(genres, list):
            print("❌ Invalid 'genres' field: expected a list")
            return False
            
        if len(genres) == 0:
            print("⚠️ Warning: No genres returned")
            return True
            
        # Check first genre for required fields
        first_genre = genres[0]
        required_fields = ['name', 'slug', 'icon']
        missing_fields = [field for field in required_fields if field not in first_genre]
        
        if missing_fields:
            print(f"❌ Genre missing required fields: {', '.join(missing_fields)}")
            return False
            
        print(f"✅ Response structure valid - {len(genres)} genres returned")
        return True
        
    def validate_station_details_response(self, response):
        """Validate the structure of station details response"""
        if not response or 'station' not in response:
            print("❌ Invalid response structure: 'station' field missing")
            return False
            
        station = response['station']
        required_fields = ['stationuuid', 'name', 'url', 'country', 'countrycode', 'homepage', 'favicon', 'tags']
        missing_fields = [field for field in required_fields if field not in station]
        
        if missing_fields:
            print(f"❌ Station details missing required fields: {', '.join(missing_fields)}")
            return False
            
        print(f"✅ Station details response structure valid")
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
        
    def test_christian_stations(self):
        """Test the Christian stations endpoint"""
        success, response = self.run_test(
            "Christian Radio Stations",
            "GET",
            "api/stations/christian",
            200
        )
        
        if success:
            return self.validate_stations_response(response)
        return False
        
    def test_genres(self):
        """Test the genres endpoint"""
        success, response = self.run_test(
            "Genres List",
            "GET",
            "api/genres",
            200
        )
        
        if success:
            return self.validate_genres_response(response)
        return False
        
    def test_stations_by_genre(self, genre="rock"):
        """Test the stations by genre endpoint"""
        success, response = self.run_test(
            f"Stations by Genre ({genre})",
            "GET",
            f"api/stations/by-genre",
            200,
            params={"genre": genre}
        )
        
        if success:
            return self.validate_stations_response(response)
        return False
        
    def test_station_details(self, station_uuid):
        """Test the station details endpoint"""
        success, response = self.run_test(
            "Station Details",
            "GET",
            f"api/station/{station_uuid}",
            200
        )
        
        if success:
            return self.validate_station_details_response(response)
        return False

def main():
    # Setup
    tester = RadioAPITester()
    
    # Run tests
    print("\n===== GLOBAL RADIO API TESTS =====\n")
    
    # Basic API Tests
    popular_test = tester.test_popular_stations()
    countries_test = tester.test_countries()
    country_test = tester.test_stations_by_country("US")
    search_test = tester.test_search_stations("BBC")
    
    # Get a station UUID for further tests
    station_uuid = None
    if popular_test:
        success, response = tester.run_test(
            "Get Popular Stations for UUID",
            "GET",
            "api/stations/popular",
            200
        )
        if success and 'stations' in response and len(response['stations']) > 0:
            station_uuid = response['stations'][0]['stationuuid']
    
    # Station interaction tests
    click_test = False
    if station_uuid:
        click_test = tester.test_click_station(station_uuid)
    
    # New feature tests
    christian_test = tester.test_christian_stations()
    genres_test = tester.test_genres()
    genre_stations_test = tester.test_stations_by_genre("rock")
    
    # Station details test
    station_details_test = False
    if station_uuid:
        station_details_test = tester.test_station_details(station_uuid)
    
    # Print results
    print(f"\n===== TEST RESULTS =====")
    print(f"Popular Stations API: {'✅ PASS' if popular_test else '❌ FAIL'}")
    print(f"Countries List API: {'✅ PASS' if countries_test else '❌ FAIL'}")
    print(f"Stations by Country API: {'✅ PASS' if country_test else '❌ FAIL'}")
    print(f"Search Stations API: {'✅ PASS' if search_test else '❌ FAIL'}")
    print(f"Station Click API: {'✅ PASS' if click_test else '❌ FAIL'}")
    print(f"Christian Stations API: {'✅ PASS' if christian_test else '❌ FAIL'}")
    print(f"Genres List API: {'✅ PASS' if genres_test else '❌ FAIL'}")
    print(f"Stations by Genre API: {'✅ PASS' if genre_stations_test else '❌ FAIL'}")
    print(f"Station Details API: {'✅ PASS' if station_details_test else '❌ FAIL'}")
    
    tests_passed = sum([
        popular_test, 
        countries_test, 
        country_test, 
        search_test, 
        click_test,
        christian_test,
        genres_test,
        genre_stations_test,
        station_details_test
    ])
    total_tests = 9
    print(f"\n📊 Tests passed: {tests_passed}/{total_tests}")
    
    return 0 if tests_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(main())
