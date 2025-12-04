// Lesson Resources Service
import api from './apiClient';
import { getAuthHeader } from './authHeader';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://creditor-backend-ceds.onrender.com';

/**
 * Get all resources for a specific lesson
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Array>} Array of lesson resources
 */
export async function getLessonResources(lessonId) {
  try {
    const response = await api.get(
      `${API_BASE}/api/lesson/${lessonId}/resources`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );

    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching lesson resources:', error);
    // Return empty array if endpoint doesn't exist yet (for graceful degradation)
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Upload a resource for a specific lesson
 * @param {string} lessonId - The ID of the lesson
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata (title, description)
 * @returns {Promise<Object>} Upload response with resource details
 */
export async function uploadLessonResource(lessonId, file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('resource', file);
    formData.append('lesson_id', lessonId);

    if (metadata.title) {
      formData.append('title', metadata.title);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    const response = await api.post(
      `${API_BASE}/api/lesson/${lessonId}/resources/upload`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 600000, // 10 minutes for large files
      }
    );

    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error uploading lesson resource:', error);
    throw error;
  }
}

/**
 * Delete a resource from a lesson
 * @param {string} lessonId - The ID of the lesson
 * @param {string} resourceId - The ID of the resource to delete
 * @returns {Promise<Object>} Delete response
 */
export async function deleteLessonResource(lessonId, resourceId) {
  try {
    const response = await api.delete(
      `${API_BASE}/api/lesson/${lessonId}/resources/${resourceId}`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting lesson resource:', error);
    throw error;
  }
}

/**
 * Update a lesson resource metadata
 * @param {string} lessonId - The ID of the lesson
 * @param {string} resourceId - The ID of the resource
 * @param {Object} updates - Updates to apply (title, description)
 * @returns {Promise<Object>} Update response
 */
export async function updateLessonResource(lessonId, resourceId, updates) {
  try {
    const response = await api.patch(
      `${API_BASE}/api/lesson/${lessonId}/resources/${resourceId}`,
      updates,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating lesson resource:', error);
    throw error;
  }
}
