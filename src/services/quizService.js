// Quiz Service - Placeholder functions (API calls removed)
// All functions now return mock data instead of making API calls

// Helper function to generate mock response
const createMockResponse = data => {
  return Promise.resolve({
    success: true,
    data: data,
    message: 'Mock response - API calls have been removed',
  });
};

// Get current user ID from localStorage or context
const getCurrentUserId = () => {
  return localStorage.getItem('userId') || 'userId-1';
};

/**
 * Start a quiz for a user
 * @param {string} quizId - The ID of the quiz to start
 * @returns {Promise<Object>} Quiz session data
 */
export async function startQuiz(quizId) {
  console.log('Mock: Starting quiz', quizId);
  return createMockResponse({
    quizId: quizId,
    sessionId: 'mock-session-' + Date.now(),
    startedAt: new Date().toISOString(),
    status: 'started',
  });
}

/**
 * Submit a completed quiz
 * @param {string} quizId - The ID of the quiz to submit
 * @param {Object} answers - Object containing question IDs and user answers
 * @returns {Promise<Object>} Quiz results and score
 */
export async function submitQuiz(quizId, answers = {}) {
  console.log('Mock: Submitting quiz', quizId, answers);
  return createMockResponse({
    quizId: quizId,
    score: Math.floor(Math.random() * 100),
    totalQuestions: Object.keys(answers).length,
    correctAnswers: Math.floor(Object.keys(answers).length * 0.7),
    submittedAt: new Date().toISOString(),
  });
}

/**
 * Get all quizzes for a specific module
 * @param {string} moduleId - The ID of the module
 * @returns {Promise<Array>} Array of quiz objects
 */
export async function getModuleQuizzes(moduleId) {
  console.log('Mock: Getting module quizzes for', moduleId);
  return createMockResponse([
    {
      id: 'quiz-1',
      title: 'Sample Quiz 1',
      description: 'Mock quiz data',
      moduleId: moduleId,
      questionCount: 5,
    },
  ]);
}

/**
 * Get quiz details by ID
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz details
 */
export async function getQuizById(quizId) {
  console.log('Mock: Getting quiz by ID', quizId);
  return createMockResponse({
    id: quizId,
    title: 'Sample Quiz',
    description: 'Mock quiz data',
    questionCount: 5,
    maxAttempts: 3,
  });
}

/**
 * Get quiz meta/overview by quizId
 * @param {string} quizId - The quiz ID
 * @returns {Promise<Object>} Quiz overview data
 */
export async function getQuizMetaById(quizId) {
  console.log('Mock: Getting quiz meta by ID', quizId);
  return createMockResponse({
    quizId: quizId,
    maxAttempts: 3,
    questionCount: 5,
    totalScore: 100,
    minScore: 60,
  });
}

/**
 * Get quiz questions for a specific quiz
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getQuizQuestions(quizId) {
  console.log('Mock: Getting quiz questions for', quizId);
  return createMockResponse([
    {
      id: 'q1',
      question: 'Sample question?',
      options: ['A', 'B', 'C', 'D'],
      type: 'multiple-choice',
    },
  ]);
}

/**
 * Get quiz results and analytics
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz results and analytics
 */
export async function getQuizResults(quizId) {
  console.log('Mock: Getting quiz results for', quizId);
  return createMockResponse({
    quizId: quizId,
    averageScore: 75,
    totalAttempts: 10,
    passRate: 80,
  });
}

/**
 * Get quiz progress and attempt history
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz progress and attempt history
 */
export async function getQuizProgress(quizId) {
  console.log('Mock: Getting quiz progress for', quizId);
  return createMockResponse({
    quizId: quizId,
    attempts: 1,
    maxAttempts: 3,
    lastScore: 85,
    status: 'completed',
  });
}

/**
 * Save an individual answer for a question
 * @param {string} quizId - The ID of the quiz
 * @param {string} questionId - The ID of the question
 * @param {any} answer - The user's answer
 * @returns {Promise<Object>} Response indicating success
 */
export async function saveAnswer(quizId, questionId, answer) {
  console.log('Mock: Saving answer for', quizId, questionId, answer);
  return createMockResponse({
    saved: true,
    quizId: quizId,
    questionId: questionId,
    answer: answer,
  });
}

/**
 * Get quiz questions for a specific quiz in a module
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getModuleQuizQuestions(moduleId, quizId) {
  console.log('Mock: Getting module quiz questions for', moduleId, quizId);
  return createMockResponse([
    {
      id: 'q1',
      question: 'Sample module question?',
      options: ['A', 'B', 'C', 'D'],
      type: 'multiple-choice',
    },
  ]);
}

/**
 * Get quiz details by module and quiz ID
 * @param {string} moduleId - The ID of the module
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Quiz details
 */
export async function getModuleQuizById(moduleId, quizId) {
  console.log('Mock: Getting module quiz by ID', moduleId, quizId);
  return createMockResponse({
    id: quizId,
    moduleId: moduleId,
    title: 'Sample Module Quiz',
    description: 'Mock module quiz data',
  });
}

/**
 * Check remaining attempts for a specific quiz
 * @param {string} quizId - The quiz ID
 * @returns {Promise<Object>} Remaining attempts data
 */
export const getQuizRemainingAttempts = async quizId => {
  console.log('Mock: Getting remaining attempts for', quizId);
  return createMockResponse({
    quizId: quizId,
    maxAttempts: 3,
    attempted: false,
    attemptedCount: 0,
    remainingAttempts: 3,
  });
};

/**
 * Get the user's latest attempt for a quiz
 * @param {string} quizId - The quiz ID
 * @returns {Promise<Object>} Latest attempt details
 */
export async function getUserLatestQuizAttempt(quizId) {
  console.log('Mock: Getting latest quiz attempt for', quizId);
  return createMockResponse({
    quizId: quizId,
    score: 85,
    completedAt: new Date().toISOString(),
    attempt: 1,
  });
}
