# Unified AI Block Editor Documentation

## Overview

The Unified AI Block Editor is a revolutionary content creation system that seamlessly merges AI-powered lesson generation with intuitive block-based editing. It provides educators with intelligent assistance while maintaining full control over their content.

## Architecture

### Core Components

1. **UnifiedAIBlockEditor.jsx** - Main editor component with AI integration
2. **AIWorkflowManager.jsx** - Automated lesson structure generation
3. **unifiedAIContentService.js** - Specialized AI service for content generation
4. **EnhancedAILessonCreator.jsx** - Updated lesson creator with unified editor tab

### Key Features

- **🤖 AI-Powered Content Generation**: Context-aware content creation using multiple AI providers
- **🧩 Block-Based Editing**: Modular content creation with drag-and-drop functionality
- **⚡ Smart Workflow Management**: Automated lesson structure with essential content blocks
- **💡 Real-time Suggestions**: Dynamic recommendations based on existing content
- **🔄 Seamless Integration**: Switch between AI and manual editing effortlessly

## Getting Started

### Installation

The Unified AI Block Editor is already integrated into the existing Creditor Academy LMS. No additional installation required.

### Basic Usage

```jsx
import UnifiedAIBlockEditor from '@/components/courses/UnifiedAIBlockEditor';

function LessonEditor() {
  const [lessons, setLessons] = useState([]);
  const [contentBlocks, setContentBlocks] = useState({});
  const [editingLessonId, setEditingLessonId] = useState(null);

  return (
    <UnifiedAIBlockEditor
      lessons={lessons}
      contentBlocks={contentBlocks}
      setContentBlocks={setContentBlocks}
      editingLessonId={editingLessonId}
      setEditingLessonId={setEditingLessonId}
      courseTitle="Your Course Title"
      onContentSync={handleContentSync}
    />
  );
}
```

## AI Workflow System

### Automated Lesson Generation

The AI Workflow Manager provides a structured approach to lesson creation:

1. **Introduction** - Engaging lesson opener
2. **Learning Objectives** - Clear, measurable goals
3. **Main Content** - Core lesson material
4. **Key Points** - Important takeaways
5. **Key Insight** - Memorable quote or tip
6. **Summary** - Lesson conclusion

### Workflow Features

- **Progressive Generation**: Creates content step-by-step
- **Essential vs Optional**: Prioritizes critical content blocks
- **Context Awareness**: Adapts to lesson topic and existing content
- **Real-time Progress**: Visual feedback on completion status

## Content Block Types

### Supported Block Types

| Type    | Description                      | AI Generation | Manual Editing |
| ------- | -------------------------------- | ------------- | -------------- |
| Text    | Paragraphs and body content      | ✅            | ✅             |
| Heading | Section headers                  | ✅            | ✅             |
| List    | Bullet points and numbered lists | ✅            | ✅             |
| Quote   | Important notes and insights     | ✅            | ✅             |
| Image   | Visual content                   | 🔄            | ✅             |
| Video   | Multimedia content               | 🔄            | ✅             |

### Block Features

- **AI Enhancement**: Improve existing blocks with AI
- **Duplication**: Copy blocks for reuse
- **Reordering**: Drag-and-drop organization
- **Version Tracking**: AI-generated vs manually edited indicators

## AI Services Integration

### Multi-Provider Support

The system uses multiple AI providers for reliability:

1. **OpenAI GPT-3.5** - Primary text generation
2. **HuggingFace Models** - Fallback text generation
3. **Bytez API** - Additional text generation
4. **Deep AI** - Image generation

### Intelligent Failover

- Automatic provider switching on failure
- Multi-key rotation for rate limit management
- Graceful degradation to fallback content
- Comprehensive error handling

## Smart Suggestions System

### Context-Aware Recommendations

The system analyzes lesson content to provide intelligent suggestions:

- **Missing Elements**: Identifies gaps in lesson structure
- **Enhancement Opportunities**: Suggests improvements to existing content
- **Quick Actions**: One-click content generation for common needs

### Suggestion Types

1. **Structural Suggestions**: Missing introduction, objectives, or summary
2. **Content Suggestions**: Additional explanations, examples, or details
3. **Interactive Suggestions**: Quizzes, activities, or engagement elements

## API Reference

### UnifiedAIBlockEditor Props

```typescript
interface UnifiedAIBlockEditorProps {
  lessons: Lesson[]; // Array of lesson objects
  contentBlocks: ContentBlocks; // Object mapping lesson IDs to blocks
  setContentBlocks: Function; // State setter for content blocks
  editingLessonId: string | null; // Currently selected lesson ID
  setEditingLessonId: Function; // State setter for editing lesson
  courseTitle?: string; // Course title for AI context
  onContentSync?: Function; // Callback for content synchronization
}
```

### Content Block Structure

```typescript
interface ContentBlock {
  id: string; // Unique block identifier
  type: string; // Block type (text, heading, list, etc.)
  content: string | object; // Block content (varies by type)
  order: number; // Display order
  settings?: object; // Block-specific settings
  createdAt?: string; // Creation timestamp
  updatedAt?: string; // Last update timestamp
}
```

### Content Sync Events

```typescript
interface ContentSyncEvent {
  type: string; // Event type (block_add, block_update, etc.)
  lessonId: string; // Affected lesson ID
  blockId?: string; // Affected block ID
  blockType?: string; // Block type
  workflowStep?: string; // Workflow step (if applicable)
}
```

## Configuration

### Environment Variables

```bash
# AI Service API Keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_key
VITE_BYTEZ_KEY=your_bytez_key
VITE_DEEPAI_API_KEY=your_deepai_key

# Multi-key support for rate limiting
VITE_BYTEZ_KEY_2=your_second_bytez_key
VITE_BYTEZ_KEY_3=your_third_bytez_key
VITE_BYTEZ_KEY_4=your_fourth_bytez_key
```

### Service Configuration

The AI services are automatically configured through the `apiKeyManager` and `enhancedAIService`. No manual configuration required.

## Best Practices

### Content Creation Workflow

1. **Start with AI Workflow**: Use the automated workflow for initial structure
2. **Review and Refine**: Edit AI-generated content to match your style
3. **Add Personal Touch**: Include examples, anecdotes, and personal insights
4. **Use Smart Suggestions**: Leverage AI recommendations for enhancement
5. **Test and Iterate**: Preview content and make adjustments

### AI Usage Tips

- **Be Specific**: Provide clear, detailed prompts for better AI results
- **Iterate Gradually**: Generate content in small chunks for better control
- **Combine AI and Manual**: Use AI for structure, manual editing for personality
- **Review Everything**: Always review and approve AI-generated content

### Performance Optimization

- **Batch Operations**: Generate multiple blocks together when possible
- **Cache Results**: The system automatically caches AI responses
- **Monitor Usage**: Be mindful of API rate limits and costs
- **Use Fallbacks**: Ensure fallback content is available for offline use

## Troubleshooting

### Common Issues

#### AI Generation Fails

- **Check API Keys**: Ensure all environment variables are set correctly
- **Verify Network**: Check internet connection and API service status
- **Review Prompts**: Ensure prompts are clear and appropriate
- **Use Fallbacks**: System automatically provides fallback content

#### Content Not Saving

- **Check Permissions**: Ensure proper write permissions
- **Verify State**: Check that state management functions are working
- **Review Callbacks**: Ensure `onContentSync` callback is implemented
- **Check Console**: Look for JavaScript errors in browser console

#### Performance Issues

- **Reduce Concurrent Requests**: Limit simultaneous AI generation
- **Optimize Content Size**: Keep content blocks reasonably sized
- **Clear Cache**: Clear browser cache if experiencing issues
- **Check Memory Usage**: Monitor browser memory consumption

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('ai_debug', 'true');
```

This will provide detailed console logs for troubleshooting.

## Integration Examples

### Basic Integration

```jsx
import { useState } from 'react';
import UnifiedAIBlockEditor from '@/components/courses/UnifiedAIBlockEditor';

function CourseCreator() {
  const [lessons, setLessons] = useState([
    {
      id: 'lesson-1',
      title: 'Introduction to React',
      description: 'Learn React fundamentals',
      moduleId: 'module-1',
    },
  ]);

  const [contentBlocks, setContentBlocks] = useState({
    'lesson-1': [],
  });

  const [editingLessonId, setEditingLessonId] = useState('lesson-1');

  const handleContentSync = syncData => {
    console.log('Content updated:', syncData);
    // Handle auto-save, notifications, etc.
  };

  return (
    <div className="h-screen">
      <UnifiedAIBlockEditor
        lessons={lessons}
        contentBlocks={contentBlocks}
        setContentBlocks={setContentBlocks}
        editingLessonId={editingLessonId}
        setEditingLessonId={setEditingLessonId}
        courseTitle="React Development Course"
        onContentSync={handleContentSync}
      />
    </div>
  );
}
```

### Advanced Integration with Auto-Save

```jsx
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import UnifiedAIBlockEditor from '@/components/courses/UnifiedAIBlockEditor';
import { saveLessonContent } from '@/services/courseService';

function AdvancedCourseCreator() {
  const [lessons, setLessons] = useState([]);
  const [contentBlocks, setContentBlocks] = useState({});
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce(async (lessonId, blocks) => {
      setSaveStatus('saving');
      try {
        await saveLessonContent(lessonId, blocks);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    []
  );

  // Auto-save when content changes
  useEffect(() => {
    if (editingLessonId && contentBlocks[editingLessonId]) {
      debouncedSave(editingLessonId, contentBlocks[editingLessonId]);
    }
  }, [contentBlocks, editingLessonId, debouncedSave]);

  const handleContentSync = syncData => {
    setSaveStatus('pending');

    // Handle different sync events
    switch (syncData.type) {
      case 'ai_block_add':
        console.log('AI generated new block:', syncData);
        break;
      case 'workflow_block_add':
        console.log('Workflow generated block:', syncData);
        break;
      case 'block_update':
        console.log('Block updated:', syncData);
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Save Status Indicator */}
      <div className="bg-gray-100 px-4 py-2 text-sm">
        Status:{' '}
        <span
          className={`font-medium ${
            saveStatus === 'saved'
              ? 'text-green-600'
              : saveStatus === 'saving'
                ? 'text-blue-600'
                : saveStatus === 'pending'
                  ? 'text-yellow-600'
                  : 'text-red-600'
          }`}
        >
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'saving' && '⏳ Saving...'}
          {saveStatus === 'pending' && '⏳ Pending...'}
          {saveStatus === 'error' && '❌ Save Error'}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <UnifiedAIBlockEditor
          lessons={lessons}
          contentBlocks={contentBlocks}
          setContentBlocks={setContentBlocks}
          editingLessonId={editingLessonId}
          setEditingLessonId={setEditingLessonId}
          courseTitle="Advanced React Course"
          onContentSync={handleContentSync}
        />
      </div>
    </div>
  );
}
```

## Future Enhancements

### Planned Features

- **Advanced Block Types**: Interactive quizzes, code editors, simulations
- **Collaborative Editing**: Real-time multi-user editing capabilities
- **Version History**: Complete version control with branching and merging
- **Template Library**: Pre-built lesson templates for different subjects
- **Analytics Integration**: Content performance tracking and optimization
- **Mobile Optimization**: Enhanced mobile editing experience

### Extensibility

The system is designed for extensibility:

- **Custom Block Types**: Add new block types with custom renderers
- **AI Provider Integration**: Add new AI services and models
- **Workflow Customization**: Create custom workflow templates
- **Plugin System**: Extend functionality with plugins

## Support

### Documentation

- **API Reference**: Complete API documentation
- **Component Library**: Storybook documentation
- **Video Tutorials**: Step-by-step video guides

### Community

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Get help from other developers
- **Office Hours**: Weekly developer Q&A sessions

### Professional Support

- **Priority Support**: Dedicated support for enterprise users
- **Custom Development**: Tailored solutions for specific needs
- **Training Programs**: Comprehensive training for teams

---

_The Unified AI Block Editor represents the future of educational content creation, combining the power of artificial intelligence with human creativity and expertise._
