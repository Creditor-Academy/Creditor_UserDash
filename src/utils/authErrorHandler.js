/**
 * Authentication Error Handler Utility
 * Provides centralized logic for detecting and handling authentication errors
 */

import Cookies from 'js-cookie';

/**
 * Check if an error is authentication-related
 * @param {Object} error - Axios error object
 * @returns {Object} - { isAuthError: boolean, reason: string }
 */
export const isAuthenticationError = error => {
  const status = error.response?.status;
  const errorData = error.response?.data;
  const errorMessage =
    errorData?.message || errorData?.error || error.message || '';

  // Direct authentication errors (401, 403)
  if (status === 401 || status === 403) {
    return {
      isAuthError: true,
      reason: `HTTP ${status} - ${errorMessage}`,
      shouldRedirect: true,
    };
  }

  // 500 errors that might be authentication-related
  if (status === 500) {
    const lowerMessage = errorMessage.toLowerCase();
    const authKeywords = [
      'token',
      'auth',
      'unauthorized',
      'jwt',
      'expired',
      'invalid token',
      'no token',
    ];
    const isAuthRelated = authKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    );

    if (isAuthRelated) {
      return {
        isAuthError: true,
        reason: `HTTP 500 with auth-related message: ${errorMessage}`,
        shouldRedirect: true,
      };
    }
  }

  // Network errors with no response (might be CORS/auth issues)
  if (!error.response && error.request) {
    return {
      isAuthError: false,
      reason: 'Network error - no response from server',
      shouldRedirect: false,
    };
  }

  return {
    isAuthError: false,
    reason: `HTTP ${status || 'unknown'} - ${errorMessage}`,
    shouldRedirect: false,
  };
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = () => {
  console.log('[AuthErrorHandler] Clearing all authentication data');

  // Clear localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoles');

  // Clear cookies
  Cookies.remove('accesstoken');
  Cookies.remove('Access-Token');
  Cookies.remove('userId');

  // Clear sessionStorage
  sessionStorage.clear();
};

/**
 * Handle authentication error and redirect to login
 * @param {Object} error - Axios error object
 * @param {string} context - Context where error occurred (for logging)
 */
export const handleAuthError = (error, context = 'Unknown') => {
  const { isAuthError, reason, shouldRedirect } = isAuthenticationError(error);

  if (!isAuthError) {
    console.warn(`[AuthErrorHandler] Non-auth error in ${context}:`, reason);
    return false;
  }

  console.error(
    `[AuthErrorHandler] Authentication error detected in ${context}:`,
    reason
  );
  console.error('[AuthErrorHandler] Full error:', {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
  });

  if (shouldRedirect) {
    clearAuthData();

    // Dispatch logout event
    window.dispatchEvent(
      new CustomEvent('userLoggedOut', {
        detail: { reason, context },
      })
    );

    // Redirect to login
    console.log('[AuthErrorHandler] Redirecting to login page...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);

    return true;
  }

  return false;
};

/**
 * Log detailed error information for debugging
 * @param {Object} error - Axios error object
 * @param {string} endpoint - API endpoint that failed
 */
export const logDetailedError = (error, endpoint) => {
  console.group(`🔴 API Error: ${endpoint}`);
  console.log('Status:', error.response?.status);
  console.log('Status Text:', error.response?.statusText);
  console.log('Response Data:', error.response?.data);
  console.log('Request Headers:', error.config?.headers);
  console.log('Error Message:', error.message);

  // Check for authentication tokens
  const authToken =
    localStorage.getItem('authToken') || localStorage.getItem('token');
  const cookieToken = Cookies.get('accesstoken');
  console.log('Auth Token Present:', !!authToken);
  console.log('Cookie Token Present:', !!cookieToken);

  if (authToken) {
    try {
      // Try to decode JWT to check expiration
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationDate = new Date(payload.exp * 1000);
        const isExpired = expirationDate < new Date();
        console.log('Token Expiration:', expirationDate.toLocaleString());
        console.log('Token Expired:', isExpired);
      }
    } catch (e) {
      console.log('Could not decode token:', e.message);
    }
  }

  console.groupEnd();
};

export default {
  isAuthenticationError,
  clearAuthData,
  handleAuthError,
  logDetailedError,
};
