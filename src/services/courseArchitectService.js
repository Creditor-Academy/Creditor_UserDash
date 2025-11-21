// Course Architect Service - Comprehensive Course Generation
// Expert course architect, instructional designer, and visual storyteller
import openAIService from './openAIService';

/**
 * Course Architect Service
 * Creates comprehensive, advanced-level courses with deep theoretical understanding
 * and practical, project-based learning
 */
class CourseArchitectService {
  constructor() {
    this.openAI = openAIService;
  }

  /**
   * Generate comprehensive course structure with detailed lessons
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Complete course structure
   */
  async generateComprehensiveCourse(courseData) {
    const {
      courseTitle,
      subjectDomain,
      courseDescription,
      duration,
      difficulty,
      learningObjectives,
    } = courseData;

    console.log('🎯 Generating comprehensive course:', courseTitle);

    const systemPrompt = `You are an expert course architect, instructional designer, and visual storyteller.
Your goal is to create a **comprehensive, advanced-level course** that blends deep theoretical understanding with practical, project-based learning.

You must create a complete and detailed course structure with the following hierarchy:
- 5–8 Modules (each module represents a major concept or milestone)
- Each module contains 3–5 lessons
- Each lesson includes all required components with maximum depth and clarity

Focus on professional-level learning path for developers, researchers, or professionals in the subject domain.
Use clear academic tone but keep it engaging and practical.
Ensure all JSON keys are present and valid.
The result should be ready-to-use for building lesson pages, quizzes, and visuals.`;

    const userPrompt = `Create a comprehensive, advanced-level course for:

**Course Information:**
- Title: ${courseTitle}
- Domain/Field: ${subjectDomain}
- Description: ${courseDescription}
- Duration: ${duration}
- Difficulty: ${difficulty}
- Learning Objectives: ${learningObjectives}

**Requirements:**
1. Create 5–8 modules with 3–5 lessons each
2. Each lesson must include:
   - Title
   - Overview (200–300 words)
   - Key Concepts (bullet points)
   - Detailed Lesson Content (500–800 words)
   - Real-world Examples or Case Studies
   - Small Hands-on Project or Practice Exercise
   - Summary (5–7 sentences)
   - Quiz Questions (3–5, multiple choice)
   - Suggested Reading/Resources (3–4)
   - 4–5 image prompts for AI image generation

3. Image prompts should be descriptive for AI generation (diagrams, workflows, visual explanations, cover images)

**Output Format (strict JSON):**
{
  "courseTitle": "${courseTitle}",
  "difficulty": "${difficulty}",
  "duration": "${duration}",
  "modules": [
    {
      "moduleTitle": "Module Title",
      "moduleDescription": "Module description",
      "lessons": [
        {
          "lessonTitle": "Lesson Title",
          "overview": "200-300 word overview",
          "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
          "content": "500-800 word detailed content",
          "example": "Real-world example or case study",
          "exercise": "Hands-on project or practice exercise",
          "summary": "5-7 sentence summary",
          "quiz": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Correct option"
            }
          ],
          "resources": ["Resource 1", "Resource 2", "Resource 3"],
          "imagePrompts": [
            "Image Prompt 1: Detailed description for AI generation",
            "Image Prompt 2: Detailed description for AI generation",
            "Image Prompt 3: Detailed description for AI generation",
            "Image Prompt 4: Detailed description for AI generation",
            "Image Prompt 5: Detailed description for AI generation"
          ]
        }
      ]
    }
  ]
}

Generate comprehensive content that feels like a professional-level learning path. Return ONLY valid JSON.`;

    try {
      const courseStructure = await this.openAI.generateStructured(
        systemPrompt,
        userPrompt,
        {
          model: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.7,
        }
      );

      // Validate and enhance the generated structure
      const validatedCourse = this.validateAndEnhanceCourse(
        courseStructure,
        courseData
      );

      console.log('✅ Comprehensive course generated successfully');
      console.log(`📚 Modules: ${validatedCourse.modules.length}`);
      console.log(
        `📝 Total Lessons: ${this.countTotalLessons(validatedCourse)}`
      );

      return {
        success: true,
        data: validatedCourse,
        provider: 'openai-architect',
      };
    } catch (error) {
      console.error('❌ Comprehensive course generation failed:', error);

      // Fallback to structured generation
      const fallbackCourse =
        this.generateFallbackComprehensiveCourse(courseData);

      return {
        success: true,
        data: fallbackCourse,
        provider: 'fallback-architect',
        warning: `Used fallback generation: ${error.message}`,
      };
    }
  }

  /**
   * Validate and enhance generated course structure
   * @param {Object} courseStructure - Generated course structure
   * @param {Object} originalData - Original course data
   * @returns {Object} Validated and enhanced course
   */
  validateAndEnhanceCourse(courseStructure, originalData) {
    // Ensure basic structure
    if (!courseStructure.modules || !Array.isArray(courseStructure.modules)) {
      courseStructure.modules = [];
    }

    // Validate modules (5-8 modules)
    if (courseStructure.modules.length < 5) {
      console.warn('⚠️ Less than 5 modules generated, adding fallback modules');
      while (courseStructure.modules.length < 5) {
        courseStructure.modules.push(
          this.generateFallbackModule(
            courseStructure.modules.length + 1,
            originalData
          )
        );
      }
    }

    if (courseStructure.modules.length > 8) {
      console.warn('⚠️ More than 8 modules generated, trimming to 8');
      courseStructure.modules = courseStructure.modules.slice(0, 8);
    }

    // Validate each module
    courseStructure.modules = courseStructure.modules.map((module, index) => {
      return this.validateAndEnhanceModule(module, index + 1, originalData);
    });

    // Ensure course-level properties
    courseStructure.courseTitle =
      courseStructure.courseTitle || originalData.courseTitle;
    courseStructure.difficulty =
      courseStructure.difficulty || originalData.difficulty;
    courseStructure.duration =
      courseStructure.duration || originalData.duration;

    return courseStructure;
  }

  /**
   * Validate and enhance module structure
   * @param {Object} module - Module to validate
   * @param {number} moduleIndex - Module index
   * @param {Object} courseData - Course data
   * @returns {Object} Validated module
   */
  validateAndEnhanceModule(module, moduleIndex, courseData) {
    // Ensure basic module properties
    module.moduleTitle =
      module.moduleTitle ||
      `Module ${moduleIndex}: ${courseData.subjectDomain} Fundamentals`;
    module.moduleDescription =
      module.moduleDescription ||
      `Comprehensive coverage of key concepts in ${courseData.subjectDomain}`;

    // Ensure lessons array
    if (!module.lessons || !Array.isArray(module.lessons)) {
      module.lessons = [];
    }

    // Validate lessons (3-5 per module)
    if (module.lessons.length < 3) {
      console.warn(
        `⚠️ Module ${moduleIndex} has less than 3 lessons, adding fallback lessons`
      );
      while (module.lessons.length < 3) {
        module.lessons.push(
          this.generateFallbackLesson(
            module.lessons.length + 1,
            module.moduleTitle,
            courseData
          )
        );
      }
    }

    if (module.lessons.length > 5) {
      console.warn(
        `⚠️ Module ${moduleIndex} has more than 5 lessons, trimming to 5`
      );
      module.lessons = module.lessons.slice(0, 5);
    }

    // Validate each lesson
    module.lessons = module.lessons.map((lesson, index) => {
      return this.validateAndEnhanceLesson(
        lesson,
        index + 1,
        module.moduleTitle,
        courseData
      );
    });

    return module;
  }

  /**
   * Validate and enhance lesson structure
   * @param {Object} lesson - Lesson to validate
   * @param {number} lessonIndex - Lesson index
   * @param {string} moduleTitle - Module title
   * @param {Object} courseData - Course data
   * @returns {Object} Validated lesson
   */
  validateAndEnhanceLesson(lesson, lessonIndex, moduleTitle, courseData) {
    // Ensure all required lesson properties
    lesson.lessonTitle =
      lesson.lessonTitle || `Lesson ${lessonIndex}: ${moduleTitle} Basics`;
    lesson.overview =
      lesson.overview ||
      this.generateFallbackOverview(lesson.lessonTitle, courseData);
    lesson.keyConcepts =
      lesson.keyConcepts ||
      this.generateFallbackKeyConcepts(lesson.lessonTitle);
    lesson.content =
      lesson.content ||
      this.generateFallbackContent(lesson.lessonTitle, courseData);
    lesson.example =
      lesson.example ||
      this.generateFallbackExample(lesson.lessonTitle, courseData);
    lesson.exercise =
      lesson.exercise ||
      this.generateFallbackExercise(lesson.lessonTitle, courseData);
    lesson.summary =
      lesson.summary || this.generateFallbackSummary(lesson.lessonTitle);
    lesson.quiz = lesson.quiz || this.generateFallbackQuiz(lesson.lessonTitle);
    lesson.resources =
      lesson.resources ||
      this.generateFallbackResources(lesson.lessonTitle, courseData);
    lesson.imagePrompts =
      lesson.imagePrompts ||
      this.generateFallbackImagePrompts(lesson.lessonTitle, courseData);

    // Validate quiz structure
    if (!Array.isArray(lesson.quiz)) {
      lesson.quiz = [];
    }

    lesson.quiz = lesson.quiz.map(q => ({
      question:
        q.question || `What is the main concept of ${lesson.lessonTitle}?`,
      options:
        Array.isArray(q.options) && q.options.length === 4
          ? q.options
          : ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: q.answer || q.options?.[0] || 'Option A',
    }));

    // Ensure 3-5 quiz questions
    while (lesson.quiz.length < 3) {
      lesson.quiz.push(
        this.generateFallbackQuizQuestion(
          lesson.lessonTitle,
          lesson.quiz.length + 1
        )
      );
    }

    if (lesson.quiz.length > 5) {
      lesson.quiz = lesson.quiz.slice(0, 5);
    }

    // Validate image prompts (4-5 prompts)
    if (!Array.isArray(lesson.imagePrompts)) {
      lesson.imagePrompts = [];
    }

    while (lesson.imagePrompts.length < 4) {
      lesson.imagePrompts.push(
        this.generateFallbackImagePrompt(
          lesson.lessonTitle,
          courseData,
          lesson.imagePrompts.length + 1
        )
      );
    }

    if (lesson.imagePrompts.length > 5) {
      lesson.imagePrompts = lesson.imagePrompts.slice(0, 5);
    }

    return lesson;
  }

  /**
   * Generate fallback comprehensive course structure
   * @param {Object} courseData - Course data
   * @returns {Object} Fallback course structure
   */
  generateFallbackComprehensiveCourse(courseData) {
    const { courseTitle, subjectDomain, difficulty, duration } = courseData;

    console.log('📚 Generating fallback comprehensive course structure');

    const modules = [];
    const moduleTemplates = [
      { title: `Introduction to ${subjectDomain}`, focus: 'fundamentals' },
      { title: `${subjectDomain} Core Concepts`, focus: 'concepts' },
      { title: `Practical ${subjectDomain}`, focus: 'practical' },
      { title: `Advanced ${subjectDomain}`, focus: 'advanced' },
      { title: `${subjectDomain} Best Practices`, focus: 'best-practices' },
      { title: `Real-world ${subjectDomain}`, focus: 'real-world' },
    ];

    for (let i = 0; i < 6; i++) {
      const template = moduleTemplates[i];
      modules.push(this.generateFallbackModule(i + 1, courseData, template));
    }

    return {
      courseTitle,
      difficulty,
      duration,
      modules,
    };
  }

  /**
   * Generate fallback module
   * @param {number} moduleIndex - Module index
   * @param {Object} courseData - Course data
   * @param {Object} template - Module template
   * @returns {Object} Fallback module
   */
  generateFallbackModule(moduleIndex, courseData, template = null) {
    const { subjectDomain } = courseData;
    const moduleTitle =
      template?.title || `Module ${moduleIndex}: ${subjectDomain} Essentials`;
    const focus = template?.focus || 'general';

    const lessons = [];
    for (let i = 0; i < 4; i++) {
      lessons.push(
        this.generateFallbackLesson(i + 1, moduleTitle, courseData, focus)
      );
    }

    return {
      moduleTitle,
      moduleDescription: `Comprehensive module covering ${focus} aspects of ${subjectDomain}. This module provides in-depth understanding and practical applications.`,
      lessons,
    };
  }

  /**
   * Generate fallback lesson
   * @param {number} lessonIndex - Lesson index
   * @param {string} moduleTitle - Module title
   * @param {Object} courseData - Course data
   * @param {string} focus - Lesson focus area
   * @returns {Object} Fallback lesson
   */
  generateFallbackLesson(
    lessonIndex,
    moduleTitle,
    courseData,
    focus = 'general'
  ) {
    const { subjectDomain, courseTitle } = courseData;
    const lessonTitle = `Lesson ${lessonIndex}: ${subjectDomain} ${focus === 'general' ? 'Fundamentals' : focus}`;

    return {
      lessonTitle,
      overview: this.generateFallbackOverview(lessonTitle, courseData),
      keyConcepts: this.generateFallbackKeyConcepts(lessonTitle),
      content: this.generateFallbackContent(lessonTitle, courseData),
      example: this.generateFallbackExample(lessonTitle, courseData),
      exercise: this.generateFallbackExercise(lessonTitle, courseData),
      summary: this.generateFallbackSummary(lessonTitle),
      quiz: [
        this.generateFallbackQuizQuestion(lessonTitle, 1),
        this.generateFallbackQuizQuestion(lessonTitle, 2),
        this.generateFallbackQuizQuestion(lessonTitle, 3),
      ],
      resources: this.generateFallbackResources(lessonTitle, courseData),
      imagePrompts: this.generateFallbackImagePrompts(lessonTitle, courseData),
    };
  }

  // Fallback content generators
  generateFallbackOverview(lessonTitle, courseData) {
    return `This comprehensive lesson explores ${lessonTitle} within the context of ${courseData.subjectDomain}. Students will gain deep understanding of core principles, practical applications, and real-world implementations. The lesson combines theoretical foundations with hands-on experience, ensuring learners can apply concepts immediately. Through structured learning objectives and progressive skill building, participants will master essential techniques and best practices. This lesson serves as a cornerstone for advanced topics and provides the necessary foundation for professional development in ${courseData.subjectDomain}. Interactive elements and practical exercises reinforce learning outcomes and promote retention.`;
  }

  generateFallbackKeyConcepts(lessonTitle) {
    return [
      `Core principles of ${lessonTitle}`,
      `Practical applications and use cases`,
      `Best practices and methodologies`,
      `Common challenges and solutions`,
      `Industry standards and guidelines`,
    ];
  }

  generateFallbackContent(lessonTitle, courseData) {
    return `${lessonTitle} represents a fundamental aspect of ${courseData.subjectDomain} that professionals must master to achieve excellence in their field. This comprehensive exploration begins with foundational concepts and progressively builds to advanced applications.

The theoretical framework underlying ${lessonTitle} encompasses several key principles that guide practical implementation. These principles have evolved through decades of research and real-world application, forming the backbone of modern ${courseData.subjectDomain} practices.

Understanding the historical context provides valuable insights into why certain approaches have become standard practice. The evolution of ${lessonTitle} reflects broader trends in technology, methodology, and professional requirements that continue to shape the field today.

Practical implementation requires careful consideration of various factors including scalability, maintainability, and performance. Industry leaders have developed proven methodologies that balance theoretical ideals with real-world constraints, creating frameworks that deliver consistent results.

Modern approaches to ${lessonTitle} leverage cutting-edge tools and techniques while maintaining compatibility with established systems. This balance ensures that solutions remain viable in diverse environments while taking advantage of technological advances.

Case studies from leading organizations demonstrate how ${lessonTitle} principles translate into successful outcomes. These examples provide concrete evidence of best practices and highlight common pitfalls to avoid during implementation.`;
  }

  generateFallbackExample(lessonTitle, courseData) {
    return `**Real-world Case Study: ${lessonTitle} in Action**

Consider a leading technology company implementing ${lessonTitle} principles in their ${courseData.subjectDomain} infrastructure. The organization faced challenges with scalability and performance, requiring a comprehensive approach that balanced innovation with reliability.

**Challenge:** The company needed to modernize their approach while maintaining backward compatibility with existing systems. Traditional methods were proving insufficient for their growing requirements.

**Solution:** By applying ${lessonTitle} methodologies, the team developed a hybrid approach that leveraged both established practices and innovative techniques. This solution addressed immediate needs while providing a foundation for future growth.

**Implementation:** The project was executed in phases, with each stage building upon previous achievements. Key stakeholders were involved throughout the process, ensuring alignment with business objectives and technical requirements.

**Results:** The implementation resulted in 40% improved performance, 60% reduction in maintenance overhead, and significantly enhanced user satisfaction. The success of this project has become a model for similar initiatives across the industry.

**Key Takeaways:** This case study demonstrates the importance of systematic planning, stakeholder engagement, and iterative improvement in successfully applying ${lessonTitle} principles.`;
  }

  generateFallbackExercise(lessonTitle, courseData) {
    return `**Hands-on Project: Implementing ${lessonTitle}**

**Objective:** Apply ${lessonTitle} concepts to solve a realistic ${courseData.subjectDomain} challenge.

**Scenario:** You are tasked with designing a solution that incorporates ${lessonTitle} principles for a medium-sized organization. The solution must be scalable, maintainable, and cost-effective.

**Requirements:**
1. Analyze the given requirements and identify key constraints
2. Design an architecture that applies ${lessonTitle} best practices
3. Create a detailed implementation plan with milestones
4. Identify potential risks and mitigation strategies
5. Develop success metrics and evaluation criteria

**Deliverables:**
- Technical specification document (2-3 pages)
- Architecture diagram with component relationships
- Implementation timeline with resource requirements
- Risk assessment matrix with mitigation plans
- Success metrics and KPI definitions

**Evaluation Criteria:**
- Technical accuracy and feasibility (30%)
- Application of ${lessonTitle} principles (25%)
- Clarity and completeness of documentation (20%)
- Innovation and creativity in approach (15%)
- Practical considerations and constraints (10%)

**Time Allocation:** 2-3 hours for completion, with optional peer review session.`;
  }

  generateFallbackSummary(lessonTitle) {
    return `This lesson provided comprehensive coverage of ${lessonTitle}, establishing both theoretical understanding and practical application skills. Key learning outcomes include mastery of core principles, understanding of real-world applications, and ability to implement solutions effectively. Students explored industry best practices through detailed case studies and hands-on exercises that reinforce conceptual learning. The practical project component ensures learners can apply knowledge immediately in professional contexts. Critical thinking skills were developed through analysis of complex scenarios and evaluation of alternative approaches. This foundation prepares students for advanced topics while providing immediately applicable skills for current projects. The combination of theory and practice creates a robust learning experience that supports both academic understanding and professional development.`;
  }

  generateFallbackQuizQuestion(lessonTitle, questionNumber) {
    const questions = [
      {
        question: `What is the primary objective of ${lessonTitle}?`,
        options: [
          'To establish foundational understanding',
          'To replace existing methodologies',
          'To complicate current processes',
          'To reduce system functionality',
        ],
        answer: 'To establish foundational understanding',
      },
      {
        question: `Which factor is most critical when implementing ${lessonTitle} principles?`,
        options: [
          'Cost considerations only',
          'Balancing theory with practical constraints',
          'Following trends blindly',
          'Avoiding stakeholder input',
        ],
        answer: 'Balancing theory with practical constraints',
      },
      {
        question: `How do industry best practices relate to ${lessonTitle}?`,
        options: [
          'They are completely unrelated',
          'They provide proven frameworks for implementation',
          'They should be avoided in favor of innovation',
          'They only apply to large organizations',
        ],
        answer: 'They provide proven frameworks for implementation',
      },
    ];

    return questions[(questionNumber - 1) % questions.length];
  }

  generateFallbackQuiz(lessonTitle) {
    return [
      this.generateFallbackQuizQuestion(lessonTitle, 1),
      this.generateFallbackQuizQuestion(lessonTitle, 2),
      this.generateFallbackQuizQuestion(lessonTitle, 3),
    ];
  }

  generateFallbackResources(lessonTitle, courseData) {
    return [
      `"Advanced ${courseData.subjectDomain}: Theory and Practice" - Comprehensive textbook covering ${lessonTitle} fundamentals`,
      `Industry whitepaper: "Best Practices in ${lessonTitle} Implementation" - Current methodologies and case studies`,
      `Online documentation: Official ${courseData.subjectDomain} guidelines and standards for ${lessonTitle}`,
      `Research paper: "Future Trends in ${lessonTitle}" - Academic analysis of emerging developments`,
    ];
  }

  generateFallbackImagePrompts(lessonTitle, courseData) {
    return [
      `Image Prompt 1: Professional diagram showing ${lessonTitle} architecture with clean modern design, technical illustration style with blue and gray color scheme`,
      `Image Prompt 2: Infographic displaying ${lessonTitle} workflow process with numbered steps, icons, and connecting arrows - clean business presentation style`,
      `Image Prompt 3: 3D visualization of ${courseData.subjectDomain} concepts related to ${lessonTitle} with futuristic design elements and glowing connections`,
      `Image Prompt 4: Real-world application screenshot showing ${lessonTitle} implementation in professional software interface - modern UI design`,
      `Image Prompt 5: Conceptual illustration representing ${lessonTitle} principles using abstract geometric shapes and gradients - contemporary digital art style`,
    ];
  }

  generateFallbackImagePrompt(lessonTitle, courseData, promptIndex) {
    const prompts = this.generateFallbackImagePrompts(lessonTitle, courseData);
    return prompts[(promptIndex - 1) % prompts.length];
  }

  /**
   * Count total lessons in course
   * @param {Object} course - Course structure
   * @returns {number} Total lesson count
   */
  countTotalLessons(course) {
    return course.modules.reduce((total, module) => {
      return total + (module.lessons ? module.lessons.length : 0);
    }, 0);
  }

  /**
   * Generate images for lesson image prompts
   * @param {Array} imagePrompts - Array of image prompts
   * @param {string} lessonTitle - Lesson title for context
   * @returns {Promise<Array>} Generated image URLs
   */
  async generateLessonImages(imagePrompts, lessonTitle) {
    const generatedImages = [];

    console.log(
      `🎨 Generating ${imagePrompts.length} images for lesson: ${lessonTitle}`
    );

    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        const prompt = imagePrompts[i].replace(/^Image Prompt \d+:\s*/, '');
        console.log(
          `🎨 Generating image ${i + 1}/${imagePrompts.length}: ${prompt.substring(0, 50)}...`
        );

        const result = await this.openAI.generateImage(prompt, {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        });

        if (result.success) {
          generatedImages.push({
            prompt: imagePrompts[i],
            url: result.url,
            index: i + 1,
          });
          console.log(`✅ Image ${i + 1} generated successfully`);
        } else {
          console.warn(`⚠️ Failed to generate image ${i + 1}: ${result.error}`);
          generatedImages.push({
            prompt: imagePrompts[i],
            url: null,
            error: result.error,
            index: i + 1,
          });
        }

        // Add delay to avoid rate limits
        if (i < imagePrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error generating image ${i + 1}:`, error);
        generatedImages.push({
          prompt: imagePrompts[i],
          url: null,
          error: error.message,
          index: i + 1,
        });
      }
    }

    const successCount = generatedImages.filter(img => img.url).length;
    console.log(
      `🎨 Image generation complete: ${successCount}/${imagePrompts.length} successful`
    );

    return generatedImages;
  }
}

// Create and export singleton instance
const courseArchitectService = new CourseArchitectService();
export default courseArchitectService;

// Named exports for convenience
export const { generateComprehensiveCourse, generateLessonImages } =
  courseArchitectService;
