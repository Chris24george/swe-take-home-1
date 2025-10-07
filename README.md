# EcoVision: Climate Data Visualizer

**Interactive climate data explorer with statistical analysis and trend detection**

A full-stack application for visualizing and analyzing climate data with quality-weighted statistics, trend detection, and anomaly identification.

---

## 📋 Project Overview

**Status:** ✅ **Complete** - Full-stack application ready for deployment

This project demonstrates:
- ✅ RESTful API design with Flask
- ✅ MySQL database design and optimization
- ✅ Dynamic filtering with parameterized queries (SQL injection prevention)
- ✅ Statistical analysis (linear regression, anomaly detection, seasonality)
- ✅ Quality-weighted calculations
- ✅ Comprehensive automated testing (31/31 tests passing)
- ✅ React frontend with three analysis modes
- ✅ Full-stack integration (API + UI working seamlessly)
- ✅ Docker containerization with docker-compose orchestration

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker and Docker Compose

```bash
# 1. Clone the repository
git clone <repository-url>
cd swe-take-home-1

# 2. Start everything with one command
docker-compose up

# That's it! The application will:
# - Build the backend and frontend containers
# - Start MySQL and create the database
# - Automatically seed 40 climate records
# - Launch the full stack
```

**Access the application:**
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:5001/api/v1/

**Stop the application:**
```bash
docker-compose down
```

**To rebuild after code changes:**
```bash
docker-compose up --build
```

---

### Option 2: Local Development

**Prerequisites:**
- Python 3.13+ (or 3.10+)
- MySQL 8.0+ (or 5.7+)
- Node.js 18+

**Backend setup:**
```bash
# 1. Clone and navigate to the repository
git clone <repository-url>
cd swe-take-home-1

# 2. Install and start MySQL
brew install mysql pkg-config
brew services start mysql

# 3. Create database and schema
mysql -u root -e "CREATE DATABASE climate_data;"
mysql -u root climate_data < backend/schema.sql

# 4. Set up Python environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 5. Seed the database
python seed_data.py

# 6. Run the backend server
python app.py
# Server runs on http://localhost:5001
```

**Frontend setup (in a new terminal):**
```bash
cd swe-take-home-1/frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

**Access the application:**
- Frontend UI: http://localhost:3000
- Backend API: http://localhost:5001/api/v1/

---

## 🗄️ Configuration

### Docker Configuration

Docker works out-of-the-box with no configuration needed. Settings are defined in `docker-compose.yml`:
- MySQL runs in a container with persistent volume
- Database automatically created and seeded
- Hot reload enabled for development

### Local Development Configuration

**Default settings:**
- **Host:** localhost
- **User:** root
- **Password:** (empty)
- **Database:** climate_data

**Custom configuration:** Create a `.env` file in `backend/`:

```bash
# backend/.env
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=climate_data
```

See `backend/.env.example` for reference.

---

## 🧪 Testing

### Run Automated Tests

```bash
cd backend
source venv/bin/activate

# Ensure Flask is running (in another terminal)
python app.py

# Run tests
python test_basic.py
```

**Expected output:**
```
============================================================
EcoVision API Tests
============================================================
✅ GET /api/v1/locations
✅ GET /api/v1/metrics
✅ GET /api/v1/climate (8 tests)
✅ GET /api/v1/summary (6 tests)
✅ GET /api/v1/trends (6 tests)
============================================================
Results: 20/20 tests passed
============================================================
🎉 All tests passed!
```

### Manual Testing with curl

```bash
# Get all locations
curl http://localhost:5001/api/v1/locations

# Get climate data for Irvine
curl "http://localhost:5001/api/v1/climate?location_id=1"

# Get temperature summary
curl "http://localhost:5001/api/v1/summary?metric=temperature"

# Get trend analysis
curl "http://localhost:5001/api/v1/trends?location_id=1"
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:5001/api/v1`

All endpoints support CORS and return JSON responses.

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/locations` | GET | List all monitoring locations | ✅ Complete |
| `/metrics` | GET | List all available metrics | ✅ Complete |
| `/climate` | GET | Get filtered climate data | ✅ Complete |
| `/summary` | GET | Get quality-weighted statistics | ✅ Complete |
| `/trends` | GET | Get trend analysis & anomalies | ✅ Complete |

### Query Parameters (all optional)

All data endpoints support these filters:
- `location_id` - Filter by location ID
- `metric` - Filter by metric name (temperature, precipitation, humidity)
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)
- `quality_threshold` - Minimum quality level (poor, questionable, good, excellent)

**For detailed request/response examples, see:** `docs/api.md`

---

## 🏗️ Architecture

### Deployment Options

- **Docker** (recommended): Full-stack deployment with docker-compose
  - MySQL 8.0 in container with persistent volume
  - Backend and frontend with hot reload
  - One-command setup with automatic database seeding
  
- **Local Development**: Traditional setup with local MySQL
  - More control over individual services
  - Useful for debugging and development

### Backend Stack

- **Framework:** Flask 3.0 (Python web framework)
- **Database:** MySQL 8.0 with optimized schema
- **ORM:** Flask-MySQLdb (direct SQL for performance)
- **Statistical Analysis:** NumPy (linear regression, anomaly detection)
- **Testing:** Custom test suite with `requests` library
- **Containerization:** Docker with multi-stage builds

### Database Schema

```
locations (id, name, country, latitude, longitude, region)
    ↓
metrics (id, name, display_name, unit, description)
    ↓
climate_data (id, location_id, metric_id, date, value, quality)
    - UNIQUE KEY (location_id, metric_id, date)
    - Foreign keys with ON DELETE CASCADE
```

Key optimizations:
- Composite unique index for data integrity and query performance
- Parameterized queries for SQL injection prevention
- Quality ENUM for data validation

### Key Features

**1. Quality-Weighted Statistics**
- Weighted averages account for data quality
- Weights: excellent=1.0, good=0.8, questionable=0.5, poor=0.3
- Provides more trustworthy summary statistics

**2. Trend Detection**
- Linear regression using numpy.polyfit()
- R² coefficient for confidence scoring
- Direction: increasing/decreasing/stable
- Rate of change per month

**3. Anomaly Detection**
- Statistical outlier detection (>2 standard deviations)
- Reports deviation magnitude
- Useful for identifying sensor errors or extreme events

---

## 📁 Project Structure

```
swe-take-home-1/
├── backend/
│   ├── app.py                  # Flask application & API endpoints
│   ├── schema.sql              # Database DDL
│   ├── seed_data.py            # Database seeding script
│   ├── test_basic.py           # Automated test suite (20 tests)
│   ├── requirements.txt        # Python dependencies
│   ├── venv/                   # Virtual environment (gitignored)
│   └── .env.example            # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── api.js              # API service functions
│   │   └── App.jsx             # Main application
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── sample_data.json        # Sample climate data
├── docs/
│   ├── api.md                  # API specification
│   ├── schema.md               # Database requirements
│   ├── DESIGN_DECISIONS.md     # Technical rationale & decisions
│   └── TEST-chrisg.md          # Assessment instructions
├── .gitignore
├── .env.example
└── README.md                   # This file
```

---

## 🔧 Troubleshooting

### Port 5000 Already in Use

**Issue:** macOS AirPlay Receiver uses port 5000

**Solution:** The app runs on port 5001 instead (already configured)

### MySQL Connection Errors

```bash
# Check MySQL is running
brew services list

# Restart MySQL if needed
brew services restart mysql

# Verify database exists
mysql -u root -e "SHOW DATABASES;"
```

### Python Dependencies

```bash
# If mysqlclient fails to install
brew install mysql pkg-config
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ✅ Implementation Status

### Backend API (100% Complete)

- ✅ `/api/v1/locations` - All monitoring locations
- ✅ `/api/v1/metrics` - Available climate metrics
- ✅ `/api/v1/climate` - Filtered climate data with dynamic queries
- ✅ `/api/v1/summary` - Quality-weighted statistical aggregations
- ✅ `/api/v1/trends` - Trend detection with linear regression and anomaly identification
- ✅ 31 automated tests (all passing)
- ✅ SQL injection prevention via parameterized queries
- ✅ Environment variable configuration
- ✅ Comprehensive documentation
- ✅ Code refactoring (filters.py, statistics.py)

### Frontend (100% Complete)

- ✅ API service integration (`api.js`)
- ✅ Filter component with dynamic dropdowns
- ✅ Three analysis modes (Raw Data, Quality Weighted, Trends)
- ✅ Data visualization with Chart.js
- ✅ Trend analysis UI with anomaly detection
- ✅ Quality distribution indicators
- ✅ Custom SummaryStats component for weighted view
- ✅ Responsive design with Tailwind CSS

---

## 📚 Additional Documentation

- **API Specification:** `docs/api.md`
- **Database Schema:** `docs/schema.md`
- **Design Decisions:** `docs/DESIGN_DECISIONS.md` (comprehensive technical rationale)
- **Assessment Instructions:** `docs/TEST-chrisg.md`

---

## 🎯 Development Approach

**Prioritization (per instructions):**
1. ✅ **Backend API** - Complete with all 5 endpoints
2. ✅ **Frontend Integration** - All components wired and functional
3. ✅ **UI Polish** - Responsive design & professional UX

**Quality Focus:**
- Production-quality code with error handling
- Security best practices (parameterized queries, CORS)
- Comprehensive testing (31 tests, all passing)
- Clear documentation and design rationale
- Code modularity and maintainability

---

## 👤 Author

Chris George

**Contact:** [Your contact info]

---

## 📝 License

This project is part of a take-home assessment for Mutual of Omaha.
