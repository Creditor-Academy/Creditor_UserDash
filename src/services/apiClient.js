import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './tokenService';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://creditor.onrender.com';

// Enhanced API client with reliability improvements
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  retry: 3, // Custom retry count
  retryDelay: 1000, // 1 second base delay
});

// Rate limiting configuration
const rateLimiter = {
  requests: new Map(),
  limits: {
    default: { max: 100, window: 60000 }, // 100 requests per minute
    auth: { max: 10, window: 60000 }, // 10 auth requests per minute
    upload: { max: 20, window: 60000 }, // 20 upload requests per minute
  },
  checkLimit(endpoint) {
    const now = Date.now();
    let limitType = 'default';

    // Determine limit type based on endpoint
    if (endpoint.includes('/auth/')) limitType = 'auth';
    else if (
      endpoint.includes('/upload') ||
      endpoint.includes('/image') ||
      endpoint.includes('/video')
    )
      limitType = 'upload';

    const limit = this.limits[limitType];
    const key = `${limitType}_requests`;
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(
      timestamp => now - timestamp < limit.window
    );

    // Check if we're under the limit
    if (validRequests.length >= limit.max) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  },
};

// Enhanced request interceptor with reliability improvements
api.interceptors.request.use(
  async config => {
    try {
      // Rate limiting check
      if (!rateLimiter.checkLimit(config.url || '')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Request validation
      if (!config.url) {
        throw new Error('Request URL is required');
      }

      // Add request ID for tracking
      config.metadata = {
        requestId: generateRequestId(),
        startTime: Date.now(),
        retryCount: config.retryCount || 0,
      };

      // Enhanced headers
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = config.metadata.requestId;
      config.headers['X-Client-Version'] = '1.0.0';

      // Simple token management
      const token = getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.debug('[Auth] Attached access token to request:', {
          url: config?.url,
          requestId: config.metadata.requestId,
        });
      } else {
        console.debug('[Auth] No access token present for request:', {
          url: config?.url,
          requestId: config.metadata.requestId,
        });
      }

      return config;
    } catch (error) {
      console.error('[API] Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  error => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Utility functions
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRetryDelay(retryCount, baseDelay = 1000) {
  // Exponential backoff with jitter
  const delay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, 10000); // Max 10 seconds
}

function shouldRetry(error, retryCount, maxRetries = 3) {
  if (retryCount >= maxRetries) return false;

  const status = error.response?.status;

  // Don't retry client errors (4xx) except for specific cases
  if (status >= 400 && status < 500) {
    // Retry only for rate limiting and temporary auth issues
    return status === 429 || status === 408;
  }

  // Retry server errors (5xx) and network errors
  return status >= 500 || !status;
}

function isNetworkError(error) {
  return (
    !error.response &&
    (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error'))
  );
}

function getErrorMessage(error) {
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet connection.';
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission for this action.';
    case 404:
      return 'Resource not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The server took too long to respond.';
    default:
      return message || 'An unexpected error occurred.';
  }
}

// Enhanced response interceptor with retry logic and better error handling
api.interceptors.response.use(
  response => {
    // Log successful requests for debugging
    const requestId = response.config?.metadata?.requestId;
    const duration = Date.now() - (response.config?.metadata?.startTime || 0);

    console.debug('[API] Request successful:', {
      url: response.config?.url,
      requestId,
      status: response.status,
      duration: `${duration}ms`,
    });

    return response;
  },
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url;
    const requestId = originalRequest?.metadata?.requestId;

    // Ensure metadata exists and get retry count
    originalRequest.metadata = originalRequest.metadata || {};
    const retryCount = originalRequest.metadata.retryCount || 0;

    // Prevent infinite retries by adding a safety check
    if (retryCount >= 5) {
      console.error(`[API] Safety limit reached - stopping retries for:`, url);
      error.userMessage =
        'Request failed after multiple attempts. Please try again later.';
      return Promise.reject(error);
    }

    // Only log on first attempt to reduce console noise
    if (retryCount === 0) {
      console.warn('[API] Request failed:', {
        url,
        requestId,
        status,
        error: error.message,
        backendError:
          error.response?.data?.message || error.response?.data?.error,
        responseData: status >= 500 ? error.response?.data : undefined,
      });
    }

    // Handle network errors
    if (isNetworkError(error)) {
      console.error('[API] Network error detected:', error.message);

      // Retry network errors
      if (shouldRetry(error, retryCount)) {
        const delay = getRetryDelay(retryCount);
        console.log(
          `[API] Retrying network request in ${delay}ms (attempt ${retryCount + 1}/${3})`
        );

        await new Promise(resolve => setTimeout(resolve, delay));

        // Properly increment retry count
        originalRequest.metadata = originalRequest.metadata || {};
        originalRequest.metadata.retryCount = retryCount + 1;
        originalRequest.metadata.startTime = Date.now();

        return api(originalRequest);
      }
    }

    // Handle rate limiting
    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const delay = retryAfter
        ? parseInt(retryAfter) * 1000
        : getRetryDelay(retryCount, 2000);

      if (shouldRetry(error, retryCount)) {
        console.log(
          `[API] Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${3})`
        );

        await new Promise(resolve => setTimeout(resolve, delay));

        // Properly increment retry count
        originalRequest.metadata = originalRequest.metadata || {};
        originalRequest.metadata.retryCount = retryCount + 1;
        originalRequest.metadata.startTime = Date.now();

        return api(originalRequest);
      }
    }

    // Handle server errors with retry
    if (status >= 500 && shouldRetry(error, retryCount)) {
      const delay = getRetryDelay(retryCount);
      console.log(
        `[API] Server error (${status}), retrying in ${delay}ms (attempt ${retryCount + 1}/${3})`
      );

      await new Promise(resolve => setTimeout(resolve, delay));

      // Properly increment retry count
      originalRequest.metadata.retryCount = retryCount + 1;
      originalRequest.metadata.startTime = Date.now();

      return api(originalRequest);
    } else if (status >= 500) {
      console.error(
        `[API] Server error (${status}) - max retries (${3}) exceeded for:`,
        url
      );

      // Check if this is a critical authentication endpoint failing repeatedly
      if (url && url.includes('/user/getUserProfile')) {
        console.error(
          '[Auth] Critical endpoint getUserProfile failed - treating as authentication failure'
        );
        console.error('[Auth] Backend error:', error.response?.data);
        console.error('[Auth] Clearing tokens and redirecting to login...');

        clearAccessToken();

        // Broadcast logout event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userLoggedOut'));
          // Navigate to login page
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
      }
    }

    // Handle authentication errors
    const isAuthError = status === 401 || status === 403;
    if (
      isAuthError &&
      url &&
      (url.includes('/user/getUserProfile') || url.includes('/auth/logout'))
    ) {
      console.warn(
        '[Auth] Received',
        status,
        'for',
        url,
        '- clearing tokens and forcing logout'
      );
      clearAccessToken();

      // Broadcast logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        // Navigate to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 0);
      }
    } else if (isAuthError) {
      console.warn(
        '[Auth] Received',
        status,
        'for',
        url,
        '- not forcing logout, letting component handle error'
      );
    }

    // Enhance error with user-friendly message
    error.userMessage = getErrorMessage(error);

    return Promise.reject(error);
  }
);

// Enhanced API client methods
api.getStatus = () => {
  return {
    baseURL: API_BASE,
    timeout: api.defaults.timeout,
    rateLimits: rateLimiter.limits,
  };
};

api.clearRateLimit = () => {
  rateLimiter.requests.clear();
  console.log('[API] Rate limit counters cleared');
};

api.setRateLimit = (type, max, window) => {
  if (rateLimiter.limits[type]) {
    rateLimiter.limits[type] = { max, window };
    console.log(`[API] Rate limit updated for ${type}:`, { max, window });
  }
};

// Enhanced request methods with better error handling
api.safeGet = async (url, config = {}) => {
  try {
    return await api.get(url, config);
  } catch (error) {
    console.error('[API] GET request failed:', {
      url,
      error: error.userMessage || error.message,
    });
    throw error;
  }
};

api.safePost = async (url, data, config = {}) => {
  try {
    return await api.post(url, data, config);
  } catch (error) {
    console.error('[API] POST request failed:', {
      url,
      error: error.userMessage || error.message,
    });
    throw error;
  }
};

api.safePut = async (url, data, config = {}) => {
  try {
    return await api.put(url, data, config);
  } catch (error) {
    console.error('[API] PUT request failed:', {
      url,
      error: error.userMessage || error.message,
    });
    throw error;
  }
};

api.safeDelete = async (url, config = {}) => {
  try {
    return await api.delete(url, config);
  } catch (error) {
    console.error('[API] DELETE request failed:', {
      url,
      error: error.userMessage || error.message,
    });
    throw error;
  }
};

export default api;
