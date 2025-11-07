/**
 * Fast Course Generator - Optimized for Speed
 * Uses parallel processing and minimal API calls
 */

import openAIService from './openAIService.js';
import { uploadAIGeneratedImage } from './aiUploadService.js';
import { createAICourse, createModule } from './courseService';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Generate course with parallel processing for maximum speed
 * @param {Object} courseData - Course configuration
 * @returns {Promise<Object>} Created course
 */
export async function generateFastCourse(courseData) {
  console.log('⚡ Fast Course Generation Started:', courseData.title);
  const startTime = Date.now();

  try {
    // STEP 1: Use provided structure or generate quickly (no thumbnails yet)
    let courseStructure;

    if (courseData.comprehensiveCourseStructure) {
      console.log('📋 Using provided course structure');
      courseStructure = courseData.comprehensiveCourseStructure;
    } else {
      // Generate basic structure only (fast)
      console.log('🚀 Generating basic course structure...');
      courseStructure = await generateBasicStructure(courseData);
    }

    // STEP 2: Create course in backend (parallel with thumbnail generation)
    console.log('🏗️ Creating course and generating thumbnails in parallel...');

    const coursePayload = {
      title:
        courseStructure.title ||
        courseStructure.course_title ||
        courseData.title,
      description: courseData.description,
      subject: courseStructure.subject || courseData.subject,
      objectives: courseData.learningObjectives,
      duration: courseData.duration,
      max_students: courseData.max_students,
      price: courseData.price || '0',
      thumbnail: courseData.thumbnail || '',
    };

    // Run course creation and thumbnail generation in parallel
    const [createdCourse, thumbnails] = await Promise.all([
      createAICourse(coursePayload),
      generateAllThumbnailsParallel(courseStructure),
    ]);

    const courseId = createdCourse.data?.id || createdCourse.id;
    console.log('✅ Course created:', courseId);

    // STEP 3: Create modules and lessons in parallel batches
    console.log('📚 Creating modules and lessons in parallel...');
    const results = await createModulesAndLessonsParallel(
      courseId,
      courseStructure,
      thumbnails
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⚡ Fast course generation completed in ${elapsed}s`);

    return {
      success: true,
      data: {
        course: createdCourse,
        modules: results.modules,
        lessons: results.lessons,
        generationTime: elapsed,
      },
    };
  } catch (error) {
    console.error('❌ Fast course generation failed:', error);
    throw error;
  }
}

/**
 * Generate basic structure without thumbnails (fast)
 */
async function generateBasicStructure(courseData) {
  const prompt = `Create a course outline for: "${courseData.title}"

Description: ${courseData.description}
Difficulty: ${courseData.difficulty || 'intermediate'}

Return JSON with 1 module and 1 lesson:
{
  "course_title": "${courseData.title}",
  "modules": [
    {
      "module_title": "Main Module",
      "module_overview": "Overview text",
      "module_order": 1,
      "lessons": [
        {
          "lesson_title": "Main Lesson",
          "lesson_summary": "Summary text",
          "lesson_order": 1
        }
      ]
    }
  ]
}`;

  try {
    const response = await openAIService.generateStructured(
      'You are a course architect. Generate a concise course structure.',
      prompt,
      {
        model: 'gpt-3.5-turbo', // Use faster model
        temperature: 0.7,
        max_tokens: 1000, // Reduced tokens for speed
      }
    );

    return typeof response === 'string' ? JSON.parse(response) : response;
  } catch (error) {
    console.warn('Using fallback structure');
    return {
      course_title: courseData.title,
      modules: [
        {
          module_title: `${courseData.title} - Main Module`,
          module_overview: courseData.description,
          module_order: 1,
          lessons: [
            {
              lesson_title: `${courseData.title} - Introduction`,
              lesson_summary: 'Comprehensive introduction to the topic',
              lesson_order: 1,
            },
          ],
        },
      ],
    };
  }
}

/**
 * Generate all thumbnails in parallel (much faster)
 */
async function generateAllThumbnailsParallel(courseStructure) {
  console.log('🎨 Generating all thumbnails in parallel...');

  const thumbnailPromises = [];
  const thumbnailMap = {
    modules: {},
    lessons: {},
  };

  // Collect all thumbnail generation promises
  courseStructure.modules?.forEach((module, moduleIndex) => {
    // Module thumbnail
    if (!module.thumbnail && !module.module_thumbnail_url) {
      const modulePromise = generateAndUploadThumbnail(
        `Professional educational thumbnail for: ${module.module_title || module.title}`,
        `module_${moduleIndex}`
      )
        .then(url => {
          thumbnailMap.modules[moduleIndex] = url;
        })
        .catch(err => {
          console.warn(`Module ${moduleIndex} thumbnail failed:`, err.message);
          thumbnailMap.modules[moduleIndex] = '';
        });

      thumbnailPromises.push(modulePromise);
    } else {
      thumbnailMap.modules[moduleIndex] =
        module.thumbnail || module.module_thumbnail_url;
    }

    // Lesson thumbnails
    module.lessons?.forEach((lesson, lessonIndex) => {
      if (!lesson.thumbnail && !lesson.lesson_thumbnail_url) {
        const lessonPromise = generateAndUploadThumbnail(
          `Educational illustration for lesson: ${lesson.lesson_title || lesson.title}`,
          `lesson_${moduleIndex}_${lessonIndex}`
        )
          .then(url => {
            if (!thumbnailMap.lessons[moduleIndex]) {
              thumbnailMap.lessons[moduleIndex] = {};
            }
            thumbnailMap.lessons[moduleIndex][lessonIndex] = url;
          })
          .catch(err => {
            console.warn(
              `Lesson ${moduleIndex}-${lessonIndex} thumbnail failed:`,
              err.message
            );
            if (!thumbnailMap.lessons[moduleIndex]) {
              thumbnailMap.lessons[moduleIndex] = {};
            }
            thumbnailMap.lessons[moduleIndex][lessonIndex] = '';
          });

        thumbnailPromises.push(lessonPromise);
      } else {
        if (!thumbnailMap.lessons[moduleIndex]) {
          thumbnailMap.lessons[moduleIndex] = {};
        }
        thumbnailMap.lessons[moduleIndex][lessonIndex] =
          lesson.thumbnail || lesson.lesson_thumbnail_url;
      }
    });
  });

  // Wait for all thumbnails to complete
  await Promise.allSettled(thumbnailPromises);

  console.log('✅ All thumbnails generated');
  return thumbnailMap;
}

/**
 * Generate and upload a single thumbnail
 */
async function generateAndUploadThumbnail(prompt, identifier) {
  try {
    // Generate image with DALL-E
    const imageResult = await openAIService.generateImage(prompt, {
      size: '1024x1024',
      quality: 'standard',
    });

    if (!imageResult.success || !imageResult.url) {
      return '';
    }

    // Upload to S3
    const uploadResult = await uploadAIGeneratedImage(imageResult.url, {
      public: true,
      folder: 'ai-thumbnails',
    });

    return uploadResult.success ? uploadResult.imageUrl : imageResult.url;
  } catch (error) {
    console.warn(
      `Thumbnail generation failed for ${identifier}:`,
      error.message
    );
    return '';
  }
}

/**
 * Create modules and lessons in parallel batches
 */
async function createModulesAndLessonsParallel(
  courseId,
  courseStructure,
  thumbnails
) {
  const createdModules = [];
  const createdLessons = [];

  // Create all modules in parallel
  const modulePromises = courseStructure.modules.map(async (moduleData, i) => {
    try {
      const modulePayload = {
        title: moduleData.title || moduleData.module_title,
        description:
          moduleData.description ||
          moduleData.module_overview ||
          `${moduleData.title || moduleData.module_title} content`,
        order: i + 1,
        estimated_duration: 60,
        module_status: 'PUBLISHED',
        thumbnail: thumbnails.modules[i] || '',
        price: 0,
      };

      const createdModule = await createModule(courseId, modulePayload);
      const moduleId = createdModule.data?.id || createdModule.id;

      console.log(`✅ Module ${i + 1} created:`, modulePayload.title);

      // Create all lessons for this module in parallel
      const lessonPromises = (moduleData.lessons || []).map(
        async (lessonData, j) => {
          try {
            const lessonPayload = {
              title:
                lessonData.title ||
                lessonData.lesson_title ||
                `Lesson ${j + 1}`,
              description:
                lessonData.description ||
                lessonData.lesson_summary ||
                `Lesson content`,
              order: j + 1,
              status: 'PUBLISHED',
              content: lessonData.content || '',
              duration: lessonData.duration || '15 min',
              thumbnail: thumbnails.lessons[i]?.[j] || '',
            };

            const response = await fetch(
              `${API_BASE}/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`,
              {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(lessonPayload),
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to create lesson: ${response.status}`);
            }

            const createdLesson = await response.json();
            console.log(`✅ Lesson ${j + 1} created:`, lessonPayload.title);

            return createdLesson;
          } catch (error) {
            console.error(`❌ Lesson ${j + 1} failed:`, error.message);
            return null;
          }
        }
      );

      const moduleLessons = await Promise.allSettled(lessonPromises);
      const successfulLessons = moduleLessons
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      createdLessons.push(...successfulLessons);

      return {
        module: createdModule,
        lessons: successfulLessons,
      };
    } catch (error) {
      console.error(`❌ Module ${i + 1} failed:`, error.message);
      return null;
    }
  });

  const results = await Promise.allSettled(modulePromises);
  const successfulModules = results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);

  successfulModules.forEach(result => {
    if (result) {
      createdModules.push(result.module);
    }
  });

  return {
    modules: createdModules,
    lessons: createdLessons,
  };
}

export default {
  generateFastCourse,
};
