import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LessonHeader from './LessonHeader';

describe('LessonHeader', () => {
  const mockProps = {
    lessonTitle: 'Test Lesson',
    lessonData: { title: 'Test Lesson' },
    onBack: jest.fn(),
    onView: jest.fn(),
    onSave: jest.fn(),
    onUpdate: jest.fn(),
    isUploading: false,
    onAIEnhance: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders lesson title correctly', () => {
    render(<LessonHeader {...mockProps} />);
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
  });

  test('renders all buttons', () => {
    render(<LessonHeader {...mockProps} />);
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Save as Draft')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('AI Enhance')).toBeInTheDocument();
  });

  test('calls onAIEnhance when AI Enhance button is clicked', () => {
    render(<LessonHeader {...mockProps} />);
    const aiEnhanceButton = screen.getByText('AI Enhance');
    fireEvent.click(aiEnhanceButton);
    expect(mockProps.onAIEnhance).toHaveBeenCalledTimes(1);
  });

  test('disables Update button when isUploading is true', () => {
    render(<LessonHeader {...mockProps} isUploading={true} />);
    const updateButton = screen.getByText('Updating...');
    expect(updateButton).toBeDisabled();
  });
});