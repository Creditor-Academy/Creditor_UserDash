// Test AI image generation
import AIServiceRouter from './src/services/AIServiceRouter.js';

async function testImageGeneration() {
  try {
    console.log('Testing AI image generation...');

    const aiService = new AIServiceRouter();

    // Check which providers are configured
    console.log('Available providers:', {
      openai: aiService.apiKeys.openai ? 'YES' : 'NO',
      stability: aiService.apiKeys.stability ? 'YES' : 'NO',
      bytez: aiService.apiKeys.bytez ? 'YES' : 'NO',
    });

    // Test image generation
    const prompt = 'A beautiful landscape with mountains and a lake';
    console.log('Generating image with prompt:', prompt);

    const result = await aiService.generateImage(prompt, {
      style: 'realistic',
      size: '1024x1024',
    });

    console.log('Image generation result:', result);
  } catch (error) {
    console.error('Error testing image generation:', error);
  }
}

testImageGeneration();
