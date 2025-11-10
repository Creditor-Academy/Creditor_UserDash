import { vi, expect } from 'vitest';

// Mock Node.js inspector modules to prevent compatibility issues
vi.mock('node:inspector/promises', () => ({}));
vi.mock('inspector', () => ({}));

// Mock the problematic Node.js modules to prevent bundling issues
vi.mock('node:inspector', () => ({}));
vi.mock('node:util', () => ({
  inspect: vi.fn(),
  format: vi.fn(),
}));

// Manually add essential DOM matchers to avoid jest-dom import issues
if (typeof expect !== 'undefined' && expect.extend) {
  expect.extend({
    toBeInTheDocument(received) {
      const pass = received && document.body.contains(received);
      return {
        message: () =>
          `expected element ${pass ? 'not ' : ''}to be in the document`,
        pass,
      };
    },
    toHaveTextContent(received, expected) {
      const pass =
        received &&
        received.textContent &&
        received.textContent.includes(expected);
      return {
        message: () =>
          `expected element ${pass ? 'not ' : ''}to have text content "${expected}"`,
        pass,
      };
    },
    toHaveClass(received, expected) {
      const pass =
        received && received.classList && received.classList.contains(expected);
      return {
        message: () =>
          `expected element ${pass ? 'not ' : ''}to have class "${expected}"`,
        pass,
      };
    },
    toBeDisabled(received) {
      const pass =
        received && (received.disabled || received.hasAttribute('disabled'));
      return {
        message: () => `expected element ${pass ? 'not ' : ''}to be disabled`,
        pass,
      };
    },
    toHaveAttribute(received, attribute, value) {
      const hasAttribute = received && received.hasAttribute(attribute);
      const pass =
        value !== undefined
          ? hasAttribute && received.getAttribute(attribute) === value
          : hasAttribute;
      return {
        message: () =>
          `expected element ${pass ? 'not ' : ''}to have attribute "${attribute}"${value ? ` with value "${value}"` : ''}`,
        pass,
      };
    },
    toBeChecked(received) {
      if (!received) {
        return {
          message: () =>
            'expected element to be checked but received null/undefined',
          pass: false,
        };
      }

      // Handle different input types and ARIA states
      const isChecked =
        received.checked === true ||
        received.hasAttribute('checked') ||
        received.getAttribute('aria-checked') === 'true' ||
        received.getAttribute('data-state') === 'checked';

      return {
        message: () =>
          `expected element ${isChecked ? 'not ' : ''}to be checked`,
        pass: isChecked,
      };
    },
  });
}

// Make Jest globals available for compatibility
global.jest = {
  fn: vi.fn,
  mock: vi.mock,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
