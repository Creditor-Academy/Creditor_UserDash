// Image Gallery Service - Fetches images from S3 via backend API
import { api } from './apiClient';

/**
 * Fetch all images from S3
 * @param {Array<string>} folders - Optional array of folders to filter by
 * @returns {Promise<Object>} Response with images array
 */
export async function fetchImagesFromS3(folders = []) {
  try {
    const params = new URLSearchParams();
    if (folders.length > 0) {
      folders.forEach(folder => params.append('folders', folder));
    }

    const response = await api.get(
      `/api/resource/list-images?${params.toString()}`
    );

    if (response.data?.success) {
      return {
        success: true,
        images: response.data.images || [],
        count: response.data.count || 0,
      };
    }

    throw new Error('Failed to fetch images');
  } catch (error) {
    console.error('Error fetching images from S3:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch images'
    );
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'Unknown';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default {
  fetchImagesFromS3,
  formatFileSize,
  formatDate,
};
