/**
 * Utility functions for course analytics calculations
 */

/**
 * Calculate activity score for a course
 * @param {Object} course - Course object with metrics
 * @returns {number} Activity score
 */
export function calculateActivityScore(course) {
  const {
    activeUsers = 0,
    enrollments = 1,
    completionRate = 0,
    avgTimeSpent = 0,
  } = course;

  // Avoid division by zero
  const activeUserPercentage =
    enrollments > 0 ? (activeUsers / enrollments) * 100 : 0;

  // Weighted formula for activity score
  const score =
    activeUserPercentage * 0.4 +
    completionRate * 0.3 +
    Math.min(enrollments / 10, 100) * 0.2 +
    Math.min(avgTimeSpent / 10, 100) * 0.1;

  return Math.round(score * 100) / 100;
}

/**
 * Determine if a course is active or inactive
 * @param {Object} course - Course object with metrics
 * @returns {string} 'active' | 'inactive'
 */
export function determineCourseActivity(course) {
  const score = calculateActivityScore(course);
  return score >= 50 ? 'active' : 'inactive';
}

/**
 * Format time duration in minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted time string
 */
export function formatDuration(minutes) {
  if (!minutes || minutes === 0) return '0m';

  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate completion percentage
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @returns {number} Percentage (0-100)
 */
export function calculateCompletionPercentage(completed, total) {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1] || '';
}

/**
 * Get short month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Short month name
 */
export function getShortMonthName(month) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[month - 1] || '';
}

/**
 * Sort courses by activity score
 * @param {Array} courses - Array of course objects
 * @param {string} order - 'asc' | 'desc'
 * @returns {Array} Sorted courses
 */
export function sortCoursesByActivity(courses, order = 'desc') {
  return [...courses].sort((a, b) => {
    const scoreA = calculateActivityScore(a);
    const scoreB = calculateActivityScore(b);
    return order === 'desc' ? scoreB - scoreA : scoreA - scoreB;
  });
}

/**
 * Get top N most active courses
 * @param {Array} courses - Array of course objects
 * @param {number} limit - Number of courses to return
 * @returns {Array} Top active courses
 */
export function getTopActiveCourses(courses, limit = 5) {
  const sorted = sortCoursesByActivity(courses, 'desc');
  return sorted.slice(0, limit);
}

/**
 * Get top N most inactive courses
 * @param {Array} courses - Array of course objects
 * @param {number} limit - Number of courses to return
 * @returns {Array} Top inactive courses
 */
export function getTopInactiveCourses(courses, limit = 5) {
  const sorted = sortCoursesByActivity(courses, 'asc');
  return sorted.slice(0, limit);
}

/**
 * Calculate trend compared to previous period
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {Object} Trend object with direction and percentage
 */
export function calculateTrend(current, previous) {
  if (!previous || previous === 0) {
    return { direction: 'neutral', percentage: 0 };
  }

  const change = ((current - previous) / previous) * 100;

  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    percentage: Math.abs(Math.round(change * 10) / 10),
  };
}

/**
 * Format large numbers with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatLargeNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Get color class based on metric value
 * @param {number} value - Metric value
 * @param {Object} thresholds - Object with good, warning, danger thresholds
 * @returns {string} Color class name
 */
export function getMetricColorClass(
  value,
  thresholds = { good: 70, warning: 40 }
) {
  if (value >= thresholds.good) return 'text-green-600';
  if (value >= thresholds.warning) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get badge variant based on metric value
 * @param {number} value - Metric value
 * @param {Object} thresholds - Object with good, warning thresholds
 * @returns {string} Badge variant
 */
export function getMetricBadgeVariant(
  value,
  thresholds = { good: 70, warning: 40 }
) {
  if (value >= thresholds.good) return 'default';
  if (value >= thresholds.warning) return 'secondary';
  return 'destructive';
}

/**
 * Generate date range for a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Start and end dates
 */
export function getMonthDateRange(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Get last N months
 * @param {number} count - Number of months to get
 * @returns {Array} Array of {year, month} objects
 */
export function getLastNMonths(count = 6) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: `${getShortMonthName(date.getMonth() + 1)} ${date.getFullYear()}`,
    });
  }

  return months;
}

/**
 * Calculate engagement rate
 * @param {number} activeUsers - Number of active users
 * @param {number} totalUsers - Total number of users
 * @returns {number} Engagement rate percentage
 */
export function calculateEngagementRate(activeUsers, totalUsers) {
  if (!totalUsers || totalUsers === 0) return 0;
  return Math.round((activeUsers / totalUsers) * 100);
}

/**
 * Group courses by category
 * @param {Array} courses - Array of course objects
 * @returns {Object} Courses grouped by category
 */
export function groupCoursesByCategory(courses) {
  return courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {});
}

/**
 * Calculate average metrics across courses
 * @param {Array} courses - Array of course objects
 * @returns {Object} Average metrics
 */
export function calculateAverageMetrics(courses) {
  if (!courses || courses.length === 0) {
    return {
      avgEnrollments: 0,
      avgActiveUsers: 0,
      avgCompletionRate: 0,
      avgTimeSpent: 0,
    };
  }

  const totals = courses.reduce(
    (acc, course) => ({
      enrollments: acc.enrollments + (course.enrollments || 0),
      activeUsers: acc.activeUsers + (course.activeUsers || 0),
      completionRate: acc.completionRate + (course.completionRate || 0),
      timeSpent: acc.timeSpent + (course.avgTimeSpent || 0),
    }),
    { enrollments: 0, activeUsers: 0, completionRate: 0, timeSpent: 0 }
  );

  return {
    avgEnrollments: Math.round(totals.enrollments / courses.length),
    avgActiveUsers: Math.round(totals.activeUsers / courses.length),
    avgCompletionRate:
      Math.round((totals.completionRate / courses.length) * 10) / 10,
    avgTimeSpent: Math.round(totals.timeSpent / courses.length),
  };
}

/**
 * Filter courses by activity level
 * @param {Array} courses - Array of course objects
 * @param {string} level - 'high' | 'medium' | 'low'
 * @returns {Array} Filtered courses
 */
export function filterCoursesByActivityLevel(courses, level) {
  return courses.filter(course => {
    const score = calculateActivityScore(course);

    switch (level) {
      case 'high':
        return score >= 70;
      case 'medium':
        return score >= 40 && score < 70;
      case 'low':
        return score < 40;
      default:
        return true;
    }
  });
}

/**
 * Export data to CSV format
 * @param {Array} courses - Array of course objects
 * @returns {string} CSV string
 */
export function exportToCSV(courses) {
  const headers = [
    'Course ID',
    'Title',
    'Enrollments',
    'Active Users',
    'Completion Rate',
    'Avg Time Spent (min)',
    'Activity Score',
  ];

  const rows = courses.map(course => [
    course.id,
    `"${course.title}"`,
    course.enrollments || 0,
    course.activeUsers || 0,
    course.completionRate || 0,
    course.avgTimeSpent || 0,
    calculateActivityScore(course),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  return csv;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
export function downloadCSV(csvContent, filename = 'course-analytics.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
