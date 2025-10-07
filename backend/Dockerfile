FROM python:3.13-slim

WORKDIR /app

# Install system dependencies required for mysqlclient and mysql client
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    default-mysql-client \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose Flask port
EXPOSE 5001

# Run the entrypoint script
CMD ["./docker-entrypoint.sh"]

