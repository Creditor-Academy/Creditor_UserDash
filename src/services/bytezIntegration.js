// Bytez Integration Service for AI Course Generation
import bytezService from './bytezService.js';

/**
 * Generate course outline using Bytez API with multi-key rotation
 * @param {Object} courseData - Course creation data
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateWithBytez(courseData) {
  try {
    console.log('🚀 Using enhanced BytezService for course generation...');
    
    // Use the new BytezService
    const result = await bytezService.generateCourseOutline(courseData);
    
    if (result.success) {
      return result;
    }
    
    // If BytezService fails, fall back to legacy method
    console.log('🔄 BytezService failed, trying legacy method...');
    return await generateWithBytezLegacy(courseData);
    
  } catch (error) {
    console.error('❌ Enhanced Bytez generation failed:', error);
  }
}

// This file has been removed as part of Bytez cleanup
