/**
 * AI Error Notification Utility
 *
 * Provides user-friendly error messages for AI service errors
 * Integrates with toast notifications and console logging
 */

import { toast } from 'react-hot-toast';

/**
 * Show user-friendly error notification for AI errors
 * @param {Error|string} error - Error object or error message
 * @param {string} operation - Name of the operation that failed
 * @param {Object} options - Additional options
 */
export function showAIError(error, operation = 'AI operation', options = {}) {
  const {
    showToast = true,
    logToConsole = true,
    includeDetails = false,
  } = options;

  const errorMessage =
    error instanceof Error ? error.message : String(error || 'Unknown error');

  // Extract error details
  const errorDetails = {
    operation,
    message: errorMessage,
    originalError: error instanceof Error ? error : null,
    timestamp: new Date().toISOString(),
  };

  // Categorize error and get user-friendly message
  const { userMessage, severity, suggestions } = categorizeAIError(
    errorMessage,
    error
  );

  // Log to console if enabled
  if (logToConsole) {
    console.error(`❌ ${operation} failed:`, {
      ...errorDetails,
      severity,
      suggestions,
      ...(includeDetails && error instanceof Error && { stack: error.stack }),
    });
  }

  // Show toast notification if enabled
  if (showToast) {
    const toastOptions = {
      duration: severity === 'critical' ? 8000 : 5000,
      icon: severity === 'critical' ? '❌' : '⚠️',
    };

    toast.error(userMessage, toastOptions);

    // Show suggestions if available
    if (suggestions && suggestions.length > 0) {
      setTimeout(() => {
        suggestions.slice(0, 2).forEach((suggestion, index) => {
          setTimeout(
            () => {
              toast(suggestion, {
                icon: '💡',
                duration: 6000,
              });
            },
            500 * (index + 1)
          );
        });
      }, 500);
    }
  }

  return {
    userMessage,
    severity,
    suggestions,
    details: errorDetails,
  };
}

/**
 * Categorize AI error and provide user-friendly message and suggestions
 */
function categorizeAIError(errorMessage, error) {
  const message = errorMessage.toLowerCase();
  let userMessage = errorMessage;
  let severity = 'error';
  let suggestions = [];

  // Authentication errors
  if (
    message.includes('401') ||
    message.includes('authentication') ||
    message.includes('login') ||
    message.includes('unauthorized')
  ) {
    userMessage = 'Please login to use AI features';
    severity = 'warning';
    suggestions = [
      'Click the login button to authenticate',
      'Refresh the page and try again',
    ];
  }
  // Authorization errors
  else if (
    message.includes('403') ||
    message.includes('forbidden') ||
    message.includes('permission')
  ) {
    userMessage = 'You do not have permission to use this AI feature';
    severity = 'warning';
    suggestions = [
      'Contact your administrator for access',
      'Check your account plan and permissions',
    ];
  }
  // Rate limit errors
  else if (
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    userMessage = 'Too many requests. Please wait a moment and try again';
    severity = 'warning';
    suggestions = [
      'Wait 1-2 minutes before trying again',
      'Reduce the number of AI requests',
    ];
  }
  // Usage limit errors
  else if (
    message.includes('402') ||
    message.includes('usage limit') ||
    message.includes('upgrade')
  ) {
    userMessage = 'Usage limit reached. Please upgrade your plan';
    severity = 'warning';
    suggestions = [
      'Upgrade to a higher plan for more AI requests',
      'Wait for your usage limit to reset',
    ];
  }
  // Server errors
  else if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('server error') ||
    message.includes('unavailable') ||
    message.includes('temporarily unavailable')
  ) {
    userMessage =
      'AI service is temporarily unavailable. Please try again later';
    severity = 'error';
    suggestions = [
      'Wait a few minutes and try again',
      'Check the AI service status',
      'Contact support if the issue persists',
    ];
  }
  // Network errors
  else if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('failed to fetch') ||
    (error && error.code === 'NETWORK_ERROR')
  ) {
    userMessage = 'Network error. Please check your internet connection';
    severity = 'error';
    suggestions = [
      'Check your internet connection',
      'Try refreshing the page',
      'Check if the backend server is running',
    ];
  }
  // Timeout errors
  else if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('took too long')
  ) {
    userMessage = 'Request timed out. The AI service may be slow right now';
    severity = 'warning';
    suggestions = [
      'Try again in a few moments',
      'Try a simpler prompt',
      'Reduce the complexity of your request',
    ];
  }
  // Invalid input errors
  else if (
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('required') ||
    message.includes('missing')
  ) {
    userMessage = `Invalid input: ${errorMessage}`;
    severity = 'warning';
    suggestions = [
      'Check your input and try again',
      'Make sure all required fields are filled',
    ];
  }
  // Generic errors
  else {
    userMessage = `AI operation failed: ${errorMessage}`;
    severity = 'error';
    suggestions = [
      'Try again in a few moments',
      'Check the console for more details',
      'Contact support if the issue persists',
    ];
  }

  return { userMessage, severity, suggestions };
}

/**
 * Show success notification for AI operations
 */
export function showAISuccess(message, operation = 'AI operation') {
  console.log(`✅ ${operation} succeeded:`, message);
  toast.success(message, {
    duration: 3000,
    icon: '✅',
  });
}

/**
 * Show info notification for AI operations
 */
export function showAIInfo(message, operation = 'AI operation') {
  console.log(`ℹ️ ${operation}:`, message);
  toast(message, {
    duration: 4000,
    icon: 'ℹ️',
  });
}

/**
 * Show loading notification for AI operations
 */
export function showAILoading(
  message = 'Processing AI request...',
  operation = 'AI operation'
) {
  console.log(`⏳ ${operation} started:`, message);
  return toast.loading(message);
}

/**
 * Update loading toast to success
 */
export function updateAIToastSuccess(toastId, message) {
  toast.success(message, {
    id: toastId,
    duration: 3000,
    icon: '✅',
  });
}

/**
 * Update loading toast to error
 */
export function updateAIToastError(toastId, error, operation = 'AI operation') {
  const { userMessage } = showAIError(error, operation, {
    showToast: false,
    logToConsole: true,
  });

  toast.error(userMessage, {
    id: toastId,
    duration: 5000,
    icon: '❌',
  });
}

/**
 * Show diagnostic results to user
 */
export function showDiagnosticResults(results) {
  const { overall, checks, recommendations } = results;

  // Show overall status
  if (overall.score === 100) {
    toast.success(overall.message, {
      duration: 5000,
      icon: '✅',
    });
  } else if (overall.score >= 60) {
    toast(overall.message, {
      duration: 6000,
      icon: '⚠️',
    });
  } else {
    toast.error(overall.message, {
      duration: 8000,
      icon: '❌',
    });
  }

  // Show recommendations
  if (recommendations && recommendations.length > 0) {
    setTimeout(() => {
      recommendations.slice(0, 3).forEach((rec, index) => {
        setTimeout(
          () => {
            toast(`${rec.issue}: ${rec.solution}`, {
              icon: rec.priority === 'high' ? '🔴' : '🟡',
              duration: 7000,
            });
          },
          800 * (index + 1)
        );
      });
    }, 1000);
  }

  // Log full results to console
  console.log('📊 AI Service Diagnostic Results:', results);
}

export default {
  showAIError,
  showAISuccess,
  showAIInfo,
  showAILoading,
  updateAIToastSuccess,
  updateAIToastError,
  showDiagnosticResults,
};
