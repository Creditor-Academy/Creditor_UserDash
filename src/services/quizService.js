// Quiz Service for handling quiz-related API calls
import { getAuthHeader } from './authHeader';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Backend handles authentication via cookies
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
};

// Get current user ID from localStorage or context
const getCurrentUserId = () => {
  // You can replace this with your actual user context
  return localStorage.getItem('userId') || 'userId-1';
};

/**
 * Start a quiz for a user
 * @param {string} quizId - The ID of the quiz to start
 * @returns {Promise<Object>} Quiz session data
 */
export async function startQuiz(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to start quiz: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error starting quiz:', error);
    throw error;
  }
}

/**
 * Submit a completed quiz
 * @param {string} quizId - The ID of the quiz to submit
 * @param {Object} answers - Object containing question IDs and user answers
 * @returns {Promise<Object>} Quiz results and score
 */
export async function submitQuiz(quizId, answers = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(answers)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to submit quiz: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
}

/**
 * Get all quizzes for a specific module
 * @param {string} moduleId - The ID of the module
 * @returns {Promise<Array>} Array of quiz objects
 */
export async function getModuleQuizzes(moduleId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/modules/${moduleId}/quizzes`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch module quizzes: ${response.status}`);
    }

    const data = await response.json();
    // Support both { data: [...] } and direct array
    if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching module quizzes:', error);
    throw error;
  }
}

/**
 * Get quiz details by ID
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz details
 */
export async function getQuizById(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
}

/**
 * Get quiz questions for a specific quiz
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getQuizQuestions(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/questions`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz questions: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
}

/**
 * Get quiz results and analytics
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz results and analytics
 */
export async function getQuizResults(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/results`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz results: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
}

/**
 * Get quiz progress and attempt history
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz progress and attempt history
 */
export async function getQuizProgress(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/progress`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz progress: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    throw error;
  }
}

/**
 * Save an individual answer for a question
 * @param {string} quizId - The ID of the quiz
 * @param {string} questionId - The ID of the question
 * @param {any} answer - The user's answer
 * @returns {Promise<Object>} Response indicating success
 */
export async function saveAnswer(quizId, questionId, answer) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/quizzes/${quizId}/answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ questionId, answer })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save answer: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
}

/**
 * Get quiz questions for a specific quiz in a module
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getModuleQuizQuestions(moduleId, quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/modules/${moduleId}/quizzes/${quizId}/questions`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz questions: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching module quiz questions:', error);
    throw error;
  }
}

/**
 * Get quiz details by module and quiz ID
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz details
 */
export async function getModuleQuizById(moduleId, quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/modules/${moduleId}/quizzes/${quizId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quiz: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching module quiz:', error);
    throw error;
  }
}

// Check remaining attempts for a specific quiz
export const getQuizRemainingAttempts = async (quizId) => {
  try {
    // The API expects the quiz ID in the format "quiz-{id}" or just the ID
    const url = `${API_BASE}/api/quiz/user/quizzes/${quizId}/remaining-attempts`;
    console.log('Calling remaining attempts API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Remaining attempts API response:', data);
    
    // Extract the data from the response structure
    if (data.success && data.data) {
      const result = {
        quizId: data.data.quizId,
        maxAttempts: data.data.maxAttempts,
        attempted: Number(data.data.attempted) > 0, // Keep boolean flag for convenience
        attemptedCount: Number(data.data.attempted ?? 0), // New: exact attempts used
        remainingAttempts: data.data.remainingAttempts
      };
      console.log('Processed result:', result);
      return result;
    }
    
    console.log('Returning raw data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching quiz remaining attempts:', error);
    throw error;
  }
};

/**
 * Get the user's latest attempt for a quiz (including score)
 * @param {string} quizId - The quiz ID (e.g., "quiz-2" or raw ID)
 * @returns {Promise<Object>} Latest attempt details
 */
export async function getUserLatestQuizAttempt(quizId) {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/user/quiz/${quizId}/latest-attempt`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch latest attempt: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching user latest quiz attempt:', error);
    throw error;
  }
}