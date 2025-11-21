// CORS Proxy Service for handling restricted image URLs
// Provides multiple methods to work around CORS restrictions

/**
 * Convert image URL to base64 data URL using canvas
 * This method works for images that can be loaded in an img element
 * @param {string} imageUrl - The image URL to convert
 * @returns {Promise<string>} Base64 data URL
 */
export async function convertImageToDataUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Try to enable CORS

    img.onload = function () {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        reject(
          new Error('Failed to convert image to canvas: ' + error.message)
        );
      }
    };

    img.onerror = function () {
      reject(new Error('Failed to load image'));
    };

    // Try loading the image
    img.src = imageUrl;
  });
}

/**
 * Convert data URL to File object for upload
 * @param {string} dataUrl - Base64 data URL
 * @param {string} fileName - Name for the file
 * @returns {File} File object ready for upload
 */
export function dataUrlToFile(dataUrl, fileName = 'image.png') {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}

/**
 * Attempt to download and convert image using multiple methods
 * @param {string} imageUrl - The image URL to process
 * @param {string} fileName - Desired file name
 * @returns {Promise<File>} File object ready for upload
 */
export async function downloadImageWithCorsWorkaround(
  imageUrl,
  fileName = `image-${Date.now()}.png`
) {
  console.log('🔄 Attempting CORS workaround for:', imageUrl);

  // Special handling for OpenAI blob storage URLs
  const isOpenAIBlob = imageUrl.includes(
    'oaidalleapiprodscus.blob.core.windows.net'
  );
  if (isOpenAIBlob) {
    console.log(
      '🎯 Detected OpenAI blob storage URL, using specialized approach'
    );
  }

  // Method 1: Try direct fetch with different modes
  const fetchMethods = [
    { mode: 'cors', credentials: 'omit' },
    { mode: 'no-cors' },
    { mode: 'cors', credentials: 'include' },
  ];

  for (const options of fetchMethods) {
    try {
      console.log(`🔄 Trying fetch with mode: ${options.mode}`);
      const response = await fetch(imageUrl, options);

      if (response.ok || response.type === 'opaque') {
        const blob = await response.blob();
        if (blob.size > 0) {
          console.log('✅ Direct fetch successful');
          return new File([blob], fileName, { type: 'image/png' });
        }
      }
    } catch (error) {
      console.log(`❌ Fetch method ${options.mode} failed:`, error.message);
    }
  }

  // Method 2: Try canvas conversion (skip for OpenAI blob storage due to CORS)
  if (!isOpenAIBlob) {
    try {
      console.log('🔄 Trying canvas conversion...');
      const dataUrl = await convertImageToDataUrl(imageUrl);
      const file = dataUrlToFile(dataUrl, fileName);
      console.log('✅ Canvas conversion successful');
      return file;
    } catch (error) {
      console.log('❌ Canvas conversion failed:', error.message);
    }
  } else {
    console.log(
      '⏭️ Skipping canvas conversion for OpenAI blob storage (CORS restricted)'
    );
  }

  // Method 3: Create a proxy using public CORS proxies (specifically for OpenAI blob storage)
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  for (const proxy of corsProxies) {
    try {
      console.log(`🔄 Trying CORS proxy: ${proxy}`);
      const proxyUrl = proxy + encodeURIComponent(imageUrl);

      // Add timeout for proxy requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'image/*,*/*',
          'User-Agent': 'Mozilla/5.0 (compatible; ImageDownloader/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 0) {
          console.log(
            `✅ CORS proxy successful! Downloaded ${(blob.size / 1024).toFixed(2)} KB`
          );
          return new File([blob], fileName, { type: blob.type || 'image/png' });
        } else {
          console.log(`❌ CORS proxy ${proxy} returned empty blob`);
        }
      } else {
        console.log(
          `❌ CORS proxy ${proxy} returned status: ${response.status}`
        );
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ CORS proxy ${proxy} timed out`);
      } else {
        console.log(`❌ CORS proxy ${proxy} failed:`, error.message);
      }
    }
  }

  throw new Error('All CORS workaround methods failed');
}

/**
 * Smart image processing that tries multiple approaches
 * @param {string} imageUrl - The image URL to process
 * @param {Object} uploadOptions - Options for upload service
 * @returns {Promise<Object>} Upload result or error info
 */
export async function smartImageUpload(imageUrl, uploadOptions = {}) {
  try {
    // Import upload service dynamically to avoid circular dependencies
    const { uploadImage } = await import('./imageUploadService');

    console.log(
      '🎯 Starting smart image upload for URL length:',
      imageUrl.length
    );

    // If URL is short enough, return it as-is
    if (imageUrl.length <= 300) {
      console.log('✅ URL is short enough, no upload needed');
      return {
        success: true,
        imageUrl: imageUrl,
        uploadedToS3: false,
        method: 'direct-url',
      };
    }

    // Try to download and upload
    const fileName = `smart-upload-${Date.now()}.png`;
    const file = await downloadImageWithCorsWorkaround(imageUrl, fileName);

    const uploadResult = await uploadImage(file, {
      folder: 'course-thumbnails',
      public: true,
      type: 'image',
      ...uploadOptions,
    });

    if (uploadResult?.success) {
      console.log('✅ Smart upload successful');
      return {
        ...uploadResult,
        uploadedToS3: true,
        method: 'cors-workaround',
      };
    } else {
      throw new Error('Upload service failed');
    }
  } catch (error) {
    console.warn('❌ Smart image upload failed:', error.message);
    return {
      success: false,
      error: error.message,
      imageUrl: imageUrl, // Return original URL as fallback
      uploadedToS3: false,
      method: 'fallback',
    };
  }
}

export default {
  convertImageToDataUrl,
  dataUrlToFile,
  downloadImageWithCorsWorkaround,
  smartImageUpload,
};
