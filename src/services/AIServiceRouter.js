// AI Service Router - OpenAI Only Solution
// Simplified router using only OpenAI (removed Stability, HuggingFace, Bytez, etc.)
import openAIService from './openAIService';

/**
 * AI Service Router - OpenAI Only
 * Simplified routing for AI operations using only OpenAI
 */
class AIServiceRouter {
  constructor() {
    this.service = openAIService;
    console.log('✅ AI Service Router initialized (OpenAI only)');
  }

  /**
   * Generate text using OpenAI
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      return await this.service.generateText(prompt, options);
    } catch (error) {
      console.error('❌ Text generation failed:', error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON using OpenAI
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    try {
      return await this.service.generateStructured(
        systemPrompt,
        userPrompt,
        options
      );
    } catch (error) {
      console.error('❌ Structured generation failed:', error);
      throw new Error(`Structured generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using OpenAI DALL-E
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image generation result
   */
  async generateImage(prompt, options = {}) {
    try {
      const result = await this.service.generateImage(prompt, options);
      return result.url;
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
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
const aiServiceRouter = new AIServiceRouter();
export default aiServiceRouter;
