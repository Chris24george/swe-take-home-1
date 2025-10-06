/**
 * API service module for making requests to the backend
 */

const API_BASE_URL = '/api/v1';

/**
 * Fetch climate data with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - API response
 */
export const getClimateData = async (filters = {}) => {
  try {
    // TODO: Implement API call with filters
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
 * @returns {Promise} - API response
 */
export const getClimateSummary = async (filters = {}) => {
  try {
    // TODO: Implement API call with filters
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};