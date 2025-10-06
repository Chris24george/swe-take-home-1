# app.py - EcoVision: Climate Visualizer API
# This file contains basic Flask setup code to get you started.
# You may opt to use FastAPI or another framework if you prefer.

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL
import MySQLdb.cursors
import os
from collections import defaultdict, Counter

# Import custom modules
from statistics import calculate_trend, detect_anomalies, detect_seasonality
from filters import build_climate_filters, extract_filter_params

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, will use system environment variables
    pass

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MySQL Configuration
# Defaults work out-of-the-box for standard local MySQL setup
# Override via .env file or system environment variables if needed
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', '')  # Empty for no password
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'climate_data')
mysql = MySQL(app)

# Quality weights to be used in calculations
QUALITY_WEIGHTS = {
    'excellent': 1.0,
    'good': 0.8,
    'questionable': 0.5,
    'poor': 0.3
}

@app.route('/api/v1/climate', methods=['GET'])
def get_climate_data():
    """
    Retrieve climate data with optional filtering.
    Query parameters: location_id, start_date, end_date, metric, quality_threshold
    
    Returns climate data in the format specified in the API docs.
    """
    # Extract filter parameters from request
    filters = extract_filter_params(request)
    
    # Create cursor that returns dictionaries
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Base query with JOINs across all three tables
    query = """
        SELECT 
            cd.id,
            cd.location_id,
            l.name as location_name,
            l.latitude,
            l.longitude,
            cd.date,
            m.name as metric,
            cd.value,
            m.unit,
            cd.quality
        FROM climate_data cd
        JOIN locations l ON cd.location_id = l.id
        JOIN metrics m ON cd.metric_id = m.id
        WHERE 1=1
    """
    
    # Apply filters using helper function (DRY principle)
    params = []
    query, params = build_climate_filters(query, params, **filters)
    
    # Add ordering by date
    query += " ORDER BY cd.date"
    
    # Execute query with parameters
    cursor.execute(query, tuple(params))
    data = cursor.fetchall()
    cursor.close()
    
    # Convert data types for JSON serialization
    for row in data:
        # Convert Decimal to float
        row['latitude'] = float(row['latitude'])
        row['longitude'] = float(row['longitude'])
        row['value'] = float(row['value'])
        # Convert date to string
        row['date'] = str(row['date'])
    
    # Build response with meta information
    response = {
        'data': data,
        'meta': {
            'total_count': len(data),
            'page': 1,
            'per_page': 50
        }
    }
    
    return jsonify(response)

@app.route('/api/v1/locations', methods=['GET'])
def get_locations():
    """
    Retrieve all available locations.
    
    Returns location data in the format specified in the API docs.
    """
    # Create a cursor that returns results as dictionaries
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Query all locations from the database
    cursor.execute("""
        SELECT id, name, country, latitude, longitude, region
        FROM locations
    """)
    
    # Fetch all rows as a list of dictionaries
    locations = cursor.fetchall()
    
    # Close the cursor to free resources
    cursor.close()
    
    # Convert Decimal types to float for JSON serialization
    for location in locations:
        location['latitude'] = float(location['latitude'])
        location['longitude'] = float(location['longitude'])
    
    # Return JSON response in API spec format
    return jsonify({'data': locations})

@app.route('/api/v1/metrics', methods=['GET'])
def get_metrics():
    """
    Retrieve all available climate metrics.
    
    Returns metric data in the format specified in the API docs.
    """
    # Create a cursor that returns results as dictionaries
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Query all metrics from the database
    cursor.execute("""
        SELECT id, name, display_name, unit, description
        FROM metrics
    """)
    
    # Fetch all rows as a list of dictionaries
    metrics = cursor.fetchall()
    
    # Close the cursor to free resources
    cursor.close()
    
    # Return JSON response in API spec format
    return jsonify({'data': metrics})

@app.route('/api/v1/summary', methods=['GET'])
def get_summary():
    """
    Retrieve quality-weighted summary statistics for climate data.
    Query parameters: location_id, start_date, end_date, metric, quality_threshold
    
    Returns weighted min, max, and avg values for each metric in the format specified in the API docs.
    """
    # STEP 1: Extract filter parameters from request
    filters = extract_filter_params(request)
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # STEP 2: Build SQL query to fetch raw data
    # We only need: metric name, unit, value, and quality
    query = """
        SELECT 
            m.name as metric,
            m.unit,
            cd.value,
            cd.quality
        FROM climate_data cd
        JOIN metrics m ON cd.metric_id = m.id
        WHERE 1=1
    """
    
    # Apply filters using helper function (DRY principle)
    params = []
    query, params = build_climate_filters(query, params, **filters)
    
    # STEP 3: Execute query and fetch all matching rows
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    
    # STEP 4: Group data by metric
    # We'll use a dictionary to collect all values and qualities for each metric
    from collections import defaultdict
    
    metrics_data = defaultdict(lambda: {
        'values': [],      # List of all values for this metric
        'qualities': [],   # List of corresponding quality levels
        'unit': None       # Unit (same for all rows of this metric)
    })
    
    for row in rows:
        metric_name = row['metric']
        metrics_data[metric_name]['values'].append(float(row['value']))
        metrics_data[metric_name]['qualities'].append(row['quality'])
        metrics_data[metric_name]['unit'] = row['unit']  # Set unit (overwrites with same value)
    
    # STEP 5: Calculate statistics for each metric
    result = {}
    
    for metric_name, data in metrics_data.items():
        values = data['values']
        qualities = data['qualities']
        
        # If no data for this metric, skip it
        if not values:
            continue
        
        # Basic statistics
        result[metric_name] = {
            'min': min(values),
            'max': max(values),
            'avg': sum(values) / len(values),
            'unit': data['unit']
        }
        
        # Weighted average calculation
        # Formula: SUM(value * weight) / SUM(weight)
        weighted_sum = sum(v * QUALITY_WEIGHTS[q] for v, q in zip(values, qualities))
        weight_sum = sum(QUALITY_WEIGHTS[q] for q in qualities)
        result[metric_name]['weighted_avg'] = weighted_sum / weight_sum
        
        # Quality distribution (what percentage of data is each quality level)
        from collections import Counter
        quality_counts = Counter(qualities)
        total = len(qualities)
        
        # Always include all quality levels (even if 0)
        result[metric_name]['quality_distribution'] = {
            'excellent': quality_counts.get('excellent', 0) / total,
            'good': quality_counts.get('good', 0) / total,
            'questionable': quality_counts.get('questionable', 0) / total,
            'poor': quality_counts.get('poor', 0) / total
        }
    
    # STEP 6: Return formatted response
    return jsonify({'data': result})

@app.route('/api/v1/trends', methods=['GET'])
def get_trends():
    """
    Analyze trends and patterns in climate data.
    Query parameters: location_id, start_date, end_date, metric, quality_threshold
    
    Returns trend analysis including direction, rate of change, anomalies, and seasonality.
    """
    # STEP 1: Extract filter parameters from request
    filters = extract_filter_params(request)
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # STEP 2: Build SQL query to fetch time-series data
    # We need: metric name, unit, date, value, quality (ordered by date for trend analysis)
    query = """
        SELECT 
            m.name as metric,
            m.unit,
            cd.date,
            cd.value,
            cd.quality
        FROM climate_data cd
        JOIN metrics m ON cd.metric_id = m.id
        WHERE 1=1
    """
    
    # Apply filters using helper function (DRY principle)
    params = []
    query, params = build_climate_filters(query, params, **filters)
    
    # ORDER BY date is crucial for trend analysis
    query += " ORDER BY m.name, cd.date"
    
    # STEP 3: Execute query and fetch all matching rows
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    
    # STEP 4: Group data by metric
    metrics_data = defaultdict(lambda: {
        'dates': [],
        'values': [],
        'qualities': [],
        'unit': None
    })
    
    for row in rows:
        metric_name = row['metric']
        metrics_data[metric_name]['dates'].append(row['date'])
        metrics_data[metric_name]['values'].append(float(row['value']))
        metrics_data[metric_name]['qualities'].append(row['quality'])
        metrics_data[metric_name]['unit'] = row['unit']
    
    # STEP 5: Calculate trend analysis for each metric
    result = {}
    
    for metric_name, data in metrics_data.items():
        if not data['values']:  # Skip if no data
            continue
            
        result[metric_name] = {
            'trend': calculate_trend(data),
            'anomalies': detect_anomalies(data),
            'seasonality': detect_seasonality(data)
        }
    
    # STEP 6: Return formatted response
    return jsonify({'data': result})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Optional: FastAPI Implementation boilerplate
"""
To implement the API using FastAPI instead of Flask:

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List, Any
import databases
import os

# Database connection
DATABASE_URL = f"mysql://{os.environ.get('MYSQL_USER', 'root')}:{os.environ.get('MYSQL_PASSWORD', '')}@{os.environ.get('MYSQL_HOST', 'localhost')}/{os.environ.get('MYSQL_DB', 'climate_data')}"
database = databases.Database(DATABASE_URL)

app = FastAPI(title="EcoVision API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Implement endpoints following the API specification in docs/api.md
"""