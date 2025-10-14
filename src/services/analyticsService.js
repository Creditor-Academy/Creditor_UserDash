import { getAuthHeader } from './authHeader';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://creditor.onrender.com';

/**
 * Fetch course activity analytics for a specific month
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Promise<Object>} Course activity data
 */
export async function fetchCourseActivityByMonth(year, month) {
  const response = await fetch(
    `${API_BASE}/api/analytics/course-activity?year=${year}&month=${month}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch course activity analytics');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch most active and inactive courses for the current month
 * @returns {Promise<Object>} Object containing mostActive and mostInactive arrays
 */
export async function fetchMostActiveInactiveCourses() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed

  const response = await fetch(
    `${API_BASE}/api/analytics/course-activity/summary?year=${year}&month=${month}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch course activity summary');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch historical course activity trends (last 6 months)
 * @returns {Promise<Array>} Array of monthly activity data
 */
export async function fetchCourseActivityTrends() {
  const response = await fetch(
    `${API_BASE}/api/analytics/course-activity/trends`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch course activity trends');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch detailed course activity statistics
 * @param {string} courseId - Course ID
 * @param {number} year - Year (optional)
 * @param {number} month - Month (optional, 1-12)
 * @returns {Promise<Object>} Detailed course statistics
 */
export async function fetchCourseStatistics(courseId, year = null, month = null) {
  let url = `${API_BASE}/api/analytics/course/${courseId}/statistics`;
  
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch course statistics');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch all courses with their activity metrics for current month
 * @returns {Promise<Array>} Array of courses with activity data
 */
export async function fetchAllCoursesActivity() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const response = await fetch(
    `${API_BASE}/api/analytics/courses/activity?year=${year}&month=${month}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch courses activity');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Track course activity event (for frontend tracking)
 * @param {string} courseId - Course ID
 * @param {string} eventType - Event type (view, start, complete, etc.)
 * @param {Object} metadata - Additional metadata
 */
export async function trackCourseActivity(courseId, eventType, metadata = {}) {
  const response = await fetch(
    `${API_BASE}/api/analytics/course/track`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify({
        courseId,
        eventType,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    console.warn('Failed to track course activity');
    return null;
  }

  const data = await response.json();
  return data.data || data;
}

