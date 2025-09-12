// AI Configuration - Environment-based provider settings
// This file will be excluded from Git to hide AI provider details

const aiConfig = {
  // Generic AI service configuration
  provider: {
    name: process.env.AI_PROVIDER_NAME || 'AI_SERVICE',
    apiKey: process.env.AI_API_KEY || process.env.BYTEZ_API_KEY,
    baseUrl: process.env.AI_BASE_URL || 'https://api.bytez.com',
    version: process.env.AI_API_VERSION || 'v2'
  },

  // Model mappings - Optimized for course generation
  models: {
    summarization: {
      primary: process.env.AI_SUMMARY_MODEL || 'facebook/bart-large-cnn',
      fallback: process.env.AI_SUMMARY_FALLBACK || 'microsoft/DialoGPT-medium'
    },
    questionAnswering: {
      primary: process.env.AI_QA_MODEL || 'deepset/roberta-base-squad2',
      fallbacks: [
        process.env.AI_QA_FALLBACK_1 || 'microsoft/DialoGPT-medium',
        process.env.AI_QA_FALLBACK_2 || 'google/flan-t5-large',
        process.env.AI_QA_FALLBACK_3 || 'microsoft/Phi-3-mini-4k-instruct'
      ]
    },
    imageGeneration: {
      primary: process.env.AI_IMAGE_MODEL || 'runwayml/stable-diffusion-v1-5',
      fallbacks: [
        process.env.AI_IMAGE_FALLBACK_1 || 'dreamlike-art/dreamlike-photoreal-2.0',
        process.env.AI_IMAGE_FALLBACK_2 || 'prompthero/openjourney-v4'
      ]
    },
    textGeneration: {
      primary: process.env.AI_TEXT_MODEL || 'microsoft/Phi-3-mini-4k-instruct',
      fallback: process.env.AI_TEXT_FALLBACK || 'google/flan-t5-large'
    },
    courseOutlineGeneration: {
      // Best models for educational content generation
      primary: process.env.AI_COURSE_MODEL || 'microsoft/Phi-3-mini-4k-instruct',
      fallbacks: [
        process.env.AI_COURSE_FALLBACK_1 || 'google/flan-t5-large',
        process.env.AI_COURSE_FALLBACK_2 || 'microsoft/DialoGPT-medium',
        process.env.AI_COURSE_FALLBACK_3 || 'huggingface/CodeBERTa-small-v1'
      ]
    }
  },

  // Rate limiting and retry configuration
  limits: {
    maxRetries: parseInt(process.env.AI_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.AI_RETRY_DELAY) || 1000,
    rateLimit: parseInt(process.env.AI_RATE_LIMIT) || 100
  },

  // Default parameters
  defaults: {
    temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE) || 0.3,
    maxTokens: parseInt(process.env.AI_DEFAULT_MAX_TOKENS) || 200,
    timeout: parseInt(process.env.AI_REQUEST_TIMEOUT) || 30000
  }
};

module.exports = aiConfig;
