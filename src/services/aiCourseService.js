// AI Course Service for handling AI-powered course creation with deployed backend integration
// Import required services and utilities
import { createAICourse, createModule, createLesson, updateLessonContent } from './courseService';
import { uploadImage } from './imageUploadService';
import aiService from './aiService';
import enhancedAIService from './enhancedAIService';
import { generateAndUploadCourseImage as enhancedGenerateImage } from './enhancedImageService';
import qwenGuardService from './qwenGuardService';

// API configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Generate AI course outline with content moderation using Qwen3Guard
 * @param {Object} courseData - Course creation data
 * @param {Object} options - Generation options including moderation settings
 * @returns {Promise<Object>} Generated course structure with safety information
 */
export async function generateSafeCourseOutline(courseData, options = {}) {
  try {
    console.log('🛡️ Generating safe AI course outline with Qwen3Guard moderation:', courseData.title);
    
    // Step 1: Moderate the course topic/prompt first
    const promptModeration = await qwenGuardService.moderatePrompt(
      `Create an educational course about: ${courseData.title}. Subject: ${courseData.subject || 'General'}. Description: ${courseData.description || 'Educational content'}`
    );
    
    console.log('🛡️ Prompt moderation result:', promptModeration.data);
    
    // Check if the prompt is safe to proceed
    if (promptModeration.success && promptModeration.data.safety === 'Unsafe') {
      console.warn('⚠️ Course topic flagged as unsafe by Qwen3Guard - proceeding with generation but flagging content');
      // Don't stop generation, just flag it for review
    }
    
    // Step 2: Generate course outline using existing system
    const outlineResult = await generateAICourseOutline(courseData);
    
    if (!outlineResult.success) {
      console.warn('🔄 AI generation failed, using fallback with moderation results');
      // Generate fallback course structure
      const fallbackStructure = {
        course_title: courseData.title,
        title: courseData.title,
        subject: courseData.subject || courseData.title,
        modules: generateFallbackModules(courseData),
        generatedBy: 'fallback-with-moderation'
      };
      
      return {
        success: true,
        data: {
          ...fallbackStructure,
          moderation: {
            overall: {
              safe: promptModeration.data.safety !== 'Unsafe',
              timestamp: new Date().toISOString()
            },
            prompt: promptModeration.data,
            response: { safety: 'Safe', categories: [], refusal: null },
            modules: []
          }
        },
        provider: 'fallback-with-moderation',
        moderationEnabled: true
      };
    }
    
    // Step 3: Moderate the generated course content
    const courseContent = JSON.stringify(outlineResult.data);
    const responseModeration = await qwenGuardService.moderateResponse(
      `Create an educational course about: ${courseData.title}`,
      courseContent
    );
    
    console.log('🛡️ Response moderation result:', responseModeration.data);
    
    // Step 4: Comprehensive content moderation for each module
    const modulesModerationResults = [];
    if (outlineResult.data.modules) {
      for (const module of outlineResult.data.modules) {
        const moduleContent = `${module.title || module.module_title}: ${module.description || ''}`;
        const moduleModerationResult = await qwenGuardService.moderateCourseContent(
          module.title || module.module_title,
          moduleContent
        );
        
        if (moduleModerationResult.success) {
          modulesModerationResults.push(moduleModerationResult.data);
        }
      }
    }
    
    // Step 5: Determine overall safety
    const overallSafe = promptModeration.data.safety === 'Safe' && 
                       responseModeration.data.safety === 'Safe' &&
                       modulesModerationResults.every(result => result.overall.safe);
    
    return {
      success: true,
      data: {
        ...outlineResult.data,
        moderation: {
          overall: {
            safe: overallSafe,
            timestamp: new Date().toISOString()
          },
          prompt: promptModeration.data,
          response: responseModeration.data,
          modules: modulesModerationResults
        }
      },
      provider: outlineResult.provider,
      moderationEnabled: true
    };
    
  } catch (error) {
    console.error('❌ Safe course outline generation failed:', error);
    return {
      success: false,
      error: error.message,
      data: null,
      moderationEnabled: true
    };
  }
}

/**
 * Generate AI course outline with modules and lessons using multi-API system
 * @param {Object} courseData - Course creation data
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateAICourseOutline(courseData) {
  try {
    console.log('🤖 Generating AI course outline for:', courseData.title);
    
    // Try enhanced AI service first (includes HuggingFace, OpenAI, etc.)
    try {
      console.log('🚀 Using Enhanced AI Service with multi-provider support...');
      
      const aiResult = await enhancedAIService.generateCourseOutline(courseData);
      
      if (aiResult.success && aiResult.data) {
        console.log(`✅ Course outline generation successful with ${aiResult.provider}`);
        
        // Transform the data to match expected format
        const courseStructure = {
          course_title: aiResult.data.course_title || courseData.title,
          title: aiResult.data.course_title || courseData.title,
          subject: courseData.subject || courseData.title,
          modules: aiResult.data.modules || [],
          generatedBy: aiResult.provider
        };

        return {
          success: true,
          data: courseStructure,
          provider: aiResult.provider
        };
      } else {
        console.warn('Enhanced AI generation failed, trying legacy methods:', aiResult.error);
        throw new Error(aiResult.error || 'Enhanced AI generation failed');
      }
      
    } catch (enhancedError) {
      console.warn('🔄 Enhanced AI failed, trying legacy OpenAI service:', enhancedError.message);
      
      // Fallback to legacy AI service (OpenAI only)
      try {
        const aiResult = await aiService.generateCourseOutline(courseData);
        
        if (aiResult.success && aiResult.data) {
          console.log('✅ Legacy OpenAI course outline generation successful');
          
          const courseStructure = {
            course_title: aiResult.data.course_title || courseData.title,
            title: aiResult.data.course_title || courseData.title,
            subject: courseData.subject || courseData.title,
            modules: aiResult.data.modules || [],
            generatedBy: 'openai-legacy'
          };

          return {
            success: true,
            data: courseStructure,
            provider: 'openai-legacy'
          };
        } else {
          throw new Error(aiResult.error || 'Legacy OpenAI generation failed');
        }
      } catch (legacyError) {
        console.warn('🔄 Legacy OpenAI failed, using structured fallback:', legacyError.message);
      }
      
      // Final fallback to structured generation
      console.log('📋 Using structured fallback generation...');
      const courseStructure = {
        course_title: courseData.title,
        title: courseData.title,
        subject: courseData.subject || courseData.title,
        modules: generateFallbackModules(courseData),
        generatedBy: 'fallback'
      };

      // Enhance first 1-2 modules with detailed lessons
      courseStructure.modules = await enhanceModulesWithLessons(courseStructure.modules, courseData);

      return {
        success: true,
        data: courseStructure,
        provider: 'fallback'
      };
    }

  } catch (error) {
    console.error('❌ AI course outline generation failed:', error);
    
    // Return fallback structure
    return {
      success: false,
      data: {
        course_title: courseData.title,
        title: courseData.title,
        subject: courseData.subject,
        modules: generateFallbackModules(courseData)
      },
      error: error.message
    };
  }
}

/**
 * Generate fallback course modules structure
 */
function generateFallbackModules(courseData) {
  const subject = courseData.subject || courseData.title;
  console.log('📚 Generating fallback modules for subject:', subject);
  
  const modules = [
    {
      id: 1,
      title: `Introduction to ${subject}`,
      module_title: `Introduction to ${subject}`,
      description: `Foundational concepts and overview of ${subject}`,
      lessons: [
        {
          id: 1,
          title: `What is ${subject}?`,
          lesson_title: `What is ${subject}?`,
          description: `Understanding the basics and core concepts`,
          content: '',
          duration: '15 min'
        },
        {
          id: 2,
          title: `Why Learn ${subject}?`,
          lesson_title: `Why Learn ${subject}?`,
          description: `Benefits and real-world applications`,
          content: '',
          duration: '10 min'
        },
        {
          id: 3,
          title: 'Getting Started',
          lesson_title: 'Getting Started',
          description: 'Setting up your learning environment',
          content: '',
          duration: '20 min'
        }
      ]
    },
    {
      id: 2,
      title: `${subject} Fundamentals`,
      module_title: `${subject} Fundamentals`,
      description: `Core principles and essential knowledge`,
      lessons: [
        {
          id: 4,
          title: 'Key Concepts',
          lesson_title: 'Key Concepts',
          description: 'Essential terminology and principles',
          content: '',
          duration: '25 min'
        },
        {
          id: 5,
          title: 'Basic Techniques',
          lesson_title: 'Basic Techniques',
          description: 'Fundamental methods and approaches',
          content: '',
          duration: '30 min'
        }
      ]
    },
    {
      id: 3,
      title: `Practical ${subject}`,
      module_title: `Practical ${subject}`,
      description: `Hands-on experience and real-world applications`,
      lessons: [
        {
          id: 6,
          title: 'Real-world Examples',
          lesson_title: 'Real-world Examples',
          description: 'Practical applications and case studies',
          content: '',
          duration: '35 min'
        }
      ]
    },
    {
      id: 4,
      title: `Advanced ${subject}`,
      module_title: `Advanced ${subject}`,
      description: `Expert-level concepts and advanced techniques`,
      lessons: [
        {
          id: 7,
          title: 'Expert Techniques',
          lesson_title: 'Expert Techniques',
          description: 'Advanced methods and best practices',
          content: '',
          duration: '40 min'
        }
      ]
    }
  ];
  
  console.log(`📚 Generated ${modules.length} fallback modules:`, modules.map(m => m.module_title));
  return modules;
}

/**
 * Enhance modules with detailed lessons using AI
 */
async function enhanceModulesWithLessons(modules, courseData) {
  try {
    // AI enhancement removed - Bytez API no longer used
    // Modules will use fallback lesson structure
    return modules;
  } catch (error) {
    console.warn('Could not enhance modules with AI lessons:', error);
    return modules;
  }
}

/**
 * Parse lessons from curriculum text
 */
function parseLessonsFromCurriculum(curriculum, moduleId) {
  const lessons = [];
  const lines = curriculum.split('\n').filter(line => line.trim());
  
  let lessonId = (moduleId - 1) * 10 + 1;
  
  for (const line of lines) {
    if (line.includes('lesson') || line.includes('topic') || line.includes('-')) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 5) {
        lessons.push({
          id: lessonId++,
          title: cleanLine,
          description: `Learn about ${cleanLine.toLowerCase()}`,
          content: '',
          duration: '20 min'
        });
      }
    }
  }
  
  // Ensure at least 3 lessons per module
  while (lessons.length < 3) {
    lessons.push({
      id: lessonId++,
      title: `Lesson ${lessons.length + 1}`,
      description: 'Additional learning content',
      content: '',
      duration: '15 min'
    });
  }
  
  return lessons.slice(0, 5); // Max 5 lessons per module
}

/**
 * Validate course data before creation
 * @param {Object} courseData - Course data to validate
 * @returns {Object} Validation result
 */
function validateCourseData(courseData) {
  const errors = [];
  
  if (!courseData.title?.trim()) {
    errors.push('Course title is required');
  }
  
  if (!courseData.description?.trim()) {
    errors.push('Course description is required');
  }
  
  if (courseData.title?.length > 200) {
    errors.push('Course title must be less than 200 characters');
  }
  
  if (courseData.description?.length > 2000) {
    errors.push('Course description must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a complete AI course using deployed backend APIs with comprehensive error handling
 * @param {Object} courseData - Course creation data
 * @returns {Promise<Object>} Created course with modules and lessons
 */
export async function createCompleteAICourse(courseData) {
  // Validate input data
  const validation = validateCourseData(courseData);
  if (!validation.isValid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
      data: null
    };
  }

  try {
    console.log('🚀 Creating complete AI course:', courseData.title);
    
    // Step 1: Generate AI course outline with fallback
    let courseStructure;
    try {
      console.log('📋 Step 1: Generating AI course outline...');
      const outlineResponse = await generateAICourseOutline(courseData);
      if (!outlineResponse.success) {
        console.warn('AI outline generation failed, using fallback structure');
        courseStructure = {
          title: courseData.title,
          subject: courseData.subject || courseData.title,
          modules: generateFallbackModules(courseData)
        };
      } else {
        courseStructure = outlineResponse.data;
      }
    } catch (outlineError) {
      console.warn('AI outline generation error, using fallback:', outlineError.message);
      courseStructure = {
        title: courseData.title,
        subject: courseData.subject || courseData.title,
        modules: generateFallbackModules(courseData)
      };
    }
    
    // Step 2: Create the course using deployed backend API with retry logic
    let createdCourse;
    let courseId;
    
    try {
      console.log('🏗️ Step 2: Creating course via backend API...');
      
      const coursePayload = {
        title: courseStructure.title,
        description: courseData.description,
        subject: courseStructure.subject,
        objectives: courseData.learningObjectives,
        duration: courseData.duration,
        max_students: courseData.max_students,
        price: courseData.price || '0',
        thumbnail: courseData.thumbnail
      };
      
      // Retry logic for course creation
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          createdCourse = await createAICourse(coursePayload);
          courseId = createdCourse.data?.id || createdCourse.id;
          
          if (courseId) {
            console.log('✅ Course created successfully:', courseId);
            break;
          } else {
            throw new Error('No course ID returned from API');
          }
        } catch (courseError) {
          retryCount++;
          console.warn(`Course creation attempt ${retryCount} failed:`, courseError.message);
          
          if (retryCount >= maxRetries) {
            throw new Error(`Course creation failed after ${maxRetries} attempts: ${courseError.message}`);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (courseCreationError) {
      throw new Error(`Course creation failed: ${courseCreationError.message}`);
    }
    
    // Step 3: Create modules using deployed backend API with progress tracking
    console.log('📚 Step 3: Creating modules and lessons...');
    const createdModules = [];
    const moduleErrors = [];
    
    // Add progress callback if provided
    const updateProgress = (message) => {
      console.log(`📊 Progress: ${message}`);
    };
    
    for (let i = 0; i < courseStructure.modules.length; i++) {
      const moduleData = courseStructure.modules[i];
      
      try {
        console.log(`📖 Creating module ${i + 1}/${courseStructure.modules.length}: ${moduleData.title || moduleData.module_title}`);
        updateProgress(`Creating module ${i + 1} of ${courseStructure.modules.length}: ${moduleData.title || moduleData.module_title}`);
        
        const modulePayload = {
          title: moduleData.title || moduleData.module_title,
          description: moduleData.description || `${moduleData.title || moduleData.module_title} module content`,
          order: i + 1,
          estimated_duration: 60,
          module_status: 'PUBLISHED',
          thumbnail: moduleData.thumbnail || 'AI generated module thumbnail',
          price: 0 // Backend expects number, matching manual creation
        };
        
        console.log('📋 Module payload being sent:', JSON.stringify(modulePayload, null, 2));
        
        // Retry logic for module creation
        let moduleRetryCount = 0;
        const maxModuleRetries = 2;
        let createdModule;
        
        while (moduleRetryCount < maxModuleRetries) {
          try {
            createdModule = await createModule(courseId, modulePayload);
            break;
          } catch (moduleError) {
            moduleRetryCount++;
            if (moduleRetryCount >= maxModuleRetries) {
              throw moduleError;
            }
            console.warn(`Module creation retry ${moduleRetryCount} for: ${moduleData.title || moduleData.module_title}`);
            await new Promise(resolve => setTimeout(resolve, 500 * moduleRetryCount));
          }
        }
        
        createdModules.push({
          ...createdModule,
          originalLessons: moduleData.lessons || []
        });
        
        console.log(`✅ Module ${i + 1} created successfully:`, moduleData.title || moduleData.module_title);
      } catch (moduleError) {
        console.error(`❌ Failed to create module ${i + 1}:`, moduleError.message);
        moduleErrors.push({
          moduleIndex: i,
          moduleTitle: moduleData.title || moduleData.module_title,
          error: moduleError.message
        });
        
        // Continue with other modules instead of failing completely
        console.log('⚠️ Continuing with remaining modules...');
      }
    }
    
    // Log module creation summary
    console.log(`📊 Module creation summary: ${createdModules.length}/${courseStructure.modules.length} successful`);
    if (moduleErrors.length > 0) {
      console.warn('⚠️ Module creation errors:', moduleErrors);
    }
    
    // Step 4: Create lessons for each module using deployed backend API
    const createdLessons = [];
    const lessonErrors = [];
    
    for (const module of createdModules) {
      const moduleId = module.data?.id || module.id;
      const moduleTitle = module.data?.title || module.title || 'Unknown Module';
      
      if (module.originalLessons && module.originalLessons.length > 0) {
        updateProgress(`Creating ${module.originalLessons.length} lessons for module: ${moduleTitle}`);
        
        for (let j = 0; j < module.originalLessons.length; j++) {
          const lessonData = module.originalLessons[j];
          
          try {
            console.log(`📝 Creating lesson ${j + 1}/${module.originalLessons.length} in module "${moduleTitle}": ${lessonData.title}`);
            
            const lessonPayload = {
              title: lessonData.title || `Lesson ${j + 1}`,
              description: lessonData.description || `Lesson content for ${lessonData.title}`,
              order: j + 1,
              status: 'PUBLISHED',
              content: lessonData.content || '',
              duration: lessonData.duration || '15 min'
            };
            
            // Use enhanced API client instead of fetch for better error handling
            const response = await fetch(`${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`, {
              method: 'POST',
              headers: getAuthHeaders(),
              credentials: 'include',
              body: JSON.stringify(lessonPayload),
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
              throw new Error(`HTTP ${response.status}: ${errorData.message || errorData.errorMessage || 'Failed to create lesson'}`);
            }
            
            const createdLesson = await response.json();
            createdLessons.push(createdLesson);
            
            console.log(`✅ Lesson "${lessonData.title}" created successfully`);
          } catch (lessonError) {
            console.error(`❌ Failed to create lesson "${lessonData.title}":`, lessonError.message);
            lessonErrors.push({
              moduleTitle,
              lessonTitle: lessonData.title,
              error: lessonError.message
            });
            // Continue with other lessons instead of failing completely
          }
        }
      }
    }
    
    // Step 5: Auto-generate lesson content using universalAILessonService
    console.log('📝 Step 5: Auto-generating content for all lessons...');
    const contentGenerationResults = {
      successCount: 0,
      failedCount: 0,
      totalImages: 0,
      totalBlocks: 0,
      errors: []
    };
    
    // Import universalAILessonService dynamically if needed
    const universalAILessonService = await import('./universalAILessonService').then(m => m.default);
    
    // Track generation mode (from courseData options or default to STANDARD)
    const generationMode = courseData.generationMode || 'STANDARD';
    const generationConfig = {
      QUICK: { 
        contentType: 'outline',
        includeImages: false,
        includeAssessments: false,
        includeExamples: false,
        maxTokens: 500
      },
      STANDARD: { 
        contentType: 'comprehensive',
        includeImages: true,
        includeAssessments: true,
        includeExamples: true,
        maxTokens: 1000
      },
      COMPLETE: { 
        contentType: 'comprehensive',
        includeImages: true,
        includeAssessments: true,
        includeExamples: true,
        includeSummary: true,
        maxTokens: 1500
      },
      PREMIUM: { 
        contentType: 'comprehensive',
        includeImages: true,
        includeAssessments: true,
        includeExamples: true,
        includeSummary: true,
        includeInteractive: true,
        maxTokens: 2000
      }
    };
    
    const config = generationConfig[generationMode] || generationConfig.STANDARD;
    console.log(`🎯 Using ${generationMode} generation mode`);
    
    // Process lessons sequentially with progress tracking
    let processedCount = 0;
    for (const createdLesson of createdLessons) {
      processedCount++;
      const lessonId = createdLesson.data?.id || createdLesson.id;
      const lessonTitle = createdLesson.data?.title || createdLesson.title || 'Untitled Lesson';
      
      try {
        console.log(`📚 Generating content for lesson ${processedCount}/${createdLessons.length}: ${lessonTitle}`);
        updateProgress(`Generating content for lesson ${processedCount} of ${createdLessons.length}: ${lessonTitle}`);
        
        // Find module info for this lesson
        const parentModule = createdModules.find(m => {
          const modId = m.data?.id || m.id;
          return createdLesson.module_id === modId || 
                 createdLesson.data?.module_id === modId;
        });
        
        const moduleTitle = parentModule?.data?.title || parentModule?.title || 'Module';
        
        // Generate content blocks using universalAILessonService
        const blocks = await universalAILessonService.generateLessonContent(
          { title: lessonTitle, description: createdLesson.data?.description || createdLesson.description },
          { title: moduleTitle },
          { title: courseData.title },
          {
            contentType: config.contentType,
            maxTokens: config.maxTokens,
            includeIntroduction: true,
            includeLearningObjectives: true,
            includeExamples: config.includeExamples,
            includeAssessments: config.includeAssessments,
            includeSummary: config.includeSummary,
            includeInteractive: config.includeInteractive
          }
        );
        
        // Save generated content to lesson
        await universalAILessonService.saveContentToLesson(lessonId, blocks);
        
        contentGenerationResults.successCount++;
        contentGenerationResults.totalBlocks += blocks.length;
        
        console.log(`✅ Content generated and saved for: ${lessonTitle} (${blocks.length} blocks)`);
        
        // Add delay between lessons to avoid rate limits
        if (processedCount < createdLessons.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (contentError) {
        console.error(`❌ Failed to generate content for "${lessonTitle}":`, contentError.message);
        contentGenerationResults.failedCount++;
        contentGenerationResults.errors.push({
          lessonTitle,
          error: contentError.message
        });
        
        // Generate placeholder content for failed lessons
        try {
          const placeholderBlocks = [{
            id: `placeholder-${Date.now()}`,
            type: 'text',
            content: `This lesson covers ${lessonTitle}. Content will be enhanced soon.`,
            order: 0,
            isPlaceholder: true
          }];
          await universalAILessonService.saveContentToLesson(lessonId, placeholderBlocks);
          console.log(`📋 Placeholder content saved for: ${lessonTitle}`);
        } catch (placeholderError) {
          console.error(`❌ Failed to save placeholder for "${lessonTitle}":`, placeholderError.message);
        }
      }
    }
    
    // Log content generation summary
    console.log(`📊 Content Generation Summary:`);
    console.log(`   ✅ Successful: ${contentGenerationResults.successCount}/${createdLessons.length}`);
    console.log(`   📦 Total Blocks: ${contentGenerationResults.totalBlocks}`);
    if (contentGenerationResults.failedCount > 0) {
      console.warn(`   ❌ Failed: ${contentGenerationResults.failedCount}`);
    }
    
    // Log final summary
    console.log(`📊 Final creation summary:`);
    console.log(`   ✅ Course: Created successfully`);
    console.log(`   📚 Modules: ${createdModules.length}/${courseStructure.modules.length} created`);
    console.log(`   📝 Lessons: ${createdLessons.length} created`);
    console.log(`   📦 Content: ${contentGenerationResults.successCount} lessons with AI-generated content`);
    
    if (moduleErrors.length > 0) {
      console.warn(`   ⚠️ Module errors: ${moduleErrors.length}`);
    }
    if (lessonErrors.length > 0) {
      console.warn(`   ⚠️ Lesson errors: ${lessonErrors.length}`);
    }
    if (contentGenerationResults.failedCount > 0) {
      console.warn(`   ⚠️ Content generation errors: ${contentGenerationResults.failedCount}`);
    }
    
    return {
      success: true,
      data: {
        course: createdCourse,
        modules: createdModules,
        lessons: createdLessons,
        totalModules: createdModules.length,
        totalLessons: createdLessons.length,
        contentGeneration: {
          successCount: contentGenerationResults.successCount,
          failedCount: contentGenerationResults.failedCount,
          totalBlocks: contentGenerationResults.totalBlocks,
          generationMode,
          errors: contentGenerationResults.errors.length > 0 ? contentGenerationResults.errors : undefined
        },
        moduleErrors: moduleErrors.length > 0 ? moduleErrors : undefined,
        lessonErrors: lessonErrors.length > 0 ? lessonErrors : undefined
      }
    };
    
  } catch (error) {
    console.error('❌ Complete AI course creation failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Generate and upload AI course image to S3 (with fallback to direct image generation)
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Uploaded image data with S3 URL or direct image URL
 */
export async function generateAndUploadCourseImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating course image with enhanced multi-API system:', prompt);
    
    // Use the enhanced image generation service
    const result = await enhancedGenerateImage(prompt, options);
    
    if (result.success) {
      console.log(`✅ Enhanced image generation successful with ${result.data.provider}`);
      return result;
    } else {
      console.warn('🔄 Enhanced image generation failed, using legacy method:', result.error);
      
      // Fallback to legacy method
      let imageUrl = null;
      let generationMethod = 'fallback';
      
      try {
        const imageResponse = await aiService.generateCourseImage(prompt, options);
        if (imageResponse.success) {
          imageUrl = imageResponse.data.url;
          generationMethod = 'ai-legacy';
          console.log('✅ Legacy AI image generation successful');
        }
      } catch (imageError) {
        console.warn('🎨 Legacy AI image generation failed, using placeholder:', imageError.message);
      }
      
      // Step 2: If AI generation failed, create a placeholder image URL
      if (!imageUrl) {
        // Create a data URL placeholder image instead of using external services
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Generate a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#7C3AED');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = prompt.substring(0, 30) || 'Course Image';
        const lines = text.match(/.{1,15}/g) || [text];
        
        lines.forEach((line, index) => {
          ctx.fillText(line, 512, 450 + (index * 60));
        });
        
        // Add decorative elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          const radius = Math.random() * 50 + 10;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        imageUrl = canvas.toDataURL('image/png');
        generationMethod = 'canvas-placeholder';
        console.log('📷 Using canvas-generated placeholder image');
      }
      
      // Continue with legacy upload logic
      // Step 3: Try to upload to S3 if upload service is available
      let s3Url = imageUrl; // Default to original URL
      let uploadSuccess = false;
      
      try {
        // Test if we can create a file from the image URL
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `ai-course-image-${Date.now()}.png`, { type: 'image/png' });
          
          // Try to upload to S3
          const uploadResponse = await uploadImage(file, {
            folder: 'course-thumbnails',
            public: true,
            type: 'image'
          });
          
          if (uploadResponse && uploadResponse.imageUrl) {
            s3Url = uploadResponse.imageUrl;
            uploadSuccess = true;
            console.log('✅ S3 upload successful');
          }
        }
      } catch (uploadError) {
        console.warn('📤 S3 upload failed, using direct image URL:', uploadError.message);
      }
      
      return {
        success: true,
        data: {
          originalUrl: imageUrl,
          s3Url: s3Url,
          fileName: `ai-course-image-${Date.now()}.png`,
          fileSize: uploadSuccess ? 'unknown' : 'placeholder',
          prompt: prompt,
          style: options.style,
          generationMethod: generationMethod,
          uploadedToS3: uploadSuccess,
          createdAt: new Date().toISOString()
        }
      };
    }
    
  } catch (error) {
    console.error('❌ Generate and upload course image failed:', error);
    
    // Return a basic data URL placeholder as last resort
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Course Image', 512, 512);
    
    const placeholderDataUrl = canvas.toDataURL('image/png');
    
    return {
      success: false,
      data: {
        originalUrl: placeholderDataUrl,
        s3Url: placeholderDataUrl,
        fileName: 'placeholder-image.png',
        fileSize: 'placeholder',
        prompt: prompt,
        style: options.style,
        generationMethod: 'error-fallback-canvas',
        uploadedToS3: false,
        createdAt: new Date().toISOString()
      },
      error: error.message
    };
  }
}

/**
 * Generate AI images for course content
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated image data
 */
export async function generateCourseImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating course image with Deep AI:', prompt);
    
    // Use our new integrated AI service (Deep AI)
    const aiResult = await aiService.generateCourseImage(prompt, options);
    
    if (aiResult.success && aiResult.data) {
      console.log('✅ Deep AI image generation successful');
      return aiResult;
    } else {
      console.warn('Deep AI generation failed:', aiResult.error);
      return aiResult; // Still return the result with fallback image
    }
    
  } catch (error) {
    console.error('❌ Course image generation failed:', error);
    
    // Return canvas-generated placeholder as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Course Image', 512, 512);
    
    return {
      success: false,
      data: {
        url: canvas.toDataURL('image/png'),
        prompt: prompt,
        style: 'canvas-placeholder',
        size: options.size || '1024x1024',
        createdAt: new Date().toISOString()
      },
      error: error.message
    };
  }
}

/**
 * Summarize content for course lessons
 * @param {string} content - Content to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Object>} Summary data
 */
export async function summarizeContent(content, options = {}) {
  try {
    console.log('📝 Summarizing content for course...');
    
    // Use AIServiceRouter for better text summarization
    const aiServiceRouter = new AIServiceRouter();
    
    // Try to summarize with OpenAI GPT-4o first
    let summary;
    try {
      const prompt = `Summarize the following content in ${options.length || 'medium'} length and format as ${options.type || 'bullet'}:
      
      ${content}`;
      
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 300,
        temperature: 0.3
      });
      
      summary = response;
    } catch (summarizeError) {
      console.warn('OpenAI summarization failed, using fallback:', summarizeError.message);
      
      // Simple fallback summarization (dependency removed)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      
      // Removed the incorrect line: summary = response.summary;
    }
    
    return {
      success: true,
      data: {
        summary: summary,
        originalLength: content.length,
        summaryLength: summary.length,
        type: options.type,
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Content summarization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search and answer questions for course content
 * @param {string} question - Question to answer
 * @param {string} context - Optional context
 * @returns {Promise<Object>} Answer data
 */
export async function searchCourseContent(question, context = '') {
  try {
    console.log('🔍 Searching course content:', question);
    
    // Use AIServiceRouter for better question answering
    const aiServiceRouter = new AIServiceRouter();
    
    // Try to answer with OpenAI GPT-4o first
    let answer;
    try {
      const prompt = `Answer the following question based on the provided context:
      
      Question: ${question}
      
      Context: ${context || 'No specific context provided'}
      
      Provide a clear, educational answer that would be helpful for a student learning this topic.`;
      
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 500,
        temperature: 0.5
      });
      
      answer = response;
    } catch (qaError) {
      console.warn('OpenAI QA failed, using fallback:', qaError.message);
      
      // Simple fallback answer (dependency removed)
      answer = `This is an educational topic related to ${question}. Please refer to course materials for detailed information.`;
    }
    
    return {
      success: true,
      data: {
        question: question,
        answer: answer,
        context: context,
        type: 'concept', // Default type
        difficulty: 'Intermediate',
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Course content search failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a small set of Q&A pairs for a lesson/topic
 * @param {string} topic - Topic or lesson title
 * @param {number} count - Number of Q&A pairs
 * @param {string} context - Optional extra context
 * @returns {Promise<{success:boolean, data:{qa:Array<{question:string,answer:string}>}}>} Q&A pairs
 */
export async function generateQAPairs(topic, count = 3, context = '') {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const prompt = `Create ${count} high-quality quiz Q&A pairs for the topic "${topic}".
${context ? `Context: ${context}` : ''}

Return valid JSON only in this format:
{
  "qa": [
    {"question": "...", "answer": "..."}
  ]
}`;

    let qa = [];
    try {
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 600,
        temperature: 0.5
      });

      const jsonMatch = typeof response === 'string' ? response.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
      qa = Array.isArray(parsed.qa) ? parsed.qa : [];
    } catch (primaryError) {
      console.warn('Primary QA generation failed, using simple fallback:', primaryError.message);
      // Simple fallback without external API
      qa = Array.from({ length: count }).map((_, i) => ({
        question: `What is a key concept about ${topic}? (${i + 1})`,
        answer: `A fundamental idea related to ${topic}.`
      }));
    }

    // Normalize
    qa = qa
      .filter(p => p && p.question && p.answer)
      .map(p => ({ question: String(p.question), answer: String(p.answer) }));

    return { success: true, data: { qa } };
  } catch (error) {
    console.error('❌ QA generation failed:', error);
    return { success: false, data: { qa: [] }, error: error.message };
  }
}

/**
 * Generate safe lesson content with Qwen3Guard moderation
 * @param {string} prompt - Lesson topic or prompt
 * @param {Object} options - { context?: string, level?: string, enableModeration?: boolean }
 * @returns {Promise<{success:boolean, data:Object}>}
 */
export async function generateSafeLessonContent(prompt, options = {}) {
  try {
    console.log('🛡️ Generating safe lesson content with Qwen3Guard moderation:', prompt);
    
    // Step 1: Moderate the lesson prompt
    const promptModeration = await qwenGuardService.moderatePrompt(prompt);
    
    console.log('🛡️ Lesson prompt moderation result:', promptModeration.data);
    
    // Check if the prompt is safe to proceed
    if (promptModeration.success && promptModeration.data.safety === 'Unsafe') {
      console.warn('⚠️ Lesson topic flagged as unsafe by Qwen3Guard');
      return {
        success: false,
        error: 'Lesson topic contains potentially unsafe content',
        moderationResult: promptModeration.data,
        data: null
      };
    }
    
    // Step 2: Generate lesson content using existing system
    const lessonResult = await generateLessonFromPrompt(prompt, options);
    
    if (!lessonResult.success) {
      return {
        ...lessonResult,
        moderationResult: promptModeration.data
      };
    }
    
    // Step 3: Moderate the generated lesson content
    const lessonContentText = [
      lessonResult.data.introduction,
      ...(lessonResult.data.mainContent || []),
      lessonResult.data.summary
    ].join(' ');
    
    const responseModeration = await qwenGuardService.moderateResponse(
      prompt,
      lessonContentText
    );
    
    console.log('🛡️ Lesson content moderation result:', responseModeration.data);
    
    // Step 4: Comprehensive content moderation
    const comprehensiveModeration = await qwenGuardService.moderateCourseContent(
      prompt,
      lessonContentText
    );
    
    // Step 5: Determine overall safety
    const overallSafe = promptModeration.data.safety === 'Safe' && 
                       responseModeration.data.safety === 'Safe' &&
                       (comprehensiveModeration.success ? comprehensiveModeration.data.overall.safe : true);
    
    return {
      success: true,
      data: {
        ...lessonResult.data,
        moderation: {
          overall: {
            safe: overallSafe,
            timestamp: new Date().toISOString()
          },
          prompt: promptModeration.data,
          response: responseModeration.data,
          comprehensive: comprehensiveModeration.success ? comprehensiveModeration.data : null
        }
      },
      moderationEnabled: true
    };
    
  } catch (error) {
    console.error('❌ Safe lesson content generation failed:', error);
    return {
      success: false,
      error: error.message,
      data: null,
      moderationEnabled: true
    };
  }
}

/**
 * Generate a structured lesson from a topic/prompt
 * @param {string} prompt - Lesson topic or prompt
 * @param {Object} options - { context?: string, level?: string }
 * @returns {Promise<{success:boolean, data:Object}>}
 */
export async function generateLessonFromPrompt(prompt, options = {}) {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const sysPrompt = `Create a structured lesson as JSON with keys: introduction (string), mainContent (array of strings), examples (array of {title, description}), keyTakeaways (array of strings), summary (string). Keep concise and instructional.`;
    const userPrompt = `Topic: ${prompt}${options.context ? `\nContext: ${options.context}` : ''}\nLevel: ${options.level || 'beginner'}`;

    let lesson;
    try {
      const response = await aiServiceRouter.generateStructured(sysPrompt, userPrompt);
      lesson = response;
    } catch {
      const text = await aiServiceRouter.generateText(`${sysPrompt}\n\n${userPrompt}`, { model: 'gpt-4o', maxTokens: 800, temperature: 0.6 });
      const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      lesson = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    }

    // Normalize fields
    lesson = lesson || {};
    return {
      success: true,
      data: {
        introduction: lesson.introduction || '',
        mainContent: Array.isArray(lesson.mainContent) ? lesson.mainContent : [],
        examples: Array.isArray(lesson.examples) ? lesson.examples : [],
        keyTakeaways: Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [],
        summary: lesson.summary || ''
      }
    };
  } catch (error) {
    console.error('❌ Prompt-to-lesson generation failed:', error);
    return { success: false, data: { introduction: '', mainContent: [], examples: [], keyTakeaways: [], summary: '' }, error: error.message };
  }
}

/**
 * Generate MCQ assessments for a topic
 * Returns normalized questions for bulk upload API
 */
export async function generateAssessmentQuestions(topic, count = 5, context = '') {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const prompt = `Create ${count} multiple-choice questions (MCQs) for the topic "${topic}"${context ? ` with context: ${context}` : ''}. Return JSON {"questions": [{"question": "...", "options": ["A","B","C","D"], "answerIndex": 0}]}`;
    let questions = [];
    try {
      const text = await aiServiceRouter.generateText(prompt, { model: 'gpt-4o', maxTokens: 1000, temperature: 0.6 });
      const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch (e) {
      console.warn('Primary assessment generation failed, using fallback:', e.message);
      questions = Array.from({ length: count }).map((_, i) => ({
        question: `Which statement about ${topic} is correct? (${i + 1})`,
        options: [
          `${topic} relates to concept A`,
          `${topic} relates to concept B`,
          `${topic} relates to concept C`,
          `${topic} relates to concept D`
        ],
        answerIndex: 0
      }));
    }
    // Normalize for bulk upload format
    const normalized = questions.map((q, idx) => ({
      question_text: String(q.question),
      options: (q.options || []).map(String),
      correct_option_index: Number.isInteger(q.answerIndex) ? q.answerIndex : 0,
      order: idx + 1,
      difficulty: options?.level || 'EASY'
    }));
    return { success: true, data: { questions: normalized } };
  } catch (error) {
    console.error('❌ Assessment generation failed:', error);
    return { success: false, data: { questions: [] }, error: error.message };
  }
}

/**
 * Save AI-generated course to backend
 * @param {Object} courseData - Complete course data
 * @returns {Promise<Object>} Save result
 */
export async function saveAICourse(courseData) {
  try {
    console.log('💾 Saving AI-generated course:', courseData.title);
    
    const response = await fetch(`${API_BASE}/api/ai/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...courseData,
        isAIGenerated: true,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          modelsUsed: ['course-outline', 'image-generation', 'summarization'],
          generationMethod: 'ai-service'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Failed to save AI course:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save AI-generated lessons to backend - REAL DATABASE INTEGRATION
 * @param {Object} lessonData - Lesson data including course title and lessons array
 * @returns {Promise<Object>} Save result
 */
export async function saveAILessons(lessonData) {
  try {
    console.log('💾 Saving AI-generated lessons to database:', lessonData.courseTitle);
    
    const { courseTitle, courseId, lessons, blockBased } = lessonData;
    
    if (!courseId) {
      throw new Error('Course ID is required to save lessons');
    }
    
    if (!lessons || lessons.length === 0) {
      throw new Error('No lessons provided to save');
    }
    
    console.log('📚 Lesson data to save:', {
      courseTitle,
      courseId,
      lessonCount: lessons.length,
      blockBased,
      totalBlocks: lessons.reduce((acc, lesson) => acc + (lesson.blocks?.length || 0), 0)
    });
    
    // Group lessons by module
    const moduleGroups = {};
    lessons.forEach(lesson => {
      const moduleId = lesson.moduleId || 'default';
      if (!moduleGroups[moduleId]) {
        moduleGroups[moduleId] = [];
      }
      moduleGroups[moduleId].push(lesson);
    });
    
    const createdModules = [];
    const createdLessons = [];
    
    // Create modules and lessons in database
    for (const [moduleId, moduleLessons] of Object.entries(moduleGroups)) {
      try {
        // Create module
        const moduleData = {
          title: moduleLessons[0]?.moduleTitle || `AI Generated Module ${createdModules.length + 1}`,
          description: `AI-generated module containing ${moduleLessons.length} lessons`,
          order: createdModules.length + 1,
          price: 0 // Required field
        };
        
        console.log('🔄 Creating module:', moduleData.title);
        const createdModule = await createModule(courseId, moduleData);
        createdModules.push(createdModule);
        
        // Create lessons in this module
        for (const lesson of moduleLessons) {
          try {
            const lessonPayload = {
              title: lesson.title,
              description: lesson.description || 'AI-generated lesson content',
              content: lesson.content || '',
              duration: lesson.duration || '15 min',
              order: createdLessons.length + 1
            };
            
            console.log('🔄 Creating lesson:', lessonPayload.title);
            const createdLesson = await createLesson(courseId, createdModule.id, lessonPayload);
            createdLessons.push(createdLesson);
            
            // Update lesson content with blocks if available
            if (lesson.blocks && lesson.blocks.length > 0) {
              const contentData = {
                content: lesson.structuredContent || lesson.blocks,
                blocks: lesson.blocks,
                metadata: {
                  aiGenerated: true,
                  generatedAt: new Date().toISOString(),
                  blockCount: lesson.blocks.length,
                  blockBased: blockBased
                }
              };
              
              console.log('🔄 Updating lesson content for:', lessonPayload.title);
              await updateLessonContent(createdLesson.id, contentData);
            }
            
          } catch (lessonError) {
            console.error('❌ Failed to create lesson:', lesson.title, lessonError);
            throw lessonError; // Re-throw to handle in outer catch
          }
        }
        
      } catch (moduleError) {
        console.error('❌ Failed to create module:', moduleId, moduleError);
        throw moduleError; // Re-throw to handle in outer catch
      }
    }
    
    console.log('✅ Successfully saved AI lessons to database:', {
      courseId,
      modulesCreated: createdModules.length,
      lessonsCreated: createdLessons.length
    });
    
    return {
      success: true,
      data: {
        data: {
          courseId: courseId,
          moduleIds: createdModules.map(m => m.id),
          lessonIds: createdLessons.map(l => l.id),
          modulesCreated: createdModules.length,
          lessonsCreated: createdLessons.length,
          message: 'Lessons saved successfully to database'
        }
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to save AI lessons to database:', error);
    return {
      success: false,
      error: error.message || 'Failed to save lessons to database'
    };
  }
}

/**
 * Update enhanced lesson content with AI features (blocks, video links, sync settings)
 * @param {Object} contentData - Enhanced lesson content data
 * @returns {Promise<Object>} Update result
 */
export async function updateEnhancedLessonContent(contentData) {
  try {
    console.log('🔄 Updating lesson content:', contentData.courseTitle);
    
    // Enhanced content data processing
    const processedData = {
      courseTitle: contentData.courseTitle,
      courseId: contentData.courseId,
      lessonCount: contentData.lessons?.length || 0,
      hasGlobalContent: !!contentData.globalContent,
      totalBlocks: contentData.lessons?.reduce((acc, lesson) => acc + (lesson.blocks?.length || 0), 0) || 0,
      lessons: contentData.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        blocks: lesson.blocks || [],
        structuredContent: lesson.structuredContent || [],
        contentUpdatedAt: lesson.contentUpdatedAt || new Date().toISOString()
      })) || [],
      globalContent: contentData.globalContent || {},
      savedAt: contentData.savedAt || new Date().toISOString()
    };
    
    console.log('📚 Enhanced content data to update:', processedData);
    
    // Try to save to backend API if available
    try {
      const response = await fetch(`${API_BASE}/api/courses/${contentData.courseId}/content`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(processedData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Successfully saved to backend:', result);
        
        return {
          success: true,
          data: {
            message: 'Lesson content updated successfully',
            courseId: contentData.courseId,
            updatedLessons: processedData.lessonCount,
            totalBlocks: processedData.totalBlocks,
            timestamp: new Date().toISOString(),
            backendSaved: true
          }
        };
      } else {
        console.warn('⚠️ Backend save failed, using local storage fallback');
        throw new Error(`Backend save failed: ${response.status}`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend not available, using local storage:', backendError.message);
      
      // Fallback to localStorage
      const storageKey = `lesson_content_${contentData.courseId || 'temp'}`;
      localStorage.setItem(storageKey, JSON.stringify(processedData));
      
      // Also save to a general backup
      const allSavedContent = JSON.parse(localStorage.getItem('ai_lesson_backups') || '{}');
      allSavedContent[contentData.courseId || 'temp'] = processedData;
      localStorage.setItem('ai_lesson_backups', JSON.stringify(allSavedContent));
      
      // Simulate API delay for UX consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: {
          message: 'Lesson content saved locally (backend unavailable)',
          courseId: contentData.courseId || Date.now(),
          updatedLessons: processedData.lessonCount,
          totalBlocks: processedData.totalBlocks,
          timestamp: new Date().toISOString(),
          backendSaved: false,
          localStorageKey: storageKey
        }
      };
    }
  } catch (error) {
    console.error('❌ Failed to update lesson content:', error);
    return {
      success: false,
      error: error.message || 'Failed to update lesson content'
    };
  }
}

/**
 * Get AI-generated lessons for a course
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Lessons data
 */
export async function getAILessons(courseId) {
  try {
    console.log('📚 Retrieving AI-generated lessons for course ID:', courseId);
    
    const response = await fetch(`${API_BASE}/api/ai/lessons/${courseId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Failed to retrieve AI lessons:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all AI-generated courses
 * @returns {Promise<Object>} Courses data
 */
export async function getAICourses() {
  try {
    console.log('📚 Retrieving all AI-generated courses');
    
    const response = await fetch(`${API_BASE}/api/ai/courses`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Failed to retrieve AI courses:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Mock AI Course Service for demonstration purposes
// In a real implementation, this would integrate with actual AI services

class AICourseService {
  async generateCourseOutline(courseData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response - in a real implementation, this would call an AI service
    const mockOutline = {
      course_title: courseData.title || 'Untitled Course',
      modules: [
        {
          module_title: 'Introduction to ' + (courseData.subject || 'the subject'),
          lesson: {
            lesson_title: 'Getting Started',
            lesson_intro: 'An introduction to the fundamental concepts',
            lesson_content: [
              { subtopic: 'Key Concepts', content: 'Understanding the basic principles' },
              { subtopic: 'Practical Applications', content: 'Real-world examples and use cases' }
            ],
            summary: 'This lesson provides a foundation for understanding the subject matter.'
          }
        },
        {
          module_title: 'Advanced ' + (courseData.subject || 'Topics'),
          lesson: {
            lesson_title: 'Deep Dive',
            lesson_intro: 'Exploring advanced concepts and techniques',
            lesson_content: [
              { subtopic: 'Advanced Techniques', content: 'In-depth exploration of complex topics' },
              { subtopic: 'Best Practices', content: 'Industry-standard approaches and methodologies' }
            ],
            summary: 'This lesson builds on the foundation to explore more complex topics.'
          }
        }
      ]
    };
    
    return {
      success: true,
      data: mockOutline
    };
  }
  
  async generateCourseImage(prompt, options = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - in a real implementation, this would call an image generation service
    return {
      success: true,
      data: {
        url: 'https://placehold.co/600x400/cccccc/ffffff?text=AI+Generated+Image',
        prompt: prompt,
        style: options.style || 'realistic'
      }
    };
  }
  
  async summarizeContent(content, options = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock response - in a real implementation, this would call a summarization service
    return {
      success: true,
      data: {
        summary: 'This is a summarized version of the provided content. In a real implementation, this would be generated by an AI summarization service.',
        originalLength: content.length,
        summaryLength: 100,
        type: options.type || 'bullet'
      }
    };
  }
}

const aiCourseService = new AICourseService();
export default aiCourseService;