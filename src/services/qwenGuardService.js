// Qwen3Guard Content Moderation Service
// Provides comprehensive content safety checking using Qwen3Guard models
import apiKeyManager from './apiKeyManager.js';

/**
 * Qwen3Guard Content Moderation Service
 * Uses Qwen/Qwen3Guard-Gen-0.6B for prompt moderation
 * Uses Qwen/Qwen3Guard-4B-Gen for response moderation
 */
class QwenGuardService {
  constructor() {
    // Initialize API key manager
    this.apiKeyManager = apiKeyManager;

    // Model configurations
    this.models = {
      promptModeration: 'Qwen/Qwen3Guard-Gen-0.6B',    // For prompt moderation
      responseModeration: 'Qwen/Qwen3Guard-4B-Gen'     // For response moderation
    };

    this.categories = [
      'Violent',
      'Non-violent Illegal Acts',
      'Sexual Content or Sexual Acts',
      'PII',
      'Suicide & Self-Harm',
      'Unethical Acts',
      'Politically Sensitive Topics',
      'Copyright Violation',
      'Jailbreak',
      'None'
    ];
  }

  /**
   * Extract safety label and categories from Qwen3Guard response
   * @param {string} content - Response content from model
   * @returns {Object} Parsed safety information
   */
  extractSafetyInfo(content) {
    const safetyPattern = /Safety: (Safe|Unsafe|Controversial)/;
    const categoryPattern = /(Violent|Non-violent Illegal Acts|Sexual Content or Sexual Acts|PII|Suicide & Self-Harm|Unethical Acts|Politically Sensitive Topics|Copyright Violation|Jailbreak|None)/g;
    const refusalPattern = /Refusal: (Yes|No)/;

    const safetyMatch = content.match(safetyPattern);
    const refusalMatch = content.match(refusalPattern);
    const categories = content.match(categoryPattern) || [];

    return {
      safety: safetyMatch ? safetyMatch[1] : null,
      categories: [...new Set(categories)], // Remove duplicates
      refusal: refusalMatch ? refusalMatch[1] : null,
      rawContent: content
    };
  }

  /**
   * Check if Bytez is available using the enhanced BytezService
   * @returns {Promise<Object>} Bytez constructor or error
   */
  async getBytez() {
    try {
      // Try bytez package first
      const bytezModule = await import('bytez');
      const Bytez = bytezModule.Bytez || bytezModule.default;
      
      if (Bytez && typeof Bytez === 'function') {
        return { success: true, Bytez, type: 'bytez' };
      }
    } catch (error) {
      console.warn('Bytez package not available, trying bytez.js:', error.message);
    }

    try {
      // Try bytez.js package as fallback
      const bytezJsModule = await import('bytez.js');
      const BytezJs = bytezJsModule.Bytez || bytezJsModule.default || bytezJsModule;
      
      if (BytezJs && typeof BytezJs === 'function') {
        return { success: true, Bytez: BytezJs, type: 'bytez.js' };
      }
    } catch (error) {
      console.warn('Bytez.js package not available:', error.message);
    }

    return { 
      success: false, 
      error: 'Neither bytez nor bytez.js packages are available' 
    };
  }

  /**
   * Moderate a prompt for safety using Qwen3Guard-Gen-0.6B
   * @param {string} prompt - User prompt to moderate
   * @returns {Promise<Object>} Moderation result
   */
  async moderatePrompt(prompt) {
    try {
      console.log('🛡️ Moderating prompt with Qwen3Guard-Gen-0.6B:', prompt.substring(0, 50) + '...');

      const bytezResult = await this.getBytez();
      if (!bytezResult.success) {
        return {
          success: false,
          error: bytezResult.error,
          data: { safety: 'Unknown', categories: [], refusal: null }
        };
      }

      const { Bytez, type: packageType } = bytezResult;

      // Get all available Bytez keys using API key manager
      const bytezKeys = this.apiKeyManager.getAllKeys('bytez');
      
      if (bytezKeys.length === 0) {
        console.warn('⚠️ No valid Bytez API keys configured for content moderation');
        return {
          success: false,
          error: 'No valid Bytez API keys configured. Content moderation unavailable.',
          data: { safety: 'Unknown', categories: [], refusal: null }
        };
      }

      console.log(`🔑 Found ${bytezKeys.length} valid Bytez API key(s) for moderation`);

      // Try each API key for prompt moderation
      for (let i = 0; i < bytezKeys.length; i++) {
        try {
          console.log(`🔑 Trying prompt moderation with Bytez key ${i + 1}/${bytezKeys.length}`);
          
          // Create Bytez client based on package type
          const bytez = packageType === 'bytez.js' 
            ? new Bytez({ apiKey: bytezKeys[i] })
            : new Bytez(bytezKeys[i]);
          
          // Format for prompt moderation (user message only)
          const messages = [
            { role: 'user', content: prompt }
          ];

          const response = await bytez.completion({
            model: this.models.promptModeration,
            messages: messages,
            max_tokens: 128,
            temperature: 0.1
          });

          if (response?.choices?.[0]?.message?.content) {
            const content = response.choices[0].message.content;
            const safetyInfo = this.extractSafetyInfo(content);
            
            console.log(`✅ Prompt moderation successful with key ${i + 1}:`, safetyInfo);
            
            return {
              success: true,
              data: {
                ...safetyInfo,
                model: this.models.promptModeration,
                type: 'prompt_moderation',
                timestamp: new Date().toISOString()
              }
            };
          }
        } catch (error) {
          console.warn(`Prompt moderation failed with key ${i + 1}:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'All Bytez API keys failed for prompt moderation',
        data: { safety: 'Unknown', categories: [], refusal: null }
      };

    } catch (error) {
      console.error('❌ Prompt moderation error:', error);
      return {
        success: false,
        error: error.message,
        data: { safety: 'Unknown', categories: [], refusal: null }
      };
    }
  }

  /**
   * Moderate a response for safety using Qwen3Guard-4B-Gen
   * @param {string} prompt - Original user prompt
   * @param {string} response - AI-generated response to moderate
   * @returns {Promise<Object>} Moderation result
   */
  async moderateResponse(prompt, response) {
    try {
      console.log('🛡️ Moderating response with Qwen3Guard-4B-Gen');

      const bytezResult = await this.getBytez();
      if (!bytezResult.success) {
        return {
          success: false,
          error: bytezResult.error,
          data: { safety: 'Unknown', categories: [], refusal: null }
        };
      }

      const { Bytez, type: packageType } = bytezResult;

      // Get all available Bytez keys using API key manager
      const bytezKeys = this.apiKeyManager.getAllKeys('bytez');
      
      if (bytezKeys.length === 0) {
        console.warn('⚠️ No valid Bytez API keys configured for response moderation');
        return {
          success: false,
          error: 'No valid Bytez API keys configured. Response moderation unavailable.',
          data: { safety: 'Unknown', categories: [], refusal: null }
        };
      }

      // Try each API key for response moderation
      for (let i = 0; i < bytezKeys.length; i++) {
        try {
          console.log(`🔑 Trying response moderation with Bytez key ${i + 1}/${bytezKeys.length}`);
          
          // Create Bytez client based on package type
          const bytez = packageType === 'bytez.js' 
            ? new Bytez({ apiKey: bytezKeys[i] })
            : new Bytez(bytezKeys[i]);
          
          // Format for response moderation (user + assistant messages)
          const messages = [
            { role: 'user', content: prompt },
            { role: 'assistant', content: response }
          ];

          const moderationResponse = await bytez.completion({
            model: this.models.responseModeration,
            messages: messages,
            max_tokens: 128,
            temperature: 0.1
          });

          if (moderationResponse?.choices?.[0]?.message?.content) {
            const content = moderationResponse.choices[0].message.content;
            const safetyInfo = this.extractSafetyInfo(content);
            
            console.log(`✅ Response moderation successful with key ${i + 1}:`, safetyInfo);
            
            return {
              success: true,
              data: {
                ...safetyInfo,
                model: this.models.responseModeration,
                type: 'response_moderation',
                timestamp: new Date().toISOString()
              }
            };
          }
        } catch (error) {
          console.warn(`Response moderation failed with key ${i + 1}:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'All Bytez API keys failed for response moderation',
        data: { safety: 'Unknown', categories: [], refusal: null }
      };

    } catch (error) {
      console.error('❌ Response moderation error:', error);
      return {
        success: false,
        error: error.message,
        data: { safety: 'Unknown', categories: [], refusal: null }
      };
    }
  }

  /**
   * Comprehensive content moderation for course content
   * @param {string} title - Course/lesson title
   * @param {string} content - Content to moderate
   * @param {Object} options - Moderation options
   * @returns {Promise<Object>} Comprehensive moderation result
   */
  async moderateCourseContent(title, content, options = {}) {
    try {
      console.log('🛡️ Comprehensive course content moderation:', title);

      const results = {
        title: title,
        contentLength: content.length,
        timestamp: new Date().toISOString(),
        moderation: {
          prompt: null,
          response: null
        },
        overall: {
          safe: false,
          issues: [],
          recommendations: []
        }
      };

      // Step 1: Moderate the title/prompt
      const promptModeration = await this.moderatePrompt(`Create educational content about: ${title}`);
      results.moderation.prompt = promptModeration.data;

      // Step 2: Moderate the generated content
      const responseModeration = await this.moderateResponse(
        `Create educational content about: ${title}`,
        content
      );
      results.moderation.response = responseModeration.data;

      // Step 3: Analyze overall safety
      const promptSafe = promptModeration.data.safety === 'Safe';
      const responseSafe = responseModeration.data.safety === 'Safe';
      const noRefusal = responseModeration.data.refusal !== 'Yes';

      results.overall.safe = promptSafe && responseSafe && noRefusal;

      // Collect issues
      if (!promptSafe) {
        results.overall.issues.push({
          type: 'prompt_safety',
          severity: promptModeration.data.safety,
          categories: promptModeration.data.categories
        });
      }

      if (!responseSafe) {
        results.overall.issues.push({
          type: 'content_safety',
          severity: responseModeration.data.safety,
          categories: responseModeration.data.categories
        });
      }

      if (responseModeration.data.refusal === 'Yes') {
        results.overall.issues.push({
          type: 'content_refusal',
          severity: 'High',
          description: 'Content appears to be a refusal response'
        });
      }

      // Generate recommendations
      if (results.overall.issues.length > 0) {
        results.overall.recommendations = this.generateRecommendations(results.overall.issues);
      }

      console.log(`🛡️ Content moderation complete. Safe: ${results.overall.safe}, Issues: ${results.overall.issues.length}`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('❌ Course content moderation error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Generate recommendations based on moderation issues
   * @param {Array} issues - Array of moderation issues
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(issues) {
    const recommendations = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'prompt_safety':
          recommendations.push({
            type: 'content_revision',
            message: 'Consider revising the course topic to focus on educational aspects',
            priority: 'high'
          });
          break;
        case 'content_safety':
          recommendations.push({
            type: 'content_filtering',
            message: 'Review and filter potentially harmful content before publishing',
            priority: 'high'
          });
          break;
        case 'content_refusal':
          recommendations.push({
            type: 'content_regeneration',
            message: 'Regenerate content with more specific educational prompts',
            priority: 'medium'
          });
          break;
      }

      if (issue.categories && issue.categories.length > 0) {
        issue.categories.forEach(category => {
          if (category !== 'None') {
            recommendations.push({
              type: 'category_specific',
              message: `Address ${category} content concerns in course materials`,
              category: category,
              priority: 'medium'
            });
          }
        });
      }
    });

    return recommendations;
  }

  /**
   * Batch moderate multiple pieces of content
   * @param {Array} contentItems - Array of {title, content} objects
   * @returns {Promise<Object>} Batch moderation results
   */
  async batchModerate(contentItems) {
    try {
      console.log(`🛡️ Batch moderating ${contentItems.length} content items`);

      const results = [];
      const summary = {
        total: contentItems.length,
        safe: 0,
        unsafe: 0,
        errors: 0,
        categories: {}
      };

      for (let i = 0; i < contentItems.length; i++) {
        const item = contentItems[i];
        console.log(`🛡️ Moderating item ${i + 1}/${contentItems.length}: ${item.title}`);

        try {
          const result = await this.moderateCourseContent(item.title, item.content);
          
          if (result.success) {
            results.push(result.data);
            
            if (result.data.overall.safe) {
              summary.safe++;
            } else {
              summary.unsafe++;
              
              // Count categories
              result.data.overall.issues.forEach(issue => {
                if (issue.categories) {
                  issue.categories.forEach(cat => {
                    summary.categories[cat] = (summary.categories[cat] || 0) + 1;
                  });
                }
              });
            }
          } else {
            summary.errors++;
            results.push({
              title: item.title,
              error: result.error,
              timestamp: new Date().toISOString()
            });
          }
        } catch (itemError) {
          console.error(`Error moderating item ${i + 1}:`, itemError);
          summary.errors++;
          results.push({
            title: item.title,
            error: itemError.message,
            timestamp: new Date().toISOString()
          });
        }

        // Add small delay to avoid rate limiting
        if (i < contentItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`🛡️ Batch moderation complete. Safe: ${summary.safe}, Unsafe: ${summary.unsafe}, Errors: ${summary.errors}`);

      return {
        success: true,
        data: {
          results: results,
          summary: summary,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Batch moderation error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Create and export singleton instance
const qwenGuardService = new QwenGuardService();
export default qwenGuardService;

// Export individual functions for convenience
export const {
  moderatePrompt,
  moderateResponse,
  moderateCourseContent,
  batchModerate
} = qwenGuardService;
