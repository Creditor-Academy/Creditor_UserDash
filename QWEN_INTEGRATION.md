# Qwen Models Integration Guide

This document outlines the comprehensive integration of Qwen models into the Creditor Academy LMS platform for enhanced AI course creation with content moderation and advanced image generation.

## Overview

We have successfully integrated two powerful Qwen models:

1. **Qwen3Guard Models** - For content safety and moderation
2. **Qwen Image Detail Slider** - For advanced image generation with controllable detail levels

## 🛡️ Qwen3Guard Content Moderation

### Models Integrated

- **Qwen/Qwen3Guard-Gen-0.6B** - For prompt moderation
- **Qwen/Qwen3Guard-4B-Gen** - For response moderation

### Features

#### Content Safety Checking

- **Prompt Moderation**: Checks user input before AI generation
- **Response Moderation**: Validates AI-generated content
- **Comprehensive Analysis**: Evaluates overall course content safety

#### Safety Categories

The system detects and categorizes content across:

- Violent content
- Non-violent illegal acts
- Sexual content or sexual acts
- PII (Personally Identifiable Information)
- Suicide & self-harm
- Unethical acts
- Politically sensitive topics
- Copyright violation
- Jailbreak attempts

#### Safety Levels

- **Safe**: Content is appropriate for educational use
- **Unsafe**: Content should not be used
- **Controversial**: Content may need review

### Implementation

#### Service Files

- `src/services/qwenGuardService.js` - Main moderation service
- `src/services/aiCourseService.js` - Enhanced with moderation functions

#### Key Functions

```javascript
// Moderate a prompt before generation
const promptResult = await qwenGuardService.moderatePrompt(userPrompt);

// Moderate generated content
const responseResult = await qwenGuardService.moderateResponse(
  prompt,
  generatedContent
);

// Comprehensive course content moderation
const courseResult = await qwenGuardService.moderateCourseContent(
  title,
  content
);

// Batch moderation for multiple items
const batchResult = await qwenGuardService.batchModerate(contentItems);
```

#### Enhanced Course Generation

```javascript
// Generate course with safety checks
const safeOutline = await generateSafeCourseOutline(courseData);

// Generate lesson with moderation
const safeLesson = await generateSafeLessonContent(prompt, options);
```

### API Configuration

The system uses the same Bytez API keys as the existing system:

```env
VITE_BYTEZ_KEY=your_primary_bytez_key_here
VITE_BYTEZ_KEY_2=your_secondary_bytez_key_here
VITE_BYTEZ_KEY_3=your_third_bytez_key_here
VITE_BYTEZ_KEY_4=your_fourth_bytez_key_here
```

### UI Integration

#### Settings Panel

- Toggle for enabling/disabling content moderation
- Real-time moderation results display
- Safety status indicators

#### Course Generation

- Automatic safety checks during outline generation
- User warnings for unsafe content
- Option to proceed with reviewed content

## 🎨 Qwen Image Detail Slider

### Model Integrated

- **ostris/qwen_image_detail_slider** - Advanced image generation with controllable detail levels

### Features

#### Detail Level Control

- **Minimal** (-2): Simple, clean design with basic elements
- **Low** (-1): Simplified design with reduced complexity
- **Normal** (0): Balanced detail level for general use
- **High** (1): Rich detail with intricate elements
- **Maximum** (2): Ultra-detailed, hyperrealistic imagery

#### Style Options

- **Professional**: Clean, corporate style
- **Creative**: Artistic, colorful design
- **Minimal**: Simple, elegant approach
- **Academic**: Scholarly, traditional style
- **Tech**: Modern, digital aesthetic

#### Performance Options

- **Generation Steps**: 5-20 steps (quality vs speed trade-off)
- **Guidance Scale**: Configurable prompt adherence
- **Resolution**: 1024x1024 optimized for course thumbnails

### Implementation

#### Service Files

- `src/services/qwenImageService.js` - Dedicated Qwen image service
- `src/services/enhancedAIService.js` - Updated with Qwen integration

#### HuggingFace Inference Client

The system supports both HuggingFace Inference Client and direct API calls:

```javascript
// Using HuggingFace Inference Client (preferred)
const image = await client.textToImage({
  provider: 'fal-ai',
  model: 'ostris/qwen_image_detail_slider',
  inputs: enhancedPrompt,
  parameters: {
    num_inference_steps: 5,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024,
  },
});

// Fallback to direct API calls
const response = await fetch(`${baseUrl}/${model}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: prompt,
    parameters: options,
  }),
});
```

#### Key Functions

```javascript
// Generate with detail control
const result = await qwenImageService.generateWithQwenDetailSlider(prompt, {
  detailLevel: 'high',
  steps: 8,
  guidance: 7.5,
});

// Generate course thumbnail
const thumbnail = await qwenImageService.generateCourseThumbnail(
  courseTitle,
  subject,
  { detailLevel: 'normal', style: 'professional' }
);

// Generate multiple detail levels
const variations = await qwenImageService.generateMultipleDetailLevels(prompt, [
  'minimal',
  'normal',
  'high',
]);
```

### API Configuration

Uses the existing HuggingFace API key:

```env
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### UI Integration

#### Media Tab

- Detail level selector (minimal to maximum)
- Style selection dropdown
- Generation steps slider
- Real-time preview generation
- Quality vs speed trade-off controls

#### Enhanced Course Creation

- Automatic thumbnail generation with optimal settings
- Fallback to traditional methods if needed
- Blob-to-file conversion for upload

## 🔧 Installation & Setup

### Required Dependencies

```bash
# Install HuggingFace Inference Client (optional but recommended)
npm install @huggingface/inference

# Existing dependencies already support Bytez integration
```

### Environment Configuration

Update your `.env.development` file:

```env
# HuggingFace API Key (configure with your key)
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Bytez API Keys for Qwen3Guard (enable these)
VITE_BYTEZ_KEY=your_primary_bytez_key_here
VITE_BYTEZ_KEY_2=your_secondary_bytez_key_here
VITE_BYTEZ_KEY_3=your_third_bytez_key_here
VITE_BYTEZ_KEY_4=your_fourth_bytez_key_here
```

### File Structure

```
src/
├── services/
│   ├── qwenGuardService.js      # Content moderation service
│   ├── qwenImageService.js      # Image generation service
│   ├── aiCourseService.js       # Enhanced with moderation
│   └── enhancedAIService.js     # Updated with Qwen integration
├── components/courses/
│   └── AICourseCreationPanel.jsx # Updated UI with controls
└── QWEN_INTEGRATION.md          # This documentation
```

## 🚀 Usage Examples

### Content Moderation Workflow

```javascript
// 1. Enable moderation in settings
setEnableContentModeration(true);

// 2. Generate course with safety checks
const result = await generateSafeCourseOutline(courseData);

// 3. Review moderation results
if (result.data?.moderation?.overall?.safe) {
  console.log('✅ Content is safe for educational use');
} else {
  console.log('⚠️ Content needs review');
  // Display moderation details to user
}
```

### Image Generation Workflow

```javascript
// 1. Configure detail level and style
const options = {
  detailLevel: 'high',
  style: 'professional',
  steps: 8,
};

// 2. Generate course thumbnail
const thumbnail = await qwenImageService.generateCourseThumbnail(
  'Introduction to React',
  'Web Development',
  options
);

// 3. Handle result
if (thumbnail.success) {
  setCourseData(prev => ({
    ...prev,
    thumbnail: thumbnail.data.url,
  }));
}
```

## 🔍 Testing & Validation

### Content Moderation Testing

```javascript
// Test moderation service
const testResult = await qwenGuardService.moderatePrompt(
  'Create a course about web development'
);
console.log('Safety:', testResult.data.safety); // Should be "Safe"
```

### Image Generation Testing

```javascript
// Test Qwen image service
const testResult = await qwenImageService.testQwenModel();
console.log('Available methods:', testResult.tests);
```

## 📊 Performance & Monitoring

### Content Moderation

- **Response Time**: ~2-5 seconds per moderation check
- **Accuracy**: High precision for educational content
- **Fallback**: Graceful degradation if moderation fails

### Image Generation

- **Generation Time**: 5-30 seconds depending on steps
- **Quality**: Superior detail control compared to traditional methods
- **Fallback**: Automatic fallback to Deep AI/HuggingFace models

## 🛠️ Troubleshooting

### Common Issues

1. **Bytez API Key Issues**
   - Ensure all 4 API keys are configured
   - Check key rotation is working properly
   - Verify models are accessible

2. **HuggingFace Inference Client**
   - Install the package if using advanced features
   - Fallback to direct API calls works automatically

3. **Content Moderation False Positives**
   - Review moderation results in Settings tab
   - Use manual override for educational content
   - Check prompt phrasing for clarity

4. **Image Generation Timeouts**
   - Reduce generation steps for faster results
   - Use lower detail levels for quick previews
   - Fallback methods activate automatically

## 🔮 Future Enhancements

### Planned Features

- **Custom Detail Presets**: Save favorite detail/style combinations
- **Batch Image Generation**: Generate multiple variations simultaneously
- **Advanced Moderation Rules**: Custom safety criteria for different course types
- **Real-time Moderation**: Live content checking during typing
- **Moderation Analytics**: Track safety trends and improvements

### Integration Opportunities

- **Video Generation**: Extend to video content moderation
- **Audio Analysis**: Voice content safety checking
- **Multi-language Support**: Moderation in multiple languages
- **Custom Model Training**: Fine-tune for educational content

## 📝 Conclusion

The Qwen models integration provides:

1. **Enhanced Safety**: Comprehensive content moderation ensures educational appropriateness
2. **Superior Image Quality**: Advanced detail control for professional course thumbnails
3. **Seamless Integration**: Works with existing AI infrastructure
4. **User-Friendly Controls**: Intuitive UI for both moderation and image generation
5. **Robust Fallbacks**: Graceful degradation ensures system reliability

This integration significantly enhances the AI course creation capabilities while maintaining the highest standards for content safety and quality.
