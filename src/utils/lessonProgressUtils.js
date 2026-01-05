import {
  getLessonProgress,
  updateLessonProgress,
} from '@/services/progressService';

/**
 * Save lesson progress to backend
 * @param {string} lessonId - The lesson ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {boolean} completed - Whether the lesson is completed
 */
export const saveLessonProgress = async (
  lessonId,
  progress,
  completed = false
) => {
  try {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    await updateLessonProgress(lessonId, clampedProgress, completed);

    // Store in localStorage as backup
    localStorage.setItem(
      `lesson_progress_${lessonId}`,
      JSON.stringify({
        progress: clampedProgress,
        completed,
        lastUpdated: new Date().toISOString(),
      })
    );

    return { success: true, progress: clampedProgress, completed };
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    throw error;
  }
};

/**
 * Get lesson progress from backend or localStorage
 * @param {string} lessonId - The lesson ID
 */
export const getSavedLessonProgress = async lessonId => {
  try {
    // Try to get from backend first
    const backendProgress = await getLessonProgress(lessonId);
    return backendProgress;
  } catch (error) {
    console.warn(
      'Failed to get progress from backend, using localStorage:',
      error
    );

    // Fallback to localStorage
    const savedProgress = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      return parsed;
    }

    // Return default progress
    return {
      progress: 0,
      completed: false,
      lastUpdated: null,
    };
  }
};

/**
 * Calculate lesson completion percentage based on completed items
 * @param {Array} items - Array of lesson items (videos, quizzes, etc.)
 * @param {Array} completedItems - Array of completed item IDs
 */
export const calculateLessonProgress = (items, completedItems) => {
  if (!items || items.length === 0) return 0;

  const completedCount = completedItems ? completedItems.length : 0;
  return Math.round((completedCount / items.length) * 100);
};

/**
 * Check if lesson is completed
 * @param {number} progress - Progress percentage
 * @returns {boolean}
 */
export const isLessonCompleted = progress => {
  return progress >= 100;
};

/**
 * Format progress for display
 * @param {number} progress - Progress percentage
 * @returns {string} Formatted progress string
 */
export const formatProgress = progress => {
  return `${Math.round(progress)}%`;
};

/**
 * Get progress color based on percentage
 * @param {number} progress - Progress percentage
 * @returns {string} CSS color class
 */
export const getProgressColor = progress => {
  if (progress >= 100) return 'text-green-600';
  if (progress >= 50) return 'text-blue-600';
  if (progress >= 25) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get progress bar color based on percentage
 * @param {number} progress - Progress percentage
 * @returns {string} CSS background class
 */
export const getProgressBarColor = progress => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
};
