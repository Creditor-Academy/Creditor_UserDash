// Enhanced Image Generation Service with Multi-API Support
import enhancedAIService from './enhancedAIService';
import aiService from './aiService';
import { uploadImage } from './imageUploadService';

/**
 * Generate and upload course image using multi-API system
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated and uploaded image data
 */
export async function generateAndUploadCourseImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating course image with multi-API system:', prompt);

    // Use enhanced AI service for image generation
    const imageResult = await enhancedAIService.generateCourseImage(
      prompt,
      options
    );

    if (imageResult.success && imageResult.data?.url) {
      console.log(
        `✅ Image generated successfully with ${imageResult.data.provider}`
      );

      // Try to upload the generated image to S3 (works for both blob and URL images)
      try {
        let file;

        if (imageResult.data.blob) {
          // Convert blob to file for upload (HuggingFace images)
          file = new File([imageResult.data.blob], 'ai-generated-image.png', {
            type: 'image/png',
          });
          console.log('📤 Uploading blob-based image to S3...');
        } else if (imageResult.data.url) {
          // Convert URL to blob then to file for upload (Deep AI, etc.)
          console.log('📤 Converting URL-based image to file for S3 upload...');
          const response = await fetch(imageResult.data.url);
          if (response.ok) {
            const blob = await response.blob();
            file = new File([blob], `ai-course-image-${Date.now()}.png`, {
              type: 'image/png',
            });
          }
        }

        if (file) {
          const uploadResult = await uploadImage(file, {
            folder: 'course-thumbnails',
            public: true,
            type: 'image',
          });

          if (uploadResult?.success && uploadResult.imageUrl) {
            console.log(
              '✅ Image successfully uploaded to S3:',
              uploadResult.imageUrl
            );
            return {
              success: true,
              data: {
                url: uploadResult.imageUrl, // Use S3 URL
                originalUrl: imageResult.data.url, // Keep original for reference
                s3Url: uploadResult.imageUrl,
                fileName: uploadResult.fileName,
                fileSize: uploadResult.fileSize,
                provider: imageResult.data.provider,
                model: imageResult.data.model,
                prompt: prompt,
                uploaded: true,
                uploadedToS3: true,
                createdAt: new Date().toISOString(),
              },
            };
          }
        }
      } catch (uploadError) {
        console.warn(
          '📤 S3 upload failed, using original URL:',
          uploadError.message
        );
      }

      // Return the original URL if upload failed or not possible
      return {
        success: true,
        data: {
          url: imageResult.data.url,
          provider: imageResult.data.provider,
          model: imageResult.data.model,
          prompt: prompt,
          uploaded: false,
          uploadedToS3: false,
          createdAt: imageResult.data.createdAt || new Date().toISOString(),
        },
      };
    } else {
      // Fallback to legacy AI service
      console.log('🔄 Enhanced AI failed, trying legacy AI service...');
      const legacyResult = await aiService.generateCourseImage(prompt, options);

      if (legacyResult.success && legacyResult.data?.url) {
        // Try to upload legacy result to S3 as well
        try {
          console.log('📤 Uploading legacy AI image to S3...');
          const response = await fetch(legacyResult.data.url);
          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], `legacy-ai-image-${Date.now()}.png`, {
              type: 'image/png',
            });

            const uploadResult = await uploadImage(file, {
              folder: 'course-thumbnails',
              public: true,
              type: 'image',
            });

            if (uploadResult?.success && uploadResult.imageUrl) {
              console.log(
                '✅ Legacy AI image uploaded to S3:',
                uploadResult.imageUrl
              );
              return {
                success: true,
                data: {
                  ...legacyResult.data,
                  url: uploadResult.imageUrl,
                  originalUrl: legacyResult.data.url,
                  s3Url: uploadResult.imageUrl,
                  fileName: uploadResult.fileName,
                  fileSize: uploadResult.fileSize,
                  provider: 'deepai-legacy',
                  uploaded: true,
                  uploadedToS3: true,
                  createdAt: new Date().toISOString(),
                },
              };
            }
          }
        } catch (uploadError) {
          console.warn('📤 Legacy AI S3 upload failed:', uploadError.message);
        }

        // Return original URL if upload failed
        return {
          success: true,
          data: {
            ...legacyResult.data,
            provider: 'deepai-legacy',
            uploaded: false,
            uploadedToS3: false,
          },
        };
      }

      throw new Error(
        legacyResult.error || 'All image generation methods failed'
      );
    }
  } catch (error) {
    console.error('❌ Course image generation failed:', error);

    // Return placeholder image
    const placeholderColor = '6366f1';
    const placeholderText = encodeURIComponent('Course Image');

    return {
      success: false,
      data: {
        url: `https://via.placeholder.com/1024x1024/${placeholderColor}/ffffff?text=${placeholderText}`,
        provider: 'fallback',
        prompt: prompt,
        uploaded: false,
        createdAt: new Date().toISOString(),
      },
      error: error.message,
    };
  }
}

/**
 * Generate multiple course images with different styles
 * @param {string} prompt - Base image prompt
 * @param {Array} styles - Array of style options
 * @returns {Promise<Array>} Array of generated images
 */
export async function generateMultipleImages(
  prompt,
  styles = ['realistic', 'illustration', 'modern']
) {
  const results = [];

  for (const style of styles) {
    try {
      const styledPrompt = `${prompt}, ${style} style`;
      const result = await generateAndUploadCourseImage(styledPrompt, {
        style,
      });
      results.push({
        style,
        ...result,
      });
    } catch (error) {
      console.warn(`Failed to generate ${style} image:`, error.message);
      results.push({
        style,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Test all image generation providers
 * @returns {Promise<Object>} Test results for each provider
 */
export async function testImageProviders() {
  const testPrompt = 'test course thumbnail';
  const results = {};

  try {
    const status = await enhancedAIService.getAPIStatus();
    results.enhancedService = {
      available: status.summary.imageProviders > 0,
      providers: status.providers,
      error: null,
    };
  } catch (error) {
    results.enhancedService = {
      available: false,
      error: error.message,
    };
  }

  try {
    const legacyResult = await aiService.generateCourseImage(testPrompt);
    results.legacyService = {
      available: legacyResult.success,
      provider: 'deepai',
      error: legacyResult.success ? null : legacyResult.error,
    };
  } catch (error) {
    results.legacyService = {
      available: false,
      error: error.message,
    };
  }

  return results;
}
