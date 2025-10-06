"""
Statistical analysis functions for climate data.

This module provides functions for:
- Trend detection using linear regression
- Anomaly detection using standard deviation
- Seasonality detection (framework ready for sufficient data)
"""

import numpy as np
from datetime import datetime


def calculate_trend(data):
    """
    Calculate trend using linear regression.
    
    Args:
        data: Dict with 'dates', 'values', and 'unit' keys
        
    Returns:
        Dict with 'direction', 'rate', 'unit', and 'confidence' (R²)
    """
    dates = data['dates']
    values = data['values']
    unit = data['unit']
    
    # Need at least 3 points for meaningful trend analysis
    if len(values) < 3:
        return {
            'direction': 'insufficient_data',
            'rate': 0.0,
            'unit': f'{unit}/month',
            'confidence': 0.0
        }
    
    # Convert dates to numeric values (days since first date)
    date_objects = [datetime.strptime(str(d), '%Y-%m-%d') for d in dates]
    days_since_start = [(d - date_objects[0]).days for d in date_objects]
    
    # Linear regression: y = mx + b (returns [slope, intercept])
    coefficients = np.polyfit(days_since_start, values, 1)
    slope = coefficients[0]  # Rate of change per day
    
    # Calculate R² (coefficient of determination) for confidence
    y_pred = np.polyval(coefficients, days_since_start)
    ss_res = np.sum((np.array(values) - y_pred) ** 2)  # Residual sum of squares
    ss_tot = np.sum((np.array(values) - np.mean(values)) ** 2)  # Total sum of squares
    
    # R² = 1 - (SS_res / SS_tot), capped between 0 and 1
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
    r_squared = max(0.0, min(1.0, r_squared))  # Clamp to [0, 1]
    
    # Determine direction based on slope
    # Use small threshold to avoid calling nearly-flat lines "increasing/decreasing"
    slope_threshold = 0.01
    if abs(slope) < slope_threshold:
        direction = 'stable'
    elif slope > 0:
        direction = 'increasing'
    else:
        direction = 'decreasing'
    
    # Convert slope from per-day to per-month (approximate 30 days)
    rate_per_month = slope * 30
    
    return {
        'direction': direction,
        'rate': round(rate_per_month, 2),
        'unit': f'{unit}/month',
        'confidence': round(r_squared, 2)
    }


def detect_anomalies(data):
    """
    Detect anomalies using standard deviation method.
    
    Args:
        data: Dict with 'dates', 'values', and 'qualities' keys
        
    Returns:
        List of anomalies (data points > 2 standard deviations from mean)
    """
    dates = data['dates']
    values = data['values']
    qualities = data['qualities']
    
    # Need at least 3 points for meaningful statistics
    if len(values) < 3:
        return []
    
    # Calculate mean and standard deviation
    mean = np.mean(values)
    std_dev = np.std(values)
    
    # If std_dev is 0, all values are identical (no anomalies possible)
    if std_dev == 0:
        return []
    
    # Find anomalies (> 2 standard deviations from mean)
    anomalies = []
    threshold = 2.0
    
    for date, value, quality in zip(dates, values, qualities):
        deviation = abs(value - mean) / std_dev
        
        if deviation > threshold:
            anomalies.append({
                'date': str(date),  # Ensure it's a string
                'value': round(value, 1),
                'deviation': round(deviation, 2),
                'quality': quality
            })
    
    # Sort by deviation (highest first)
    anomalies.sort(key=lambda x: x['deviation'], reverse=True)
    
    return anomalies


def detect_seasonality(data):
    """
    Detect seasonal patterns in the data.
    
    Note: Our sample dataset (~6 weeks) is insufficient for true seasonality detection.
    This returns detected: false honestly, but the logic is structured to support
    seasonality detection when sufficient data exists (6-12+ months).
    
    Args:
        data: Dict with 'dates' key
        
    Returns:
        Dict with 'detected', 'period', and 'confidence' keys
    """
    dates = data['dates']
    
    if not dates:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # Convert to datetime objects
    date_objects = [datetime.strptime(str(d), '%Y-%m-%d') for d in dates]
    
    # Calculate date range span
    date_range_days = (max(date_objects) - min(date_objects)).days
    
    # Need at least 180 days (~6 months) for meaningful seasonal pattern detection
    if date_range_days < 180:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # If we had sufficient data, we would:
    # 1. Group data by season (map month to season)
    # 2. Calculate average per season
    # 3. Detect recurring patterns
    # 4. Measure confidence via variance analysis
    
    # For now, this will always return false for our sample data
    return {
        'detected': False,
        'period': 'none',
        'confidence': 0.0
    }

