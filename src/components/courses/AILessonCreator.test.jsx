import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AILessonCreator from './AILessonCreator';

// Mock the aiCourseService
jest.mock('../../services/aiCourseService', () => ({
  generateAICourseOutline: jest.fn(),
  saveAILessons: jest.fn()
}));

describe('AILessonCreator', () => {
  const mockOnClose = jest.fn();
  const mockOnLessonsCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <AILessonCreator 
        isOpen={true} 
        onClose={mockOnClose} 
        courseTitle="Test Course" 
        onLessonsCreated={mockOnLessonsCreated} 
      />
    );
    
    expect(screen.getByText('AI Lesson Creator')).toBeInTheDocument();
    expect(screen.getByText('for "Test Course"')).toBeInTheDocument();
  });

  test('shows loading state when generating lessons', async () => {
    render(
      <AILessonCreator 
        isOpen={true} 
        onClose={mockOnClose} 
        courseTitle="Test Course" 
        onLessonsCreated={mockOnLessonsCreated} 
      />
    );
    
    // Wait for the component to initialize and generate lessons
    await waitFor(() => {
      expect(screen.getByText('Generating AI lessons...')).toBeInTheDocument();
    });
  });

  test('generates lessons when course title is provided', async () => {
    render(
      <AILessonCreator 
        isOpen={true} 
        onClose={mockOnClose} 
        courseTitle="Introduction to React" 
        onLessonsCreated={mockOnLessonsCreated} 
      />
    );
    
    // Wait for lessons to be generated
    await waitFor(() => {
      expect(screen.getByText('Introduction to Introduction to React')).toBeInTheDocument();
    });
  });

  test('allows editing of lesson content', async () => {
    render(
      <AILessonCreator 
        isOpen={true} 
        onClose={mockOnClose} 
        courseTitle="Test Course" 
        onLessonsCreated={mockOnLessonsCreated} 
      />
    );
    
    // Wait for lessons to be generated
    await waitFor(() => {
      expect(screen.getByText('Introduction to Test Course')).toBeInTheDocument();
    });
    
    // Switch to edit tab
    const editTab = screen.getByText('Edit Lessons');
    fireEvent.click(editTab);
    
    // Click edit button for first lesson
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Check that textarea is visible
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <AILessonCreator 
        isOpen={true} 
        onClose={mockOnClose} 
        courseTitle="Test Course" 
        onLessonsCreated={mockOnLessonsCreated} 
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});