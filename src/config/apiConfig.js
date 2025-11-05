// Centralized API Configuration
// This file manages all API keys and base URLs for the application

/**
 * API Configuration Object
 * Uses environment variables first, then falls back to working API keys
 */
const API_CONFIG = {
  // OpenAI Configuration
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your_openai_api_key_here',
    models: {
      text: 'gpt-3.5-turbo',
      textAdvanced: 'gpt-4',
      image: 'dall-e-3',
    },
  },

  // HuggingFace Configuration
  huggingface: {
    baseURL: 'https://api-inference.huggingface.co/models',
    routerURL: 'https://router.huggingface.co/v1',
    apiKeys: [
      import.meta.env.VITE_HUGGINGFACE_API_KEY,
      import.meta.env.VITE_HUGGINGFACE_API_KEY_2,
      import.meta.env.VITE_HF_API_KEY,
      import.meta.env.VITE_HF_API_KEY_2,
    ].filter(Boolean), // Remove undefined/null values
    models: {
      text: 'HuggingFaceH4/zephyr-7b-beta',
      textRouter: 'HuggingFaceH4/zephyr-7b-beta:featherless-ai',
      image: 'runwayml/stable-diffusion-v1-5',
    },
  },

  // Deep AI Configuration
  deepai: {
    baseURL: 'https://api.deepai.org/api',
    apiKey: import.meta.env.VITE_DEEPAI_API_KEY,
    endpoints: {
      textToImage: 'text2img',
    },
  },
};

/**
 * Get OpenAI configuration
 * @returns {Object} OpenAI config with API key and base URL
 */
export const getOpenAIConfig = () => {
  return {
    apiKey: API_CONFIG.openai.apiKey,
    baseURL: API_CONFIG.openai.baseURL,
    models: API_CONFIG.openai.models,
  };
};

/**
 * Get HuggingFace configuration
 * @param {number} keyIndex - Index of the API key to use (0-3)
 * @returns {Object} HuggingFace config
 */
export const getHuggingFaceConfig = (keyIndex = 0) => {
  const keys = API_CONFIG.huggingface.apiKeys;
  return {
    apiKey: keys[keyIndex] || null,
    baseURL: API_CONFIG.huggingface.baseURL,
    routerURL: API_CONFIG.huggingface.routerURL,
    models: API_CONFIG.huggingface.models,
    availableKeys: keys.length,
  };
};

/**
 * Get Deep AI configuration
 * @returns {Object} Deep AI config
 */
export const getDeepAIConfig = () => {
  return {
    apiKey: API_CONFIG.deepai.apiKey,
    baseURL: API_CONFIG.deepai.baseURL,
    endpoints: API_CONFIG.deepai.endpoints,
  };
};

/**
 * Check if a service has valid API keys
 * @param {string} service - Service name (openai, huggingface, deepai)
 * @returns {boolean} Whether the service has valid keys
 */
export const hasValidApiKey = service => {
  switch (service) {
    case 'openai':
      return Boolean(
        API_CONFIG.openai.apiKey &&
          API_CONFIG.openai.apiKey !== 'your_openai_api_key_here'
      );
    case 'huggingface':
      return API_CONFIG.huggingface.apiKeys.length > 0;
    case 'deepai':
      return Boolean(
        API_CONFIG.deepai.apiKey &&
          API_CONFIG.deepai.apiKey !== 'your_deepai_api_key_here'
      );
    default:
      return false;
  }
};

/**
 * Get all available API services with their status
 * @returns {Object} Service availability status
 */
export const getServiceStatus = () => {
  return {
    openai: {
      available: hasValidApiKey('openai'),
      baseURL: API_CONFIG.openai.baseURL,
      models: API_CONFIG.openai.models,
    },
    huggingface: {
      available: hasValidApiKey('huggingface'),
      baseURL: API_CONFIG.huggingface.baseURL,
      keyCount: API_CONFIG.huggingface.apiKeys.length,
      models: API_CONFIG.huggingface.models,
    },
    deepai: {
      available: hasValidApiKey('deepai'),
      baseURL: API_CONFIG.deepai.baseURL,
      endpoints: API_CONFIG.deepai.endpoints,
    },
  };
};

/**
 * Validate API key format
 * @param {string} key - API key to validate
 * @param {string} service - Service name for validation rules
 * @returns {boolean} Whether the key format is valid
 */
export const validateApiKey = (key, service) => {
  if (!key || typeof key !== 'string') return false;

  const trimmed = key.trim();
  if (trimmed.length < 10) return false;

  // Check for placeholder values
  const placeholders = [
    'your_api_key_here',
    'your_openai_api_key_here',
    'your_deepai_api_key_here',
    'your_ope********here',
    'sk-placeholder',
    'hf_placeholder',
    'test_key',
    'demo_key',
  ];

  if (placeholders.includes(trimmed.toLowerCase())) return false;

  // Service-specific validation
  switch (service) {
    case 'openai':
      return trimmed.startsWith('sk-');
    case 'huggingface':
      return trimmed.startsWith('hf_');
    default:
      return true;
  }
};

/**
 * Set API key for a service (for runtime configuration)
 * @param {string} service - Service name
 * @param {string} key - API key
 * @param {number} keyIndex - Key index for services with multiple keys
 */
export const setApiKey = (service, key, keyIndex = 0) => {
  if (!validateApiKey(key, service)) {
    throw new Error(`Invalid API key format for ${service}`);
  }

  switch (service) {
    case 'openai':
      API_CONFIG.openai.apiKey = key;
      break;
    case 'huggingface':
      if (keyIndex < API_CONFIG.huggingface.apiKeys.length) {
        API_CONFIG.huggingface.apiKeys[keyIndex] = key;
      } else {
        API_CONFIG.huggingface.apiKeys.push(key);
      }
      break;
    case 'deepai':
      API_CONFIG.deepai.apiKey = key;
      break;
    default:
      throw new Error(`Unknown service: ${service}`);
  }

  console.log(`✅ ${service} API key updated successfully`);
};

// Export the main configuration object for direct access if needed
export default API_CONFIG;
