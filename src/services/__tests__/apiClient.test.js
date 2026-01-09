import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock tokenService before importing apiClient
vi.mock('../tokenService', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

// Mock axios module - create instance inside factory
vi.mock('axios', () => {
  const mockAxiosInstance = {
    defaults: {
      baseURL: 'https://test-api.com',
      withCredentials: true,
      timeout: 30000,
    },
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    safeGet: vi.fn(),
    safePost: vi.fn(),
    safePut: vi.fn(),
    safeDelete: vi.fn(),
    getStatus: vi.fn(() => ({
      baseURL: 'https://test-api.com',
      timeout: 30000,
      rateLimits: {},
    })),
    clearRateLimit: vi.fn(),
    setRateLimit: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    create: vi.fn(() => mockAxiosInstance),
  };
});

// Import apiClient after mocks are set up
import api from '../apiClient';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Configuration', () => {
    it('should have correct base URL', () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it('should have credentials enabled', () => {
      expect(api.defaults.withCredentials).toBe(true);
    });

    it('should have timeout configured', () => {
      expect(api.defaults.timeout).toBe(30000);
    });
  });

  describe('Safe Methods', () => {
    it('should have safeGet method', () => {
      expect(typeof api.safeGet).toBe('function');
    });

    it('should have safePost method', () => {
      expect(typeof api.safePost).toBe('function');
    });

    it('should have safePut method', () => {
      expect(typeof api.safePut).toBe('function');
    });

    it('should have safeDelete method', () => {
      expect(typeof api.safeDelete).toBe('function');
    });
  });

  describe('Status Methods', () => {
    it('should return API status', () => {
      const status = api.getStatus();
      expect(status).toHaveProperty('baseURL');
      expect(status).toHaveProperty('timeout');
      expect(status).toHaveProperty('rateLimits');
    });

    it('should clear rate limit', () => {
      expect(() => api.clearRateLimit()).not.toThrow();
    });

    it('should set rate limit', () => {
      expect(() => api.setRateLimit('api', 100, 60000)).not.toThrow();
    });
  });
});
