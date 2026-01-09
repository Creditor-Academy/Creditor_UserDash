import { useState, useEffect, useRef } from 'react';
import { updateLessonProgress } from '@/services/progressService';
import { toast } from '@/hooks/use-toast';

/**
 * Event-driven lesson progress tracking hook
 * Progress updates are triggered by master heading index changes, not button clicks
 *
 * @param {string} lessonId - The lesson ID
 * @param {Array} headingSections - Array of master heading sections
 * @param {number} currentHeadingIndex - Current active master heading index
 * @param {boolean} shouldPreventProgressUpdates - Whether to prevent progress updates (e.g., completed lessons)
 * @param {Object} initialBackendProgress - Initial progress from backend { progress: number, completed: boolean }
 * @returns {Object} Progress tracking state and utilities
 */
export const useLessonProgressTracker = (
  lessonId,
  headingSections,
  currentHeadingIndex,
  shouldPreventProgressUpdates = false,
  initialBackendProgress = null
) => {
  // Initialize with backend progress if available
  const initialProgress = initialBackendProgress?.progress || 0;
  const initialCompleted = initialBackendProgress?.completed || false;

  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track last sent progress to prevent duplicate API calls
  const lastSentProgress = useRef(initialProgress);
  const lastSentCompleted = useRef(initialCompleted);

  // Track initial backend progress to prevent overwriting 100% progress
  const backendProgressRef = useRef(initialProgress);
  const backendCompletedRef = useRef(initialCompleted);

  // Update backend progress ref when initial progress changes
  useEffect(() => {
    if (initialBackendProgress) {
      backendProgressRef.current = initialBackendProgress.progress;
      backendCompletedRef.current = initialBackendProgress.completed;
      setProgress(initialBackendProgress.progress);
      setIsCompleted(initialBackendProgress.completed);
      lastSentProgress.current = initialBackendProgress.progress;
      lastSentCompleted.current = initialBackendProgress.completed;
    }
  }, [initialBackendProgress?.progress, initialBackendProgress?.completed]);

  /**
   * Calculate progress based on current heading index
   * @param {number} headingIndex - Current heading index
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = headingIndex => {
    if (!headingSections || headingSections.length === 0) return 0;

    // Progress = ((currentHeadingIndex + 1) / totalHeadings) * 100
    // This represents progress up to and including the current heading
    const progressPercentage =
      ((headingIndex + 1) / headingSections.length) * 100;
    const rounded = Math.min(100, Math.max(0, Math.round(progressPercentage)));

    console.log('Calculating progress:', {
      headingIndex,
      totalHeadings: headingSections.length,
      formula: `((${headingIndex} + 1) / ${headingSections.length}) * 100`,
      calculated: progressPercentage,
      rounded,
    });

    return rounded;
  };

  /**
   * Update progress in backend with duplicate prevention
   * @param {number} newProgress - New progress percentage
   * @param {boolean} completed - Whether lesson is completed
   */
  const updateProgressInBackend = async (newProgress, completed) => {
    // CRITICAL: Never update if backend progress is already 100%
    if (backendProgressRef.current >= 100 || backendCompletedRef.current) {
      console.log('Backend progress is already 100%, preventing update:', {
        backendProgress: backendProgressRef.current,
        backendCompleted: backendCompletedRef.current,
        attemptedProgress: newProgress,
      });
      return;
    }

    // Prevent duplicate API calls
    if (
      lastSentProgress.current === newProgress &&
      lastSentCompleted.current === completed
    ) {
      console.log('Progress unchanged, skipping API call:', {
        newProgress,
        completed,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating lesson progress:', {
        lessonId,
        progress: newProgress,
        completed,
      });

      const result = await updateLessonProgress(
        lessonId,
        newProgress,
        completed
      );

      // Update last sent values
      lastSentProgress.current = newProgress;
      lastSentCompleted.current = completed;

      // Update backend progress ref FIRST
      backendProgressRef.current = newProgress;
      backendCompletedRef.current = completed;

      // Update local state IMMEDIATELY to trigger UI re-render
      setProgress(newProgress);
      setIsCompleted(completed);

      console.log('Lesson progress updated successfully:', {
        result,
        newProgress,
        completed,
        stateUpdated: true,
      });

      // Show completion toast when lesson is completed
      if (completed && !lastSentCompleted.current) {
        toast({
          title: 'Lesson Completed! 🎉',
          description: 'Congratulations! You have completed this lesson.',
        });
      }
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      setError(err.message || 'Failed to update progress');

      // Show error toast
      toast({
        title: 'Progress Update Failed',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle heading index change - this is the main event driver
   */
  useEffect(() => {
    if (!lessonId || !headingSections || headingSections.length === 0) return;

    // If progress updates are prevented (e.g., completed lessons), don't update backend
    if (shouldPreventProgressUpdates) {
      console.log('Progress updates prevented for completed lesson');
      return;
    }

    // CRITICAL: Never update if backend progress is already 100%
    if (backendProgressRef.current >= 100 || backendCompletedRef.current) {
      console.log('Backend progress is already 100%, skipping update:', {
        backendProgress: backendProgressRef.current,
        backendCompleted: backendCompletedRef.current,
      });
      return;
    }

    const newProgress = calculateProgress(currentHeadingIndex);
    const shouldBeCompleted = currentHeadingIndex >= headingSections.length - 1;

    console.log('Heading index changed:', {
      currentHeadingIndex,
      totalHeadings: headingSections.length,
      calculatedProgress: newProgress,
      shouldBeCompleted,
      shouldPreventProgressUpdates,
      backendProgress: backendProgressRef.current,
    });

    // Only update if new progress is greater than current backend progress
    // This prevents going backwards in progress
    if (newProgress > backendProgressRef.current) {
      updateProgressInBackend(newProgress, shouldBeCompleted);
    } else {
      console.log(
        'New progress is not greater than backend progress, skipping update:',
        {
          newProgress,
          backendProgress: backendProgressRef.current,
        }
      );
    }
  }, [
    lessonId,
    headingSections?.length,
    currentHeadingIndex,
    shouldPreventProgressUpdates,
  ]);

  /**
   * Reset progress tracking (useful for lesson restart)
   */
  const resetProgress = () => {
    lastSentProgress.current = 0;
    lastSentCompleted.current = false;
    setProgress(0);
    setIsCompleted(false);
    setError(null);
  };

  /**
   * Manually trigger progress update (useful for initialization)
   */
  const forceProgressUpdate = () => {
    if (!lessonId || !headingSections || headingSections.length === 0) return;

    const currentProgress = calculateProgress(currentHeadingIndex);
    const shouldBeCompleted = currentHeadingIndex >= headingSections.length - 1;

    updateProgressInBackend(currentProgress, shouldBeCompleted);
  };

  return {
    // Current progress state
    progress,
    isCompleted,
    isLoading,
    error,

    // Utilities
    calculateProgress,
    resetProgress,
    forceProgressUpdate,

    // Computed values
    currentHeadingIndex,
    totalHeadings: headingSections?.length || 0,
    progressPercentage: `${progress}%`,
  };
};

export default useLessonProgressTracker;
