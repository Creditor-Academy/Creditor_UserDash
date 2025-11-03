import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import AIEnhancementPanel from './AIEnhancementPanel';

// Mock removed - Bytez SDK dependency removed
// jest.mock('bytez.js', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       model: jest.fn().mockReturnValue({
//         create: jest.fn().mockResolvedValue(),
//         run: jest.fn().mockResolvedValue({ output: 'Generated content' })
//       })
//     };
//   });
// });

describe('AIEnhancementPanel', () => {
  const mockOnContentGenerated = vi.fn();
  const mockOnClose = vi.fn();
  const mockLessonData = { title: 'Test Lesson' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly when open', () => {
    render(
      <AIEnhancementPanel
        lessonData={mockLessonData}
        onContentGenerated={mockOnContentGenerated}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('AI Lesson Enhancement')).toBeInTheDocument();
    expect(screen.getByText('Lesson Outline')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Custom Prompt')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <AIEnhancementPanel
        lessonData={mockLessonData}
        onContentGenerated={mockOnContentGenerated}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('AI Lesson Enhancement')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <AIEnhancementPanel
        lessonData={mockLessonData}
        onContentGenerated={mockOnContentGenerated}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
