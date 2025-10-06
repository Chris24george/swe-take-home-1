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
    
    Seasonality is detected when:
    1. Data spans at least 2 years (to detect repeating patterns)
    2. At least 3 seasons have sufficient data points
    3. Between-season variance > within-season variance (seasons differ more than noise)
    4. Per-season trends calculated if 3+ years available for that season
    
    Note: Our sample dataset (single year, 2025 only) is insufficient.
    This will return detected=false honestly for insufficient data,
    but implements full logic for when sufficient multi-year data exists.
    
    Args:
        data: Dict with 'dates' and 'values' keys
        
    Returns:
        Dict with 'detected', 'period', 'confidence', and optionally 'pattern' keys
    """
    from collections import defaultdict
    
    dates = data['dates']
    values = data['values']
    
    if not dates or not values:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # Convert to datetime objects
    date_objects = [datetime.strptime(str(d), '%Y-%m-%d') for d in dates]
    
    # Check if we have multiple years of data
    # Need at least 2 years to detect repeating seasonal patterns
    years_present = set(d.year for d in date_objects)
    if len(years_present) < 2:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # Group data by season and year
    # seasonal_data[season][year] = [values...]
    seasonal_yearly_data = defaultdict(lambda: defaultdict(list))
    
    for date_obj, value in zip(date_objects, values):
        year = date_obj.year
        month = date_obj.month
        
        # Map month to season
        if month in [12, 1, 2]:
            season = 'winter'
        elif month in [3, 4, 5]:
            season = 'spring'
        elif month in [6, 7, 8]:
            season = 'summer'
        else:  # 9, 10, 11
            season = 'fall'
        
        seasonal_yearly_data[season][year].append(value)
    
    # Calculate average for each season across all years
    seasonal_averages = {}
    seasonal_all_values = defaultdict(list)  # For within-season variance
    
    for season in ['winter', 'spring', 'summer', 'fall']:
        if season in seasonal_yearly_data:
            # Collect all values for this season across all years
            all_values = []
            for year_values in seasonal_yearly_data[season].values():
                all_values.extend(year_values)
            
            if len(all_values) >= 2:
                seasonal_averages[season] = float(np.mean(all_values))
                seasonal_all_values[season] = all_values
    
    # Need at least 3 seasons with data
    if len(seasonal_averages) < 3:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # Calculate between-season variance (how different are seasons from each other?)
    avg_list = list(seasonal_averages.values())
    between_variance = float(np.var(avg_list))
    
    # Calculate within-season variance (how consistent is each season?)
    within_variances = []
    for season, all_values in seasonal_all_values.items():
        if len(all_values) >= 2:
            within_variances.append(float(np.var(all_values)))
    
    avg_within_variance = float(np.mean(within_variances)) if within_variances else 0.0
    
    # Determine if seasonality is detected
    # Seasons must differ significantly more than noise within seasons
    if avg_within_variance == 0:
        # All seasons are perfectly consistent → strong seasonality
        detected = between_variance > 0  # As long as seasons differ at all
        confidence = 1.0 if detected else 0.0
    elif between_variance > avg_within_variance * 2:
        detected = True
        # Confidence based on ratio (higher = stronger pattern)
        confidence = min(1.0, between_variance / (avg_within_variance * 10))
    else:
        detected = False
        confidence = 0.0
    
    if not detected:
        return {
            'detected': False,
            'period': 'none',
            'confidence': 0.0
        }
    
    # Build pattern with per-season trends
    pattern = {}
    
    for season in ['winter', 'spring', 'summer', 'fall']:
        if season not in seasonal_averages:
            continue
        
        # Calculate trend for this season across years
        season_yearly_avgs = []
        season_years = []
        
        for year in sorted(seasonal_yearly_data[season].keys()):
            year_values = seasonal_yearly_data[season][year]
            if year_values:
                season_yearly_avgs.append(np.mean(year_values))
                season_years.append(year)
        
        # Determine per-season trend (need at least 3 years for meaningful trend)
        if len(season_yearly_avgs) >= 3:
            # Linear regression on yearly averages
            coefficients = np.polyfit(season_years, season_yearly_avgs, 1)
            slope = coefficients[0]
            
            # Classify trend
            slope_threshold = 0.1
            if abs(slope) < slope_threshold:
                trend = 'stable'
            elif slope > 0:
                trend = 'increasing'
            else:
                trend = 'decreasing'
        else:
            # Not enough years to determine trend
            trend = 'stable'
        
        pattern[season] = {
            'avg': round(seasonal_averages[season], 1),
            'trend': trend
        }
    
    return {
        'detected': True,
        'period': 'yearly',
        'confidence': round(confidence, 2),
        'pattern': pattern
    }

