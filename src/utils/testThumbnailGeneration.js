import { generateCourseForTitle } from '../services/courseGeneratorAPI.js';

/**
 * Test thumbnail generation for different course types
 */
export async function testThumbnailGeneration() {
  console.log('🖼️ TESTING THUMBNAIL GENERATION');
  console.log('='.repeat(50));

  const testCourses = [
    'Financial Planning Mastery',
    'Legal Studies Fundamentals',
    'React Development Complete',
    'Healthcare Management',
    'Digital Marketing Strategy',
  ];

  for (const courseTitle of testCourses) {
    console.log(`\n📚 Testing: ${courseTitle}`);
    console.log('-'.repeat(30));

    try {
      const course = await generateCourseForTitle(courseTitle);
      const module = course.modules[0];
      const lesson = module.lessons[0];

      console.log(`✅ Course Generated Successfully`);
      console.log(`📁 Module: ${module.module_title}`);
      console.log(`🖼️ Module Thumbnail Prompt:`);
      console.log(`   ${module.module_thumbnail_prompt}`);
      console.log(`📄 Lesson: ${lesson.lesson_title}`);
      console.log(`🖼️ Lesson Thumbnail Prompt:`);
      console.log(`   ${lesson.lesson_thumbnail_prompt}`);
      console.log(`📊 Content Blocks: ${lesson.lesson_blocks?.length || 0}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${courseTitle}:`, error.message);
    }
  }
}

/**
 * Test specific course thumbnail generation
 */
export async function testSpecificCourseThumbnails(courseTitle) {
  console.log(`🎯 TESTING THUMBNAILS FOR: ${courseTitle}`);
  console.log('='.repeat(50));

  try {
    const course = await generateCourseForTitle(courseTitle);
    const module = course.modules[0];
    const lesson = module.lessons[0];

    console.log(`📚 Course: ${course.course_title}`);
    console.log(`📝 Description: ${course.course_description}`);
    console.log(`🎯 Difficulty: ${course.difficulty_level}`);
    console.log(`⏱️ Duration: ${course.duration}`);
    console.log('');

    console.log(`📁 MODULE DETAILS:`);
    console.log(`   Title: ${module.module_title}`);
    console.log(`   Overview: ${module.module_overview}`);
    console.log(`   Thumbnail File: ${module.module_thumbnail_url}`);
    console.log(`   Thumbnail Prompt:`);
    console.log(`   "${module.module_thumbnail_prompt}"`);
    console.log('');

    console.log(`📄 LESSON DETAILS:`);
    console.log(`   Title: ${lesson.lesson_title}`);
    console.log(`   Summary: ${lesson.lesson_summary}`);
    console.log(`   Thumbnail File: ${lesson.lesson_thumbnail_url}`);
    console.log(`   Thumbnail Prompt:`);
    console.log(`   "${lesson.lesson_thumbnail_prompt}"`);
    console.log('');

    console.log(`🎨 CONTENT ANALYSIS:`);
    console.log(`   Total Blocks: ${lesson.lesson_blocks?.length || 0}`);
    console.log(`   Image Prompts: ${lesson.imagePrompts?.length || 0}`);
    console.log(`   Learning Goals: ${lesson.learning_goals?.length || 0}`);

    return course;
  } catch (error) {
    console.error(
      `❌ Failed to generate thumbnails for ${courseTitle}:`,
      error
    );
    throw error;
  }
}

/**
 * Show thumbnail generation examples
 */
export function showThumbnailExamples() {
  console.log('🎨 THUMBNAIL GENERATION EXAMPLES');
  console.log('='.repeat(50));

  const examples = [
    {
      domain: 'Finance',
      module: 'Investment Fundamentals',
      lesson: 'Stock Market Basics',
      modulePrompt:
        'Professional business photography thumbnail showing investment fundamentals with financial charts, portfolio graphics, clean educational design, finance theme, 16:9 format',
      lessonPrompt:
        'Professional business photography thumbnail showing stock market basics with trading charts, stock symbols, clean educational design, finance theme, 16:9 format',
    },
    {
      domain: 'Technology',
      module: 'React Development',
      lesson: 'Component Architecture',
      modulePrompt:
        'Modern tech illustration thumbnail showing React development with code interfaces, component diagrams, clean educational design, technology theme, 16:9 format',
      lessonPrompt:
        'Modern tech illustration thumbnail showing component architecture with React components, code structure, clean educational design, technology theme, 16:9 format',
    },
    {
      domain: 'Law',
      module: 'Constitutional Law',
      lesson: 'Bill of Rights',
      modulePrompt:
        'Professional legal photography thumbnail showing constitutional law with legal documents, courthouse imagery, clean educational design, law theme, 16:9 format',
      lessonPrompt:
        'Professional legal photography thumbnail showing Bill of Rights with constitutional text, legal symbols, clean educational design, law theme, 16:9 format',
    },
  ];

  examples.forEach((example, index) => {
    console.log(`\n${index + 1}. ${example.domain.toUpperCase()} EXAMPLE:`);
    console.log(`   📁 Module: ${example.module}`);
    console.log(`   🖼️ Module Thumbnail: ${example.modulePrompt}`);
    console.log(`   📄 Lesson: ${example.lesson}`);
    console.log(`   🖼️ Lesson Thumbnail: ${example.lessonPrompt}`);
  });
}

export default {
  testThumbnailGeneration,
  testSpecificCourseThumbnails,
  showThumbnailExamples,
};
