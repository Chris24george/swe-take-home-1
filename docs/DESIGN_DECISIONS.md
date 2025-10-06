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

**Status:** In Discussion

### Proposed Schema

#### Table: `locations`
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL)
- country (VARCHAR(100), NOT NULL)
- latitude (DECIMAL(10,7), NOT NULL)
- longitude (DECIMAL(10,7), NOT NULL)
- region (VARCHAR(100))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

#### Table: `metrics`
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(50), UNIQUE, NOT NULL)
- display_name (VARCHAR(100), NOT NULL)
- unit (VARCHAR(50), NOT NULL)
- description (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

#### Table: `climate_data`
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- location_id (INT, NOT NULL, FOREIGN KEY → locations.id)
- metric_id (INT, NOT NULL, FOREIGN KEY → metrics.id)
- date (DATE, NOT NULL)
- value (DECIMAL(10,3), NOT NULL)
- quality (ENUM('excellent', 'good', 'questionable', 'poor'), NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- INDEX idx_location_metric_date (location_id, metric_id, date)
- INDEX idx_date (date)
- INDEX idx_quality (quality)
```

### Key Design Decisions:
1. **Foreign Keys** - Ensures referential integrity between tables
2. **Indexes** - Optimized for filtering operations required by API:
   - Composite index on (location_id, metric_id, date) for common filtered queries
   - Individual indexes on date and quality for range queries
3. **ENUM for quality** - Restricts to valid values, prevents data corruption
4. **DECIMAL types** - Precision for geographic coordinates and climate measurements
5. **Timestamps** - Track when records were created (useful for debugging)

### Open Questions:
- [ ] MySQL vs SQLite? (MySQL preferred per instructions, SQLite easier for setup)
- [ ] Data types appropriate?
- [ ] Any additional fields needed?

---

## Technology Choices

**Backend:**
- Framework: TBD (Flask starter provided, FastAPI option mentioned)
- Database: TBD (MySQL preferred, SQLite alternative)

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

