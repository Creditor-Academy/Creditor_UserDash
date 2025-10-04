# Multi-API AI Integration Documentation

## Overview

This document describes the comprehensive multi-API AI integration system that provides intelligent failover across multiple AI providers for text generation, image generation, and course creation in the Creditor Academy LMS platform.

## Architecture

### Provider Priority System

The system uses an intelligent priority-based failover mechanism:

#### Text Generation Priority:
1. **OpenAI** (gpt-3.5-turbo) - Primary provider
2. **HuggingFace** (meta-llama/Llama-3.1-8B-Instruct) - High-quality free model
3. **HuggingFace** (tiiuae/falcon-7b-instruct) - Lightweight alternative
4. **Bytez** (google/flan-t5-base) - Final fallback with multi-key rotation

#### Image Generation Priority:
1. **Deep AI** (text2img) - Primary provider
2. **HuggingFace** (runwayml/stable-diffusion-v1-5) - Popular free model
3. **HuggingFace** (stabilityai/stable-diffusion-2-1) - Higher quality alternative

## Configuration

### Environment Variables

```env
# AI Service API Keys - Multi-Provider Configuration
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_DEEPAI_API_KEY=your_deepai_key_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_key_here

# Bytez API Keys - Multi-Account Rotation System
VITE_BYTEZ_KEY=your_primary_bytez_key_here
VITE_BYTEZ_KEY_2=your_secondary_bytez_key_here
VITE_BYTEZ_KEY_3=your_third_bytez_key_here
VITE_BYTEZ_KEY_4=your_fourth_bytez_key_here
```

### API Key Sources

The system checks for API keys in multiple locations:
1. Environment variables (VITE_*)
2. Legacy environment variables (REACT_APP_*)
3. Local storage (for runtime configuration)
4. Manual entry prompts (as fallback)

## Services

### 1. Enhanced AI Service (`enhancedAIService.js`)

Main service that orchestrates all AI providers with intelligent failover.

#### Key Methods:

```javascript
// Generate text with automatic provider failover
const result = await enhancedAIService.generateText(prompt, options);

// Generate images with multi-provider support
const result = await enhancedAIService.generateImage(prompt, options);

// Generate course outline with comprehensive fallback
const result = await enhancedAIService.generateCourseOutline(courseData);

// Test all API connections
const status = await enhancedAIService.getAPIStatus();
```

#### Response Format:

```javascript
{
  success: true,
  data: {
    text: "Generated content...",
    provider: "openai",
    model: "gpt-3.5-turbo",
    usage: { /* token usage info */ }
  }
}
```

### 2. Bytez Integration Service (`bytezIntegration.js`)

Handles Bytez API with multi-key rotation for reliability.

#### Features:
- 4-key rotation system
- Automatic failover between accounts
- Comprehensive error logging
- Fallback content generation

### 3. Enhanced Image Service (`enhancedImageService.js`)

Specialized service for image generation with upload capabilities.

#### Features:
- Multi-provider image generation
- Automatic blob-to-file conversion for HuggingFace
- S3 upload integration
- Fallback placeholder generation

## Usage Examples

### Basic Text Generation

```javascript
import enhancedAIService from './services/enhancedAIService';

const generateContent = async () => {
  const result = await enhancedAIService.generateText(
    "Create a lesson outline for React hooks",
    {
      maxTokens: 500,
      temperature: 0.7
    }
  );
  
  if (result.success) {
    console.log(`Generated with ${result.data.provider}`);
    console.log(result.data.text);
  }
};
```

### Course Outline Generation

```javascript
import { generateAICourseOutline } from './services/aiCourseService';

const createCourse = async () => {
  const courseData = {
    title: "Introduction to React",
    subject: "Web Development",
    description: "Learn React fundamentals",
    difficulty: "beginner"
  };
  
  const result = await generateAICourseOutline(courseData);
  
  if (result.success) {
    console.log(`Generated ${result.data.modules.length} modules`);
    console.log(`Provider: ${result.provider}`);
  }
};
```

### Image Generation with Upload

```javascript
import { generateAndUploadCourseImage } from './services/aiCourseService';

const generateThumbnail = async () => {
  const result = await generateAndUploadCourseImage(
    "Modern course thumbnail for React programming",
    { style: 'realistic' }
  );
  
  if (result.success) {
    console.log(`Image URL: ${result.data.url}`);
    console.log(`Provider: ${result.data.provider}`);
    console.log(`Uploaded: ${result.data.uploaded}`);
  }
};
```

## Error Handling

### Automatic Failover

The system automatically tries alternative providers when one fails:

```javascript
// This will try OpenAI → HuggingFace → Bytez → Fallback
const result = await enhancedAIService.generateText(prompt);
```

### Error Response Format

```javascript
{
  success: false,
  error: "All providers failed",
  data: {
    // Fallback content if available
  }
}
```

### Logging

All API attempts are logged with detailed information:

```
🚀 Using Enhanced AI Service with multi-provider support...
✅ Course outline generation successful with huggingface
🔄 Enhanced AI failed, trying legacy OpenAI service: Rate limit exceeded
✅ Legacy OpenAI course outline generation successful
```

## Testing

### API Status Check

```javascript
const status = await enhancedAIService.getAPIStatus();
console.log(`Available providers: ${status.summary.availableProviders}`);
console.log(`Text providers: ${status.summary.textProviders}`);
console.log(`Image providers: ${status.summary.imageProviders}`);
```

### Test Component

Use the `MultiAPITest` component to verify all integrations:

```javascript
import MultiAPITest from './components/test/MultiAPITest';

// Render in your app for testing
<MultiAPITest />
```

## Model Specifications

### HuggingFace Models

#### Text Generation:
- **meta-llama/Llama-3.1-8B-Instruct**: Best mix of quality + free
- **tiiuae/falcon-7b-instruct**: Smaller, faster alternative

#### Image Generation:
- **runwayml/stable-diffusion-v1-5**: Most popular, fast generation
- **stabilityai/stable-diffusion-2-1**: Higher quality, more detailed results

### Bytez Models

- **google/flan-t5-base**: Primary model for course generation
- **google/flan-t5-small**: Lightweight alternative
- **microsoft/DialoGPT-small**: Conversational fallback
- **gpt2**: Final text generation fallback

## Performance Considerations

### Rate Limiting

- Each provider has different rate limits
- Multi-key rotation helps distribute load
- Automatic backoff and retry logic

### Caching

- Generated content can be cached locally
- API status results are cached for performance
- Image URLs are cached to avoid regeneration

### Cost Management

- Free tier models are prioritized
- Usage tracking for paid APIs
- Fallback to free alternatives when possible

## Security

### API Key Protection

- All keys stored as environment variables
- No hardcoded keys in client code
- Optional backend proxy for additional security

### Content Validation

- Input sanitization for all prompts
- Output validation and filtering
- Safe fallback content generation

## Troubleshooting

### Common Issues

1. **"No API keys configured"**
   - Check environment variables are set
   - Verify .env file is loaded correctly
   - Use manual entry as fallback

2. **"All providers failed"**
   - Check internet connectivity
   - Verify API keys are valid
   - Check provider status pages

3. **"Rate limit exceeded"**
   - System will automatically try next provider
   - Consider upgrading API plans
   - Use multi-key rotation for Bytez

### Debug Mode

Enable detailed logging by setting:
```javascript
localStorage.setItem('ai-debug', 'true');
```

## Future Enhancements

### Planned Features

1. **Backend Proxy Integration**: Move API calls to backend for security
2. **Advanced Caching**: Redis-based caching for generated content
3. **Usage Analytics**: Track API usage and costs
4. **Custom Model Support**: Allow custom model configurations
5. **Streaming Support**: Real-time content generation
6. **A/B Testing**: Compare outputs from different providers

### Model Additions

- **Anthropic Claude**: For advanced reasoning tasks
- **Google Gemini**: For multimodal capabilities
- **Cohere**: For specialized text generation
- **Midjourney**: For artistic image generation

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for detailed error information
3. Use the MultiAPITest component to diagnose issues
4. Contact the development team with specific error messages

---

**Last Updated**: 2025-09-24
**Version**: 1.0.0
**Compatibility**: React 18+, Vite 4+
