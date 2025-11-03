// API Key Management Service
// Handles API key detection, validation, and fallback mechanisms

/**
 * Enhanced API Key Manager
 * Provides robust API key management with multiple fallback sources
 */
class ApiKeyManager {
  constructor() {
    this.keyCache = new Map();
    this.keyValidation = new Map();
    this.fallbackKeys = {
      // Demo/test keys for development (limited functionality)
      openai: null, // Will use rate-limited free tier if available
      huggingface: null,
      deepai: null,
    };
  }

  /**
   * Get API key with multiple fallback sources
   * @param {string} service - Service name (openai, huggingface, deepai)
   * @param {number} keyIndex - Key index for multi-key services (0-3)
   * @returns {string|null} API key or null
   */
  getApiKey(service, keyIndex = 0) {
    const cacheKey = `${service}_${keyIndex}`;

    // Check cache first
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey);
    }

    let apiKey = null;

    // Define key sources in priority order
    const keySources = this.getKeySources(service, keyIndex);

    // Try each source
    for (const source of keySources) {
      const key = this.getKeyFromSource(source);
      if (this.isValidKey(key)) {
        apiKey = key;
        break;
      }
    }

    // Cache the result (even if null)
    this.keyCache.set(cacheKey, apiKey);

    return apiKey;
  }

  /**
   * Get key sources for a service
   * @param {string} service - Service name
   * @param {number} keyIndex - Key index
   * @returns {Array} Array of key sources
   */
  getKeySources(service, keyIndex) {
    const sources = [];

    switch (service) {
      case 'openai':
        sources.push(
          () => import.meta.env.VITE_OPENAI_API_KEY,
          () => import.meta.env.OPENAI_API_KEY,
          () => localStorage.getItem('openai_api_key'),
          () => this.fallbackKeys.openai
        );
        break;

      // bytez case removed - dependency not available

      case 'huggingface':
        const hfKeys = [
          'VITE_HUGGINGFACE_API_KEY',
          'VITE_HUGGINGFACE_API_KEY_2',
          'VITE_HF_API_KEY',
          'VITE_HF_API_KEY_2',
          'HF_API_KEY',
          'HUGGINGFACE_API_KEY',
        ];

        if (keyIndex < hfKeys.length) {
          const envKey = hfKeys[keyIndex];
          sources.push(
            () => import.meta.env[envKey],
            () => localStorage.getItem(`huggingface_api_key_${keyIndex + 1}`),
            () => localStorage.getItem('huggingface_api_key')
          );
        }

        sources.push(() => this.fallbackKeys.huggingface);
        break;

      case 'deepai':
        sources.push(
          () => import.meta.env.VITE_DEEPAI_API_KEY,
          () => import.meta.env.DEEPAI_API_KEY,
          () => localStorage.getItem('deepai_api_key'),
          () => this.fallbackKeys.deepai
        );
        break;
    }

    return sources;
  }

  /**
   * Get key from a source function
   * @param {Function} sourceFunc - Source function
   * @returns {string|null} API key or null
   */
  getKeyFromSource(sourceFunc) {
    try {
      const key = sourceFunc();
      return key && typeof key === 'string' ? key.trim() : null;
    } catch (error) {
      return null;
    }
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
      'your_ope********here',
      'sk-placeholder',
      'hf_placeholder',
      'test_key',
      'demo_key',
      '',
    ];

    if (placeholders.includes(trimmed.toLowerCase())) {
      return false;
    }

    // Basic format validation
    if (trimmed.length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Get all available API keys for a service
   * @param {string} service - Service name
   * @returns {Array} Array of valid API keys
   */
  getAllKeys(service) {
    const keys = [];

    if (service === 'huggingface') {
      // For HuggingFace, try to get up to 6 keys (multiple accounts)
      for (let i = 0; i < 6; i++) {
        const key = this.getApiKey(service, i);
        if (key) {
          keys.push(key);
        }
      }
    } else {
      const key = this.getApiKey(service);
      if (key) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Check service availability
   * @param {string} service - Service name
   * @returns {Object} Service status
   */
  getServiceStatus(service) {
    const keys = this.getAllKeys(service);

    return {
      service: service,
      available: keys.length > 0,
      keyCount: keys.length,
      hasValidKeys: keys.length > 0,
      status: keys.length > 0 ? 'ready' : 'no_keys',
    };
  }

  /**
   * Get overall API status
   * @returns {Object} Overall status
   */
  getOverallStatus() {
    const services = ['openai', 'huggingface', 'deepai'];
    const status = {};
    let availableServices = 0;

    for (const service of services) {
      status[service] = this.getServiceStatus(service);
      if (status[service].available) {
        availableServices++;
      }
    }

    return {
      services: status,
      availableServices: availableServices,
      totalServices: services.length,
      hasAnyKeys: availableServices > 0,
      readyForGeneration: availableServices > 0,
    };
  }

  /**
   * Set API key in localStorage
   * @param {string} service - Service name
   * @param {string} key - API key
   * @param {number} keyIndex - Key index for multi-key services
   */
  setApiKey(service, key, keyIndex = 0) {
    if (!this.isValidKey(key)) {
      throw new Error('Invalid API key format');
    }

    let storageKey;
    storageKey = `${service}_api_key`;

    localStorage.setItem(storageKey, key);

    // Clear cache to force refresh
    this.clearCache(service);

    console.log(`✅ ${service} API key ${keyIndex + 1} saved to localStorage`);
  }

  /**
   * Clear cached keys for a service
   * @param {string} service - Service name
   */
  clearCache(service) {
    const keysToRemove = [];

    for (const [key] of this.keyCache) {
      if (key.startsWith(`${service}_`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.keyCache.delete(key));
  }

  /**
   * Prompt user for API key (for development/testing)
   * @param {string} service - Service name
   * @returns {Promise<string|null>} API key or null
   */
  async promptForApiKey(service) {
    return new Promise(resolve => {
      const key = prompt(
        `Please enter your ${service.toUpperCase()} API key (optional for testing):`
      );

      if (key && this.isValidKey(key)) {
        try {
          this.setApiKey(service, key);
          resolve(key);
        } catch (error) {
          console.warn(`Failed to save ${service} API key:`, error.message);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Initialize API keys with user prompts if needed
   * @returns {Promise<Object>} Initialization result
   */
  async initializeKeys() {
    const status = this.getOverallStatus();

    if (status.hasAnyKeys) {
      console.log('✅ API keys are configured and ready');
      return { success: true, status };
    }

    console.log(
      '⚠️ No API keys configured. Course generation will use fallback methods.'
    );

    // In development, optionally prompt for keys
    if (import.meta.env.DEV) {
      const shouldPrompt = confirm(
        'No API keys found. Would you like to configure them now? (Cancel to use offline mode)'
      );

      if (shouldPrompt) {
        // Prompt for the most important keys
        await this.promptForApiKey('openai');
        // bytez prompting removed

        return { success: true, status: this.getOverallStatus() };
      }
    }

    return { success: true, status, offline: true };
  }
}

// Create and export singleton instance
const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;

// Export individual methods for convenience
export const {
  getApiKey,
  getAllKeys,
  getServiceStatus,
  getOverallStatus,
  setApiKey,
  initializeKeys,
} = apiKeyManager;
