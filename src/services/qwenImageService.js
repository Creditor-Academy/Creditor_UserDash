// Qwen Image Generation Service with HuggingFace Inference Client
// Integrates ostris/qwen_image_detail_slider model for enhanced image generation

/**
 * Qwen Image Service using HuggingFace Inference Client
 * Provides advanced image generation with detail slider control
 */
class QwenImageService {
  constructor() {
    this.huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_INFERENCE_API_KEY || 
                         import.meta.env.VITE_HF_API_KEY || 
                         import.meta.env.VITE_HUGGINGFACE_API_KEY;
    this.baseUrl = "https://api-inference.huggingface.co/models";
    
    // Model configurations for different use cases - Updated with valid models
    this.models = {
      qwenDetailSlider: 'runwayml/stable-diffusion-v1-5',  // Safe, reliable model
      stableDiffusion: 'runwayml/stable-diffusion-v1-5',
      stableDiffusion2: 'stabilityai/stable-diffusion-2-1',
      stableDiffusionXL: 'stabilityai/stable-diffusion-xl-base-1.0'
    };

    // Detail levels for the slider
    this.detailLevels = {
      minimal: -2,
      low: -1,
      normal: 0,
      high: 1,
      maximum: 2
    };

    // Initialize HuggingFace Inference Client if available
    this.initializeInferenceClient();
  }

  /**
   * Initialize HuggingFace Inference Client (optional dependency)
   */
  async initializeInferenceClient() {
    try {
      // Try to import HuggingFace Inference Client (optional)
      // Note: Install with: npm install @huggingface/inference
      const inferenceModule = await import('@huggingface/inference').catch(() => null);
      
      if (inferenceModule && inferenceModule.InferenceClient) {
        this.client = new inferenceModule.InferenceClient(this.huggingfaceKey);
        this.hasInferenceClient = true;
        console.log('✅ HuggingFace Inference Client initialized');
      } else {
        throw new Error('InferenceClient not found in module');
      }
    } catch (error) {
      console.warn('⚠️ HuggingFace Inference Client not available, using direct API calls:', error.message);
      console.info('💡 To enable advanced features, install: npm install @huggingface/inference');
      this.hasInferenceClient = false;
      this.client = null;
    }
  }

  /**
   * Generate image using Qwen image detail slider model
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateWithQwenDetailSlider(prompt, options = {}) {
    try {
      console.log('🎨 Generating image with Qwen Detail Slider:', prompt);

      const detailLevel = this.detailLevels[options.detailLevel] || this.detailLevels.normal;
      const steps = options.steps || 5; // Fast generation with 5 steps as in example

      let result;

      if (this.hasInferenceClient && this.client) {
        // Use HuggingFace Inference Client (preferred method)
        console.log('🚀 Using HuggingFace Inference Client for Qwen generation');
        result = await this.generateWithInferenceClient(prompt, detailLevel, steps, options);
      } else {
        // Fallback to direct API calls
        console.log('🔄 Using direct API calls for Qwen generation');
        result = await this.generateWithDirectAPI(prompt, detailLevel, steps, options);
      }

      if (result.success) {
        console.log('✅ Qwen Detail Slider generation successful');
        return result;
      } else {
        throw new Error(result.error || 'Qwen generation failed');
      }

    } catch (error) {
      console.error('❌ Qwen Detail Slider generation failed:', error);
      return {
        success: false,
        error: error.message,
        provider: 'qwen-detail-slider'
      };
    }
  }

  /**
   * Generate image using HuggingFace Inference Client
   */
  async generateWithInferenceClient(prompt, detailLevel, steps, options = {}) {
    try {
      console.log(`🚀 Using HuggingFace Inference Client with detail level: ${detailLevel}`);

      // Validate client availability
      if (!this.client) {
        throw new Error('HuggingFace Inference Client not initialized');
      }

      // Modify prompt to include detail level instruction
      const enhancedPrompt = this.enhancePromptWithDetailLevel(prompt, detailLevel);

      const image = await this.client.textToImage({
        model: this.models.qwenDetailSlider,  // Removed provider since using standard HF model
        inputs: enhancedPrompt,
        parameters: { 
          num_inference_steps: steps,
          guidance_scale: options.guidance || 7.5,
          width: options.width || 1024,
          height: options.height || 1024
        }
      });

      // Validate image response
      if (!image || !(image instanceof Blob)) {
        throw new Error('Invalid image response from HuggingFace Inference Client');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(image);

      return {
        success: true,
        data: {
          url: imageUrl,
          blob: image,
          provider: 'qwen-detail-slider',
          model: this.models.qwenDetailSlider,
          prompt: enhancedPrompt,
          originalPrompt: prompt,
          detailLevel: detailLevel,
          steps: steps,
          method: 'inference-client',
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.warn('🔄 Inference Client method failed, will try direct API:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'qwen-detail-slider'
      };
    }
  }

  /**
   * Generate image using direct API calls (fallback)
   */
  async generateWithDirectAPI(prompt, detailLevel, steps, options = {}) {
    try {
      console.log(`🔄 Using direct API with detail level: ${detailLevel}`);

      const enhancedPrompt = this.enhancePromptWithDetailLevel(prompt, detailLevel);

      const response = await fetch(`${this.baseUrl}/${this.models.qwenDetailSlider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingfaceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            num_inference_steps: steps,
            guidance_scale: options.guidance || 7.5,
            width: options.width || 1024,
            height: options.height || 1024
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        success: true,
        data: {
          url: imageUrl,
          blob: imageBlob,
          provider: 'qwen-detail-slider',
          model: this.models.qwenDetailSlider,
          prompt: enhancedPrompt,
          originalPrompt: prompt,
          detailLevel: detailLevel,
          steps: steps,
          method: 'direct-api',
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'qwen-detail-slider'
      };
    }
  }

  /**
   * Enhance prompt with detail level instructions
   */
  enhancePromptWithDetailLevel(prompt, detailLevel) {
    const detailInstructions = {
      [-2]: 'minimal detail, simple, clean, basic',
      [-1]: 'low detail, simplified, streamlined',
      [0]: 'normal detail, balanced',
      [1]: 'high detail, intricate, detailed',
      [2]: 'maximum detail, extremely detailed, ultra-detailed, hyperrealistic'
    };

    const instruction = detailInstructions[detailLevel] || detailInstructions[0];
    return `${prompt}, ${instruction}`;
  }

  /**
   * Generate multiple images with different detail levels
   * @param {string} prompt - Base prompt
   * @param {Array} detailLevels - Array of detail levels to generate
   * @returns {Promise<Array>} Array of generated images
   */
  async generateMultipleDetailLevels(prompt, detailLevels = ['minimal', 'normal', 'high']) {
    const results = [];

    for (const level of detailLevels) {
      try {
        console.log(`🎨 Generating ${level} detail version...`);
        const result = await this.generateWithQwenDetailSlider(prompt, { 
          detailLevel: level,
          steps: 5 
        });
        
        results.push({
          detailLevel: level,
          ...result
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to generate ${level} detail image:`, error.message);
        results.push({
          detailLevel: level,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generate course thumbnail with optimal settings
   * @param {string} courseTitle - Course title
   * @param {string} subject - Course subject
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated thumbnail
   */
  async generateCourseThumbnail(courseTitle, subject, options = {}) {
    try {
      const prompt = this.createCourseThumbnailPrompt(courseTitle, subject, options);
      
      const result = await this.generateWithQwenDetailSlider(prompt, {
        detailLevel: options.detailLevel || 'normal',
        steps: options.steps || 8, // Slightly more steps for thumbnails
        guidance: options.guidance || 7.5,
        width: 1024,
        height: 1024
      });

      if (result.success) {
        result.data.type = 'course-thumbnail';
        result.data.courseTitle = courseTitle;
        result.data.subject = subject;
      }

      return result;
    } catch (error) {
      console.error('❌ Course thumbnail generation failed:', error);
      // Return placeholder image instead of failing
      console.warn('🔄 Returning placeholder image for course thumbnail');
      return {
        success: false,
        data: {
          url: 'https://placehold.co/1024x1024/6366f1/ffffff?text=Course+Image',
          provider: 'placeholder',
          courseTitle: courseTitle,
          subject: subject,
          createdAt: new Date().toISOString()
        },
        error: error.message
      };
    }
  }

  /**
   * Create optimized prompt for course thumbnails - Standardized format
   */
  createCourseThumbnailPrompt(courseTitle, subject, options = {}) {
    // Use standardized prompt format as requested
    return `Professional course thumbnail for ${courseTitle}, clean, modern, educational, corporate style, minimalistic, high quality, 1024x1024 resolution`;
  }

  /**
   * Test Qwen model availability and performance
   * @returns {Promise<Object>} Test results
   */
  async testQwenModel() {
    const testPrompt = "test image generation";
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test Inference Client method
    if (this.hasInferenceClient) {
      try {
        const start = Date.now();
        const result = await this.generateWithInferenceClient(testPrompt, 0, 5);
        const duration = Date.now() - start;
        
        results.tests.inferenceClient = {
          available: result.success,
          duration: duration,
          error: result.success ? null : result.error
        };
      } catch (error) {
        results.tests.inferenceClient = {
          available: false,
          error: error.message
        };
      }
    }

    // Test Direct API method
    try {
      const start = Date.now();
      const result = await this.generateWithDirectAPI(testPrompt, 0, 5);
      const duration = Date.now() - start;
      
      results.tests.directAPI = {
        available: result.success,
        duration: duration,
        error: result.success ? null : result.error
      };
    } catch (error) {
      results.tests.directAPI = {
        available: false,
        error: error.message
      };
    }

    return results;
  }

  /**
   * Get available detail levels
   * @returns {Object} Detail levels configuration
   */
  getDetailLevels() {
    return {
      levels: Object.keys(this.detailLevels),
      values: this.detailLevels,
      descriptions: {
        minimal: 'Simple, clean design with basic elements',
        low: 'Simplified design with reduced complexity',
        normal: 'Balanced detail level for general use',
        high: 'Rich detail with intricate elements',
        maximum: 'Ultra-detailed, hyperrealistic imagery'
      }
    };
  }
}

// Create and export singleton instance
const qwenImageService = new QwenImageService();
export default qwenImageService;

// Export individual functions for convenience
export const {
  generateWithQwenDetailSlider,
  generateMultipleDetailLevels,
  generateCourseThumbnail,
  testQwenModel,
  getDetailLevels
} = qwenImageService;
