/**
 * Utility functions for handling course trial periods
 */

/**
 * Calculate remaining trial time in days, hours, minutes
 * @param {string} subscriptionEnd - End date string (ISO format)
 * @returns {Object} - Object containing days, hours, minutes, isExpired, and formatted string
 */
export function calculateTrialTimeRemaining(subscriptionEnd) {
  if (!subscriptionEnd) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true, formatted: 'Trial Expired' };
  }

  const now = new Date();
  const endDate = new Date(subscriptionEnd);
  const timeDiff = endDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true, formatted: 'Trial Expired' };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  let formatted = '';
  if (days > 0) {
    formatted = `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    formatted = `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    formatted = `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  } else {
    formatted = 'Less than 1 minute left';
  }

  return {
    days,
    hours,
    minutes,
    isExpired: false,
    formatted,
    totalMinutes: Math.floor(timeDiff / (1000 * 60))
  };
}

/**
 * Check if a course is in trial mode
 * @param {Object} course - Course object with user_course_access array
 * @returns {boolean} - True if course is in trial mode
 */
export function isCourseInTrial(course) {
  if (!course.user_course_access || !Array.isArray(course.user_course_access)) {
    return false;
  }

  const access = course.user_course_access[0];
  // Course is in trial if isTrial is true, regardless of status (ACTIVE or EXPIRED)
  return access && access.isTrial === true;
}

/**
 * Get trial status for a course
 * @param {Object} course - Course object
 * @returns {Object} - Trial status object
 */
export function getCourseTrialStatus(course) {
  if (!isCourseInTrial(course)) {
    return { 
      isInTrial: false, 
      isExpired: false, 
      timeRemaining: null,
      canAccess: true 
    };
  }

  const access = course.user_course_access[0];
  const timeRemaining = calculateTrialTimeRemaining(access.subscription_end);
  
  // Check if status is explicitly set to "EXPIRED" in the API response
  const isStatusExpired = access.status && access.status.toUpperCase() === 'EXPIRED';
  
  // Course is expired if either the status says "EXPIRED" or time has run out
  const isExpired = isStatusExpired || timeRemaining.isExpired;

  return {
    isInTrial: true,
    isExpired,
    timeRemaining: isStatusExpired ? { ...timeRemaining, isExpired: true, formatted: 'Trial Expired' } : timeRemaining,
    canAccess: !isExpired,
    subscriptionStart: access.subscription_start,
    subscriptionEnd: access.subscription_end,
    statusExpired: isStatusExpired // Additional flag to indicate API-level expiration
  };
}

/**
 * Get the appropriate badge color based on trial time remaining
 * @param {number} totalMinutes - Total minutes remaining
 * @returns {string} - CSS classes for badge styling
 */
export function getTrialBadgeColor(totalMinutes) {
  if (totalMinutes <= 0) {
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (totalMinutes < 60) { // Less than 1 hour
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (totalMinutes < 1440) { // Less than 1 day
    return 'bg-orange-100 text-orange-800 border-orange-200';
  } else if (totalMinutes < 4320) { // Less than 3 days
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}
