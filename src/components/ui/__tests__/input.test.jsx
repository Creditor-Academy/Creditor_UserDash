import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('should accept and display value', () => {
    render(
      <Input value="test value" onChange={() => {}} data-testid="test-input" />
    );
    const input = screen.getByTestId('test-input');
    expect(input).toHaveValue('test value');
  });

  it('should handle onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    await user.type(input, 'hello');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
  });

  it('should accept placeholder text', () => {
    render(<Input placeholder="Enter text here" data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Input ref={ref} data-testid="test-input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
