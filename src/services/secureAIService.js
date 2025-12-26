import { emitActiveOrgUsageRefresh } from '../utils/activeOrgUsageEvents';
import { getAccessToken } from './tokenService';

/**
 * Secure AI Service - Backend-Only Implementation
 * Replaces all direct OpenAI calls with secure backend API calls
 *
 * This service ensures:
 * - No API keys exposed in frontend
 * - All AI operations go through backend
 * - Proper authentication and rate limiting
 * - Cost tracking and usage monitoring
 * - Enhanced security and scalability
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:9000'
    : 'https://creditor.onrender.com');
// Debug: Log the API base being used
console.log('SecureAIService API_BASE:', API_BASE);
const isDevelopment = !!import.meta.env.DEV;

const clientLogger = {
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
};

class SecureAIService {
  constructor() {
    this.apiBase = API_BASE;
    this.endpoints = {
      generateText: '/api/ai-proxy/generate-text',
      generateStructured: '/api/ai-proxy/generate-structured',
      generateImage: '/api/ai-proxy/generate-image',
      generateCourseOutline: '/api/ai-proxy/generate-course-outline',
      generateCourseBlueprint: '/api/ai-proxy/generate-course-blueprint',
      logAIGeneration: '/api/ai-learning/log-generation',
      logAIGenerationBatch: '/api/ai-learning/log-generation/batch',
      status: '/api/ai-proxy/status',
    };
    this.statusCache = {
      data: null,
      timestamp: 0,
      ttl: 60000, // Cache status for 1 minute
    };
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API errors with user-friendly messages
   * @returns {Error} Formatted error with user-friendly message
   */
  handleError(error, operation, response = null) {
    clientLogger.error(`${operation} failed:`, {
      error,
      message: error.message,
      response,
      status: response?.status,
      stack: error.stack,
    });

    // Handle fetch response errors
    if (response && response.status) {
      const status = response.status;
      const backendMessage =
        response.data?.message ||
        response.data?.error ||
        response.data?.details?.message;

      if (response.data?.error?.code === 'content_policy_violation') {
        return new Error(
          'OpenAI rejected the image prompt due to safety filters. Please adjust the wording and try again.'
        );
      }

      switch (status) {
        case 401:
          return new Error(
            'Authentication required. Please login to use AI features.'
          );
        case 403:
          return new Error(
            'Access forbidden. You may not have permission to use this AI feature.'
          );
        case 429:
          return new Error(
            'Rate limit exceeded. Please wait before making more AI requests.'
          );
        case 402:
          return new Error(
            'Usage limit exceeded. Please upgrade your plan or wait for reset.'
          );
        case 500:
        case 502:
        case 503:
          return new Error(
            backendMessage ||
              'AI service temporarily unavailable. Please try again later.'
          );
        default:
          return new Error(
            backendMessage ||
              `Request failed with status ${status}. ${error.message || ''}`
          );
      }
    }

    // Check if error already has a response property
    if (error.response && error.response.status) {
      const status = error.response.status;
      const backendMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.data?.details?.message;

      if (error.response.data?.error?.code === 'content_policy_violation') {
        return new Error(
          'OpenAI rejected the image prompt due to safety filters. Please adjust the wording and try again.'
        );
      }

      switch (status) {
        case 401:
          return new Error(
            'Authentication required. Please login to use AI features.'
          );
        case 403:
          return new Error(
            'Access forbidden. You may not have permission to use this AI feature.'
          );
        case 429:
          return new Error(
            'Rate limit exceeded. Please wait before making more AI requests.'
          );
        case 402:
          return new Error(
            'Usage limit exceeded. Please upgrade your plan or wait for reset.'
          );
        case 500:
        case 502:
        case 503:
          return new Error(
            backendMessage ||
              'AI service temporarily unavailable. Please try again later.'
          );
        default:
          return new Error(
            backendMessage ||
              `Request failed with status ${status}. ${error.message || ''}`
          );
      }
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return new Error('Network error. Please check your internet connection.');
    }

    // If error already has a good message, use it
    if (error.message && !error.message.includes('fetch')) {
      return error;
    }

    return new Error(error.message || 'An unexpected error occurred.');
  }

  /**
   * Check backend status with caching
   */
  async checkBackendStatus(forceRefresh = false) {
    const now = Date.now();

    // Use cached status if still valid
    if (
      !forceRefresh &&
      this.statusCache.data &&
      now - this.statusCache.timestamp < this.statusCache.ttl
    ) {
      return this.statusCache.data;
    }

    try {
      const status = await this.getStatus();
      this.statusCache = {
        data: status,
        timestamp: now,
        ttl: 60000, // 1 minute cache
      };
      return status;
    } catch (error) {
      clientLogger.warn('Could not check backend status:', error.message);
      return {
        available: false,
        openai: { available: false },
        error: error.message,
      };
    }
  }

  /**
   * Make API request with retry logic and exponential backoff
   */
  async makeRequestWithRetry(
    endpoint,
    options,
    maxRetries = 3,
    retryCount = 0
  ) {
    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, options);

      // Handle HTTP errors
      if (!response.ok) {
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: `HTTP ${response.status}` };
          }

          const error = new Error(
            errorData.message || `HTTP ${response.status}`
          );
          error.response = { status: response.status, data: errorData };
          throw error;
        }

        // Retry on server errors (5xx) or network errors
        if (
          (response.status >= 500 || response.status === 0) &&
          retryCount < maxRetries
        ) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          clientLogger.warn(
            `Request failed (${response.status}), retrying in ${delay}ms... (${retryCount + 1}/${maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequestWithRetry(
            endpoint,
            options,
            maxRetries,
            retryCount + 1
          );
        }

        // Final failure
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}` };
        }
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      return response;
    } catch (error) {
      // Network errors - retry
      if (
        (error.message?.includes('fetch') || error.code === 'NETWORK_ERROR') &&
        retryCount < maxRetries
      ) {
        const delay = Math.pow(2, retryCount) * 1000;
        clientLogger.warn(
          `Network error, retrying in ${delay}ms... (${retryCount + 1}/${maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(
          endpoint,
          options,
          maxRetries,
          retryCount + 1
        );
      }

      throw error;
    }
  }

  /**
   * Generate text using backend AI service
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      const {
        model = 'gpt-4o-mini',
        maxTokens = 1000,
        temperature = 0.7,
        systemPrompt = 'You are a helpful AI assistant for educational content creation.',
        enhancePrompt = false,
        skipStatusCheck = false,
      } = options;

      // Check backend availability before making request
      if (!skipStatusCheck) {
        const status = await this.checkBackendStatus();
        if (!status.openai?.available) {
          throw new Error(
            status.error ||
              'AI service is currently unavailable. Please try again later.'
          );
        }
      }

      clientLogger.debug(`Generating text via secure backend (${model})...`);

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateText,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            prompt,
            model,
            maxTokens,
            temperature,
            systemPrompt,
            enhancePrompt,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Text generation failed');
      }

      clientLogger.debug(
        `Text generated (${result.data?.tokensUsed || 0} tokens, $${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      this.notifyUsageRefresh();
      return result.data.text;
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Text generation',
        error.response
      );
      throw formattedError;
    }
  }

  async summarizeContent(content, options = {}) {
    const length = options?.length || 'medium';
    const type = options?.type || 'bullet';

    const lengthConfigMap = {
      short: { minWords: 50, maxWords: 100, maxTokens: 300 },
      medium: { minWords: 100, maxWords: 200, maxTokens: 500 },
      long: { minWords: 150, maxWords: 300, maxTokens: 800 },
      detailed: { minWords: 200, maxWords: 400, maxTokens: 1100 },
    };

    const lengthConfig = lengthConfigMap[length] || lengthConfigMap.medium;

    const formatInstructionMap = {
      bullet:
        'Return the summary as bullet points. Use short, information-dense bullets.',
      paragraph:
        'Return the summary as a single well-structured paragraph. Avoid bullet points.',
      outline:
        'Return the summary as an outline with headings and sub-bullets. Use a clear hierarchy.',
    };

    const formatInstruction =
      formatInstructionMap[type] || formatInstructionMap.bullet;

    const cleanedContent = (content || '').trim();
    if (!cleanedContent) {
      throw new Error('Content is required for summarization');
    }

    const systemPrompt =
      'You are an expert summarizer. Produce accurate summaries without adding new facts.';

    const buildPrompt = chunk => {
      const base = `Summarize the content below.

Constraints:
- Target length: ${lengthConfig.minWords}-${lengthConfig.maxWords} words.
- ${formatInstruction}
- Preserve key facts, definitions, and steps.
- Do not fabricate information.

Content:
${chunk}`;

      if (base.length <= 4000) return base;

      const safeChunk = chunk.slice(
        0,
        Math.max(0, chunk.length - (base.length - 4000))
      );
      return `Summarize the content below.

Constraints:
- Target length: ${lengthConfig.minWords}-${lengthConfig.maxWords} words.
- ${formatInstruction}
- Preserve key facts, definitions, and steps.
- Do not fabricate information.

Content:
${safeChunk}`;
    };

    const maxPromptChars = 3800;
    const maxChunkChars = Math.max(800, maxPromptChars - 1000);

    const chunks = [];
    if (cleanedContent.length <= maxChunkChars) {
      chunks.push(cleanedContent);
    } else {
      for (let i = 0; i < cleanedContent.length; i += maxChunkChars) {
        chunks.push(cleanedContent.slice(i, i + maxChunkChars));
      }
    }

    const partialSummaries = [];
    for (const chunk of chunks) {
      const summary = await this.generateText(buildPrompt(chunk), {
        model: options?.model || 'gpt-4o-mini',
        maxTokens: lengthConfig.maxTokens,
        temperature: 0.3,
        systemPrompt,
        enhancePrompt: false,
        skipStatusCheck: partialSummaries.length > 0,
      });
      partialSummaries.push(summary);
    }

    let finalSummary = partialSummaries.join('\n\n');
    if (chunks.length > 1) {
      finalSummary = await this.generateText(
        buildPrompt(
          `Combine the partial summaries below into one unified summary.\n\n${finalSummary}`
        ),
        {
          model: options?.model || 'gpt-4o-mini',
          maxTokens: lengthConfig.maxTokens,
          temperature: 0.3,
          systemPrompt,
          enhancePrompt: false,
          skipStatusCheck: true,
        }
      );
    }

    return {
      success: true,
      summary: finalSummary,
      generated_text: finalSummary,
      model: options?.model || 'gpt-4o-mini',
      chunked: chunks.length > 1,
      chunkCount: chunks.length,
      originalLength: cleanedContent.length,
      summaryLength: finalSummary.length,
      lengthConfig,
    };
  }

  async answerQuestion(question, context = '', options = {}) {
    const q = (question || '').trim();
    const ctx = (context || '').trim();

    if (!q) {
      throw new Error('Question is required');
    }

    const maxAnswerLength =
      options?.max_answer_length || options?.maxAnswerLength;
    const maxAnswerWords =
      typeof maxAnswerLength === 'number' && maxAnswerLength > 0
        ? maxAnswerLength
        : null;

    const systemPrompt =
      'You are a helpful assistant. Answer accurately and concisely. If you do not know, say so.';

    const clippedContext = ctx ? ctx.slice(0, 1500) : '';
    const basePrompt = clippedContext
      ? `Question: ${q}\n\nContext: ${clippedContext}`
      : `Question: ${q}`;

    const prompt = maxAnswerWords
      ? `${basePrompt}\n\nConstraints:\n- Max ${maxAnswerWords} words.\n- Be direct and avoid fluff.`
      : `${basePrompt}\n\nConstraints:\n- Be direct and avoid fluff.`;

    const answer = await this.generateText(prompt.slice(0, 4000), {
      model: options?.model || 'gpt-4o-mini',
      maxTokens: options?.maxTokens || 500,
      temperature: 0.3,
      systemPrompt,
      enhancePrompt: false,
    });

    return {
      success: true,
      answer,
      model: options?.model || 'gpt-4o-mini',
      question: q,
      context: ctx,
    };
  }

  async logAIGeneration(payload) {
    try {
      const response = await this.makeRequestWithRetry(
        this.endpoints.logAIGeneration,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'AI generation logging failed');
      }

      return result.data;
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'AI generation logging',
        error.response
      );
      throw formattedError;
    }
  }

  async logAIGenerationBatch(payload) {
    try {
      const response = await this.makeRequestWithRetry(
        this.endpoints.logAIGenerationBatch,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'AI generation batch logging failed');
      }

      return result.data;
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'AI generation batch logging',
        error.response
      );
      throw formattedError;
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
        model = 'gpt-4o-mini',
        maxTokens = 2000,
        temperature = 0.7,
        skipStatusCheck = false,
      } = options;

      // Check backend availability before making request
      if (!skipStatusCheck) {
        const status = await this.checkBackendStatus();
        if (!status.openai?.available) {
          throw new Error(
            status.error ||
              'AI service is currently unavailable. Please try again later.'
          );
        }
      }

      clientLogger.debug(
        `Generating structured JSON via secure backend (${model})...`
      );

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateStructured,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            model,
            maxTokens,
            temperature,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Structured generation failed');
      }

      clientLogger.debug(
        `Structured JSON generated (${result.data?.tokensUsed || 0} tokens, $${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      this.notifyUsageRefresh();
      return result.data.jsonData;
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Structured generation',
        error.response
      );
      throw formattedError;
    }
  }

  /**
   * Generate image using DALL-E via backend (with automatic S3 upload)
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data with S3 URL
   */
  async generateImage(prompt, options = {}) {
    try {
      const {
        model = 'dall-e-3',
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid',
        enhancePrompt = false,
        uploadToS3 = true,
        folder = 'ai-generated-images',
        skipStatusCheck = false,
      } = options;

      // Check backend availability before making request
      if (!skipStatusCheck) {
        const status = await this.checkBackendStatus();
        if (!status.openai?.available) {
          throw new Error(
            status.error ||
              'AI service is currently unavailable. Please try again later.'
          );
        }
      }

      clientLogger.debug(`Generating image via secure backend (${model})...`);

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateImage,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            prompt,
            model,
            size,
            quality,
            style,
            enhancePrompt,
            uploadToS3,
            folder,
          }),
        }
      );

      const result = await response.json();

      // Debug: Log the full backend response
      clientLogger.debug('Backend image generation response:', {
        success: result.success,
        hasData: !!result.data,
        imageUrl: result.data?.imageUrl,
        originalUrl: result.data?.originalUrl,
        uploadedToS3: result.data?.uploadedToS3,
        error: result.error,
        message: result.message,
      });

      if (!result.success) {
        throw new Error(result.message || 'Image generation failed');
      }

      clientLogger.debug(
        `Image generated and uploaded to S3 ($${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      const imageData = {
        url: result.data.imageUrl,
        originalUrl: result.data.originalUrl,
        model: result.data.model,
        size: result.data.size,
        quality: result.data.quality,
        style: result.data.style,
        uploadedToS3: result.data.uploadedToS3,
        provider: 'backend',
        createdAt: result.data.createdAt,
        folder: result.data.folder || folder,
        uploadSkippedReason: result.data.uploadSkippedReason,
      };

      // Fallback: if S3 URL missing, reuse original OpenAI URL
      if (!imageData.url && imageData.originalUrl) {
        clientLogger.warn('S3 URL missing, using original OpenAI URL');
        imageData.url = imageData.originalUrl;
        imageData.uploadedToS3 = false;
      }

      // Error: if both URLs are missing, throw error
      if (!imageData.url) {
        clientLogger.error(
          'Both S3 and OpenAI URLs are missing from backend response'
        );
        clientLogger.error('Full backend response for debugging:', result);
        throw new Error(
          'Image generation succeeded but no URL returned from backend'
        );
      }

      this.notifyUsageRefresh();

      return {
        success: true,
        data: imageData,
        url: imageData.url,
        originalUrl: imageData.originalUrl,
        model: imageData.model,
        size: imageData.size,
        quality: imageData.quality,
        style: imageData.style,
        provider: imageData.provider,
        createdAt: imageData.createdAt,
        uploadedToS3: imageData.uploadedToS3,
        folder: imageData.folder,
        uploadSkippedReason: imageData.uploadSkippedReason,
        cost: result.data.cost,
      };
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Image generation',
        error.response
      );

      // Gracefully skip on quota/permission issues so downstream logic can
      // continue without throwing (e.g., when storage/usage is exhausted).
      const status =
        error?.response?.status || error?.status || formattedError?.status;
      if (status === 402 || status === 403) {
        clientLogger.warn(
          `⚠️ Skipping image generation due to ${status}: ${formattedError.message}`
        );
        return {
          success: false,
          error: formattedError.message,
          status,
        };
      }

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
      clientLogger.debug('Generating course outline via secure backend...');

      // Check backend availability
      const status = await this.checkBackendStatus();
      if (!status.openai?.available) {
        throw new Error(
          status.error ||
            'AI service is currently unavailable. Please try again later.'
        );
      }

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateCourseOutline,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            courseTitle: courseData.title || courseData.courseTitle,
            subjectDomain: courseData.subject || courseData.subjectDomain,
            courseDescription:
              courseData.description || courseData.courseDescription,
            duration: courseData.duration,
            difficulty: courseData.difficulty || 'intermediate',
            learningObjectives:
              courseData.objectives || courseData.learningObjectives,
            generateType: 'outline',
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Course outline generation failed');
      }

      clientLogger.debug(
        `Course outline generated (${result.data?.tokensUsed || 0} tokens, $${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      this.notifyUsageRefresh();

      return {
        success: true,
        data: result.data.course,
        provider: 'backend',
        tokensUsed: result.data?.tokensUsed || 0,
        cost: result.data?.cost,
      };
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Course outline generation',
        error.response
      );
      throw formattedError;
    }
  }

  /**
   * Generate comprehensive course via backend
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Comprehensive course structure
   */
  async generateComprehensiveCourse(courseData) {
    try {
      clientLogger.debug(
        'Generating comprehensive course via secure backend...'
      );

      // Check backend availability
      const status = await this.checkBackendStatus();
      if (!status.openai?.available) {
        throw new Error(
          status.error ||
            'AI service is currently unavailable. Please try again later.'
        );
      }

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateCourseOutline,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            courseTitle: courseData.title || courseData.courseTitle,
            subjectDomain: courseData.subject || courseData.subjectDomain,
            courseDescription:
              courseData.description || courseData.courseDescription,
            duration: courseData.duration,
            difficulty: courseData.difficulty || 'intermediate',
            learningObjectives:
              courseData.objectives || courseData.learningObjectives,
            generateType: 'comprehensive',
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || 'Comprehensive course generation failed'
        );
      }

      this.notifyUsageRefresh();

      clientLogger.debug(
        `Comprehensive course generated (${result.data?.tokensUsed || 0} tokens, $${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      return {
        success: true,
        data: result.data.course,
        provider: 'backend',
        tokensUsed: result.data?.tokensUsed || 0,
        cost: result.data?.cost,
      };
    } catch (error) {
      const formattedError = this.handleError(
        error,
        'Comprehensive course generation',
        error.response
      );
      throw formattedError;
    }
  }

  async generateCourseBlueprint(blueprintInput) {
    try {
      clientLogger.debug(
        'Generating course blueprint via secure backend endpoint...'
      );

      const status = await this.checkBackendStatus();
      if (!status.openai?.available) {
        throw new Error(
          status.error ||
            'AI service is currently unavailable. Please try again later.'
        );
      }

      const payload = {
        courseTitle: blueprintInput?.courseTitle || blueprintInput?.title || '',
        subjectDomain:
          blueprintInput?.subjectDomain || blueprintInput?.subject || '',
        courseDescription:
          blueprintInput?.courseDescription ||
          blueprintInput?.description ||
          '',
        duration: blueprintInput?.duration || '4 weeks',
        difficulty: blueprintInput?.difficulty || 'intermediate',
        learningObjectives:
          blueprintInput?.learningObjectives ||
          blueprintInput?.objectives ||
          '',
        targetAudience:
          blueprintInput?.targetAudience || blueprintInput?.audience || '',
        priorKnowledge: blueprintInput?.priorKnowledge || null,
        rawInput: blueprintInput || null,
        // Pass extended inputs
        coursePurpose: blueprintInput?.coursePurpose,
        targetLearnerProfile: blueprintInput?.targetLearnerProfile,
        learningConstraints: blueprintInput?.learningConstraints,
        complianceRequirements: blueprintInput?.complianceRequirements,
        priorKnowledgeExtra: blueprintInput?.priorKnowledgeExtra,
        courseStructure: blueprintInput?.courseStructure,
        successMeasurement: blueprintInput?.successMeasurement,
        requiredResources: blueprintInput?.requiredResources,
        targetStructure: blueprintInput?.targetStructure,
        moduleCount: blueprintInput?.moduleCount,
        lessonsPerModule: blueprintInput?.lessonsPerModule,
      };

      const response = await this.makeRequestWithRetry(
        this.endpoints.generateCourseBlueprint,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Course blueprint generation failed');
      }

      clientLogger.debug(
        `Course blueprint generated (${result.data?.tokensUsed || 0} tokens, $${result.data?.cost?.finalCost?.toFixed(4) || 0})`
      );

      this.notifyUsageRefresh();

      return {
        success: true,
        data: result.data.blueprint,
        provider: result.data?.provider || 'backend',
        tokensUsed: result.data?.tokensUsed,
        cost: result.data?.cost,
      };
    } catch (error) {
      // If the dedicated backend route is missing (HTTP 404), fall back to
      // using the generic structured generation endpoint that is guaranteed
      // to exist on older backends.
      if (error?.response?.status === 404) {
        clientLogger.warn(
          'Course blueprint endpoint not found on backend, falling back to structured generation'
        );

        try {
          const systemPrompt = `You are an expert instructional designer and learning architect.
Return ONLY valid JSON for a course blueprint with the following top-level keys:
- "meta": { "courseTitle", "subjectDomain", "difficulty", "duration" }
- "purpose": { "overview", "businessGoal", "problemStatement" }
- "learnerPersona": { "primaryAudience", "experienceLevel", "context", "motivations", "constraints" }
- "objectives": { "framework", "overallObjectives": [string], "moduleObjectives": [{ "moduleId": string, "moduleTitle": string, "objectives": [string] }] }
- "structure": { "modules": [{ "id": string, "title": string, "description": string, "order": number, "lessons": [{ "id": string, "title": string, "description": string, "order": number, "objectives": [string], "contentPlan": { "sections": [string] }, "assessmentPlan": { "types": [string], "strategy": string }, "interactionPlan": { "activities": [string] }, "mediaPlan": { "assets": [string] } }] }] }
- "assessmentStrategy": { "formative": string, "summative": string, "questionTypes": [string], "gradingApproach": string }
- "interactivityPlan": { "scenarios": [string], "simulations": [string], "practicePatterns": [string] }
- "analyticsPlan": { "kpis": [string], "events": [string], "evaluationMethods": [string] }
- "branding": { "tone": string, "voice": string, "colors": [string], "imageStyle": string, "typography": string, "characters": [string], "narrator": string }
- "qualityRules": { "checklist": [string], "constraints": [string] }`;

          const userPrompt = `Use the following course design inputs to create a complete course blueprint. If any fields are missing, make reasonable, curriculum-aligned assumptions.

Inputs:
${JSON.stringify(blueprintInput || {}, null, 2)}`;

          const jsonData = await this.generateStructured(
            systemPrompt,
            userPrompt,
            {
              model: 'gpt-4o-mini',
              maxTokens: 4000,
              temperature: 0.7,
              skipStatusCheck: true,
            }
          );

          this.notifyUsageRefresh();

          return {
            success: true,
            data: jsonData,
            provider: 'backend',
          };
        } catch (fallbackError) {
          const formattedFallbackError = this.handleError(
            fallbackError,
            'Course blueprint generation (fallback)',
            fallbackError.response
          );
          throw formattedFallbackError;
        }
      }

      const formattedError = this.handleError(
        error,
        'Course blueprint generation',
        error.response
      );
      throw formattedError;
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
      clientLogger.debug(
        'Generating course image with prompt:',
        prompt.substring(0, 100) + '...'
      );

      const result = await this.generateImage(prompt, {
        model: 'dall-e-3',
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        enhancePrompt: false, // Manual enhancement only for course images
        uploadToS3: true,
        folder: options.folder || 'course-thumbnails',
      });

      const imageData = result.data || {
        url: result.url,
        originalUrl: result.originalUrl,
        model: result.model,
        size: result.size,
        quality: result.quality,
        style: result.style,
        provider: result.provider,
        uploadedToS3: result.uploadedToS3,
      };

      return {
        success: true,
        data: {
          url: imageData.url,
          originalUrl: imageData.originalUrl,
          model: imageData.model,
          size: imageData.size,
          quality: imageData.quality,
          style: imageData.style,
          provider: imageData.provider || 'backend',
          uploadedToS3: imageData.uploadedToS3,
          folder: imageData.folder || options.folder || 'course-thumbnails',
          uploadSkippedReason: imageData.uploadSkippedReason,
        },
        url: imageData.url,
        originalUrl: imageData.originalUrl,
        uploadedToS3: imageData.uploadedToS3,
        folder: imageData.folder || options.folder || 'course-thumbnails',
        uploadSkippedReason: imageData.uploadSkippedReason,
        cost: result.cost,
      };
    } catch (error) {
      clientLogger.error(
        'Course image generation failed, creating fallback response'
      );

      // Create a placeholder SVG image as fallback
      const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
          <circle cx="512" cy="400" r="80" fill="white" opacity="0.9"/>
          <path d="M480 380 L480 420 L544 420 L544 380 Z M488 388 L488 412 L536 412 L536 388 Z" fill="#6366F1"/>
          <text x="512" y="580" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">Course Thumbnail</text>
          <text x="512" y="640" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.8">AI Generation Failed</text>
          <text x="512" y="700" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.6">${prompt.substring(0, 30)}...</text>
        </svg>
      `)}`;

      // Return a fallback response with placeholder image
      return {
        success: false,
        error: error.message || 'Course image generation failed',
        data: {
          url: placeholderSvg,
          originalUrl: null,
          model: 'dall-e-3',
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          style: options.style || 'vivid',
          provider: 'fallback',
          uploadedToS3: false,
          folder: options.folder || 'course-thumbnails',
          uploadSkippedReason:
            'Generation failed - ' + (error.message || 'Unknown error'),
        },
        url: placeholderSvg,
        originalUrl: null,
        uploadedToS3: false,
        folder: options.folder || 'course-thumbnails',
        uploadSkippedReason:
          'Generation failed - ' + (error.message || 'Unknown error'),
        cost: { finalCost: 0 },
      };
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
        model: 'gpt-4o-mini',
        maxTokens: options.maxTokens || 1500,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content creator. Create clear, engaging, and informative lesson content.',
        enhancePrompt: false, // Manual enhancement only for lesson content
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
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content editor. Enhance content while maintaining its core message and structure.',
        enhancePrompt: true,
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
          model: 'gpt-4o-mini',
          maxTokens: 1500,
          temperature: 0.7,
        }
      );

      // Ensure response is an array
      const questions = Array.isArray(response) ? response : [response];

      clientLogger.debug(`✅ Generated ${questions.length} quiz questions`);
      return questions;
    } catch (error) {
      this.handleError(error, 'Quiz generation');
    }
  }

  /**
   * Notify listeners to refresh active organization usage
   */
  notifyUsageRefresh() {
    emitActiveOrgUsageRefresh();
  }

  /**
   * Get AI service status
   * @returns {Promise<Object>} Service status
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.apiBase}${this.endpoints.status}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get AI status');
      }

      return result.data;
    } catch (error) {
      clientLogger.error('Failed to get AI status:', error);
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const status = await this.getStatus();
      return status.openai?.available || false;
    } catch (error) {
      return false;
    }
  }
}

// Create and export singleton instance
const secureAIService = new SecureAIService();
export default secureAIService;

// Named exports for convenience
export const {
  generateText,
  generateStructured,
  generateImage,
  generateCourseOutline,
  generateCourseBlueprint,
  generateComprehensiveCourse,
  generateCourseImage,
  generateLessonContent,
  enhanceLessonContent,
  generateQuizQuestions,
  getStatus,
  isAvailable,
} = secureAIService;
