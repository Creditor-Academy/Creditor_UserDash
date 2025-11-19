// AI Upload Service - Uses /api/ai endpoints for AI-generated content uploads
import api from './apiClient';
import { uploadImage } from './imageUploadService';
import { uploadVideo } from './videoUploadService';
import { uploadAudio } from './audioUploadService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
const AI_UPLOAD_API = `${API_BASE}/api/ai/upload-resource`;
const AI_IMAGE_UPLOAD_API = `${API_BASE}/api/ai/upload-ai-image`;

/**
 * Upload AI-generated image from URL to S3
 * Used when AI generates an image and we need to store it permanently
 * @param {string} imageUrl - The AI-generated image URL (temporary)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response with S3 URL
 */
export async function uploadAIGeneratedImage(imageUrl, options = {}) {
  try {
    console.log('🤖 Uploading AI-generated image to S3 via /api/ai:', imageUrl);

    const response = await api.post(
      AI_IMAGE_UPLOAD_API,
      { imageUrl },
      {
        timeout: 300000,
        withCredentials: true,
      }
    );

    if (response?.data) {
      const { url, message } = response.data;

      if (!url) {
        throw new Error(message || 'Upload failed - no URL returned');
      }

      console.log('✅ AI image uploaded successfully to S3:', url);

      return {
        success: true,
        imageUrl: url,
        s3Url: url,
        message: message || 'AI image uploaded successfully',
        uploadedToS3: true,
        source: 'ai-generated',
      };
    }

    throw new Error('Upload failed');
  } catch (error) {
    console.error('❌ Error uploading AI-generated image:', error);

    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Upload failed with status ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        'Network error. Please check your connection and try again.'
      );
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

/**
 * Upload media file for AI-generated courses
 * Routes to /api/ai/upload-resource for AI content or falls back to regular upload
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response with S3 URL
 */
export async function uploadAICourseMedia(file, options = {}) {
  try {
    const { type, folder, isAIGenerated = true } = options;

    console.log('🤖 Uploading AI course media:', {
      fileName: file.name,
      fileType: file.type,
      folder: folder || 'ai-course-media',
      isAIGenerated,
    });

    // If API endpoint exists, use it; otherwise fall back to regular upload
    const uploadEndpoint = AI_UPLOAD_API;
    const fieldName = options.fieldName || 'resource';

    const formData = new FormData();
    formData.append(fieldName, file);
    formData.append('folder', folder || 'ai-course-media');
    formData.append('isAIGenerated', 'true');

    if (typeof options.public !== 'undefined') {
      formData.append('public', String(options.public));
    }
    if (type) {
      formData.append('type', type);
    }

    try {
      // Try AI endpoint first
      const response = await api.post(uploadEndpoint, formData, {
        timeout: 300000,
        withCredentials: true,
      });

      if (response?.data) {
        const { data, url, success, message } = response.data;
        const finalUrl = data?.url || url;
        const isSuccess =
          typeof success === 'boolean' ? success : Boolean(finalUrl);

        if (!isSuccess) throw new Error(message || 'Upload failed');

        console.log('✅ AI course media uploaded via /api/ai:', finalUrl);

        return {
          success: true,
          imageUrl: finalUrl,
          videoUrl: finalUrl,
          audioUrl: finalUrl,
          fileName: data?.fileName || file.name,
          fileSize: data?.fileSize || file.size,
          fieldUsed: fieldName,
          message: message || 'Media uploaded successfully',
          source: 'ai-endpoint',
        };
      }
    } catch (aiEndpointError) {
      console.warn(
        '⚠️ AI endpoint not available, falling back to regular upload:',
        aiEndpointError.message
      );

      // Fall back to appropriate upload service based on file type
      if (file.type.startsWith('image/') || type === 'image') {
        return await uploadImage(file, {
          ...options,
          folder: folder || 'ai-course-media',
        });
      } else if (file.type.startsWith('video/') || type === 'video') {
        return await uploadVideo(file, {
          ...options,
          folder: folder || 'ai-course-media',
        });
      } else if (file.type.startsWith('audio/') || type === 'audio') {
        return await uploadAudio(file, {
          ...options,
          folder: folder || 'ai-course-media',
        });
      } else {
        throw new Error('Unsupported file type for AI course media');
      }
    }
  } catch (error) {
    console.error('❌ Error uploading AI course media:', error);
    throw error;
  }
}

/**
 * Upload thumbnail for AI-generated course
 * Always uses /api/ai endpoint
 * @param {File|string} fileOrUrl - File object or AI-generated image URL
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response with S3 URL
 */
export async function uploadAICourseThumbnail(fileOrUrl, options = {}) {
  try {
    console.log('🖼️ Uploading AI course thumbnail...');

    // If it's a URL (AI-generated), use the AI image upload endpoint
    if (typeof fileOrUrl === 'string') {
      return await uploadAIGeneratedImage(fileOrUrl, {
        ...options,
        folder: 'ai-course-thumbnails',
      });
    }

    // If it's a File object, use the AI media upload
    if (fileOrUrl instanceof File) {
      return await uploadAICourseMedia(fileOrUrl, {
        ...options,
        type: 'image',
        folder: 'ai-course-thumbnails',
        isAIGenerated: true,
      });
    }

    throw new Error('Invalid input: must be a File object or image URL');
  } catch (error) {
    console.error('❌ Error uploading AI course thumbnail:', error);
    throw error;
  }
}

/**
 * Upload reference files for AI course generation
 * @param {File[]} files - Array of reference files
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} Array of upload results
 */
export async function uploadAICourseReferences(files, options = {}) {
  try {
    console.log('📚 Uploading AI course reference files:', files.length);

    const uploadPromises = files.map(async file => {
      try {
        const isPdf = file.type === 'application/pdf';
        const result = await uploadAICourseMedia(file, {
          ...options,
          type: isPdf ? 'pdf' : 'image',
          folder: 'ai-course-references',
          isAIGenerated: true,
        });

        return {
          name: file.name,
          url: result.imageUrl || result.videoUrl || result.audioUrl,
          type: isPdf ? 'pdf' : 'image',
          size: file.size,
          success: true,
        };
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        return {
          name: file.name,
          url: null,
          type: file.type,
          size: file.size,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`✅ Uploaded ${successCount}/${files.length} reference files`);

    return results;
  } catch (error) {
    console.error('❌ Error uploading AI course references:', error);
    throw error;
  }
}

export default {
  uploadAIGeneratedImage,
  uploadAICourseMedia,
  uploadAICourseThumbnail,
  uploadAICourseReferences,
};
