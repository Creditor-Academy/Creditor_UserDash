// Video Upload Service using the same resource API
import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || ' https://creditor-backend-ceds.onrender.com';
const RESOURCE_UPLOAD_API = `${API_BASE}/api/resource/upload-resource`;

/**
 * Upload a video file to the resource API
 * Field key is 'resource', same as images. Server will detect type.
 * @param {File} file - The video file to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object>} Upload response with video URL
 */
export async function uploadVideo(file, options = {}) {
  try {
    // Validate video type/size
    const validVideoTypes = [
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo'
    ];
    if (!validVideoTypes.includes(file.type)) {
      throw new Error('Please upload a valid video (MP4, WEBM, OGG, MOV, MKV, AVI)');
    }
    // Video size limit (500MB)
    if (file.size > 500 * 1024 * 1024) {
      throw new Error('Video size should be less than 500MB');
    }

    const fieldName = options.fieldName || 'resource';

    const formData = new FormData();
    formData.append(fieldName, file);
    if (options.folder) formData.append('folder', options.folder);
    if (typeof options.public !== 'undefined') formData.append('public', String(options.public));
    // Hint the backend about the resource type
    formData.append('type', options.type || 'video');

    const response = await api.post(RESOURCE_UPLOAD_API, formData, {
      timeout: 600000, // Allow large uploads
      withCredentials: true,
    });

    if (response?.data) {
      const { data, url, success, message } = response.data;
      const finalUrl = data?.url || url;
      const isSuccess = typeof success === 'boolean' ? success : Boolean(finalUrl);
      if (!isSuccess) throw new Error(message || 'Upload failed');
      return {
        success: true,
        videoUrl: finalUrl,
        fileName: data?.fileName || file.name,
        fileSize: data?.fileSize || file.size,
        fieldUsed: fieldName,
        message: message || 'Video uploaded successfully',
      };
    }
    throw new Error('Upload failed');

  } catch (error) {
    console.error('Error uploading video:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message ||
                           error.response.data?.error ||
                           `Upload failed with status ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default {
  uploadVideo,
};


