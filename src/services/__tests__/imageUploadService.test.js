// Simple test file for image upload service
// This is a basic test to verify the service structure

import { uploadImage } from '../imageUploadService';

// Mock axios for testing
jest.mock('axios', () => ({
  post: jest.fn(),
}));

describe('ImageUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should validate file types correctly', async () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await expect(uploadImage(invalidFile)).rejects.toThrow('Please upload only JPG, PNG, GIF, or WebP images');
  });

  test('should validate file size correctly', async () => {
    // Create a mock file that's too large (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    await expect(uploadImage(largeFile)).rejects.toThrow('Image size should be less than 5MB');
  });

  test('should handle successful upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      data: {
        success: true,
        data: {
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 4
        },
        message: 'Upload successful'
      }
    };

    const axios = require('axios');
    axios.post.mockResolvedValue(mockResponse);

    const result = await uploadImage(mockFile);
    
    expect(result.success).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(axios.post).toHaveBeenCalledWith(
      'https://creditor-backend-ceds.onrender.com/api/resource/upload-resource',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      })
    );
  });
});
