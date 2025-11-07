import openAIService from './openAIService.js';
import {
  generateComprehensiveShowcaseLesson,
  detectTopicContext,
} from './comprehensiveShowcaseLesson.js';
import { uploadImage } from './imageUploadService.js';
import { uploadAIGeneratedImage } from './aiUploadService.js';

/**
 * Comprehensive Course Generator Service
 * Generates complete courses with structured content blocks that map to the 13 content library types
 */

// Generate unique block IDs
const generateBlockId = () =>
  `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Upload DALL-E image to S3 using the same logic as course thumbnails
 * @param {string} dalleUrl - DALL-E image URL
 * @param {string} fileName - File name for S3 upload
 * @returns {Promise<string>} S3 URL or original URL if upload fails
 */
async function uploadDalleImageToS3(dalleUrl, fileName) {
  try {
    console.log(
      `📤 Uploading DALL-E image to S3 via backend proxy: ${fileName}`
    );

    // Use the same S3 upload logic as course thumbnails
    const uploadResult = await uploadAIGeneratedImage(dalleUrl, {
      public: true,
      folder: 'ai-thumbnails',
    });

    if (uploadResult.success && uploadResult.imageUrl) {
      console.log(`✅ S3 upload successful: ${uploadResult.imageUrl}`);
      return uploadResult.imageUrl;
    } else {
      console.warn(
        `⚠️ S3 upload failed, using original URL: ${uploadResult?.message || 'Unknown error'}`
      );
      return dalleUrl; // Fallback to original URL
    }
  } catch (error) {
    console.error(`❌ Error uploading ${fileName} to S3:`, error);
    return dalleUrl; // Fallback to original URL
  }
}

// Content block type mappings
const BLOCK_TYPES = {
  TEXT: 'text',
  STATEMENT: 'statement',
  QUOTE: 'quote',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  YOUTUBE: 'youtube',
  LINK: 'link',
  PDF: 'pdf',
  LIST: 'list',
  TABLES: 'tables',
  INTERACTIVE: 'interactive',
  DIVIDER: 'divider',
};

const TEXT_TYPES = {
  HEADING: 'heading',
  MASTER_HEADING: 'master_heading',
  SUBHEADING: 'subheading',
  PARAGRAPH: 'paragraph',
  HEADING_PARAGRAPH: 'heading_paragraph',
  SUBHEADING_PARAGRAPH: 'subheading_paragraph',
};

const QUOTE_TYPES = {
  QUOTE_A: 'quote_a',
  QUOTE_B: 'quote_b',
  QUOTE_C: 'quote_c',
  QUOTE_D: 'quote_d',
  QUOTE_ON_IMAGE: 'quote_on_image',
  QUOTE_CAROUSEL: 'quote_carousel',
};

/**
 * Generate a complete course structure
 * @param {Object} courseData - Course configuration
 * @returns {Object} Complete course JSON structure
 */
export async function generateComprehensiveCourse(courseData) {
  try {
    const {
      courseTitle = 'Complete Course',
      difficultyLevel = 'intermediate',
      duration = '4 weeks',
      targetAudience = 'professionals',
      moduleCount = 1, // ONE MODULE ONLY
      lessonsPerModule = 1, // ONE LESSON ONLY
    } = courseData;

    console.log(
      '🎯 Generating ONE comprehensive showcase lesson:',
      courseTitle
    );

    // Generate single module with one comprehensive lesson
    const courseStructure = await generateShowcaseCourseStructure({
      courseTitle,
      difficultyLevel,
      duration,
      targetAudience,
    });

    // Generate ALL content library variants in the single lesson
    const enhancedCourse = await enhanceWithAllVariants(courseStructure);

    console.log('✅ Comprehensive showcase lesson generated with ALL variants');
    return enhancedCourse;
  } catch (error) {
    console.error('❌ Course generation failed:', error);
    return generateFallbackShowcaseCourse(courseData);
  }
}

/**
 * Generate showcase course structure with ONE comprehensive lesson
 */
async function generateShowcaseCourseStructure(config) {
  const prompt = `Create ONE comprehensive showcase lesson for: "${config.courseTitle}"

This lesson should demonstrate ALL content types and be professionally structured.

Requirements:
- Difficulty: ${config.difficultyLevel}
- Target Audience: ${config.targetAudience}
- Create ONE module with ONE comprehensive lesson
- The lesson should cover the complete topic comprehensively
- Content should be contextually relevant to the subject

Return JSON with this structure:
{
  "course_title": "${config.courseTitle}",
  "course_description": "A comprehensive masterclass covering all aspects of ${config.courseTitle}",
  "difficulty_level": "${config.difficultyLevel}",
  "duration": "${config.duration}",
  "target_audience": "${config.targetAudience}",
  "learning_objectives": [
    "Master fundamental concepts of ${config.courseTitle}",
    "Apply practical skills in real-world scenarios",
    "Understand advanced techniques and best practices"
  ],
  "modules": [
    {
      "module_title": "Complete ${config.courseTitle} Masterclass",
      "module_overview": "This comprehensive module covers everything you need to know about ${config.courseTitle}",
      "module_order": 1,
      "lessons": [
        {
          "lesson_title": "Comprehensive ${config.courseTitle} Guide",
          "lesson_summary": "A complete guide covering all aspects of ${config.courseTitle} from fundamentals to advanced applications",
          "learning_goals": [
            "Understand core ${config.courseTitle} principles",
            "Apply practical ${config.courseTitle} techniques",
            "Master advanced ${config.courseTitle} strategies"
          ],
          "lesson_order": 1
        }
      ]
    }
  ]
}`;

  try {
    const response = await openAIService.generateStructured(
      'You are an expert course architect creating a comprehensive showcase lesson.',
      prompt,
      {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
      }
    );

    // Handle both string and object responses from OpenAI
    if (typeof response === 'string') {
      return JSON.parse(response);
    } else if (typeof response === 'object') {
      return response;
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI structure generation failed:', error);
    // Return fallback structure
    return generateFallbackShowcaseStructure(config);
  }
}

/**
 * Generate fallback showcase structure
 */
function generateFallbackShowcaseStructure(config) {
  return {
    course_title: config.courseTitle,
    course_description: `A comprehensive masterclass covering all aspects of ${config.courseTitle}`,
    difficulty_level: config.difficultyLevel,
    duration: config.duration,
    target_audience: config.targetAudience,
    learning_objectives: [
      `Master fundamental concepts of ${config.courseTitle}`,
      `Apply practical skills in real-world scenarios`,
      `Understand advanced techniques and best practices`,
    ],
    modules: [
      {
        module_title: `Complete ${config.courseTitle} Masterclass`,
        module_overview: `This comprehensive module covers everything you need to know about ${config.courseTitle}`,
        module_order: 1,
        lessons: [
          {
            lesson_title: `Comprehensive ${config.courseTitle} Guide`,
            lesson_summary: `A complete guide covering all aspects of ${config.courseTitle} from fundamentals to advanced applications`,
            learning_goals: [
              `Understand core ${config.courseTitle} principles`,
              `Apply practical ${config.courseTitle} techniques`,
              `Master advanced ${config.courseTitle} strategies`,
            ],
            lesson_order: 1,
          },
        ],
      },
    ],
  };
}

/**
 * Enhance course with ALL content library variants in ONE lesson + Thumbnails
 */
async function enhanceWithAllVariants(courseStructure) {
  const module = courseStructure.modules[0];
  const lesson = module.lessons[0];

  // Detect topic context for thumbnail generation
  const topicContext = detectTopicContext(courseStructure.course_title);

  // Generate module thumbnail prompt
  const moduleThumbnailPrompt = await generateModuleThumbnailPrompt(
    module.module_title,
    module.module_overview,
    topicContext
  );

  // Generate lesson thumbnail prompt
  const lessonThumbnailPrompt = await generateLessonThumbnailPrompt(
    lesson.lesson_title,
    lesson.lesson_summary,
    topicContext
  );

  // Generate actual thumbnail images using DALL-E
  let moduleThumbnailUrl = `module_${module.module_order}_thumbnail.jpg`;
  let lessonThumbnailUrl = `lesson_${lesson.lesson_order}_thumbnail.jpg`;

  try {
    // Generate module thumbnail image
    console.log('🎨 Generating module thumbnail image...');
    const moduleImageResult = await openAIService.generateImage(
      moduleThumbnailPrompt,
      {
        size: '1024x1024',
        quality: 'standard',
      }
    );

    if (moduleImageResult.success && moduleImageResult.url) {
      console.log('✅ Module thumbnail generated:', moduleImageResult.url);
      console.log(
        '🎨 Module thumbnail URL length:',
        moduleImageResult.url.length
      );

      // Upload DALL-E image to S3
      const moduleFileName = `module_${module.module_order}_${Date.now()}.png`;
      moduleThumbnailUrl = await uploadDalleImageToS3(
        moduleImageResult.url,
        moduleFileName
      );
      console.log('🎨 Final module thumbnail URL (S3):', moduleThumbnailUrl);
    } else {
      console.error(
        '❌ Module thumbnail generation failed:',
        moduleImageResult
      );
    }

    // Generate lesson thumbnail image
    console.log('🎨 Generating lesson thumbnail image...');
    const lessonImageResult = await openAIService.generateImage(
      lessonThumbnailPrompt,
      {
        size: '1024x1024',
        quality: 'standard',
      }
    );

    if (lessonImageResult.success && lessonImageResult.url) {
      console.log('✅ Lesson thumbnail generated:', lessonImageResult.url);
      console.log(
        '🎨 Lesson thumbnail URL length:',
        lessonImageResult.url.length
      );

      // Upload DALL-E image to S3
      const lessonFileName = `lesson_${lesson.lesson_order}_${Date.now()}.png`;
      lessonThumbnailUrl = await uploadDalleImageToS3(
        lessonImageResult.url,
        lessonFileName
      );
      console.log('🎨 Final lesson thumbnail URL (S3):', lessonThumbnailUrl);
    } else {
      console.error(
        '❌ Lesson thumbnail generation failed:',
        lessonImageResult
      );
    }
  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error);
    // Continue with fallback URLs
  }

  // Generate comprehensive lesson with ALL variants
  const enhancedLesson = await generateComprehensiveShowcaseLesson(
    lesson,
    courseStructure.difficulty_level,
    courseStructure.course_title
  );

  // Add thumbnail prompts and URLs to lesson
  const lessonWithThumbnail = {
    ...enhancedLesson,
    lesson_thumbnail_prompt: lessonThumbnailPrompt,
    lesson_thumbnail_url: lessonThumbnailUrl,
    thumbnail: lessonThumbnailUrl, // Also add as 'thumbnail' field for compatibility
  };

  const finalResult = {
    ...courseStructure,
    modules: [
      {
        ...module,
        module_thumbnail_prompt: moduleThumbnailPrompt,
        module_thumbnail_url: moduleThumbnailUrl,
        thumbnail: moduleThumbnailUrl, // Also add as 'thumbnail' field for compatibility
        lessons: [lessonWithThumbnail],
      },
    ],
  };

  console.log('🎨 Final course structure with thumbnails:', {
    moduleTitle:
      finalResult.modules[0].title || finalResult.modules[0].module_title,
    moduleThumbnail: finalResult.modules[0].thumbnail,
    lessonTitle:
      finalResult.modules[0].lessons[0].title ||
      finalResult.modules[0].lessons[0].lesson_title,
    lessonThumbnail: finalResult.modules[0].lessons[0].thumbnail,
  });

  return finalResult;
}

/**
 * Generate AI image prompts for a lesson
 */
async function generateContextualImagePrompts(courseTitle, topicContext) {
  const prompts = [
    `Professional ${topicContext.imageStyle} illustration showing ${courseTitle} concepts, clean educational design, ${topicContext.domain} theme`,
    `Infographic style diagram explaining ${courseTitle} fundamentals, modern flat design, educational color scheme`,
    `3D rendered visualization of ${courseTitle} applications, professional lighting, clean background`,
    `Vector illustration demonstrating ${courseTitle} workflow, minimalist design, business professional style`,
    `Educational chart showing ${courseTitle} methodology, clean typography, professional presentation style`,
  ];

  return prompts;
}

/**
 * Generate module thumbnail prompt based on module content
 */
async function generateModuleThumbnailPrompt(
  moduleTitle,
  moduleOverview,
  topicContext
) {
  const prompt = `Professional ${topicContext.imageStyle} thumbnail for module: "${moduleTitle}"
  
Content: ${moduleOverview}
Style: ${topicContext.imageStyle}
Domain: ${topicContext.field}

Create a thumbnail that represents this module in ${topicContext.domain}.
Include ${topicContext.keywords.slice(0, 2).join(' and ')} visual elements.
Professional, educational, suitable for module thumbnail.
16:9 aspect ratio, clean composition, readable at small sizes.`;

  try {
    const response = await openAIService.generateText(prompt, {
      model: 'gpt-4',
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.trim();
  } catch (error) {
    console.error('Module thumbnail prompt generation failed:', error);
    return `Professional ${topicContext.imageStyle} showing ${moduleTitle} concepts, clean educational design, ${topicContext.domain} theme, 16:9 thumbnail format`;
  }
}

/**
 * Generate lesson thumbnail prompt based on lesson content
 */
async function generateLessonThumbnailPrompt(
  lessonTitle,
  lessonSummary,
  topicContext
) {
  const prompt = `Professional ${topicContext.imageStyle} thumbnail for lesson: "${lessonTitle}"
  
Content: ${lessonSummary}
Style: ${topicContext.imageStyle}
Domain: ${topicContext.field}

Create a thumbnail that represents this specific lesson in ${topicContext.domain}.
Include ${topicContext.keywords.slice(2, 4).join(' and ')} visual elements.
Professional, educational, suitable for lesson thumbnail.
16:9 aspect ratio, clean composition, readable at small sizes.`;

  try {
    const response = await openAIService.generateText(prompt, {
      model: 'gpt-4',
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.trim();
  } catch (error) {
    console.error('Lesson thumbnail prompt generation failed:', error);
    return `Professional ${topicContext.imageStyle} showing ${lessonTitle} concepts, clean educational design, ${topicContext.domain} theme, 16:9 thumbnail format`;
  }
}

export default {
  generateComprehensiveCourse,
};
