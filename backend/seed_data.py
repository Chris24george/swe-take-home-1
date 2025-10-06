#!/usr/bin/env python3
"""
Seed the database with sample climate data from data/sample_data.json
"""

import json
import os
import sys
import MySQLdb
from pathlib import Path

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, will use system environment variables
    pass

# Database configuration from environment variables
# Defaults work out-of-the-box for standard local MySQL setup
# Override via .env file or system environment variables if needed
DB_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', ''),  # Empty string for no password
    'db': os.environ.get('MYSQL_DB', 'climate_data'),
}

def load_sample_data():
    """Load sample data from JSON file"""
    data_path = Path(__file__).parent.parent / 'data' / 'sample_data.json'
    
    if not data_path.exists():
        print(f"Error: Sample data file not found at {data_path}")
        sys.exit(1)
    
    with open(data_path, 'r') as f:
        return json.load(f)

def seed_database():
    """Seed the database with sample data"""
    print("Loading sample data...")
    data = load_sample_data()
    
    print(f"Connecting to MySQL database: {DB_CONFIG['db']}@{DB_CONFIG['host']}")
    
    try:
        # Connect to database
        conn = MySQLdb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("\nSeeding locations...")
        for location in data['locations']:
            cursor.execute(
                """
                INSERT INTO locations (id, name, country, latitude, longitude, region)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (location['id'], location['name'], location['country'], 
                 location['latitude'], location['longitude'], location['region'])
            )
        print(f"✓ Inserted {len(data['locations'])} locations")
        
        print("\nSeeding metrics...")
        for metric in data['metrics']:
            cursor.execute(
                """
                INSERT INTO metrics (id, name, display_name, unit, description)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (metric['id'], metric['name'], metric['display_name'], 
                 metric['unit'], metric['description'])
            )
        print(f"✓ Inserted {len(data['metrics'])} metrics")
        
        print("\nSeeding climate data...")
        for record in data['climate_data']:
            cursor.execute(
                """
                INSERT INTO climate_data (id, location_id, metric_id, date, value, quality)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (record['id'], record['location_id'], record['metric_id'], 
                 record['date'], record['value'], record['quality'])
            )
        print(f"✓ Inserted {len(data['climate_data'])} climate data records")
        
        # Commit changes
        conn.commit()
        print("\n✅ Database seeding completed successfully!")
        
        # Display summary
        cursor.execute("SELECT COUNT(*) FROM locations")
        location_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM metrics")
        metric_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM climate_data")
        data_count = cursor.fetchone()[0]
        
        print(f"\nDatabase Summary:")
        print(f"  Locations: {location_count}")
        print(f"  Metrics: {metric_count}")
        print(f"  Climate Data: {data_count}")
        
        cursor.close()
        conn.close()
        
    except MySQLdb.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    seed_database()

