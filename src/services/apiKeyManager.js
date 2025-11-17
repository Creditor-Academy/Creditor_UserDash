// API Key Management Service - OpenAI Only
// Simplified to handle only OpenAI API keys

/**
 * OpenAI API Key Manager
 * Provides OpenAI API key management with multiple fallback sources
 */
class ApiKeyManager {
  constructor() {
    this.keyCache = new Map();
    this.fallbackKey = null; // Can be set if needed
  }

  /**
   * Get OpenAI API key with multiple fallback sources
   * @returns {string|null} API key or null
   */
  getApiKey() {
    // Check cache first
    if (this.keyCache.has('openai')) {
      return this.keyCache.get('openai');
    }

    let apiKey = null;

    // Try multiple sources in priority order
    const sources = [
      () => import.meta.env.VITE_OPENAI_API_KEY,
      () => localStorage.getItem('openai_api_key'),
      () => this.fallbackKey,
    ];

    // Try each source
    for (const source of sources) {
      try {
        const key = source();
        if (this.isValidKey(key)) {
          apiKey = key;
          break;
        }
      } catch (error) {
        // Continue to next source
      }
    }

    // Cache the result (even if null)
    this.keyCache.set('openai', apiKey);

    return apiKey;
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
   * Check OpenAI service availability
   * @returns {Object} Service status
   */
  getServiceStatus() {
    const key = this.getApiKey();

    return {
      service: 'openai',
      available: key !== null,
      hasValidKey: key !== null,
      status: key !== null ? 'ready' : 'no_key',
    };
  }

  /**
   * Set OpenAI API key in localStorage
   * @param {string} key - API key
   */
  setApiKey(key) {
    if (!this.isValidKey(key)) {
      throw new Error('Invalid OpenAI API key format');
    }

    localStorage.setItem('openai_api_key', key);

    // Clear cache to force refresh
    this.clearCache();

    console.log('✅ OpenAI API key saved to localStorage');
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
      const key = prompt('Please enter your OpenAI API key:');

      if (key && this.isValidKey(key)) {
        try {
          this.setApiKey(key);
          resolve(key);
        } catch (error) {
          console.warn('Failed to save OpenAI API key:', error.message);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Initialize API key with user prompt if needed
   * @returns {Promise<Object>} Initialization result
   */
  async initializeKeys() {
    const status = this.getServiceStatus();

    if (status.available) {
      console.log('✅ OpenAI API key is configured and ready');
      return { success: true, status };
    }

    console.log('⚠️ OpenAI API key not configured.');

    // In development, optionally prompt for key
    if (import.meta.env.DEV) {
      const shouldPrompt = confirm(
        'OpenAI API key not found. Would you like to configure it now?'
      );

      if (shouldPrompt) {
        await this.promptForApiKey();
        return { success: true, status: this.getServiceStatus() };
      }
    }

    return { success: false, status, offline: true };
  }
}

// Create and export singleton instance
const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;

// Export individual methods for convenience
export const { getApiKey, getServiceStatus, setApiKey, initializeKeys } =
  apiKeyManager;
