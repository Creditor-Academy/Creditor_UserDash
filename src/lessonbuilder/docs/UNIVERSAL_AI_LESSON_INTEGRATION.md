# Universal AI Lesson Content Generation Integration

## Overview

The Universal AI Lesson Content Generation system provides AI-powered lesson content creation that works across all parts of your LMS platform. It can generate comprehensive lesson content for any lesson, regardless of how it was created.

## Key Features

- **Universal Compatibility**: Works with any lesson (AI-generated, manual, or imported)
- **Comprehensive Content**: Generates introduction, objectives, concepts, examples, assessments, and summaries
- **Flexible Options**: Choose between comprehensive lessons or structured outlines
- **Smart Context**: Uses lesson, module, and course context for relevant content
- **Auto-Save**: Automatically saves generated content to lessons
- **Fallback System**: Always provides content even if AI APIs fail

## Components Created

### 1. Core Service

- **`universalAILessonService.js`**: Main service handling AI content generation
- **`UniversalAIContentButton.jsx`**: Reusable button component with modal
- **`LessonBuilderAIIntegration.jsx`**: Integration helper for lesson builders

### 2. Integration Points

- **ModuleLessonsView**: AI button on each lesson card
- **CreateLessonDialog**: "Create + Generate AI Content" option
- **LessonBuilder**: Can be integrated with header toolbar

## Usage Examples

### Basic Button Usage

```jsx
import UniversalAIContentButton from '@lessonbuilder/components/ai/UniversalAIContentButton';

<UniversalAIContentButton
  lessonData={lesson}
  moduleData={module}
  courseData={course}
  onContentGenerated={blocks => {
    console.log('Generated blocks:', blocks);
    // Handle generated content
  }}
/>;
```

### LessonBuilder Integration

```jsx
import LessonBuilderAIIntegration from '@lessonbuilder/components/ai/LessonBuilderAIIntegration';

<LessonBuilderAIIntegration
  lessonData={lessonData}
  moduleData={moduleData}
  courseData={courseData}
  contentBlocks={contentBlocks}
  setContentBlocks={setContentBlocks}
  handleUpdate={handleUpdate}
  toast={toast}
/>;
```

### Service Direct Usage

```jsx
import universalAILessonService from '@/services/universalAILessonService';

const blocks = await universalAILessonService.generateLessonContent(
  lessonData,
  moduleData,
  courseData,
  {
    contentType: 'comprehensive',
    includeAssessments: true,
    includeExamples: true,
  }
);
```

## Content Generation Options

### Content Types

- **Comprehensive**: Full lesson with all sections
- **Outline**: Structured outline with main topics

### Components (can be toggled)

- **Introduction**: Engaging lesson introduction
- **Learning Objectives**: Clear, measurable objectives
- **Examples**: Practical applications and examples
- **Assessments**: Reflection questions and evaluations
- **Summary**: Key takeaways and conclusions
- **Interactive**: Quotes and interactive elements

## Generated Content Structure

Each generated block includes:

```javascript
{
  id: 'unique-id',
  type: 'text|heading|list|quote',
  content: 'actual content',
  order: 0,
  isAIGenerated: true,
  metadata: {
    blockType: 'introduction|objectives|concepts|etc',
    generatedAt: '2024-01-01T00:00:00.000Z'
  }
}
```

## Integration Status

### ✅ Completed Integrations

- **ModuleLessonsView**: Purple Sparkles button on lesson cards
- **CreateLessonDialog**: "Create + Generate AI Content" button
- **Universal Service**: Complete AI generation service
- **Auto-Save**: Direct lesson content saving

### 🔄 Pending Integrations

- **LessonBuilder Header**: Add to toolbar (manual integration required)
- **Course Overview**: Bulk lesson content generation
- **Lesson Import**: AI enhancement for imported lessons

## Manual Integration Steps

### For LessonBuilder Header

1. Import the component:

```jsx
import UniversalAIContentButton from '@lessonbuilder/components/ai/UniversalAIContentButton';
```

2. Add to header toolbar:

```jsx
<UniversalAIContentButton
  lessonData={lessonData}
  moduleData={moduleData}
  courseData={courseData}
  onContentGenerated={handleAIContentGenerated}
  variant="outline"
  size="sm"
  className="text-purple-600 border-purple-200 hover:bg-purple-50"
/>
```

3. Add handler function:

```jsx
const handleAIContentGenerated = generatedBlocks => {
  const newBlocks = generatedBlocks.map((block, index) => ({
    ...block,
    order: contentBlocks.length + index,
    id: block.id || `ai-block-${Date.now()}-${index}`,
  }));

  setContentBlocks(prev => [...prev, ...newBlocks]);

  setTimeout(() => {
    handleUpdate();
  }, 500);

  toast.success(`Added ${generatedBlocks.length} AI-generated content blocks!`);
};
```

## AI Models Used

The system uses your existing AI infrastructure:

- **Primary**: Enhanced AI Service (OpenAI, HuggingFace, etc.)
- **Fallback**: Template-based generation
- **Content Moderation**: Qwen3Guard (if available)
- **Multi-API**: Automatic failover between providers

## Error Handling

- **Graceful Degradation**: Always provides content even if AI fails
- **Fallback Content**: Template-based content when APIs are unavailable
- **User Feedback**: Clear error messages and success notifications
- **Retry Logic**: Automatic retries with different AI providers

## Testing

### Test AI Generation

```javascript
// Test the service directly
const testGeneration = async () => {
  try {
    const blocks = await universalAILessonService.generateLessonContent(
      { title: 'Test Lesson' },
      { title: 'Test Module' },
      { title: 'Test Course' },
      { contentType: 'comprehensive' }
    );
    console.log('Generated blocks:', blocks);
  } catch (error) {
    console.error('Generation failed:', error);
  }
};
```

### Test Button Component

1. Navigate to lesson list page
2. Look for purple Sparkles button on lesson cards
3. Click button to open AI generation modal
4. Select options and generate content
5. Verify content appears in lesson

## Troubleshooting

### Common Issues

1. **Button not visible**: Check import and component placement
2. **Generation fails**: Check AI service configuration and API keys
3. **Content not saving**: Verify lesson ID and update permissions
4. **Modal not opening**: Check state management and event handlers

### Debug Logging

The system provides comprehensive console logging:

- `🎯 Universal AI Lesson Content Generation Started`
- `✅ Generated X content blocks`
- `💾 Saving X AI-generated blocks to lesson Y`
- `❌ Universal AI generation failed: [error]`

## Future Enhancements

- **Bulk Generation**: Generate content for multiple lessons
- **Content Templates**: Predefined templates for different subjects
- **Multimedia Integration**: AI-generated images and videos
- **Collaborative Editing**: Multi-user content generation
- **Version Control**: Track and manage content versions
- **Analytics**: Usage statistics and content quality metrics

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Verify AI service configuration and API keys
3. Test with fallback content generation
4. Review integration documentation above
5. Contact development team with specific error details
