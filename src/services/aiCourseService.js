// AI Course Service for handling AI-powered course creation with deployed backend integration
// Import required services and utilities
import {
  createAICourse,
  createModule,
  createLesson,
  updateLessonContent,
} from './courseService';
import { uploadImage } from './imageUploadService';
import { uploadAIGeneratedImage, uploadAICourseMedia } from './aiUploadService';
import universalAILessonService from './universalAILessonService.js';
import structuredLessonGenerator from './structuredLessonGenerator.js';
import secureAIService from './secureAIService.js';

// API configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Generate AI course outline
 * @param {Object} courseData - Course creation data
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateSafeCourseOutline(courseData, options = {}) {
  // Simply call the regular outline generation (moderation removed)
  return await generateAICourseOutline(courseData);
}

/**
 * Generate AI course outline with modules and lessons
 * @param {Object} courseData - Course creation data
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateAICourseOutline(courseData) {
  try {
    console.log('🤖 Generating AI course outline for:', courseData.title);

    const aiResult = await secureAIService.generateCourseOutline(courseData);

    if (aiResult.success && aiResult.data) {
      console.log('✅ Course outline generation successful');

      // Transform the data to match expected format
      const courseStructure = {
        course_title: aiResult.data.course_title || courseData.title,
        title: aiResult.data.course_title || courseData.title,
        subject: courseData.subject || courseData.title,
        modules: aiResult.data.modules || [],
      };

      return {
        success: true,
        data: courseStructure,
      };
    } else {
      console.warn('AI generation failed, using fallback:', aiResult.error);

      // Fallback to structured generation
      const courseStructure = {
        course_title: courseData.title,
        title: courseData.title,
        subject: courseData.subject || courseData.title,
        modules: generateFallbackModules(courseData),
      };

      return {
        success: true,
        data: courseStructure,
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
        modules: generateFallbackModules(courseData),
      },
      error: error.message,
    };
  }
}

/**
 * Generate fallback course modules structure
 */
function generateFallbackModules(courseData) {
  const subject = courseData.subject || courseData.title;
  console.log(
    '📚 Generating fallback single comprehensive module for subject:',
    subject
  );

  const modules = [
    {
      id: 1,
      title: `Complete ${subject} Masterclass`,
      module_title: `Complete ${subject} Masterclass`,
      description: `A comprehensive module covering all aspects of ${subject} from fundamentals to advanced applications`,
      lessons: [
        {
          id: 1,
          title: `Comprehensive ${subject} Guide`,
          lesson_title: `Comprehensive ${subject} Guide`,
          description: `A complete guide covering all aspects of ${subject} including fundamentals, practical applications, and advanced techniques`,
          content: '',
          duration: '60 min',
        },
      ],
    },
  ];

  console.log(
    `📚 Generated ${modules.length} fallback modules:`,
    modules.map(m => m.module_title)
  );
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
    if (
      line.includes('lesson') ||
      line.includes('topic') ||
      line.includes('-')
    ) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 5) {
        lessons.push({
          id: lessonId++,
          title: cleanLine,
          description: `Learn about ${cleanLine.toLowerCase()}`,
          content: '',
          duration: '20 min',
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
      duration: '15 min',
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
    errors,
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
      data: null,
    };
  }

  try {
    console.log('🚀 Creating complete AI course:', courseData.title);

    // Step 1: Use provided course structure or generate AI course outline
    let courseStructure;

    // Check if comprehensive course structure is already provided
    if (courseData.comprehensiveCourseStructure) {
      console.log(
        '📋 Step 1: Using provided comprehensive course structure with thumbnails...'
      );
      courseStructure = courseData.comprehensiveCourseStructure;
      console.log('🎨 Using course structure with thumbnails:', {
        moduleCount: courseStructure.modules?.length || 0,
        hasModuleThumbnails: courseStructure.modules?.[0]?.thumbnail
          ? 'Yes'
          : 'No',
        hasLessonThumbnails: courseStructure.modules?.[0]?.lessons?.[0]
          ?.thumbnail
          ? 'Yes'
          : 'No',
      });
    } else {
      // Retry logic for AI outline generation
      let generationAttempts = 0;
      const maxGenerationAttempts = 3;
      let outlineError = null;

      while (generationAttempts < maxGenerationAttempts) {
        try {
          console.log(
            `📋 Step 1: Generating AI course outline (attempt ${generationAttempts + 1}/${maxGenerationAttempts})...`
          );
          const outlineResponse = await generateAICourseOutline(courseData);

          // Validate response structure
          if (!outlineResponse) {
            throw new Error('AI generation returned null response');
          }

          if (!outlineResponse.success) {
            throw new Error(
              outlineResponse.error || 'AI generation returned no data'
            );
          }

          if (!outlineResponse.data || !outlineResponse.data.modules) {
            throw new Error('Invalid AI response structure: missing modules');
          }

          if (outlineResponse.data.modules.length === 0) {
            throw new Error('AI generation returned empty module list');
          }

          courseStructure = outlineResponse.data;
          console.log(
            `✅ AI outline generated successfully with ${courseStructure.modules.length} modules`
          );
          break;
        } catch (outlineError) {
          generationAttempts++;
          console.error(
            `❌ AI generation attempt ${generationAttempts} failed:`,
            outlineError.message
          );

          if (generationAttempts >= maxGenerationAttempts) {
            console.warn(
              '⚠️ All AI generation attempts failed, using fallback structure'
            );
            courseStructure = {
              title: courseData.title,
              subject: courseData.subject || courseData.title,
              modules: generateFallbackModules(courseData),
              metadata: {
                reason: 'AI generation failed after all retries',
                originalError: outlineError.message,
              },
            };

            // Notify user about fallback
            if (typeof window !== 'undefined' && window.showNotification) {
              window.showNotification(
                'AI generation failed. Using template structure instead. You can enhance it manually.',
                'warning'
              );
            }
            break;
          }

          // Retry with exponential backoff (OPTIMIZED - reduced for faster recovery)
          const waitTime = Math.min(
            500 * Math.pow(1.5, generationAttempts - 1),
            3000
          );
          console.log(
            `⏳ Waiting ${waitTime}ms before retry attempt ${generationAttempts + 1}...`
          );
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // Step 2: Create course in parallel with outline generation (OPTIMIZED)
    let createdCourse;
    let courseId;

    try {
      console.log(
        '🏗️ Step 2: Creating course via backend API (in parallel with outline)...'
      );

      // Normalize course data to ensure all required fields are present
      const normalizedTitle = (
        courseStructure.title ||
        courseStructure.course_title ||
        courseData.title
      ).substring(0, 200);

      const normalizedDescription = (
        courseData.description || 'Course description'
      ).substring(0, 2000);

      const normalizedSubject = (
        courseStructure.subject ||
        courseData.subject ||
        courseData.title
      ).substring(0, 150);

      // Parse learning objectives from string or array
      let learningObjectives = [];
      if (courseData.learningObjectives) {
        if (Array.isArray(courseData.learningObjectives)) {
          learningObjectives = courseData.learningObjectives;
        } else if (typeof courseData.learningObjectives === 'string') {
          learningObjectives = courseData.learningObjectives
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);
        }
      }

      // Map difficulty level to course_level
      const difficultyMap = {
        beginner: 'BEGINNER',
        intermediate: 'INTERMEDIATE',
        advanced: 'ADVANCED',
        expert: 'EXPERT',
      };

      const courseLevelFromAI =
        courseStructure.difficulty || courseData.difficulty || 'intermediate';
      const courseLevel =
        difficultyMap[courseLevelFromAI.toLowerCase()] || 'INTERMEDIATE';

      // Parse duration
      const estimatedDuration =
        courseData.duration || courseStructure.duration || '4 weeks';

      const coursePayload = {
        title: normalizedTitle,
        description: normalizedDescription,
        subject: normalizedSubject,
        learning_objectives: learningObjectives,
        course_level: courseLevel,
        estimated_duration: estimatedDuration,
        max_students: Number(courseData.max_students) || 100,
        price: courseData.price || '0',
        thumbnail: courseData.thumbnail || null,
        isHidden: false,
        course_status: 'DRAFT',
        courseType: 'OPEN',
        lockModules: 'UNLOCKED',
        requireFinalQuiz: true,
      };

      console.log('📦 Course payload prepared:', {
        title: coursePayload.title,
        hasDescription: !!coursePayload.description,
        subject: coursePayload.subject,
        courseLevel: coursePayload.course_level,
        objectivesCount: learningObjectives.length,
        moduleCount: courseStructure.modules?.length || 0,
      });

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
          console.warn(
            `Course creation attempt ${retryCount} failed:`,
            courseError.message
          );

          if (retryCount >= maxRetries) {
            throw new Error(
              `Course creation failed after ${maxRetries} attempts: ${courseError.message}`
            );
          }

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (courseCreationError) {
      throw new Error(`Course creation failed: ${courseCreationError.message}`);
    }

    // Step 3: Create modules in parallel using deployed backend API (OPTIMIZED)
    console.log('📚 Step 3: Creating modules and lessons...');
    const moduleErrors = [];

    // Add progress callback if provided
    const updateProgress = message => {
      console.log(`📊 Progress: ${message}`);
    };

    // Create all modules in parallel (OPTIMIZED)
    console.log(
      `🚀 Creating ${courseStructure.modules.length} modules in parallel...`
    );

    const createdModules = await Promise.all(
      courseStructure.modules.map(async (moduleData, i) => {
        try {
          console.log(
            `📖 Creating module ${i + 1}/${courseStructure.modules.length}: ${moduleData.title || moduleData.module_title}`
          );
          updateProgress(
            `Creating module ${i + 1} of ${courseStructure.modules.length}: ${moduleData.title || moduleData.module_title}`
          );

          // Validate and prepare thumbnail URL
          const moduleThumbnail =
            moduleData.thumbnail || moduleData.module_thumbnail_url;
          const validatedThumbnail =
            moduleThumbnail &&
            (moduleThumbnail.startsWith('http') ||
              moduleThumbnail.startsWith('data:'))
              ? moduleThumbnail
              : '';

          const modulePayload = {
            title: moduleData.title || moduleData.module_title,
            description:
              moduleData.description ||
              `${moduleData.title || moduleData.module_title} module content`,
            order: i + 1,
            estimated_duration: 60,
            module_status: 'PUBLISHED',
            price: 0, // Backend expects number, matching manual creation
          };

          // Only include thumbnail if it has a valid value
          if (validatedThumbnail && validatedThumbnail.trim() !== '') {
            modulePayload.thumbnail = validatedThumbnail;
          }

          console.log(
            '📋 Module payload being sent:',
            JSON.stringify(modulePayload, null, 2)
          );
          console.log('🎨 Module thumbnail data:', {
            thumbnail: moduleData.thumbnail,
            module_thumbnail_url: moduleData.module_thumbnail_url,
            validated_thumbnail: validatedThumbnail,
          });

          // Retry logic for module creation
          let moduleRetryCount = 0;
          const maxModuleRetries = 3;
          let createdModule;

          while (moduleRetryCount < maxModuleRetries) {
            try {
              createdModule = await createModule(courseId, modulePayload);

              // Validate module was created with ID
              const moduleId = createdModule.data?.id || createdModule.id;
              if (!moduleId) {
                throw new Error('Module created but no ID returned');
              }

              console.log(`✅ Module created with ID: ${moduleId}`);
              break;
            } catch (moduleError) {
              moduleRetryCount++;
              if (moduleRetryCount >= maxModuleRetries) {
                throw moduleError;
              }
              console.warn(
                `Module creation retry ${moduleRetryCount}/${maxModuleRetries} for: ${moduleData.title || moduleData.module_title}`
              );
              await new Promise(resolve =>
                setTimeout(resolve, 500 * moduleRetryCount)
              );
            }
          }

          return {
            ...createdModule,
            originalLessons: moduleData.lessons || [],
          };
        } catch (error) {
          console.error(
            `❌ Failed to create module: ${moduleData.title || moduleData.module_title}`,
            error.message
          );
          moduleErrors.push({
            module: moduleData.title || moduleData.module_title,
            error: error.message,
          });
          throw error;
        }
      })
    );

    // Log module creation summary
    console.log(
      `📊 Module creation summary: ${createdModules.length}/${courseStructure.modules.length} successful`
    );
    if (moduleErrors.length > 0) {
      console.warn('⚠️ Module creation errors:', moduleErrors);
    }

    // Step 4: Create lessons for all modules in parallel (OPTIMIZED)
    console.log('📝 Step 4: Creating lessons for all modules in parallel...');
    const lessonErrors = [];

    // Create lessons for all modules in parallel
    await Promise.all(
      createdModules.map(async (createdModule, moduleIndex) => {
        const moduleId = createdModule.data?.id || createdModule.id;
        const moduleData = courseStructure.modules[moduleIndex];

        if (moduleData.lessons && moduleData.lessons.length > 0) {
          console.log(
            `📝 Creating ${moduleData.lessons.length} lessons for module ${moduleIndex + 1}...`
          );

          // Create all lessons for this module in parallel
          await Promise.all(
            moduleData.lessons.map(async (lessonData, j) => {
              try {
                console.log(
                  `📝 Creating lesson ${j + 1}/${moduleData.lessons.length}: ${lessonData.title}`
                );

                // Validate and prepare lesson thumbnail URL
                const lessonThumbnail =
                  lessonData.thumbnail || lessonData.lesson_thumbnail_url;
                const validatedLessonThumbnail =
                  lessonThumbnail &&
                  (lessonThumbnail.startsWith('http') ||
                    lessonThumbnail.startsWith('data:'))
                    ? lessonThumbnail
                    : '';

                const lessonPayload = {
                  title: lessonData.title.substring(0, 200),
                  description:
                    lessonData.description ||
                    `${lessonData.title} lesson content`,
                  order: j + 1,
                  status: 'PUBLISHED',
                };

                if (
                  validatedLessonThumbnail &&
                  validatedLessonThumbnail.trim() !== ''
                ) {
                  lessonPayload.thumbnail = validatedLessonThumbnail;
                }

                // Retry logic for lesson creation
                let lessonRetryCount = 0;
                const maxLessonRetries = 2;
                let createdLesson;

                while (lessonRetryCount < maxLessonRetries) {
                  try {
                    createdLesson = await createLesson(
                      courseId,
                      moduleId,
                      lessonPayload
                    );

                    // Validate lesson was created with ID
                    const lessonId = createdLesson.data?.id || createdLesson.id;
                    if (!lessonId) {
                      throw new Error('Lesson created but no ID returned');
                    }

                    console.log(`✅ Lesson created with ID: ${lessonId}`);
                    break;
                  } catch (lessonError) {
                    lessonRetryCount++;
                    if (lessonRetryCount >= maxLessonRetries) {
                      throw lessonError;
                    }
                    console.warn(
                      `Lesson creation retry ${lessonRetryCount}/${maxLessonRetries}`
                    );
                    await new Promise(resolve =>
                      setTimeout(resolve, 500 * lessonRetryCount)
                    );
                  }
                }

                createdLessons.push(createdLesson);
              } catch (lessonError) {
                console.error(
                  `❌ Failed to create lesson "${lessonData.title}":`,
                  lessonError.message
                );
                lessonErrors.push({
                  moduleTitle: moduleData.title || moduleData.module_title,
                  lessonTitle: lessonData.title,
                  error: lessonError.message,
                });
              }
            })
          );

          console.log(
            `✅ All lessons created for module ${moduleIndex + 1}: ${moduleData.title || moduleData.module_title}`
          );
        }
      })
    );

    // Step 5: Auto-generate lesson content using universalAILessonService
    console.log('📝 Step 5: Auto-generating content for all lessons...');
    const contentGenerationResults = {
      successCount: 0,
      failedCount: 0,
      totalImages: 0,
      totalBlocks: 0,
      errors: [],
    };

    // Import universalAILessonService dynamically if needed
    const universalAILessonService = await import(
      './universalAILessonService'
    ).then(m => m.default);

    // Track generation mode (from courseData options or default to STANDARD)
    const generationMode = courseData.generationMode || 'STANDARD';
    const generationConfig = {
      QUICK: {
        contentType: 'outline',
        includeImages: false,
        maxImages: 0,
        includeAssessments: false,
        includeExamples: false,
        maxTokens: 500,
      },
      STANDARD: {
        contentType: 'comprehensive',
        includeImages: true,
        maxImages: 1,
        includeAssessments: true,
        includeExamples: true,
        maxTokens: 1000,
      },
      COMPLETE: {
        contentType: 'comprehensive',
        includeImages: true,
        maxImages: 2,
        includeAssessments: true,
        includeExamples: true,
        includeSummary: true,
        maxTokens: 1500,
      },
      PREMIUM: {
        contentType: 'comprehensive',
        includeImages: true,
        maxImages: 1, // speed-oriented: single high-quality image
        includeAssessments: true,
        includeExamples: true,
        includeSummary: true,
        includeInteractive: true,
        maxTokens: 2000,
      },
    };

    const config =
      generationConfig[generationMode] || generationConfig.STANDARD;
    console.log(`🎯 Using ${generationMode} generation mode`);

    // Fast Premium toggle: allow caller to skip images even in Premium for speed
    if (generationMode === 'PREMIUM' && courseData?.fastPremium === true) {
      config.includeImages = false;
      config.maxImages = 0;
      console.log('⚡ Fast Premium enabled: skipping images for speed');
    }

    // Process lessons in batches for parallel execution (OPTIMIZED - Phase 3: Aggressive parallelization)
    // BATCH_SIZE increased to 20 for maximum parallelization (from 10)
    // This generates 20 lessons simultaneously with all their content blocks
    const BATCH_SIZE = 20; // Process 20 lessons simultaneously (AGGRESSIVE: doubled from 10)
    let processedCount = 0;

    for (let i = 0; i < createdLessons.length; i += BATCH_SIZE) {
      const batch = createdLessons.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(createdLessons.length / BATCH_SIZE);

      console.log(
        `📊 Processing batch ${batchNumber}/${totalBatches} (${batch.length} lessons in parallel) - AGGRESSIVE MODE`
      );

      // Process all lessons in batch in parallel
      const batchResults = await Promise.all(
        batch.map(async createdLesson => {
          processedCount++;
          const lessonId = createdLesson.data?.id || createdLesson.id;
          const lessonTitle =
            createdLesson.data?.title ||
            createdLesson.title ||
            'Untitled Lesson';

          try {
            console.log(
              `📚 Generating content for lesson ${processedCount}/${createdLessons.length}: ${lessonTitle}`
            );
            updateProgress(
              `Generating content for lesson ${processedCount} of ${createdLessons.length}: ${lessonTitle}`
            );

            // Find module info for this lesson
            const parentModule = createdModules.find(m => {
              const modId = m.data?.id || m.id;
              return (
                createdLesson.module_id === modId ||
                createdLesson.data?.module_id === modId
              );
            });

            const moduleTitle =
              parentModule?.data?.title || parentModule?.title || 'Module';

            // Use structured lesson generator (NEW: Fixed 8-block structure)
            const useStructuredGeneration =
              config.useStructuredGeneration !== false; // Default: true

            if (useStructuredGeneration) {
              console.log(
                `🎯 Using structured lesson generator (${generationMode} mode)`
              );

              // Generate lesson with structured format
              const result = await structuredLessonGenerator.generateLesson(
                lessonId,
                {
                  title: courseData.title,
                  description: courseData.description,
                  difficulty: courseData.difficulty || 'intermediate',
                  targetAudience: courseData.targetAudience || 'learners',
                  generationMode: generationMode, // Pass generation mode
                },
                progress => {
                  console.log(
                    `  └─ ${progress.message} (${progress.current}/${progress.total})`
                  );
                },
                {
                  skipImages:
                    generationMode === 'QUICK' ||
                    config.includeImages === false,
                  includeImages: config.includeImages,
                  maxImages: config.maxImages,
                } // Pass config to control images per mode
              );

              if (result.success) {
                try {
                  await secureAIService.logAIGenerationBatch({
                    courseId,
                    logs: (result.blocks || []).map(block => ({
                      lesson_id: lessonId,
                      block_id: block.id,
                      block_type: block.type,
                      variant:
                        block?.metadata?.variant ||
                        block?.variant ||
                        block?.textType ||
                        null,
                      topic: courseData.title,
                      difficulty_level: courseData.difficulty || null,
                      generated_content: block,
                    })),
                  });
                } catch (logError) {
                  console.warn(
                    '⚠️ Failed to log AI generation batch (non-blocking):',
                    logError.message
                  );
                }

                return {
                  success: true,
                  lessonId,
                  lessonTitle,
                  blocks: result.blocks.length,
                };
              } else {
                throw new Error(result.error || 'Structured generation failed');
              }
            } else {
              // Fallback to original universal AI lesson service
              console.log('📝 Using universal AI lesson service (legacy mode)');

              const blocks =
                await universalAILessonService.generateLessonContent(
                  {
                    title: lessonTitle,
                    description:
                      createdLesson.data?.description ||
                      createdLesson.description,
                  },
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
                    includeInteractive: config.includeInteractive,
                  }
                );

              // Save generated content to lesson
              await universalAILessonService.saveContentToLesson(
                lessonId,
                blocks
              );

              return {
                success: true,
                lessonId,
                lessonTitle,
                blocks: blocks.length,
              };
            }
          } catch (contentError) {
            console.error(
              `❌ Failed to generate content for "${lessonTitle}":`,
              contentError.message
            );

            // Generate placeholder content for failed lessons
            try {
              const placeholderBlocks = [
                {
                  id: `placeholder-${Date.now()}`,
                  type: 'text',
                  content: `This lesson covers ${lessonTitle}. Content will be enhanced soon.`,
                  order: 0,
                  isPlaceholder: true,
                },
              ];
              await universalAILessonService.saveContentToLesson(
                lessonId,
                placeholderBlocks
              );
              console.log(`📋 Placeholder content saved for: ${lessonTitle}`);
            } catch (placeholderError) {
              console.error(
                `❌ Failed to save placeholder for "${lessonTitle}":`,
                placeholderError.message
              );
            }

            return {
              success: false,
              lessonId,
              lessonTitle,
              error: contentError.message,
            };
          }
        })
      );

      // Update results from batch
      batchResults.forEach(result => {
        if (result.success) {
          contentGenerationResults.successCount++;
          contentGenerationResults.totalBlocks += result.blocks;
          console.log(
            `✅ Lesson complete: ${result.lessonTitle} (${result.blocks} blocks)`
          );
        } else {
          contentGenerationResults.failedCount++;
          contentGenerationResults.errors.push({
            lessonTitle: result.lessonTitle,
            error: result.error,
          });
        }
      });

      // No artificial delay between batches for Premium speed; rely on upstream rate limits
    }

    // Log content generation summary
    console.log(`📊 Content Generation Summary:`);
    console.log(
      `   ✅ Successful: ${contentGenerationResults.successCount}/${createdLessons.length}`
    );
    console.log(`   📦 Total Blocks: ${contentGenerationResults.totalBlocks}`);
    if (contentGenerationResults.failedCount > 0) {
      console.warn(`   ❌ Failed: ${contentGenerationResults.failedCount}`);
    }

    // Log final summary
    console.log(`📊 Final creation summary:`);
    console.log(`   ✅ Course: Created successfully`);
    console.log(
      `   📚 Modules: ${createdModules.length}/${courseStructure.modules.length} created`
    );
    console.log(`   📝 Lessons: ${createdLessons.length} created`);
    console.log(
      `   📦 Content: ${contentGenerationResults.successCount} lessons with AI-generated content`
    );

    if (moduleErrors.length > 0) {
      console.warn(`   ⚠️ Module errors: ${moduleErrors.length}`);
    }
    if (lessonErrors.length > 0) {
      console.warn(`   ⚠️ Lesson errors: ${lessonErrors.length}`);
    }
    if (contentGenerationResults.failedCount > 0) {
      console.warn(
        `   ⚠️ Content generation errors: ${contentGenerationResults.failedCount}`
      );
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
          errors:
            contentGenerationResults.errors.length > 0
              ? contentGenerationResults.errors
              : undefined,
        },
        moduleErrors: moduleErrors.length > 0 ? moduleErrors : undefined,
        lessonErrors: lessonErrors.length > 0 ? lessonErrors : undefined,
      },
    };
  } catch (error) {
    console.error('❌ Complete AI course creation failed:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

/**
 * Generate and upload AI course image to S3
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Uploaded image data with S3 URL
 */
export async function generateAndUploadCourseImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating course image:', prompt);

    const tier = options?.tier || 'standard';
    const result = await secureAIService.generateCourseImage(prompt, {
      ...options,
      tier,
    });

    if (result.success) {
      console.log('✅ Image generation successful');
      return result;
    } else {
      console.warn('🔄 Image generation failed:', result.error);

      // Fallback to placeholder
      let imageUrl = null;
      let generationMethod = 'fallback';

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
          ctx.fillText(line, 512, 450 + index * 60);
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
      // Step 3: Try to upload to S3 using AI endpoint
      let s3Url = imageUrl; // Default to original URL
      let uploadSuccess = false;

      try {
        console.log('🤖 Uploading AI-generated image via /api/ai endpoint...');

        // Use AI upload service for AI-generated images
        const uploadResponse = await uploadAIGeneratedImage(imageUrl, {
          public: true,
        });

        if (uploadResponse && uploadResponse.imageUrl) {
          s3Url = uploadResponse.imageUrl;
          uploadSuccess = true;
          console.log(
            '✅ AI image uploaded to S3 via /api/ai endpoint:',
            s3Url
          );
        }
      } catch (uploadError) {
        console.warn(
          '📤 AI endpoint upload failed, trying fallback...',
          uploadError.message
        );

        // Fallback to regular upload if AI endpoint fails
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], `ai-course-image-${Date.now()}.png`, {
              type: 'image/png',
            });

            const uploadResponse = await uploadImage(file, {
              folder: 'course-thumbnails',
              public: true,
              type: 'image',
            });

            if (uploadResponse && uploadResponse.imageUrl) {
              s3Url = uploadResponse.imageUrl;
              uploadSuccess = true;
              console.log('✅ S3 upload successful via fallback');
            }
          }
        } catch (fallbackError) {
          console.warn(
            '📤 Fallback upload also failed, using direct image URL:',
            fallbackError.message
          );
        }
      }

      return {
        success: true,
        data: {
          s3Url: s3Url,
          url: s3Url,
          fileName: `ai-course-image-${Date.now()}.png`,
          fileSize: uploadSuccess ? 'unknown' : 'placeholder',
          prompt: prompt,
          style: options.style,
          generationMethod: generationMethod,
          uploadedToS3: uploadSuccess,
          createdAt: new Date().toISOString(),
        },
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
        url: placeholderDataUrl,
        fileName: 'placeholder-image.png',
        fileSize: 'placeholder',
        prompt: prompt,
        style: options.style,
        generationMethod: 'error-fallback-canvas',
        uploadedToS3: false,
        createdAt: new Date().toISOString(),
      },
      error: error.message,
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
    console.log('🎨 Generating course image:', prompt);
    const tier = options?.tier || 'standard';
    const aiResult = await secureAIService.generateCourseImage(prompt, {
      ...options,
      tier,
    });

    if (aiResult.success && aiResult.data) {
      console.log('✅ Image generation successful');
      return aiResult;
    } else {
      console.warn('AI generation failed:', aiResult.error);
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
        createdAt: new Date().toISOString(),
      },
      error: error.message,
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

    const prompt = `Summarize the following content in ${options.length || 'medium'} length and format as ${options.type || 'bullet'}:
      
${content}`;

    let summary;
    try {
      summary = await secureAIService.generateText(prompt, {
        tier: options?.tier || 'standard',
        maxTokens: 300,
        temperature: 0.3,
      });
    } catch (summarizeError) {
      console.warn(
        'AI summarization failed, using fallback:',
        summarizeError.message
      );

      // Simple fallback summarization
      const sentences = content
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 0);
      summary = sentences.slice(0, 3).join('. ') + '.';
    }

    return {
      success: true,
      data: {
        summary: summary,
        originalLength: content.length,
        summaryLength: summary.length,
        type: options.type,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Content summarization failed:', error);
    return {
      success: false,
      error: error.message,
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

    const prompt = `Answer the following question based on the provided context:
      
Question: ${question}

Context: ${context || 'No specific context provided'}

Provide a clear, educational answer that would be helpful for a student learning this topic.`;

    let answer;
    try {
      answer = await secureAIService.generateText(prompt, {
        tier: 'standard',
        maxTokens: 500,
        temperature: 0.5,
      });
    } catch (qaError) {
      console.warn('AI QA failed, using fallback:', qaError.message);

      // Simple fallback answer
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
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Course content search failed:', error);
    return {
      success: false,
      error: error.message,
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
      const response = await secureAIService.generateText(prompt, {
        tier: 'standard',
        maxTokens: 600,
        temperature: 0.5,
      });

      const jsonMatch =
        typeof response === 'string' ? response.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
      qa = Array.isArray(parsed.qa) ? parsed.qa : [];
    } catch (primaryError) {
      console.warn(
        'Primary QA generation failed, using simple fallback:',
        primaryError.message
      );
      // Simple fallback without external API
      qa = Array.from({ length: count }).map((_, i) => ({
        question: `What is a key concept about ${topic}? (${i + 1})`,
        answer: `A fundamental idea related to ${topic}.`,
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
 * Generate safe lesson content
 * @param {string} prompt - Lesson topic or prompt
 * @param {Object} options - { context?: string, level?: string }
 * @returns {Promise<{success:boolean, data:Object}>}
 */
export async function generateSafeLessonContent(prompt, options = {}) {
  // Simply call the regular lesson generation (moderation removed)
  return await generateLessonFromPrompt(prompt, options);
}

/**
 * Generate a structured lesson from a topic/prompt
 * @param {string} prompt - Lesson topic or prompt
 * @param {Object} options - { context?: string, level?: string }
 * @returns {Promise<{success:boolean, data:Object}>}
 */
export async function generateLessonFromPrompt(prompt, options = {}) {
  try {
    const sysPrompt = `Create a structured lesson as JSON with keys: introduction (string), mainContent (array of strings), examples (array of {title, description}), keyTakeaways (array of strings), summary (string). Keep concise and instructional.`;
    const userPrompt = `Topic: ${prompt}${options.context ? `\nContext: ${options.context}` : ''}\nLevel: ${options.level || 'beginner'}`;

    let lesson;
    try {
      const response = await secureAIService.generateStructured(
        sysPrompt,
        userPrompt
      );
      lesson = response;
    } catch {
      const text = await secureAIService.generateText(
        `${sysPrompt}\n\n${userPrompt}`,
        { tier: 'standard', maxTokens: 800, temperature: 0.6 }
      );
      const jsonMatch =
        typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      lesson = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    }

    // Normalize fields
    lesson = lesson || {};
    return {
      success: true,
      data: {
        introduction: lesson.introduction || '',
        mainContent: Array.isArray(lesson.mainContent)
          ? lesson.mainContent
          : [],
        examples: Array.isArray(lesson.examples) ? lesson.examples : [],
        keyTakeaways: Array.isArray(lesson.keyTakeaways)
          ? lesson.keyTakeaways
          : [],
        summary: lesson.summary || '',
      },
    };
  } catch (error) {
    console.error('❌ Prompt-to-lesson generation failed:', error);
    return {
      success: false,
      data: {
        introduction: '',
        mainContent: [],
        examples: [],
        keyTakeaways: [],
        summary: '',
      },
      error: error.message,
    };
  }
}

/**
 * Generate MCQ assessments for a topic
 * Returns normalized questions for bulk upload API
 */
export async function generateAssessmentQuestions(
  topic,
  count = 5,
  context = ''
) {
  try {
    const prompt = `Create ${count} multiple-choice questions (MCQs) for the topic "${topic}"${context ? ` with context: ${context}` : ''}. Return JSON {"questions": [{"question": "...", "options": ["A","B","C","D"], "answerIndex": 0}]}`;
    let questions = [];
    try {
      const text = await secureAIService.generateText(prompt, {
        tier: 'standard',
        maxTokens: 1000,
        temperature: 0.6,
      });
      const jsonMatch =
        typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch (e) {
      console.warn(
        'Primary assessment generation failed, using fallback:',
        e.message
      );
      questions = Array.from({ length: count }).map((_, i) => ({
        question: `Which statement about ${topic} is correct? (${i + 1})`,
        options: [
          `${topic} relates to concept A`,
          `${topic} relates to concept B`,
          `${topic} relates to concept C`,
          `${topic} relates to concept D`,
        ],
        answerIndex: 0,
      }));
    }
    // Normalize for bulk upload format
    const normalized = questions.map((q, idx) => ({
      question_text: String(q.question),
      options: (q.options || []).map(String),
      correct_option_index: Number.isInteger(q.answerIndex) ? q.answerIndex : 0,
      order: idx + 1,
      difficulty: options?.level || 'EASY',
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
          generationMethod: 'ai-service',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Failed to save AI course:', error);
    return {
      success: false,
      error: error.message,
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
    console.log(
      '💾 Saving AI-generated lessons to database:',
      lessonData.courseTitle
    );

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
      totalBlocks: lessons.reduce(
        (acc, lesson) => acc + (lesson.blocks?.length || 0),
        0
      ),
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
          title:
            moduleLessons[0]?.moduleTitle ||
            `AI Generated Module ${createdModules.length + 1}`,
          description: `AI-generated module containing ${moduleLessons.length} lessons`,
          order: createdModules.length + 1,
          price: 0, // Required field
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
              order: createdLessons.length + 1,
            };

            console.log('🔄 Creating lesson:', lessonPayload.title);
            const createdLesson = await createLesson(
              courseId,
              createdModule.id,
              lessonPayload
            );
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
                  blockBased: blockBased,
                },
              };

              console.log(
                '🔄 Updating lesson content for:',
                lessonPayload.title
              );
              await updateLessonContent(createdLesson.id, contentData);
            }
          } catch (lessonError) {
            console.error(
              '❌ Failed to create lesson:',
              lesson.title,
              lessonError
            );
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
      lessonsCreated: createdLessons.length,
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
          message: 'Lessons saved successfully to database',
        },
      },
    };
  } catch (error) {
    console.error('❌ Failed to save AI lessons to database:', error);
    return {
      success: false,
      error: error.message || 'Failed to save lessons to database',
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
      totalBlocks:
        contentData.lessons?.reduce(
          (acc, lesson) => acc + (lesson.blocks?.length || 0),
          0
        ) || 0,
      lessons:
        contentData.lessons?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          blocks: lesson.blocks || [],
          structuredContent: lesson.structuredContent || [],
          contentUpdatedAt: lesson.contentUpdatedAt || new Date().toISOString(),
        })) || [],
      globalContent: contentData.globalContent || {},
      savedAt: contentData.savedAt || new Date().toISOString(),
    };

    console.log('📚 Enhanced content data to update:', processedData);

    // Try to save to backend API if available
    try {
      const response = await fetch(
        `${API_BASE}/api/courses/${contentData.courseId}/content`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(processedData),
        }
      );

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
            backendSaved: true,
          },
        };
      } else {
        console.warn('⚠️ Backend save failed, using local storage fallback');
        throw new Error(`Backend save failed: ${response.status}`);
      }
    } catch (backendError) {
      console.warn(
        '⚠️ Backend not available, using local storage:',
        backendError.message
      );

      // Fallback to localStorage
      const storageKey = `lesson_content_${contentData.courseId || 'temp'}`;
      localStorage.setItem(storageKey, JSON.stringify(processedData));

      // Also save to a general backup
      const allSavedContent = JSON.parse(
        localStorage.getItem('ai_lesson_backups') || '{}'
      );
      allSavedContent[contentData.courseId || 'temp'] = processedData;
      localStorage.setItem(
        'ai_lesson_backups',
        JSON.stringify(allSavedContent)
      );

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
          localStorageKey: storageKey,
        },
      };
    }
  } catch (error) {
    console.error('❌ Failed to update lesson content:', error);
    return {
      success: false,
      error: error.message || 'Failed to update lesson content',
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Failed to retrieve AI lessons:', error);
    return {
      success: false,
      error: error.message,
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Failed to retrieve AI courses:', error);
    return {
      success: false,
      error: error.message,
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
          module_title:
            'Introduction to ' + (courseData.subject || 'the subject'),
          lesson: {
            lesson_title: 'Getting Started',
            lesson_intro: 'An introduction to the fundamental concepts',
            lesson_content: [
              {
                subtopic: 'Key Concepts',
                content: 'Understanding the basic principles',
              },
              {
                subtopic: 'Practical Applications',
                content: 'Real-world examples and use cases',
              },
            ],
            summary:
              'This lesson provides a foundation for understanding the subject matter.',
          },
        },
        {
          module_title: 'Advanced ' + (courseData.subject || 'Topics'),
          lesson: {
            lesson_title: 'Deep Dive',
            lesson_intro: 'Exploring advanced concepts and techniques',
            lesson_content: [
              {
                subtopic: 'Advanced Techniques',
                content: 'In-depth exploration of complex topics',
              },
              {
                subtopic: 'Best Practices',
                content: 'Industry-standard approaches and methodologies',
              },
            ],
            summary:
              'This lesson builds on the foundation to explore more complex topics.',
          },
        },
      ],
    };

    return {
      success: true,
      data: mockOutline,
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
        style: options.style || 'realistic',
      },
    };
  }

  async summarizeContent(content, options = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock response - in a real implementation, this would call a summarization service
    return {
      success: true,
      data: {
        summary:
          'This is a summarized version of the provided content. In a real implementation, this would be generated by an AI summarization service.',
        originalLength: content.length,
        summaryLength: 100,
        type: options.type || 'bullet',
      },
    };
  }
}

/**
 * Create a simple AI course with 1 module and 1 lesson using AI generation
 * @param {Object} courseData - Basic course information
 * @returns {Promise<Object>} Created course structure with AI-generated content
 */
export async function createSimpleAICourse(courseData) {
  try {
    console.log('🚀 Creating simple AI course:', courseData.title);

    // Step 1: Generate AI course outline for single lesson
    console.log('📋 Step 1: Generating AI lesson outline...');
    const aiPrompt = `Create a single comprehensive lesson for the course "${courseData.title}".

Course Details:
- Subject: ${courseData.subject || 'General'}
- Description: ${courseData.description || 'Educational content'}
- Target Audience: ${courseData.targetAudience || 'Beginners'}
- Difficulty: ${courseData.difficulty || 'beginner'}

Create a structured lesson with:
- Clear lesson title and description
- Learning objectives (3-4 points)
- Main content sections (3-4 sections)
- Practical examples
- Summary/key takeaways

Format as JSON:
{
  "lesson_title": "Lesson Name",
  "lesson_description": "Brief description",
  "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "content_sections": [
    {
      "title": "Section Title",
      "content": "Section content"
    }
  ],
  "examples": ["Example 1", "Example 2"],
  "key_takeaways": ["Takeaway 1", "Takeaway 2"]
}`;

    let lessonStructure;
    try {
      const aiResult = await enhancedAIService.generateText(aiPrompt, {
        systemPrompt:
          'You are an expert educational content creator. Generate well-structured lesson content in JSON format.',
        maxTokens: 1000,
        temperature: 0.7,
      });

      if (aiResult.success) {
        try {
          const content = aiResult.data.text;
          const jsonMatch =
            content.match(/```json\n([\s\S]*?)\n```/) ||
            content.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
          lessonStructure = JSON.parse(jsonString);
          console.log('✅ AI lesson structure generated');
        } catch (parseError) {
          console.warn('Failed to parse AI response, using fallback');
          throw new Error('JSON parse failed');
        }
      } else {
        throw new Error(aiResult.error || 'AI generation failed');
      }
    } catch (aiError) {
      console.warn(
        'AI generation failed, using fallback structure:',
        aiError.message
      );
      lessonStructure = {
        lesson_title: `Introduction to ${courseData.title}`,
        lesson_description: `Learn the fundamentals of ${courseData.title}`,
        learning_objectives: [
          `Understand the basic concepts of ${courseData.title}`,
          `Apply key principles in practical scenarios`,
          `Identify best practices and common patterns`,
          `Build confidence in using ${courseData.title}`,
        ],
        content_sections: [
          {
            title: 'What is ' + courseData.title + '?',
            content: `${courseData.title} is a fundamental concept that helps you build better applications and solve complex problems.`,
          },
          {
            title: 'Key Concepts',
            content: `Understanding the core principles of ${courseData.title} is essential for effective implementation.`,
          },
          {
            title: 'Best Practices',
            content: `Follow these proven approaches to get the most out of ${courseData.title}.`,
          },
        ],
        examples: [
          `Basic ${courseData.title} implementation`,
          `Real-world use case example`,
          `Common patterns and solutions`,
        ],
        key_takeaways: [
          `${courseData.title} provides powerful capabilities`,
          `Practice is key to mastering the concepts`,
          `Start with simple examples and build complexity`,
        ],
      };
    }

    // Step 2: Create Course
    console.log('📚 Step 2: Creating course...');
    const coursePayload = {
      title: courseData.title,
      description:
        courseData.description || `Learn ${courseData.title} fundamentals`,
      subject: courseData.subject || courseData.title,
      objectives: lessonStructure.learning_objectives.join('\n'),
      duration: courseData.duration || '1 week',
      max_students: courseData.max_students || 100,
      price: courseData.price || '0',
      thumbnail: courseData.thumbnail || null,
    };

    const course = await createAICourse(coursePayload);
    const courseId = course.data?.id || course.id;
    console.log('✅ Course created:', courseId);

    // Step 3: Create Module
    console.log('📖 Step 3: Creating module...');
    const moduleData = {
      title: 'Module 1: ' + lessonStructure.lesson_title,
      description: lessonStructure.lesson_description,
      order: 1,
      estimated_duration: 60,
      module_status: 'PUBLISHED',
      price: 0,
    };
    // Note: Thumbnail omitted - will be added separately if needed

    const module = await createModule(courseId, moduleData);
    const moduleId = module.data?.id || module.id;
    console.log('✅ Module created:', moduleId);

    // Step 4: Create Lesson
    console.log('📝 Step 4: Creating lesson...');
    const lessonPayload = {
      title: lessonStructure.lesson_title,
      description: lessonStructure.lesson_description,
      order: 1,
      status: 'PUBLISHED',
      duration: courseData.lessonDuration || '30 min',
    };

    const lesson = await createLesson(courseId, moduleId, lessonPayload);
    const lessonId = lesson.data?.id || lesson.id;
    console.log('✅ Lesson created:', lessonId);

    // Step 5: Generate Comprehensive AI Content using ALL Content Library Types
    console.log(
      '📦 Step 5: Generating comprehensive AI lesson content using all content library types...'
    );

    // Enhanced gradient color schemes with better color combinations
    const gradientSchemes = [
      {
        from: 'indigo-600',
        via: 'purple-600',
        to: 'pink-600',
        accent: 'indigo-700',
        name: 'Royal Purple',
      },
      {
        from: 'emerald-600',
        via: 'teal-600',
        to: 'cyan-600',
        accent: 'emerald-700',
        name: 'Ocean Breeze',
      },
      {
        from: 'orange-600',
        via: 'red-600',
        to: 'pink-600',
        accent: 'orange-700',
        name: 'Sunset Fire',
      },
      {
        from: 'blue-600',
        via: 'indigo-600',
        to: 'purple-600',
        accent: 'blue-700',
        name: 'Deep Ocean',
      },
      {
        from: 'green-600',
        via: 'emerald-600',
        to: 'teal-600',
        accent: 'green-700',
        name: 'Forest Green',
      },
      {
        from: 'violet-600',
        via: 'fuchsia-600',
        to: 'pink-600',
        accent: 'violet-700',
        name: 'Mystic Purple',
      },
      {
        from: 'rose-600',
        via: 'pink-600',
        to: 'fuchsia-600',
        accent: 'rose-700',
        name: 'Rose Garden',
      },
      {
        from: 'amber-600',
        via: 'yellow-600',
        to: 'orange-600',
        accent: 'amber-700',
        name: 'Golden Sun',
      },
    ];

    const contentBlocks = [];
    let blockOrder = 1;

    // Content Library Types to Use:
    // 1. text (6 subtypes: heading, master_heading, subheading, paragraph, heading_paragraph, subheading_paragraph)
    // 2. statement (5 subtypes: statement-a, statement-b, statement-c, statement-d, note)
    // 3. quote (6 subtypes: quote_a, quote_b, quote_c, quote_d, quote_on_image, quote_carousel)
    // 4. image (3 layouts: centered, side-by-side, overlay)
    // 5. list (3 types: bulleted, numbered, checkbox)
    // 6. tables
    // 7. interactive
    // 8. divider (2 subtypes: regular, continue)
    // 9. youtube
    // 10. video
    // 11. audio
    // 12. link
    // 13. pdf

    // PAGE 1: Master Heading Block (First Page)
    contentBlocks.push({
      type: 'text',
      block_id: `ai_master_title_${lessonId}`,
      textType: 'master_heading',
      html_css: `
        <div class="relative overflow-hidden rounded-3xl p-12 bg-gradient-to-br from-${gradientSchemes[0].from} via-${gradientSchemes[0].via} to-${gradientSchemes[0].to} text-white mb-8 shadow-2xl">
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24 animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-18 -translate-x-18"></div>
          <div class="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12"></div>
          <div class="relative z-10">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6 backdrop-blur-sm">
                <span class="text-3xl">🎓</span>
              </div>
              <div class="flex-1">
                <div class="h-px bg-white/30 mb-2"></div>
                <p class="text-white/70 text-sm font-medium tracking-wider uppercase">Lesson Introduction</p>
                <div class="h-px bg-white/30 mt-2"></div>
              </div>
            </div>
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">${lessonStructure.lesson_title}</h1>
            <p class="text-2xl text-white/90 font-medium leading-relaxed">${lessonStructure.lesson_description}</p>
            <div class="mt-8 flex items-center">
              <div class="w-3 h-3 bg-white/40 rounded-full mr-2"></div>
              <div class="w-6 h-6 bg-white/60 rounded-full mr-2"></div>
              <div class="w-3 h-3 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        textType: 'master_heading',
        title: lessonStructure.lesson_title,
        content: lessonStructure.lesson_description,
      },
    });

    // PAGE BREAK: Continue Divider (Moves to Page 2)
    contentBlocks.push({
      type: 'divider',
      block_id: `ai_page_break_${lessonId}`,
      subtype: 'continue',
      html_css: `
        <div class="flex items-center justify-center py-12 mb-8">
          <div class="flex flex-col items-center space-y-6">
            <div class="flex items-center space-x-4">
              <div class="w-20 h-px bg-gradient-to-r from-transparent via-${gradientSchemes[1].from} to-transparent"></div>
              <div class="w-4 h-4 bg-gradient-to-r from-${gradientSchemes[1].from} to-${gradientSchemes[1].to} rounded-full animate-pulse"></div>
              <div class="w-32 h-px bg-gradient-to-r from-${gradientSchemes[1].from} to-${gradientSchemes[1].to}"></div>
              <div class="w-4 h-4 bg-gradient-to-r from-${gradientSchemes[1].to} to-${gradientSchemes[1].from} rounded-full animate-pulse"></div>
              <div class="w-20 h-px bg-gradient-to-r from-${gradientSchemes[1].to} via-transparent to-transparent"></div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg px-8 py-4 border border-${gradientSchemes[1].from}/20">
              <p class="text-${gradientSchemes[1].accent} font-semibold text-lg">Continue to Next Section →</p>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        type: 'continue_divider',
        subtype: 'continue',
      },
    });

    // PAGE 2 CONTENT: Using ALL Content Library Types

    // 1. HEADING TEXT BLOCK - Course Introduction
    contentBlocks.push({
      type: 'text',
      block_id: `ai_intro_heading_${lessonId}`,
      textType: 'heading',
      html_css: `
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Welcome to ${lessonStructure.lesson_title}</h1>
          <div class="w-24 h-1 bg-gradient-to-r from-${gradientSchemes[1].from} to-${gradientSchemes[1].to} rounded-full"></div>
        </div>
      `,
      order: blockOrder++,
      details: {
        textType: 'heading',
        title: `Welcome to ${lessonStructure.lesson_title}`,
        content: `Welcome to ${lessonStructure.lesson_title}`,
      },
    });

    // 2. STATEMENT BLOCK - Important Note (statement-c type)
    contentBlocks.push({
      type: 'statement',
      block_id: `ai_intro_statement_${lessonId}`,
      statementType: 'statement-c',
      html_css: `
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-${gradientSchemes[1].from} p-6 rounded-r-xl shadow-sm mb-8">
          <div class="flex items-start">
            <div class="w-8 h-8 bg-${gradientSchemes[1].from} rounded-full flex items-center justify-center mr-4 mt-1">
              <span class="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Important</h3>
              <p class="text-gray-700 leading-relaxed">This lesson will provide you with comprehensive knowledge about ${courseData.title}. Take your time to understand each concept thoroughly.</p>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        statementType: 'statement-c',
        content: `This lesson will provide you with comprehensive knowledge about ${courseData.title}. Take your time to understand each concept thoroughly.`,
      },
    });

    // 3. QUOTE BLOCK - Inspirational Quote (quote_b type)
    contentBlocks.push({
      type: 'quote',
      block_id: `ai_inspiration_quote_${lessonId}`,
      textType: 'quote_b',
      quoteType: 'quote_b',
      html_css: `
        <div class="text-center bg-gray-50 rounded-2xl p-12 mb-8 shadow-lg">
          <blockquote class="text-3xl font-thin text-gray-800 mb-6 leading-relaxed italic">
            "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence."
          </blockquote>
          <div class="flex items-center justify-center">
            <div class="w-12 h-px bg-${gradientSchemes[2].from} mr-4"></div>
            <cite class="text-${gradientSchemes[2].accent} font-semibold text-lg not-italic">Abigail Adams</cite>
            <div class="w-12 h-px bg-${gradientSchemes[2].to} ml-4"></div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        textType: 'quote_b',
        quoteType: 'quote_b',
        content: JSON.stringify({
          quote:
            'Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.',
          author: 'Abigail Adams',
        }),
      },
    });

    // 4. IMAGE BLOCK - AI Generated Learning Objectives Illustration
    console.log('🖼️ Generating AI image for learning objectives...');
    let objectivesImageUrl = null;
    try {
      let objectivesPrompt = `Professional educational illustration showing learning objectives and goals for ${lessonStructure.lesson_title}. Modern, clean design with icons representing education, targets, and achievement. Bright colors, minimalist style.`;

      // Enhance with 7-layer premium quality system
      objectivesPrompt += ` QUALITY: soft cinematic lighting, volumetric light, ultra-detailed, 8K clarity, crisp textures, photorealistic depth, centered composition, balanced spacing, clean layout, soft deep shadows, realistic reflections, smooth lighting falloff, glossy surface, metallic reflections, no text, no watermarks, clean background. Vivid, premium quality.`;

      const imageResult = await generateImage({
        prompt: objectivesPrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      if (imageResult.success) {
        objectivesImageUrl = imageResult.data.url;
        console.log('✅ Learning objectives image generated successfully');
      }
    } catch (imageError) {
      console.warn(
        '⚠️ Failed to generate objectives image:',
        imageError.message
      );
    }

    if (objectivesImageUrl) {
      contentBlocks.push({
        type: 'image',
        block_id: `ai_objectives_image_${lessonId}`,
        html_css: `
          <div class="lesson-image centered mb-8">
            <div class="text-center">
              <img src="${objectivesImageUrl}" alt="Learning Objectives Illustration" class="w-full max-w-3xl mx-auto h-80 object-cover rounded-2xl shadow-2xl" />
              <div class="mt-6 p-6 bg-gradient-to-r from-${gradientSchemes[3].from}/10 to-${gradientSchemes[3].to}/10 rounded-xl">
                <h3 class="text-2xl font-bold text-${gradientSchemes[3].accent} mb-2">Learning Objectives</h3>
                <p class="text-gray-600">Visual representation of what you'll achieve in this lesson</p>
              </div>
            </div>
          </div>
        `,
        order: blockOrder++,
        details: {
          image_url: objectivesImageUrl,
          alt_text: 'Learning Objectives Illustration',
          caption:
            "Visual representation of what you'll achieve in this lesson",
          layout: 'centered',
          aiGenerated: true,
        },
      });
    }

    // 5. LIST BLOCK - Learning Objectives (numbered list)
    contentBlocks.push({
      type: 'list',
      block_id: `ai_objectives_list_${lessonId}`,
      listType: 'numbered',
      html_css: `
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[3].from} to-${gradientSchemes[3].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">🎯</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-800">What You'll Learn</h2>
          </div>
          <ol class="space-y-4">
            ${lessonStructure.learning_objectives
              .map(
                (obj, index) => `
              <li class="flex items-start">
                <div class="w-8 h-8 bg-gradient-to-r from-${gradientSchemes[3].from} to-${gradientSchemes[3].to} rounded-full flex items-center justify-center text-white font-bold mr-4 mt-1 shadow-md">
                  ${index + 1}
                </div>
                <div class="flex-1 p-4 bg-gradient-to-r from-${gradientSchemes[3].from}/5 to-${gradientSchemes[3].to}/5 rounded-xl border border-${gradientSchemes[3].from}/20">
                  <p class="text-gray-700 leading-relaxed font-medium">${obj}</p>
                </div>
              </li>
            `
              )
              .join('')}
          </ol>
        </div>
      `,
      order: blockOrder++,
      details: {
        listType: 'numbered',
        content: JSON.stringify({
          items: lessonStructure.learning_objectives,
          listType: 'numbered',
        }),
      },
    });

    // 6. YOUTUBE BLOCK - Educational Video (placeholder)
    contentBlocks.push({
      type: 'youtube',
      block_id: `ai_intro_video_${lessonId}`,
      html_css: `
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">📺</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Introduction Video</h2>
          </div>
          <div class="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 text-center border border-red-200">
            <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-3xl">▶️</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Watch: ${lessonStructure.lesson_title} Overview</h3>
            <p class="text-gray-600 mb-4">Get a quick introduction to the key concepts we'll cover</p>
            <div class="text-sm text-gray-500">
              <p>🎥 Duration: 5-10 minutes</p>
              <p>📚 Level: ${courseData.level || 'Beginner'}</p>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        youtube_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, // Placeholder
        youtube_title: `${lessonStructure.lesson_title} Overview`,
        caption: `Introduction video for ${lessonStructure.lesson_title}`,
      },
    });

    // 7. LINK BLOCK - Additional Resources
    contentBlocks.push({
      type: 'link',
      block_id: `ai_resources_link_${lessonId}`,
      html_css: `
        <div class="bg-gradient-to-r from-${gradientSchemes[4].from}/10 to-${gradientSchemes[4].to}/10 rounded-2xl p-6 mb-8 border border-${gradientSchemes[4].from}/20">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[4].from} to-${gradientSchemes[4].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">🔗</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Additional Resources</h3>
              <p class="text-gray-600 mb-3">Explore more about ${courseData.title} with these curated resources</p>
              <a href="https://example.com" class="inline-flex items-center text-${gradientSchemes[4].accent} font-semibold hover:underline">
                📖 Read More About ${courseData.title}
                <span class="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        link_url: 'https://example.com',
        link_text: `Read More About ${courseData.title}`,
        description: `Explore more about ${courseData.title} with these curated resources`,
      },
    });

    // 8. CONTENT SECTIONS with Multiple Content Types
    for (
      let index = 0;
      index < lessonStructure.content_sections.length;
      index++
    ) {
      const section = lessonStructure.content_sections[index];
      const scheme = gradientSchemes[(index + 5) % gradientSchemes.length];

      // 8a. SUBHEADING TEXT BLOCK for section
      contentBlocks.push({
        type: 'text',
        block_id: `ai_section_subheading_${lessonId}_${index}`,
        textType: 'subheading',
        html_css: `
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-3">${section.title}</h2>
            <div class="w-16 h-1 bg-gradient-to-r from-${scheme.from} to-${scheme.to} rounded-full"></div>
          </div>
        `,
        order: blockOrder++,
        details: {
          textType: 'subheading',
          title: section.title,
          content: section.title,
        },
      });

      // 8b. Generate AI Image for section
      console.log(`🖼️ Generating AI image for section: ${section.title}...`);
      let sectionImageUrl = null;
      try {
        let sectionPrompt = `Professional illustration for educational content about "${section.title}" in the context of ${lessonStructure.lesson_title}. Modern, clean design with relevant icons and visual elements. Educational style, bright colors.`;

        // Enhance with 7-layer premium quality system
        sectionPrompt += ` QUALITY: soft cinematic lighting, volumetric light, ultra-detailed, 8K clarity, crisp textures, photorealistic depth, centered composition, balanced spacing, clean layout, soft deep shadows, realistic reflections, smooth lighting falloff, glossy surface, metallic reflections, no text, no watermarks, clean background. Vivid, premium quality.`;

        const imageResult = await generateImage({
          prompt: sectionPrompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        });

        if (imageResult.success) {
          sectionImageUrl = imageResult.data.url;
          console.log(`✅ Section ${index + 1} image generated successfully`);
        }
      } catch (imageError) {
        console.warn(
          `⚠️ Failed to generate section ${index + 1} image:`,
          imageError.message
        );
      }

      // 8c. IMAGE BLOCK with side-by-side layout
      if (sectionImageUrl) {
        const alignment = index % 2 === 0 ? 'left' : 'right';
        const imageOrder = alignment === 'left' ? 'order-1' : 'order-2';
        const textOrder = alignment === 'left' ? 'order-2' : 'order-1';

        contentBlocks.push({
          type: 'image',
          block_id: `ai_section_image_${lessonId}_${index}`,
          html_css: `
            <div class="lesson-image side-by-side mb-8">
              <div class="grid md:grid-cols-2 gap-8 items-center bg-gradient-to-r from-${scheme.from}/5 to-${scheme.to}/5 rounded-2xl p-8 border border-${scheme.from}/20">
                <div class="${imageOrder}">
                  <img src="${sectionImageUrl}" alt="${section.title} Illustration" class="w-full max-h-80 object-cover rounded-xl shadow-lg" />
                </div>
                <div class="${textOrder}">
                  <h3 class="text-2xl font-bold text-${scheme.accent} mb-4">${section.title}</h3>
                  <p class="text-gray-700 text-lg leading-relaxed">${section.content}</p>
                  <div class="mt-4 inline-flex items-center text-${scheme.accent} font-semibold">
                    <span class="w-2 h-2 bg-${scheme.from} rounded-full mr-2"></span>
                    Key Concept
                  </div>
                </div>
              </div>
            </div>
          `,
          order: blockOrder++,
          details: {
            image_url: sectionImageUrl,
            alt_text: `${section.title} Illustration`,
            caption: section.content,
            layout: 'side-by-side',
            alignment: alignment,
            aiGenerated: true,
          },
        });
      } else {
        // 8d. PARAGRAPH TEXT BLOCK if no image
        contentBlocks.push({
          type: 'text',
          block_id: `ai_section_paragraph_${lessonId}_${index}`,
          textType: 'paragraph',
          html_css: `
            <div class="bg-gradient-to-r from-${scheme.from}/5 to-${scheme.to}/5 rounded-2xl p-8 mb-8 border border-${scheme.from}/20">
              <p class="text-gray-700 leading-relaxed text-lg font-medium">${section.content}</p>
            </div>
          `,
          order: blockOrder++,
          details: {
            textType: 'paragraph',
            content: section.content,
          },
        });
      }
    }

    // 9. TABLE BLOCK - Comparison or Summary Table
    contentBlocks.push({
      type: 'table', // Use singular to match backend and most frontend code
      block_id: `ai_summary_table_${lessonId}`,
      html_css: `
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[5].from} to-${gradientSchemes[5].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">📊</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Key Concepts Summary</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gradient-to-r from-${gradientSchemes[5].from}/10 to-${gradientSchemes[5].to}/10">
                  <th class="border border-${gradientSchemes[5].from}/20 p-4 text-left font-semibold text-gray-800">Concept</th>
                  <th class="border border-${gradientSchemes[5].from}/20 p-4 text-left font-semibold text-gray-800">Description</th>
                  <th class="border border-${gradientSchemes[5].from}/20 p-4 text-left font-semibold text-gray-800">Importance</th>
                </tr>
              </thead>
              <tbody>
                ${lessonStructure.content_sections
                  .map(
                    (section, index) => `
                  <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="border border-gray-200 p-4 font-medium text-${gradientSchemes[5].accent}">${section.title}</td>
                    <td class="border border-gray-200 p-4 text-gray-700">${section.content.substring(0, 100)}...</td>
                    <td class="border border-gray-200 p-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${gradientSchemes[5].from}/10 text-${gradientSchemes[5].accent}">
                        Essential
                      </span>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        table_data: {
          headers: ['Concept', 'Description', 'Importance'],
          rows: lessonStructure.content_sections.map(section => [
            section.title,
            section.content.substring(0, 100) + '...',
            'Essential',
          ]),
        },
      },
    });

    // 10. AUDIO BLOCK - Podcast or Audio Summary
    contentBlocks.push({
      type: 'audio',
      block_id: `ai_audio_summary_${lessonId}`,
      html_css: `
        <div class="bg-gradient-to-r from-${gradientSchemes[6].from}/10 to-${gradientSchemes[6].to}/10 rounded-2xl p-8 mb-8 border border-${gradientSchemes[6].from}/20">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[6].from} to-${gradientSchemes[6].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">🎧</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Audio Summary</h2>
          </div>
          <div class="bg-white rounded-xl p-6 border border-${gradientSchemes[6].from}/20">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-r from-${gradientSchemes[6].from} to-${gradientSchemes[6].to} rounded-full flex items-center justify-center">
                <span class="text-white text-2xl">🎵</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">${lessonStructure.lesson_title} - Audio Summary</h3>
                <p class="text-gray-600">Listen to a comprehensive overview of this lesson</p>
              </div>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>🎙️ Duration: 10-15 minutes</span>
              <span>📱 Available offline</span>
              <span>🔊 High quality audio</span>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        audio_url: 'https://example.com/audio.mp3', // Placeholder
        audio_title: `${lessonStructure.lesson_title} - Audio Summary`,
        description: 'Listen to a comprehensive overview of this lesson',
      },
    });

    // 11. REGULAR DIVIDER - Visual Separation
    contentBlocks.push({
      type: 'divider',
      block_id: `ai_divider_${lessonId}`,
      html_css: `
        <div class="flex items-center justify-center py-8 mb-8">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-px bg-gradient-to-r from-transparent via-${gradientSchemes[7].from} to-transparent"></div>
            <div class="w-3 h-3 bg-gradient-to-r from-${gradientSchemes[7].from} to-${gradientSchemes[7].to} rounded-full"></div>
            <div class="w-24 h-px bg-gradient-to-r from-${gradientSchemes[7].from} to-${gradientSchemes[7].to}"></div>
            <div class="w-3 h-3 bg-gradient-to-r from-${gradientSchemes[7].to} to-${gradientSchemes[7].from} rounded-full"></div>
            <div class="w-16 h-px bg-gradient-to-r from-${gradientSchemes[7].to} via-transparent to-transparent"></div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: { type: 'divider' },
    });

    // 12. CHECKBOX LIST BLOCK - Interactive Checklist
    contentBlocks.push({
      type: 'list',
      block_id: `ai_checklist_${lessonId}`,
      listType: 'checkbox',
      html_css: `
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[0].from} to-${gradientSchemes[0].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">✅</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Learning Checklist</h2>
          </div>
          <div class="space-y-4">
            ${lessonStructure.key_takeaways
              .map(
                (takeaway, index) => `
              <div class="flex items-start space-x-4 p-4 bg-gradient-to-r from-${gradientSchemes[0].from}/5 to-${gradientSchemes[0].to}/5 rounded-xl border border-${gradientSchemes[0].from}/20 hover:shadow-md transition-all duration-300">
                <input type="checkbox" class="w-5 h-5 text-${gradientSchemes[0].from} rounded border-gray-300 focus:ring-${gradientSchemes[0].from} mt-1" />
                <div class="flex-1">
                  <label class="text-gray-700 leading-relaxed font-medium cursor-pointer">${takeaway}</label>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        listType: 'checkbox',
        content: JSON.stringify({
          items: lessonStructure.key_takeaways,
          listType: 'checkbox',
          checkedItems: {},
        }),
      },
    });

    // 13. PDF BLOCK - Downloadable Resource
    contentBlocks.push({
      type: 'pdf',
      block_id: `ai_pdf_resource_${lessonId}`,
      html_css: `
        <div class="bg-gradient-to-r from-${gradientSchemes[1].from}/10 to-${gradientSchemes[1].to}/10 rounded-2xl p-8 mb-8 border border-${gradientSchemes[1].from}/20">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[1].from} to-${gradientSchemes[1].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">📄</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Study Guide</h2>
          </div>
          <div class="bg-white rounded-xl p-6 border border-${gradientSchemes[1].from}/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-20 bg-gradient-to-b from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <span class="text-white font-bold text-sm">PDF</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">${lessonStructure.lesson_title} - Study Guide</h3>
                  <p class="text-gray-600">Comprehensive notes and key points</p>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>📄 5 pages</span>
                    <span>📥 Downloadable</span>
                    <span>🖨️ Print-friendly</span>
                  </div>
                </div>
              </div>
              <button class="bg-gradient-to-r from-${gradientSchemes[1].from} to-${gradientSchemes[1].to} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        pdf_url: 'https://example.com/study-guide.pdf', // Placeholder
        pdf_title: `${lessonStructure.lesson_title} - Study Guide`,
        description: 'Comprehensive notes and key points',
      },
    });

    // 14. VIDEO BLOCK - Educational Video
    contentBlocks.push({
      type: 'video',
      block_id: `ai_video_demo_${lessonId}`,
      html_css: `
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-${gradientSchemes[2].from} to-${gradientSchemes[2].to} rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span class="text-white text-xl">🎬</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Practical Demonstration</h2>
          </div>
          <div class="bg-gradient-to-r from-${gradientSchemes[2].from}/5 to-${gradientSchemes[2].to}/5 rounded-xl p-8 text-center border border-${gradientSchemes[2].from}/20">
            <div class="w-24 h-24 bg-gradient-to-r from-${gradientSchemes[2].from} to-${gradientSchemes[2].to} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span class="text-white text-4xl">▶️</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Watch: ${lessonStructure.lesson_title} in Action</h3>
            <p class="text-gray-600 mb-4">See practical applications and real-world examples</p>
            <div class="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>🎥 HD Quality</span>
              <span>⏱️ 15-20 minutes</span>
              <span>📱 Mobile friendly</span>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        video_url: 'https://example.com/demo-video.mp4', // Placeholder
        video_title: `${lessonStructure.lesson_title} in Action`,
        description: 'See practical applications and real-world examples',
      },
    });

    // 15. QUOTE BLOCK - Expert Quote (quote_a type)
    contentBlocks.push({
      type: 'quote',
      block_id: `ai_expert_quote_${lessonId}`,
      textType: 'quote_a',
      quoteType: 'quote_a',
      html_css: `
        <div class="relative bg-gradient-to-br from-gray-50 to-white p-8 max-w-4xl mx-auto rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div class="flex items-start space-x-4">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Expert" class="w-12 h-12 rounded-full object-cover shadow-md" />
            <div class="flex-1">
              <blockquote class="text-lg text-gray-700 mb-3 leading-relaxed italic">
                "Mastering ${courseData.title} is essential for anyone looking to excel in today's technology-driven world. The concepts covered in this lesson form the foundation for advanced learning."
              </blockquote>
              <div class="flex items-center">
                <div class="w-8 h-px bg-${gradientSchemes[3].from} mr-3"></div>
                <cite class="text-${gradientSchemes[3].accent} font-semibold not-italic">Dr. Sarah Johnson, Technology Expert</cite>
              </div>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        textType: 'quote_a',
        quoteType: 'quote_a',
        content: JSON.stringify({
          quote: `Mastering ${courseData.title} is essential for anyone looking to excel in today's technology-driven world. The concepts covered in this lesson form the foundation for advanced learning.`,
          author: 'Dr. Sarah Johnson, Technology Expert',
          authorImage:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        }),
      },
    });

    // 5. Examples Block - Interactive Style
    if (lessonStructure.examples && lessonStructure.examples.length > 0) {
      contentBlocks.push({
        type: 'interactive',
        block_id: `ai_examples_${lessonId}`,
        html_css: `
          <div class="relative bg-gradient-to-br from-${gradientSchemes[3].from}/5 via-white to-${gradientSchemes[3].to}/5 rounded-2xl shadow-xl p-8 mb-8 border border-${gradientSchemes[3].from}/20">
            <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-${gradientSchemes[3].from}/10 to-${gradientSchemes[3].to}/10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-r from-${gradientSchemes[3].from} to-${gradientSchemes[3].to} rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <span class="text-white text-2xl">💡</span>
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Practical Examples</h2>
                  <p class="text-gray-600">Real-world applications and use cases</p>
                </div>
              </div>
              <div class="grid gap-6">
                ${lessonStructure.examples
                  .map(
                    (example, index) => `
                  <div class="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-${gradientSchemes[3].from}/30 hover:shadow-lg transition-all duration-300">
                    <div class="flex items-start">
                      <div class="w-10 h-10 bg-gradient-to-r from-${gradientSchemes[3].from} to-${gradientSchemes[3].to} rounded-xl flex items-center justify-center text-white font-bold mr-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        ${index + 1}
                      </div>
                      <div class="flex-1">
                        <p class="text-gray-700 leading-relaxed font-medium">${example}</p>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `,
        order: blockOrder++,
        details: {
          type: 'examples',
          content: lessonStructure.examples.join('\n'),
        },
      });
    }

    // 6. Key Takeaways - Statement Block Style
    contentBlocks.push({
      type: 'statement',
      block_id: `ai_takeaways_${lessonId}`,
      statementType: 'statement-success',
      html_css: `
        <div class="relative bg-gradient-to-br from-${gradientSchemes[4].from} via-${gradientSchemes[4].via} to-${gradientSchemes[4].to} rounded-3xl shadow-2xl p-10 mb-8 text-white overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-full bg-black/10 rounded-3xl"></div>
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full animate-pulse"></div>
          <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full"></div>
          <div class="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 rounded-full"></div>
          <div class="relative z-10">
            <div class="flex items-center mb-8">
              <div class="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mr-8 backdrop-blur-sm shadow-xl">
                <span class="text-4xl">✨</span>
              </div>
              <div>
                <h2 class="text-4xl font-bold mb-3">Key Takeaways</h2>
                <p class="text-white/80 text-lg">Essential points to remember from this lesson</p>
              </div>
            </div>
            <div class="grid gap-6">
              ${lessonStructure.key_takeaways
                .map(
                  (takeaway, index) => `
                <div class="flex items-start p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 shadow-lg">
                  <div class="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white font-bold mr-6 mt-1 shadow-md">
                    ✓
                  </div>
                  <p class="text-white font-medium leading-relaxed text-lg">${takeaway}</p>
                </div>
              `
                )
                .join('')}
            </div>
            <div class="mt-8 text-center">
              <div class="inline-flex items-center space-x-2 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
                <span class="text-white/80 text-sm font-medium">Lesson Complete</span>
                <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        statementType: 'statement-success',
        type: 'takeaways',
        content: lessonStructure.key_takeaways.join('\n'),
      },
    });

    // FINAL DIVIDER: End of Lesson Divider
    contentBlocks.push({
      type: 'divider',
      block_id: `ai_final_divider_${lessonId}`,
      html_css: `
        <div class="flex flex-col items-center justify-center py-16 mb-8">
          <div class="flex items-center space-x-6 mb-8">
            <div class="w-24 h-px bg-gradient-to-r from-transparent via-${gradientSchemes[5].from} to-${gradientSchemes[5].to}"></div>
            <div class="w-6 h-6 bg-gradient-to-r from-${gradientSchemes[5].from} to-${gradientSchemes[5].to} rounded-full shadow-lg animate-pulse"></div>
            <div class="w-40 h-px bg-gradient-to-r from-${gradientSchemes[5].from} via-${gradientSchemes[5].via} to-${gradientSchemes[5].to}"></div>
            <div class="w-6 h-6 bg-gradient-to-r from-${gradientSchemes[5].to} to-${gradientSchemes[5].from} rounded-full shadow-lg animate-pulse"></div>
            <div class="w-24 h-px bg-gradient-to-r from-${gradientSchemes[5].to} via-${gradientSchemes[5].from} to-transparent"></div>
          </div>
          <div class="bg-gradient-to-r from-${gradientSchemes[5].from} to-${gradientSchemes[5].to} rounded-2xl shadow-xl px-12 py-6 text-white">
            <div class="flex items-center space-x-4">
              <span class="text-2xl">🎉</span>
              <div>
                <h3 class="text-2xl font-bold">Congratulations!</h3>
                <p class="text-white/90">You've completed this lesson</p>
              </div>
              <span class="text-2xl">🎓</span>
            </div>
          </div>
          <div class="mt-8 flex items-center space-x-3">
            <div class="w-3 h-3 bg-${gradientSchemes[5].from} rounded-full"></div>
            <div class="w-2 h-2 bg-${gradientSchemes[5].via} rounded-full"></div>
            <div class="w-4 h-4 bg-${gradientSchemes[5].to} rounded-full"></div>
            <div class="w-2 h-2 bg-${gradientSchemes[5].via} rounded-full"></div>
            <div class="w-3 h-3 bg-${gradientSchemes[5].from} rounded-full"></div>
          </div>
        </div>
      `,
      order: blockOrder++,
      details: {
        type: 'final_divider',
        purpose: 'lesson_completion',
      },
    });

    // Step 6: Save Content Blocks to Lesson
    console.log('💾 Step 6: Saving content blocks to lesson...');
    const contentData = {
      content: contentBlocks,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalBlocks: contentBlocks.length,
        aiGenerated: true,
        lessonStructure: lessonStructure,
      },
    };

    await updateLessonContent(lessonId, contentData);
    console.log('✅ Lesson content blocks saved');

    const result = {
      success: true,
      data: {
        courseId,
        moduleId,
        lessonId,
        course: course,
        module: module,
        lesson: lesson,
        contentBlocks: contentBlocks.length,
        lessonStructure: lessonStructure,
        editUrl: `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/builder`,
      },
    };

    console.log('🎉 Simple AI course created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating simple AI course:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

const aiCourseService = new AICourseService();
export default aiCourseService;
