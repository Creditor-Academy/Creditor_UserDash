// API Migration Helper - Utility to help migrate to enhanced API client
import api from '../services/apiClient';

/**
 * Enhanced API wrapper with automatic error handling and user-friendly messages
 * Use this to gradually migrate your existing API calls
 */
export class ApiHelper {
  /**
   * Enhanced GET request with automatic retry and error handling
   */
  static async get(url, options = {}) {
    try {
      console.log(`[ApiHelper] GET ${url}`);
      const response = await api.safeGet(url, options);
      return response.data;
    } catch (error) {
      console.error(
        `[ApiHelper] GET ${url} failed:`,
        error.userMessage || error.message
      );

      // Return structured error for components to handle
      throw {
        message: error.userMessage || error.message,
        status: error.response?.status,
        originalError: error,
        userFriendly: true,
      };
    }
  }

  /**
   * Enhanced POST request with automatic retry and error handling
   */
  static async post(url, data, options = {}) {
    try {
      console.log(`[ApiHelper] POST ${url}`);
      const response = await api.safePost(url, data, options);
      return response.data;
    } catch (error) {
      console.error(
        `[ApiHelper] POST ${url} failed:`,
        error.userMessage || error.message
      );

      throw {
        message: error.userMessage || error.message,
        status: error.response?.status,
        originalError: error,
        userFriendly: true,
      };
    }
  }

  /**
   * Enhanced PUT request with automatic retry and error handling
   */
  static async put(url, data, options = {}) {
    try {
      console.log(`[ApiHelper] PUT ${url}`);
      const response = await api.safePut(url, data, options);
      return response.data;
    } catch (error) {
      console.error(
        `[ApiHelper] PUT ${url} failed:`,
        error.userMessage || error.message
      );

      throw {
        message: error.userMessage || error.message,
        status: error.response?.status,
        originalError: error,
        userFriendly: true,
      };
    }
  }

  /**
   * Enhanced DELETE request with automatic retry and error handling
   */
  static async delete(url, options = {}) {
    try {
      console.log(`[ApiHelper] DELETE ${url}`);
      const response = await api.safeDelete(url, options);
      return response.data;
    } catch (error) {
      console.error(
        `[ApiHelper] DELETE ${url} failed:`,
        error.userMessage || error.message
      );

      throw {
        message: error.userMessage || error.message,
        status: error.response?.status,
        originalError: error,
        userFriendly: true,
      };
    }
  }

  /**
   * Get API client status and health
   */
  static getStatus() {
    return api.getStatus();
  }

  /**
   * Clear rate limiting (useful for development)
   */
  static clearRateLimit() {
    return api.clearRateLimit();
  }

  /**
   * Set custom rate limits
   */
  static setRateLimit(type, max, window) {
    return api.setRateLimit(type, max, window);
  }
}

/**
 * Migration utility to help update existing service files
 * Use this to gradually replace direct axios calls with enhanced API client
 */
export const migrationGuide = {
  // Old pattern
  oldPattern: `
    // OLD WAY (less reliable)
    const response = await api.get('/api/courses');
    return response.data;
  `,

  // New pattern
  newPattern: `
    // NEW WAY (more reliable)
    import { ApiHelper } from '../utils/apiMigrationHelper';
    
    try {
      const data = await ApiHelper.get('/api/courses');
      return data;
    } catch (error) {
      // error.message is already user-friendly
      toast.error(error.message);
      throw error;
    }
  `,

  // Benefits
  benefits: [
    '✅ Automatic retry on network/server errors',
    '✅ Rate limiting protection',
    '✅ User-friendly error messages',
    '✅ Request tracking and logging',
    '✅ Timeout handling (30s)',
    '✅ Exponential backoff retry strategy',
    '✅ Better authentication handling',
  ],
};

export default ApiHelper;
