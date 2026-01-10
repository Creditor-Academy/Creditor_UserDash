// Lesson Resources Service
import axios from "axios";
import { getAuthHeader } from "./authHeader";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://creditor-backend-ceds.onrender.com";

/**
 * Determine resource type based on file
 * @param {File} file - The file to check
 * @returns {string} Resource type (IMAGE, VIDEO, TEXT_FILE, PDF)
 */
function determineResourceType(file) {
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  } else if (mimeType.startsWith("video/")) {
    return "VIDEO";
  } else if (mimeType === "application/pdf") {
    return "PDF";
  } else {
    return "TEXT";
  }
}

/**
 * Get all resources for a specific lesson
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Array>} Array of lesson resources
 */
export async function getLessonResources(courseId, moduleId, lessonId) {
  try {
    const response = await axios.get(
      `${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}/external-lesson-resources/view-all`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      },
    );

    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching lesson resources:", error);
    // Return empty array if endpoint doesn't exist yet (for graceful degradation)
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Upload a resource for a specific lesson
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {string} lessonId - The ID of the lesson
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata (title, description)
 * @returns {Promise<Object>} Upload response with resource details
 */
export async function uploadLessonResource(
  courseId,
  moduleId,
  lessonId,
  file,
  metadata = {},
) {
  try {
    const formData = new FormData();
    // Backend expects field name 'lesson-resource'
    formData.append("lesson-resource", file);

    // Required fields
    if (metadata.title) {
      formData.append("title", metadata.title);
    }
    if (metadata.description) {
      formData.append("description", metadata.description);
    }

    // Determine resource type from file
    const resourceType = metadata.resource_type || determineResourceType(file);
    formData.append("resource_type", resourceType);

    const response = await axios.post(
      `${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}/external-lesson-resources/add`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        timeout: 600000, // 10 minutes for large files (1GB limit on backend)
      },
    );

    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error uploading lesson resource:", error);
    throw error;
  }
}

/**
 * Update a lesson resource metadata
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {string} lessonId - The ID of the lesson
 * @param {string} resourceId - The ID of the resource
 * @param {Object} updates - Updates to apply (title, description, resource_type)
 * @returns {Promise<Object>} Update response
 */
export async function updateLessonResource(
  courseId,
  moduleId,
  lessonId,
  resourceId,
  updates,
) {
  try {
    const response = await axios.put(
      `${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}/external-lesson-resources/${resourceId}/edit`,
      updates,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );

    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating lesson resource:", error);
    throw error;
  }
}

/**
 * Delete a resource from a lesson
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {string} lessonId - The ID of the lesson
 * @param {string} resourceId - The ID of the resource to delete
 * @returns {Promise<Object>} Delete response
 */
export async function deleteLessonResource(
  courseId,
  moduleId,
  lessonId,
  resourceId,
) {
  try {
    const response = await axios.delete(
      `${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}/external-lesson-resources/${resourceId}/delete`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting lesson resource:", error);
    throw error;
  }
}
