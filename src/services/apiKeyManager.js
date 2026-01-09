// API Key Management Service - DEPRECATED
// NOTE: This service is deprecated. All AI operations now go through backend API.
// No client-side API keys are needed or used.
// This file is kept for backward compatibility only.

/**
 * OpenAI API Key Manager (DEPRECATED)
 * @deprecated All AI operations now go through backend API - no client-side keys needed
 *
 * IMPORTANT: This manager is no longer used. All AI services proxy through:
 * - backendAIService.js -> Backend API endpoints
 * - Backend handles OpenAI authentication securely
 * - No API keys stored or exposed on frontend
 */
class ApiKeyManager {
  constructor() {
    this.keyCache = new Map();
    this.fallbackKey = null; // Can be set if needed
  }

  /**
   * Get OpenAI API key with multiple fallback sources (DEPRECATED)
   * @deprecated No longer used - all AI operations go through backend
   * @returns {string|null} Always returns null
   */
  getApiKey() {
    console.warn(
      '⚠️ apiKeyManager.getApiKey() is deprecated.\n' +
        'All AI operations now go through backend API.\n' +
        'No client-side AI provider keys are needed or used.'
    );
    return null; // Always return null - backend handles authentication
    // DEPRECATED: Old implementation disabled
    // All code below is no longer executed
  }

  /**
   * Validate if a key looks valid
   * @param {string} key - API key to validate
   * @returns {boolean} Whether key appears valid
   */
  isValidKey(key) {
    if (!key || typeof key !== 'string') {
      return false;
    }

    const trimmed = key.trim();

    // Check for placeholder values
    const placeholders = [
      'your_api_key_here',
      'your_openai_api_key_here',
      'sk-placeholder',
      'test_key',
      'demo_key',
      '',
    ];

    if (placeholders.includes(trimmed.toLowerCase())) {
      return false;
    }

    // Basic format validation - OpenAI keys typically start with 'sk-'
    if (trimmed.length < 20) {
      return false;
    }

    return true;
  }

  /**
   * Check OpenAI service availability (DEPRECATED)
   * @deprecated Backend API is always available (if backend is running)
   * @returns {Object} Service status
   */
  getServiceStatus() {
    console.warn(
      '⚠️ apiKeyManager.getServiceStatus() is deprecated. Check backend API status instead.'
    );

    return {
      service: 'backend-proxy',
      available: true,
      deprecated: true,
      message: 'All AI operations go through backend API',
      status: 'using_backend',
    };
  }

  /**
   * Set OpenAI API key in localStorage (DEPRECATED)
   * @deprecated Client-side API keys are no longer used
   * @param {string} key - API key
   */
  setApiKey(key) {
    throw new Error(
      'Setting client-side API keys is no longer supported.\n' +
        'All AI operations go through backend API.\n' +
        'Configure provider keys on your backend server instead.'
    );
  }

  /**
   * Clear cached key
   */
  clearCache() {
    this.keyCache.clear();
  }

  /**
   * Prompt user for API key (for development/testing)
   * @returns {Promise<string|null>} API key or null
   */
  async promptForApiKey() {
    return new Promise(resolve => {
      const key = prompt('Please enter your AI provider API key:');

      if (key && this.isValidKey(key)) {
        try {
          this.setApiKey(key);
          resolve(key);
        } catch (error) {
          console.warn('Failed to save API key:', error.message);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Initialize API key with user prompt if needed (DEPRECATED)
   * @deprecated No initialization needed - backend handles everything
   * @returns {Promise<Object>} Initialization result
   */
  async initializeKeys() {
    console.log(
      '✅ AI services ready - using backend API proxy\n' +
        'No client-side API key configuration needed.'
    );

    return {
      success: true,
      status: this.getServiceStatus(),
      message: 'Backend API handles all AI operations',
    };
  }
}

// Create and export singleton instance
const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;

// Export individual methods for convenience
export const { getApiKey, getServiceStatus, setApiKey, initializeKeys } =
  apiKeyManager;
