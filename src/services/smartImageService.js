// Smart Image Service - Complete Solution for Image URL Management
// Orchestrates multiple strategies to handle long URLs, CORS, and storage

import imageProxyService from './imageProxyService';
import urlShortenerService from './urlShortenerService';
import { uploadImage } from './imageUploadService';

/**
 * Smart Image Service - Main orchestrator for image URL processing
 * Combines multiple strategies to ensure optimal results
 */
class SmartImageService {
  constructor() {
    this.strategies = [
      'backend-proxy', // Best: Download + S3 upload via backend
      'url-shortening', // Good: Create short redirect URL
      'fallback-validation', // Last resort: Use original with validation
    ];
  }

  /**
   * Process image URL using the best available strategy
   * @param {string} imageUrl - Image URL to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processImage(imageUrl, options = {}) {
    console.log('🎯 Smart Image Service: Processing image URL');
    console.log('Original URL length:', imageUrl.length);
    console.log('Backend limit:', 300);

    const startTime = Date.now();

    try {
      // Quick validation
      const validation = this.validateImageUrl(imageUrl);
      if (!validation.isValid) {
        throw new Error(`Invalid image URL: ${validation.issues.join(', ')}`);
      }

      // If URL is already short enough, return as-is
      if (imageUrl.length <= 300) {
        console.log('✅ URL already within backend limits');
        return {
          success: true,
          imageUrl: imageUrl,
          originalUrl: imageUrl,
          method: 'no-processing-needed',
          urlShortened: false,
          processingTime: Date.now() - startTime,
        };
      }

      // Strategy 1: Backend Proxy (Best - permanent S3 storage)
      try {
        console.log('🔄 Strategy 1: Backend proxy processing...');
        const proxyResult = await imageProxyService.smartProcess(imageUrl, {
          folder: options.folder || 'course-thumbnails',
          fileName: options.fileName || `smart-${Date.now()}.png`,
          public: options.public !== false,
          quality: options.quality || 'standard',
        });

        if (proxyResult.success && proxyResult.imageUrl.length <= 300) {
          console.log('✅ Backend proxy successful');
          return {
            ...proxyResult,
            processingTime: Date.now() - startTime,
            strategy: 'backend-proxy',
            permanent: true,
            reliable: true,
          };
        }
      } catch (error) {
        console.warn('⚠️ Backend proxy failed:', error.message);
      }

      // Strategy 2: URL Shortening (Good - redirect-based)
      try {
        console.log('🔄 Strategy 2: URL shortening...');
        const shortResult = await urlShortenerService.smartShorten(imageUrl, {
          description: options.description || 'AI Generated Image',
          expiresIn: options.expiresIn || '1y',
          tags: options.tags || ['ai-generated'],
        });

        if (shortResult.success && shortResult.shortUrl.length <= 300) {
          console.log('✅ URL shortening successful');
          return {
            success: true,
            imageUrl: shortResult.shortUrl,
            shortUrl: shortResult.shortUrl,
            originalUrl: imageUrl,
            method: 'url-shortening',
            strategy: 'url-shortening',
            urlShortened: true,
            processingTime: Date.now() - startTime,
            permanent: false, // Redirect-based
            reliable: true,
            expiresAt: shortResult.expiresAt,
          };
        }
      } catch (error) {
        console.warn('⚠️ URL shortening failed:', error.message);
      }

      // Strategy 3: Fallback with validation (Last resort)
      console.log('🔄 Strategy 3: Fallback with validation...');
      return {
        success: false,
        imageUrl: imageUrl,
        originalUrl: imageUrl,
        method: 'fallback-validation',
        strategy: 'fallback',
        urlShortened: false,
        processingTime: Date.now() - startTime,
        permanent: false,
        reliable: false,
        warning: 'URL exceeds backend limit - may cause database errors',
        recommendation: 'Configure backend proxy or URL shortening service',
      };
    } catch (error) {
      console.error('❌ Smart image processing failed:', error);
      return {
        success: false,
        imageUrl: imageUrl,
        originalUrl: imageUrl,
        method: 'error-fallback',
        strategy: 'error',
        urlShortened: false,
        processingTime: Date.now() - startTime,
        error: error.message,
        permanent: false,
        reliable: false,
      };
    }
  }

  /**
   * Validate image URL
   * @param {string} imageUrl - URL to validate
   * @returns {Object} Validation result
   */
  validateImageUrl(imageUrl) {
    const validation = {
      isValid: false,
      canProcess: false,
      issues: [],
      recommendations: [],
      urlType: 'unknown',
    };

    // Basic URL validation
    try {
      const url = new URL(imageUrl);
      validation.isValid = true;

      // Detect URL type
      if (url.hostname.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        validation.urlType = 'openai-dalle';
        validation.canProcess = true;
      } else if (
        url.hostname.includes('amazonaws.com') ||
        url.hostname.includes('s3')
      ) {
        validation.urlType = 's3';
        validation.canProcess = true;
      } else if (url.protocol === 'https:') {
        validation.urlType = 'https';
        validation.canProcess = true;
      } else if (url.protocol === 'http:') {
        validation.urlType = 'http';
        validation.canProcess = true;
        validation.issues.push('HTTP URLs are less secure than HTTPS');
      } else {
        validation.issues.push('Unsupported URL protocol');
      }
    } catch {
      validation.issues.push('Invalid URL format');
      return validation;
    }

    // Special cases
    if (imageUrl.startsWith('blob:')) {
      validation.urlType = 'blob';
      validation.canProcess = false;
      validation.issues.push('Blob URLs cannot be processed remotely');
      validation.recommendations.push(
        'Convert blob to file and upload directly'
      );
    } else if (imageUrl.startsWith('data:')) {
      validation.urlType = 'data';
      validation.canProcess = false;
      validation.issues.push('Data URLs cannot be processed remotely');
      validation.recommendations.push(
        'Convert data URL to file and upload directly'
      );
    }

    return validation;
  }

  /**
   * Batch process multiple image URLs
   * @param {string[]} imageUrls - Array of image URLs
   * @param {Object} options - Processing options
   * @returns {Promise<Object[]>} Array of processing results
   */
  async batchProcess(imageUrls, options = {}) {
    console.log(`🔄 Batch processing ${imageUrls.length} images...`);

    const results = await Promise.allSettled(
      imageUrls.map((url, index) =>
        this.processImage(url, {
          ...options,
          fileName: options.fileName
            ? `${options.fileName}-${index}`
            : undefined,
        })
      )
    );

    const summary = {
      total: imageUrls.length,
      successful: 0,
      failed: 0,
      shortened: 0,
      permanent: 0,
      results: [],
    };

    results.forEach((result, index) => {
      const processResult = {
        originalUrl: imageUrls[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null,
      };

      if (processResult.success) {
        summary.successful++;
        if (processResult.data.urlShortened) summary.shortened++;
        if (processResult.data.permanent) summary.permanent++;
      } else {
        summary.failed++;
      }

      summary.results.push(processResult);
    });

    console.log('📊 Batch processing summary:', summary);
    return summary;
  }

  /**
   * Get service health and statistics
   * @returns {Promise<Object>} Service health data
   */
  async getServiceHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      services: {},
      overall: 'unknown',
    };

    // Check backend proxy service
    try {
      const proxyStats = await imageProxyService.getStats();
      health.services.backendProxy = {
        status: proxyStats ? 'healthy' : 'unavailable',
        stats: proxyStats,
      };
    } catch (error) {
      health.services.backendProxy = {
        status: 'error',
        error: error.message,
      };
    }

    // Check URL shortening service
    try {
      const testUrl = 'https://example.com/very-long-url-for-testing-purposes';
      const validation = urlShortenerService.validateUrl(testUrl);
      health.services.urlShortener = {
        status: validation.isValid ? 'healthy' : 'error',
        canShorten: validation.canShorten,
      };
    } catch (error) {
      health.services.urlShortener = {
        status: 'error',
        error: error.message,
      };
    }

    // Determine overall health
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    if (serviceStatuses.includes('healthy')) {
      health.overall = serviceStatuses.every(s => s === 'healthy')
        ? 'healthy'
        : 'degraded';
    } else {
      health.overall = 'unhealthy';
    }

    return health;
  }

  /**
   * Get recommended strategy for a given URL
   * @param {string} imageUrl - Image URL to analyze
   * @returns {Object} Strategy recommendation
   */
  getRecommendedStrategy(imageUrl) {
    const validation = this.validateImageUrl(imageUrl);

    if (!validation.isValid) {
      return {
        strategy: 'none',
        reason: 'Invalid URL',
        issues: validation.issues,
      };
    }

    if (imageUrl.length <= 300) {
      return {
        strategy: 'no-processing',
        reason: 'URL already within limits',
      };
    }

    if (validation.urlType === 'openai-dalle') {
      return {
        strategy: 'backend-proxy',
        reason:
          'OpenAI URLs require CORS-free processing and permanent storage',
        fallback: 'url-shortening',
      };
    }

    if (validation.urlType === 's3') {
      return {
        strategy: 'url-shortening',
        reason: 'S3 URLs are already permanent, just need shortening',
        fallback: 'backend-proxy',
      };
    }

    return {
      strategy: 'backend-proxy',
      reason: 'Default strategy for unknown URL types',
      fallback: 'url-shortening',
    };
  }
}

// Create singleton instance
const smartImageService = new SmartImageService();

// Export both class and instance
export { SmartImageService };
export default smartImageService;

// Export main methods for convenience
export const {
  processImage,
  batchProcess,
  validateImageUrl,
  getServiceHealth,
  getRecommendedStrategy,
} = smartImageService;
