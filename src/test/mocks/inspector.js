// Mock implementation for Node.js inspector module
// This prevents bundling errors in the test environment

export default {};

// Export common inspector functions as no-ops
export const open = () => {};
export const close = () => {};
export const url = () => undefined;
export const waitForDebugger = () => {};

// Session mock
export class Session {
  constructor() {}
  connect() {}
  disconnect() {}
  post() {}
  on() {}
  off() {}
}

// Console mock
export const console = {
  enable: () => {},
  disable: () => {},
};
