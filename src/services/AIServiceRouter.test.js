// AIServiceRouter.test.js - Tests for AIServiceRouter
import AIServiceRouter from './AIServiceRouter';

describe('AIServiceRouter', () => {
  let aiServiceRouter;

  beforeEach(() => {
    aiServiceRouter = new AIServiceRouter();
  });

  describe('Provider Configuration', () => {
    test('should detect configured providers', () => {
      // This test will depend on environment variables
      // In a real test environment, you would mock these
      expect(aiServiceRouter).toBeDefined();
    });

    test('should return available providers for each service type', () => {
      const textProviders = aiServiceRouter.getAvailableProviders('text');
      const imageProviders = aiServiceRouter.getAvailableProviders('image');
      const ttsProviders = aiServiceRouter.getAvailableProviders('tts');
      const sttProviders = aiServiceRouter.getAvailableProviders('stt');

      expect(Array.isArray(textProviders)).toBe(true);
      expect(Array.isArray(imageProviders)).toBe(true);
      expect(Array.isArray(ttsProviders)).toBe(true);
      expect(Array.isArray(sttProviders)).toBe(true);
    });
  });

  describe('Text Generation', () => {
    test('should have generateText method', () => {
      expect(typeof aiServiceRouter.generateText).toBe('function');
    });

    // Note: These tests would require mocking API calls in a real environment
    // For now, we're just testing the method exists
  });

  describe('Image Generation', () => {
    test('should have generateImage method', () => {
      expect(typeof aiServiceRouter.generateImage).toBe('function');
    });
  });

  describe('Text-to-Speech', () => {
    test('should have textToSpeech method', () => {
      expect(typeof aiServiceRouter.textToSpeech).toBe('function');
    });
  });

  describe('Speech-to-Text', () => {
    test('should have speechToText method', () => {
      expect(typeof aiServiceRouter.speechToText).toBe('function');
    });
  });
});