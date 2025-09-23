// Test utility to check if the upload endpoint is working
export async function testUploadEndpoint() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const uploadUrl = `${API_BASE}/api/resource/upload-resource`;
  
  console.log('🔍 Testing upload endpoint:', uploadUrl);
  
  try {
    // Test with HEAD request first to check if endpoint exists
    const headResponse = await fetch(uploadUrl, { 
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    console.log('HEAD response:', {
      status: headResponse.status,
      statusText: headResponse.statusText,
      headers: Object.fromEntries(headResponse.headers.entries())
    });
    
    // Test with OPTIONS to check allowed methods
    const optionsResponse = await fetch(uploadUrl, { 
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    console.log('OPTIONS response:', {
      status: optionsResponse.status,
      statusText: optionsResponse.statusText,
      headers: Object.fromEntries(optionsResponse.headers.entries())
    });
    
    // Try a minimal POST request to see what happens
    const formData = new FormData();
    formData.append('test', 'true');
    
    const postResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: formData
    });
    
    const responseText = await postResponse.text();
    console.log('POST response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      body: responseText,
      headers: Object.fromEntries(postResponse.headers.entries())
    });
    
    return {
      endpointExists: postResponse.status !== 404,
      requiresAuth: postResponse.status === 401,
      acceptsPost: postResponse.status !== 405,
      response: {
        status: postResponse.status,
        statusText: postResponse.statusText,
        body: responseText
      }
    };
    
  } catch (error) {
    console.error('❌ Upload endpoint test failed:', error);
    return {
      endpointExists: false,
      error: error.message
    };
  }
}

// Test the current image upload service
export async function testImageUploadService() {
  try {
    // Create a small test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        try {
          const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
          
          // Import and test the upload service
          const { uploadImage } = await import('../services/imageUploadService');
          
          console.log('🧪 Testing image upload service with test file...');
          const result = await uploadImage(testFile, {
            folder: 'test-uploads',
            public: true,
            type: 'image'
          });
          
          console.log('✅ Image upload test result:', result);
          resolve({
            success: true,
            result: result
          });
          
        } catch (error) {
          console.error('❌ Image upload test failed:', error);
          resolve({
            success: false,
            error: error.message
          });
        }
      }, 'image/png');
    });
    
  } catch (error) {
    console.error('❌ Failed to create test image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  testUploadEndpoint,
  testImageUploadService
};
