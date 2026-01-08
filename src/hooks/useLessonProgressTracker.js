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
 * @returns {Object} Progress tracking state and utilities
 */
export const useLessonProgressTracker = (
  lessonId,
  headingSections,
  currentHeadingIndex,
  shouldPreventProgressUpdates = false
) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track last sent progress to prevent duplicate API calls
  const lastSentProgress = useRef(0);
  const lastSentCompleted = useRef(false);

  /**
   * Calculate progress based on current heading index
   * @param {number} headingIndex - Current heading index
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = headingIndex => {
    if (!headingSections || headingSections.length === 0) return 0;

    // Progress = ((currentHeadingIndex + 1) / totalHeadings) * 100
    const progressPercentage =
      ((headingIndex + 1) / headingSections.length) * 100;
    return Math.min(100, Math.max(0, Math.round(progressPercentage)));
  };

  /**
   * Update progress in backend with duplicate prevention
   * @param {number} newProgress - New progress percentage
   * @param {boolean} completed - Whether lesson is completed
   */
  const updateProgressInBackend = async (newProgress, completed) => {
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

      // Update local state
      setProgress(newProgress);
      setIsCompleted(completed);

      console.log('Lesson progress updated successfully:', result);

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

    const newProgress = calculateProgress(currentHeadingIndex);
    const shouldBeCompleted = currentHeadingIndex >= headingSections.length - 1;

    console.log('Heading index changed:', {
      currentHeadingIndex,
      totalHeadings: headingSections.length,
      calculatedProgress: newProgress,
      shouldBeCompleted,
      shouldPreventProgressUpdates,
    });

    // Update progress when heading changes
    updateProgressInBackend(newProgress, shouldBeCompleted);
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
