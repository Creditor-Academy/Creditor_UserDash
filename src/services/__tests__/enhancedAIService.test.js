import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

vi.mock('../qwenImageService', () => ({
  default: {
    generateImage: vi.fn(),
  },
}));

vi.mock('../apiKeyManager.js', () => ({
  default: {
    getApiKey: vi.fn(),
  },
}));

vi.mock('../fallbackCourseGenerator.js', () => ({
  default: {
    generateCourse: vi.fn(),
  },
}));

describe('EnhancedAIService', () => {
  let EnhancedAIService;
  let service;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Dynamic import to ensure mocks are applied
    const module = await import('../enhancedAIService.js');
    EnhancedAIService = module.EnhancedAIService;
    service = new EnhancedAIService();
  });

  describe('Constructor', () => {
    it('initializes with correct model priorities', () => {
      expect(service.modelPriorities).toBeDefined();
      expect(service.modelPriorities.textGeneration).toHaveLength(3);
      expect(service.modelPriorities.imageGeneration).toHaveLength(4);
    });

    it('sets up API configurations', () => {
      expect(service.apiKeyManager).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('handles missing API keys gracefully', async () => {
      const { default: apiKeyManager } = await import('../apiKeyManager.js');
      apiKeyManager.getApiKey.mockReturnValue(null);

      const newService = new EnhancedAIService();
      expect(newService.openai).toBeNull();
    });

    it('initializes OpenAI when API key is available', async () => {
      const { default: apiKeyManager } = await import('../apiKeyManager.js');
      apiKeyManager.getApiKey.mockReturnValue('test-api-key');

      const newService = new EnhancedAIService();
      expect(newService.openai).toBeDefined();
    });
  });

  describe('Model Priorities', () => {
    it('has correct priority order for text generation', () => {
      const textModels = service.modelPriorities.textGeneration;
      expect(textModels[0].provider).toBe('openai');
      expect(textModels[0].priority).toBe(1);
      expect(textModels[1].provider).toBe('huggingface-router');
      expect(textModels[1].priority).toBe(2);
    });

    it('has correct priority order for image generation', () => {
      const imageModels = service.modelPriorities.imageGeneration;
      expect(imageModels[0].provider).toBe('deepai');
      expect(imageModels[0].priority).toBe(1);
      expect(imageModels[1].provider).toBe('huggingface');
      expect(imageModels[1].priority).toBe(2);
    });
  });
});
