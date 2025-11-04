// Fallback Course Generation Service
// Provides structured course generation when AI APIs are unavailable

/**
 * Fallback Course Generator
 * Creates structured, educational course outlines without AI dependencies
 */
class FallbackCourseGenerator {
  constructor() {
    this.courseTemplates = {
      // Technology courses
      technology: {
        modules: [
          {
            title: 'Introduction and Fundamentals',
            lessons: [
              'Getting Started and Overview',
              'Core Concepts and Terminology',
              'Setting Up Your Environment',
            ],
          },
          {
            title: 'Basic Implementation',
            lessons: [
              'First Steps and Basic Usage',
              'Common Patterns and Best Practices',
              'Hands-on Examples',
            ],
          },
          {
            title: 'Advanced Topics',
            lessons: [
              'Advanced Features and Techniques',
              'Performance Optimization',
              'Troubleshooting and Debugging',
            ],
          },
          {
            title: 'Real-World Applications',
            lessons: [
              'Project Planning and Architecture',
              'Building Complete Solutions',
              'Deployment and Maintenance',
            ],
          },
        ],
      },

      // Business courses
      business: {
        modules: [
          {
            title: 'Foundations and Strategy',
            lessons: [
              'Understanding the Fundamentals',
              'Strategic Planning and Analysis',
              'Market Research and Validation',
            ],
          },
          {
            title: 'Implementation and Operations',
            lessons: [
              'Operational Excellence',
              'Process Design and Management',
              'Quality Control and Metrics',
            ],
          },
          {
            title: 'Growth and Scaling',
            lessons: [
              'Growth Strategies and Planning',
              'Scaling Operations Effectively',
              'Managing Change and Innovation',
            ],
          },
          {
            title: 'Leadership and Management',
            lessons: [
              'Leadership Principles and Practices',
              'Team Building and Communication',
              'Performance Management',
            ],
          },
        ],
      },

      // Academic/Educational courses
      academic: {
        modules: [
          {
            title: 'Theoretical Foundations',
            lessons: [
              'Historical Context and Background',
              'Key Theories and Principles',
              'Foundational Concepts',
            ],
          },
          {
            title: 'Practical Applications',
            lessons: [
              'Real-World Examples and Case Studies',
              'Practical Exercises and Activities',
              'Problem-Solving Techniques',
            ],
          },
          {
            title: 'Advanced Analysis',
            lessons: [
              'Critical Analysis and Evaluation',
              'Advanced Methodologies',
              'Research and Investigation',
            ],
          },
          {
            title: 'Synthesis and Conclusion',
            lessons: [
              'Integrating Knowledge and Skills',
              'Future Directions and Trends',
              'Final Assessment and Review',
            ],
          },
        ],
      },

      // Creative/Arts courses
      creative: {
        modules: [
          {
            title: 'Creative Foundations',
            lessons: [
              'Understanding Creative Principles',
              'Tools and Techniques Overview',
              'Inspiration and Ideation',
            ],
          },
          {
            title: 'Skill Development',
            lessons: [
              'Basic Techniques and Methods',
              'Practice and Experimentation',
              'Style and Personal Expression',
            ],
          },
          {
            title: 'Advanced Techniques',
            lessons: [
              'Professional-Level Skills',
              'Complex Projects and Challenges',
              'Mastery and Refinement',
            ],
          },
          {
            title: 'Portfolio and Presentation',
            lessons: [
              'Creating a Professional Portfolio',
              'Presentation and Communication',
              'Career Development and Opportunities',
            ],
          },
        ],
      },
    };

    this.subjectKeywords = {
      technology: [
        'programming',
        'coding',
        'software',
        'web',
        'app',
        'development',
        'javascript',
        'python',
        'react',
        'node',
        'api',
        'database',
        'ai',
        'machine learning',
        'data',
        'cloud',
        'devops',
        'cybersecurity',
      ],
      business: [
        'management',
        'marketing',
        'finance',
        'accounting',
        'sales',
        'strategy',
        'leadership',
        'entrepreneurship',
        'startup',
        'business',
        'economics',
        'project management',
      ],
      academic: [
        'science',
        'mathematics',
        'history',
        'literature',
        'philosophy',
        'psychology',
        'sociology',
        'research',
        'theory',
        'analysis',
        'study',
      ],
      creative: [
        'design',
        'art',
        'photography',
        'writing',
        'music',
        'video',
        'animation',
        'creative',
        'artistic',
        'visual',
        'audio',
        'media',
      ],
    };
  }

  /**
   * Determine course category based on title and subject
   * @param {string} title - Course title
   * @param {string} subject - Course subject
   * @returns {string} Category name
   */
  determineCourseCategory(title, subject) {
    const searchText = `${title} ${subject}`.toLowerCase();

    for (const [category, keywords] of Object.entries(this.subjectKeywords)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          return category;
        }
      }
    }

    // Default to academic if no specific category found
    return 'academic';
  }

  /**
   * Generate course outline using templates
   * @param {Object} courseData - Course data
   * @returns {Object} Generated course outline
   */
  generateCourseOutline(courseData) {
    try {
      console.log(
        '📚 Generating fallback course outline for:',
        courseData.title
      );

      const category = this.determineCourseCategory(
        courseData.title,
        courseData.subject || ''
      );
      const template = this.courseTemplates[category];

      console.log(`📋 Using ${category} template for course generation`);

      // Customize the template for the specific course
      const customizedModules = template.modules.map((module, index) => {
        return {
          title: this.customizeModuleTitle(
            module.title,
            courseData.title,
            index + 1
          ),
          description: this.generateModuleDescription(
            module.title,
            courseData.title
          ),
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            title: this.customizeLessonTitle(
              lesson,
              courseData.title,
              index + 1,
              lessonIndex + 1
            ),
            description: this.generateLessonDescription(
              lesson,
              courseData.title
            ),
            duration: this.estimateLessonDuration(lessonIndex),
          })),
        };
      });

      return {
        success: true,
        data: {
          course_title: courseData.title,
          title: courseData.title,
          subject: courseData.subject || courseData.title,
          modules: customizedModules,
          generatedBy: 'fallback-generator',
          category: category,
          totalModules: customizedModules.length,
          totalLessons: customizedModules.reduce(
            (total, module) => total + module.lessons.length,
            0
          ),
          estimatedDuration: this.calculateTotalDuration(customizedModules),
        },
        provider: 'fallback',
      };
    } catch (error) {
      console.error('❌ Fallback course generation error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'fallback',
      };
    }
  }

  /**
   * Customize module title for specific course
   * @param {string} templateTitle - Template module title
   * @param {string} courseTitle - Course title
   * @param {number} moduleNumber - Module number
   * @returns {string} Customized title
   */
  customizeModuleTitle(templateTitle, courseTitle, moduleNumber) {
    const subject = this.extractSubjectFromTitle(courseTitle);

    const customizations = {
      'Introduction and Fundamentals': `Introduction to ${subject}`,
      'Theoretical Foundations': `${subject} Fundamentals`,
      'Creative Foundations': `${subject} Basics`,
      'Foundations and Strategy': `${subject} Strategy and Planning`,
      'Basic Implementation': `Getting Started with ${subject}`,
      'Practical Applications': `Applying ${subject} Concepts`,
      'Skill Development': `Developing ${subject} Skills`,
      'Implementation and Operations': `${subject} in Practice`,
      'Advanced Topics': `Advanced ${subject} Techniques`,
      'Advanced Analysis': `Advanced ${subject} Analysis`,
      'Advanced Techniques': `Mastering ${subject}`,
      'Growth and Scaling': `Scaling ${subject} Solutions`,
      'Real-World Applications': `${subject} in the Real World`,
      'Synthesis and Conclusion': `${subject} Integration and Review`,
      'Portfolio and Presentation': `${subject} Portfolio Development`,
      'Leadership and Management': `${subject} Leadership and Best Practices`,
    };

    return (
      customizations[templateTitle] || `${subject} - Module ${moduleNumber}`
    );
  }

  /**
   * Customize lesson title for specific course
   * @param {string} templateTitle - Template lesson title
   * @param {string} courseTitle - Course title
   * @param {number} moduleNumber - Module number
   * @param {number} lessonNumber - Lesson number
   * @returns {string} Customized title
   */
  customizeLessonTitle(templateTitle, courseTitle, moduleNumber, lessonNumber) {
    const subject = this.extractSubjectFromTitle(courseTitle);

    // Simple customization - replace generic terms with subject-specific ones
    return (
      templateTitle
        .replace(/Getting Started/, `Getting Started with ${subject}`)
        .replace(/Understanding/, `Understanding ${subject}`)
        .replace(/Core Concepts/, `${subject} Core Concepts`)
        .replace(/Basic/, `${subject} Basics`)
        .replace(/Advanced/, `Advanced ${subject}`)
        .replace(/Professional/, `Professional ${subject}`) ||
      `${subject} Lesson ${moduleNumber}.${lessonNumber}`
    );
  }

  /**
   * Extract main subject from course title
   * @param {string} title - Course title
   * @returns {string} Extracted subject
   */
  extractSubjectFromTitle(title) {
    // Handle undefined or null title
    if (!title || typeof title !== 'string') {
      return 'General Topic';
    }

    // Remove common course prefixes/suffixes
    const cleaned = title
      .replace(
        /^(Introduction to|Learn|Master|Complete|Comprehensive|Advanced|Basic|Beginner|Intermediate)\s+/i,
        ''
      )
      .replace(/\s+(Course|Tutorial|Guide|Training|Bootcamp|Masterclass)$/i, '')
      .trim();

    return cleaned || title;
  }

  /**
   * Generate module description
   * @param {string} moduleTitle - Module title
   * @param {string} courseTitle - Course title
   * @returns {string} Module description
   */
  generateModuleDescription(moduleTitle, courseTitle) {
    const subject = this.extractSubjectFromTitle(courseTitle);

    const descriptions = {
      'Introduction and Fundamentals': `Learn the essential foundations of ${subject}, including key concepts, terminology, and getting started with the basics.`,
      'Basic Implementation': `Put your ${subject} knowledge into practice with hands-on exercises, examples, and real-world applications.`,
      'Advanced Topics': `Explore advanced ${subject} techniques, best practices, and sophisticated approaches to complex challenges.`,
      'Real-World Applications': `Apply ${subject} skills to real-world projects, building complete solutions and understanding practical deployment.`,
    };

    return (
      descriptions[moduleTitle] ||
      `Comprehensive coverage of ${subject} concepts and practical applications in this essential module.`
    );
  }

  /**
   * Generate lesson description
   * @param {string} lessonTitle - Lesson title
   * @param {string} courseTitle - Course title
   * @returns {string} Lesson description
   */
  generateLessonDescription(lessonTitle, courseTitle) {
    const subject = this.extractSubjectFromTitle(courseTitle);
    return `Detailed exploration of ${lessonTitle.toLowerCase()} in the context of ${subject}, with practical examples and actionable insights.`;
  }

  /**
   * Estimate lesson duration based on position
   * @param {number} lessonIndex - Lesson index
   * @returns {string} Duration estimate
   */
  estimateLessonDuration(lessonIndex) {
    const durations = [
      '25 minutes',
      '30 minutes',
      '35 minutes',
      '40 minutes',
      '45 minutes',
    ];
    return durations[lessonIndex % durations.length];
  }

  /**
   * Calculate total course duration
   * @param {Array} modules - Course modules
   * @returns {string} Total duration
   */
  calculateTotalDuration(modules) {
    const totalLessons = modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );
    const averageDuration = 35; // minutes
    const totalMinutes = totalLessons * averageDuration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} hours ${minutes > 0 ? minutes + ' minutes' : ''}`.trim();
    }
    return `${totalMinutes} minutes`;
  }

  /**
   * Generate lesson content (basic structure)
   * @param {string} lessonTitle - Lesson title
   * @param {string} moduleTitle - Module title
   * @param {string} courseTitle - Course title
   * @returns {Object} Lesson content
   */
  generateLessonContent(lessonTitle, moduleTitle, courseTitle) {
    try {
      const subject = this.extractSubjectFromTitle(courseTitle);

      return {
        success: true,
        data: {
          heading: lessonTitle,
          introduction: `Welcome to this lesson on ${lessonTitle}. In this session, we'll explore the key concepts and practical applications of ${lessonTitle} within the context of ${subject}. You'll gain hands-on experience and develop a solid understanding of the fundamentals.`,
          content: [
            `Understanding the core principles of ${lessonTitle} and how they apply to ${subject} development and implementation.`,
            `Practical examples and real-world scenarios where ${lessonTitle} plays a crucial role in ${subject} projects and workflows.`,
            `Best practices, common pitfalls to avoid, and expert tips for mastering ${lessonTitle} in your ${subject} journey.`,
          ],
          summary: `In this lesson, you've learned about ${lessonTitle} and its importance in ${subject}. You now have the foundational knowledge to apply these concepts in practical scenarios and continue building your expertise in ${subject}.`,
          generatedBy: 'fallback-generator',
        },
        provider: 'fallback',
      };
    } catch (error) {
      console.error('❌ Fallback lesson generation error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'fallback',
      };
    }
  }

  /**
   * Generate content based on prompt (generic method for enhanced AI service)
   * @param {string} prompt - Content generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated content result
   */
  async generateContent(prompt, options = {}) {
    try {
      console.log(
        '🔄 Using fallback content generation for prompt:',
        prompt.substring(0, 100) + '...'
      );

      // Analyze prompt to determine content type
      const promptLower = prompt.toLowerCase();

      if (
        promptLower.includes('course outline') ||
        promptLower.includes('modules')
      ) {
        // Generate course outline
        const courseTitle = this.extractCourseTitle(prompt) || 'Course Content';
        return await this.generateCourseOutline(courseTitle);
      } else if (
        promptLower.includes('lesson') ||
        promptLower.includes('content')
      ) {
        // Generate lesson content
        const lessonTitle = this.extractLessonTitle(prompt) || 'Lesson Content';
        return await this.generateLessonContent(lessonTitle);
      } else {
        // Generate generic educational content
        return {
          success: true,
          content: this.generateGenericContent(prompt),
          provider: 'fallback',
          type: 'generic',
        };
      }
    } catch (error) {
      console.error('❌ Fallback content generation error:', error);
      return {
        success: false,
        error: error.message,
        content: 'Unable to generate content at this time.',
        provider: 'fallback',
      };
    }
  }

  /**
   * Extract course title from prompt
   * @param {string} prompt - Generation prompt
   * @returns {string} Extracted course title
   */
  extractCourseTitle(prompt) {
    const matches =
      prompt.match(/course.*?["']([^"']+)["']/i) ||
      prompt.match(/about\s+([^.]+)/i) ||
      prompt.match(/for\s+([^.]+)/i);
    return matches ? matches[1].trim() : null;
  }

  /**
   * Extract lesson title from prompt
   * @param {string} prompt - Generation prompt
   * @returns {string} Extracted lesson title
   */
  extractLessonTitle(prompt) {
    const matches =
      prompt.match(/lesson.*?["']([^"']+)["']/i) ||
      prompt.match(/about\s+([^.]+)/i) ||
      prompt.match(/explain\s+([^.]+)/i);
    return matches ? matches[1].trim() : null;
  }

  /**
   * Generate generic educational content
   * @param {string} prompt - Content prompt
   * @returns {string} Generated content
   */
  generateGenericContent(prompt) {
    const templates = [
      `This section covers important concepts related to the topic. Understanding these fundamentals is essential for building a strong foundation in the subject matter.`,
      `Key points to remember: This content provides essential knowledge that will help you understand the core principles and apply them effectively in practical situations.`,
      `Learning objectives: By the end of this section, you will have a comprehensive understanding of the topic and be able to apply the concepts in real-world scenarios.`,
      `Important considerations: This material builds upon previous knowledge and introduces new concepts that are crucial for advanced understanding of the subject.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Check if fallback generator is available (always true)
   * @returns {boolean} Always true
   */
  isAvailable() {
    return true;
  }

  /**
   * Get fallback generator status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      available: true,
      provider: 'fallback',
      templates: Object.keys(this.courseTemplates).length,
      categories: Object.keys(this.courseTemplates),
      reliability: 'high',
      description: 'Template-based course generation (always available)',
    };
  }
}

// Create and export singleton instance
const fallbackCourseGenerator = new FallbackCourseGenerator();
export default fallbackCourseGenerator;

// Export individual methods for convenience
export const {
  generateCourseOutline,
  generateLessonContent,
  isAvailable,
  getStatus,
} = fallbackCourseGenerator;
