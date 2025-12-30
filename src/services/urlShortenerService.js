// URL Shortener Service - Backup solution for long URLs
// Creates short, permanent URLs when direct image processing isn't available

import { api } from './apiClient';

/**
 * URL Shortener Service
 * Creates short URLs for long image URLs as a fallback solution
 */
class UrlShortenerService {
  constructor() {
    this.baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'https://creditor.onrender.com';
    this.shortDomain = import.meta.env.VITE_SHORT_DOMAIN || 'cred.ly'; // Custom short domain
  }

  /**
   * Shorten a long URL
   * @param {string} longUrl - URL to shorten
   * @param {Object} options - Shortening options
   * @returns {Promise<Object>} Short URL result
   */
  async shortenUrl(longUrl, options = {}) {
    try {
      console.log('🔗 Shortening URL...');
      console.log('Original length:', longUrl.length);

      const payload = {
        url: longUrl,
        customAlias: options.alias || this.generateAlias(),
        expiresIn: options.expiresIn || '1y', // Default 1 year expiration
        description: options.description || 'AI Generated Content',
        tags: options.tags || ['ai-generated', 'thumbnail'],
        domain: options.domain || this.shortDomain,
      };

      const response = await api.post('/api/url/create', payload);

      if (response.data?.success) {
        const result = response.data.data || response.data;

        console.log('✅ URL shortened successfully');
        console.log('New length:', result.shortUrl?.length || 0);

        return {
          success: true,
          shortUrl: result.shortUrl,
          originalUrl: longUrl,
          alias: result.alias,
          qrCode: result.qrCode || null,
          analytics: result.analytics || null,
          expiresAt: result.expiresAt,
          createdAt: new Date().toISOString(),
          clicks: 0,
          isActive: true,
        };
      } else {
        throw new Error(response.data?.message || 'URL shortening failed');
      }
    } catch (error) {
      console.error('❌ URL shortening failed:', error);

      if (error.response?.status === 409) {
        throw new Error('Custom alias already exists');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid URL format');
      } else {
        throw new Error(`Shortening failed: ${error.message}`);
      }
    }
  }

  /**
   * Generate a random alias for short URLs
   * @param {number} length - Alias length
   * @returns {string} Random alias
   */
  generateAlias(length = 8) {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create multiple short URLs in batch
   * @param {string[]} urls - Array of URLs to shorten
   * @param {Object} options - Shortening options
   * @returns {Promise<Object[]>} Array of results
   */
  async batchShorten(urls, options = {}) {
    console.log(`🔗 Batch shortening ${urls.length} URLs...`);

    const results = await Promise.allSettled(
      urls.map(url =>
        this.shortenUrl(url, {
          ...options,
          alias: options.alias ? `${options.alias}-${Date.now()}` : undefined,
        })
      )
    );

    return results.map((result, index) => ({
      originalUrl: urls[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null,
    }));
  }

  /**
   * Get analytics for a short URL
   * @param {string} alias - Short URL alias
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(alias) {
    try {
      const response = await api.get(`/api/url/analytics/${alias}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get URL analytics:', error.message);
      return null;
    }
  }

  /**
   * Update short URL settings
   * @param {string} alias - Short URL alias
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated URL data
   */
  async updateUrl(alias, updates) {
    try {
      const response = await api.patch(`/api/url/${alias}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update URL:', error.message);
      throw error;
    }
  }

  /**
   * Delete/deactivate a short URL
   * @param {string} alias - Short URL alias
   * @returns {Promise<boolean>} Success status
   */
  async deleteUrl(alias) {
    try {
      await api.delete(`/api/url/${alias}`);
      return true;
    } catch (error) {
      console.error('Failed to delete URL:', error.message);
      return false;
    }
  }

  /**
   * Smart URL processing - handles different URL types
   * @param {string} url - URL to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async smartShorten(url, options = {}) {
    // Check if URL is already short enough
    if (url.length <= 300) {
      console.log('✅ URL already within limits');
      return {
        success: true,
        shortUrl: url,
        originalUrl: url,
        method: 'no-shortening-needed',
        needsShortening: false,
      };
    }

    // Detect URL type and apply appropriate strategy
    let strategy = 'default';
    let customOptions = { ...options };

    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      strategy = 'openai-dalle';
      customOptions.description = 'OpenAI DALL-E Generated Image';
      customOptions.tags = ['openai', 'dalle', 'ai-image'];
      customOptions.expiresIn = '6m'; // 6 months for AI images
    } else if (url.includes('s3.amazonaws.com') || url.includes('amazonaws')) {
      strategy = 's3-url';
      customOptions.description = 'S3 Stored Image';
      customOptions.tags = ['s3', 'storage'];
    } else if (url.includes('blob:') || url.startsWith('data:')) {
      throw new Error('Cannot shorten blob or data URLs');
    }

    console.log(`🎯 Using strategy: ${strategy}`);

    try {
      const result = await this.shortenUrl(url, customOptions);
      return {
        ...result,
        method: 'url-shortening',
        strategy: strategy,
        needsShortening: true,
      };
    } catch (error) {
      console.error('❌ Smart shortening failed:', error);
      throw error;
    }
  }

  /**
   * Validate URL before shortening
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
  validateUrl(url) {
    const validation = {
      isValid: false,
      canShorten: false,
      issues: [],
      recommendations: [],
    };

    // Basic URL validation
    try {
      new URL(url);
      validation.isValid = true;
    } catch {
      validation.issues.push('Invalid URL format');
      return validation;
    }

    // Check if URL can be shortened
    if (url.startsWith('blob:')) {
      validation.issues.push('Blob URLs cannot be shortened');
      validation.recommendations.push(
        'Convert blob to file and upload to storage'
      );
    } else if (url.startsWith('data:')) {
      validation.issues.push('Data URLs cannot be shortened');
      validation.recommendations.push(
        'Convert data URL to file and upload to storage'
      );
    } else if (url.length <= 300) {
      validation.canShorten = false;
      validation.recommendations.push('URL is already short enough');
    } else {
      validation.canShorten = true;
    }

    return validation;
  }
}

// Create singleton instance
const urlShortenerService = new UrlShortenerService();

// Export both class and instance
export { UrlShortenerService };
export default urlShortenerService;

// Export individual methods for convenience
export const {
  shortenUrl,
  batchShorten,
  smartShorten,
  validateUrl,
  getAnalytics,
} = urlShortenerService;
