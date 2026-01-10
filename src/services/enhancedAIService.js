// Enhanced AI Service - Secure Backend Implementation
// All AI operations now go through secure backend (no direct OpenAI calls)
import secureAIService from "./secureAIService";

/**
 * Enhanced AI Service - OpenAI Only
 * Provides intelligent AI operations using only OpenAI models
 */
class EnhancedAIService {
  constructor() {
    this.openai = secureAIService;
    console.log("✅ Enhanced AI Service initialized (Secure Backend)");
  }

  /**
   * Generate text with OpenAI GPT models
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      console.log("🤖 Generating text with AI...");
      const text = await this.openai.generateText(prompt, options);
      console.log(`✅ Text generated successfully`);
      return text;
    } catch (error) {
      console.error("❌ Text generation failed:", error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON with OpenAI
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    try {
      console.log("🤖 Generating structured response with AI...");
      const data = await this.openai.generateStructured(
        systemPrompt,
        userPrompt,
        options,
      );
      console.log(`✅ Structured data generated successfully`);
      return data;
    } catch (error) {
      console.error("❌ Structured generation failed:", error);
      throw new Error(`Structured generation failed: ${error.message}`);
    }
  }

  /**
   * Generate course outline using OpenAI
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Course outline
   */
  async generateCourseOutline(courseData) {
    try {
      console.log("📋 Generating course outline with AI...");
      const result = await this.openai.generateCourseOutline(courseData);

      if (result.success) {
        console.log(`✅ Course outline generated successfully`);
        return result;
      } else {
        throw new Error(result.error || "Failed to generate course outline");
      }
    } catch (error) {
      console.error("❌ Course outline generation failed:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate course image using OpenAI DALL-E
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image generation result
   */
  async generateCourseImage(prompt, options = {}) {
    try {
      console.log("🎨 Generating image with AI...");
      const result = await this.openai.generateCourseImage(prompt, options);

      if (result.success) {
        console.log(`✅ Image generated successfully`);
        return result;
      } else {
        throw new Error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("❌ Image generation failed:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate lesson content using OpenAI
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
    options = {},
  ) {
    try {
      console.log("📝 Generating lesson content with AI...");
      const content = await this.openai.generateLessonContent(
        lessonData,
        moduleData,
        courseData,
        options,
      );
      console.log(`✅ Lesson content generated successfully`);
      return content;
    } catch (error) {
      console.error("❌ Lesson content generation failed:", error);
      throw error;
    }
  }

  /**
   * Check if service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.openai.isAvailable();
  }
}

// Create and export singleton instance
const enhancedAIService = new EnhancedAIService();
export default enhancedAIService;
