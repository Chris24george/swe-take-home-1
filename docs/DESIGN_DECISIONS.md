# EcoVision: Design Decisions & Development Log

## Purpose
This document tracks our design decisions, rationale, and development process for the EcoVision Climate Visualizer take-home assessment.

---

## Git Workflow Strategy

**Decision:** Feature branch workflow with merge to main
**Date:** 2025-10-06

**Rationale:**
- Assessment evaluates "proper use of Git (commit messages, branch strategy)"
- Feature branches show professional workflow understanding
- Planned branches:
  1. `feature/database-setup` - Database schema, migrations, seeding
  2. `feature/api-endpoints` - Backend API implementation
  3. `feature/frontend-integration` - Frontend wiring and components

**Commit Strategy:**
- Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`
- Clear, descriptive messages
- Atomic commits where possible

---

## Database Schema Design

**Status:** ✅ Finalized
**Decision Date:** 2025-10-06

### Final Schema

#### Table: `locations`
```sql
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    region VARCHAR(100) NOT NULL
);
```

#### Table: `metrics`
```sql
CREATE TABLE metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    description TEXT
);
```

#### Table: `climate_data`
```sql
CREATE TABLE climate_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    metric_id INT NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    quality ENUM('excellent', 'good', 'questionable', 'poor') NOT NULL,
    
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_reading (location_id, metric_id, date)
);
```

### Key Design Decisions:

1. **No created_at timestamps** - Simplified schema, not needed for this use case

2. **DECIMAL(9,6) for coordinates** - Standard precision for lat/lng
   - Latitude range: -90 to 90
   - Longitude range: -180 to 180
   - 6 decimal places = ~0.11 meter accuracy

3. **DECIMAL(10,3) for values** - Handles climate measurements up to 9,999,999.999 with appropriate precision

4. **region NOT NULL** - All sample data has region values

5. **Foreign Keys with ON DELETE CASCADE** - If location/metric deleted, associated climate data auto-deletes

6. **ENUM for quality** - Restricts to valid values ('excellent', 'good', 'questionable', 'poor')

7. **UNIQUE constraint as index** - `UNIQUE KEY (location_id, metric_id, date)` serves dual purpose:
   - **Data integrity**: Prevents duplicate readings for same location/metric/day
   - **Query optimization**: Acts as composite index for filtered queries
   
### Index Strategy Rationale:

**Why UNIQUE(location_id, metric_id, date) instead of separate indexes?**

Analyzed query patterns from API endpoints:
- Most queries filter by: location + metric + date range
- Some queries filter by: location only (leftmost prefix works)
- Metric-only queries possible but low-value (only 3 metrics, low cardinality)
- Date-only queries rare and not primary access pattern

**Why not INDEX(date)?**
- Date is never the primary filter dimension in climate data queries
- Users filter by location/metric first, then date range
- The composite index already provides date ordering when filtering by location/metric
- Standalone date index would be low selectivity (returns all locations × all metrics)

**Why not INDEX(metric_id)?**
- Only 3 possible metric values (low cardinality)
- Index selectivity too low to provide meaningful benefit
- Full table scan of 40 rows is microseconds anyway

**Why not INDEX(quality)?**
- Only 4 possible values (extremely low cardinality)
- Quality is a secondary filter, always applied after location/metric/date
- Each quality level represents ~25% of data - too broad for effective indexing

**Conclusion:** Single UNIQUE constraint provides optimal balance of data integrity and query performance for our access patterns.

---

## Database Setup Strategy

**Decision:** Simple SQL schema file + Python seeding script (NO migrations)
**Date:** 2025-10-06

### Approach:
1. `backend/schema.sql` - Raw SQL DDL to create tables
2. `backend/seed_data.py` - Python script to load sample_data.json into database

### Rationale for No Migrations:
- ✅ **Brand new database** - No existing production data to preserve
- ✅ **One-time setup** - Reviewers run schema.sql once
- ✅ **Simpler for assessment** - No migration framework overhead (Alembic, Flask-Migrate)
- ✅ **Practical judgment** - Shows we don't over-engineer for a take-home
- ✅ **Faster implementation** - Fits 2-hour time constraint

**When would we use migrations?**
- Existing production database requiring schema evolution
- Long-running project with team collaboration
- Need to version and rollback schema changes
- Not applicable for this assessment context

---

## Environment Configuration Strategy

**Decision:** Use environment variables with .env file support
**Date:** 2025-10-06

### Approach:
1. **`.env.example`** - Template showing required configuration
2. **`.gitignore`** - Excludes actual `.env` file (prevents committing secrets)
3. **`python-dotenv`** - Optional dependency for auto-loading .env files
4. **Fallback to system env vars** - Works without dotenv installed

### Implementation:
```python
# Optional .env file loading
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Fall back to system environment variables

# Then use os.environ.get() with sensible defaults
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
```

### Best Practices Demonstrated:
- ✅ **12-Factor App** - Configuration via environment variables
- ✅ **Security** - No secrets committed to git
- ✅ **Developer Experience** - Works out-of-the-box with sensible defaults
- ✅ **Flexibility** - Works with or without python-dotenv
- ✅ **Docker-ready** - Easy to override for containerized deployments
- ✅ **Zero-config local dev** - Runs immediately with standard MySQL setup

### Environment Variables (All Optional):

**The application works immediately with built-in defaults.** Environment variables only needed if your setup differs.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MYSQL_HOST` | `localhost` | Database host |
| `MYSQL_USER` | `root` | Database user |
| `MYSQL_PASSWORD` | `""` (empty) | Database password |
| `MYSQL_DB` | `climate_data` | Database name |
| `FLASK_ENV` | `development` | Flask environment |
| `FLASK_DEBUG` | `True` | Debug mode |

**When to customize:**
- MySQL has a password set → Set `MYSQL_PASSWORD`
- Using Docker → Override in docker-compose.yml or container environment
- Different database name → Set `MYSQL_DB`
- Production deployment → Set appropriate values for all variables

---

## Technology Choices

**Decision Date:** 2025-10-06

**Backend:**
- Framework: Flask (using provided starter code)
- Database: **MySQL** 

**Rationale for MySQL:**
- Aligns with Mutual of Omaha's preferred stack
- Demonstrates ability to work with production-grade database
- Shows we can handle their technology recommendations
- More realistic for enterprise applications

**Frontend:** (Pre-implemented)
- React 18 + Vite
- TailwindCSS for styling
- Chart.js for visualizations

---

## Development Workflow & Environment

**Decision:** MySQL as persistent background service for development
**Date:** 2025-10-06

### MySQL Setup:

**Current Approach:**
```bash
# One-time setup
brew install mysql pkg-config
brew services start mysql    # Runs as background service

# Create and seed database
mysql -u root -e "CREATE DATABASE climate_data;"
mysql -u root climate_data < backend/schema.sql
python backend/seed_data.py
```

**Development Workflow:**
```bash
# Every coding session:
cd backend
source venv/bin/activate
python app.py              # Flask connects to MySQL automatically

# MySQL already running - no manual startup needed!
```

**Service Management:**
```bash
brew services list           # Check status
brew services restart mysql  # Rare - only if issues
brew services stop mysql     # Optional - when done developing
```

### Rationale:

**Why background service instead of manual start/stop?**
- ✅ **Simplicity** - Always ready, no startup friction
- ✅ **Mirrors production** - Databases run continuously in real deployments
- ✅ **Reviewer-friendly** - Simple setup instructions
- ✅ **Stateful persistence** - Data survives between development sessions

**Development Lifecycle:**
1. ✅ MySQL runs as background service (always available)
2. ✅ Database `climate_data` created once
3. ✅ Schema applied once (`schema.sql`)
4. ✅ Data seeded once (`seed_data.py`)
5. ✅ Flask app creates new connections on each run

**No restart needed between runs** - Flask creates fresh database connections each time `app.py` starts.

### Future: Docker Support

**Planned improvement** (post-assessment):
```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:9.4
    environment:
      - MYSQL_ROOT_PASSWORD=
      - MYSQL_DATABASE=climate_data
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    environment:
      - MYSQL_HOST=mysql
    depends_on:
      - mysql
```

**Benefits of Docker approach:**
- ✅ Isolated environment (no local MySQL needed)
- ✅ Consistent across dev/staging/production
- ✅ Single command startup: `docker-compose up`
- ✅ Easy cleanup: `docker-compose down`
- ✅ Version-locked dependencies

**Why not Docker for assessment?**
- Assessment deliverable emphasizes speed (2-hour constraint)
- Docker setup adds complexity reviewers must navigate
- Direct MySQL shows database understanding without abstraction
- Can add Docker later as enhancement

**Our environment variable strategy already Docker-ready** - override `MYSQL_HOST` and other vars in container environment.

---

## API Implementation

**Status:** 5/5 endpoints complete ✅ **BACKEND COMPLETE!**
**Date:** 2025-10-06

### Completed Endpoints:

#### 1. `/api/v1/locations` ✅
- Simple SELECT query returning all locations
- Converts Decimal lat/lng to float for JSON serialization
- No filtering required

#### 2. `/api/v1/metrics` ✅
- Simple SELECT query returning all metrics
- No type conversion needed
- No filtering required

#### 3. `/api/v1/climate` ✅
- Complex endpoint with dynamic filtering
- Supports 5 optional query parameters:
  - `location_id` - Filter by location
  - `metric` - Filter by metric name (temperature/precipitation/humidity)
  - `start_date` - Filter by date range (inclusive)
  - `end_date` - Filter by date range (inclusive)
  - `quality_threshold` - Minimum quality level (poor/questionable/good/excellent)
- Returns enriched data with joins (location names, metric details)
- Ordered by date for time-series visualization

#### 4. `/api/v1/summary` ✅
- **Quality-weighted statistical aggregations** grouped by metric
- Supports same 5 filter parameters as `/climate`
- Returns per-metric statistics:
  - `min` / `max` / `avg` - Simple statistics
  - `weighted_avg` - Quality-weighted average using `QUALITY_WEIGHTS`
  - `quality_distribution` - Percentage breakdown by quality level
  - `unit` - Measurement unit
- **Implementation approach**: Python-heavy (fetch filtered data, calculate in Python)
  - Simpler, more maintainable code vs complex SQL aggregations
  - Easy to modify weights or add new calculations
  - Performance fine for dataset size (40 rows)

#### 5. `/api/v1/trends` ✅
- **Statistical trend analysis** using numpy for calculations
- Supports same 5 filter parameters as other endpoints
- Returns per-metric analysis:
  - **Trend detection**: Linear regression with R² confidence
  - **Anomaly detection**: Identifies outliers > 2 standard deviations
  - **Seasonality detection**: Framework ready (returns false for insufficient data)
- **Implementation approach**: Python + numpy for statistical analysis
  - `numpy.polyfit()` for linear regression
  - R² (coefficient of determination) for confidence scoring
  - Standard deviation-based anomaly detection
  - Honest handling of insufficient data for seasonality

### Implementation Decisions:

**1. DictCursor for All Endpoints**
```python
cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
```
- Returns rows as dictionaries instead of tuples
- Eliminates manual column-to-key mapping
- Cleaner, more maintainable code
- Easier JSON serialization with `jsonify()`

**2. Dynamic SQL with Parameterized Queries**
```python
query = "SELECT ... WHERE 1=1"
params = []

if location_id:
    query += " AND cd.location_id = %s"
    params.append(location_id)

cursor.execute(query, tuple(params))
```
- **Security**: Prevents SQL injection via parameterized queries
- **Flexibility**: Builds query dynamically based on provided filters
- **Readability**: `WHERE 1=1` allows clean AND chaining

**3. Quality Threshold Logic**
```python
quality_map = {
    'poor': ['poor', 'questionable', 'good', 'excellent'],
    'questionable': ['questionable', 'good', 'excellent'],
    'good': ['good', 'excellent'],
    'excellent': ['excellent']
}
```
- Quality threshold is **inclusive** - "good" includes both "good" and "excellent"
- Maps threshold to allowed values for SQL `IN` clause
- Dynamic placeholder generation prevents SQL injection

**4. JSON Serialization Type Handling**
```python
# MySQL Decimal → Python float
row['value'] = float(row['value'])
row['latitude'] = float(row['latitude'])
row['longitude'] = float(row['longitude'])

# MySQL date → ISO string
row['date'] = str(row['date'])  # "2025-01-15"
```
- MySQL Decimal not JSON-serializable → convert to float
- MySQL date → string in ISO format (YYYY-MM-DD)
- No precision loss for our use case (3 decimal places max)

**5. Weighted Average Calculation** (for `/summary` endpoint)
```python
# Given readings with different quality levels:
values = [22.5, 21.8, 29.5]
qualities = ['excellent', 'good', 'questionable']

# Simple average (treats all readings equally):
avg = sum(values) / len(values) = 24.6°C

# Weighted average (trusts high-quality readings more):
weighted_sum = (22.5 × 1.0) + (21.8 × 0.8) + (29.5 × 0.5) = 54.69
weight_sum = 1.0 + 0.8 + 0.5 = 2.3
weighted_avg = 54.69 / 2.3 = 23.78°C  # Lower! Discounts the questionable reading
```

**Why this matters:**
- Mixed quality data can skew simple averages
- Weighted average provides more trustworthy summary statistics
- Outliers from poor-quality sensors have less impact
- Example: 10 excellent readings (18°C) + 1 poor outlier (30°C)
  - Simple avg: misleadingly high
  - Weighted avg: properly discounts the outlier

**6. Trend Analysis with Linear Regression** (for `/trends` endpoint)
```python
# Convert dates to numeric (days since start)
date_objects = [datetime.strptime(str(d), '%Y-%m-%d') for d in dates]
days_since_start = [(d - date_objects[0]).days for d in date_objects]

# Linear regression: fit line y = mx + b
coefficients = np.polyfit(days_since_start, values, 1)
slope = coefficients[0]  # Rate of change per day

# Calculate R² (goodness of fit)
y_pred = np.polyval(coefficients, days_since_start)
ss_res = np.sum((values - y_pred) ** 2)  # Residual sum of squares
ss_tot = np.sum((values - np.mean(values)) ** 2)  # Total sum of squares
r_squared = 1 - (ss_res / ss_tot)  # Higher = better fit

# Determine direction
if abs(slope) < 0.01:
    direction = 'stable'
elif slope > 0:
    direction = 'increasing'
else:
    direction = 'decreasing'

# Convert to per-month rate
rate_per_month = slope * 30
```

**Anomaly Detection:**
```python
mean = np.mean(values)
std_dev = np.std(values)

for date, value, quality in zip(dates, values, qualities):
    deviation = abs(value - mean) / std_dev
    if deviation > 2.0:  # Threshold from API spec
        # Flag as anomaly with deviation score
```

**Seasonality Detection:**

Full algorithm implemented, returns `detected: false` for our single-year sample data.

**Detection criteria:**
1. **Multi-year requirement**: Data must span at least 2 years to detect repeating patterns
2. **Seasonal coverage**: Need at least 3 seasons with 2+ data points each
3. **Variance test**: Between-season variance > within-season variance × 2
4. **Per-season trends**: Calculate trend for each season if 3+ years available

**Algorithm steps:**
```python
# 1. Group data by season AND year
seasonal_data = {
    'winter': {2024: [...], 2025: [...]},
    'spring': {2024: [...], 2025: [...]}
}

# 2. Calculate between-season variance
# (How different are seasons from each other?)
between_variance = var([winter_avg, spring_avg, summer_avg, fall_avg])

# 3. Calculate within-season variance
# (How consistent is each season across years?)
within_variance = avg([var(all_winters), var(all_springs), ...])

# 4. Detect if seasons differ more than noise
if between_variance > within_variance * 2:
    detected = True

# 5. Calculate per-season trends across years
# E.g., "Are winters getting warmer?"
if 3+ years for season:
    trend = linear_regression(yearly_averages)
```

**Our sample data:**
- Spans only Jan-Feb 2025 (single year)
- Fails multi-year requirement → returns `detected: false`
- But implementation is complete and ready for sufficient data

**Example output with sufficient data:**
```json
{
  "detected": true,
  "period": "yearly",
  "confidence": 0.92,
  "pattern": {
    "winter": {"avg": 5.2, "trend": "stable"},
    "spring": {"avg": 15.7, "trend": "increasing"},
    "summer": {"avg": 25.3, "trend": "increasing"},
    "fall": {"avg": 18.1, "trend": "stable"}
  }
}
```

---

## Testing Strategy

**Decision:** Manual curl testing + Basic automated tests
**Date:** 2025-10-06

### Approach:

**1. Manual Testing with curl**
- Fast iteration during development
- Easy to verify response structure
- No framework overhead
- Examples:
  ```bash
  curl "http://localhost:5001/api/v1/climate?location_id=1&metric=temperature"
  curl "http://localhost:5001/api/v1/climate?quality_threshold=good"
  ```

**2. Automated Test Script (`backend/test_basic.py`)**
- **31 comprehensive tests** covering ALL 5 endpoints + edge cases
- Tests various filter combinations, edge cases, and error handling
- Validates response structure and data accuracy
- Verifies weighted averages, trend detection, and anomaly identification
- Uses Python `requests` library
- Run with: `python3 backend/test_basic.py`

**Test Coverage:**
```
✅ GET /api/v1/locations (1 test)
✅ GET /api/v1/metrics (1 test)

/api/v1/climate endpoint (11 tests):
✅ No filters (40 records)
✅ Location filter (16 records)
✅ Metric filter
✅ Location + metric filter (8 records)
✅ Date range filter (20 records)
✅ Quality threshold filter (29 records)
✅ Non-existent location (empty result)
✅ Non-existent metric (empty result)
✅ Invalid date range (empty result)

/api/v1/summary endpoint (9 tests):
✅ No filters (response structure validation)
✅ Location filter (Irvine-specific stats)
✅ Metric filter (temperature only)
✅ Weighted avg differs from simple avg
✅ Quality distribution sums to 1.0
✅ Quality threshold filter works correctly
✅ Non-existent location (empty result)
✅ Non-existent metric (empty result)
✅ Invalid date range (empty result)

/api/v1/trends endpoint (11 tests):
✅ No filters (all metrics with trend/anomalies/seasonality)
✅ Trend structure validation (direction, rate, confidence)
✅ Anomaly detection (deviation > 2σ)
✅ Seasonality returns false for insufficient data
✅ Location filter works correctly
✅ Quality threshold filter works correctly
✅ Narrow date range (insufficient_data)
✅ Non-existent location (empty result)
✅ Non-existent metric (empty result)
✅ Invalid date range (empty result)
✅ Only 2 data points (insufficient_data)
```

### Rationale:

**Why not pytest/unittest framework?**
- ✅ Assessment time constraint (2 hours)
- ✅ Simple test script demonstrates testing awareness
- ✅ No framework setup overhead
- ✅ Easy for reviewers to run and understand

**Why this is sufficient:**
- Small codebase (5 endpoints)
- Deterministic sample data
- Focus on functionality over test coverage metrics
- Demonstrates software quality awareness without over-engineering

---

## Code Refactoring & Modularity

**Decision:** Extract reusable logic into separate modules
**Date:** 2025-10-06

### Modules Created:

**1. `backend/filters.py`** - Centralized filter logic
```python
def extract_filter_params(request_obj):
    """Extracts common filter parameters from Flask request"""
    
def build_climate_filters(query, params, **filters):
    """Applies filters to SQL query with parameterized values"""
```

**Benefits:**
- ✅ **DRY principle**: Filter logic used across `/climate`, `/summary`, `/trends`
- ✅ **Maintainability**: Single source of truth for filter behavior
- ✅ **Testability**: Can test filter logic independently
- ✅ **Readability**: Endpoint code focuses on business logic, not SQL building

**2. `backend/statistics.py`** - Statistical analysis functions
```python
def calculate_trend(data):
    """Linear regression with R² confidence scoring"""
    
def detect_anomalies(data):
    """Standard deviation-based outlier detection"""
    
def detect_seasonality(data):
    """Multi-year seasonal pattern analysis"""
```

**Benefits:**
- ✅ **Separation of concerns**: Stats logic separate from API layer
- ✅ **Reusability**: Can use in other endpoints or scripts
- ✅ **Testability**: Statistical algorithms can be unit tested
- ✅ **Complexity management**: `app.py` stays focused on routing/HTTP

### Impact:

**Before refactoring:**
- `app.py`: ~400 lines, mixing routing, SQL, and statistics

**After refactoring:**
- `app.py`: ~360 lines (routing and orchestration only)
- `filters.py`: ~85 lines (reusable filter logic)
- `statistics.py`: ~300 lines (statistical algorithms)

**Result:** More maintainable, testable, and professional code structure.

---

## Edge Case Handling & Bug Fixes

**Date:** 2025-10-06

### Critical Bug Fix: Numpy LinAlgError

**Issue:** When all data points fall on the same date, linear regression fails:
```python
days_since_start = [0, 0, 0, 0]  # All same date!
np.polyfit(days_since_start, values, 1)  # ❌ SVD did not converge
```

**Solution:**
```python
# Check if all dates are identical
if len(set(days_since_start)) == 1:
    return {'direction': 'insufficient_data', ...}

# Wrap in try-except for numerical instability
try:
    coefficients = np.polyfit(days_since_start, values, 1)
except np.linalg.LinAlgError:
    return {'direction': 'insufficient_data', ...}
```

**Testing:** Added edge case test for narrow date ranges that trigger this condition.

### Edge Cases Handled:

**1. Non-existent Resources**
- Non-existent `location_id` → Returns empty data `{}`
- Non-existent `metric` → Returns empty data `{}`
- Graceful degradation, no 404 errors

**2. Invalid Input**
- `end_date` before `start_date` → Returns empty data (SQL naturally handles)
- Invalid quality threshold → Ignored (not in quality_map)

**3. Insufficient Data for Statistics**
- < 3 data points → `direction: 'insufficient_data'`
- All dates identical → `direction: 'insufficient_data'`
- Single year of data → `seasonality: {detected: false}`

**4. Numerical Stability**
- Zero standard deviation (all identical values) → No anomalies detected
- LinAlgError in polyfit → Caught and handled gracefully

### Testing Philosophy:

**Production-ready error handling:**
- ✅ Never crash on unexpected input
- ✅ Return meaningful responses for edge cases
- ✅ Honest reporting of insufficient data
- ✅ Graceful degradation over errors

---

## Flask Port Configuration

**Decision:** Use port 5001 instead of default 5000
**Date:** 2025-10-06

**Issue:** Port 5000 conflict with macOS AirPlay Receiver service

**Solution:**
```python
# backend/app.py
if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

**Frontend proxy updated accordingly:**
```javascript
// frontend/vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  }
}
```

**Rationale:**
- Avoids requiring users to disable system services
- Common macOS development issue
- No functional impact on application
- Frontend proxy handles the port mapping transparently

---

## Dependencies

**Backend Python packages** (`requirements.txt`):
```
Flask==3.0.0                # Web framework
Flask-CORS==4.0.0           # CORS support
Flask-MySQLdb==2.0.0        # MySQL integration
mysqlclient==2.2.0          # MySQL client library
python-dotenv==1.0.0        # Environment variable loading (optional)
requests==2.32.5            # For testing
numpy>=1.26.0               # Statistical analysis (linear regression, std dev)
```

**Why numpy?**
- Industry-standard library for numerical computing
- Provides `polyfit()` for linear regression (trend detection)
- Efficient mean/std dev calculations for anomaly detection
- R² calculation for confidence scoring
- Lightweight and well-supported

---

## Notes & Observations

- Priority: Backend > Frontend wiring > UI polish (per instructions)
- Time budget: ~2 hours
- Sample data includes 3 locations, 3 metrics, 40 data points
- Frontend components are pre-built, need API integration only
- **Backend API: 100% complete** (5/5 endpoints implemented and tested)

---

_This document will be updated as we make decisions and progress through implementation._

