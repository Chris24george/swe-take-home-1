"""
Query filter building utilities for climate data API.

This module provides reusable functions for building SQL WHERE clauses
with parameterized queries to prevent SQL injection.
"""


def build_climate_filters(query, params, location_id=None, metric=None, 
                          start_date=None, end_date=None, quality_threshold=None):
    """
    Build SQL WHERE clause for climate data filtering.
    
    This function handles the common filtering pattern used across multiple endpoints
    (/climate, /summary, /trends) with SQL injection prevention via parameterized queries.
    
    Args:
        query: Base SQL query string (should end with "WHERE 1=1")
        params: List to append parameters to
        location_id: Optional location ID filter
        metric: Optional metric name filter
        start_date: Optional start date filter (YYYY-MM-DD)
        end_date: Optional end date filter (YYYY-MM-DD)
        quality_threshold: Optional minimum quality level
        
    Returns:
        Tuple of (modified_query, modified_params)
    """
    # Location filter
    if location_id:
        query += " AND cd.location_id = %s"
        params.append(location_id)
    
    # Metric filter
    if metric:
        query += " AND m.name = %s"
        params.append(metric)
    
    # Date range filters
    if start_date:
        query += " AND cd.date >= %s"
        params.append(start_date)
    
    if end_date:
        query += " AND cd.date <= %s"
        params.append(end_date)
    
    # Quality threshold filter (inclusive)
    # "good" includes both "good" and "excellent" readings
    if quality_threshold:
        quality_map = {
            'poor': ['poor', 'questionable', 'good', 'excellent'],
            'questionable': ['questionable', 'good', 'excellent'],
            'good': ['good', 'excellent'],
            'excellent': ['excellent']
        }
        allowed_qualities = quality_map.get(quality_threshold.lower())
        
        if allowed_qualities:
            # Build parameterized IN clause
            placeholders = ', '.join(['%s'] * len(allowed_qualities))
            query += f" AND cd.quality IN ({placeholders})"
            params.extend(allowed_qualities)
    
    return query, params


def extract_filter_params(request):
    """
    Extract common filter parameters from Flask request object.
    
    Args:
        request: Flask request object
        
    Returns:
        Dict with filter parameters
    """
    return {
        'location_id': request.args.get('location_id'),
        'start_date': request.args.get('start_date'),
        'end_date': request.args.get('end_date'),
        'metric': request.args.get('metric'),
        'quality_threshold': request.args.get('quality_threshold')
    }

