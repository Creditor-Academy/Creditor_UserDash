/**
 * Request Optimization Service
 * Implements request deduplication and concurrent API call limiting
 *
 * Features:
 * - Request deduplication (cache identical requests)
 * - Concurrent call limiting (max parallel API calls)
 * - Request queuing (FIFO for fair distribution)
 * - Automatic cache expiration
 * - Memory-efficient caching
 * - Performance metrics
 */

class RequestOptimizationService {
  constructor(options = {}) {
    // Configuration
    this.maxConcurrentCalls = options.maxConcurrentCalls || 5;
    this.cacheExpiration = options.cacheExpiration || 5 * 60 * 1000; // 5 minutes
    this.enableMetrics = options.enableMetrics !== false;
    this.enableDeduplication = options.enableDeduplication !== false;
    this.enableQueueing = options.enableQueueing !== false;

    // State
    this.requestCache = new Map(); // { key: { result, timestamp, hits } }
    this.requestQueue = []; // Queue of pending requests
    this.activeRequests = new Map(); // { key: Promise }
    this.activeCalls = 0; // Current concurrent calls
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      deduplicatedRequests: 0,
      queuedRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
    };
  }

  /**
   * Generate cache key from request parameters
   */
  generateCacheKey(namespace, params) {
    const paramString = JSON.stringify(params);
    return `${namespace}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Check if cache entry is still valid
   */
  isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    const age = Date.now() - cacheEntry.timestamp;
    return age < this.cacheExpiration;
  }

  /**
   * Execute request with deduplication and concurrent limiting
   *
   * @param {string} namespace - Request namespace (e.g., 'openai-text', 'dalle-image')
   * @param {Object} params - Request parameters
   * @param {Function} requestFn - Async function to execute
   * @param {Object} options - Execution options
   * @returns {Promise} Request result
   */
  async executeRequest(namespace, params, requestFn, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(namespace, params);

    // Track metrics
    if (this.enableMetrics) {
      this.metrics.totalRequests++;
    }

    try {
      // 1. Check cache first
      if (this.enableDeduplication) {
        const cachedResult = this.requestCache.get(cacheKey);
        if (this.isCacheValid(cachedResult)) {
          console.log(`✅ Cache hit for ${namespace}`);
          if (this.enableMetrics) {
            this.metrics.cacheHits++;
          }
          cachedResult.hits++;
          return cachedResult.result;
        }
      }

      // 2. Check if request is already in flight (deduplication)
      if (this.enableDeduplication && this.activeRequests.has(cacheKey)) {
        console.log(`🔄 Deduplicating request for ${namespace}`);
        if (this.enableMetrics) {
          this.metrics.deduplicatedRequests++;
        }
        return await this.activeRequests.get(cacheKey);
      }

      // 3. Wait for available concurrent slot
      if (this.enableQueueing) {
        await this.waitForAvailableSlot();
      }

      // 4. Execute request
      console.log(
        `📤 Executing ${namespace} (${this.activeCalls + 1}/${this.maxConcurrentCalls} concurrent)`
      );

      this.activeCalls++;
      const requestPromise = this.executeWithTimeout(
        requestFn,
        options.timeout || 60000
      );

      // Store in active requests for deduplication
      if (this.enableDeduplication) {
        this.activeRequests.set(cacheKey, requestPromise);
      }

      const result = await requestPromise;

      // 5. Cache successful result
      if (this.enableDeduplication) {
        this.requestCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
          hits: 1,
        });
      }

      // Track metrics
      if (this.enableMetrics) {
        this.metrics.cacheMisses++;
        const responseTime = Date.now() - startTime;
        this.metrics.responseTimes.push(responseTime);
        this.metrics.averageResponseTime =
          this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
          this.metrics.responseTimes.length;
      }

      return result;
    } catch (error) {
      if (this.enableMetrics) {
        this.metrics.failedRequests++;
      }
      throw error;
    } finally {
      this.activeCalls--;
      if (this.enableDeduplication) {
        this.activeRequests.delete(cacheKey);
      }
      this.processQueue();
    }
  }

  /**
   * Wait for available concurrent slot
   */
  async waitForAvailableSlot() {
    while (this.activeCalls >= this.maxConcurrentCalls) {
      await new Promise(resolve => {
        this.requestQueue.push(resolve);
      });
    }
  }

  /**
   * Process queued requests
   */
  processQueue() {
    if (
      this.requestQueue.length > 0 &&
      this.activeCalls < this.maxConcurrentCalls
    ) {
      const resolve = this.requestQueue.shift();
      resolve();
    }
  }

  /**
   * Execute request with timeout
   */
  executeWithTimeout(requestFn, timeout) {
    return Promise.race([
      requestFn(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  }

  /**
   * Batch execute multiple requests with smart concurrency
   *
   * @param {Array} requests - Array of { namespace, params, requestFn }
   * @param {Object} options - Batch options
   * @returns {Promise<Array>} Results array
   */
  async executeBatch(requests, options = {}) {
    const batchSize = options.batchSize || this.maxConcurrentCalls;
    const results = [];

    console.log(
      `📦 Executing batch of ${requests.length} requests (batch size: ${batchSize})`
    );

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req =>
          this.executeRequest(req.namespace, req.params, req.requestFn, options)
        )
      );
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < requests.length && options.delayBetweenBatches) {
        await this.delay(options.delayBetweenBatches);
      }
    }

    return results;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache(namespace = null) {
    if (namespace) {
      for (const [key] of this.requestCache) {
        if (key.startsWith(namespace)) {
          this.requestCache.delete(key);
        }
      }
      console.log(`🧹 Cleared cache for namespace: ${namespace}`);
    } else {
      this.requestCache.clear();
      console.log('🧹 Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      cacheSize: this.requestCache.size,
      cacheEntries: [],
      activeCalls: this.activeCalls,
      queuedRequests: this.requestQueue.length,
    };

    for (const [key, entry] of this.requestCache) {
      stats.cacheEntries.push({
        key: key.substring(0, 50) + '...',
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
        valid: this.isCacheValid(entry),
      });
    }

    return stats;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      hitRate:
        this.metrics.totalRequests > 0
          ? (
              (this.metrics.cacheHits / this.metrics.totalRequests) *
              100
            ).toFixed(2) + '%'
          : '0%',
      deduplicationRate:
        this.metrics.totalRequests > 0
          ? (
              (this.metrics.deduplicatedRequests / this.metrics.totalRequests) *
              100
            ).toFixed(2) + '%'
          : '0%',
      failureRate:
        this.metrics.totalRequests > 0
          ? (
              (this.metrics.failedRequests / this.metrics.totalRequests) *
              100
            ).toFixed(2) + '%'
          : '0%',
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      deduplicatedRequests: 0,
      queuedRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
    };
    console.log('📊 Metrics reset');
  }

  /**
   * Configure service
   */
  configure(options) {
    if (options.maxConcurrentCalls !== undefined) {
      this.maxConcurrentCalls = options.maxConcurrentCalls;
    }
    if (options.cacheExpiration !== undefined) {
      this.cacheExpiration = options.cacheExpiration;
    }
    if (options.enableMetrics !== undefined) {
      this.enableMetrics = options.enableMetrics;
    }
    if (options.enableDeduplication !== undefined) {
      this.enableDeduplication = options.enableDeduplication;
    }
    if (options.enableQueueing !== undefined) {
      this.enableQueueing = options.enableQueueing;
    }
    console.log('⚙️ Request optimization service configured:', {
      maxConcurrentCalls: this.maxConcurrentCalls,
      cacheExpiration: this.cacheExpiration,
      enableMetrics: this.enableMetrics,
      enableDeduplication: this.enableDeduplication,
      enableQueueing: this.enableQueueing,
    });
  }
}

// Create singleton instance
const requestOptimizationService = new RequestOptimizationService({
  maxConcurrentCalls: 5, // Max 5 concurrent API calls
  cacheExpiration: 5 * 60 * 1000, // 5 minute cache
  enableMetrics: true,
  enableDeduplication: true,
  enableQueueing: true,
});

export default requestOptimizationService;
