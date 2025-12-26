import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://100.120.80.117:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000, // 60 seconds for image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      console.error('API No Response:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Upload receipt image and get extracted data
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Receipt data
 */
export const uploadReceipt = async (imageBase64String) => {
  // Changed "image" to "imageBase64" to match receiptController.js line 10
  const response = await api.post('/receipts/upload', { imageBase64: imageBase64String });
  return response.data;
};

/**
 * Get all receipts with optional filters
 * @param {Object} filters - Query parameters
 * @returns {Promise<Array>} List of receipts
 */
export const getReceipts = async (filters = {}) => {
  const response = await api.get('/receipts', { params: filters });
  return response.data;
};

/**
 * Get single receipt by ID
 * @param {string} id - Receipt ID
 * @returns {Promise<Object>} Receipt data
 */
export const getReceiptById = async (id) => {
  const response = await api.get(`/receipts/${id}`);
  return response.data;
};

/**
 * Update receipt
 * @param {string} id - Receipt ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated receipt
 */
export const updateReceipt = async (id, updates) => {
  const response = await api.put(`/receipts/${id}`, updates);
  return response.data;
};

/**
 * Delete receipt
 * @param {string} id - Receipt ID
 * @returns {Promise<Object>} Success message
 */
export const deleteReceipt = async (id) => {
  const response = await api.delete(`/receipts/${id}`);
  return response.data;
};

/**
 * Get spending statistics
 * @param {Object} filters - Date range filters
 * @returns {Promise<Object>} Statistics data
 */
export const getStats = async (filters = {}) => {
  const response = await api.get('/receipts/stats', { params: filters });
  return response.data;
};

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};

export default api;