/**
 * Token Cache Service
 * Manages AI token data with intelligent caching and request deduplication
 * Prevents excessive API calls by caching data and only refreshing when needed
 */

const TOKEN_CACHE_KEY = "ai_org_token_cache";
const CACHE_DURATION = 30000; // 30 seconds cache duration
const REQUEST_TIMEOUT = 5000; // 5 seconds to wait for ongoing request

class TokenCacheService {
  constructor() {
    this.cache = null;
    this.lastFetchTime = 0;
    this.pendingRequest = null;
    this.listeners = new Set();
    this.tokenUsageLog = []; // Track token usage by operation
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    const now = Date.now();
    return this.cache && now - this.lastFetchTime < CACHE_DURATION;
  }

  /**
   * Get cached token data or fetch new data
   * @param {Function} fetchFn - Function to fetch fresh data
   * @returns {Promise<Object>} Token data
   */
  async getTokenData(fetchFn) {
    // If cache is valid, return cached data immediately
    if (this.isCacheValid()) {
      console.log("[TokenCache] Returning cached data", {
        age: Date.now() - this.lastFetchTime,
        cached: this.cache,
      });
      return this.cache;
    }

    // If a request is already pending, wait for it
    if (this.pendingRequest) {
      console.log("[TokenCache] Waiting for pending request");
      try {
        const result = await Promise.race([
          this.pendingRequest,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Pending request timeout")),
              REQUEST_TIMEOUT,
            ),
          ),
        ]);
        return result;
      } catch (err) {
        console.warn(
          "[TokenCache] Pending request failed, fetching new data",
          err,
        );
      }
    }

    // Fetch fresh data
    console.log("[TokenCache] Fetching fresh token data");
    this.pendingRequest = this._fetchAndCache(fetchFn);

    try {
      const data = await this.pendingRequest;
      return data;
    } finally {
      this.pendingRequest = null;
    }
  }

  /**
   * Internal method to fetch and cache data
   */
  async _fetchAndCache(fetchFn) {
    try {
      const data = await fetchFn();
      this.cache = data;
      this.lastFetchTime = Date.now();
      this.notifyListeners(data);
      return data;
    } catch (error) {
      console.error("[TokenCache] Failed to fetch token data", error);
      throw error;
    }
  }

  /**
   * Manually invalidate cache (e.g., after AI operation)
   */
  invalidateCache() {
    console.log("[TokenCache] Cache invalidated by operation");
    this.lastFetchTime = 0;
  }

  /**
   * Log token usage for an operation
   * @param {string} operation - Name of the AI operation (e.g., 'quiz_generation', 'essay_analysis')
   * @param {number} tokensUsed - Number of tokens consumed
   */
  logTokenUsage(operation, tokensUsed) {
    const entry = {
      operation,
      tokensUsed,
      timestamp: new Date().toISOString(),
      epoch: Date.now(),
    };
    this.tokenUsageLog.push(entry);

    // Keep only last 100 entries
    if (this.tokenUsageLog.length > 100) {
      this.tokenUsageLog.shift();
    }

    console.log("[TokenUsageLog] Operation:", {
      ...entry,
      totalOperations: this.tokenUsageLog.length,
    });
  }

  /**
   * Get token usage log
   */
  getTokenUsageLog() {
    return [...this.tokenUsageLog];
  }

  /**
   * Subscribe to token data updates
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of token data changes
   */
  notifyListeners(data) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error("[TokenCache] Listener error:", error);
      }
    });
  }

  /**
   * Clear all cache and listeners
   */
  clear() {
    this.cache = null;
    this.lastFetchTime = 0;
    this.pendingRequest = null;
    this.tokenUsageLog = [];
    this.listeners.clear();
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo() {
    return {
      isCached: this.isCacheValid(),
      cacheAge: this.isCacheValid() ? Date.now() - this.lastFetchTime : null,
      cachedData: this.cache,
      pendingRequest: !!this.pendingRequest,
      listeners: this.listeners.size,
      usageLog: this.tokenUsageLog,
      cacheDuration: CACHE_DURATION,
    };
  }
}

// Export singleton instance
export const tokenCache = new TokenCacheService();

// Export class for testing
export default TokenCacheService;
