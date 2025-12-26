import secureAIService from './secureAIService.js';
import structuredLessonGenerator from './structuredLessonGenerator.js';
import {
  generateComprehensiveShowcaseLesson,
  detectTopicContext,
} from './comprehensiveShowcaseLesson.js';
import { uploadImage } from './imageUploadService.js';

/**
 * Comprehensive Course Generator Service
 * Generates complete courses with structured content blocks that map to the 13 content library types
 */

// Generate unique block IDs
const generateBlockId = () =>
  `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_IMAGE_OPTIONS = {
  size: '1024x1024',
  quality: 'standard',
  uploadToS3: true,
};

function pickImageUrl(result) {
  const data = result?.data || {};
  const primary =
    data.url || data.imageUrl || result?.url || result?.imageUrl || null;
  return {
    url: primary,
    uploadedToS3: data.uploadedToS3 ?? result?.uploadedToS3 ?? false,
  };
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
      generateThumbnails = true, // Default to true for backward compatibility
    } = courseData;

    console.log(
      '🎯 Generating ONE comprehensive showcase lesson:',
      courseTitle
    );
    console.log('🎨 Thumbnail generation enabled:', generateThumbnails);

    // Generate single module with one comprehensive lesson
    const courseStructure = await generateShowcaseCourseStructure({
      courseTitle,
      difficultyLevel,
      duration,
      targetAudience,
    });

    // Generate ALL content library variants in the single lesson
    const enhancedCourse = await enhanceWithAllVariants(
      courseStructure,
      generateThumbnails
    );

    console.log('✅ Comprehensive showcase lesson generated with ALL variants');
    return enhancedCourse;
  } catch (error) {
    console.error('❌ Course generation failed:', error);
    // Return basic fallback structure (thumbnails omitted to avoid empty string issues)
    return {
      course_title: courseData.courseTitle || 'Untitled Course',
      course_description: courseData.description || 'Course description',
      difficulty_level: courseData.difficulty || 'beginner',
      modules: [
        {
          module_title: 'Module 1',
          module_overview: 'Course module content',
          module_order: 1,
          lessons: [
            {
              lesson_title: 'Lesson 1',
              lesson_summary: 'Lesson content',
              lesson_order: 1,
              content_blocks: [],
            },
          ],
        },
      ],
    };
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
    const response = await secureAIService.generateStructured(
      'You are an expert course architect creating a comprehensive showcase lesson.',
      prompt,
      {
        tier: 'standard',
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    // Handle both string and object responses
    if (typeof response === 'string') {
      return JSON.parse(response);
    } else if (typeof response === 'object') {
      return response;
    } else {
      throw new Error('Invalid response format from AI service');
    }
  } catch (error) {
    console.error('Structure generation failed:', error);
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
async function enhanceWithAllVariants(
  courseStructure,
  generateThumbnails = true
) {
  const module = courseStructure.modules[0];
  const lesson = module.lessons[0];

  // Generate actual thumbnail images only if enabled
  let moduleThumbnailUrl = '';
  let lessonThumbnailUrl = '';
  let moduleThumbnailPrompt = '';
  let lessonThumbnailPrompt = '';

  if (generateThumbnails) {
    console.log('🎨 Generating thumbnails for module and lesson...');

    // Detect topic context for thumbnail generation
    const topicContext = detectTopicContext(courseStructure.course_title);

    // Generate module thumbnail prompt
    moduleThumbnailPrompt = await generateModuleThumbnailPrompt(
      module.module_title,
      module.module_overview,
      topicContext
    );

    // Generate lesson thumbnail prompt
    lessonThumbnailPrompt = await generateLessonThumbnailPrompt(
      lesson.lesson_title,
      lesson.lesson_summary,
      topicContext
    );

    try {
      // Generate module thumbnail image
      console.log('🎨 Generating module thumbnail image...');
      const moduleImageResult = await secureAIService.generateImage(
        moduleThumbnailPrompt,
        {
          ...DEFAULT_IMAGE_OPTIONS,
          tier: 'standard',
          folder: 'ai-thumbnails/modules',
        }
      );

      if (moduleImageResult?.success) {
        const { url, uploadedToS3 } = pickImageUrl(moduleImageResult);
        if (url) {
          moduleThumbnailUrl = url;
          console.log('✅ Module thumbnail ready:', moduleThumbnailUrl);
          if (!uploadedToS3) {
            console.warn(
              '⚠️ Module image not uploaded to S3, using fallback URL'
            );
          }
        } else {
          console.error(
            '❌ Module thumbnail missing URL in response:',
            moduleImageResult
          );
        }
      } else {
        console.error(
          '❌ Module thumbnail generation failed:',
          moduleImageResult
        );
      }

      // Generate lesson thumbnail image
      console.log('🎨 Generating lesson thumbnail image...');
      const lessonImageResult = await secureAIService.generateImage(
        lessonThumbnailPrompt,
        {
          ...DEFAULT_IMAGE_OPTIONS,
          tier: 'standard',
          folder: 'ai-thumbnails/lessons',
        }
      );

      if (lessonImageResult?.success) {
        const { url, uploadedToS3 } = pickImageUrl(lessonImageResult);
        if (url) {
          lessonThumbnailUrl = url;
          console.log('✅ Lesson thumbnail ready:', lessonThumbnailUrl);
          if (!uploadedToS3) {
            console.warn(
              '⚠️ Lesson image not uploaded to S3, using fallback URL'
            );
          }
        } else {
          console.error(
            '❌ Lesson thumbnail missing URL in response:',
            lessonImageResult
          );
        }
      } else {
        console.error(
          '❌ Lesson thumbnail generation failed:',
          lessonImageResult
        );
      }
    } catch (error) {
      console.error('❌ Thumbnail generation failed:', error);
      // Continue with empty URLs
    }
  } else {
    console.log('⏭️ Skipping thumbnail generation (disabled by user)');
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
    `Realistic, professional photograph-style image showing a real-world scene representing ${courseTitle} concepts, ${topicContext.domain} theme. NO infographics, NO diagrams, NO small text.`,
    `Realistic, professional photograph-style image of actual objects or scenes related to ${courseTitle} fundamentals. NO infographics, NO diagrams. Clean, realistic visual.`,
    `Realistic, professional photograph-style image showing real-world applications of ${courseTitle}, professional lighting, clean background. NO infographics, NO diagrams.`,
    `Realistic, professional photograph-style image demonstrating ${courseTitle} in a real-world setting, minimalist composition. NO infographics, NO diagrams, NO small text.`,
    `Realistic, professional photograph-style image showing ${courseTitle} methodology in practice, professional presentation style. NO infographics, NO diagrams, NO small text.`,
  ];

  return prompts;
}

/**
 * Truncate text to max length, preserving words
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Truncate prompt to ensure it's under 1000 characters (backend limit)
 */
function truncatePrompt(prompt, maxLength = 950) {
  if (!prompt || prompt.length <= maxLength) return prompt;
  const truncated = prompt.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
}

/**
 * Generate module thumbnail prompt based on module content
 * Enhanced with premium prompt engineering techniques
 */
async function generateModuleThumbnailPrompt(
  moduleTitle,
  moduleOverview,
  topicContext
) {
  // Truncate overview to prevent long prompts (max 150 chars for overview)
  const truncatedOverview = truncateText(moduleOverview || '', 150);
  const keywords =
    (topicContext.keywords || []).slice(0, 2).join(' and ') || 'relevant';

  // Premium prompt engineering with all 7 enhancement techniques
  const premiumPrompt = `Create a stunning, professional thumbnail image for module: "${moduleTitle}"

Content: ${truncatedOverview}
Domain: ${topicContext.field || 'education'}

QUALITY REQUIREMENTS:
1. CINEMATIC LIGHTING: soft cinematic lighting, volumetric light, dramatic contrast, rim lighting
2. ULTRA-DETAIL: ultra-detailed, 8K clarity, crisp textures, photorealistic depth, hyper-real
3. COMPOSITION: centered composition, balanced spacing, clean layout, wide angle perspective
4. COLOR PALETTE: vivid colors, premium gradient palette, high contrast, accent highlights
5. SHADOWS & REFLECTIONS: soft deep shadows, realistic reflections, smooth lighting falloff, subtle highlights
6. MATERIAL STYLE: glossy surface, metallic reflections, smooth 3D elements, professional finish
7. EXCLUSIONS: no text, no watermarks, clean background, no clutter

STYLE: Professional, vivid, photorealistic, premium quality
ASPECT RATIO: 16:9 thumbnail format
MOOD: Modern, professional, educational, inspiring`;

  try {
    const response = await secureAIService.generateText(premiumPrompt, {
      tier: 'standard',
      maxTokens: 180,
      temperature: 0.8, // Slightly higher for more creative variations
      systemPrompt:
        'You are a premium prompt engineer. Create stunning, photorealistic image prompts that emphasize: cinematic lighting, ultra-detail, professional composition, premium colors, realistic shadows, material textures, and clean execution. Always include specific visual quality descriptors. NO infographics, NO diagrams, NO text overlays.',
    });

    let generatedPrompt = response.trim();

    // Enhance with premium quality markers if not present
    if (
      generatedPrompt &&
      !generatedPrompt.toLowerCase().includes('cinematic')
    ) {
      generatedPrompt = `${generatedPrompt}, with soft cinematic lighting, volumetric light, and dramatic professional lighting`;
    }

    if (
      generatedPrompt &&
      !generatedPrompt.toLowerCase().includes('ultra-detailed')
    ) {
      generatedPrompt = `${generatedPrompt}, ultra-detailed, 8K clarity, crisp textures, photorealistic`;
    }

    // Add final quality assurance
    generatedPrompt = `${generatedPrompt}. No text, no watermarks, clean professional background. Vivid, premium quality.`;

    // Ensure final prompt is under 1000 characters
    return truncatePrompt(generatedPrompt, 950);
  } catch (error) {
    console.error('Module thumbnail prompt generation failed:', error);
    // Enhanced fallback prompt with premium techniques
    const fallback = `Professional, ultra-detailed 8K thumbnail for "${truncateText(moduleTitle, 40)}". Cinematic lighting with volumetric light, centered composition, premium gradient colors, realistic shadows, glossy finish, no text, clean background, vivid and photorealistic`;
    return truncatePrompt(fallback, 950);
  }
}

/**
 * Generate lesson thumbnail prompt based on lesson content
 * Enhanced with premium prompt engineering techniques
 */
async function generateLessonThumbnailPrompt(
  lessonTitle,
  lessonSummary,
  topicContext
) {
  // Truncate summary to prevent long prompts (max 150 chars for summary)
  const truncatedSummary = truncateText(lessonSummary || '', 150);
  const keywords =
    (topicContext.keywords || []).slice(2, 4).join(' and ') || 'relevant';

  // Premium prompt engineering with all 7 enhancement techniques
  const premiumPrompt = `Create a stunning, professional thumbnail image for lesson: "${lessonTitle}"

Content: ${truncatedSummary}
Domain: ${topicContext.field || 'education'}

QUALITY REQUIREMENTS:
1. CINEMATIC LIGHTING: soft cinematic lighting, volumetric light, dramatic contrast, rim lighting
2. ULTRA-DETAIL: ultra-detailed, 8K clarity, crisp textures, photorealistic depth, hyper-real
3. COMPOSITION: centered composition, balanced spacing, clean layout, wide angle perspective
4. COLOR PALETTE: vivid colors, premium gradient palette, high contrast, accent highlights
5. SHADOWS & REFLECTIONS: soft deep shadows, realistic reflections, smooth lighting falloff, subtle highlights
6. MATERIAL STYLE: glossy surface, metallic reflections, smooth 3D elements, professional finish
7. EXCLUSIONS: no text, no watermarks, clean background, no clutter

STYLE: Professional, vivid, photorealistic, premium quality
ASPECT RATIO: 16:9 thumbnail format
MOOD: Modern, professional, educational, inspiring`;

  try {
    const response = await secureAIService.generateText(premiumPrompt, {
      tier: 'standard',
      maxTokens: 180,
      temperature: 0.8, // Slightly higher for more creative variations
      systemPrompt:
        'You are a premium prompt engineer. Create stunning, photorealistic image prompts that emphasize: cinematic lighting, ultra-detail, professional composition, premium colors, realistic shadows, material textures, and clean execution. Always include specific visual quality descriptors. NO infographics, NO diagrams, NO text overlays.',
    });

    let generatedPrompt = response.trim();

    // Enhance with premium quality markers if not present
    if (
      generatedPrompt &&
      !generatedPrompt.toLowerCase().includes('cinematic')
    ) {
      generatedPrompt = `${generatedPrompt}, with soft cinematic lighting, volumetric light, and dramatic professional lighting`;
    }

    if (
      generatedPrompt &&
      !generatedPrompt.toLowerCase().includes('ultra-detailed')
    ) {
      generatedPrompt = `${generatedPrompt}, ultra-detailed, 8K clarity, crisp textures, photorealistic`;
    }

    // Add final quality assurance
    generatedPrompt = `${generatedPrompt}. No text, no watermarks, clean professional background. Vivid, premium quality.`;

    // Ensure final prompt is under 1000 characters
    return truncatePrompt(generatedPrompt, 950);
  } catch (error) {
    console.error('Lesson thumbnail prompt generation failed:', error);
    // Enhanced fallback prompt with premium techniques
    const fallback = `Professional, ultra-detailed 8K thumbnail for "${truncateText(lessonTitle, 40)}". Cinematic lighting with volumetric light, centered composition, premium gradient colors, realistic shadows, glossy finish, no text, clean background, vivid and photorealistic`;
    return truncatePrompt(fallback, 950);
  }
}

export { generateModuleThumbnailPrompt, generateLessonThumbnailPrompt };

export default {
  generateComprehensiveCourse,
};
