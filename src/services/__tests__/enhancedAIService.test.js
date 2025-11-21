import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the secureAIService dependency
const mockSecureAIService = {
  generateText: vi.fn().mockResolvedValue('Generated text'),
  generateStructured: vi.fn().mockResolvedValue({ success: true, data: {} }),
  generateCourseOutline: vi.fn().mockResolvedValue({ success: true, data: {} }),
  generateCourseImage: vi
    .fn()
    .mockResolvedValue({ success: true, data: { url: 'test-url' } }),
  generateLessonContent: vi.fn().mockResolvedValue('Generated lesson content'),
  isAvailable: vi.fn().mockResolvedValue(true), // This is async
};

vi.mock('../secureAIService', () => ({
  default: mockSecureAIService,
}));

describe('EnhancedAIService', () => {
  let service;

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset mock implementations to defaults
    mockSecureAIService.generateText.mockResolvedValue('Generated text');
    mockSecureAIService.generateStructured.mockResolvedValue({
      success: true,
      data: {},
    });
    mockSecureAIService.generateCourseOutline.mockResolvedValue({
      success: true,
      data: {},
    });
    mockSecureAIService.generateCourseImage.mockResolvedValue({
      success: true,
      data: { url: 'test-url' },
    });
    mockSecureAIService.generateLessonContent.mockResolvedValue(
      'Generated lesson content'
    );
    mockSecureAIService.isAvailable.mockResolvedValue(true);

    // Import the singleton instance
    const module = await import('../enhancedAIService.js');
    service = module.default;
  });

  describe('Service Instance', () => {
    it('initializes as singleton instance', () => {
      expect(service).toBeDefined();
      expect(service.openai).toBeDefined();
    });

    it('has OpenAI service available', async () => {
      const available = await service.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('Text Generation', () => {
    it('generates text successfully', async () => {
      const result = await service.generateText('Test prompt');
      expect(result).toBe('Generated text');
      expect(service.openai.generateText).toHaveBeenCalledWith(
        'Test prompt',
        {}
      );
    });

    it('handles text generation errors', async () => {
      mockSecureAIService.generateText.mockRejectedValue(
        new Error('API Error')
      );

      await expect(service.generateText('Test prompt')).rejects.toThrow(
        'Text generation failed: API Error'
      );
    });
  });

  describe('Structured Generation', () => {
    it('generates structured data successfully', async () => {
      const result = await service.generateStructured(
        'System prompt',
        'User prompt'
      );
      expect(result).toEqual({ success: true, data: {} });
      expect(service.openai.generateStructured).toHaveBeenCalledWith(
        'System prompt',
        'User prompt',
        {}
      );
    });

    it('handles structured generation errors', async () => {
      mockSecureAIService.generateStructured.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        service.generateStructured('System', 'User')
      ).rejects.toThrow('Structured generation failed: API Error');
    });
  });

  describe('Course Generation', () => {
    it('generates course outline successfully', async () => {
      const courseData = { title: 'Test Course' };
      const result = await service.generateCourseOutline(courseData);

      expect(result).toEqual({ success: true, data: {} });
      expect(service.openai.generateCourseOutline).toHaveBeenCalledWith(
        courseData
      );
    });

    it('handles course outline generation errors', async () => {
      mockSecureAIService.generateCourseOutline.mockRejectedValue(
        new Error('API Error')
      );

      const result = await service.generateCourseOutline({});
      expect(result).toEqual({
        success: false,
        error: 'API Error',
        data: null,
      });
    });
  });

  describe('Image Generation', () => {
    it('generates course image successfully', async () => {
      const result = await service.generateCourseImage('Test prompt');

      expect(result).toEqual({ success: true, data: { url: 'test-url' } });
      expect(service.openai.generateCourseImage).toHaveBeenCalledWith(
        'Test prompt',
        {}
      );
    });

    it('handles image generation errors', async () => {
      mockSecureAIService.generateCourseImage.mockRejectedValue(
        new Error('API Error')
      );

      const result = await service.generateCourseImage('Test prompt');
      expect(result).toEqual({
        success: false,
        error: 'API Error',
        data: null,
      });
    });
  });

  describe('Lesson Content Generation', () => {
    it('generates lesson content successfully', async () => {
      const lessonData = { title: 'Test Lesson' };
      const moduleData = { title: 'Test Module' };
      const courseData = { title: 'Test Course' };

      const result = await service.generateLessonContent(
        lessonData,
        moduleData,
        courseData
      );

      expect(result).toBe('Generated lesson content');
      expect(service.openai.generateLessonContent).toHaveBeenCalledWith(
        lessonData,
        moduleData,
        courseData,
        {}
      );
    });

    it('handles lesson content generation errors', async () => {
      const error = new Error('API Error');
      mockSecureAIService.generateLessonContent.mockRejectedValue(error);

      await expect(service.generateLessonContent({}, {}, {})).rejects.toThrow(
        error
      );
    });
  });
});
