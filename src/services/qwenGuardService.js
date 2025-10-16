// QwenGuardService - Content moderation disabled (dependency removed)

class QwenGuardService {
  constructor() {
    console.warn('QwenGuardService: Content moderation disabled - dependency removed');
  }

  // Stub methods that return safe defaults
  async moderatePrompt(prompt) {
    return {
      success: true,
      data: { 
        safety: 'Safe', 
        categories: [], 
        refusal: null,
        safe: true
      }
    };
  }

  async moderateResponse(prompt, response) {
    return {
      success: true,
      data: { 
        safety: 'Safe', 
        categories: [], 
        refusal: null,
        safe: true
      }
    };
  }

  async moderateCourseContent(title, content, options = {}) {
    return {
      success: true,
      data: { 
        safety: 'Safe', 
        categories: [], 
        refusal: null,
        safe: true,
        overall: {
          safe: true,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
}

// Export singleton instance
const qwenGuardService = new QwenGuardService();
export default qwenGuardService;
