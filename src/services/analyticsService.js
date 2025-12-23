import { getAuthHeader } from './authHeader';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://testbackend-hcoy.onrender.com';

/**
 * Fetch top and least active courses based on last 30 days enrollment
 * @returns {Promise<Object>} Object containing top3Courses, least3Courses, and allCourseAnalytics
 */
export async function fetchCourseAnalytics() {
  const response = await fetch(
    `${API_BASE}/api/instructor/getCourseAnalytics`,
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
    throw new Error('Failed to fetch course analytics');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetch total course count and total enrollments
 * @returns {Promise<Object>} Object containing CourseCount and TotalEnrollments
 */
export async function fetchCourseAndEnrollments() {
  const response = await fetch(
    `${API_BASE}/api/instructor/getCourseAndEnrollments`,
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
    throw new Error('Failed to fetch course and enrollment counts');
  }

  const result = await response.json();
  return result.data;
}
