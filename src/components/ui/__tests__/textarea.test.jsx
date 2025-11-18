import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  it('should render textarea element', () => {
    render(<Textarea data-testid="test-textarea" />);
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should accept and display value', () => {
    render(
      <Textarea
        value="test value"
        onChange={() => {}}
        data-testid="test-textarea"
      />
    );
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveValue('test value');
  });

  it('should handle onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea onChange={handleChange} data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    await user.type(textarea, 'hello');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="test-textarea" />);
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toBeDisabled();
  });

  it('should accept placeholder text', () => {
    render(
      <Textarea placeholder="Enter text here" data-testid="test-textarea" />
    );
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" data-testid="test-textarea" />);
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} data-testid="test-textarea" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should support rows attribute', () => {
    render(<Textarea rows={5} data-testid="test-textarea" />);
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
