// AI Service - OpenAI Only Solution
// Simplified service using only OpenAI (no DeepAI, HuggingFace, or Bytez)
import openAIService from './openAIService';

/**
 * AI Service class - Simplified to use only OpenAI
 * This is a compatibility layer for backward compatibility
 */
class AIService {
  constructor() {
    // Use the centralized OpenAI service
    this.service = openAIService;
  }

  /**
   * Generate course outline using OpenAI
   * @param {Object} courseData - Course creation data
   * @returns {Promise<Object>} Generated course structure
   */
  async generateCourseOutline(courseData) {
    return await this.service.generateCourseOutline(courseData);
  }

  /**
   * Generate course image using OpenAI DALL-E
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateCourseImage(prompt, options = {}) {
    return await this.service.generateCourseImage(prompt, options);
  }

  /**
   * Generate text using OpenAI GPT
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    return await this.service.generateText(prompt, options);
  }

  /**
   * Generate structured JSON using OpenAI
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    return await this.service.generateStructured(
      systemPrompt,
      userPrompt,
      options
    );
  }

  /**
   * Check if service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.service.isAvailable();
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;
