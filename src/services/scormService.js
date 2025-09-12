import { getAuthHeader } from './authHeader';

// SCORM Service for handling backend API calls
// Replace the base URL with your actual backend API endpoint

class ScormService {
  // Fetch course data from backend
  static async fetchCourseData(moduleId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${moduleId}/scorm`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course data:', error);
      throw error;
    }
  }

  static async updateCourseProgress(courseId, moduleId, progress) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          progress,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  static async markModuleCompleted(courseId, moduleId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/modules/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking module as completed:', error);
      throw error;
    }
  }

  static async getUserProgress(courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/user-progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  static async saveScormSession(courseId, moduleId, sessionData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scorm/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          moduleId,
          sessionData,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving SCORM session:', error);
      throw error;
    }
  }

  static async getScormSession(courseId, moduleId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scorm/session/${courseId}/${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching SCORM session:', error);
      throw error;
    }
  }

  static async getCourseAnalytics(courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  static uploadScorm({ moduleId, file, uploadedBy, description, onProgress, onCancel }) {
    return new Promise((resolve, reject) => {
      // Check file size (limit to 500MB)
      const maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
      if (file.size > maxFileSize) {
        reject(new Error(`File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed size of 500MB`));
        return;
      }

      console.log('Preparing to upload SCORM package:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        moduleId,
        uploadedBy,
        description
      });

      const formData = new FormData();
      formData.append('scorm', file, file.name);
      formData.append('module_id', moduleId);
      formData.append('uploaded_by', uploadedBy);
      formData.append('description', description);

      // Log form data entries
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, key === 'scorm' ? `[File: ${value.name}, ${value.size} bytes]` : value);
      }

      const xhr = new XMLHttpRequest();
      const url = '/api/scorm/upload_scorm';
      
      // Track if we've completed the upload
      let uploadComplete = false;
      
      // Set up progress tracking
      if (onProgress) {
        // Initial progress
        onProgress(0);
        
        // Progress event handler
        const progressHandler = (event) => {
          if (!event.lengthComputable) return;
          
          let progress = 0;
          if (event.lengthComputable && event.total > 0) {
            progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
          }
          
          console.log(`Upload progress: ${progress}% (${event.loaded} of ${event.total} bytes)`);
          onProgress(progress);
        };
        
        // Add progress event listeners
        xhr.upload.addEventListener('loadstart', () => {
          console.log('Upload started');
          onProgress(0);
        });
        
        xhr.upload.addEventListener('progress', progressHandler);
        
        xhr.upload.addEventListener('load', () => {
          console.log('Upload complete, waiting for server response...');
          // Don't set to 100% yet, wait for server response
        });
      }

      // Set up cancel handler
      if (onCancel) {
        onCancel(() => {
          if (!uploadComplete) {
            xhr.abort();
            reject(new Error('Upload cancelled by user'));
          }
        });
      }

      xhr.open('POST', url, true);
      
      // Set auth headers
      const authHeaders = getAuthHeader();
      if (authHeaders && authHeaders.Authorization) {
        xhr.setRequestHeader('Authorization', authHeaders.Authorization);
      }
      
      // Don't set Content-Type - let the browser set it with the boundary
      xhr.withCredentials = true;

      xhr.onload = function() {
        uploadComplete = true;
        
        // Update progress to 100% when we get a response
        if (onProgress) {
          onProgress(100);
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('SCORM upload successful:', data);
            resolve(data);
          } catch (e) {
            console.error('Error parsing response:', e);
            reject(new Error('Failed to parse server response'));
          }
        } else {
          let errorMessage = `Server error: ${xhr.status} ${xhr.statusText}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          
          console.error('Upload failed with status:', xhr.status, 'Details:', xhr.responseText);
          
          if (xhr.status === 400) {
            reject(new Error(errorMessage || 'Invalid request. Please check the file and try again.'));
          } else if (xhr.status === 401) {
            reject(new Error('Authentication failed. Please log in again.'));
          } else if (xhr.status === 413) {
            reject(new Error('File too large. Please reduce file size and try again.'));
          } else if (xhr.status === 403) {
            reject(new Error('Access denied. You do not have permission to upload SCORM packages.'));
          } else {
            reject(new Error(errorMessage || 'Failed to upload SCORM package. Please try again.'));
          }
        }
      };

      xhr.onerror = function() {
        reject(new Error('Network error occurred during upload'));
      };

      xhr.ontimeout = function() {
        reject(new Error('Upload timed out. Please try again.'));
      };

      xhr.send(formData);
    });
  }

  static async deleteScorm(resourceId) {
    try {
      const response = await fetch(`/api/scorm/deleteScorm/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `Failed to delete SCORM package: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete this SCORM package.');
        } else if (response.status === 404) {
          throw new Error('SCORM package not found. It may have already been deleted.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      console.log('SCORM package deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting SCORM:', error);
      throw error;
    }
  }
}

export default ScormService;