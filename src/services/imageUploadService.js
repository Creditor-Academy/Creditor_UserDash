// Image Upload Service for handling image uploads to the resource API
import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
const RESOURCE_UPLOAD_API = `${API_BASE}/api/resource/upload-resource`;

/**
 * Upload an image file to the resource API
 * @param {File} file - The image file to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object>} Upload response with image URL
 */
export async function uploadImage(file, options = {}) {
  try {
    // Validate file type/size
    const isPdf = (options.type === 'pdf') || file.type === 'application/pdf';
    if (isPdf) {
      const validPdfTypes = ['application/pdf'];
      if (!validPdfTypes.includes(file.type)) {
        throw new Error('Please upload a valid PDF file');
      }
      // PDF size limit (e.g., 25MB)
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('PDF size should be less than 25MB');
      }
    } else {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Please upload only JPG, PNG, GIF, or WebP images');
      }
      // Image size limit (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }
    }

    // Always use the field name 'resource' (as per Postman)
    const fieldName = options.fieldName || 'resource';

    const formData = new FormData();
    formData.append(fieldName, file);
    if (options.folder) formData.append('folder', options.folder);
    if (typeof options.public !== 'undefined') formData.append('public', String(options.public));
    if (options.type) formData.append('type', options.type);

    // Let the browser set the correct Content-Type with boundary
    const response = await api.post(RESOURCE_UPLOAD_API, formData, {
      timeout: 30000,
      withCredentials: true,
    });

    if (response?.data) {
      const { data, url, success, message } = response.data;
      const finalUrl = data?.url || url;
      const isSuccess = typeof success === 'boolean' ? success : Boolean(finalUrl);
      if (!isSuccess) throw new Error(message || 'Upload failed');
      return {
        success: true,
        imageUrl: finalUrl,
        fileName: data?.fileName || file.name,
        fileSize: data?.fileSize || file.size,
        fieldUsed: fieldName,
        message: message || 'Image uploaded successfully',
      };
    }
    throw new Error('Upload failed');

  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Upload failed with status ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Other error (validation, etc.)
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files to upload
 * @param {Object} options - Additional options for upload
 * @returns {Promise<Object[]>} Array of upload responses
 */
export async function uploadMultipleImages(files, options = {}) {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.allSettled(uploadPromises);
    
    return results.map((result, index) => ({
      file: files[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

export default {
  uploadImage,
  uploadMultipleImages,
};
