// src/services/searchService.js
import { getAuthHeader } from './authHeader';

export async function search(query) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
}

// Enhanced search function that includes course and module data
export async function searchWithCoursesAndModules(query) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&include=courses,modules`,
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching with courses and modules:', error);
    throw error;
  }
}

// Search specifically for users with their enrolled courses and modules
export async function searchUsersWithEnrollments(query) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/search/users?q=${encodeURIComponent(query)}&include=enrollments,modules`,
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching users with enrollments:', error);
    throw error;
  }
}

// Search for courses with their modules
export async function searchCoursesWithModules(query) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/search/courses?q=${encodeURIComponent(query)}&include=modules`,
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching courses with modules:', error);
    throw error;
  }
}
