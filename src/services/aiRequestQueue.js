/**
 * Global AI Request Queue Service
 * Implements request throttling and exponential backoff to prevent rate limiting
 *
 * Strategy:
 * - Queue all AI requests globally
 * - Execute max 1 request per second (configurable)
 * - On 429 error, exponentially backoff and retry entire queue
 * - Fallback data available for all request types
 */

class AIRequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.isRateLimited = false;
    this.rateLimitResetTime = 0;

    // Configuration
    this.minDelayBetweenRequests = 3000; // 3 seconds minimum between requests (increased from 2s)
    this.maxRetries = 3;
    this.exponentialBackoffMultiplier = 2;
    this.initialBackoffDelay = 90000; // 90 seconds for rate limit recovery (increased from 60s)

    // Metrics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      fallbacksUsed: 0,
    };
  }

  /**
   * Queue an AI request
   * @param {Function} requestFn - Async function that makes the AI request
   * @param {Function} fallbackFn - Function that returns fallback data if request fails
   * @param {string} requestId - Unique identifier for this request
   * @returns {Promise} Result of the request or fallback
   */
  async enqueueRequest(requestFn, fallbackFn, requestId = null) {
    return new Promise((resolve, reject) => {
      const request = {
        id: requestId || `req-${Date.now()}-${Math.random()}`,
        requestFn,
        fallbackFn,
        resolve,
        reject,
        retries: 0,
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  /**
   * Process the request queue with proper backoff and retry handling
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        // Check if we're rate limited and wait if necessary
        if (this.isRateLimited && Date.now() < this.rateLimitResetTime) {
          const waitTime = this.rateLimitResetTime - Date.now();
          console.warn(
            `⏳ Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s before retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          this.isRateLimited = false;
          // Continue to process next request after backoff
        }

        const request = this.queue.shift();

        try {
          console.log(`📤 Processing request: ${request.id}`);
          this.stats.totalRequests++;

          // Execute the AI request
          const result = await request.requestFn();

          console.log(`✅ Request successful: ${request.id}`);
          this.stats.successfulRequests++;
          request.resolve(result);
        } catch (error) {
          const is429Error =
            error.message?.includes("Rate limit") ||
            error.response?.status === 429;

          if (is429Error) {
            console.error(`⚠️ Rate limit error on request: ${request.id}`);

            if (request.retries < this.maxRetries) {
              // Re-queue the request for retry with backoff
              request.retries++;
              this.stats.retriedRequests++;

              // Check for Retry-After header, otherwise use exponential backoff
              let backoffDelay = this.initialBackoffDelay;
              const retryAfter = error.response?.headers?.["retry-after"];

              if (retryAfter) {
                // Retry-After can be in seconds or an HTTP date
                const retryAfterMs = isNaN(retryAfter)
                  ? new Date(retryAfter).getTime() - Date.now()
                  : parseInt(retryAfter) * 1000;
                backoffDelay = Math.max(retryAfterMs, this.initialBackoffDelay);
              } else {
                // Use exponential backoff if no Retry-After header
                backoffDelay =
                  this.initialBackoffDelay *
                  Math.pow(
                    this.exponentialBackoffMultiplier,
                    request.retries - 1,
                  );
              }

              // Set rate limit flag and reset time
              this.isRateLimited = true;
              this.rateLimitResetTime = Date.now() + backoffDelay;

              console.warn(
                `🔄 Retrying request ${request.id} (attempt ${request.retries}/${this.maxRetries}) after ${Math.ceil(backoffDelay / 1000)}s...`,
              );

              // Add request back to front of queue for retry after backoff
              this.queue.unshift(request);

              // Wait for backoff before continuing
              await new Promise((resolve) => setTimeout(resolve, backoffDelay));
              this.isRateLimited = false;
              // Continue to next iteration (which will retry this request)
              continue;
            } else {
              // Max retries exceeded, use fallback
              console.error(
                `❌ Max retries exceeded for ${request.id}, using fallback`,
              );
              try {
                const fallbackData = request.fallbackFn
                  ? request.fallbackFn()
                  : null;
                this.stats.fallbacksUsed++;
                request.resolve(fallbackData);
              } catch (fallbackError) {
                this.stats.failedRequests++;
                request.reject(fallbackError);
              }
            }
          } else {
            // Non-rate-limit error
            console.error(`❌ Request failed: ${request.id}`, error.message);

            if (request.retries < this.maxRetries) {
              // Retry with short delay for non-rate-limit errors
              request.retries++;
              this.stats.retriedRequests++;
              this.queue.unshift(request);

              const retryDelay = 500 * request.retries;
              console.warn(
                `🔄 Retrying request ${request.id} (attempt ${request.retries}/${this.maxRetries}) after ${retryDelay}ms...`,
              );

              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            } else {
              // Use fallback for non-rate-limit errors too
              try {
                const fallbackData = request.fallbackFn
                  ? request.fallbackFn()
                  : null;
                this.stats.fallbacksUsed++;
                request.resolve(fallbackData);
              } catch (fallbackError) {
                this.stats.failedRequests++;
                request.reject(fallbackError);
              }
            }
          }
        }

        // Delay between requests to avoid rate limiting (only if more requests exist)
        if (this.queue.length > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.minDelayBetweenRequests),
          );
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      isProcessing: this.processing,
      isRateLimited: this.isRateLimited,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      fallbacksUsed: 0,
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    console.warn(`🗑️ Clearing ${this.queue.length} pending requests`);
    this.queue = [];
  }

  /**
   * Set configuration
   */
  setConfig(config) {
    if (config.minDelayBetweenRequests !== undefined) {
      this.minDelayBetweenRequests = config.minDelayBetweenRequests;
    }
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.exponentialBackoffMultiplier !== undefined) {
      this.exponentialBackoffMultiplier = config.exponentialBackoffMultiplier;
    }
    if (config.initialBackoffDelay !== undefined) {
      this.initialBackoffDelay = config.initialBackoffDelay;
    }
  }
}

// Export singleton instance
export default new AIRequestQueue();
