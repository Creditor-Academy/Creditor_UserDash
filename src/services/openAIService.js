// OpenAI Service - Backend Proxy
// All AI operations now go through backend API (secure, tracked, billed)
import secureAIService from './secureAIService';

/**
 * OpenAI Service - Backend Proxy Wrapper
 * - All AI operations now go through backend API
 * - No direct OpenAI client (secure, tracked, billed)
 * - Token tracking and cost calculation on backend
 * - Maintains same interface for backward compatibility
 */
const isDevelopment = !!import.meta.env.DEV;

const clientLogger = {
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
};

class OpenAIService {
  constructor() {
    this.backend = secureAIService;
    clientLogger.debug(
      '✅ OpenAI service initialized (using secure backend proxy)'
    );
  }

  /**
   * Check if backend service is available
   * @returns {boolean}
   */
  isAvailable() {
    return true; // Backend is always available
  }

  /**
   * Generate text using backend API
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    return await this.backend.generateText(prompt, options);
  }

  /**
   * Generate structured JSON response via backend API
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    return await this.backend.generateStructured(
      systemPrompt,
      userPrompt,
      options
    );
  }

  /**
   * Generate image via backend API
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(prompt, options = {}) {
    return await this.backend.generateImage(prompt, options);
  }

  /**
   * Generate course outline via backend API
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Course outline
   */
  async generateCourseOutline(courseData) {
    try {
      return await this.backend.generateCourseOutline(courseData);
    } catch (error) {
      clientLogger.error('❌ Course outline generation failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate comprehensive course via backend API
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Comprehensive course structure
   */
  async generateComprehensiveCourse(courseData) {
    try {
      return await this.backend.generateComprehensiveCourse(courseData);
    } catch (error) {
      clientLogger.error('❌ Comprehensive course generation failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate course thumbnail image via backend API
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image generation result
   */
  async generateCourseImage(prompt, options = {}) {
    try {
      return await this.backend.generateCourseImage(prompt, options);
    } catch (error) {
      clientLogger.error('❌ Course image generation failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate lesson content via backend API
   * @param {Object} lessonData - Lesson information
   * @param {Object} moduleData - Module information
   * @param {Object} courseData - Course information
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated lesson content
   */
  async generateLessonContent(
    lessonData,
    moduleData,
    courseData,
    options = {}
  ) {
    return await this.backend.generateLessonContent(
      lessonData,
      moduleData,
      courseData,
      options
    );
  }

  /**
   * Enhance existing lesson content via backend API
   * @param {string} content - Existing content to enhance
   * @param {Object} options - Enhancement options
   * @returns {Promise<string>} Enhanced content
   */
  async enhanceLessonContent(content, options = {}) {
    return await this.backend.enhanceLessonContent(content, options);
  }

  /**
   * Generate quiz questions via backend API
   * @param {string} topic - Topic for quiz questions
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of quiz questions
   */
  async generateQuizQuestions(topic, options = {}) {
    return await this.backend.generateQuizQuestions(topic, options);
  }
}

// Create and export singleton instance
const openAIService = new OpenAIService();
export default openAIService;

// Named exports for convenience
export const {
  generateText,
  generateStructured,
  generateImage,
  generateCourseOutline,
  generateComprehensiveCourse,
  generateCourseImage,
  generateLessonContent,
  enhanceLessonContent,
  generateQuizQuestions,
} = openAIService;
