import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as tokenService from '../tokenService';
import Cookies from 'js-cookie';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Token Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return empty string when no token is stored', () => {
      Cookies.get.mockReturnValue(undefined);
      localStorageMock.getItem.mockReturnValue(null);
      const token = tokenService.getAccessToken();
      expect(token).toBe('');
    });

    it('should return token from cookies when available', () => {
      const testToken = 'test-access-token';
      Cookies.get.mockImplementation(key => {
        if (key === 'accessToken' || key === 'token') return testToken;
        return undefined;
      });
      const token = tokenService.getAccessToken();
      expect(token).toBe(testToken);
    });

    it('should fallback to localStorage when cookies are empty', () => {
      Cookies.get.mockReturnValue(undefined);
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'authToken' || key === 'token') return 'local-token';
        return null;
      });
      const token = tokenService.getAccessToken();
      expect(token).toBe('local-token');
    });
  });

  describe('setAccessToken', () => {
    it('should store access token in cookies and localStorage', () => {
      const testToken = 'new-access-token';
      tokenService.setAccessToken(testToken);

      expect(Cookies.set).toHaveBeenCalledWith(
        'accessToken',
        testToken,
        expect.any(Object)
      );
      expect(Cookies.set).toHaveBeenCalledWith(
        'token',
        testToken,
        expect.any(Object)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'authToken',
        testToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', testToken);
    });

    it('should clear token when empty token is provided', () => {
      tokenService.setAccessToken('');
      expect(Cookies.remove).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('storeAccessToken', () => {
    it('should store access token', () => {
      const testToken = 'stored-access-token';
      tokenService.storeAccessToken(testToken);
      expect(Cookies.set).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('clearAccessToken', () => {
    it('should remove access token from cookies and localStorage', () => {
      tokenService.clearAccessToken();
      expect(Cookies.remove).toHaveBeenCalledWith('accessToken');
      expect(Cookies.remove).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      Cookies.get.mockReturnValue(undefined);
      localStorageMock.getItem.mockReturnValue(null);
      const isAuth = tokenService.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should return true when token and loginTime exist', () => {
      Cookies.get.mockReturnValue('test-token');
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'loginTime') return new Date().toISOString();
        return 'test-token';
      });
      const isAuth = tokenService.isAuthenticated();
      expect(isAuth).toBe(true);
    });
  });

  describe('hasTokenInCookies', () => {
    it('should return false when no cookie token exists', () => {
      Cookies.get.mockReturnValue(undefined);
      const hasToken = tokenService.hasTokenInCookies();
      expect(hasToken).toBe(false);
    });

    it('should return true when cookie token exists', () => {
      Cookies.get.mockReturnValue('test-token');
      const hasToken = tokenService.hasTokenInCookies();
      expect(hasToken).toBe(true);
    });
  });
});
