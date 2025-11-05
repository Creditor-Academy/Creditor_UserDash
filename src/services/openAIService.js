// OpenAI Service - Single Provider Solution
// Simplified AI service using only OpenAI for all AI operations
import OpenAI from 'openai';

/**
 * OpenAI Service - Handles all AI operations using OpenAI API
 * - Text Generation (GPT-4o, GPT-3.5-turbo)
 * - Image Generation (DALL-E 3, DALL-E 2)
 * - Course Content Generation
 */
class OpenAIService {
  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize OpenAI client
   */
  initializeClient() {
    // Get API key from multiple sources
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.error(
        '❌ OpenAI API key not found. Please configure VITE_OPENAI_API_KEY'
      );
      this.client = null;
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
      this.client = null;
    }
  }

  /**
   * Get OpenAI API key from environment or localStorage
   * @returns {string|null} API key
   */
  getApiKey() {
    // Priority order: env variable > localStorage
    return (
      import.meta.env.VITE_OPENAI_API_KEY ||
      localStorage.getItem('openai_api_key') ||
      null
    );
  }

  /**
   * Check if OpenAI client is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generate text using GPT models
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error(
        'OpenAI client not initialized. Please configure API key.'
      );
    }

    const {
      model = 'gpt-3.5-turbo',
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = 'You are a helpful AI assistant for educational content creation.',
    } = options;

    try {
      console.log(`🤖 Generating text with OpenAI ${model}...`);

      const response = await this.client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const text = response.choices[0]?.message?.content || '';

      if (!text) {
        throw new Error('No text generated');
      }

      console.log(`✅ Text generation successful (${text.length} characters)`);
      return text;
    } catch (error) {
      console.error('❌ OpenAI text generation failed:', error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON response using GPT models
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async generateStructured(systemPrompt, userPrompt, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      maxTokens = 2000,
      temperature = 0.7,
    } = options;

    try {
      const text = await this.generateText(userPrompt, {
        model,
        maxTokens,
        temperature,
        systemPrompt,
      });

      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, try to parse the entire response
      return JSON.parse(text);
    } catch (error) {
      console.error('❌ Failed to parse structured response:', error);
      throw new Error(`Structured generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using DALL-E
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error(
        'OpenAI client not initialized. Please configure API key.'
      );
    }

    const {
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
    } = options;

    try {
      console.log(`🎨 Generating image with OpenAI ${model}...`);

      const response = await this.client.images.generate({
        model: model,
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        style: style,
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned');
      }

      console.log(`✅ Image generation successful`);

      return {
        success: true,
        url: imageUrl,
        model: model,
        size: size,
        quality: quality,
        provider: 'openai',
      };
    } catch (error) {
      console.error('❌ OpenAI image generation failed:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Generate course outline
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Course outline
   */
  async generateCourseOutline(courseData) {
    const prompt = `Create a comprehensive course outline for: "${courseData.title}"

Subject: ${courseData.subject || courseData.title}
Description: ${courseData.description || 'Educational course'}
Target Audience: ${courseData.targetAudience || 'General learners'}
Difficulty: ${courseData.difficulty || 'beginner'}
Duration: ${courseData.duration || '4 weeks'}

Generate a JSON course outline with this structure:
{
  "course_title": "Course Title",
  "modules": [
    {
      "module_title": "Module 1 Title",
      "description": "Module description",
      "lessons": [
        {
          "lesson_title": "Lesson 1",
          "description": "Lesson description",
          "duration": "15 min"
        }
      ]
    }
  ]
}

Generate 3-4 modules with 3-5 lessons each. Return ONLY valid JSON.`;

    try {
      const outline = await this.generateStructured(
        'You are an expert curriculum designer. Generate comprehensive, well-structured course outlines.',
        prompt,
        { model: 'gpt-3.5-turbo', maxTokens: 2000, temperature: 0.7 }
      );

      return {
        success: true,
        data: outline,
        provider: 'openai',
      };
    } catch (error) {
      console.error('❌ Course outline generation failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate course thumbnail image
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image generation result
   */
  async generateCourseImage(prompt, options = {}) {
    try {
      const result = await this.generateImage(prompt, {
        model: 'dall-e-3',
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
      });

      return {
        success: true,
        data: {
          url: result.url,
          model: result.model,
          size: result.size,
          provider: 'openai',
        },
      };
    } catch (error) {
      console.error('❌ Course image generation failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate lesson content
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

    try {
      const content = await this.generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: options.maxTokens || 1500,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content creator. Create clear, engaging, and informative lesson content.',
      });

      return content;
    } catch (error) {
      console.error('❌ Lesson content generation failed:', error);
      throw error;
    }
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
  generateCourseImage,
  generateLessonContent,
} = openAIService;
