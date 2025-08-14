// Service to handle quiz-related API calls
import axios from 'axios';

const QUIZ_API_URL = 'http://localhost:9000/api/quiz/Quiz';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Backend handles authentication via cookies
  return {
    'Content-Type': 'application/json',
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/start`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to submit quiz: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/answers`, {
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
 * Get all quizzes for a specific module (alias for fetchQuizzesByModule)
 * @param {string} moduleId - The ID of the module
 * @returns {Promise<Array>} Array of quiz objects
 */
export async function getModuleQuizzes(moduleId) {
  return fetchQuizzesByModule(moduleId);
}

/**
 * Get quiz details by module and quiz ID
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz details
 */
export async function getModuleQuizById(moduleId, quizId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/modules/${moduleId}/quizzes/${quizId}`, {
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

/**
 * Get quiz questions for a specific quiz
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getQuizQuestions(quizId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/questions`, {
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
 * Get quiz questions for a specific quiz in a module
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getModuleQuizQuestions(moduleId, quizId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/modules/${moduleId}/quizzes/${quizId}/questions`, {
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
 * Get quiz results and analytics
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz results and analytics
 */
export async function getQuizResults(quizId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/results`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/quizzes/${quizId}/progress`, {
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

export async function createQuiz(quizData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/Quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quizData),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to create quiz (${response.status})`);
  }
  return await response.json();
}

export async function bulkUploadQuestions(quizId, questionsPayload) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/admin/quizzes/${quizId}/questions/bulk-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionsPayload),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to bulk upload questions (${response.status})`);
  }
  return await response.json();
}

/**
 * Fetches all quizzes for a specific module
 * @param {string} moduleId - The ID of the module to fetch quizzes for
 * @returns {Promise<Array>} Array of quiz objects
 * @throws {Error} If the request fails or returns an error
 */
export async function fetchQuizzesByModule(moduleId) {
  if (!moduleId) {
    throw new Error('Module ID is required to fetch quizzes');
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/quiz/modules/${moduleId}/quizzes`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = responseData.message || `Failed to fetch quizzes for module (${response.status})`;
      console.error('Error fetching quizzes:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      throw new Error(errorMessage);
    }

    // Return the data array directly if it exists, otherwise return an empty array
    return Array.isArray(responseData.data) ? responseData.data : [];
  } catch (error) {
    console.error('Error in fetchQuizzesByModule:', error);
    throw error;
  }
}

export async function fetchAllQuizzes() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/getQuiz`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch all quizzes');
  }
  const data = await response.json();
  return data.data || data;
}

export async function getQuizById(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quizId}/getQuizById`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch quiz by ID');
  }
  const data = await response.json();
  return data.data || data;
}

// New functions for quiz scores and user attempts
export async function fetchQuizScores(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quizId}/scores`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch quiz scores');
  }
  const data = await response.json();
  return data.data || data;
}

export async function fetchUserQuizAttempts(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quizId}/attempts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user quiz attempts');
  }
  const data = await response.json();
  return data.data || data;
}

export async function fetchQuizAnalytics(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quizId}/analytics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch quiz analytics');
  }
  const data = await response.json();
  return data.data || data;
}

export async function fetchQuizAdminAnalytics(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/admin/quizzes/${quizId}/analytics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch quiz admin analytics');
  }
  const data = await response.json();
  return data.data || data;
}

export async function fetchQuizAdminScores(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/admin/quizzes/${quizId}/scores`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch quiz admin scores');
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteQuiz(quizId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/admin/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to delete quiz (${response.status})`);
  }
  return await response.json();
}

export async function updateQuiz(quizId, quizData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quizId}/updateQuizz`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quizData),
    credentials: 'include',
  });
  
  const responseData = await response.json();
  
  // Check if the response indicates success despite HTTP status
  if (responseData.success === true && responseData.code === 200) {
    return responseData;
  }
  
  // If not successful, throw error
  if (!response.ok) {
    const errorData = responseData || { message: 'Unknown error' };
    throw new Error(errorData.message || `Failed to update quiz (${response.status})`);
  }
  
  return responseData;
}

export async function updateQuestion(quizId, questionId, questionData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/admin/quizzes/${quizId}/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to update question (${response.status})`);
  }
  
  return await response.json();
}