// AIServiceRouter.js - Multi-provider AI service router with reliability improvements
import DOMPurify from 'dompurify';

class AIServiceRouter {
  constructor() {
    // API Keys from environment variables
    this.apiKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      stability: import.meta.env.VITE_STABILITY_API_KEY,
      elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY,
      assemblyai: import.meta.env.VITE_ASSEMBLYAI_API_KEY
    };
    
    // Provider priority order (fallback sequence)
    this.providerPriority = {
      text: ['openai'],
      image: ['stability', 'openai'],
      tts: ['elevenlabs'],
      stt: ['assemblyai', 'openai']
    };
    
    // Rate limiting
    this.requestCounts = new Map();
    this.rateLimits = {
      text: { max: 50, window: 60000 }, // 50 requests per minute
      image: { max: 20, window: 60000 }, // 20 requests per minute
      tts: { max: 30, window: 60000 }, // 30 requests per minute
      stt: { max: 30, window: 60000 } // 30 requests per minute
    };
    
    // Memory management for blob URLs
    this.blobUrls = new Set();
    
    // Request timeout
    this.defaultTimeout = 30000; // 30 seconds
    
    console.log('✅ AIServiceRouter initialized with reliability improvements');
  }

  /**
   * Generate text using the best available provider with validation and rate limiting
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      // Input validation
      const validationResult = this.validateTextInput(prompt, options);
      if (!validationResult.valid) {
        throw new Error(`Invalid input: ${validationResult.error}`);
      }
      
      // Rate limiting check
      if (!this.checkRateLimit('text')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Sanitize input
      const sanitizedPrompt = this.sanitizeInput(prompt);
      const sanitizedOptions = this.sanitizeOptions(options);
      
      const providers = this.providerPriority.text;
      const errors = [];
      
      for (const provider of providers) {
        try {
          console.log(`🤖 Attempting text generation with ${provider}`);
          
          let result;
          switch (provider) {
            case 'openai':
              if (this.validateApiKey('openai')) {
                result = await this.generateTextWithOpenAI(sanitizedPrompt, sanitizedOptions);
              } else {
                errors.push(`${provider}: API key not configured`);
                continue;
              }
              break;
            default:
              errors.push(`${provider}: Provider not implemented`);
              continue;
          }
          
          if (result) {
            console.log(`✅ Text generation successful with ${provider}`);
            return this.sanitizeOutput(result);
          }
        } catch (error) {
          const errorMsg = this.getErrorMessage(error);
          errors.push(`${provider}: ${errorMsg}`);
          console.warn(`⚠️ Text generation failed with ${provider}:`, errorMsg);
          
          // Don't continue if it's a rate limit or auth error
          if (error.message.includes('rate limit') || error.message.includes('401')) {
            break;
          }
        }
      }
      
      // All providers failed
      const errorMessage = `All text generation providers failed: ${errors.join(', ')}`;
      console.error('❌ Text generation failed:', errorMessage);
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error('Text generation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate text using OpenAI with comprehensive error handling
   */
  async generateTextWithOpenAI(prompt, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);
    
    try {
      const requestBody = {
        model: this.validateModel(options.model, 'gpt-3.5-turbo'), // Fallback to more reliable model
        messages: [{ role: 'user', content: prompt }],
        temperature: Math.max(0, Math.min(options.temperature || 0.7, 2)), // Clamp temperature
        max_tokens: Math.min(options.maxTokens || 1000, 4000), // Limit tokens
        ...this.filterValidOptions(options)
      };
      
      console.log('📤 OpenAI request:', { model: requestBody.model, promptLength: prompt.length });
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CreditorUserDash/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `OpenAI API error: ${response.status}`;
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error?.message || errorMessage;
        } catch (e) {
          // Use default error message if parsing fails
        }
        
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI configuration.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your input.');
        } else if (response.status >= 500) {
          throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      const content = data.choices[0].message.content;
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from OpenAI');
      }
      
      console.log('📥 OpenAI response received:', { 
        contentLength: content.length, 
        usage: data.usage 
      });
      
      return content;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  }


  /**
   * Generate image using the best available provider with validation
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated image URL or base64 data
   */
  async generateImage(prompt, options = {}) {
    try {
      // Input validation
      const validationResult = this.validateImageInput(prompt, options);
      if (!validationResult.valid) {
        throw new Error(`Invalid input: ${validationResult.error}`);
      }
      
      // Rate limiting check
      if (!this.checkRateLimit('image')) {
        throw new Error('Image generation rate limit exceeded. Please try again later.');
      }
      
      // Sanitize input
      const sanitizedPrompt = this.sanitizeInput(prompt);
      const sanitizedOptions = this.sanitizeImageOptions(options);
      
      const providers = this.providerPriority.image;
      const errors = [];
      
      for (const provider of providers) {
        try {
          console.log(`🎨 Attempting image generation with ${provider}`);
          
          let result;
          switch (provider) {
            case 'stability':
              if (this.validateApiKey('stability')) {
                result = await this.generateImageWithStability(sanitizedPrompt, sanitizedOptions);
              } else {
                errors.push(`${provider}: API key not configured`);
                continue;
              }
              break;
            case 'openai':
              if (this.validateApiKey('openai')) {
                result = await this.generateImageWithDalle(sanitizedPrompt, sanitizedOptions);
              } else {
                errors.push(`${provider}: API key not configured`);
                continue;
              }
              break;
            default:
              errors.push(`${provider}: Provider not implemented`);
              continue;
          }
          
          if (result && this.validateImageUrl(result)) {
            console.log(`✅ Image generation successful with ${provider}`);
            return result;
          } else {
            errors.push(`${provider}: Invalid image URL returned`);
          }
        } catch (error) {
          const errorMsg = this.getErrorMessage(error);
          errors.push(`${provider}: ${errorMsg}`);
          console.warn(`⚠️ Image generation failed with ${provider}:`, errorMsg);
          
          // Don't continue if it's a rate limit or auth error
          if (error.message.includes('rate limit') || error.message.includes('401')) {
            break;
          }
        }
      }
      
      // All providers failed
      const errorMessage = `All image generation providers failed: ${errors.join(', ')}`;
      console.error('❌ Image generation failed:', errorMessage);
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error('Image generation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate image using Stability AI
   */
  async generateImageWithStability(prompt, options = {}) {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.stability}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: options.cfgScale || 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: options.samples || 1,
        steps: options.steps || 30
      })
    });

    if (!response.ok) {
      throw new Error(`Stability AI API error: ${response.status}`);
    }

    const data = await response.json();
    // Return base64 encoded image
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }

  /**
   * Generate image using OpenAI DALL·E
   */
  async generateImageWithDalle(prompt, options = {}) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'dall-e-3',
        prompt: prompt,
        n: options.samples || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard'
      })
    });

    if (!response.ok) {
      throw new Error(`DALL·E API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }


  /**
   * Convert text to speech using the best available provider
   * @param {string} text - Text to convert to speech
   * @param {Object} options - TTS options
   * @returns {Promise<string>} Audio file URL
   */
  async textToSpeech(text, options = {}) {
    const providers = this.providerPriority.tts;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'elevenlabs':
            if (this.apiKeys.elevenlabs) {
              return await this.textToSpeechWithElevenLabs(text, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Text-to-speech failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    throw new Error('All text-to-speech providers failed');
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeechWithElevenLabs(text, options = {}) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': this.apiKeys.elevenlabs,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: options.modelId || 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    // Create blob URL and track it for cleanup
    const blobUrl = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));
    this.blobUrls.add(blobUrl);
    
    // Auto-cleanup after 1 hour
    setTimeout(() => {
      this.cleanupBlobUrl(blobUrl);
    }, 3600000);
    
    return blobUrl;
  }

  /**
   * Convert speech to text using the best available provider
   * @param {ArrayBuffer} audioBuffer - Audio file buffer
   * @param {Object} options - STT options
   * @returns {Promise<string>} Transcribed text
   */
  async speechToText(audioBuffer, options = {}) {
    const providers = this.providerPriority.stt;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'assemblyai':
            if (this.apiKeys.assemblyai) {
              return await this.speechToTextWithAssemblyAI(audioBuffer, options);
            }
            break;
          case 'openai':
            if (this.apiKeys.openai) {
              return await this.speechToTextWithWhisper(audioBuffer, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Speech-to-text failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    throw new Error('All speech-to-text providers failed');
  }

  /**
   * Convert speech to text using Whisper (OpenAI)
   */
  async speechToTextWithWhisper(audioBuffer, options = {}) {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
    formData.append('model', options.model || 'whisper-1');
    formData.append('response_format', 'text');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    return await response.text();
  }

  /**
   * Convert speech to text using AssemblyAI
   */
  async speechToTextWithAssemblyAI(audioBuffer, options = {}) {
    // Upload audio file
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': this.apiKeys.assemblyai
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload error: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    
    // Transcribe audio
    const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': this.apiKeys.assemblyai,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: uploadData.upload_url,
        language_detection: options.detectLanguage || false
      })
    });

    if (!transcribeResponse.ok) {
      throw new Error(`AssemblyAI transcribe error: ${transcribeResponse.status}`);
    }

    const transcribeData = await transcribeResponse.json();
    const transcriptId = transcribeData.id;
    
    // Poll for completion
    let transcript;
    do {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': this.apiKeys.assemblyai
        }
      });
      transcript = await pollResponse.json();
    } while (transcript.status !== 'completed' && transcript.status !== 'error');
    
    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
    }
    
    return transcript.text;
  }

  /**
   * Check if a specific provider is configured
   * @param {string} provider - Provider name
   * @returns {boolean} Whether the provider is configured
   */
  isProviderConfigured(provider) {
    switch (provider) {
      case 'openai':
        return !!this.apiKeys.openai;
      case 'stability':
        return !!this.apiKeys.stability;
      case 'elevenlabs':
        return !!this.apiKeys.elevenlabs;
      case 'assemblyai':
        return !!this.apiKeys.assemblyai;
      default:
        return false;
    }
  }

  /**
   * Get list of available providers for a service type
   * @param {string} serviceType - Service type (text, image, tts, stt)
   * @returns {Array<string>} Available providers
   */
  getAvailableProviders(serviceType) {
    const providers = this.providerPriority[serviceType] || [];
    return providers.filter(provider => this.isProviderConfigured(provider));
  }

  // ===== VALIDATION METHODS =====

  /**
   * Validate text input
   */
  validateTextInput(prompt, options) {
    if (!prompt || typeof prompt !== 'string') {
      return { valid: false, error: 'Prompt must be a non-empty string' };
    }
    
    if (prompt.length > 10000) {
      return { valid: false, error: 'Prompt too long (max 10,000 characters)' };
    }
    
    if (prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' };
    }
    
    return { valid: true };
  }

  /**
   * Validate image input
   */
  validateImageInput(prompt, options) {
    if (!prompt || typeof prompt !== 'string') {
      return { valid: false, error: 'Image prompt must be a non-empty string' };
    }
    
    if (prompt.length > 1000) {
      return { valid: false, error: 'Image prompt too long (max 1,000 characters)' };
    }
    
    // Check for inappropriate content keywords
    const inappropriateKeywords = ['nsfw', 'nude', 'explicit', 'violence', 'gore'];
    const lowerPrompt = prompt.toLowerCase();
    for (const keyword of inappropriateKeywords) {
      if (lowerPrompt.includes(keyword)) {
        return { valid: false, error: 'Inappropriate content detected in prompt' };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validate API key
   */
  validateApiKey(provider) {
    const key = this.apiKeys[provider];
    return key && typeof key === 'string' && key.length > 10;
  }

  /**
   * Validate model name
   */
  validateModel(model, fallback) {
    const validModels = {
      'gpt-4': true,
      'gpt-4-turbo': true,
      'gpt-3.5-turbo': true,
      'gpt-3.5-turbo-16k': true
    };
    
    return validModels[model] ? model : fallback;
  }

  /**
   * Validate image URL
   */
  validateImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'blob:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // ===== SANITIZATION METHODS =====

  /**
   * Sanitize input text
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous content
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    }).trim();
  }

  /**
   * Sanitize options object
   */
  sanitizeOptions(options) {
    const sanitized = {};
    const allowedKeys = ['model', 'temperature', 'maxTokens', 'systemPrompt'];
    
    for (const key of allowedKeys) {
      if (options[key] !== undefined) {
        sanitized[key] = options[key];
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize image options
   */
  sanitizeImageOptions(options) {
    const sanitized = {};
    const allowedKeys = ['width', 'height', 'steps', 'guidance_scale', 'style'];
    
    for (const key of allowedKeys) {
      if (options[key] !== undefined) {
        sanitized[key] = options[key];
      }
    }
    
    // Ensure numeric values are within safe ranges
    if (sanitized.width) sanitized.width = Math.min(Math.max(sanitized.width, 256), 1024);
    if (sanitized.height) sanitized.height = Math.min(Math.max(sanitized.height, 256), 1024);
    if (sanitized.steps) sanitized.steps = Math.min(Math.max(sanitized.steps, 10), 50);
    
    return sanitized;
  }

  /**
   * Sanitize output text
   */
  sanitizeOutput(output) {
    if (!output || typeof output !== 'string') return '';
    
    return DOMPurify.sanitize(output).trim();
  }

  /**
   * Filter valid options for API calls
   */
  filterValidOptions(options) {
    const filtered = {};
    const validKeys = ['presence_penalty', 'frequency_penalty', 'top_p', 'stop'];
    
    for (const key of validKeys) {
      if (options[key] !== undefined) {
        filtered[key] = options[key];
      }
    }
    
    return filtered;
  }

  // ===== RATE LIMITING METHODS =====

  /**
   * Check rate limit for service type
   */
  checkRateLimit(serviceType) {
    const now = Date.now();
    const limit = this.rateLimits[serviceType];
    
    if (!limit) return true;
    
    const key = `${serviceType}_requests`;
    const requests = this.requestCounts.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < limit.window);
    
    // Check if we're under the limit
    if (validRequests.length >= limit.max) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requestCounts.set(key, validRequests);
    
    return true;
  }

  // ===== UTILITY METHODS =====

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    if (!error) return 'Unknown error';
    
    const message = error.message || error.toString();
    
    // Common error patterns
    if (message.includes('fetch')) return 'Network connection failed';
    if (message.includes('timeout')) return 'Request timed out';
    if (message.includes('401')) return 'Invalid API key';
    if (message.includes('429')) return 'Rate limit exceeded';
    if (message.includes('500')) return 'Service temporarily unavailable';
    
    return message;
  }

  /**
   * Clean up blob URL to prevent memory leaks
   */
  cleanupBlobUrl(url) {
    if (this.blobUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(url);
      console.log('🧹 Cleaned up blob URL:', url.substring(0, 50) + '...');
    }
  }

  /**
   * Clean up all blob URLs
   */
  cleanupAllBlobUrls() {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();
    console.log('🧹 Cleaned up all blob URLs');
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      providers: {
        openai: this.validateApiKey('openai'),
        stability: this.validateApiKey('stability'),
        elevenlabs: this.validateApiKey('elevenlabs'),
        assemblyai: this.validateApiKey('assemblyai')
      },
      rateLimits: this.rateLimits,
      activeBlobs: this.blobUrls.size,
      requestCounts: Object.fromEntries(this.requestCounts)
    };
  }
}

// Export singleton instance
export default new AIServiceRouter();