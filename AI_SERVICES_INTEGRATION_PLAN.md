# AI Services Integration Plan

## Overview

This document outlines the implementation plan for integrating multiple AI services into the course creation and content generation system. The services include:

- OpenAI GPT-4o / GPT-4o mini for text generation and summarization
- Stability AI / OpenAI DALL·E for image generation
- ElevenLabs / Azure TTS for text-to-speech
- Whisper / AssemblyAI for speech-to-text

## Current System Analysis

### Existing AI Infrastructure

The current system already has:

1. **Bytez API Service** - Handles various AI model interactions
2. **AI Course Service** - Manages course outline generation
3. **LangChain Bytez Integration** - Provides enhanced AI capabilities
4. **AI Proxy Service** - Acts as a frontend interface for AI operations

### Current Limitations

1. All AI functionality is currently routed through Bytez SDK
2. No direct integration with OpenAI, Stability AI, ElevenLabs, or AssemblyAI
3. Image generation limited to specific models
4. No text-to-speech or speech-to-text capabilities

## Proposed Integration Flow

### 1. Multi-Provider AI Service Architecture

#### Text Generation (GPT-4o / GPT-4o mini)

```
[Frontend] → [AI Service Router] → [OpenAI API] → [Response Processing] → [Frontend]
```

#### Image Generation (Stability AI / DALL·E)

```
[Frontend] → [AI Service Router] → [Stability AI API / OpenAI API] → [Response Processing] → [Frontend]
```

#### Text-to-Speech (ElevenLabs / Azure TTS)

```
[Frontend] → [AI Service Router] → [ElevenLabs API / Azure TTS API] → [Audio Processing] → [Frontend]
```

#### Speech-to-Text (Whisper / AssemblyAI)

```
[Frontend] → [AI Service Router] → [Whisper API / AssemblyAI API] → [Text Processing] → [Frontend]
```

### 2. Service Router Implementation

Create a new `AIServiceRouter.js` that will:

1. Determine which provider to use based on service type and availability
2. Handle API key management for multiple providers
3. Provide fallback mechanisms when primary providers fail
4. Manage rate limiting and quotas

### 3. Enhanced AI Course Service

Modify `aiCourseService.js` to:

1. Integrate with the new service router
2. Add support for multimedia content generation
3. Implement batch processing for course content
4. Add progress tracking for long-running operations

## Detailed Implementation Plan

### Phase 1: Service Router Development

#### 1. Create AIServiceRouter Class

```javascript
// src/services/AIServiceRouter.js
class AIServiceRouter {
  constructor() {
    this.providers = {
      text: ['openai', 'bytez'],
      image: ['stability', 'openai', 'bytez'],
      tts: ['elevenlabs', 'azure'],
      stt: ['whisper', 'assemblyai', 'bytez'],
    };

    this.apiKeys = {
      openai: process.env.VITE_OPENAI_API_KEY,
      stability: process.env.VITE_STABILITY_API_KEY,
      elevenlabs: process.env.VITE_ELEVENLABS_API_KEY,
      azure: process.env.VITE_AZURE_TTS_KEY,
      assemblyai: process.env.VITE_ASSEMBLYAI_API_KEY,
      bytez: process.env.VITE_BYTEZ_API_KEY,
    };
  }

  async generateText(prompt, options = {}) {
    // Implementation for text generation
  }

  async generateImage(prompt, options = {}) {
    // Implementation for image generation
  }

  async textToSpeech(text, options = {}) {
    // Implementation for text-to-speech
  }

  async speechToText(audioBuffer, options = {}) {
    // Implementation for speech-to-text
  }
}
```

#### 2. Environment Variable Configuration

Add the following to `.env` files:

```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STABILITY_API_KEY=your_stability_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_AZURE_TTS_KEY=your_azure_tts_key
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

### Phase 2: Text Generation Integration (GPT-4o / GPT-4o mini)

#### 1. OpenAI API Integration

```javascript
// In AIServiceRouter.js
async generateTextWithOpenAI(prompt, options = {}) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKeys.openai}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

#### 2. Course Content Generation Enhancement

Modify `aiCourseService.js` to use the new router:

```javascript
// Enhanced course outline generation
export async function generateAICourseOutline(courseData) {
  try {
    // Use OpenAI for better course structure generation
    const prompt = `Create a comprehensive course structure for "${courseData.title}".
    
    Subject: ${courseData.subject}
    Description: ${courseData.description}
    Target Audience: ${courseData.targetAudience}
    Difficulty: ${courseData.difficulty}
    
    Generate exactly 4 modules with:
    1. Module title
    2. Detailed description
    3. 3-5 lessons per module with titles and brief descriptions
    
    Format as JSON.`;

    const aiServiceRouter = new AIServiceRouter();
    const response = await aiServiceRouter.generateText(prompt, {
      model: 'gpt-4o',
      maxTokens: 2000,
    });

    // Parse and structure the response
    const courseOutline = JSON.parse(response);
    return {
      success: true,
      data: courseOutline,
    };
  } catch (error) {
    // Fallback to existing implementation
    return generateAICourseOutlineFallback(courseData);
  }
}
```

### Phase 3: Image Generation Integration (Stability AI / DALL·E)

#### 1. Stability AI Integration

```javascript
// In AIServiceRouter.js
async generateImageWithStability(prompt, options = {}) {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKeys.stability}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: options.cfgScale || 7,
      height: options.height || 1024,
      width: options.width || 1024,
      samples: options.samples || 1
    })
  });

  const data = await response.json();
  return data.artifacts[0].base64;
}
```

#### 2. DALL·E Integration

```javascript
// In AIServiceRouter.js
async generateImageWithDalle(prompt, options = {}) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKeys.openai}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: options.samples || 1,
      size: options.size || '1024x1024'
    })
  });

  const data = await response.json();
  return data.data[0].url;
}
```

### Phase 4: Text-to-Speech Integration (ElevenLabs / Azure TTS)

#### 1. ElevenLabs Integration

```javascript
// In AIServiceRouter.js
async textToSpeechWithElevenLabs(text, options = {}) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': this.apiKeys.elevenlabs,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: options.modelId || 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarityBoost || 0.5
      }
    })
  });

  const audioBuffer = await response.arrayBuffer();
  return URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));
}
```

#### 2. Azure TTS Integration

```javascript
// In AIServiceRouter.js
async textToSpeechWithAzure(text, options = {}) {
  const response = await fetch(`https://${process.env.VITE_AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await this.getAzureAccessToken()}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
    },
    body: this.createSSML(text, options)
  });

  const audioBuffer = await response.arrayBuffer();
  return URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));
}
```

### Phase 5: Speech-to-Text Integration (Whisper / AssemblyAI)

#### 1. Whisper Integration

```javascript
// In AIServiceRouter.js
async speechToTextWithWhisper(audioBuffer, options = {}) {
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
  formData.append('model', options.model || 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKeys.openai}`
    },
    body: formData
  });

  const data = await response.json();
  return data.text;
}
```

#### 2. AssemblyAI Integration

```javascript
// In AIServiceRouter.js
async speechToTextWithAssemblyAI(audioBuffer, options = {}) {
  // Upload audio file
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': this.apiKeys.assemblyai
    },
    body: audioBuffer
  });

  const uploadData = await uploadResponse.json();

  // Transcribe audio
  const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': this.apiKeys.assemblyai,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: uploadData.upload_url,
      language_detection: options.detectLanguage || false
    })
  });

  const transcribeData = await transcribeResponse.json();
  const transcriptId = transcribeData.id;

  // Poll for completion
  let transcript;
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': this.apiKeys.assemblyai
      }
    });
    transcript = await pollResponse.json();
  } while (transcript.status !== 'completed' && transcript.status !== 'error');

  if (transcript.status === 'error') {
    throw new Error(transcript.error);
  }

  return transcript.text;
}
```

## Course Creation Workflow Enhancement

### Enhanced AI Course Creation Flow

1. **Course Outline Generation**
   - Use GPT-4o to generate comprehensive course structure
   - Include learning objectives, prerequisites, and outcomes
   - Generate module and lesson titles with descriptions

2. **Content Generation**
   - For each lesson, generate detailed content using GPT-4o
   - Create interactive elements (quizzes, exercises, examples)
   - Generate summaries and key takeaways

3. **Multimedia Enhancement**
   - Generate relevant images for each lesson using DALL·E/Stability AI
   - Create audio narrations using ElevenLabs/Azure TTS
   - Add visual diagrams and illustrations

4. **Accessibility Features**
   - Generate transcripts for audio content using Whisper/AssemblyAI
   - Create alternative text for images
   - Provide multiple language options

5. **Quality Assurance**
   - Review and validate generated content
   - Check for consistency and accuracy
   - Ensure educational standards are met

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)

- Implement AIServiceRouter
- Integrate OpenAI GPT-4o for text generation
- Update aiCourseService to use new router

### Phase 2: Visual Content (Week 3)

- Integrate Stability AI and DALL·E for image generation
- Add image generation to course creation flow
- Implement image management in course builder

### Phase 3: Audio Content (Week 4)

- Integrate ElevenLabs and Azure TTS for text-to-speech
- Add audio narration to lessons
- Implement audio player in lesson viewer

### Phase 4: Accessibility (Week 5)

- Integrate Whisper and AssemblyAI for speech-to-text
- Generate transcripts for audio content
- Add accessibility features to course builder

### Phase 5: Testing and Optimization (Week 6)

- Test all integrations thoroughly
- Optimize performance and error handling
- Implement fallback mechanisms
- Document usage and best practices

## Error Handling and Fallbacks

1. **API Key Management**
   - Check for valid API keys before making requests
   - Provide clear error messages for missing keys
   - Implement key rotation for multiple providers

2. **Rate Limiting**
   - Implement request queuing for rate-limited APIs
   - Add retry mechanisms with exponential backoff
   - Provide user feedback during rate limiting

3. **Fallback Providers**
   - Automatically switch to alternative providers when one fails
   - Maintain quality with graceful degradation
   - Log failures for monitoring and improvement

4. **Content Validation**
   - Validate generated content for educational quality
   - Implement content filtering for inappropriate material
   - Provide manual review options for critical content

## Security Considerations

1. **API Key Protection**
   - Store API keys in environment variables
   - Use secure transmission for API requests
   - Implement key rotation policies

2. **Content Safety**
   - Filter generated content for inappropriate material
   - Implement content moderation
   - Provide reporting mechanisms for issues

3. **Data Privacy**
   - Protect user data in API requests
   - Implement proper authentication
   - Comply with data protection regulations

## Monitoring and Analytics

1. **Usage Tracking**
   - Track API usage per provider
   - Monitor costs and quotas
   - Generate usage reports

2. **Performance Monitoring**
   - Track response times for each service
   - Monitor success/failure rates
   - Identify performance bottlenecks

3. **Quality Metrics**
   - Track user satisfaction with generated content
   - Monitor content accuracy and relevance
   - Gather feedback for continuous improvement

## Future Enhancements

1. **Multi-language Support**
   - Generate content in multiple languages
   - Implement translation services
   - Support internationalization

2. **Personalization**
   - Adapt content to individual learning styles
   - Implement recommendation systems
   - Provide personalized learning paths

3. **Interactive Elements**
   - Generate interactive quizzes and exercises
   - Create virtual labs and simulations
   - Implement gamification features

4. **Advanced AI Features**
   - Implement custom AI models for specific domains
   - Add real-time content generation
   - Provide AI-powered tutoring assistance

This integration plan provides a comprehensive approach to implementing multiple AI services in your course creation platform, ensuring a robust, scalable, and user-friendly experience.
