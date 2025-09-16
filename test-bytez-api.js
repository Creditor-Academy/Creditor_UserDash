// Test Bytez API directly
import bytezAPI from './src/services/bytezAPI.js';

async function testBytezAPI() {
  console.log('🧪 Testing Bytez API Connection...');
  
  try {
    // Test 1: Basic connection test
    console.log('\n1️⃣ Testing basic connection...');
    const connectionTest = await bytezAPI.testConnection();
    console.log('Connection test result:', connectionTest);
    
    // Test 2: Text generation
    console.log('\n2️⃣ Testing text generation...');
    const textResult = await bytezAPI.generateText('Create a simple course outline for JavaScript basics', {
      max_length: 200
    });
    console.log('Text generation result:', textResult);
    
    // Test 3: Image generation
    console.log('\n3️⃣ Testing image generation...');
    const imageResult = await bytezAPI.generateImage('A modern classroom with computers', {
      width: 256,
      height: 256
    });
    console.log('Image generation result:', imageResult);
    
    // Test 4: Text summarization
    console.log('\n4️⃣ Testing text summarization...');
    const summaryResult = await bytezAPI.summarizeText('JavaScript is a programming language that enables interactive web pages and is an essential part of web applications. It is a high-level, interpreted programming language with first-class functions.');
    console.log('Summarization result:', summaryResult);
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the test
testBytezAPI();
