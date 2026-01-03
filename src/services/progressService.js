import axios from 'axios';
import { getAuthHeader } from './authHeader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch user progress overview from backend
export const fetchUserProgressOverview = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/dashboard/progress-overview`,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || 'Failed to fetch progress overview'
      );
    }
  } catch (error) {
    console.error('Error fetching progress overview:', error);
    throw error;
  }
};

// Fetch all user modules
export const fetchUserAllModules = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/dashboard/modules`,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch user modules');
    }
  } catch (error) {
    console.error('Error fetching user modules:', error);
    throw error;
  }
};

// Fetch specific module details
export const fetchUserModuleById = async moduleId => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/modules/${moduleId}`,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || 'Failed to fetch module details'
      );
    }
  } catch (error) {
    console.error('Error fetching module details:', error);
    throw error;
  }
};

// Track module access and progress
export const trackModuleAccess = async moduleId => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/track/module/${moduleId}`,
      {},
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || 'Failed to track module progress'
      );
    }
  } catch (error) {
    console.error('Error tracking module access:', error);
    throw error;
  }
};

// Track lesson access
export const trackLessonAccess = async lessonId => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/track/lesson/${lessonId}`,
      {},
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || 'Failed to track lesson access'
      );
    }
  } catch (error) {
    console.error('Error tracking lesson access:', error);
    throw error;
  }
};

// Update lesson progress
export const updateLessonProgress = async (
  lessonId,
  progress,
  completed = false
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/user/track/lesson/${lessonId}/progress`,
      { progress, completed },
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || 'Failed to update lesson progress'
      );
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Update progress after tracking (comprehensive progress update)
export const updateProgressAfterTracking = async (moduleId, lessonId) => {
  try {
    const results = {};

    // Update lesson progress (mark as started/in-progress)
    if (lessonId) {
      try {
        results.lessonProgress = await updateLessonProgress(
          lessonId,
          10,
          false
        ); // 10% progress for starting
        console.log('Lesson progress updated:', results.lessonProgress);
      } catch (error) {
        console.warn('Failed to update lesson progress:', error);
      }
    }

    // You can add more progress update logic here as needed
    // For example: update module progress, course progress, etc.

    return results;
  } catch (error) {
    console.error('Error updating progress after tracking:', error);
    throw error;
  }
};
