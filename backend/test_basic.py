#!/usr/bin/env python3
"""
Basic API endpoint tests for EcoVision Climate Visualizer
Run with: python test_basic.py (while Flask app is running)
"""

import requests
import sys

BASE_URL = "http://localhost:5001/api/v1"

def test_endpoint(name, url, expected_status=200, assertions=None):
    """Helper function to test an endpoint"""
    try:
        response = requests.get(url, timeout=5)
        
        if response.status_code != expected_status:
            print(f"❌ {name}: Expected status {expected_status}, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Run custom assertions if provided
        if assertions:
            for assertion_name, assertion_func in assertions.items():
                if not assertion_func(data):
                    print(f"❌ {name}: Failed assertion '{assertion_name}'")
                    return False
        
        print(f"✅ {name}")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: Could not connect to {BASE_URL}")
        print("   Make sure Flask is running on port 5001")
        return False
    except Exception as e:
        print(f"❌ {name}: {str(e)}")
        return False

def run_tests():
    """Run all endpoint tests"""
    print("=" * 60)
    print("EcoVision API Tests")
    print("=" * 60)
    print()
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Locations endpoint
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/locations",
        f"{BASE_URL}/locations",
        assertions={
            "has data key": lambda d: 'data' in d,
            "has 3 locations": lambda d: len(d['data']) == 3,
            "locations have names": lambda d: all('name' in loc for loc in d['data'])
        }
    ):
        tests_passed += 1
    
    # Test 2: Metrics endpoint
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/metrics",
        f"{BASE_URL}/metrics",
        assertions={
            "has data key": lambda d: 'data' in d,
            "has 3 metrics": lambda d: len(d['data']) == 3,
            "metrics have units": lambda d: all('unit' in m for m in d['data'])
        }
    ):
        tests_passed += 1
    
    # Test 3: Climate endpoint - no filters
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate (no filters)",
        f"{BASE_URL}/climate",
        assertions={
            "has data key": lambda d: 'data' in d,
            "has meta key": lambda d: 'meta' in d,
            "has 40 records": lambda d: d['meta']['total_count'] == 40,
            "records have all fields": lambda d: all(
                all(field in r for field in ['id', 'location_name', 'metric', 'date', 'value', 'quality'])
                for r in d['data']
            )
        }
    ):
        tests_passed += 1
    
    # Test 4: Climate endpoint - location filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?location_id=1",
        f"{BASE_URL}/climate?location_id=1",
        assertions={
            "has 16 Irvine records": lambda d: d['meta']['total_count'] == 16,
            "all records are Irvine": lambda d: all(r['location_name'] == 'Irvine' for r in d['data'])
        }
    ):
        tests_passed += 1
    
    # Test 5: Climate endpoint - metric filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?metric=temperature",
        f"{BASE_URL}/climate?metric=temperature",
        assertions={
            "all records are temperature": lambda d: all(r['metric'] == 'temperature' for r in d['data'])
        }
    ):
        tests_passed += 1
    
    # Test 6: Climate endpoint - multiple filters
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?location_id=1&metric=temperature",
        f"{BASE_URL}/climate?location_id=1&metric=temperature",
        assertions={
            "has 8 records": lambda d: d['meta']['total_count'] == 8,
            "all are Irvine temperature": lambda d: all(
                r['location_name'] == 'Irvine' and r['metric'] == 'temperature' 
                for r in d['data']
            )
        }
    ):
        tests_passed += 1
    
    # Test 7: Climate endpoint - date range filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?start_date=2025-02-01&end_date=2025-03-31",
        f"{BASE_URL}/climate?start_date=2025-02-01&end_date=2025-03-31",
        assertions={
            "has 20 records in range": lambda d: d['meta']['total_count'] == 20,
            "all dates in range": lambda d: all(
                '2025-02' <= r['date'] <= '2025-03-31' for r in d['data']
            )
        }
    ):
        tests_passed += 1
    
    # Test 8: Climate endpoint - quality threshold
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?quality_threshold=good",
        f"{BASE_URL}/climate?quality_threshold=good",
        assertions={
            "has 29 good+ records": lambda d: d['meta']['total_count'] == 29,
            "only good and excellent": lambda d: all(
                r['quality'] in ['good', 'excellent'] for r in d['data']
            )
        }
    ):
        tests_passed += 1
    
    # Print summary
    print()
    print("=" * 60)
    print(f"Results: {tests_passed}/{tests_total} tests passed")
    print("=" * 60)
    
    if tests_passed == tests_total:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tests_total - tests_passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())

