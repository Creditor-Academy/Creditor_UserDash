// Enhanced AI Service - Multi-API Integration with HuggingFace, OpenAI, and Deep AI
import OpenAI from "openai";
import qwenImageService from './qwenImageService';
import apiKeyManager from './apiKeyManager.js';
import fallbackCourseGenerator from './fallbackCourseGenerator.js';

/**
 * Enhanced AI Service with intelligent failover system
 * Supports: OpenAI, HuggingFace, Deep AI
 */
class EnhancedAIService {
  constructor() {
    // Initialize API configurations
    this.initializeAPIs();
    
    // Define model priorities for different tasks
    // REDUCED to prevent excessive API calls and infinite loops
    this.modelPriorities = {
      textGeneration: [
        { provider: 'openai', model: 'gpt-3.5-turbo', priority: 1 },
        { provider: 'huggingface-router', model: 'HuggingFaceH4/zephyr-7b-beta:featherless-ai', priority: 2 },
        { provider: 'huggingface', model: 'HuggingFaceH4/zephyr-7b-beta', priority: 3 }
      ],
      imageGeneration: [
        { provider: 'deepai', model: 'text2img', priority: 1 },
        { provider: 'huggingface', model: 'runwayml/stable-diffusion-v1-5', priority: 2 },
        { provider: 'huggingface', model: 'stabilityai/stable-diffusion-2-1', priority: 3 },
        { provider: 'huggingface', model: 'stabilityai/stable-diffusion-xl-base-1.0', priority: 4 }
      ]
    };
  }

  /**
   * Initialize all API clients and configurations
   */
  initializeAPIs() {
    // Initialize API Key Manager
    this.apiKeyManager = apiKeyManager;
    
    // OpenAI Configuration
    const openaiKey = this.apiKeyManager.getApiKey('openai');
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      console.warn('⚠️ OpenAI API key not configured');
      this.openai = null;
    }

    // HuggingFace Configuration
    this.huggingfaceKey = this.apiKeyManager.getApiKey('huggingface');
    this.huggingfaceBaseUrl = "https://api-inference.huggingface.co/models";

    // HuggingFace Router Configuration (OpenAI-compatible API)
    const hfRouterKey = this.apiKeyManager.getApiKey('huggingface');
    if (hfRouterKey) {
      this.hfRouterClient = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfRouterKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      console.warn('⚠️ HuggingFace Router API key not configured');
      this.hfRouterClient = null;
    }

    // Deep AI Configuration
    this.deepAIKey = this.apiKeyManager.getApiKey('deepai');
    
    // Fallback generator (always available)
    this.fallbackGenerator = fallbackCourseGenerator;
  }

  /**
   * Generate text using multiple AI providers with intelligent failover
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated text result
   */
  async generateText(prompt, options = {}) {
    const providers = this.modelPriorities.textGeneration;
    let unauthorizedCount = 0;
    const maxUnauthorized = 2; // Stop after 2 consecutive 401 errors
    
    for (const provider of providers) {
      try {
        console.log(`🤖 Attempting text generation with ${provider.provider} (${provider.model})`);
        
        let result;
        switch (provider.provider) {
          case 'openai':
            result = await this.generateWithOpenAI(prompt, options);
            break;
          case 'huggingface-router':
            result = await this.generateWithHuggingFaceRouter(prompt, provider.model, options);
            break;
          case 'huggingface':
            result = await this.generateWithHuggingFace(prompt, provider.model, options);
            break;
          default:
            continue;
        }

        if (result.success) {
          console.log(`✅ Text generation successful with ${provider.provider}`);
          return result;
        }
        
        // Check for unauthorized errors
        if (result.error && (result.error.includes('401') || result.error.includes('Unauthorized') || result.error.includes('Invalid credentials'))) {
          unauthorizedCount++;
          console.warn(`🔑 Unauthorized error ${unauthorizedCount}/${maxUnauthorized}`);
          if (unauthorizedCount >= maxUnauthorized) {
            console.warn(`⚠️ Too many unauthorized errors, skipping remaining providers`);
            break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ ${provider.provider} failed:`, error.message);
        
        // Handle specific error types
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          console.log(`🔄 Rate limit hit for ${provider.provider}, trying next provider...`);
        } else if (error.message.includes('402') || error.message.includes('Payment Required')) {
          console.log(`💳 Payment required for ${provider.provider}, trying next provider...`);
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          unauthorizedCount++;
          console.log(`🔑 Authentication failed for ${provider.provider} (${unauthorizedCount}/${maxUnauthorized})`);
          if (unauthorizedCount >= maxUnauthorized) {
            console.warn(`⚠️ Too many unauthorized errors, stopping provider attempts`);
            break;
          }
        }
        continue;
      }
    }

    // All providers failed, use fallback generator
    console.log('⚠️ All AI providers failed, using fallback generation');
    console.log('🔄 Using fallback content generation for prompt:', prompt.substring(0, 100) + '...');
    
    try {
      // Use the fallback generator's generateContent method
      const fallbackResult = await this.fallbackGenerator.generateContent(prompt, options);
      
      if (fallbackResult && fallbackResult.success) {
        return {
          success: true,
          content: fallbackResult.content,
          fallback: true,
          provider: 'fallback'
        };
      } else {
        throw new Error(fallbackResult?.error || 'Fallback generation returned no content');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback course generation error:', fallbackError);
      
      // Return a simple text fallback as last resort
      return {
        success: true,
        content: 'This is a placeholder response. AI content generation is currently unavailable. Please configure valid API keys or try again later.',
        fallback: true,
        provider: 'simple-fallback',
        error: fallbackError.message
      };
    }
  }

  /**
   * Generate images using multiple AI providers with intelligent failover
   * Enhanced with comprehensive error handling and graceful fallbacks
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(prompt, options = {}) {
    const providers = this.modelPriorities.imageGeneration;
    const errors = [];
    
    for (const provider of providers) {
      try {
        console.log(`🎨 Attempting image generation with ${provider.provider} (${provider.model})`);
        
        let result;
        switch (provider.provider) {
          case 'deepai':
            result = await this.generateWithDeepAI(prompt, options);
            break;
          case 'huggingface':
            result = await this.generateImageWithHuggingFace(prompt, provider.model, options);
            break;
          default:
            continue;
        }

        if (result.success) {
          console.log(`✅ Image generation successful with ${provider.provider}`);
          return result;
        } else {
          errors.push(`${provider.provider}: ${result.error}`);
          console.warn(`⚠️ ${provider.provider} failed:`, result.error);
        }
      } catch (error) {
        errors.push(`${provider.provider}: ${error.message}`);
        console.error(`❌ ${provider.provider} threw error:`, error);
        continue;
      }
    }

    // All providers failed, log all errors and return fallback
    console.error('❌ All image generation providers failed:', errors);
    return this.generateFallbackImage(prompt, options);
  }

  /**
   * Generate text with OpenAI
   */
  async generateWithOpenAI(prompt, options = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful AI assistant that creates educational content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1500,
        temperature: options.temperature || 0.7
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return {
        success: true,
        data: {
          text: content,
          provider: 'openai',
          model: options.model || 'gpt-3.5-turbo',
          usage: response.usage
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'openai'
      };
    }
  }

  /**
   * Generate text with HuggingFace (with multi-key rotation)
   */
  async generateWithHuggingFace(prompt, model, options = {}) {
    // Get all available HuggingFace keys
    const hfKeys = this.apiKeyManager.getAllKeys('huggingface');
    
    if (hfKeys.length === 0) {
      return {
        success: false,
        error: 'No HuggingFace API keys available',
        provider: 'huggingface'
      };
    }

    console.log(`🔑 Found ${hfKeys.length} HuggingFace API key(s) for text generation`);

    // Limit key attempts to prevent infinite loops
    const maxKeyAttempts = Math.min(hfKeys.length, 2);
    let unauthorizedCount = 0;

    // Try each key until one works
    for (let i = 0; i < maxKeyAttempts; i++) {
      const apiKey = hfKeys[i];
      
      try {
        console.log(`🔑 Trying HuggingFace key ${i + 1}/${hfKeys.length} with model ${model}`);
        
        const response = await fetch(`${this.huggingfaceBaseUrl}/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: options.maxTokens || 500,
              temperature: options.temperature || 0.7,
              do_sample: true,
              return_full_text: false
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Enhanced error handling for common issues
          if (response.status === 429) {
            console.warn(`⏰ HuggingFace key ${i + 1} rate limited (429) - trying next key`);
          } else if (response.status === 503) {
            console.warn(`🔧 HuggingFace model ${model} loading (503) with key ${i + 1} - trying next key`);
          } else if (response.status === 401) {
            unauthorizedCount++;
            console.warn(`🔑 HuggingFace key ${i + 1} unauthorized (401) - invalid key`);
            if (unauthorizedCount >= maxKeyAttempts) {
              console.warn(`⚠️ All keys unauthorized, stopping attempts`);
              break;
            }
          } else {
            console.warn(`❌ HuggingFace key ${i + 1} failed: ${response.status} - ${errorText}`);
          }
          continue; // Try next key
        }

        const data = await response.json();
        
        // Handle different response formats
        let generatedText;
        if (Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text;
        } else if (data.generated_text) {
          generatedText = data.generated_text;
        } else {
          console.warn(`❌ HuggingFace key ${i + 1} returned unexpected format`);
          continue; // Try next key
        }

        console.log(`✅ HuggingFace text generation successful with key ${i + 1}`);
        return {
          success: true,
          data: {
            text: generatedText,
            provider: 'huggingface',
            model: model,
            keyUsed: i + 1
          }
        };

      } catch (error) {
        console.warn(`❌ HuggingFace key ${i + 1} error:`, error.message);
        continue; // Try next key
      }
    }

    // All keys failed
    return {
      success: false,
      error: `All ${maxKeyAttempts} HuggingFace API keys failed`,
      provider: 'huggingface'
    };
  }

  /**
   * Generate text with HuggingFace Router (OpenAI-compatible API)
   * Provides better load balancing and reliability
   */
  async generateWithHuggingFaceRouter(prompt, model, options = {}) {
    // Get all available HuggingFace keys for router
    const hfKeys = this.apiKeyManager.getAllKeys('huggingface');
    
    if (hfKeys.length === 0) {
      return {
        success: false,
        error: 'No HuggingFace API keys available for router',
        provider: 'huggingface-router'
      };
    }

    console.log(`🚀 Using HuggingFace Router with ${hfKeys.length} key(s) for model: ${model}`);

    // Limit key attempts to prevent infinite loops
    const maxKeyAttempts = Math.min(hfKeys.length, 2);
    let unauthorizedCount = 0;

    // Try each key until one works
    for (let i = 0; i < maxKeyAttempts; i++) {
      const apiKey = hfKeys[i];
      
      try {
        console.log(`🔑 Trying HuggingFace Router key ${i + 1}/${hfKeys.length}`);
        
        // Create OpenAI client for this key
        const routerClient = new OpenAI({
          baseURL: "https://router.huggingface.co/v1",
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });

        const chatCompletion = await routerClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
        });

        const generatedText = chatCompletion.choices[0]?.message?.content;
        
        if (!generatedText) {
          console.warn(`❌ HuggingFace Router key ${i + 1} returned empty response`);
          continue; // Try next key
        }

        console.log(`✅ HuggingFace Router text generation successful with key ${i + 1}`);
        return {
          success: true,
          data: {
            text: generatedText,
            provider: 'huggingface-router',
            model: model,
            keyUsed: i + 1
          }
        };

      } catch (error) {
        console.warn(`❌ HuggingFace Router key ${i + 1} error:`, error.message);
        
        // Enhanced error handling for router API
        if (error.message.includes('429')) {
          console.warn(`⏰ HuggingFace Router key ${i + 1} rate limited - trying next key`);
        } else if (error.message.includes('401') || error.message.includes('Invalid credentials')) {
          unauthorizedCount++;
          console.warn(`🔑 HuggingFace Router key ${i + 1} unauthorized - invalid key (${unauthorizedCount}/${maxKeyAttempts})`);
          if (unauthorizedCount >= maxKeyAttempts) {
            console.warn(`⚠️ All router keys unauthorized, stopping attempts`);
            break;
          }
        } else if (error.message.includes('503')) {
          console.warn(`🔧 HuggingFace Router model ${model} unavailable with key ${i + 1} - trying next key`);
        }
        
        continue; // Try next key
      }
    }

    // All keys failed
    return {
      success: false,
      error: `All ${maxKeyAttempts} HuggingFace Router API keys failed`,
      provider: 'huggingface-router'
    };
  }

  /**
   * Generate images with HuggingFace - Fixed with proper headers and error handling
   */
  async generateImageWithHuggingFace(prompt, model, options = {}) {
    // Get all available HuggingFace keys
    const hfKeys = this.apiKeyManager.getAllKeys('huggingface');
    
    if (hfKeys.length === 0) {
      return {
        success: false,
        error: 'No HuggingFace API keys available for image generation',
        provider: 'huggingface'
      };
    }

    console.log(`🎨 Generating image with HuggingFace model: ${model} using ${hfKeys.length} key(s)`);
    
    // Verify correct endpoint URLs
    const validModels = {
      'runwayml/stable-diffusion-v1-5': 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      'stabilityai/stable-diffusion-2-1': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      'stabilityai/stable-diffusion-xl-base-1.0': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0'
    };
    
    const endpoint = validModels[model] || `${this.huggingfaceBaseUrl}/${model}`;

    // Try each key until one works
    for (let i = 0; i < hfKeys.length; i++) {
      const apiKey = hfKeys[i];
      
      try {
        console.log(`🔑 Trying HuggingFace key ${i + 1}/${hfKeys.length} for image generation`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: options.steps || 20,
              guidance_scale: options.guidance || 7.5
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Enhanced error handling for image generation
          if (response.status === 429) {
            console.warn(`⏰ HuggingFace key ${i + 1} rate limited (429) for image generation - trying next key`);
          } else if (response.status === 503) {
            console.warn(`🔧 HuggingFace image model ${model} loading (503) with key ${i + 1} - trying next key`);
          } else if (response.status === 401) {
            console.warn(`🔑 HuggingFace key ${i + 1} unauthorized (401) for image generation - invalid key`);
          } else {
            console.warn(`❌ HuggingFace key ${i + 1} failed for image generation: ${response.status} - ${errorText}`);
          }
          continue; // Try next key
        }

        // HuggingFace returns image as blob
        const imageBlob = await response.blob();
        
        // Validate blob
        if (!imageBlob || imageBlob.size === 0) {
          console.warn(`❌ HuggingFace key ${i + 1} returned empty image blob`);
          continue; // Try next key
        }
        
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log(`✅ HuggingFace image generation successful with key ${i + 1}`);

        return {
          success: true,
          data: {
            url: imageUrl,
            blob: imageBlob,
            provider: 'huggingface',
            model: model,
            prompt: prompt,
            keyUsed: i + 1,
            createdAt: new Date().toISOString()
          }
        };

      } catch (error) {
        console.warn(`❌ HuggingFace key ${i + 1} error:`, error.message);
        continue; // Try next key
      }
    }

    // All keys failed
    return {
      success: false,
      error: `All ${hfKeys.length} HuggingFace API keys failed for image generation`,
      provider: 'huggingface'
    };
  }

  /**
   * Generate with Deep AI - Enhanced with automatic fallback to HuggingFace
   */
  async generateWithDeepAI(prompt, options = {}) {
    try {
      console.log('🎨 Generating image with Deep AI...');
      
      // Validate API key
      if (!this.deepAIKey) {
        console.warn('⚠️ Deep AI API key not configured, falling back to HuggingFace');
        return await this.generateImageWithHuggingFace(prompt, 'runwayml/stable-diffusion-v1-5', options);
      }
      
      const formData = new FormData();
      formData.append('text', prompt);
      
      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
          'Api-Key': this.deepAIKey
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Deep AI API error (${response.status}):`, errorText);
        
        // Handle specific error cases with automatic fallback
        if (response.status === 401 || errorText.includes('Unauthorized') || errorText.includes('Out of API credits')) {
          console.warn('🔄 Deep AI unauthorized/out of credits, falling back to HuggingFace');
          return await this.generateImageWithHuggingFace(prompt, 'runwayml/stable-diffusion-v1-5', options);
        } else if (response.status === 429) {
          console.warn('🔄 Deep AI rate limit exceeded, falling back to HuggingFace');
          return await this.generateImageWithHuggingFace(prompt, 'runwayml/stable-diffusion-v1-5', options);
        } else {
          throw new Error(`Deep AI API error: ${response.status} - ${errorText}`);
        }
      }
      
      const data = await response.json();
      
      if (data.output_url) {
        console.log('✅ Deep AI image generation successful');
        return {
          success: true,
          data: {
            url: data.output_url,
            provider: 'deepai',
            prompt: prompt,
            createdAt: new Date().toISOString()
          }
        };
      } else {
        console.warn('🔄 Deep AI returned no output_url, falling back to HuggingFace');
        return await this.generateImageWithHuggingFace(prompt, 'runwayml/stable-diffusion-v1-5', options);
      }
    } catch (error) {
      console.error('❌ Deep AI generation failed, trying HuggingFace fallback:', error);
      try {
        return await this.generateImageWithHuggingFace(prompt, 'runwayml/stable-diffusion-v1-5', options);
      } catch (fallbackError) {
        console.error('❌ HuggingFace fallback also failed:', fallbackError);
        return {
          success: false,
          error: `Deep AI failed: ${error.message}, HuggingFace fallback failed: ${fallbackError.message}`,
          provider: 'deepai'
        };
      }
    }
  }

  /**
   * Generate with Qwen Image Detail Slider - Enhanced with error handling
   */
  async generateWithQwen(prompt, options = {}) {
    try {
      console.log('🎨 Using Qwen Image Detail Slider for generation');
      
      // Use the Qwen image service with comprehensive error handling
      const result = await qwenImageService.generateWithQwenDetailSlider(prompt, {
        detailLevel: options.detailLevel || 'normal',
        steps: options.steps || 5,
        guidance: options.guidance || 7.5,
        width: options.width || 1024,
        height: options.height || 1024
      });

      if (result.success) {
        console.log('✅ Qwen image generation successful');
        return {
          success: true,
          data: {
            ...result.data,
            provider: 'qwen-enhanced'
          }
        };
      } else {
        console.warn('⚠️ Qwen generation failed:', result.error);
        throw new Error(result.error || 'Qwen generation failed');
      }
    } catch (error) {
      console.error('❌ Qwen generation error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'qwen'
      };
    }
  }

  /**
   * Generate with removed service (stub method)
   */
  async generateWithBytez(prompt, model, options = {}) {
    // Service removed - dependency not available
    return {
      success: false,
      error: 'Integration removed - dependency not available',
      provider: 'removed'
    };
  }

  /**
   * Generate course outline with multi-API support
   */
  async generateCourseOutline(courseData) {
    const prompt = `Create a comprehensive course outline for "${courseData.title}".
    
Course Details:
- Subject: ${courseData.subject || courseData.title}
- Description: ${courseData.description || 'Not provided'}
- Target Audience: ${courseData.targetAudience || 'General learners'}
- Difficulty: ${courseData.difficulty || 'beginner'}
- Duration: ${courseData.duration || '4 weeks'}

Please create a structured course with:
- 4 modules
- Each module should have 2-3 lessons
- Include clear learning objectives
- Make it practical and engaging

Format the response as JSON with this structure:
{
  "course_title": "Course Title",
  "modules": [
    {
      "title": "Module Name",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson Name",
          "description": "Lesson description",
          "duration": "15 min"
        }
      ]
    }
  ]
}`;

    const result = await this.generateText(prompt, {
      systemPrompt: "You are an expert course designer. Create well-structured, educational course outlines in JSON format.",
      maxTokens: 1500,
      temperature: 0.7
    });

    if (result.success) {
      try {
        // Try to parse JSON response
        const content = result.data.text;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        const courseOutline = JSON.parse(jsonString);

        return {
          success: true,
          data: courseOutline,
          provider: result.data.provider
        };
      } catch (parseError) {
        console.warn('Failed to parse JSON, using fallback structure');
        return {
          success: true,
          data: this.createFallbackOutline(courseData),
          provider: result.data.provider
        };
      }
    }

    // If all text generation failed, use fallback generator
    console.log('🔄 Using fallback course generator...');
    const fallbackResult = this.fallbackGenerator.generateCourseOutline(courseData);
    
    if (fallbackResult.success) {
      return {
        success: true,
        data: fallbackResult.data,
        provider: 'fallback',
        note: 'Generated using template-based fallback system'
      };
    }
    
    return {
      success: false,
      error: result.error || 'All generation methods failed',
      provider: 'none'
    };
  }

  /**
   * Generate course image with enhanced prompt and fallback handling
   */
  async generateCourseImage(prompt, options = {}) {
    // Create standardized course thumbnail prompt
    const enhancedPrompt = `Professional course thumbnail for ${prompt}, clean, modern, educational, corporate style, minimalistic, high quality, 1024x1024 resolution`;
    
    console.log('🎨 Generating course thumbnail with enhanced prompt:', enhancedPrompt);
    
    const result = await this.generateImage(enhancedPrompt, options);
    
    if (result.success) {
      return {
        success: true,
        data: {
          url: result.data.url,
          blob: result.data.blob,
          prompt: enhancedPrompt,
          provider: result.data.provider,
          model: result.data.model,
          size: options.size || '1024x1024',
          createdAt: result.data.createdAt || new Date().toISOString()
        }
      };
    }

    // If all providers failed, return placeholder
    console.warn('🔄 All image generation failed, returning placeholder');
    return this.generateFallbackImage(enhancedPrompt, options);
  }

  /**
   * Generate fallback text when all providers fail
   */
  generateFallbackText(prompt, options = {}) {
    return {
      success: false,
      data: {
        text: `This is a fallback response for: ${prompt.substring(0, 100)}...`,
        provider: 'fallback'
      },
      error: 'All text generation providers failed'
    };
  }

  /**
   * Generate fallback image when all providers fail - Fixed with placehold.co
   */
  generateFallbackImage(prompt, options = {}) {
    const placeholderColor = '6366f1';
    const placeholderText = encodeURIComponent('Course Image');
    
    console.log('🔄 All image providers failed, using fallback placeholder');
    
    return {
      success: false,
      data: {
        url: `https://placehold.co/1024x1024/6366f1/ffffff?text=Course+Image`,  // Fixed: Use placehold.co with proper format
        provider: 'fallback',
        prompt: prompt,
        createdAt: new Date().toISOString()
      },
      error: 'All image generation providers failed'
    };
  }

  /**
   * Create fallback course outline structure
   */
  createFallbackOutline(courseData) {
    const subject = courseData.subject || courseData.title;
    
    return {
      course_title: courseData.title,
      modules: [
        {
          title: `Introduction to ${subject}`,
          description: `Foundational concepts and overview of ${subject}`,
          lessons: [
            {
              title: `What is ${subject}?`,
              description: "Understanding the basics and core concepts",
              duration: "15 min"
            },
            {
              title: `Why Learn ${subject}?`,
              description: "Benefits and real-world applications",
              duration: "10 min"
            },
            {
              title: "Getting Started",
              description: "Setting up your learning environment",
              duration: "20 min"
            }
          ]
        },
        {
          title: `${subject} Fundamentals`,
          description: "Core principles and essential knowledge",
          lessons: [
            {
              title: "Key Concepts",
              description: "Essential terminology and principles",
              duration: "25 min"
            },
            {
              title: "Basic Techniques",
              description: "Fundamental methods and approaches",
              duration: "30 min"
            }
          ]
        },
        {
          title: `Practical ${subject}`,
          description: "Hands-on experience and real-world applications",
          lessons: [
            {
              title: "Hands-on Practice",
              description: "Apply concepts through practical exercises",
              duration: "45 min"
            }
          ]
        },
        {
          title: `Advanced ${subject}`,
          description: "Expert-level concepts and advanced techniques",
          lessons: [
            {
              title: "Advanced Concepts",
              description: "Complex topics and advanced applications",
              duration: "40 min"
            }
          ]
        }
      ]
    };
  }

  /**
   * Test all API connections
   */
  async testAllAPIs() {
    const results = {
      openai: { available: false, error: null },
      huggingface: { available: false, error: null },
      deepai: { available: false, error: null }
    };

    // Test OpenAI
    try {
      const result = await this.generateWithOpenAI("Hello", { maxTokens: 10 });
      results.openai.available = result.success;
      if (!result.success) results.openai.error = result.error;
    } catch (error) {
      results.openai.error = error.message;
    }

    // Test HuggingFace
    try {
      const result = await this.generateWithHuggingFace("Hello", "tiiuae/falcon-7b-instruct", { maxTokens: 10 });
      results.huggingface.available = result.success;
      if (!result.success) results.huggingface.error = result.error;
    } catch (error) {
      results.huggingface.error = error.message;
    }

    // Test Deep AI
    try {
      const result = await this.generateWithDeepAI("test image");
      results.deepai.available = result.success;
      if (!result.success) results.deepai.error = result.error;
    } catch (error) {
      results.deepai.error = error.message;
    }

    return results;
  }

  /**
   * Get API status and model availability
   */
  async getAPIStatus() {
    const testResults = await this.testAllAPIs();
    
    return {
      providers: {
        openai: {
          available: testResults.openai.available,
          models: ['gpt-3.5-turbo', 'gpt-4'],
          capabilities: ['text', 'chat'],
          error: testResults.openai.error
        },
        huggingface: {
          available: testResults.huggingface.available,
          models: [
            'meta-llama/Llama-3.1-8B-Instruct',
            'tiiuae/falcon-7b-instruct',
            'runwayml/stable-diffusion-v1-5',
            'stabilityai/stable-diffusion-2-1'
          ],
          capabilities: ['text', 'image'],
          error: testResults.huggingface.error
        },
        deepai: {
          available: testResults.deepai.available,
          models: ['text2img'],
          capabilities: ['image'],
          error: testResults.deepai.error
        }
      },
      summary: {
        totalProviders: 3,
        availableProviders: Object.values(testResults).filter(r => r.available).length,
        textProviders: [testResults.openai, testResults.huggingface].filter(r => r.available).length,
        imageProviders: [testResults.huggingface, testResults.deepai].filter(r => r.available).length
      }
    };
  }
}

// Create and export singleton instance
const enhancedAIService = new EnhancedAIService();
export default enhancedAIService;

// Export individual methods for convenience
export const {
  generateText,
  generateImage,
  generateCourseOutline,
  generateCourseImage,
  testAllAPIs,
  getAPIStatus
} = enhancedAIService;
