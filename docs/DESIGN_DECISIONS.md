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

## API Implementation Notes

**Quality Weights** (from requirements):
```python
QUALITY_WEIGHTS = {
    'excellent': 1.0,
    'good': 0.8,
    'questionable': 0.5,
    'poor': 0.3
}
```

**Endpoints to Implement:**
1. `/api/v1/locations` - Simple lookup, no filtering
2. `/api/v1/metrics` - Simple lookup, no filtering
3. `/api/v1/climate` - Complex filtering (location, date range, metric, quality threshold)
4. `/api/v1/summary` - Aggregations with quality-weighted calculations
5. `/api/v1/trends` - Statistical analysis (trend detection, anomaly identification, seasonality)

---

## Notes & Observations

- Priority: Backend > Frontend wiring > UI polish (per instructions)
- Time budget: ~2 hours
- Sample data includes 3 locations, 3 metrics, 40 data points
- Frontend components are pre-built, need API integration only

---

_This document will be updated as we make decisions and progress through implementation._

