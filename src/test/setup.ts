import { vi } from 'vitest';

// Mock Node.js inspector modules before any other imports
vi.mock('node:inspector/promises', () => ({
  default: {},
  open: vi.fn(),
  close: vi.fn(),
  url: vi.fn(() => undefined),
  waitForDebugger: vi.fn(),
  Session: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    post: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

vi.mock('inspector', () => ({
  default: {},
  open: vi.fn(),
  close: vi.fn(),
  url: vi.fn(() => undefined),
  waitForDebugger: vi.fn(),
  Session: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    post: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
  console: {
    enable: vi.fn(),
    disable: vi.fn(),
  },
}));

// Import jest-dom after mocking Node.js modules
import '@testing-library/jest-dom';

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
