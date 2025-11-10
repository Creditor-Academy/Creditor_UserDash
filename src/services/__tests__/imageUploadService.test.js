// Simple test file for image upload service
// This is a basic test to verify the service structure

import { vi } from 'vitest';
import { uploadImage } from '../imageUploadService';

// Mock tokenService
vi.mock('../tokenService', () => ({
  getAccessToken: vi.fn(() => null),
  clearAccessToken: vi.fn(),
}));

// Mock apiClient
vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock axios for testing
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: { timeout: 30000 },
    })),
    post: vi.fn(),
  },
  create: vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { timeout: 30000 },
  })),
  post: vi.fn(),
}));

describe('ImageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should validate file types correctly', async () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(uploadImage(invalidFile)).rejects.toThrow(
      'Please upload only JPG, PNG, GIF, or WebP images'
    );
  });

  test('should validate file size correctly', async () => {
    // Create a mock file that's too large (simulate 60MB file without actually creating large content)
    const largeFile = new File(['test'], 'large.jpg', {
      type: 'image/jpeg',
    });

    // Mock the size property to simulate a large file
    Object.defineProperty(largeFile, 'size', {
      value: 60 * 1024 * 1024, // 60MB
      writable: false,
    });

    await expect(uploadImage(largeFile)).rejects.toThrow(
      'Image size should be less than 50MB'
    );
  });

  test('should handle successful upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      data: {
        success: true,
        data: {
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 4,
        },
        message: 'Upload successful',
      },
    };

    // Mock the api client directly
    const apiClient = await import('../apiClient');
    apiClient.default.post = vi.fn().mockResolvedValue(mockResponse);

    const result = await uploadImage(mockFile);

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(apiClient.default.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/resource/upload-resource'),
      expect.any(FormData),
      expect.objectContaining({
        timeout: 300000,
        withCredentials: true,
      })
    );
  });
});
