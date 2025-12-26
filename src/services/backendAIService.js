// Backend AI Service - Proxy all AI requests through backend
// DEPRECATED: Use secureAIService.js instead for new implementations
import secureAIService from './secureAIService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

/**
 * Backend AI Service - All AI operations go through your backend
 * Benefits: Secure API key, token tracking, billing, rate limiting
 */
class BackendAIService {
  constructor() {
    this.apiBase = API_BASE;
  }

  /**
   * Get auth headers with token
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API errors
   */
  handleError(error, operation) {
    console.error(`❌ ${operation} failed:`, error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        throw new Error('Authentication required. Please login.');
      }

      if (status === 429) {
        throw new Error(
          data.message || 'Token limit exceeded. Please upgrade your plan.'
        );
      }

      if (status === 500) {
        throw new Error(
          data.message || 'AI generation failed. Please try again.'
        );
      }

      throw new Error(data.message || `Request failed with status ${status}`);
    }

    throw new Error(
      error.message || 'Network error. Please check your connection.'
    );
  }

  /**
   * Generate text using backend API
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      const {
        tier = 'standard',
        maxTokens = 1000,
        temperature = 0.7,
        systemPrompt = 'You are a helpful AI assistant for educational content creation.',
      } = options;

      console.log('🤖 Generating text via backend...');
      return await secureAIService.generateText(prompt, {
        tier,
        maxTokens,
        temperature,
        systemPrompt,
      });
    } catch (error) {
      this.handleError(error, 'Text generation');
    }
  }

  /**
   * Generate structured JSON response
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    try {
      const {
        tier = 'standard',
        maxTokens = 2000,
        temperature = 0.7,
      } = options;

      console.log('🤖 Generating structured JSON via backend...');
      return await secureAIService.generateStructured(
        systemPrompt,
        userPrompt,
        {
          tier,
          maxTokens,
          temperature,
        }
      );
    } catch (error) {
      this.handleError(error, 'Structured generation');
    }
  }

  /**
   * Generate image via backend
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(prompt, options = {}) {
    try {
      const {
        tier = 'standard',
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid',
      } = options;

      console.log('🎨 Generating image via backend...');
      return await secureAIService.generateImage(prompt, {
        tier,
        size,
        quality,
        style,
      });
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Image generation',
        error.response
      );
      throw formattedError;
    }
  }

  /**
   * Generate course outline via backend
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Course outline
   */
  async generateCourseOutline(courseData) {
    try {
      console.log(`🤖 Generating course outline via backend...`);

      return await secureAIService.generateCourseOutline(courseData);
    } catch (error) {
      this.handleError(error, 'Course outline generation');
    }
  }

  /**
   * Generate comprehensive course via backend
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Comprehensive course structure
   */
  async generateComprehensiveCourse(courseData) {
    try {
      console.log(`🤖 Generating comprehensive course via backend...`);

      return await secureAIService.generateComprehensiveCourse(courseData);
    } catch (error) {
      this.handleError(error, 'Comprehensive course generation');
    }
  }

  /**
   * Generate course thumbnail image via backend
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image generation result
   */
  async generateCourseImage(prompt, options = {}) {
    try {
      return await secureAIService.generateCourseImage(prompt, options);
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Course image generation',
        error.response
      );
      throw formattedError;
    }
  }

  /**
   * Generate lesson content via backend
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
    try {
      const prompt = `Create detailed lesson content for:

Course: ${courseData.title}
Module: ${moduleData.title}
Lesson: ${lessonData.title}
Description: ${lessonData.description || 'Educational content'}

Generate comprehensive, engaging educational content that includes:
1. Introduction
2. Main content with examples
3. Key takeaways
4. Practice exercises (if applicable)

Format the content in clear, structured paragraphs.`;

      const content = await this.generateText(prompt, {
        tier: options?.tier || 'standard',
        maxTokens: options.maxTokens || 1500,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content creator. Create clear, engaging, and informative lesson content.',
      });

      return content;
    } catch (error) {
      this.handleError(error, 'Lesson content generation');
    }
  }

  /**
   * Enhance existing lesson content via backend
   * @param {string} content - Existing content to enhance
   * @param {Object} options - Enhancement options
   * @returns {Promise<string>} Enhanced content
   */
  async enhanceLessonContent(content, options = {}) {
    try {
      const {
        enhancementType = 'clarity',
        targetAudience = 'general learners',
        tier = 'standard',
      } = options;

      const prompt = `Enhance the following educational content for ${enhancementType}:

Original Content:
${content}

Target Audience: ${targetAudience}

Please improve the content by:
1. Making it clearer and more engaging
2. Adding relevant examples if needed
3. Improving structure and flow
4. Ensuring it's appropriate for the target audience

Return the enhanced version maintaining the same general structure.`;

      const enhancedContent = await this.generateText(prompt, {
        tier,
        maxTokens: 2000,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content editor. Enhance content while maintaining its core message and structure.',
      });

      return enhancedContent;
    } catch (error) {
      this.handleError(error, 'Content enhancement');
    }
  }

  /**
   * Generate quiz questions via backend
   * @param {string} topic - Topic for quiz questions
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of quiz questions
   */
  async generateQuizQuestions(topic, options = {}) {
    try {
      const {
        numberOfQuestions = 5,
        difficulty = 'medium',
        questionType = 'multiple-choice',
        tier = 'standard',
      } = options;

      const prompt = `Generate ${numberOfQuestions} ${difficulty} ${questionType} quiz questions about: ${topic}

Each question should have:
1. A clear, concise question
2. Four answer options (A, B, C, D)
3. The correct answer indicated
4. A brief explanation of why the answer is correct

Format as JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation"
  }
]

Return ONLY valid JSON.`;

      const response = await this.generateStructured(
        'You are an expert educational assessment creator. Generate high-quality quiz questions that test understanding.',
        prompt,
        {
          tier,
          maxTokens: 1500,
          temperature: 0.7,
        }
      );

      // Ensure response is an array
      const questions = Array.isArray(response) ? response : [response];

      console.log(`✅ Generated ${questions.length} quiz questions`);
      return questions;
    } catch (error) {
      this.handleError(error, 'Quiz generation');
    }
  }

  /**
   * Get usage statistics (if backend provides this endpoint)
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    try {
      const response = await fetch(`${this.apiBase}/api/usage/dashboard`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch usage stats');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to fetch usage stats:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const backendAIService = new BackendAIService();
export default backendAIService;

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
  getUsageStats,
} = backendAIService;
