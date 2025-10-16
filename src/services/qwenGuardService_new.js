// QwenGuardService - Bytez dependency removed
// Content moderation functionality disabled

class QwenGuardService {
  constructor() {
    console.warn('QwenGuardService: Bytez dependency removed - content moderation disabled');
  }

  // Stub methods that return safe defaults
  async moderatePrompt(prompt) {
    return {
      success: true,
      data: { safety: 'Safe', categories: [], refusal: null }
    };
  }

  async moderateResponse(prompt, response) {
    return {
      success: true,
      data: { safety: 'Safe', categories: [], refusal: null }
    };
  }

  async moderateCourseContent(title, content, options = {}) {
    return {
      success: true,
      data: { safety: 'Safe', categories: [], refusal: null }
    };
  }
}

// Export singleton instance
const qwenGuardService = new QwenGuardService();
export default qwenGuardService;
