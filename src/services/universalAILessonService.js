import enhancedAIService from './enhancedAIService';
import { generateLessonFromPrompt } from './aiCourseService';
import { updateLessonContent } from './courseService';
import openAIService from './openAIService';
import { uploadAIGeneratedImage } from './aiUploadService';
import contentLibraryAIService from './contentLibraryAIService';

/**
 * Universal AI Lesson Content Generation Service
 * Works with any lesson regardless of how it was created
 */
class UniversalAILessonService {
  constructor() {
    this.aiService = enhancedAIService;
  }

  /**
   * Generate comprehensive lesson content for any lesson
   * @param {Object} lessonData - Lesson information
   * @param {Object} moduleData - Module information
   * @param {Object} courseData - Course information
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Generated content blocks
   */
  async generateLessonContent(
    lessonData,
    moduleData = {},
    courseData = {},
    options = {}
  ) {
    try {
      console.log('🎯 Universal AI Lesson Content Generation Started');
      console.log('📚 Lesson:', lessonData?.title || 'Unknown');
      console.log('📖 Module:', moduleData?.title || 'Unknown');
      console.log('🎓 Course:', courseData?.title || 'Unknown');

      const lessonTitle = lessonData?.title || 'Untitled Lesson';
      const moduleTitle = moduleData?.title || 'Module';
      const courseTitle = courseData?.title || 'Course';

      // Use simple single lesson approach
      if (options.simple || options.fallback) {
        return this.generateSimpleLessonContent(
          lessonTitle,
          moduleTitle,
          courseTitle
        );
      }

      // Structured lesson plan path for premium mode
      if (options.useStructuredLessonPlan) {
        const structuredBlocks = await this.generateLessonFromStructuredPlan(
          lessonData,
          moduleData,
          courseData,
          options
        );

        if (structuredBlocks && structuredBlocks.length > 0) {
          return structuredBlocks;
        }
      }

      // NEW: Use comprehensive content library generation
      if (options.useContentLibrary !== false) {
        console.log('🎯 Using comprehensive content library generation');
        const blocks =
          await contentLibraryAIService.generateComprehensiveLessonContent(
            lessonTitle,
            moduleTitle,
            courseTitle
          );
        return blocks;
      }

      // Fallback: Generate content blocks based on options
      const blocks = await this.generateContentBlocks({
        lessonTitle,
        moduleTitle,
        courseTitle,
        options,
      });

      console.log(`✅ Generated ${blocks.length} content blocks`);
      return blocks;
    } catch (error) {
      console.error('❌ Universal AI lesson generation failed:', error);
      // Return simple fallback content
      return this.generateSimpleLessonContent(
        lessonData?.title || 'Untitled Lesson',
        moduleData?.title || 'Module',
        courseData?.title || 'Course'
      );
    }
  }

  async generateLessonFromStructuredPlan(
    lessonData,
    moduleData,
    courseData,
    options = {}
  ) {
    const lessonTitle = lessonData?.title || 'Untitled Lesson';
    const moduleTitle = moduleData?.title || 'Module';
    const courseTitle = courseData?.title || 'Course';

    try {
      const systemPrompt = `You are a senior instructional designer creating a complete lesson plan for a professional online course.
Return ONLY valid JSON with the following top-level keys:
- "meta": { "lessonTitle": string, "difficulty": string, "estimatedTimeMinutes": number }
- "overview": { "shortSummary": string, "whyItMatters": string }
- "objectives": [string]
- "coreConcepts": { "explanation": string, "keyPoints": [string], "comparisonTable": { "headers": [string], "rows": [[string]] } }
- "guidedExample": { "title": string, "steps": [string], "explanation": string }
- "practice": { "taskTitle": string, "steps": [string] }
- "bestPractices": { "tips": [string], "pitfalls": [string] }
- "assessment": { "reflectionQuestions": [string] }
- "resources": [ { "title": string, "url": string, "description": string } ]
- "images": [ { "slot": string, "prompt": string, "alt": string } ]`;

      const inputSummary = {
        course: courseData || {},
        module: moduleData || {},
        lesson: lessonData || {},
        options: {
          difficulty: courseData?.difficulty,
          mode: options.mode || 'premium',
          includeImages: options.includeImages !== false,
        },
      };

      const userPrompt = `Create a complete lesson plan for the following context.

Focus on accurate, production-grade educational content that a learner can rely on.
Use clear language, concrete examples, and avoid markdown or bullet characters inside strings.
Use arrays for lists like objectives, keyPoints, tips, steps, and questions.

Inputs:
${JSON.stringify(inputSummary, null, 2)}`;

      const plan = await openAIService.generateStructured(
        systemPrompt,
        userPrompt,
        {
          model: 'gpt-4o-mini',
          maxTokens: 3200,
          temperature: 0.7,
        }
      );

      if (!plan || typeof plan !== 'object') {
        return [];
      }

      const blocks = await this.convertLessonPlanToBlocks(
        plan,
        lessonTitle,
        moduleTitle,
        courseTitle,
        options
      );

      return blocks;
    } catch (error) {
      console.error('❌ Structured lesson plan generation failed:', error);
      return [];
    }
  }

  async convertLessonPlanToBlocks(
    plan,
    lessonTitle,
    moduleTitle,
    courseTitle,
    options = {}
  ) {
    const blocks = [];
    let order = 0;

    const meta = plan.meta || {};
    const overview = plan.overview || {};
    const objectives = Array.isArray(plan.objectives)
      ? plan.objectives
      : plan.objectives
        ? [plan.objectives]
        : [];
    const coreConcepts = plan.coreConcepts || {};
    const guidedExample = plan.guidedExample || {};
    const practice = plan.practice || {};
    const bestPractices = plan.bestPractices || {};
    const assessment = plan.assessment || {};
    const resources = Array.isArray(plan.resources) ? plan.resources : [];

    const title = meta.lessonTitle || lessonTitle;

    blocks.push(this.createMasterHeading(title, order++, 'gradient1'));

    const overviewText =
      overview.shortSummary ||
      overview.description ||
      `This lesson introduces ${title} as part of ${moduleTitle} in the ${courseTitle} course.`;

    blocks.push({
      id: `overview-${Date.now()}`,
      type: 'text',
      textType: 'paragraph',
      content: overviewText,
      order: order++,
      isAIGenerated: true,
    });

    if (options.includeImages !== false) {
      try {
        const heroBlock = await this.generateLessonHeroImage(
          title,
          moduleTitle,
          courseTitle,
          order++
        );
        if (heroBlock) {
          blocks.push(heroBlock);
        }
      } catch (imageError) {
        console.warn('⚠️ Hero image skipped:', imageError.message);
      }
    }

    if (objectives.length > 0) {
      blocks.push({
        id: `objectives-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Learning Objectives',
        order: order++,
        isAIGenerated: true,
      });

      blocks.push({
        id: `objectives-list-${Date.now()}`,
        type: 'list',
        listType: 'numbered',
        numberingStyle: 'decimal',
        items: objectives,
        order: order++,
        isAIGenerated: true,
      });
    }

    const coreExplanation = coreConcepts.explanation;
    const coreKeyPoints = Array.isArray(coreConcepts.keyPoints)
      ? coreConcepts.keyPoints
      : [];

    if (coreExplanation || coreKeyPoints.length > 0) {
      blocks.push({
        id: `core-heading-${Date.now()}`,
        type: 'text',
        textType: 'heading',
        content: 'Core Concepts',
        order: order++,
        isAIGenerated: true,
      });

      if (coreExplanation) {
        blocks.push({
          id: `core-explanation-${Date.now()}`,
          type: 'text',
          textType: 'paragraph',
          content: coreExplanation,
          order: order++,
          isAIGenerated: true,
        });
      }

      if (coreKeyPoints.length > 0) {
        blocks.push({
          id: `core-keypoints-${Date.now()}`,
          type: 'list',
          listType: 'bulleted',
          bulletStyle: 'disc',
          items: coreKeyPoints,
          order: order++,
          isAIGenerated: true,
        });
      }

      const table = coreConcepts.comparisonTable;
      if (
        table &&
        Array.isArray(table.headers) &&
        table.headers.length > 0 &&
        Array.isArray(table.rows) &&
        table.rows.length > 0
      ) {
        blocks.push({
          id: `core-table-${Date.now()}`,
          type: 'table',
          content: {
            headers: table.headers,
            rows: table.rows,
          },
          order: order++,
          isAIGenerated: true,
          metadata: { variant: 'data-table' },
        });
      }
    }

    if (
      guidedExample.title ||
      guidedExample.explanation ||
      guidedExample.steps
    ) {
      blocks.push({
        id: `example-heading-${Date.now()}`,
        type: 'text',
        textType: 'heading',
        content: guidedExample.title || 'Guided Example',
        order: order++,
        isAIGenerated: true,
      });

      if (guidedExample.explanation) {
        blocks.push({
          id: `example-explanation-${Date.now()}`,
          type: 'text',
          textType: 'paragraph',
          content: guidedExample.explanation,
          order: order++,
          isAIGenerated: true,
        });
      }

      const exampleSteps = Array.isArray(guidedExample.steps)
        ? guidedExample.steps
        : [];
      if (exampleSteps.length > 0) {
        blocks.push({
          id: `example-steps-${Date.now()}`,
          type: 'checklist',
          items: exampleSteps,
          order: order++,
          isAIGenerated: true,
        });
      }
    }

    const practiceSteps = Array.isArray(practice.steps) ? practice.steps : [];
    if (practice.taskTitle || practiceSteps.length > 0) {
      blocks.push({
        id: `practice-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: practice.taskTitle || 'Practice Activity',
        order: order++,
        isAIGenerated: true,
      });

      if (practiceSteps.length > 0) {
        blocks.push({
          id: `practice-steps-${Date.now()}`,
          type: 'checklist',
          items: practiceSteps,
          order: order++,
          isAIGenerated: true,
        });
      }
    }

    const tips = Array.isArray(bestPractices.tips) ? bestPractices.tips : [];
    const pitfalls = Array.isArray(bestPractices.pitfalls)
      ? bestPractices.pitfalls
      : [];

    if (tips.length > 0 || pitfalls.length > 0) {
      blocks.push({
        id: `best-heading-${Date.now()}`,
        type: 'text',
        textType: 'heading',
        content: 'Best Practices and Pitfalls',
        order: order++,
        isAIGenerated: true,
      });

      if (tips.length > 0) {
        blocks.push({
          id: `best-tips-${Date.now()}`,
          type: 'list',
          listType: 'bulleted',
          bulletStyle: 'disc',
          items: tips,
          order: order++,
          isAIGenerated: true,
        });
      }

      if (pitfalls.length > 0) {
        blocks.push({
          id: `best-pitfalls-${Date.now()}`,
          type: 'statement',
          statementType: 'note',
          content: pitfalls.join('\n'),
          order: order++,
          isAIGenerated: true,
        });
      }
    }

    const questions = Array.isArray(assessment.reflectionQuestions)
      ? assessment.reflectionQuestions
      : [];
    if (questions.length > 0) {
      blocks.push({
        id: `assessment-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Reflection Questions',
        order: order++,
        isAIGenerated: true,
      });

      blocks.push({
        id: `assessment-questions-${Date.now()}`,
        type: 'list',
        listType: 'numbered',
        numberingStyle: 'decimal',
        items: questions,
        order: order++,
        isAIGenerated: true,
      });
    }

    if (resources.length > 0) {
      blocks.push({
        id: `resources-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Additional Resources',
        order: order++,
        isAIGenerated: true,
      });

      resources.forEach(resource => {
        if (!resource || !resource.url) {
          return;
        }

        blocks.push({
          id: `resource-${Date.now()}-${Math.random()}`,
          type: 'link',
          content: {
            url: resource.url,
            title: resource.title || `Resource for ${lessonTitle}`,
            description:
              resource.description ||
              'Recommended reading to deepen your understanding.',
          },
          order: order++,
          isAIGenerated: true,
        });
      });
    }

    return blocks;
  }

  /**
   * Generate simple single-page lesson content with fallback
   */
  generateSimpleLessonContent(lessonTitle, moduleTitle, courseTitle) {
    console.log('📝 Generating simple lesson content for:', lessonTitle);

    // Ensure we have valid titles
    const safeTitle = lessonTitle || 'Untitled Lesson';
    const safeModule = moduleTitle || 'Module';
    const safeCourse = courseTitle || 'Course';

    return [
      // Lesson Title Master Heading
      this.createMasterHeading(safeTitle, 0, 'gradient1'),

      // Introduction paragraph
      {
        id: `simple-intro-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `Welcome to this lesson on ${safeTitle}. This lesson is part of the ${safeModule} module in the ${safeCourse} course. You'll learn the key concepts and practical applications that will help you master this topic.`,
        order: 1,
        isAIGenerated: true,
        metadata: {
          blockType: 'introduction',
          generatedAt: new Date().toISOString(),
        },
      },

      // Learning objectives
      {
        id: `simple-objectives-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Learning Objectives',
        order: 2,
        isAIGenerated: true,
      },

      {
        id: `simple-objectives-list-${Date.now()}`,
        type: 'list',
        listType: 'bullet',
        content: `Understand the core concepts of ${safeTitle}\nApply the principles in practical scenarios\nAnalyze different approaches and methods\nEvaluate the effectiveness of various strategies`,
        order: 3,
        isAIGenerated: true,
      },

      // Main content
      {
        id: `simple-content-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Key Concepts',
        order: 4,
        isAIGenerated: true,
      },

      {
        id: `simple-content-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `This section covers the fundamental concepts of ${safeTitle}. Understanding these principles is essential for mastering the subject matter and applying it effectively in real-world scenarios. The concepts build upon each other to provide a comprehensive understanding of the topic.`,
        order: 5,
        isAIGenerated: true,
      },

      // Summary
      {
        id: `simple-summary-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Summary',
        order: 6,
        isAIGenerated: true,
      },

      {
        id: `simple-summary-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `In this lesson, you've learned about ${safeTitle} and its key applications. Continue practicing these concepts and exploring additional resources to deepen your understanding. The knowledge gained here will serve as a foundation for more advanced topics in ${safeModule}.`,
        order: 7,
        isAIGenerated: true,
      },

      // Continue divider to end the lesson
      this.createContinueDivider('LESSON COMPLETE', 8, '#10b981'),
    ];
  }

  /**
   * Generate structured content blocks for lesson
   */
  async generateContentBlocks({
    lessonTitle,
    moduleTitle,
    courseTitle,
    options,
  }) {
    const blocks = [];
    let blockOrder = 0;

    try {
      // 0. Generate Lesson Title Master Heading
      blocks.push(
        this.createMasterHeading(lessonTitle, blockOrder++, 'gradient1')
      );

      // 0.5. Generate Hero Image for the lesson (NEW)
      if (
        options.includeImages !== false &&
        options.contentType !== 'outline'
      ) {
        try {
          console.log('🎨 Generating hero image for lesson:', lessonTitle);
          const heroImageBlock = await this.generateLessonHeroImage(
            lessonTitle,
            moduleTitle,
            courseTitle,
            blockOrder++
          );
          if (heroImageBlock) {
            blocks.push(heroImageBlock);
          }
        } catch (imageError) {
          console.warn(
            '⚠️ Failed to generate hero image, continuing without it:',
            imageError.message
          );
        }
      }

      // 1. Generate Introduction
      if (options.includeIntroduction !== false) {
        const introBlock = await this.generateIntroductionBlock(
          lessonTitle,
          moduleTitle,
          courseTitle,
          blockOrder++
        );
        blocks.push(introBlock);
      }

      // 2. Generate Learning Objectives
      if (options.includeLearningObjectives !== false) {
        const objectivesBlock = await this.generateLearningObjectivesBlock(
          lessonTitle,
          blockOrder++
        );
        blocks.push(objectivesBlock);
      }

      // 3. Generate Main Content Sections
      if (options.contentType === 'comprehensive') {
        // Key Concepts Section
        const conceptsBlocks = await this.generateKeyConceptsSection(
          lessonTitle,
          moduleTitle,
          blockOrder
        );
        blocks.push(...conceptsBlocks);
        blockOrder += conceptsBlocks.length;

        // Add concept illustration image (NEW)
        if (options.includeImages !== false) {
          try {
            console.log('🎨 Generating concept image for:', lessonTitle);
            const conceptImageBlock = await this.generateConceptImage(
              lessonTitle,
              'key concepts',
              blockOrder++
            );
            if (conceptImageBlock) {
              blocks.push(conceptImageBlock);
            }
          } catch (imageError) {
            console.warn(
              '⚠️ Failed to generate concept image, continuing without it:',
              imageError.message
            );
          }
        }

        // Add continue divider after key concepts
        blocks.push(
          this.createContinueDivider(
            'CONTINUE TO EXAMPLES',
            blockOrder++,
            '#6366F1'
          )
        );

        // Practical Examples Section
        if (options.includeExamples !== false) {
          const examplesBlocks = await this.generateExamplesSection(
            lessonTitle,
            blockOrder
          );
          blocks.push(...examplesBlocks);
          blockOrder += examplesBlocks.length;

          // Add continue divider after examples
          blocks.push(
            this.createContinueDivider(
              'CONTINUE TO BEST PRACTICES',
              blockOrder++,
              '#8B5CF6'
            )
          );
        }

        // Best Practices Section
        const practicesBlocks = await this.generateBestPracticesSection(
          lessonTitle,
          blockOrder
        );
        blocks.push(...practicesBlocks);
        blockOrder += practicesBlocks.length;

        // Add continue divider after best practices
        blocks.push(
          this.createContinueDivider(
            'CONTINUE TO ASSESSMENT',
            blockOrder++,
            '#F59E0B'
          )
        );
      } else if (options.contentType === 'outline') {
        // Generate outline-style content
        const outlineBlocks = await this.generateOutlineContent(
          lessonTitle,
          moduleTitle,
          blockOrder
        );
        blocks.push(...outlineBlocks);
        blockOrder += outlineBlocks.length;
      }

      // 4. Generate Assessment Questions
      if (options.includeAssessments !== false) {
        const assessmentBlocks = await this.generateAssessmentSection(
          lessonTitle,
          blockOrder
        );
        blocks.push(...assessmentBlocks);
        blockOrder += assessmentBlocks.length;

        // Add continue divider after assessment
        blocks.push(
          this.createContinueDivider(
            'CONTINUE TO SUMMARY',
            blockOrder++,
            '#EF4444'
          )
        );
      }

      // 5. Generate Summary
      if (options.includeSummary !== false) {
        const summaryBlocks = await this.generateSummarySection(
          lessonTitle,
          moduleTitle,
          blockOrder
        );
        blocks.push(...summaryBlocks);
        blockOrder += summaryBlocks.length;
      }

      // 6. Add Interactive Elements
      if (options.includeInteractive) {
        const interactiveBlock = await this.generateInteractiveBlock(
          lessonTitle,
          blockOrder++
        );
        blocks.push(interactiveBlock);
      }

      // 7. Add final lesson completion divider
      blocks.push(
        this.createContinueDivider('LESSON COMPLETE', blockOrder++, '#10b981')
      );

      return blocks;
    } catch (error) {
      console.error('Error generating content blocks:', error);
      // Return fallback content
      return this.generateFallbackContent(lessonTitle, moduleTitle);
    }
  }

  /**
   * Generate introduction block
   */
  async generateIntroductionBlock(
    lessonTitle,
    moduleTitle,
    courseTitle,
    order
  ) {
    try {
      const prompt = `Create an engaging introduction for the lesson "${lessonTitle}" in the module "${moduleTitle}" of the course "${courseTitle}". The introduction should hook the reader, set clear expectations, and explain what they will learn. Keep it concise but compelling.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.7,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      return {
        id: `ai-intro-${Date.now()}`,
        type: 'text',
        content:
          content ||
          `Welcome to ${lessonTitle}! In this lesson, you'll explore key concepts and gain practical knowledge that will enhance your understanding of ${moduleTitle}.`,
        order,
        isAIGenerated: true,
        metadata: {
          blockType: 'introduction',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('Failed to generate introduction, using fallback');
      return this.getFallbackIntroduction(lessonTitle, moduleTitle, order);
    }
  }

  /**
   * Generate learning objectives block
   */
  async generateLearningObjectivesBlock(lessonTitle, order) {
    try {
      const prompt = `Create 4-6 clear, specific learning objectives for the lesson "${lessonTitle}". Each objective should start with an action verb (understand, analyze, apply, create, evaluate) and be measurable. Format as a simple list.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      // Parse objectives into array
      const objectives = content
        ? content
            .split('\n')
            .filter(line => line.trim())
            .map(obj =>
              obj
                .replace(/^\d+\.?\s*/, '')
                .replace(/^[-•]\s*/, '')
                .trim()
            )
        : [
            `Understand the core concepts of ${lessonTitle}`,
            `Apply key principles in practical scenarios`,
            `Analyze different approaches and methodologies`,
            `Evaluate the effectiveness of various strategies`,
          ];

      return {
        id: `ai-objectives-${Date.now()}`,
        type: 'list',
        content: objectives.join('\n'),
        listType: 'bullet',
        order,
        isAIGenerated: true,
        metadata: {
          blockType: 'learning_objectives',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('Failed to generate objectives, using fallback');
      return this.getFallbackObjectives(lessonTitle, order);
    }
  }

  /**
   * Generate key concepts section
   */
  async generateKeyConceptsSection(lessonTitle, moduleTitle, startOrder) {
    const blocks = [];

    try {
      // Master Heading for page separation
      blocks.push(
        this.createMasterHeading(
          'Key Concepts and Principles',
          startOrder,
          'gradient2'
        )
      );

      // Content
      const prompt = `Explain the key concepts and fundamental principles of "${lessonTitle}". Provide clear definitions and explanations that are easy to understand. Include the most important concepts that students need to master.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.7,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      blocks.push({
        id: `ai-concepts-content-${Date.now()}`,
        type: 'text',
        content:
          content ||
          `This section covers the fundamental concepts of ${lessonTitle}. Understanding these principles is essential for mastering the subject matter and applying it effectively in real-world scenarios.`,
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      console.warn('Failed to generate key concepts, using fallback');
      return this.getFallbackKeyConcepts(lessonTitle, startOrder);
    }
  }

  /**
   * Generate examples section
   */
  async generateExamplesSection(lessonTitle, startOrder) {
    const blocks = [];

    try {
      blocks.push(
        this.createMasterHeading(
          'Practical Applications and Examples',
          startOrder,
          'gradient3'
        )
      );

      const prompt = `Provide 3-4 practical examples or real-world applications of "${lessonTitle}". Make them relevant, specific, and easy to understand. Show how the concepts apply in different contexts.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 350,
        temperature: 0.8,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      blocks.push({
        id: `ai-examples-content-${Date.now()}`,
        type: 'text',
        content:
          content ||
          `Here are some practical applications of ${lessonTitle} that demonstrate its real-world relevance and importance in various contexts.`,
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      return this.getFallbackExamples(lessonTitle, startOrder);
    }
  }

  /**
   * Generate best practices section
   */
  async generateBestPracticesSection(lessonTitle, startOrder) {
    const blocks = [];

    try {
      // Master Heading for page separation (consistent with other sections)
      blocks.push(
        this.createMasterHeading(
          'Best Practices and Tips',
          startOrder,
          'gradient4'
        )
      );

      const prompt = `List 5-7 best practices or important tips related to "${lessonTitle}". Make them actionable and practical. Format as clear, concise points.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.6,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      const practices = content
        ? content
            .split('\n')
            .filter(line => line.trim())
            .map(practice =>
              practice
                .replace(/^\d+\.?\s*/, '')
                .replace(/^[-•]\s*/, '')
                .trim()
            )
        : [
            `Always start with a clear understanding of the fundamentals`,
            `Practice regularly to reinforce your learning`,
            `Seek feedback and continuously improve your approach`,
            `Stay updated with the latest developments in the field`,
            `Apply theoretical knowledge to practical situations`,
          ];

      blocks.push({
        id: `ai-practices-content-${Date.now()}`,
        type: 'list',
        content: practices.join('\n'),
        listType: 'bullet',
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      return this.getFallbackBestPractices(lessonTitle, startOrder);
    }
  }

  /**
   * Generate assessment section
   */
  async generateAssessmentSection(lessonTitle, startOrder) {
    const blocks = [];

    try {
      // Master Heading for page separation (consistent with other sections)
      blocks.push(
        this.createMasterHeading(
          'Reflection Questions',
          startOrder,
          'gradient5'
        )
      );

      const prompt = `Create 4-5 thought-provoking questions about "${lessonTitle}" that test understanding and encourage critical thinking. Make them open-ended and engaging.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 250,
        temperature: 0.7,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      const questions = content
        ? content
            .split('\n')
            .filter(line => line.trim() && line.includes('?'))
            .map(q => q.replace(/^\d+\.?\s*/, '').trim())
        : [
            `What are the main benefits of applying ${lessonTitle} in practice?`,
            `How does ${lessonTitle} relate to other concepts you've learned?`,
            `What challenges might you face when implementing these concepts?`,
            `How would you explain ${lessonTitle} to someone new to the subject?`,
          ];

      blocks.push({
        id: `ai-assessment-content-${Date.now()}`,
        type: 'list',
        content: questions.join('\n'),
        listType: 'ordered',
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      return this.getFallbackAssessment(lessonTitle, startOrder);
    }
  }

  /**
   * Generate summary section
   */
  async generateSummarySection(lessonTitle, moduleTitle, startOrder) {
    const blocks = [];

    try {
      // Master Heading for page separation (consistent with other sections)
      blocks.push(
        this.createMasterHeading('Key Takeaways', startOrder, 'gradient6')
      );

      const prompt = `Create a concise summary of the key takeaways from the lesson "${lessonTitle}". Include the most important points students should remember and how they can apply this knowledge.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      blocks.push({
        id: `ai-summary-content-${Date.now()}`,
        type: 'text',
        content:
          content ||
          `In this lesson on ${lessonTitle}, we've covered the essential concepts, practical applications, and best practices. Remember to apply these insights in your own work and continue exploring the subject further.`,
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      return this.getFallbackSummary(lessonTitle, moduleTitle, startOrder);
    }
  }

  /**
   * Generate interactive block
   */
  async generateInteractiveBlock(lessonTitle, order) {
    return {
      id: `ai-quote-${Date.now()}`,
      type: 'quote',
      content: `"The best way to learn ${lessonTitle} is through consistent practice and real-world application."`,
      author: 'Learning Insight',
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'interactive',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate hero image for lesson
   * Creates an engaging visual representation for the lesson
   */
  async generateLessonHeroImage(lessonTitle, moduleTitle, courseTitle, order) {
    try {
      console.log(`🎨 Generating hero image for: ${lessonTitle}`);

      // Create a detailed, educational prompt for the image
      const imagePrompt = `Professional educational illustration for a lesson about "${lessonTitle}" in ${moduleTitle} course. 
Modern, clean, colorful design with educational theme. 
High-quality, engaging visual that represents the key concepts of ${lessonTitle}. 
Style: modern educational illustration, vibrant colors, professional quality.`;

      // Generate image using OpenAI DALL-E
      const imageResult = await openAIService.generateImage(imagePrompt, {
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      if (!imageResult.success || !imageResult.url) {
        throw new Error('Image generation failed');
      }

      console.log('✅ Hero image generated:', imageResult.url);

      // Upload to S3 for permanent storage
      let permanentUrl = imageResult.url;
      try {
        console.log('📤 Uploading hero image to S3...');
        const uploadResult = await uploadAIGeneratedImage(imageResult.url, {
          public: true,
        });

        if (uploadResult.success && uploadResult.imageUrl) {
          permanentUrl = uploadResult.imageUrl;
          console.log('✅ Hero image uploaded to S3:', permanentUrl);
        }
      } catch (uploadError) {
        console.warn(
          '⚠️ S3 upload failed, using temporary URL:',
          uploadError.message
        );
      }

      // Create image block with proper structure
      return this.createImageBlock({
        url: permanentUrl,
        alt: `Hero image for ${lessonTitle}`,
        caption: `Visual representation of ${lessonTitle}`,
        order,
        metadata: {
          blockType: 'hero_image',
          lessonTitle,
          generatedPrompt: imagePrompt,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Failed to generate hero image:', error);
      // Return null instead of throwing to allow lesson generation to continue
      return null;
    }
  }

  /**
   * Generate concept illustration image
   * Creates a visual representation of a specific concept
   */
  async generateConceptImage(lessonTitle, conceptName, order) {
    try {
      console.log(
        `🎨 Generating concept image for: ${conceptName} in ${lessonTitle}`
      );

      // Create focused prompt for concept illustration
      const imagePrompt = `Educational diagram illustrating ${conceptName} of "${lessonTitle}". 
Clear, informative visual that explains the concept. 
Professional educational style, clean design, easy to understand.
Style: modern infographic, educational diagram, clear and concise.`;

      // Generate image using OpenAI DALL-E
      const imageResult = await openAIService.generateImage(imagePrompt, {
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      if (!imageResult.success || !imageResult.url) {
        throw new Error('Image generation failed');
      }

      console.log('✅ Concept image generated:', imageResult.url);

      // Upload to S3 for permanent storage
      let permanentUrl = imageResult.url;
      try {
        console.log('📤 Uploading concept image to S3...');
        const uploadResult = await uploadAIGeneratedImage(imageResult.url, {
          public: true,
        });

        if (uploadResult.success && uploadResult.imageUrl) {
          permanentUrl = uploadResult.imageUrl;
          console.log('✅ Concept image uploaded to S3:', permanentUrl);
        }
      } catch (uploadError) {
        console.warn(
          '⚠️ S3 upload failed, using temporary URL:',
          uploadError.message
        );
      }

      // Create image block
      return this.createImageBlock({
        url: permanentUrl,
        alt: `Illustration of ${conceptName}`,
        caption: `Visual guide to ${conceptName}`,
        order,
        metadata: {
          blockType: 'concept_image',
          conceptName,
          lessonTitle,
          generatedPrompt: imagePrompt,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Failed to generate concept image:', error);
      // Return null to allow lesson generation to continue
      return null;
    }
  }

  /**
   * Generate outline-style content
   */
  async generateOutlineContent(lessonTitle, moduleTitle, startOrder) {
    const blocks = [];

    try {
      // Master Heading for page separation (consistent with other sections)
      blocks.push(
        this.createMasterHeading('Lesson Outline', startOrder, 'gradient3')
      );

      const prompt = `Create a structured outline for the lesson "${lessonTitle}" in the module "${moduleTitle}". Include main topics, subtopics, and key points. Format as a hierarchical structure.`;

      const result = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.6,
      });

      // Extract text from result object
      const content = result?.success
        ? result.data?.text || result.content || ''
        : '';

      blocks.push({
        id: `ai-outline-${Date.now()}`,
        type: 'text',
        content:
          content ||
          `This lesson outline covers the main topics and key concepts of ${lessonTitle}, providing a structured approach to learning.`,
        order: startOrder + 1,
        isAIGenerated: true,
      });

      return blocks;
    } catch (error) {
      return this.getFallbackOutline(lessonTitle, moduleTitle, startOrder);
    }
  }

  /**
   * Save generated content to lesson
   */
  async saveContentToLesson(lessonId, blocks) {
    try {
      console.log(
        `💾 Saving ${blocks.length} AI-generated blocks to lesson ${lessonId}`
      );

      // Convert blocks to lesson content format
      const lessonContent = this.convertBlocksToLessonContent(blocks);

      // Save using existing lesson update service
      const result = await updateLessonContent(lessonId, lessonContent);

      console.log('✅ Content saved successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to save content to lesson:', error);
      throw error;
    }
  }

  /**
   * Convert blocks to lesson content format
   */
  convertBlocksToLessonContent(blocks) {
    // Ensure we have valid blocks
    if (!blocks || blocks.length === 0) {
      return {
        content: blocks || [],
        metadata: {
          aiGenerated: true,
          generatedAt: new Date().toISOString(),
          totalBlocks: 0,
        },
      };
    }

    const normalizedBlocks = this.postProcessBlocks(blocks);

    // Convert blocks with proper html_css field
    const processedBlocks = normalizedBlocks.map(block => {
      const cleanedBlock = this.cleanBlock(block);
      return {
        ...cleanedBlock,
        html_css:
          cleanedBlock.html_css || this.convertBlockToHTML(cleanedBlock),
      };
    });

    return {
      content: processedBlocks, // Backend expects 'content' field
      metadata: {
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        totalBlocks: processedBlocks.length,
      },
    };
  }

  postProcessBlocks(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return blocks || [];
    }

    const result = [];
    let numberedLists = 0;
    let bulletLists = 0;
    let tables = 0;
    let quoteCarouselSeen = false;

    for (const block of blocks) {
      if (!block || typeof block !== 'object') {
        continue;
      }

      const clone = { ...block };

      if (clone.type === 'list') {
        if (clone.listType === 'numbered') {
          numberedLists += 1;
          if (numberedLists > 3) {
            continue;
          }
          clone.numberingStyle = 'decimal';
        } else if (clone.listType === 'bulleted') {
          bulletLists += 1;
          if (bulletLists > 3) {
            continue;
          }
          const allowedBullets = ['disc', 'circle'];
          if (!allowedBullets.includes(clone.bulletStyle)) {
            clone.bulletStyle = 'disc';
          }
        }
      }

      if (clone.type === 'table') {
        tables += 1;
        if (tables > 2) {
          continue;
        }
      }

      if (clone.type === 'quote' && clone.subtype === 'carousel') {
        if (quoteCarouselSeen) {
          continue;
        }
        quoteCarouselSeen = true;
      }

      result.push(clone);
    }

    return result;
  }

  cleanBlock(block) {
    if (!block || typeof block !== 'object') {
      return block;
    }

    const cleaned = { ...block };

    if (cleaned.type === 'text') {
      if (typeof cleaned.content === 'string') {
        cleaned.content = this.sanitizeTextContent(cleaned.content, false);
      }
    }

    if (cleaned.type === 'statement') {
      if (typeof cleaned.content === 'string') {
        cleaned.content = this.sanitizeTextContent(cleaned.content, false);
      }
    }

    if (cleaned.type === 'quote') {
      if (typeof cleaned.content === 'string') {
        cleaned.content = this.sanitizeTextContent(cleaned.content, false);
      }
      if (Array.isArray(cleaned.quotes)) {
        cleaned.quotes = cleaned.quotes.map(q => ({
          ...q,
          quote:
            typeof q.quote === 'string'
              ? this.sanitizeTextContent(q.quote, false)
              : q.quote,
        }));
      }
    }

    if (cleaned.type === 'list') {
      if (Array.isArray(cleaned.items)) {
        cleaned.items = cleaned.items
          .map(item =>
            typeof item === 'string'
              ? this.sanitizeTextContent(item, true)
              : item
          )
          .filter(item =>
            typeof item === 'string' ? item.trim().length > 0 : true
          );
      } else if (typeof cleaned.content === 'string') {
        const rawLines = cleaned.content.split('\n');
        const items = rawLines
          .map(line => this.sanitizeTextContent(line, true))
          .filter(line => line && line.trim().length > 0);
        cleaned.items = items;
      }
    }

    if (cleaned.type === 'checklist' && Array.isArray(cleaned.items)) {
      cleaned.items = cleaned.items
        .map(item =>
          typeof item === 'string' ? this.sanitizeTextContent(item, true) : item
        )
        .filter(item =>
          typeof item === 'string' ? item.trim().length > 0 : true
        );
    }

    if (cleaned.type === 'link' && cleaned.content) {
      if (typeof cleaned.content.title === 'string') {
        cleaned.content.title = this.sanitizeTextContent(
          cleaned.content.title,
          false
        );
      }
      if (typeof cleaned.content.description === 'string') {
        cleaned.content.description = this.sanitizeTextContent(
          cleaned.content.description,
          false
        );
      }
    }

    if (cleaned.type === 'image' && cleaned.content) {
      if (typeof cleaned.content.text === 'string') {
        cleaned.content.text = this.sanitizeTextContent(
          cleaned.content.text,
          false
        );
      }
      if (typeof cleaned.content.caption === 'string') {
        cleaned.content.caption = this.sanitizeTextContent(
          cleaned.content.caption,
          false
        );
      }
    }

    return cleaned;
  }

  sanitizeTextContent(text, forList = false) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let result = text.trim();

    result = result.replace(/^["']+/, '').replace(/["']+$/, '');

    result = result.replace(/\r\n/g, '\n');

    if (forList) {
      const lines = result.split('\n').map(line => {
        let current = line.trim();
        current = current.replace(/^([-*+•]\s+)+/, '');
        current = current.replace(/^\d+[\.)]\s+/, '');
        return current;
      });

      result = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    } else {
      result = result.replace(/^[-*+•]\s+/, '');
    }

    return result;
  }

  /**
   * Convert block to HTML format - Enhanced for ALL content library variants
   */
  convertBlockToHTML(block) {
    // If block already has html_css, return it
    if (block.html_css) {
      return block.html_css;
    }

    switch (block.type) {
      case 'text':
        return this.convertTextBlockToHTML(block);

      case 'image':
        return this.convertImageBlockToHTML(block);

      case 'statement':
        return this.convertStatementBlockToHTML(block);

      case 'list':
        return this.convertListBlockToHTML(block);

      case 'quote':
        return this.convertQuoteBlockToHTML(block);

      case 'table':
        return this.convertTableBlockToHTML(block);

      case 'checklist':
        return this.convertChecklistBlockToHTML(block);

      case 'link':
        return this.convertLinkBlockToHTML(block);

      default:
        return `<div class="mb-4">${block.content || ''}</div>`;
    }
  }

  convertTextBlockToHTML(block) {
    const { textType, content, gradient } = block;

    switch (textType) {
      case 'master_heading':
        const gradientMap = {
          gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          gradient2:
            'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          gradient3: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          gradient4: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          gradient5: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          gradient6: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        };
        const bgGradient = gradientMap[gradient] || gradientMap['gradient1'];
        return `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 24px 0; color: white; background: ${bgGradient}; padding: 20px; border-radius: 8px; text-align: center;">${content}</h1>`;

      case 'heading':
        return `<h2 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 20px 0 16px 0;">${content}</h2>`;

      case 'subheading':
        return `<h3 style="font-size: 24px; font-weight: 600; color: #374151; margin: 16px 0 12px 0;">${content}</h3>`;

      case 'paragraph':
        return `<div style="margin: 16px 0; line-height: 1.6; color: #4b5563; font-size: 16px;"><p>${content}</p></div>`;

      case 'heading_paragraph':
      case 'subheading_paragraph':
        return `<div style="margin: 20px 0;">${content}</div>`;

      default:
        return `<div style="margin: 16px 0;"><p>${content}</p></div>`;
    }
  }

  convertImageBlockToHTML(block) {
    const { template, layout, content } = block;
    const imageUrl = content?.imageUrl || content?.url || content;
    const text = content?.text || '';
    const caption = content?.caption || '';

    switch (template) {
      case 'image-text':
        return `
          <div style="display: flex; gap: 20px; margin: 24px 0; align-items: center;">
            <div style="flex: 1;">
              <img src="${imageUrl}" alt="Lesson image" style="width: 100%; height: auto; border-radius: 8px;" />
            </div>
            <div style="flex: 1; padding: 0 16px;">
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">${text}</p>
            </div>
          </div>`;

      case 'text-on-image':
        return `
          <div style="position: relative; margin: 24px 0; border-radius: 12px; overflow: hidden;">
            <img src="${imageUrl}" alt="Background" style="width: 100%; height: 400px; object-fit: cover;" />
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 20px;">
              <p style="color: white; font-size: 20px; font-weight: 600; text-align: center; line-height: 1.4;">${text}</p>
            </div>
          </div>`;

      case 'image-centered':
        return `
          <div style="text-align: center; margin: 24px 0;">
            <img src="${imageUrl}" alt="Centered image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
            ${caption ? `<p style="margin-top: 12px; font-size: 14px; color: #6b7280; font-style: italic;">${caption}</p>` : ''}
          </div>`;

      case 'image-full-width':
        return `
          <div style="margin: 24px 0;">
            <img src="${imageUrl}" alt="Full width image" style="width: 100%; height: auto; border-radius: 8px;" />
            <div style="padding: 16px 0;">
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">${text}</p>
            </div>
          </div>`;

      default:
        return `
          <div style="margin: 24px 0; text-align: center;">
            <img src="${imageUrl}" alt="Lesson image" style="max-width: 100%; height: auto; border-radius: 12px;" />
            ${caption ? `<p style="margin-top: 12px; font-size: 14px; color: #6b7280;">${caption}</p>` : ''}
          </div>`;
    }
  }

  convertStatementBlockToHTML(block) {
    const { statementType, content } = block;

    switch (statementType) {
      case 'statement-a':
        return `
          <div style="border-top: 2px solid #1f2937; border-bottom: 2px solid #1f2937; padding: 32px 24px; margin: 24px 0;">
            <p style="color: #1f2937; font-size: 24px; line-height: 1.4; text-align: center; font-weight: 700; margin: 0;">${content}</p>
          </div>`;

      case 'statement-b':
        return `
          <div style="position: relative; padding: 32px 24px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 80px; height: 4px; background: linear-gradient(90deg, #fb923c 0%, #ea580c 100%); border-radius: 2px;"></div>
            <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 80px; height: 4px; background: linear-gradient(90deg, #fb923c 0%, #ea580c 100%); border-radius: 2px;"></div>
            <p style="color: #1f2937; font-size: 28px; line-height: 1.4; text-align: center; font-weight: 300; margin: 0;">${content}</p>
          </div>`;

      case 'statement-c':
        return `
          <div style="background: linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%); padding: 32px 24px; margin: 24px 0; border-left: 4px solid #ea580c;">
            <p style="color: #374151; font-size: 20px; line-height: 1.5; margin: 0;">${content}</p>
          </div>`;

      case 'statement-d':
        return `
          <div style="position: relative; background: white; padding: 24px; margin: 24px 0;">
            <div style="position: absolute; top: 0; left: 0; width: 64px; height: 4px; background: #ea580c;"></div>
            <p style="color: #1f2937; font-size: 18px; line-height: 1.5; font-weight: 700; margin: 0;">${content}</p>
          </div>`;

      case 'note':
        return `
          <div style="border: 1px solid #fed7aa; background: #fef3e2; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="flex-shrink: 0; margin-top: 4px;">
                <div style="width: 20px; height: 20px; background: #ea580c; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">i</span>
                </div>
              </div>
              <p style="color: #1f2937; font-size: 14px; line-height: 1.5; margin: 0; flex: 1;">${content}</p>
            </div>
          </div>`;

      default:
        return `<div style="margin: 16px 0; padding: 16px; background: #f3f4f6; border-radius: 8px;"><p>${content}</p></div>`;
    }
  }

  convertListBlockToHTML(block) {
    const { listType, items, numberingStyle, bulletStyle } = block;

    if (listType === 'numbered') {
      const listItems = items
        .map((item, index) => {
          let number = index + 1;
          switch (numberingStyle) {
            case 'upper-roman':
              number = this.toRoman(number).toUpperCase();
              break;
            case 'lower-roman':
              number = this.toRoman(number).toLowerCase();
              break;
            case 'upper-alpha':
              number = String.fromCharCode(64 + number);
              break;
            case 'lower-alpha':
              number = String.fromCharCode(96 + number);
              break;
            default:
              number = number.toString();
          }
          return `<li style="margin: 8px 0;"><span style="font-weight: 600; color: #3b82f6; margin-right: 8px;">${number}.</span>${item}</li>`;
        })
        .join('');

      return `<ol style="list-style: none; padding: 0; margin: 20px 0;">${listItems}</ol>`;
    } else {
      const bulletMap = {
        circle: '●',
        square: '■',
        disc: '⬤',
        arrow: '▶',
        star: '★',
        diamond: '◆',
      };
      const bullet = bulletMap[bulletStyle] || '●';

      const listItems = items
        .map(
          item =>
            `<li style="margin: 8px 0;"><span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">${bullet}</span>${item}</li>`
        )
        .join('');

      return `<ul style="list-style: none; padding: 0; margin: 20px 0;">${listItems}</ul>`;
    }
  }

  convertQuoteBlockToHTML(block) {
    const { content, author, backgroundImage, subtype, quotes } = block;

    if (subtype === 'carousel') {
      const carouselItems = quotes
        .map(
          (quote, index) =>
            `<div style="margin: 16px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0;">
          <p style="font-style: italic; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0; color: #374151;">"${quote.quote}"</p>
          <cite style="font-size: 14px; color: #6b7280;">— ${quote.author}</cite>
        </div>`
        )
        .join('');
      return `<div style="margin: 24px 0;">${carouselItems}</div>`;
    }

    if (backgroundImage) {
      return `
        <div style="position: relative; margin: 24px 0; border-radius: 12px; overflow: hidden; min-height: 200px;">
          <img src="${backgroundImage}" alt="Quote background" style="width: 100%; height: 100%; object-fit: cover; position: absolute;" />
          <div style="position: relative; background: rgba(0,0,0,0.6); padding: 40px 24px; color: white; text-align: center;">
            <p style="font-size: 20px; font-style: italic; line-height: 1.4; margin: 0 0 16px 0;">"${content}"</p>
            ${author ? `<cite style="font-size: 16px; opacity: 0.9;">— ${author}</cite>` : ''}
          </div>
        </div>`;
    }

    return `
      <blockquote style="border-left: 4px solid #3b82f6; padding: 20px 24px; margin: 24px 0; background: #f8fafc; border-radius: 0 8px 8px 0;">
        <p style="font-style: italic; font-size: 18px; line-height: 1.5; margin: 0 0 12px 0; color: #374151;">"${content}"</p>
        ${author ? `<cite style="font-size: 16px; color: #6b7280;">— ${author}</cite>` : ''}
      </blockquote>`;
  }

  convertTableBlockToHTML(block) {
    const { content } = block;
    const { headers, rows } = content;

    const headerRow = headers
      .map(
        header =>
          `<th style="padding: 12px; background: #f3f4f6; font-weight: 600; text-align: left; border-bottom: 2px solid #e5e7eb;">${header}</th>`
      )
      .join('');
    const dataRows = rows
      .map(
        row =>
          `<tr>${row.map(cell => `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`).join('')}</tr>`
      )
      .join('');

    return `
      <div style="margin: 24px 0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${dataRows}</tbody>
        </table>
      </div>`;
  }

  convertChecklistBlockToHTML(block) {
    const { items } = block;
    const checklistItems = items
      .map(
        (item, index) =>
          `<div style="display: flex; align-items: center; margin: 8px 0; padding: 8px; border-radius: 4px; background: #f9fafb;">
        <input type="checkbox" id="check-${index}" style="margin-right: 12px; transform: scale(1.2);" />
        <label for="check-${index}" style="flex: 1; font-size: 16px; color: #374151; cursor: pointer;">${item}</label>
      </div>`
      )
      .join('');

    return `<div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">${checklistItems}</div>`;
  }

  convertLinkBlockToHTML(block) {
    const { content } = block;
    const { url, title, description } = content;

    return `
      <div style="margin: 24px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8fafc;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          <a href="${url}" target="_blank" style="color: #3b82f6; text-decoration: none;">${title}</a>
        </h4>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${description}</p>
        <div style="margin-top: 12px;">
          <a href="${url}" target="_blank" style="color: #3b82f6; font-size: 14px; text-decoration: none; font-weight: 500;">Visit Resource →</a>
        </div>
      </div>`;
  }

  toRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = [
      'M',
      'CM',
      'D',
      'CD',
      'C',
      'XC',
      'L',
      'XL',
      'X',
      'IX',
      'V',
      'IV',
      'I',
    ];
    let result = '';

    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    return result;
  }

  // Fallback methods
  getFallbackIntroduction(lessonTitle, moduleTitle, order) {
    return {
      id: `fallback-intro-${Date.now()}`,
      type: 'text',
      content: `Welcome to ${lessonTitle}! This lesson is part of ${moduleTitle} and will provide you with essential knowledge and practical skills.`,
      order,
      isAIGenerated: true,
    };
  }

  getFallbackObjectives(lessonTitle, order) {
    return {
      id: `fallback-objectives-${Date.now()}`,
      type: 'list',
      content: `Understand the key concepts of ${lessonTitle}\nApply the knowledge in practical situations\nAnalyze different approaches and methods\nEvaluate the effectiveness of solutions`,
      listType: 'bullet',
      order,
      isAIGenerated: true,
    };
  }

  getFallbackKeyConcepts(lessonTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading(
        'Key Concepts and Principles',
        startOrder,
        'gradient2'
      ),
      {
        id: `fallback-concepts-content-${Date.now()}`,
        type: 'text',
        content: `This section covers the fundamental concepts of ${lessonTitle}. These concepts form the foundation for understanding and applying the knowledge effectively.`,
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  getFallbackExamples(lessonTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading(
        'Practical Applications and Examples',
        startOrder,
        'gradient3'
      ),
      {
        id: `fallback-examples-content-${Date.now()}`,
        type: 'text',
        content: `Here are practical examples of how ${lessonTitle} can be applied in real-world scenarios.`,
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  getFallbackBestPractices(lessonTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading(
        'Best Practices and Tips',
        startOrder,
        'gradient4'
      ),
      {
        id: `fallback-practices-content-${Date.now()}`,
        type: 'list',
        content: `Start with the basics and build gradually\nPractice regularly to reinforce learning\nSeek feedback from others\nStay curious and keep learning`,
        listType: 'bullet',
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  getFallbackAssessment(lessonTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading('Reflection Questions', startOrder, 'gradient5'),
      {
        id: `fallback-assessment-content-${Date.now()}`,
        type: 'list',
        content: `What did you learn about ${lessonTitle}?\nHow can you apply this knowledge?\nWhat questions do you still have?\nHow does this relate to your goals?`,
        listType: 'ordered',
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  getFallbackSummary(lessonTitle, moduleTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading('Key Takeaways', startOrder, 'gradient6'),
      {
        id: `fallback-summary-content-${Date.now()}`,
        type: 'text',
        content: `This lesson on ${lessonTitle} has covered the essential concepts and practical applications. Continue practicing and exploring to deepen your understanding.`,
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  getFallbackOutline(lessonTitle, moduleTitle, startOrder) {
    return [
      // Master Heading for page separation (consistent with other sections)
      this.createMasterHeading('Lesson Outline', startOrder, 'gradient3'),
      {
        id: `fallback-outline-${Date.now()}`,
        type: 'text',
        content: `This lesson covers ${lessonTitle} as part of ${moduleTitle}. The content includes key concepts, practical applications, and important takeaways.`,
        order: startOrder + 1,
        isAIGenerated: true,
      },
    ];
  }

  generateFallbackContent(lessonTitle, moduleTitle) {
    return [
      {
        id: `fallback-${Date.now()}`,
        type: 'text',
        content: `This lesson covers ${lessonTitle} as part of ${moduleTitle}. The content will help you understand key concepts and apply them effectively.`,
        order: 0,
        isAIGenerated: true,
      },
    ];
  }

  /**
   * Helper function to create continue divider blocks for lesson navigation
   */
  createContinueDivider(text = 'CONTINUE', order, color = '#2563eb') {
    return {
      id: `ai-continue-divider-${Date.now()}-${Math.random()}`,
      type: 'divider',
      subtype: 'continue',
      content: text,
      html_css: `<div style="width: 100%; padding: 24px 0;">
        <div style="background-color: ${color}; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;" onmouseover="this.style.backgroundColor='${this.adjustColor(color, -20)}'" onmouseout="this.style.backgroundColor='${color}'">
          ${text}
        </div>
      </div>`,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'continue_divider',
        dividerText: text,
        color: color,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Helper function to create simple divider blocks
   */
  createSimpleDivider(order) {
    return {
      id: `ai-simple-divider-${Date.now()}-${Math.random()}`,
      type: 'divider',
      subtype: 'divider',
      content: '',
      html_css: `<div style="width: 100%; padding: 16px 0;">
        <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
      </div>`,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'simple_divider',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Helper function to create numbered divider blocks
   */
  createNumberedDivider(number, order, bgColor = '#f97316') {
    return {
      id: `ai-numbered-divider-${Date.now()}-${Math.random()}`,
      type: 'divider',
      subtype: 'numbered_divider',
      content: number.toString(),
      html_css: `<div style="width: 100%; padding: 16px 0; position: relative;">
        <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
        <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 12px;">
          <div style="width: 32px; height: 32px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
            ${number}
          </div>
        </div>
      </div>`,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'numbered_divider',
        number: number,
        bgColor: bgColor,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Helper function to adjust color brightness
   */
  adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (
      (usePound ? '#' : '') +
      ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
    );
  }

  /**
   * Helper function to create image blocks for lesson content
   * @param {Object} imageData - Image data including url, alt, caption
   * @returns {Object} Image block structure
   */
  createImageBlock(imageData) {
    const { url, alt, caption, order, metadata = {} } = imageData;

    // Create responsive image HTML with proper styling
    const imageHtml = `
      <div style="margin: 24px 0; text-align: center;">
        <img 
          src="${url}" 
          alt="${alt || 'Lesson image'}" 
          style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
          loading="lazy"
        />
        ${caption ? `<p style="margin-top: 12px; font-size: 14px; color: #6b7280; font-style: italic;">${caption}</p>` : ''}
      </div>
    `;

    return {
      id: `ai-image-${Date.now()}-${Math.random()}`,
      type: 'image',
      content: {
        url,
        alt: alt || 'Lesson image',
        caption: caption || '',
      },
      html_css: imageHtml,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'image',
        imageSource: 'ai-generated',
        ...metadata,
      },
    };
  }

  /**
   * Helper function to create master heading blocks for page separation
   */
  createMasterHeading(title, order, gradientId = 'gradient1') {
    const gradients = {
      gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient2:
        'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      gradient3: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      gradient4: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      gradient5: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      gradient6: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    };

    const selectedGradient = gradients[gradientId] || gradients.gradient1;

    return {
      id: `ai-master-heading-${Date.now()}-${Math.random()}`,
      type: 'text',
      textType: 'master_heading',
      content: title,
      html_css: `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 0; color: white; background: ${selectedGradient}; padding: 20px; border-radius: 8px;">${title}</h1>`,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'master_heading',
        gradient: gradientId,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

// Export singleton instance
const universalAILessonService = new UniversalAILessonService();
export default universalAILessonService;
