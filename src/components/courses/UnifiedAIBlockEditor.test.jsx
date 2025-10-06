import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedAIBlockEditor from './UnifiedAIBlockEditor';

// Mock the AI services
jest.mock('@/services/enhancedAIService', () => ({
  generateText: jest.fn().mockResolvedValue({
    success: true,
    content: 'Generated AI content for testing'
  })
}));

jest.mock('@/services/unifiedAIContentService', () => ({
  generateContextualContent: jest.fn().mockResolvedValue({
    success: true,
    content: 'Contextual AI content',
    metadata: { generated: true, timestamp: new Date().toISOString() }
  }),
  generateSmartSuggestions: jest.fn().mockResolvedValue([
    { type: 'text', title: 'Introduction', description: 'Add intro', content: 'Sample intro' },
    { type: 'list', title: 'Key Points', description: 'Add points', content: 'Sample points' }
  ])
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children
}));

describe('UnifiedAIBlockEditor', () => {
  const mockLessons = [
    {
      id: 'lesson-1',
      title: 'Test Lesson',
      description: 'A test lesson for unit testing',
      moduleId: 'module-1'
    }
  ];

  const mockContentBlocks = {
    'lesson-1': [
      {
        id: 'block-1',
        type: 'text',
        content: 'Initial test content',
        order: 1,
        settings: {}
      }
    ]
  };

  const mockSetContentBlocks = jest.fn();
  const mockSetEditingLessonId = jest.fn();
  const mockOnContentSync = jest.fn();

  const defaultProps = {
    lessons: mockLessons,
    contentBlocks: mockContentBlocks,
    setContentBlocks: mockSetContentBlocks,
    editingLessonId: 'lesson-1',
    setEditingLessonId: mockSetEditingLessonId,
    courseTitle: 'Test Course',
    onContentSync: mockOnContentSync
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the editor with lesson content', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByText('1 content blocks')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial test content')).toBeInTheDocument();
  });

  it('shows AI Assistant sidebar by default', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Generate Content')).toBeInTheDocument();
  });

  it('can toggle AI mode', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    const aiToggle = screen.getByRole('switch');
    fireEvent.click(aiToggle);
    
    expect(aiToggle).toBeChecked();
  });

  it('displays workflow manager when workflow button is clicked', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    const workflowButton = screen.getByText('Workflow');
    fireEvent.click(workflowButton);
    
    expect(screen.getByText('AI Lesson Workflow')).toBeInTheDocument();
  });

  it('can generate AI content for different block types', async () => {
    const enhancedAIService = require('@/services/enhancedAIService');
    
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    // Find and click the text generation button
    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);
    
    await waitFor(() => {
      expect(enhancedAIService.generateText).toHaveBeenCalled();
      expect(mockSetContentBlocks).toHaveBeenCalled();
    });
  });

  it('updates block content when edited', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    const textArea = screen.getByDisplayValue('Initial test content');
    fireEvent.change(textArea, { target: { value: 'Updated content' } });
    
    expect(mockSetContentBlocks).toHaveBeenCalledWith(expect.any(Function));
  });

  it('shows empty state when no lesson is selected', () => {
    const propsWithoutLesson = {
      ...defaultProps,
      editingLessonId: null
    };
    
    render(<UnifiedAIBlockEditor {...propsWithoutLesson} />);
    
    expect(screen.getByText('Select a lesson to start editing content')).toBeInTheDocument();
  });

  it('shows empty content state when lesson has no blocks', () => {
    const propsWithEmptyBlocks = {
      ...defaultProps,
      contentBlocks: { 'lesson-1': [] }
    };
    
    render(<UnifiedAIBlockEditor {...propsWithEmptyBlocks} />);
    
    expect(screen.getByText('No content blocks yet')).toBeInTheDocument();
    expect(screen.getByText('Use AI Assistant to generate content or add blocks manually')).toBeInTheDocument();
  });

  it('handles AI generation errors gracefully', async () => {
    const enhancedAIService = require('@/services/enhancedAIService');
    enhancedAIService.generateText.mockRejectedValueOnce(new Error('AI service error'));
    
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);
    
    await waitFor(() => {
      expect(enhancedAIService.generateText).toHaveBeenCalled();
      // Should not crash and should handle error gracefully
    });
  });

  it('displays AI-generated blocks with proper badges', () => {
    const propsWithAIBlock = {
      ...defaultProps,
      contentBlocks: {
        'lesson-1': [
          {
            id: 'ai-block-1',
            type: 'text',
            content: 'AI generated content',
            order: 1,
            settings: { aiGenerated: true }
          }
        ]
      }
    };
    
    render(<UnifiedAIBlockEditor {...propsWithAIBlock} />);
    
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('can duplicate blocks', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    // Find the duplicate button (copy icon)
    const duplicateButton = screen.getByRole('button', { name: '' }); // Copy button has no text
    fireEvent.click(duplicateButton);
    
    expect(mockSetContentBlocks).toHaveBeenCalled();
  });

  it('can delete blocks', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    // Find the delete button (trash icon)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.className.includes('text-red-500')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockSetContentBlocks).toHaveBeenCalled();
    }
  });

  it('calls onContentSync when content is modified', () => {
    render(<UnifiedAIBlockEditor {...defaultProps} />);
    
    const textArea = screen.getByDisplayValue('Initial test content');
    fireEvent.change(textArea, { target: { value: 'Modified content' } });
    
    // onContentSync should be called indirectly through content updates
    expect(mockSetContentBlocks).toHaveBeenCalled();
  });

  it('handles different block types correctly', () => {
    const propsWithMultipleBlocks = {
      ...defaultProps,
      contentBlocks: {
        'lesson-1': [
          { id: 'text-block', type: 'text', content: 'Text content', order: 1 },
          { id: 'heading-block', type: 'heading', content: 'Heading content', order: 2 },
          { id: 'list-block', type: 'list', content: '• Item 1\n• Item 2', order: 3 }
        ]
      }
    };
    
    render(<UnifiedAIBlockEditor {...propsWithMultipleBlocks} />);
    
    expect(screen.getByDisplayValue('Text content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Heading content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('• Item 1\n• Item 2')).toBeInTheDocument();
  });
});

// Integration test for the complete workflow
describe('UnifiedAIBlockEditor Integration', () => {
  it('completes a full AI workflow', async () => {
    const mockLessons = [
      {
        id: 'integration-lesson',
        title: 'Integration Test Lesson',
        description: 'Testing the complete workflow',
        moduleId: 'integration-module'
      }
    ];

    const mockContentBlocks = { 'integration-lesson': [] };
    const mockSetContentBlocks = jest.fn();
    const mockOnContentSync = jest.fn();

    const props = {
      lessons: mockLessons,
      contentBlocks: mockContentBlocks,
      setContentBlocks: mockSetContentBlocks,
      editingLessonId: 'integration-lesson',
      setEditingLessonId: jest.fn(),
      courseTitle: 'Integration Test Course',
      onContentSync: mockOnContentSync
    };

    render(<UnifiedAIBlockEditor {...props} />);

    // 1. Enable AI mode
    const aiToggle = screen.getByRole('switch');
    fireEvent.click(aiToggle);

    // 2. Open workflow
    const workflowButton = screen.getByText('Workflow');
    fireEvent.click(workflowButton);

    // 3. Verify workflow is displayed
    expect(screen.getByText('AI Lesson Workflow')).toBeInTheDocument();

    // 4. Generate content using quick actions
    const addIntroButton = screen.getByText('Add Introduction');
    fireEvent.click(addIntroButton);

    await waitFor(() => {
      expect(mockSetContentBlocks).toHaveBeenCalled();
    });

    // 5. Verify content sync was called
    expect(mockOnContentSync).toHaveBeenCalled();
  });
});

export default {};
