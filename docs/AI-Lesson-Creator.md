# AI Lesson Creator

The AI Lesson Creator is a React component that allows users to generate, edit, and save comprehensive course lessons using AI-powered content generation.

## Features

- AI-powered lesson generation based on course title
- Manual editing capabilities for generated content
- Tabbed interface for organized workflow
- Preview functionality for course structure
- Backend integration for saving lessons

## Component Usage

### Basic Usage

```jsx
import AILessonCreator from '../components/courses/AILessonCreator';

function MyComponent() {
  const [showLessonCreator, setShowLessonCreator] = useState(false);

  const handleLessonsCreated = (lessonData) => {
    console.log('Lessons created:', lessonData);
    // Handle the created lessons (save to database, etc.)
  };

  return (
    <div>
      <button onClick={() => setShowLessonCreator(true)}>
        Create AI Lessons
      </button>
      
      <AILessonCreator
        isOpen={showLessonCreator}
        onClose={() => setShowLessonCreator(false)}
        courseTitle="Introduction to React"
        onLessonsCreated={handleLessonsCreated}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls the visibility of the lesson creator panel |
| `onClose` | function | Yes | Callback function when the panel is closed |
| `courseTitle` | string | Yes | The title of the course for which to generate lessons |
| `onLessonsCreated` | function | Yes | Callback function when lessons are created and saved |

## Workflow

1. **AI Generation**: When the component opens with a course title, it automatically generates 6 comprehensive lessons
2. **Review**: Users can review the AI-generated lessons in the "AI Lessons" tab
3. **Edit**: Users can manually edit lesson content in the "Edit Lessons" tab
4. **Preview**: Users can preview the complete course structure in the "Preview" tab
5. **Save**: Users can save all lessons to the backend database

## API Integration

The component integrates with the following backend endpoint:

- `POST /api/ai/lessons` - Save AI-generated lessons

## Styling

The component uses Tailwind CSS classes for styling and Framer Motion for animations. It follows the existing design system of the application.

## Dependencies

- React
- Framer Motion
- Lucide React icons
- Custom AI service integration

## Error Handling

The component includes comprehensive error handling for:
- Network failures
- Backend API errors
- User input validation

## Customization

You can customize the component by modifying:
- The AI prompts for lesson generation
- The number and structure of generated lessons
- The UI layout and styling
- The saving mechanism

## Testing

Unit tests are included in `AILessonCreator.test.jsx` using React Testing Library.

## Integration with AICourseCreationPanel

The AILessonCreator component is integrated with the existing AICourseCreationPanel:

1. After generating an AI course outline, a "Create AI Lessons" button appears
2. Clicking this button opens the AILessonCreator panel
3. Users can generate, edit, and save lessons for the course
4. Lessons are saved to the backend when the user clicks "Save All Lessons"

## Future Improvements

- Add support for different AI models
- Implement streaming for real-time content generation
- Add more media types (images, videos, audio)
- Include collaborative editing features
- Add versioning for generated content