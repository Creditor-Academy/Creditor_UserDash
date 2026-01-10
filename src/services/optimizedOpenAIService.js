/**
 * Optimized AI Service
 * Wraps openAIService with request optimization (deduplication + concurrency limiting)
 *
 * Usage:
 * import optimizedOpenAIService from './optimizedOpenAIService';
 *
 * // Generate text with automatic deduplication and concurrency limiting
 * const result = await optimizedOpenAIService.generateText(prompt, options);
 *
 * // Get performance metrics
 * const metrics = optimizedOpenAIService.getMetrics();
 */

import openAIService from "./openAIService.js";
import requestOptimizationService from "./requestOptimizationService.js";

class OptimizedOpenAIService {
  constructor() {
    this.requestOptimization = requestOptimizationService;
  }

  /**
   * Generate text with optimization
   */
  async generateText(prompt, options = {}) {
    return this.requestOptimization.executeRequest(
      "ai-text",
      { prompt, options },
      () => openAIService.generateText(prompt, options),
      { timeout: options.timeout || 60000 },
    );
  }

  /**
   * Generate course outline with optimization
   */
  async generateCourseOutline(courseData, options = {}) {
    return this.requestOptimization.executeRequest(
      "ai-course-outline",
      { courseData, options },
      () => openAIService.generateCourseOutline(courseData, options),
      { timeout: options.timeout || 120000 },
    );
  }

  /**
   * Generate image with optimization
   */
  async generateImage(prompt, options = {}) {
    return this.requestOptimization.executeRequest(
      "ai-image",
      { prompt, options },
      () => openAIService.generateImage(prompt, options),
      { timeout: options.timeout || 90000 },
    );
  }

  /**
   * Generate multiple texts in parallel with smart concurrency
   */
  async generateMultipleTexts(prompts, options = {}) {
    const requests = prompts.map((prompt, index) => ({
      namespace: "ai-text-batch",
      params: { prompt, index, options },
      requestFn: () => openAIService.generateText(prompt, options),
    }));

    return this.requestOptimization.executeBatch(requests, {
      batchSize: options.batchSize || 5,
      delayBetweenBatches: options.delayBetweenBatches || 0,
      timeout: options.timeout || 60000,
    });
  }

  /**
   * Generate multiple images in parallel with smart concurrency
   */
  async generateMultipleImages(prompts, options = {}) {
    const requests = prompts.map((prompt, index) => ({
      namespace: "ai-image-batch",
      params: { prompt, index, options },
      requestFn: () => openAIService.generateImage(prompt, options),
    }));

    return this.requestOptimization.executeBatch(requests, {
      batchSize: options.batchSize || 3, // Lower batch size for images (slower)
      delayBetweenBatches: options.delayBetweenBatches || 1000,
      timeout: options.timeout || 90000,
    });
  }

  /**
   * Clear cache for specific namespace
   */
  clearCache(namespace = null) {
    this.requestOptimization.clearCache(namespace);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.requestOptimization.getCacheStats();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.requestOptimization.getMetrics();
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.requestOptimization.resetMetrics();
  }

  /**
   * Configure optimization
   */
  configure(options) {
    this.requestOptimization.configure(options);
  }

  /**
   * Print performance report
   */
  printPerformanceReport() {
    const metrics = this.getMetrics();
    const cacheStats = this.getCacheStats();

    console.log("\n📊 === PERFORMANCE REPORT ===");
    console.log("Metrics:", metrics);
    console.log("Cache Stats:", cacheStats);
    console.log("✅ === END REPORT ===\n");
  }
}

// Create singleton instance
const optimizedOpenAIService = new OptimizedOpenAIService();

export default optimizedOpenAIService;
