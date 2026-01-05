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

// Get lesson progress (to retrieve saved progress)
export const getLessonProgress = async lessonId => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/track/lesson/${lessonId}/progress`,
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
        response.data?.message || 'Failed to fetch lesson progress'
      );
    }
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
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
