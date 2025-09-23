// AI Course Creation Test Utilities
// Comprehensive testing functions for the new backend-integrated AI course system

import { 
  generateAICourseOutline, 
  createCompleteAICourse, 
  generateAndUploadCourseImage 
} from '../services/aiCourseService';

/**
 * Test the complete AI course creation flow
 * @param {Object} testCourseData - Test course data
 * @returns {Promise<Object>} Test results
 */
export async function testCompleteAICourseFlow(testCourseData = null) {
  const testData = testCourseData || {
    title: 'Test AI Course - JavaScript Fundamentals',
    description: 'A comprehensive course covering JavaScript basics and advanced concepts',
    subject: 'Programming',
    targetAudience: 'Beginner developers',
    difficulty: 'beginner',
    duration: '6 weeks',
    learningObjectives: 'Learn JavaScript syntax, DOM manipulation, and modern ES6+ features'
  };

  const testResults = {
    startTime: new Date().toISOString(),
    testData,
    steps: [],
    success: false,
    error: null,
    finalResult: null
  };

  try {
    console.log('🧪 Starting AI Course Creation Flow Test...');
    
    // Step 1: Test AI Course Outline Generation
    console.log('📋 Step 1: Testing AI course outline generation...');
    testResults.steps.push({ step: 1, name: 'AI Outline Generation', status: 'running' });
    
    const outlineResult = await generateAICourseOutline(testData);
    
    if (outlineResult.success) {
      testResults.steps[0].status = 'completed';
      testResults.steps[0].result = {
        modulesGenerated: outlineResult.data.modules?.length || 0,
        hasLessons: outlineResult.data.modules?.some(m => m.lessons?.length > 0)
      };
      console.log('✅ Step 1 completed: Generated outline with', outlineResult.data.modules?.length, 'modules');
    } else {
      throw new Error(`Outline generation failed: ${outlineResult.error}`);
    }

    // Step 2: Test Complete AI Course Creation
    console.log('🏗️ Step 2: Testing complete AI course creation...');
    testResults.steps.push({ step: 2, name: 'Complete Course Creation', status: 'running' });
    
    const courseResult = await createCompleteAICourse(testData);
    
    if (courseResult.success) {
      testResults.steps[1].status = 'completed';
      testResults.steps[1].result = {
        courseId: courseResult.data.course?.data?.id || courseResult.data.course?.id,
        totalModules: courseResult.data.totalModules,
        totalLessons: courseResult.data.totalLessons,
        modulesCreated: courseResult.data.modules?.length || 0,
        lessonsCreated: courseResult.data.lessons?.length || 0
      };
      console.log('✅ Step 2 completed: Created course with', courseResult.data.totalModules, 'modules and', courseResult.data.totalLessons, 'lessons');
    } else {
      throw new Error(`Course creation failed: ${courseResult.error}`);
    }

    // Step 3: Test AI Image Generation and S3 Upload
    console.log('🎨 Step 3: Testing AI image generation and S3 upload...');
    testResults.steps.push({ step: 3, name: 'AI Image Generation & S3 Upload', status: 'running' });
    
    const imagePrompt = `Professional course thumbnail for "${testData.title}" - modern, educational design`;
    const imageResult = await generateAndUploadCourseImage(imagePrompt, {
      style: 'realistic',
      size: '1024x1024'
    });
    
    if (imageResult.success) {
      testResults.steps[2].status = 'completed';
      testResults.steps[2].result = {
        originalUrl: imageResult.data.originalUrl,
        s3Url: imageResult.data.s3Url,
        fileName: imageResult.data.fileName,
        fileSize: imageResult.data.fileSize
      };
      console.log('✅ Step 3 completed: Generated image and uploaded to S3');
    } else {
      throw new Error(`Image generation failed: ${imageResult.error}`);
    }

    // Test completed successfully
    testResults.success = true;
    testResults.finalResult = {
      courseCreated: courseResult.data,
      imageGenerated: imageResult.data,
      outlineGenerated: outlineResult.data
    };
    
    testResults.endTime = new Date().toISOString();
    testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
    
    console.log('🎉 AI Course Creation Flow Test PASSED!');
    console.log('📊 Test Summary:', {
      duration: `${testResults.duration}ms`,
      course: testResults.steps[1].result,
      image: testResults.steps[2].result
    });
    
    return testResults;

  } catch (error) {
    testResults.success = false;
    testResults.error = error.message;
    testResults.endTime = new Date().toISOString();
    testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
    
    // Mark current step as failed
    const currentStep = testResults.steps.find(s => s.status === 'running');
    if (currentStep) {
      currentStep.status = 'failed';
      currentStep.error = error.message;
    }
    
    console.error('❌ AI Course Creation Flow Test FAILED:', error.message);
    console.error('📊 Test Results:', testResults);
    
    return testResults;
  }
}

/**
 * Test individual AI service functions
 * @returns {Promise<Object>} Individual test results
 */
export async function testIndividualAIServices() {
  const results = {
    outlineGeneration: { tested: false, success: false, error: null },
    imageGeneration: { tested: false, success: false, error: null },
    courseCreation: { tested: false, success: false, error: null }
  };

  // Test 1: Outline Generation
  try {
    console.log('🧪 Testing AI outline generation...');
    const outlineResult = await generateAICourseOutline({
      title: 'Test Course',
      subject: 'Testing',
      description: 'A test course for validation'
    });
    
    results.outlineGeneration.tested = true;
    results.outlineGeneration.success = outlineResult.success;
    results.outlineGeneration.modulesCount = outlineResult.data?.modules?.length || 0;
    
    if (!outlineResult.success) {
      results.outlineGeneration.error = outlineResult.error;
    }
  } catch (error) {
    results.outlineGeneration.tested = true;
    results.outlineGeneration.error = error.message;
  }

  // Test 2: Image Generation
  try {
    console.log('🧪 Testing AI image generation...');
    const imageResult = await generateAndUploadCourseImage('Test course thumbnail', {
      style: 'minimal',
      size: '512x512'
    });
    
    results.imageGeneration.tested = true;
    results.imageGeneration.success = imageResult.success;
    results.imageGeneration.s3Url = imageResult.data?.s3Url;
    
    if (!imageResult.success) {
      results.imageGeneration.error = imageResult.error;
    }
  } catch (error) {
    results.imageGeneration.tested = true;
    results.imageGeneration.error = error.message;
  }

  // Test 3: Complete Course Creation (minimal test)
  try {
    console.log('🧪 Testing complete course creation...');
    const courseResult = await createCompleteAICourse({
      title: 'Minimal Test Course',
      description: 'Minimal test for course creation',
      subject: 'Testing'
    });
    
    results.courseCreation.tested = true;
    results.courseCreation.success = courseResult.success;
    results.courseCreation.courseId = courseResult.data?.course?.data?.id;
    results.courseCreation.totalModules = courseResult.data?.totalModules;
    results.courseCreation.totalLessons = courseResult.data?.totalLessons;
    
    if (!courseResult.success) {
      results.courseCreation.error = courseResult.error;
    }
  } catch (error) {
    results.courseCreation.tested = true;
    results.courseCreation.error = error.message;
  }

  return results;
}

/**
 * Validate API endpoints are accessible
 * @returns {Promise<Object>} API validation results
 */
export async function validateAPIEndpoints() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const endpoints = [
    { name: 'Course Creation', url: `${API_BASE}/api/course/createCourse`, method: 'POST' },
    { name: 'Module Creation', url: `${API_BASE}/api/course/1/modules/create`, method: 'POST' },
    { name: 'Lesson Creation', url: `${API_BASE}/api/course/1/modules/1/lesson/create-lesson`, method: 'POST' },
    { name: 'Resource Upload', url: `${API_BASE}/api/resource/upload-resource`, method: 'POST' }
  ];

  const results = {
    baseUrl: API_BASE,
    endpoints: [],
    allAccessible: true
  };

  for (const endpoint of endpoints) {
    try {
      // Just check if endpoint exists (will return method not allowed or auth error, not 404)
      const response = await fetch(endpoint.url, { method: 'HEAD' });
      
      results.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        accessible: response.status !== 404,
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.status === 404) {
        results.allAccessible = false;
      }
    } catch (error) {
      results.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        accessible: false,
        error: error.message
      });
      results.allAccessible = false;
    }
  }

  return results;
}

/**
 * Generate a comprehensive test report
 * @returns {Promise<Object>} Complete test report
 */
export async function generateTestReport() {
  console.log('📋 Generating comprehensive AI course system test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      hasApiKey: !!import.meta.env.VITE_BYTEZ_KEY,
      nodeEnv: import.meta.env.NODE_ENV
    },
    tests: {}
  };

  try {
    // Test 1: API Endpoint Validation
    console.log('🔍 Testing API endpoint accessibility...');
    report.tests.apiValidation = await validateAPIEndpoints();

    // Test 2: Individual Service Tests
    console.log('🧪 Testing individual AI services...');
    report.tests.individualServices = await testIndividualAIServices();

    // Test 3: Complete Flow Test (only if individual tests pass)
    const servicesWorking = Object.values(report.tests.individualServices)
      .some(service => service.success);
    
    if (servicesWorking) {
      console.log('🚀 Testing complete AI course creation flow...');
      report.tests.completeFlow = await testCompleteAICourseFlow();
    } else {
      report.tests.completeFlow = {
        skipped: true,
        reason: 'Individual services not working'
      };
    }

    // Generate summary
    report.summary = {
      apiEndpointsAccessible: report.tests.apiValidation.allAccessible,
      individualServicesWorking: servicesWorking,
      completeFlowWorking: report.tests.completeFlow?.success || false,
      overallStatus: report.tests.completeFlow?.success ? 'PASS' : 'FAIL'
    };

  } catch (error) {
    report.error = error.message;
    report.summary = {
      overallStatus: 'ERROR',
      error: error.message
    };
  }

  console.log('📊 Test Report Generated:', report.summary);
  return report;
}

export default {
  testCompleteAICourseFlow,
  testIndividualAIServices,
  validateAPIEndpoints,
  generateTestReport
};
