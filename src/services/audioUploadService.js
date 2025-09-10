// Audio Upload Service using the same resource API
import api from './apiClient';

const RESOURCE_UPLOAD_API = 'https://sharebackend-sdkp.onrender.com/api/resource/upload-resource';

/**
 * Upload an audio file to the resource API
 * Field key is 'resource', same as images/videos.
 * @param {File} file - The audio file to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object>} Upload response with audio URL
 */
export async function uploadAudio(file, options = {}) {
  try {
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!validAudioTypes.includes(file.type)) {
      throw new Error('Please upload only MP3, WAV, or OGG audio files');
    }
    // Audio size limit (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('Audio size should be less than 50MB');
    }

    const fieldName = options.fieldName || 'resource';

    const formData = new FormData();
    formData.append(fieldName, file);
    if (options.folder) formData.append('folder', options.folder);
    if (typeof options.public !== 'undefined') formData.append('public', String(options.public));
    formData.append('type', options.type || 'audio');

    const response = await api.post(RESOURCE_UPLOAD_API, formData, {
      timeout: 600000,
      withCredentials: true,
    });

    if (response?.data) {
      const { data, url, success, message } = response.data;
      const finalUrl = data?.url || url;
      const isSuccess = typeof success === 'boolean' ? success : Boolean(finalUrl);
      if (!isSuccess) throw new Error(message || 'Upload failed');
      return {
        success: true,
        audioUrl: finalUrl,
        fileName: data?.fileName || file.name,
        fileSize: data?.fileSize || file.size,
        fieldUsed: fieldName,
        message: message || 'Audio uploaded successfully',
      };
    }
    throw new Error('Upload failed');

  } catch (error) {
    console.error('Error uploading audio:', error);
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
  uploadAudio,
};


