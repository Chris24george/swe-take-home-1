#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
sleep 5

echo "Checking if database needs seeding..."
# Check if climate_data table has any data
RECORD_COUNT=$(mysql -h"${MYSQL_HOST}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DB}" -se "SELECT COUNT(*) FROM climate_data;" 2>/dev/null || echo "0")

if [ "$RECORD_COUNT" -eq "0" ]; then
    echo "Database is empty. Seeding with sample data..."
    python seed_data.py
    echo "Database seeded successfully!"
else
    echo "Database already contains $RECORD_COUNT records. Skipping seed."
fi

echo "Starting Flask application..."
exec python app.py

