// Centralized API Configuration
// NOTE: All AI operations now go through backend API
// This file is kept for backward compatibility but no longer requires API keys

/**
 * API Configuration Object
 * All AI services now proxy through backend for security and token tracking
 */
const API_CONFIG = {
  // Backend API Configuration (all AI operations)
  backend: {
    baseURL:
      import.meta.env.VITE_API_BASE_URL ||
      'https://testbackend-hcoy.onrender.com',
    endpoints: {
      generateText: '/api/ai/generate-text',
      generateStructured: '/api/ai/generate-structured',
      generateImage: '/api/ai/generate-image',
      generateCourseOutline: '/api/ai/generate-course-outline',
      usageDashboard: '/api/usage/dashboard',
    },
  },

  // Legacy OpenAI Configuration (deprecated - use backend instead)
  openai: {
    deprecated: true,
    message: 'OpenAI now accessed via backend API for security',
    baseURL: 'https://api.openai.com/v1',
    apiKey: '', // Not used - backend handles this
    models: {
      text: 'gpt-4o-mini',
      textAdvanced: 'gpt-4',
      image: 'dall-e-3',
    },
  },
};

/**
 * Get backend API configuration
 * @returns {Object} Backend API config
 */
export const getBackendConfig = () => {
  return {
    baseURL: API_CONFIG.backend.baseURL,
    endpoints: API_CONFIG.backend.endpoints,
  };
};

/**
 * Get OpenAI configuration (deprecated)
 * @deprecated Use getBackendConfig() instead - all AI operations go through backend
 * @returns {Object} OpenAI config (models only, no API key)
 */
export const getOpenAIConfig = () => {
  console.warn('⚠️ getOpenAIConfig() is deprecated. Use backend API instead.');
  return {
    apiKey: '', // Not used - backend handles authentication
    baseURL: API_CONFIG.openai.baseURL,
    models: API_CONFIG.openai.models,
    deprecated: true,
  };
};

/**
 * Check if backend API is configured
 * @returns {boolean} Whether backend is configured
 */
export const hasValidBackend = () => {
  return Boolean(API_CONFIG.backend.baseURL);
};

/**
 * Check if a service has valid API keys (deprecated)
 * @deprecated All AI operations now go through backend
 * @param {string} service - Service name
 * @returns {boolean} Always returns false for client-side services
 */
export const hasValidApiKey = service => {
  console.warn(
    `⚠️ hasValidApiKey('${service}') is deprecated. All AI operations go through backend.`
  );
  return false; // No client-side API keys used anymore
};

/**
 * Get all available API services with their status
 * @returns {Object} Service availability status
 */
export const getServiceStatus = () => {
  return {
    backend: {
      available: hasValidBackend(),
      baseURL: API_CONFIG.backend.baseURL,
      endpoints: API_CONFIG.backend.endpoints,
      message: 'All AI operations proxied through backend for security',
    },
    openai: {
      deprecated: true,
      available: false,
      message: 'Use backend API instead - no client-side OpenAI key needed',
      models: API_CONFIG.openai.models,
    },
  };
};

/**
 * Validate API key format (deprecated)
 * @deprecated No client-side API keys used - backend handles authentication
 * @param {string} key - API key to validate
 * @param {string} service - Service name
 * @returns {boolean} Always returns false
 */
export const validateApiKey = (key, service) => {
  console.warn(
    '⚠️ validateApiKey() is deprecated. No client-side API keys needed.'
  );
  return false;
};

/**
 * Set API key for a service (deprecated)
 * @deprecated No client-side API keys used - configure backend instead
 * @param {string} service - Service name
 * @param {string} key - API key
 */
export const setApiKey = (service, key) => {
  throw new Error(
    'Client-side API keys are no longer supported. ' +
      'All AI operations go through backend API. ' +
      'Configure API keys on your backend server instead.'
  );
};

// Export the main configuration object for direct access if needed
export default API_CONFIG;
