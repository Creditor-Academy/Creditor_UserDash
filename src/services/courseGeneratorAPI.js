import { generateComprehensiveCourse } from './comprehensiveCourseGenerator.js';

/**
 * Course Generator API
 * Simple interface for generating complete courses
 */

/**
 * Generate a complete course with the specified title
 * @param {string} courseTitle - The course title to generate
 * @param {Object} options - Additional configuration options
 * @returns {Promise<Object>} Complete course JSON structure
 */
export async function generateCourseForTitle(courseTitle, options = {}) {
  const {
    difficultyLevel = 'intermediate',
    duration = '8 weeks',
    targetAudience = 'professionals',
    moduleCount = 5,
    lessonsPerModule = 4,
  } = options;

  console.log(`🎯 Generating course: "${courseTitle}"`);
  console.log(`📊 Configuration:`, {
    difficultyLevel,
    duration,
    targetAudience,
    modules: moduleCount,
    lessonsPerModule,
  });

  try {
    const courseData = {
      courseTitle,
      difficultyLevel,
      duration,
      targetAudience,
      moduleCount,
      lessonsPerModule,
    };

    const generatedCourse = await generateComprehensiveCourse(courseData);

    console.log(`✅ Course generated successfully!`);
    console.log(`📚 Total modules: ${generatedCourse.modules.length}`);
    console.log(
      `📖 Total lessons: ${generatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)}`
    );

    return generatedCourse;
  } catch (error) {
    console.error(`❌ Failed to generate course "${courseTitle}":`, error);
    throw new Error(`Course generation failed: ${error.message}`);
  }
}

/**
 * Generate course with custom parameters
 * @param {Object} params - Course generation parameters
 * @returns {Promise<Object>} Complete course JSON structure
 */
export async function generateCustomCourse(params) {
  const {
    courseTitle,
    difficultyLevel = 'intermediate',
    duration = '8 weeks',
    targetAudience = 'professionals',
    moduleCount = 5,
    lessonsPerModule = 4,
    subject = '',
    learningObjectives = [],
  } = params;

  if (!courseTitle) {
    throw new Error('Course title is required');
  }

  console.log(`🎯 Generating custom course: "${courseTitle}"`);

  const courseData = {
    courseTitle,
    difficultyLevel,
    duration,
    targetAudience,
    moduleCount,
    lessonsPerModule,
    subject,
    learningObjectives,
  };

  return await generateComprehensiveCourse(courseData);
}

/**
 * Quick course generation with minimal parameters
 * @param {string} title - Course title
 * @param {string} difficulty - beginner|intermediate|advanced
 * @returns {Promise<Object>} Complete course JSON structure
 */
export async function quickGenerateCourse(title, difficulty = 'intermediate') {
  const moduleCount =
    difficulty === 'beginner' ? 4 : difficulty === 'advanced' ? 6 : 5;
  const lessonsPerModule = difficulty === 'beginner' ? 3 : 4;
  const duration =
    difficulty === 'beginner'
      ? '6 weeks'
      : difficulty === 'advanced'
        ? '10 weeks'
        : '8 weeks';

  return await generateCourseForTitle(title, {
    difficultyLevel: difficulty,
    duration,
    moduleCount,
    lessonsPerModule,
  });
}

// Example usage functions for testing
export const examples = {
  /**
   * Generate a React course
   */
  async generateReactCourse() {
    return await generateCourseForTitle('Complete React Development', {
      difficultyLevel: 'intermediate',
      duration: '10 weeks',
      targetAudience: 'web developers',
      moduleCount: 6,
      lessonsPerModule: 4,
    });
  },

  /**
   * Generate a Python course
   */
  async generatePythonCourse() {
    return await generateCourseForTitle('Python Programming Fundamentals', {
      difficultyLevel: 'beginner',
      duration: '8 weeks',
      targetAudience: 'programming beginners',
      moduleCount: 5,
      lessonsPerModule: 3,
    });
  },

  /**
   * Generate a Machine Learning course
   */
  async generateMLCourse() {
    return await generateCourseForTitle('Machine Learning with Python', {
      difficultyLevel: 'advanced',
      duration: '12 weeks',
      targetAudience: 'data scientists',
      moduleCount: 6,
      lessonsPerModule: 5,
    });
  },
};

export default {
  generateCourseForTitle,
  generateCustomCourse,
  quickGenerateCourse,
  examples,
};
