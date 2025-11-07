import openAIService from './openAIService.js';

/**
 * Test OpenAI API connectivity and functionality
 */
async function testOpenAI() {
  console.log('🧪 Testing OpenAI API...');

  try {
    // Test 1: Check if client is available
    console.log('1. Checking OpenAI client availability...');
    const isAvailable = openAIService.isAvailable();
    console.log(`   Client available: ${isAvailable}`);

    if (!isAvailable) {
      console.error('❌ OpenAI client not available');
      return;
    }

    // Test 2: Generate simple text
    console.log('2. Testing text generation...');
    const textResult = await openAIService.generateText(
      'Write a short sentence about learning.',
      {
        maxTokens: 50,
        temperature: 0.7,
      }
    );
    console.log(`   Text result: "${textResult}"`);
    console.log(`   Text type: ${typeof textResult}`);

    // Test 3: Generate image
    console.log('3. Testing image generation...');
    const imageResult = await openAIService.generateImage(
      'A simple educational icon',
      {
        size: '1024x1024',
        quality: 'standard',
      }
    );
    console.log(`   Image result:`, imageResult);
    console.log(`   Image URL: ${imageResult.url}`);

    console.log('✅ All OpenAI tests passed!');
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
  }
}

// Export for testing
export { testOpenAI };

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOpenAI();
}
