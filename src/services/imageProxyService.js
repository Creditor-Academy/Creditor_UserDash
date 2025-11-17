/**
 * Image Proxy Service
 * Handles CORS-blocked image URLs by using backend proxy or data URLs
 */

import { uploadAIGeneratedImage } from './aiUploadService.js';

/**
 * Convert image URL to data URL to bypass CORS
 * @param {string} imageUrl - Image URL to convert
 * @returns {Promise<string>} Data URL or original URL if conversion fails
 */
export async function convertToDataUrl(imageUrl) {
  try {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Try to enable CORS

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png');
          console.log('✅ Successfully converted image to data URL');
          resolve(dataUrl);
        } catch (error) {
          console.error('❌ Canvas conversion failed:', error);
          resolve(imageUrl); // Fallback to original URL
        }
      };

      img.onerror = () => {
        console.error('❌ Image load failed, using original URL');
        resolve(imageUrl); // Fallback to original URL
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error('❌ Data URL conversion error:', error);
    return imageUrl; // Fallback to original URL
  }
}

/**
 * Upload image using backend proxy to avoid CORS issues
 * @param {string} imageUrl - OpenAI DALL-E image URL
 * @param {Object} options - Upload options
 * @returns {Promise<string>} S3 URL or original URL if upload fails
 */
export async function uploadImageViaProxy(imageUrl, options = {}) {
  try {
    console.log('🔄 Attempting to upload image via backend proxy...');

    const uploadResult = await uploadAIGeneratedImage(imageUrl, {
      public: true,
      folder: options.folder || 'ai-thumbnails',
      ...options,
    });

    if (uploadResult.success && uploadResult.imageUrl) {
      console.log('✅ Image uploaded successfully via backend proxy');
      return uploadResult.imageUrl;
    } else {
      console.warn('⚠️ Backend proxy upload failed, using original URL');
      return imageUrl;
    }
  } catch (error) {
    console.error('❌ Backend proxy upload error:', error);
    return imageUrl; // Fallback to original URL
  }
}

/**
 * Smart image handler that tries multiple approaches to handle CORS-blocked images
 * @param {string} imageUrl - Image URL to process
 * @param {Object} options - Processing options
 * @returns {Promise<string>} Processed image URL
 */
export async function handleCorsImage(imageUrl, options = {}) {
  // If it's not an OpenAI URL, return as-is
  if (!imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    return imageUrl;
  }

  console.log('🔍 Detected OpenAI DALL-E URL, handling CORS...');

  // Strategy 1: Try backend proxy upload (preferred)
  if (options.useProxy !== false) {
    try {
      const proxyResult = await uploadImageViaProxy(imageUrl, options);
      if (proxyResult !== imageUrl) {
        return proxyResult; // Successfully uploaded to S3
      }
    } catch (error) {
      console.warn('⚠️ Proxy upload failed, trying data URL conversion...');
    }
  }

  // Strategy 2: Try data URL conversion (fallback)
  if (options.useDataUrl !== false) {
    try {
      const dataUrl = await convertToDataUrl(imageUrl);
      if (dataUrl !== imageUrl && dataUrl.startsWith('data:')) {
        console.log('✅ Using data URL as fallback');
        return dataUrl;
      }
    } catch (error) {
      console.warn('⚠️ Data URL conversion failed');
    }
  }

  // Strategy 3: Return original URL (last resort)
  console.log('🔄 Using original OpenAI URL (may have CORS issues)');
  return imageUrl;
}

export default {
  convertToDataUrl,
  uploadImageViaProxy,
  handleCorsImage,
};
