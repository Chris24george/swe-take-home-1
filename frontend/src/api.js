/**
 * API service module for making requests to the backend
 */

const API_BASE_URL = '/api/v1';

/**
 * Helper function to build query parameters from filters object
 * Converts camelCase to snake_case for API compatibility
 * @param {Object} filters - Filter object with camelCase keys
 * @returns {URLSearchParams} - Query parameters ready for URL
 */
const buildQueryParams = (filters) => {
  const params = new URLSearchParams();
  
  // Map camelCase frontend keys to snake_case backend keys
  if (filters.locationId) params.append('location_id', filters.locationId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.metric) params.append('metric', filters.metric);
  if (filters.qualityThreshold) params.append('quality_threshold', filters.qualityThreshold);
  
  // Add pagination parameters
  if (filters.page) params.append('page', filters.page);
  if (filters.pageSize) params.append('page_size', filters.pageSize);
  
  return params;
};

/**
 * Fetch climate data with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - API response with data property
 */
export const getClimateData = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const queryString = params.toString();
    const url = `${API_BASE_URL}/climate${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch all available locations
 * @returns {Promise} - API response with data property
 */
export const getLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch all available metrics
 * @returns {Promise} - API response with data property
 */
export const getMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch climate summary statistics with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - API response with data property
 */
export const getClimateSummary = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const queryString = params.toString();
    const url = `${API_BASE_URL}/summary${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetch trend analysis with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - API response with data property
 */
export const getTrends = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const queryString = params.toString();
    const url = `${API_BASE_URL}/trends${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};