# AI Services Usage Guide

## Overview
This guide explains how to use the newly integrated AI services in your course creation platform. The system now supports multiple AI providers for different types of content generation.

## Supported AI Services

### Text Generation
- **Primary**: OpenAI GPT-4o / GPT-4o mini
- **Fallback**: Bytez models

### Image Generation
- **Primary**: Stability AI
- **Secondary**: OpenAI DALL·E
- **Fallback**: Bytez models

### Text-to-Speech (TTS)
- **Primary**: ElevenLabs
- **Secondary**: Azure TTS
- **Fallback**: Bytez models (if available)

### Speech-to-Text (STT)
- **Primary**: AssemblyAI
- **Secondary**: OpenAI Whisper
- **Fallback**: Bytez models (if available)

## Setup Instructions

### 1. Environment Variables
Add the following environment variables to your `.env` file:

```env
# OpenAI (Text Generation & Image Generation & STT)
VITE_OPENAI_API_KEY=your_openai_api_key

# Stability AI (Image Generation)
VITE_STABILITY_API_KEY=your_stability_api_key

# ElevenLabs (TTS)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Azure TTS (TTS)
VITE_AZURE_TTS_KEY=your_azure_tts_key
VITE_AZURE_REGION=your_azure_region

# AssemblyAI (STT)
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Bytez (Fallback for all services)
VITE_BYTEZ_API_KEY=your_bytez_api_key
```

### 2. Service Router Usage
The `AIServiceRouter` automatically handles provider selection and fallback. Here's how to use it:

```javascript
import AIServiceRouter from '@/services/AIServiceRouter';

const aiService = new AIServiceRouter();

// Text Generation
const text = await aiService.generateText('Explain quantum computing in simple terms', {
  model: 'gpt-4o',
  maxTokens: 500
});

// Image Generation
const imageUrl = await aiService.generateImage('A futuristic classroom with AI assistants', {
  size: '1024x1024'
});

// Text-to-Speech
const audioUrl = await aiService.textToSpeech('Welcome to our AI-powered course', {
  voiceId: '21m00Tcm4TlvDq8ikWAM'
});

// Speech-to-Text
const transcript = await aiService.speechToText(audioBuffer);
```

## Course Creation Integration

### 1. Enhanced Course Outline Generation
The system now uses OpenAI GPT-4o for more comprehensive course structure generation:

```javascript
import { generateAICourseOutline } from '@/services/aiCourseService';

const courseData = {
  title: 'Introduction to Machine Learning',
  subject: 'Data Science',
  description: 'Learn the fundamentals of machine learning',
  targetAudience: 'Beginner developers',
  difficulty: 'Beginner',
  duration: '6 weeks'
};

const outline = await generateAICourseOutline(courseData);
```

### 2. Improved Image Generation
Course images are now generated with higher quality using Stability AI or DALL·E:

```javascript
import { generateCourseImage } from '@/services/aiCourseService';

const image = await generateCourseImage('Neural network diagram showing layers and connections', {
  style: 'technical',
  size: '1024x1024'
});
```

### 3. Better Content Summarization
Lesson content is summarized more effectively using OpenAI models:

```javascript
import { summarizeContent } from '@/services/aiCourseService';

const summary = await summarizeContent(longLessonContent, {
  length: 'medium',
  type: 'bullet'
});
```

### 4. Enhanced Question Answering
Student questions are answered with more accuracy using advanced models:

```javascript
import { searchCourseContent } from '@/services/aiCourseService';

const answer = await searchCourseContent('What is supervised learning?', lessonContext);
```

## Provider Priority and Fallback

The system automatically uses the best available provider based on this priority:

1. **Text Generation**: OpenAI → Bytez
2. **Image Generation**: Stability AI → OpenAI → Bytez
3. **Text-to-Speech**: ElevenLabs → Azure → Bytez
4. **Speech-to-Text**: AssemblyAI → OpenAI → Bytez

If a primary provider fails or isn't configured, the system automatically falls back to the next available provider.

## Error Handling

All AI service calls include proper error handling:

```javascript
try {
  const result = await aiService.generateText(prompt);
  // Use result
} catch (error) {
  console.error('AI service failed:', error.message);
  // Handle fallback or show user-friendly error
}
```

## Monitoring and Logging

The system logs all AI service usage for monitoring:

```javascript
// Check available providers
const textProviders = aiService.getAvailableProviders('text');
console.log('Available text providers:', textProviders);
```

## Best Practices

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables for all keys
- Rotate keys regularly

### 2. Rate Limiting
- Implement request queuing for high-volume operations
- Add retry mechanisms with exponential backoff
- Monitor usage to avoid hitting limits

### 3. Content Quality
- Always validate AI-generated content
- Implement content filtering for inappropriate material
- Provide manual review options for critical content

### 4. User Experience
- Show loading indicators during AI operations
- Provide clear error messages
- Offer retry options for failed operations

## Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Verify keys are correctly set in environment variables
   - Check that keys have proper permissions
   - Ensure there are no extra spaces or characters

2. **Rate Limiting**
   - Implement request throttling
   - Add user feedback during delays
   - Consider batching operations

3. **Poor Quality Output**
   - Refine prompts for better results
   - Adjust temperature and other parameters
   - Use more specific instructions

### Debugging Tips

1. Enable detailed logging to see which providers are being used
2. Check browser console for API error messages
3. Verify environment variables are loaded correctly
4. Test each provider individually to isolate issues

## Future Enhancements

1. **Multi-language Support**
   - Add translation services
   - Support internationalization

2. **Personalization**
   - Adapt content to individual learning styles
   - Implement recommendation systems

3. **Advanced Features**
   - Custom AI models for specific domains
   - Real-time content generation
   - AI-powered tutoring assistance

This integration provides a robust foundation for AI-powered course creation while maintaining flexibility to adapt to changing requirements and new AI technologies.