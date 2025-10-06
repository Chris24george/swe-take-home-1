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
    
    # Test 9: Climate endpoint - non-existent location
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?location_id=999 (non-existent)",
        f"{BASE_URL}/climate?location_id=999",
        assertions={
            "returns empty data": lambda d: d['meta']['total_count'] == 0 and len(d['data']) == 0
        }
    ):
        tests_passed += 1
    
    # Test 10: Climate endpoint - non-existent metric
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate?metric=nonexistent",
        f"{BASE_URL}/climate?metric=nonexistent",
        assertions={
            "returns empty data": lambda d: d['meta']['total_count'] == 0 and len(d['data']) == 0
        }
    ):
        tests_passed += 1
    
    # Test 11: Climate endpoint - invalid date range
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/climate (invalid date range)",
        f"{BASE_URL}/climate?start_date=2025-03-31&end_date=2025-01-01",
        assertions={
            "returns empty data": lambda d: d['meta']['total_count'] == 0
        }
    ):
        tests_passed += 1
    
    print()
    print("--- Testing /api/v1/summary endpoint ---")
    print()
    
    # Test 12: Summary endpoint - no filters (all data)
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary (no filters)",
        f"{BASE_URL}/summary",
        assertions={
            "has data key": lambda d: 'data' in d,
            "has temperature": lambda d: 'temperature' in d['data'],
            "has precipitation": lambda d: 'precipitation' in d['data'],
            "temp has all stats": lambda d: all(
                k in d['data']['temperature'] 
                for k in ['min', 'max', 'avg', 'weighted_avg', 'unit', 'quality_distribution']
            ),
            "quality dist has all levels": lambda d: all(
                k in d['data']['temperature']['quality_distribution']
                for k in ['excellent', 'good', 'questionable', 'poor']
            )
        }
    ):
        tests_passed += 1
    
    # Test 13: Summary endpoint - location filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?location_id=1",
        f"{BASE_URL}/summary?location_id=1",
        assertions={
            "has temperature and precipitation": lambda d: 
                'temperature' in d['data'] and 'precipitation' in d['data'],
            "temp avg is Irvine-specific": lambda d: 
                20 < d['data']['temperature']['avg'] < 25,  # Irvine is warmer
            "precip avg is Irvine-specific": lambda d:
                d['data']['precipitation']['avg'] < 10  # Irvine is drier
        }
    ):
        tests_passed += 1
    
    # Test 14: Summary endpoint - metric filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?metric=temperature",
        f"{BASE_URL}/summary?metric=temperature",
        assertions={
            "only temperature": lambda d: 
                'temperature' in d['data'] and 'precipitation' not in d['data'],
            "has weighted_avg": lambda d: 'weighted_avg' in d['data']['temperature']
        }
    ):
        tests_passed += 1
    
    # Test 15: Summary endpoint - weighted_avg differs from avg
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?metric=temperature",
        f"{BASE_URL}/summary?metric=temperature",
        assertions={
            "weighted_avg exists": lambda d: 'weighted_avg' in d['data']['temperature'],
            "weighted_avg is a number": lambda d: 
                isinstance(d['data']['temperature']['weighted_avg'], (int, float)),
            "weighted_avg differs from avg": lambda d:
                d['data']['temperature']['weighted_avg'] != d['data']['temperature']['avg']
        }
    ):
        tests_passed += 1
    
    # Test 16: Summary endpoint - quality distribution sums to 1.0
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?metric=temperature",
        f"{BASE_URL}/summary?metric=temperature",
        assertions={
            "quality dist sums to ~1.0": lambda d: 
                abs(sum(d['data']['temperature']['quality_distribution'].values()) - 1.0) < 0.01
        }
    ):
        tests_passed += 1
    
    # Test 17: Summary endpoint - quality threshold filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?location_id=1&metric=temperature&quality_threshold=good",
        f"{BASE_URL}/summary?location_id=1&metric=temperature&quality_threshold=good",
        assertions={
            "has temperature": lambda d: 'temperature' in d['data'],
            "no poor or questionable": lambda d:
                d['data']['temperature']['quality_distribution']['poor'] == 0 and
                d['data']['temperature']['quality_distribution']['questionable'] == 0,
            "has excellent and good": lambda d:
                d['data']['temperature']['quality_distribution']['excellent'] > 0 and
                d['data']['temperature']['quality_distribution']['good'] > 0
        }
    ):
        tests_passed += 1
    
    # Test 18: Summary endpoint - non-existent location
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?location_id=999 (non-existent)",
        f"{BASE_URL}/summary?location_id=999",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    # Test 19: Summary endpoint - non-existent metric
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary?metric=nonexistent",
        f"{BASE_URL}/summary?metric=nonexistent",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    # Test 20: Summary endpoint - invalid date range
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/summary (invalid date range)",
        f"{BASE_URL}/summary?start_date=2025-03-31&end_date=2025-01-01",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    print()
    print("--- Testing /api/v1/trends endpoint ---")
    print()
    
    # Test 21: Trends endpoint - no filters (all metrics)
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (no filters)",
        f"{BASE_URL}/trends",
        assertions={
            "has data key": lambda d: 'data' in d,
            "has temperature": lambda d: 'temperature' in d['data'],
            "has precipitation": lambda d: 'precipitation' in d['data'],
            "temp has trend": lambda d: 'trend' in d['data']['temperature'],
            "temp has anomalies": lambda d: 'anomalies' in d['data']['temperature'],
            "temp has seasonality": lambda d: 'seasonality' in d['data']['temperature']
        }
    ):
        tests_passed += 1
    
    # Test 22: Trends endpoint - trend structure validation
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (trend structure)",
        f"{BASE_URL}/trends?metric=temperature",
        assertions={
            "has direction": lambda d: 
                'direction' in d['data']['temperature']['trend'],
            "has rate": lambda d:
                'rate' in d['data']['temperature']['trend'],
            "has confidence": lambda d:
                'confidence' in d['data']['temperature']['trend'],
            "direction is valid": lambda d:
                d['data']['temperature']['trend']['direction'] in 
                ['increasing', 'decreasing', 'stable', 'insufficient_data'],
            "confidence between 0-1": lambda d:
                0 <= d['data']['temperature']['trend']['confidence'] <= 1
        }
    ):
        tests_passed += 1
    
    # Test 23: Trends endpoint - anomaly detection
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (anomalies)",
        f"{BASE_URL}/trends?location_id=1&metric=temperature",
        assertions={
            "anomalies is list": lambda d:
                isinstance(d['data']['temperature']['anomalies'], list),
            "anomaly has required fields": lambda d:
                len(d['data']['temperature']['anomalies']) == 0 or
                all(k in d['data']['temperature']['anomalies'][0] 
                    for k in ['date', 'value', 'deviation', 'quality'])
        }
    ):
        tests_passed += 1
    
    # Test 24: Trends endpoint - seasonality is false for limited data
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (seasonality)",
        f"{BASE_URL}/trends?metric=temperature",
        assertions={
            "seasonality detected is false": lambda d:
                d['data']['temperature']['seasonality']['detected'] == False,
            "seasonality has confidence": lambda d:
                'confidence' in d['data']['temperature']['seasonality']
        }
    ):
        tests_passed += 1
    
    # Test 25: Trends endpoint - location filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends?location_id=1",
        f"{BASE_URL}/trends?location_id=1",
        assertions={
            "has data": lambda d: 'data' in d,
            "has at least one metric": lambda d: len(d['data']) > 0
        }
    ):
        tests_passed += 1
    
    # Test 26: Trends endpoint - quality threshold filter
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends?quality_threshold=good",
        f"{BASE_URL}/trends?quality_threshold=good&metric=temperature",
        assertions={
            "has temperature": lambda d: 'temperature' in d['data'],
            "anomalies only good+": lambda d:
                len(d['data']['temperature']['anomalies']) == 0 or
                all(a['quality'] in ['good', 'excellent'] 
                    for a in d['data']['temperature']['anomalies'])
        }
    ):
        tests_passed += 1
    
    print()
    print("--- Testing edge cases ---")
    print()
    
    # Test 27: Narrow date range (insufficient data)
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (narrow date range)",
        f"{BASE_URL}/trends?start_date=2025-02-01&end_date=2025-02-07",
        assertions={
            "has data key": lambda d: 'data' in d,
            "temperature has insufficient_data": lambda d:
                'temperature' in d['data'] and
                d['data']['temperature']['trend']['direction'] == 'insufficient_data'
        }
    ):
        tests_passed += 1
    
    # Test 28: Non-existent location
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends?location_id=999 (non-existent)",
        f"{BASE_URL}/trends?location_id=999",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    # Test 29: Non-existent metric
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends?metric=nonexistent",
        f"{BASE_URL}/trends?metric=nonexistent",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    # Test 30: Invalid date range (end before start)
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (invalid date range)",
        f"{BASE_URL}/trends?start_date=2025-03-31&end_date=2025-01-01",
        assertions={
            "returns empty data": lambda d: d['data'] == {}
        }
    ):
        tests_passed += 1
    
    # Test 31: Only 2 data points
    tests_total += 1
    if test_endpoint(
        "GET /api/v1/trends (only 2 points)",
        f"{BASE_URL}/trends?location_id=2&metric=temperature&start_date=2025-01-01&end_date=2025-01-15",
        assertions={
            "has insufficient_data": lambda d:
                'temperature' in d['data'] and
                d['data']['temperature']['trend']['direction'] == 'insufficient_data'
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

