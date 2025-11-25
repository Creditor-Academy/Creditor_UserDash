import {
  generateCourseForTitle,
  quickGenerateCourse,
  examples,
} from '../services/courseGeneratorAPI.js';

/**
 * Test functions for the course generator
 * Use these to test course generation with different parameters
 */

/**
 * Test basic course generation
 */
export async function testBasicGeneration() {
  console.log('🧪 Testing basic course generation...');

  try {
    const course = await generateCourseForTitle('JavaScript Fundamentals');
    console.log('✅ Basic generation successful');
    console.log('📊 Course stats:', {
      title: course.course_title,
      modules: course.modules.length,
      totalLessons: course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
      ),
      firstLessonBlocks:
        course.modules[0]?.lessons[0]?.lesson_blocks?.length || 0,
    });
    return course;
  } catch (error) {
    console.error('❌ Basic generation failed:', error);
    throw error;
  }
}

/**
 * Test quick generation
 */
export async function testQuickGeneration() {
  console.log('🧪 Testing quick course generation...');

  try {
    const course = await quickGenerateCourse(
      'Node.js Backend Development',
      'advanced'
    );
    console.log('✅ Quick generation successful');
    console.log('📊 Course stats:', {
      title: course.course_title,
      difficulty: course.difficulty_level,
      duration: course.duration,
      modules: course.modules.length,
    });
    return course;
  } catch (error) {
    console.error('❌ Quick generation failed:', error);
    throw error;
  }
}

/**
 * Test example generations
 */
export async function testExamples() {
  console.log('🧪 Testing example course generations...');

  try {
    // Test React course
    console.log('📚 Generating React course...');
    const reactCourse = await examples.generateReactCourse();
    console.log('✅ React course generated');

    // Test Python course
    console.log('📚 Generating Python course...');
    const pythonCourse = await examples.generatePythonCourse();
    console.log('✅ Python course generated');

    console.log('📊 Example courses stats:', {
      react: {
        modules: reactCourse.modules.length,
        difficulty: reactCourse.difficulty_level,
      },
      python: {
        modules: pythonCourse.modules.length,
        difficulty: pythonCourse.difficulty_level,
      },
    });

    return { reactCourse, pythonCourse };
  } catch (error) {
    console.error('❌ Example generation failed:', error);
    throw error;
  }
}

/**
 * Test content block structure
 */
export async function testBlockStructure() {
  console.log('🧪 Testing content block structure...');

  try {
    const course = await generateCourseForTitle(
      'Data Structures and Algorithms',
      {
        difficultyLevel: 'intermediate',
        moduleCount: 3,
        lessonsPerModule: 2,
      }
    );

    const firstLesson = course.modules[0].lessons[0];
    const blocks = firstLesson.lesson_blocks;

    console.log('✅ Block structure test successful');
    console.log('📊 Block analysis:', {
      totalBlocks: blocks.length,
      blockTypes: [...new Set(blocks.map(block => block.type))],
      hasRequiredBlocks: {
        masterHeading: blocks.some(
          b => b.type === 'text' && b.textType === 'master_heading'
        ),
        paragraph: blocks.some(
          b => b.type === 'text' && b.textType === 'paragraph'
        ),
        list: blocks.some(b => b.type === 'list'),
        interactive: blocks.some(b => b.type === 'interactive'),
        divider: blocks.some(b => b.type === 'divider'),
      },
      imagePrompts: firstLesson.imagePrompts?.length || 0,
    });

    return { course, firstLesson, blocks };
  } catch (error) {
    console.error('❌ Block structure test failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Running all course generator tests...');

  const results = {};

  try {
    results.basic = await testBasicGeneration();
    results.quick = await testQuickGeneration();
    results.examples = await testExamples();
    results.blocks = await testBlockStructure();

    console.log('🎉 All tests completed successfully!');
    return results;
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    throw error;
  }
}

/**
 * Generate a course with your custom title
 * Replace "{{COURSE_TITLE}}" with your desired course title
 */
export async function generateYourCourse(courseTitle = '{{COURSE_TITLE}}') {
  console.log(`🎯 Generating your course: "${courseTitle}"`);

  if (courseTitle === '{{COURSE_TITLE}}') {
    console.log(
      '⚠️  Please replace {{COURSE_TITLE}} with your actual course title'
    );
    courseTitle = 'Sample Course Title';
  }

  try {
    const course = await generateCourseForTitle(courseTitle, {
      difficultyLevel: 'intermediate',
      duration: '8 weeks',
      targetAudience: 'professionals',
      moduleCount: 5,
      lessonsPerModule: 4,
    });

    console.log('✅ Your course generated successfully!');
    console.log('📋 Course Summary:');
    console.log(`   Title: ${course.course_title}`);
    console.log(`   Description: ${course.course_description}`);
    console.log(`   Difficulty: ${course.difficulty_level}`);
    console.log(`   Duration: ${course.duration}`);
    console.log(`   Modules: ${course.modules.length}`);
    console.log(
      `   Total Lessons: ${course.modules.reduce((total, module) => total + module.lessons.length, 0)}`
    );

    // Show first lesson structure
    const firstLesson = course.modules[0]?.lessons[0];
    if (firstLesson) {
      console.log(`📖 First Lesson: "${firstLesson.lesson_title}"`);
      console.log(`   Blocks: ${firstLesson.lesson_blocks?.length || 0}`);
      console.log(`   Image Prompts: ${firstLesson.imagePrompts?.length || 0}`);
    }

    return course;
  } catch (error) {
    console.error(`❌ Failed to generate course "${courseTitle}":`, error);
    throw error;
  }
}

// Export all test functions
export default {
  testBasicGeneration,
  testQuickGeneration,
  testExamples,
  testBlockStructure,
  runAllTests,
  generateYourCourse,
};
