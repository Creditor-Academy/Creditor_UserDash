import enhancedAIService from './enhancedAIService';
import { generateLessonFromPrompt } from './aiCourseService';
import { updateLessonContent } from './courseService';
import openAIService from './openAIService';
import { uploadAIGeneratedImage } from './aiUploadService';
import contentLibraryAIService from './contentLibraryAIService';
import {
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
} from './enhancedPromptTemplates';

/**
 * Universal AI Lesson Content Generation Service
 * Works with any lesson regardless of how it was created
 */
class UniversalAILessonService {
  constructor() {
    this.aiService = enhancedAIService;
    // Optional: Use model-aware service for enhanced prompts (can be toggled)
    this.useEnhancedPrompts = true; // Set to false to use original prompts
    // Model-aware service removed (was optional feature)
    this.modelAwareService = null;
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
      // Default to content library + interactive enabled
      const mergedOptions = {
        includeInteractive:
          options.includeInteractive === undefined
            ? true
            : options.includeInteractive,
        useContentLibrary:
          options.useContentLibrary === undefined
            ? true
            : options.useContentLibrary,
        ...options,
      };

      console.log('🎯 Universal AI Lesson Content Generation Started');
      console.log('📚 Lesson:', lessonData?.title || 'Unknown');
      console.log('📖 Module:', moduleData?.title || 'Unknown');
      console.log('🎓 Course:', courseData?.title || 'Unknown');

      const lessonTitle = lessonData?.title || 'Untitled Lesson';
      const moduleTitle = moduleData?.title || 'Module';
      const courseTitle = courseData?.title || 'Course';

      // Use blueprint-structured lesson (15 sections) if specified
      if (
        mergedOptions.useBlueprintStructure ||
        mergedOptions.blueprintStructure
      ) {
        console.log('📋 Generating blueprint-structured lesson (15 sections)');
        return await this.generateBlueprintStructuredLesson(
          lessonTitle,
          moduleTitle,
          courseTitle,
          courseData
        );
      }

      // Use simple single lesson approach
      if (mergedOptions.simple || mergedOptions.fallback) {
        return this.generateSimpleLessonContent(
          lessonTitle,
          moduleTitle,
          courseTitle
        );
      }

      // Structured lesson plan path for premium mode
      if (mergedOptions.useStructuredLessonPlan) {
        const structuredBlocks = await this.generateLessonFromStructuredPlan(
          lessonData,
          moduleData,
          courseData,
          mergedOptions
        );

        if (structuredBlocks && structuredBlocks.length > 0) {
          return structuredBlocks;
        }
      }

      // NEW: Use comprehensive content library generation (only if explicitly enabled)
      // Default to false - use blueprint structure instead (which is the main generation method)
      if (mergedOptions.useContentLibrary === true) {
        console.log('🎯 Using comprehensive content library generation');
        const blocks =
          await contentLibraryAIService.generateComprehensiveLessonContent(
            lessonTitle,
            moduleTitle,
            courseTitle
          );
        // Add an interactive block for richer experience
        if (mergedOptions.includeInteractive !== false) {
          const interactiveBlock = await this.generateInteractiveBlock(
            lessonTitle,
            blocks.length
          );
          blocks.push(interactiveBlock);
        }
        return blocks;
      }

      // Fallback: Generate content blocks based on options
      const blocks = await this.generateContentBlocks({
        lessonTitle,
        moduleTitle,
        courseTitle,
        options: mergedOptions,
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
      content: this.parseMarkdownToHTML(overviewText), // Parse markdown before storing
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
          blockOrder,
          options
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
  async generateAssessmentSection(lessonTitle, startOrder, options = {}) {
    const blocks = [];

    try {
      const strategy = options.assessmentStrategy || {};
      const mainType = (strategy.mainAssessmentType || 'mcq').toLowerCase();

      if (mainType === 'mcq') {
        // Heading for quiz section
        blocks.push(
          this.createMasterHeading('Quick Check Quiz', startOrder, 'gradient5')
        );

        const prompt = `Create 3-5 multiple-choice questions for the lesson "${lessonTitle}".
Each question should have 4 options (A, B, C, D) and exactly one correct answer.
Return them in a simple text format like:
Q1: ...?
A) ...
B) ...
C) ...
D) ...
Answer: A

Avoid markdown bullets.`;

        const result = await this.aiService.generateText(prompt, {
          maxTokens: 400,
          temperature: 0.7,
        });

        const content = result?.success
          ? result.data?.text || result.content || ''
          : '';

        blocks.push({
          id: `ai-assessment-quiz-${Date.now()}`,
          type: 'text',
          textType: 'paragraph',
          content:
            content ||
            `Q1: What is a key idea from ${lessonTitle}?
A) Concept A
B) Concept B
C) Concept C
D) Concept D
Answer: A`,
          order: startOrder + 1,
          isAIGenerated: true,
          metadata: {
            blockType: 'quiz_mcq',
          },
        });
      } else {
        // Default: reflection-style assessment (existing behavior)
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
      }

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
    const tabsData = [
      {
        title: 'Key Idea',
        content: `Core concept for "${lessonTitle}" with a crisp definition and why it matters.`,
      },
      {
        title: 'Example',
        content: `A short scenario that applies "${lessonTitle}" in practice.`,
      },
      {
        title: 'Try It',
        content: `A quick prompt or action learners can perform to reinforce "${lessonTitle}".`,
      },
    ];

    const html_css = `
    <div class="interactive-tabs bg-white border border-slate-200 rounded-xl shadow-sm" data-template="tabs">
      <div class="tab-header flex flex-wrap gap-2 p-3 border-b border-slate-200">
        ${tabsData
          .map(
            (tab, idx) =>
              `<button class="tab-button px-3 py-2 text-sm font-semibold rounded-lg ${
                idx === 0
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }" data-tab="${idx}">${tab.title}</button>`
          )
          .join('')}
      </div>
      <div class="tab-panels p-4 space-y-3 text-sm text-slate-800 leading-relaxed">
        ${tabsData
          .map(
            (tab, idx) =>
              `<div class="tab-panel ${idx === 0 ? '' : 'hidden'}" data-tab-panel="${idx}">
                <p>${tab.content}</p>
              </div>`
          )
          .join('')}
      </div>
      <style>
        .tab-button { transition: all 0.2s ease; }
        .tab-button.active { background: #4f46e5; color: #fff; }
        .tab-panel.hidden { display: none; }
      </style>
      <script>
        (function(){
          const container = document.currentScript?.parentElement || document.querySelector('.interactive-tabs');
          if(!container) return;
          const buttons = container.querySelectorAll('.tab-button');
          const panels = container.querySelectorAll('.tab-panel');
          buttons.forEach(btn => {
            btn.addEventListener('click', () => {
              const tab = btn.getAttribute('data-tab');
              buttons.forEach(b => b.classList.remove('bg-indigo-600','text-white','shadow','active'));
              panels.forEach(p => p.classList.add('hidden'));
              btn.classList.add('bg-indigo-600','text-white','shadow','active');
              const panel = container.querySelector(\`[data-tab-panel="\${tab}"]\`);
              if(panel) panel.classList.remove('hidden');
            });
          });
        })();
      </script>
    </div>
    `;

    return {
      id: `interactive-tabs-${Date.now()}`,
      type: 'interactive',
      content: JSON.stringify({
        type: 'tabs',
        templateId: 'tabs',
        tabsData,
      }),
      html_css,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'interactive',
        variant: 'tabs',
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

      // Create a realistic, photographic prompt for the image
      let imagePrompt = `Realistic, professional photograph-style image for a lesson about "${lessonTitle}" in ${moduleTitle} course. 
Describe a real-world scene, setting, or situation that represents the key concepts of ${lessonTitle}. 
NO infographics, NO diagrams, NO small text labels. 
Just a clean, realistic, professional photograph-style image with minimal or no text. High-quality, engaging visual.`;

      // Enhance with 7-layer premium quality system
      imagePrompt += ` QUALITY REQUIREMENTS: soft cinematic lighting, volumetric light, dramatic contrast, ultra-detailed, 8K clarity, crisp textures, photorealistic depth, centered composition, balanced spacing, clean layout, soft deep shadows, realistic reflections, smooth lighting falloff, glossy surface, metallic reflections, no text, no watermarks, clean background. Vivid, premium quality.`;

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

      // Generate contextual caption for the image
      const caption = await this.generateContextualCaption(
        'hero',
        lessonTitle,
        '',
        imagePrompt,
        { moduleTitle, courseTitle }
      );

      // Create image block with proper structure
      return this.createImageBlock({
        url: permanentUrl,
        alt: `Hero image for ${lessonTitle}`,
        caption: caption,
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

      // Create focused prompt for realistic concept image
      let imagePrompt = `Realistic, professional photograph-style image showing a real-world scene or object that represents ${conceptName} of "${lessonTitle}". 
Describe an actual scene, situation, or object. NO infographics, NO diagrams, NO small text labels. 
Just a clean, realistic, professional photograph-style image with minimal or no text.`;

      // Enhance with 7-layer premium quality system
      // Special handling for human/portrait images - use HD quality and professional portrait guidelines
      const isPortrait =
        /person|people|human|face|portrait|man|woman|child|professional|instructor|expert|instructor|teacher|student/i.test(
          conceptName + ' ' + lessonTitle
        );

      if (isPortrait) {
        imagePrompt += ` PROFESSIONAL PORTRAIT REQUIREMENTS: High-quality professional headshot or portrait, clear facial features, professional lighting (three-point lighting), sharp focus on face, natural skin tones, professional appearance, well-groomed, confident expression, neutral or warm background, studio-quality photography, no distortion, no messy appearance, clean and polished look. QUALITY: 8K resolution, professional photography standards, studio lighting, perfect focus, no artifacts.`;
      } else {
        imagePrompt += ` QUALITY REQUIREMENTS: soft cinematic lighting, volumetric light, dramatic contrast, ultra-detailed, 8K clarity, crisp textures, photorealistic depth, centered composition, balanced spacing, clean layout, soft deep shadows, realistic reflections, smooth lighting falloff, glossy surface, metallic reflections, no text, no watermarks, clean background. Vivid, premium quality.`;
      }

      // Generate image using OpenAI DALL-E
      // Use HD quality for portrait images to ensure better facial features
      const imageQuality = isPortrait ? 'hd' : 'standard';

      const imageResult = await openAIService.generateImage(imagePrompt, {
        model: 'dall-e-3',
        size: '1024x1024',
        quality: imageQuality,
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

      // Generate contextual caption for the image
      const caption = await this.generateContextualCaption(
        'concept',
        lessonTitle,
        conceptName,
        imagePrompt,
        {}
      );

      // Create image block
      return this.createImageBlock({
        url: permanentUrl,
        alt: `Illustration of ${conceptName}`,
        caption: caption,
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
   * Convert markdown-style formatting to HTML
   * Handles **bold**, *italic*, etc.
   */
  parseMarkdownToHTML(text) {
    if (!text || typeof text !== 'string') return text || '';

    let html = String(text);

    // Strip fenced code blocks markers like ``` or ```markdown while
    // keeping their inner text. For course content we usually don't
    // want to render literal backticks or language hints around the
    // content (e.g. ```markdown ... ```), we just want the text.
    html = html
      // Opening fences with optional language label
      .replace(/```[a-zA-Z0-9_-]*\s*/g, '')
      // Closing fences
      .replace(/```/g, '');

    // Escape existing HTML to prevent double-encoding
    // But preserve if already HTML
    if (
      html.includes('<') &&
      html.includes('>') &&
      !html.includes('**') &&
      !html.includes('##')
    ) {
      // Might already be HTML, just process markdown within
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return html;
    }

    // Convert markdown headings (##, ###, ####) to HTML headings
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Convert **bold** to <strong> (handle multiple occurrences)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em> (but not if it's part of **bold**)
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');

    // Convert line breaks to <br> for single breaks (but not after headings)
    html = html.replace(/\n(?!\n)(?!<h[1-6])/g, '<br>');

    // Convert double line breaks to paragraph breaks
    html = html.replace(/\n\n+/g, '</p><p>');

    return html;
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

      case 'interactive':
        return this.convertInteractiveBlockToHTML(block);

      default:
        return `<div class="mb-4">${block.content || ''}</div>`;
    }
  }

  convertTextBlockToHTML(block) {
    const { textType, content, gradient } = block;

    switch (textType) {
      case 'master_heading':
        // Use proper CSS classes from textTypesConfig - gradient classes
        const gradientClassMap = {
          gradient1:
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
          gradient2:
            'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
          gradient3: 'bg-gradient-to-r from-green-500 to-blue-500',
          gradient4: 'bg-gradient-to-r from-orange-500 to-red-500',
          gradient5: 'bg-gradient-to-r from-pink-500 to-purple-500',
          gradient6: 'bg-gradient-to-r from-teal-500 to-cyan-500',
        };
        const gradientClass =
          gradientClassMap[gradient] || gradientClassMap['gradient1'];
        return `<div class="rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center ${gradientClass}">
          ${content || 'Master Heading'}
        </div>`;

      case 'heading':
        // Use proper CSS classes
        return `<h2 class="text-2xl font-bold text-gray-900 leading-tight mb-4">${content || 'Heading'}</h2>`;

      case 'subheading':
        // Use proper CSS classes
        return `<h3 class="text-xl font-semibold text-gray-800 leading-snug mb-3">${content || 'Subheading'}</h3>`;

      case 'paragraph':
        // Parse markdown and preserve line breaks - Use proper CSS classes matching TextBlockComponent
        let paragraphContent = content || '';
        if (paragraphContent && typeof paragraphContent === 'string') {
          // Parse markdown formatting
          paragraphContent = this.parseMarkdownToHTML(paragraphContent);

          // If content has line breaks, split into paragraphs
          if (content.includes('\n\n') || content.split('\n').length > 2) {
            const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
            const paragraphHTML = paragraphs
              .map(p => {
                const parsed = this.parseMarkdownToHTML(p.trim());
                return `<p class="text-base text-gray-700 leading-relaxed mb-3">${parsed}</p>`;
              })
              .join('');
            return `<div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div class="pl-4">
                <div class="prose prose-lg max-w-none text-gray-700 space-y-3">${paragraphHTML}</div>
              </div>
            </div>`;
          }
        }
        return `<div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="pl-4">
            <div class="prose prose-lg max-w-none text-gray-700 text-base leading-relaxed">${paragraphContent || ''}</div>
          </div>
        </div>`;

      case 'heading_paragraph':
      case 'subheading_paragraph':
        // Use proper CSS classes and structure
        const headingText = block.subheading || block.heading || '';
        let headingParagraphContent = block.content || content || '';

        // Parse markdown formatting
        if (
          headingParagraphContent &&
          typeof headingParagraphContent === 'string'
        ) {
          // Parse markdown first
          headingParagraphContent = this.parseMarkdownToHTML(
            headingParagraphContent
          );

          // If content has multiple paragraphs, split them
          if (block.content && block.content.includes('\n\n')) {
            const paragraphs = block.content
              .split(/\n\n+/)
              .filter(p => p.trim());
            headingParagraphContent = paragraphs
              .map(p => {
                const parsed = this.parseMarkdownToHTML(p.trim());
                return `<p class="text-base text-gray-700 leading-relaxed mb-3">${parsed}</p>`;
              })
              .join('');
          } else {
            headingParagraphContent = `<p class="text-base text-gray-700 leading-relaxed mb-3">${headingParagraphContent}</p>`;
          }
        } else {
          headingParagraphContent = `<p class="text-base text-gray-700 leading-relaxed mb-3">${headingParagraphContent || ''}</p>`;
        }

        // Use proper heading tag based on type
        const headingTag = textType === 'heading_paragraph' ? 'h2' : 'h3';
        const headingClass =
          textType === 'heading_paragraph'
            ? 'text-2xl font-bold text-gray-900 leading-tight mb-4'
            : 'text-xl font-semibold text-gray-800 leading-snug mb-3';

        return `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="pl-4">
              <article class="max-w-none">
                ${headingText ? `<${headingTag} class="${headingClass}">${headingText}</${headingTag}>` : ''}
                <div class="prose prose-lg max-w-none text-gray-700">
                  ${headingParagraphContent}
                </div>
              </article>
            </div>
          </div>
        `;

      default:
        return `<div class="text-base text-gray-700 leading-relaxed my-4"><p>${content || ''}</p></div>`;
    }
  }

  convertImageBlockToHTML(block) {
    const { template, layout, content } = block;
    // Support multiple formats: block.imageUrl (direct), content.imageUrl, content.url, or content as string
    const imageUrl =
      block.imageUrl ||
      content?.imageUrl ||
      content?.url ||
      (typeof content === 'string' ? content : '');
    const text = block.imageDescription || block.text || content?.text || '';
    const caption = block.caption || content?.caption || '';
    // Determine layout: use template, layout, or default to 'centered'
    const imageLayout = template || layout || block.layout || 'centered';

    switch (imageLayout) {
      case 'image-text':
      case 'side-by-side':
        return `
          <div class="flex gap-5 my-6 items-center">
            <div class="flex-1">
              <img src="${imageUrl}" alt="${block.imageTitle || 'Lesson image'}" class="w-full h-auto rounded-lg" />
            </div>
            <div class="flex-1 px-4">
              <p class="text-base leading-relaxed text-gray-600">${text}</p>
            </div>
          </div>`;

      case 'text-on-image':
      case 'overlay':
        return `
          <div class="relative my-6 rounded-xl overflow-hidden">
            <img src="${imageUrl}" alt="${block.imageTitle || 'Background'}" class="w-full h-96 object-cover" />
            ${
              text
                ? `<div class="absolute inset-0 bg-black/40 flex items-center justify-center p-5">
              <p class="text-white text-xl font-semibold text-center leading-snug">${text}</p>
            </div>`
                : ''
            }
          </div>`;

      case 'image-centered':
      case 'centered':
        return `
          <div class="text-center my-6">
            <img src="${imageUrl}" alt="${block.imageTitle || 'Centered image'}" class="max-w-full h-auto rounded-xl shadow-md" />
            ${text ? `<p class="mt-3 text-sm text-gray-500 italic">${text}</p>` : ''}
            ${caption ? `<p class="mt-3 text-sm text-gray-500 italic">${caption}</p>` : ''}
          </div>`;

      case 'image-full-width':
      case 'full-width':
        return `
          <div class="my-6">
            <img src="${imageUrl}" alt="${block.imageTitle || 'Full width image'}" class="w-full h-auto rounded-lg" />
            ${
              text
                ? `<div class="py-4">
              <p class="text-base leading-relaxed text-gray-600">${text}</p>
            </div>`
                : ''
            }
          </div>`;

      // NEW LAYOUTS - Phase 2 Enhancements
      case 'grid':
        const gridImages = block.images || [imageUrl];
        return `
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            ${gridImages
              .map(
                img => `
              <div class="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition">
                <img src="${img}" alt="Grid image" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            `
              )
              .join('')}
          </div>`;

      case 'carousel':
        const carouselId = `carousel-${Date.now()}`;
        return `
          <div class="relative my-6 rounded-lg overflow-hidden shadow-lg">
            <div class="relative bg-gray-900 aspect-video">
              <img src="${imageUrl}" alt="Carousel" 
                   id="${carouselId}-img" class="w-full h-full object-cover" />
            </div>
            <div class="flex justify-center gap-2 p-4 bg-gray-100">
              <button onclick="document.getElementById('${carouselId}-img').style.opacity='0.5'"
                      class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition">
                ← Prev
              </button>
              <button onclick="document.getElementById('${carouselId}-img').style.opacity='1'"
                      class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition">
                Next →
              </button>
            </div>
            ${text ? `<div class="p-4 bg-white text-center text-sm text-gray-600">${text}</div>` : ''}
          </div>`;

      case 'before-after':
        const beforeUrl = block.beforeUrl || imageUrl;
        const afterUrl = block.afterUrl || imageUrl;
        const sliderId = `slider-${Date.now()}`;
        return `
          <div class="relative my-6 rounded-lg overflow-hidden shadow-lg">
            <div class="relative w-full aspect-video">
              <img src="${beforeUrl}" alt="Before" 
                   class="w-full h-full object-cover" />
              <div class="absolute inset-0 overflow-hidden" style="width: 50%">
                <img src="${afterUrl}" alt="After" 
                     class="w-full h-full object-cover" />
              </div>
              <input type="range" min="0" max="100" value="50" 
                     class="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
                     oninput="this.parentElement.querySelector('div').style.width = this.value + '%'" />
            </div>
            <p class="text-center text-sm text-gray-600 p-2">Drag to compare</p>
          </div>`;

      case 'annotated':
        const annotations = block.annotations || [];
        return `
          <div class="relative my-6 rounded-lg overflow-hidden shadow-lg">
            <img src="${imageUrl}" alt="Annotated image" class="w-full h-auto" />
            ${annotations
              .map(
                (ann, idx) => `
              <div class="absolute" style="left: ${ann.x}%; top: ${ann.y}%;">
                <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white cursor-pointer
                            hover:bg-red-600 transition flex items-center justify-center text-white text-xs font-bold"
                     title="${ann.label}">
                  ${idx + 1}
                </div>
              </div>
            `
              )
              .join('')}
          </div>`;

      case 'collage':
        const collageImages = block.images || [imageUrl];
        return `
          <div class="grid gap-3 my-6" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
            ${collageImages
              .map(
                img => `
              <div class="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition">
                <img src="${img}" alt="Collage item" class="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            `
              )
              .join('')}
          </div>`;

      case 'split-screen':
        return `
          <div class="flex gap-6 my-6 items-center">
            <div class="flex-1">
              <img src="${imageUrl}" alt="Split screen image" 
                   class="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div class="flex-1 prose prose-lg max-w-none">
              <p class="text-base leading-relaxed text-gray-700">${text}</p>
            </div>
          </div>`;

      default:
        return `
          <div class="my-6 text-center">
            <img src="${imageUrl}" alt="${block.imageTitle || 'Lesson image'}" class="max-w-full h-auto rounded-xl" />
            ${text ? `<p class="mt-3 text-sm text-gray-500 italic">${text}</p>` : ''}
            ${caption ? `<p class="mt-3 text-sm text-gray-500">${caption}</p>` : ''}
          </div>`;
    }
  }

  convertStatementBlockToHTML(block) {
    const { statementType, variant, content } = block;
    const statementTypeToUse = statementType || variant || 'statement-a';

    // Parse markdown in content
    const parsedContent = this.parseMarkdownToHTML(content || '');

    switch (statementTypeToUse) {
      case 'statement-a':
      case 'callout':
        // Use proper CSS classes from StatementComponent
        return `
          <div class="border-t border-b border-gray-800 py-8 px-6">
            <p class="text-gray-900 text-2xl leading-relaxed text-center font-bold">
              ${parsedContent}
            </p>
          </div>`;

      case 'statement-b':
      case 'highlight':
        // Use proper CSS classes from StatementComponent
        return `
          <div class="relative pt-8 pb-8 px-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            <p class="text-gray-800 text-3xl leading-relaxed text-center font-light">
              ${parsedContent}
            </p>
          </div>`;

      case 'statement-c':
      case 'important':
        // Use proper CSS classes from StatementComponent
        return `
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 py-8 px-6 border-l-4 border-orange-500">
            <p class="text-gray-700 text-xl leading-relaxed">
              ${parsedContent}
            </p>
          </div>`;

      case 'statement-d':
      case 'warning':
        // Use proper CSS classes from StatementComponent
        return `
          <div class="relative bg-white py-6 px-6">
            <div class="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
            <p class="text-gray-900 text-lg leading-relaxed font-bold">
              ${parsedContent}
            </p>
          </div>`;

      case 'note':
      case 'info':
        // Use proper CSS classes from StatementComponent
        return `
          <div class="border border-orange-300 bg-orange-50 p-4 rounded">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-1">
                <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-gray-800 text-sm leading-relaxed">
                  ${parsedContent}
                </p>
              </div>
            </div>
          </div>`;

      // NEW VARIANTS - Phase 1 Enhancements
      case 'success':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
            <span class="text-2xl flex-shrink-0">✓</span>
            <div class="flex-1 text-green-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      case 'warning':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
            <span class="text-2xl flex-shrink-0">⚠️</span>
            <div class="flex-1 text-yellow-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      case 'error':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
            <span class="text-2xl flex-shrink-0">❌</span>
            <div class="flex-1 text-red-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      case 'pro-tip':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-amber-500 bg-amber-50">
            <span class="text-2xl flex-shrink-0">💎</span>
            <div class="flex-1 text-amber-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      case 'remember':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-indigo-500 bg-indigo-50">
            <span class="text-2xl flex-shrink-0">🧠</span>
            <div class="flex-1 text-indigo-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      case 'key-takeaway':
        return `
          <div class="flex gap-3 p-4 rounded-lg border-l-4 border-pink-500 bg-pink-50">
            <span class="text-2xl flex-shrink-0">🎯</span>
            <div class="flex-1 text-pink-900 text-base leading-relaxed">
              ${parsedContent}
            </div>
          </div>`;

      default:
        return `<div class="border-t border-b border-gray-800 py-8 px-6"><p class="text-gray-900 text-2xl leading-relaxed text-center font-bold">${parsedContent}</p></div>`;
    }
  }

  convertListBlockToHTML(block) {
    const {
      listType,
      items,
      content,
      numberingStyle,
      bulletStyle,
      checkedItems,
    } = block;

    // Parse content - can be string or JSON
    let listItems = [];
    if (items && Array.isArray(items)) {
      listItems = items;
    } else if (content) {
      // Try to parse as JSON first
      try {
        const parsed =
          typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed.items && Array.isArray(parsed.items)) {
          listItems = parsed.items;
        } else {
          // Fallback to string splitting
          listItems = content.split('\n').filter(item => item.trim());
        }
      } catch {
        // Not JSON, treat as string
        listItems = content.split('\n').filter(item => item.trim());
      }
    }

    // Clean list items (remove leading numbers, bullets, etc.) and parse markdown
    listItems = listItems.map(item => {
      let cleaned =
        typeof item === 'string' ? item.trim() : String(item).trim();
      // Remove leading numbers (1. 2. etc.)
      cleaned = cleaned.replace(/^\d+[\.)]\s*/, '');
      // Remove leading bullets (- • * etc.)
      cleaned = cleaned.replace(/^[-•*]\s*/, '');
      // Parse markdown in each item
      return this.parseMarkdownToHTML(cleaned);
    });

    const finalListType = listType || 'bulleted';
    const finalNumberingStyle = numberingStyle || 'decimal';
    const finalBulletStyle = bulletStyle || 'circle';
    const finalCheckedItems = checkedItems || {};

    // Handle checklist type - Use proper CSS classes from ListComponent
    if (finalListType === 'checkbox' || finalListType === 'checklist') {
      return `
        <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
          <div class="space-y-4">
            ${listItems
              .map(
                (item, index) => `
              <div class="checkbox-wrapper flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200" data-checkbox-index="${index}">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors checkbox-container" data-index="${index}" role="checkbox" aria-checked="${finalCheckedItems[index] ? 'true' : 'false'}" tabindex="0">
                    <input type="checkbox" class="hidden checkbox-item" data-index="${index}" ${finalCheckedItems[index] ? 'checked' : ''} />
                    <div class="checkbox-visual w-4 h-4 bg-pink-500 rounded-sm flex items-center justify-center text-white text-xs font-semibold leading-none ${finalCheckedItems[index] ? 'opacity-100' : 'opacity-0'} transition-opacity">
                      ✓
                    </div>
                  </div>
                </div>
                <div class="checkbox-text flex-1 text-gray-800 leading-relaxed ${finalCheckedItems[index] ? 'line-through text-gray-500' : ''}">
                  ${item}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    // Handle numbered list - Use proper CSS classes from ListComponent
    if (finalListType === 'numbered' || finalListType === 'ordered') {
      const getNumbering = (index, style) => {
        let number = index + 1;
        switch (style) {
          case 'upper-roman':
            return this.toRoman(number).toUpperCase();
          case 'lower-roman':
            return this.toRoman(number).toLowerCase();
          case 'upper-alpha':
            return String.fromCharCode(64 + number);
          case 'lower-alpha':
            return String.fromCharCode(96 + number);
          default:
            return number.toString();
        }
      };

      return `
        <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
          <ol class="space-y-4 list-none">
            ${listItems
              .map(
                (item, index) => `
              <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  ${getNumbering(index, finalNumberingStyle)}
                </div>
                <div class="flex-1 text-gray-800 leading-relaxed">
                  ${item}
                </div>
              </li>
            `
              )
              .join('')}
          </ol>
        </div>
      `;
    }

    // NEW VARIANTS - Phase 3 Enhancements
    // Handle checklist with progress
    if (block.variant === 'checklist-progress') {
      const completed = Object.values(finalCheckedItems).filter(c => c).length;
      const total = listItems.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return `
        <div class="my-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="mb-4">
            <div class="flex justify-between text-sm font-semibold mb-2 text-blue-900">
              <span>Progress</span>
              <span>${completed}/${total}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full transition-all" 
                   style="width: ${progress}%"></div>
            </div>
          </div>
          <ul class="space-y-2">
            ${listItems
              .map(
                (item, idx) => `
              <li class="flex items-center gap-2">
                <input type="checkbox" ${finalCheckedItems[idx] ? 'checked' : ''} 
                       class="w-5 h-5 rounded border-gray-300" />
                <span class="${finalCheckedItems[idx] ? 'line-through text-gray-400' : 'text-gray-700'}">${item}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>`;
    }

    // Handle nested list
    if (block.variant === 'nested') {
      return `
        <ul class="my-6 space-y-2 pl-4">
          ${(block.items || listItems)
            .map(
              item => `
            <li class="text-base text-gray-700">
              <strong>${typeof item === 'string' ? item : item.text}</strong>
              ${
                item.children
                  ? `
                <ul class="mt-2 pl-6 space-y-1 border-l-2 border-gray-300">
                  ${item.children
                    .map(
                      child => `
                    <li class="text-gray-600">• ${child}</li>
                  `
                    )
                    .join('')}
                </ul>
              `
                  : ''
              }
            </li>
          `
            )
            .join('')}
        </ul>`;
    }

    // Handle icon list
    if (block.variant === 'icon-list') {
      const iconMap = {
        CheckCircle: '✓',
        AlertCircle: '⚠️',
        Info: 'ℹ️',
        Star: '⭐',
        Lightbulb: '💡',
        Target: '🎯',
      };

      return `
        <ul class="my-6 space-y-3">
          ${(block.items || listItems)
            .map(
              item => `
            <li class="flex items-center gap-3 text-base text-gray-700">
              <span class="text-xl">${iconMap[item.icon] || '•'}</span>
              <span>${typeof item === 'string' ? item : item.text}</span>
            </li>
          `
            )
            .join('')}
        </ul>`;
    }

    // Handle tagged list
    if (block.variant === 'tagged') {
      return `
        <ul class="my-6 space-y-2">
          ${(block.items || listItems)
            .map(
              item => `
            <li class="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-base text-gray-700">${typeof item === 'string' ? item : item.text}</span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold"
                    style="background-color: ${item.tagColor || '#E5E7EB'}; 
                           color: ${item.tagTextColor || '#374151'}">
                ${item.tag || 'tag'}
              </span>
            </li>
          `
            )
            .join('')}
        </ul>`;
    }

    // Handle pros-cons list
    if (block.variant === 'pros-cons') {
      return `
        <div class="grid md:grid-cols-2 gap-6 my-6">
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-green-900 mb-3">✓ Pros</h4>
            <ul class="space-y-2">
              ${(
                block.pros ||
                listItems.slice(0, Math.ceil(listItems.length / 2))
              )
                .map(
                  pro => `
                <li class="text-green-800 flex gap-2">
                  <span>✓</span>
                  <span>${typeof pro === 'string' ? pro : pro.text}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
          <div class="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 class="font-semibold text-red-900 mb-3">✗ Cons</h4>
            <ul class="space-y-2">
              ${(block.cons || listItems.slice(Math.ceil(listItems.length / 2)))
                .map(
                  con => `
                <li class="text-red-800 flex gap-2">
                  <span>✗</span>
                  <span>${typeof con === 'string' ? con : con.text}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        </div>`;
    }

    // Handle bulleted list - Use proper CSS classes from ListComponent
    const getBulletComponent = style => {
      const bulletMap = {
        circle:
          '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">●</div>',
        square:
          '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">■</div>',
        disc: '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">⬤</div>',
        arrow:
          '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">▶</div>',
        star: '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">★</div>',
        diamond:
          '<div class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">◆</div>',
      };
      return bulletMap[style] || bulletMap.circle;
    };

    return `
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <ul class="space-y-4 list-none">
          ${listItems
            .map(
              item => `
            <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
              ${getBulletComponent(finalBulletStyle)}
              <div class="flex-1 text-gray-800 leading-relaxed">
                ${item}
              </div>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;
  }

  convertQuoteBlockToHTML(block) {
    const {
      content,
      author,
      authorImage,
      backgroundImage,
      subtype,
      variant,
      quotes,
    } = block;
    const quoteVariant = variant || subtype || 'quote_a';
    const quoteContent = content || '';
    const quoteAuthor = author || '';

    // Handle carousel quotes - Use proper CSS classes from QuoteComponent
    if (
      quoteVariant === 'quote_carousel' ||
      (quotes && Array.isArray(quotes))
    ) {
      const carouselQuotes = quotes || [
        { quote: quoteContent, author: quoteAuthor },
      ];
      const carouselId = `quote-carousel-${Date.now()}`;

      return `
        <div class="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl shadow-lg border border-slate-200/50 p-6 max-w-2xl mx-auto overflow-hidden backdrop-blur-sm">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
          <div class="quote-carousel-${carouselId} relative z-10" data-current="0">
            ${carouselQuotes
              .map(
                (q, index) => `
              <div class="quote-slide ${index === 0 ? 'block' : 'hidden'} transition-all duration-700 ease-in-out transform" data-index="${index}">
                <div class="text-center py-8 px-6">
                  <blockquote class="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed font-light italic">
                    "${q.quote || q.content || ''}"
                  </blockquote>
                  <cite class="text-sm font-semibold text-gray-600 not-italic uppercase tracking-wider">— ${q.author || ''}</cite>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          ${
            carouselQuotes.length > 1
              ? `
            <div class="flex justify-center space-x-2 mt-4">
              ${carouselQuotes
                .map(
                  (_, index) => `
                <button class="carousel-dot w-2 h-2 rounded-full transition-all duration-300 ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-md' : 'bg-slate-300 hover:bg-slate-400 hover:scale-105'}" 
                        onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" 
                        data-dot="${index}"></button>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    // Handle quote on image - Use proper CSS classes from QuoteComponent
    if (quoteVariant === 'quote_on_image' || backgroundImage) {
      return `
        <div class="relative rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto h-[300px] bg-cover bg-center" style="background-image: url('${backgroundImage}');">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
          <div class="relative z-10 flex items-center justify-center h-full p-4 md:p-6">
            <div class="text-center max-w-xl w-full">
              <div class="mb-3">
                <svg class="w-6 h-6 text-white/30 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-base md:text-lg lg:text-xl text-white leading-tight font-extralight mb-4 tracking-wide">
                  ${quoteContent}
                </blockquote>
              </div>
              ${
                quoteAuthor
                  ? `
                <div class="flex items-center justify-center">
                  <div class="w-8 h-px bg-white/60 mr-4"></div>
                  <cite class="text-lg font-light text-white/95 not-italic uppercase tracking-[0.2em]">${quoteAuthor}</cite>
                  <div class="w-8 h-px bg-white/60 ml-4"></div>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    }

    // Handle quote_c with author image - Use proper CSS classes from QuoteComponent
    if (quoteVariant === 'quote_c' || authorImage) {
      return `
        <div class="relative bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto border border-gray-100">
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0">
              <img src="${authorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80'}" alt="${quoteAuthor}" class="w-20 h-20 rounded-full object-cover shadow-md" />
            </div>
            <div class="flex-1">
              <blockquote class="text-xl text-gray-700 mb-4 leading-relaxed font-normal italic">
                "${quoteContent}"
              </blockquote>
              ${quoteAuthor ? `<cite class="text-base font-semibold text-gray-600 not-italic">— ${quoteAuthor}</cite>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Handle quote_b - Use proper CSS classes from QuoteComponent
    if (quoteVariant === 'quote_b') {
      return `
        <div class="relative bg-white py-16 px-8 max-w-5xl mx-auto">
          <div class="text-center">
            <blockquote class="text-2xl md:text-2xl text-gray-800 mb-12 leading-relaxed font-light tracking-wide">
              ${quoteContent}
            </blockquote>
            ${quoteAuthor ? `<cite class="text-lg font-medium text-orange-500 not-italic tracking-wider">${quoteAuthor}</cite>` : ''}
          </div>
        </div>
      `;
    }

    // Handle quote_d - Use proper CSS classes from QuoteComponent
    if (quoteVariant === 'quote_d') {
      return `
        <div class="relative bg-gradient-to-br from-slate-50 to-gray-50 py-20 px-12 max-w-4xl mx-auto">
          <div class="text-left max-w-xl">
            <div class="mb-8">
              <svg class="w-12 h-12 text-slate-300 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
              <blockquote class="text-lg md:text-xl text-slate-700 leading-relaxed font-light mb-8">
                ${quoteContent}
              </blockquote>
            </div>
            ${
              quoteAuthor
                ? `
              <div class="flex items-center">
                <div class="w-8 h-px bg-slate-400 mr-4"></div>
                <cite class="text-sm font-medium text-slate-600 not-italic uppercase tracking-widest">${quoteAuthor}</cite>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;
    }

    // NEW VARIANTS - Phase 4 Enhancements
    // Handle testimonial quote with avatar and rating
    if (quoteVariant === 'testimonial') {
      const rating = block.rating || 5;
      return `
        <div class="relative bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
          <div class="flex items-start gap-4 mb-4">
            <img src="${authorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'}" 
                 alt="${quoteAuthor}" class="w-12 h-12 rounded-full object-cover" />
            <div class="flex-1">
              <p class="font-semibold text-gray-900">${quoteAuthor || 'Anonymous'}</p>
              <div class="flex gap-1 mt-1">
                ${Array(rating)
                  .fill(0)
                  .map(() => '<span class="text-yellow-400">★</span>')
                  .join('')}
              </div>
            </div>
          </div>
          <blockquote class="text-gray-700 leading-relaxed italic">
            "${quoteContent}"
          </blockquote>
        </div>`;
    }

    // Handle pull-quote (large, highlighted)
    if (quoteVariant === 'pull-quote') {
      return `
        <div class="relative my-8 pl-6 border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
          <blockquote class="text-2xl md:text-3xl text-gray-900 font-semibold leading-tight mb-4">
            "${quoteContent}"
          </blockquote>
          ${quoteAuthor ? `<cite class="text-gray-700 font-medium">— ${quoteAuthor}</cite>` : ''}
        </div>`;
    }

    // Handle citation quote
    if (quoteVariant === 'citation') {
      return `
        <div class="relative bg-gray-50 rounded-lg p-6 my-6 border-l-4 border-indigo-500">
          <div class="flex gap-4">
            <div class="text-4xl text-indigo-200 leading-none">"</div>
            <div class="flex-1">
              <p class="text-gray-700 leading-relaxed mb-3">${quoteContent}</p>
              ${quoteAuthor ? `<p class="text-sm text-gray-600 font-semibold">— <span class="text-indigo-600">${quoteAuthor}</span></p>` : ''}
            </div>
          </div>
        </div>`;
    }

    // Handle comparison quote
    if (quoteVariant === 'comparison') {
      const quotes = block.quotes || [
        { quote: quoteContent, author: quoteAuthor },
        { quote: 'Second quote', author: 'Author 2' },
      ];
      return `
        <div class="grid md:grid-cols-2 gap-6 my-6">
          ${quotes
            .map(
              (q, idx) => `
            <div class="p-6 rounded-lg ${idx === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50 border-l-4 border-green-500'}">
              <blockquote class="text-gray-700 italic mb-3">"${q.quote}"</blockquote>
              <cite class="text-sm font-semibold ${idx === 0 ? 'text-blue-700' : 'text-green-700'}">— ${q.author}</cite>
            </div>
          `
            )
            .join('')}
        </div>`;
    }

    // Handle quote with background and icon
    if (quoteVariant === 'with-background') {
      return `
        <div class="relative rounded-xl overflow-hidden shadow-lg my-6">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
          <div class="relative z-10 p-8 md:p-12 text-center">
            <div class="text-5xl mb-4">💡</div>
            <blockquote class="text-xl md:text-2xl text-white font-light leading-relaxed mb-6">
              "${quoteContent}"
            </blockquote>
            ${quoteAuthor ? `<cite class="text-white/90 font-medium">— ${quoteAuthor}</cite>` : ''}
          </div>
        </div>`;
    }

    // Handle quote with icon
    if (quoteVariant === 'with-icon') {
      const iconMap = {
        success: '✓',
        warning: '⚠️',
        info: 'ℹ️',
        tip: '💡',
        quote: '"',
      };
      const icon = iconMap[block.icon] || iconMap.quote;
      return `
        <div class="flex gap-4 my-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div class="text-4xl flex-shrink-0">${icon}</div>
          <div class="flex-1">
            <blockquote class="text-gray-800 leading-relaxed mb-3">${quoteContent}</blockquote>
            ${quoteAuthor ? `<cite class="text-sm text-gray-600 font-semibold">— ${quoteAuthor}</cite>` : ''}
          </div>
        </div>`;
    }

    // Default quote_a - Use proper CSS classes from QuoteComponent
    return `
      <div class="relative bg-gradient-to-br from-gray-50 to-white p-12 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-100">
        <div class="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg"></div>
        <div class="relative z-10">
          <div class="w-16 h-px bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          <div class="text-center">
            <svg class="w-8 h-8 text-blue-500/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
            <blockquote class="text-xl text-gray-700 mb-8 leading-relaxed font-light italic tracking-wide">
              "${quoteContent}"
            </blockquote>
            ${quoteAuthor ? `<cite class="text-sm font-semibold text-gray-600 not-italic uppercase tracking-wider letter-spacing-wide">— ${quoteAuthor}</cite>` : ''}
          </div>
          <div class="w-16 h-px bg-gradient-to-r from-purple-600 to-blue-500 mx-auto mt-8"></div>
        </div>
      </div>
    `;
  }

  convertTableBlockToHTML(block) {
    const { content, tableType, templateId } = block;
    const finalTemplateId = templateId || tableType || 'two_columns';

    // Parse content - can be string (pipe-delimited) or JSON
    let tableData = null;

    if (typeof content === 'string') {
      // Try to parse as JSON first
      try {
        tableData = JSON.parse(content);
      } catch {
        // Handle pipe-delimited format (from key terms)
        if (content.includes('|')) {
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            const headers = lines[0]
              .split('|')
              .map(cell => cell.trim())
              .filter(cell => cell);
            const data = lines.slice(1).map(line =>
              line
                .split('|')
                .map(cell => cell.trim())
                .filter(cell => cell)
            );
            tableData = {
              headers,
              data,
              columns: headers.length,
              rows: data.length,
              templateId: 'responsive_table',
            };
          }
        }
      }
    } else if (content && typeof content === 'object') {
      tableData = content;
    }

    if (!tableData || !tableData.headers) {
      return `<div class="p-4 border border-gray-200 rounded-lg bg-gray-50"><p class="text-gray-500 text-sm">Table content</p></div>`;
    }

    // Use proper CSS classes from TableComponent based on template type
    if (
      finalTemplateId === 'two_columns' ||
      finalTemplateId === 'three_columns'
    ) {
      // Layout-based table (grid columns)
      const colClass =
        tableData.columns === 2
          ? 'md:grid-cols-2'
          : tableData.columns === 3
            ? 'md:grid-cols-3'
            : `md:grid-cols-${tableData.columns}`;

      return `
        <div class="grid ${colClass} gap-8">
          ${(tableData.data && tableData.data[0]
            ? tableData.data[0]
            : tableData.headers
          )
            .map(
              (content, index) => `
            <div class="group relative p-6 rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 min-h-fit">
              <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg"></div>
              <div class="flex items-start mb-2">
                <div class="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                <h3 class="font-bold text-lg text-gray-900 break-words leading-tight">${tableData.headers[index] || `Column ${index + 1}`}</h3>
              </div>
              <div class="text-gray-700 leading-relaxed text-base break-words whitespace-pre-wrap overflow-wrap-anywhere">${content || ''}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      // Responsive table format - Use proper CSS classes from TableComponent
      return `
        <div class="relative">
          <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm table-scrollbar">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  ${tableData.headers
                    .map(
                      (header, index) => `
                    <th class="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-tight border-r border-gray-200 last:border-r-0 align-top min-w-[150px] max-w-[300px]">
                      <div class="flex items-start">
                        <div class="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span class="break-words leading-tight">${header}</span>
                      </div>
                    </th>
                  `
                    )
                    .join('')}
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                ${(tableData.data || [])
                  .map(
                    (row, rowIndex) => `
                  <tr class="hover:bg-gray-50 transition-colors duration-200 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}">
                    ${row
                      .map(
                        (cell, cellIndex) => `
                      <td class="px-6 py-4 text-gray-800 border-r border-gray-100 last:border-r-0 align-top min-w-[150px] max-w-[300px]">
                        <div class="font-medium text-sm break-words whitespace-pre-wrap leading-relaxed">${cell || ''}</div>
                      </td>
                    `
                      )
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  convertChecklistBlockToHTML(block) {
    const { items } = block;
    const checklistItems = items
      .map(
        (item, index) =>
          `<div class="flex items-center my-2 p-2 rounded bg-gray-50">
        <input type="checkbox" id="check-${index}" class="mr-3 scale-125" />
        <label for="check-${index}" class="flex-1 text-base text-gray-700 cursor-pointer">${item}</label>
      </div>`
      )
      .join('');

    return `<div class="my-6 p-4 border border-gray-200 rounded-lg bg-white">${checklistItems}</div>`;
  }

  convertLinkBlockToHTML(block) {
    const variant =
      block.metadata?.variant || block.variant || 'button-primary';
    const linkData =
      typeof block.content === 'string'
        ? { url: block.content, title: block.content }
        : block.content || {};

    const url = linkData.url || block.content || '#';
    const title = linkData.title || block.title || block.content || 'Link';
    const description = linkData.description || block.description || '';
    const resourceType = block.metadata?.resourceType || block.linkType || '';

    // Preview card variant (for resources)
    if (variant === 'preview-card') {
      return `
        <div class="link-preview-card my-6 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div class="p-4">
            <a href="${url}" target="_blank" rel="noopener noreferrer" 
               class="no-underline text-blue-600 font-semibold text-base block mb-2">
              ${title}
            </a>
            ${description ? `<p class="text-gray-500 text-sm mb-2 leading-normal">${description}</p>` : ''}
            ${resourceType ? `<span class="inline-block text-gray-400 text-xs uppercase tracking-wider">${resourceType}</span>` : ''}
          </div>
        </div>`;
    }

    // Default button style
    return `
      <div class="my-6 p-5 border border-gray-200 rounded-lg bg-slate-50">
        <h4 class="m-0 mb-2 text-gray-800 text-lg font-semibold">
          <a href="${url}" target="_blank" class="text-blue-500 no-underline">${title}</a>
        </h4>
        ${description ? `<p class="m-0 mb-3 text-gray-500 text-sm leading-snug">${description}</p>` : ''}
        <div class="mt-3">
          <a href="${url}" target="_blank" class="text-blue-500 text-sm no-underline font-medium">Visit Resource →</a>
        </div>
      </div>`;
  }

  convertInteractiveBlockToHTML(block) {
    try {
      let interactiveData = {};

      // Parse content - handle both string JSON and object
      if (typeof block.content === 'string') {
        try {
          // Try parsing directly first
          interactiveData = JSON.parse(block.content);
        } catch (parseError) {
          // If parsing fails, try to extract JSON from the string (might have extra text)
          const jsonMatch = block.content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              interactiveData = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.error('Failed to parse interactive block content:', e);
              // Return error message instead of raw JSON
              return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <p class="text-red-700">Error: Could not parse quiz data. Please check the content format.</p>
              </div>`;
            }
          } else {
            console.error('No JSON found in interactive block content');
            return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <p class="text-red-700">Error: No valid quiz data found.</p>
            </div>`;
          }
        }
      } else {
        interactiveData = block.content || {};
      }

      const interactiveType =
        interactiveData.type || block.metadata?.interactiveType || 'quiz';
      const templateId =
        interactiveData.templateId ||
        block.metadata?.variant ||
        interactiveType;

      // Handle quiz type - Use proper CSS classes from InteractiveComponent
      if (interactiveType === 'quiz' || templateId === 'quiz') {
        const questions = interactiveData.questions || [];
        if (questions.length === 0) {
          return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"><p class="text-gray-700">${interactiveData.title || 'Quiz'}</p></div>`;
        }

        let quizHTML = `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">`;
        quizHTML += `<h3 class="text-xl font-semibold text-gray-900 mb-6">${interactiveData.title || 'Quiz'}</h3>`;

        questions.forEach((q, idx) => {
          quizHTML += `<div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">`;
          quizHTML += `<p class="font-semibold text-gray-800 mb-4 text-lg">${idx + 1}. ${q.question || q.text || ''}</p>`;
          quizHTML += `<div class="space-y-2">`;

          (q.options || []).forEach((opt, optIdx) => {
            const letter = String.fromCharCode(97 + optIdx); // a, b, c, d
            const isCorrect = opt.isCorrect || opt.correct;
            quizHTML += `<div class="flex items-start p-3 rounded-lg ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white border border-gray-200'}">
              <input type="radio" 
                     name="q${idx}" 
                     value="${letter}"
                     ${isCorrect ? 'checked' : ''} 
                     disabled 
                     class="mt-1 mr-3 h-4 w-4 text-blue-600" />
              <label class="flex-1 cursor-pointer">
                <span class="text-gray-800 ${isCorrect ? 'text-green-700 font-medium' : ''}">
                  ${letter}) ${opt.text || opt.option || ''} ${isCorrect ? '✓' : ''}
                </span>
              </label>
            </div>`;
          });

          quizHTML += `</div>`;

          // Add explanation if available
          if (q.explanation) {
            quizHTML += `<div class="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p class="text-sm text-gray-700"><strong>Explanation:</strong> ${q.explanation}</p>
            </div>`;
          }

          quizHTML += `</div>`;
        });

        quizHTML += `</div>`;
        return quizHTML;
      }

      // Handle exercise type - Use proper CSS classes
      if (interactiveType === 'exercise') {
        return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">${interactiveData.title || 'Hands-on Exercise'}</h3>
          ${interactiveData.duration ? `<p class="text-sm text-gray-600 mb-4"><strong>Duration:</strong> ${interactiveData.duration}</p>` : ''}
          <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
            ${interactiveData.instructions || interactiveData.content || ''}
          </div>
        </div>`;
      }

      // Handle tabs - Use proper CSS classes from InteractiveComponent
      if (templateId === 'tabs' || interactiveType === 'tabs') {
        const tabsData = interactiveData.tabs || interactiveData.data || [];
        if (tabsData.length === 0)
          return `<div class="p-4 bg-gray-50 rounded">No tabs content</div>`;

        const tabsId = `tabs-${Date.now()}`;
        return `
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-blue-500 to-purple-600">
            <div class="interactive-tabs" data-template="tabs" id="${tabsId}">
              <div class="flex border-b border-gray-200 mb-4" role="tablist">
                ${tabsData
                  .map(
                    (tab, index) => `
                  <button class="tab-button px-4 py-2 text-sm font-medium transition-colors duration-200 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" 
                          role="tab" 
                          data-tab="${index}"
                          data-container="${tabsId}"
                          onclick="window.switchTab && window.switchTab('${tabsId}', ${index})">
                    ${tab.title || `Tab ${index + 1}`}
                  </button>
                `
                  )
                  .join('')}
              </div>
              <div class="tab-content">
                ${tabsData
                  .map(
                    (tab, index) => `
                  <div class="tab-panel ${index === 0 ? 'block' : 'hidden'}" data-panel="${index}" role="tabpanel">
                    <div class="text-gray-700 leading-relaxed">${tab.content || ''}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `;
      }

      // Handle accordion - Use proper CSS classes from InteractiveComponent
      if (templateId === 'accordion' || interactiveType === 'accordion') {
        const accordionData =
          interactiveData.accordion || interactiveData.data || [];
        if (accordionData.length === 0)
          return `<div class="p-4 bg-gray-50 rounded">No accordion content</div>`;

        const accordionId = `accordion-${Date.now()}`;
        return `
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-green-500 to-teal-600">
            <div class="interactive-accordion" data-template="accordion" id="${accordionId}">
              ${accordionData
                .map(
                  (item, index) => `
                <div class="accordion-item border-b border-gray-200 last:border-b-0">
                  <button class="accordion-header w-full flex items-center justify-between py-4 text-left text-gray-800 hover:text-gray-600 transition-colors duration-200"
                          data-container="${accordionId}"
                          onclick="window.toggleAccordion && window.toggleAccordion('${accordionId}', ${index})">
                    <span class="font-medium">${item.title || `Section ${index + 1}`}</span>
                    <svg class="accordion-icon w-5 h-5 transform transition-transform duration-200 ${index === 0 ? 'rotate-180' : ''}" 
                         data-icon="${index}" 
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div class="accordion-content overflow-hidden transition-all duration-300 ${index === 0 ? 'pb-4' : ''}" 
                       data-content="${index}"
                       style="max-height: ${index === 0 ? '2000px' : '0'}; overflow-y: auto;">
                    <div class="pl-4">
                      <div class="text-gray-700 leading-relaxed">${item.content || ''}</div>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      // Fallback for other interactive types
      return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="text-gray-700">
          ${typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
        </div>
      </div>`;
    } catch (error) {
      console.error('Error converting interactive block:', error);
      return `<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <p class="text-gray-700">${block.content || 'Interactive content'}</p>
      </div>`;
    }
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
  /**
   * Parse quiz questions from text or JSON
   */
  parseQuizQuestions(quizText) {
    if (!quizText || typeof quizText !== 'string') return [];

    // Try to parse as JSON first (common AI output format)
    try {
      // Check if it's a JSON array or object - try to find complete JSON
      // Handle cases where JSON might be wrapped in markdown code blocks or have extra text
      let jsonString = quizText.trim();

      // Remove markdown code blocks if present (handle multiple formats)
      jsonString = jsonString
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .replace(/^```/gm, '')
        .replace(/```$/gm, '');

      // Normalize smart quotes to standard quotes to avoid JSON parse issues
      jsonString = jsonString.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

      // Remove any leading/trailing text that's not JSON
      // Try to extract JSON array - be more aggressive
      let jsonArrayMatch = jsonString.match(/\[[\s\S]*\]/);

      // If no array found, try to find JSON object
      if (!jsonArrayMatch) {
        jsonArrayMatch = jsonString.match(/\{[\s\S]*\}/);
      }

      // If still not found, try parsing the entire string
      if (!jsonArrayMatch) {
        try {
          const directParse = JSON.parse(jsonString);
          if (Array.isArray(directParse)) {
            jsonArrayMatch = [jsonString];
          }
        } catch (e) {
          // Continue with regex matching
        }
      }

      if (jsonArrayMatch) {
        let parsed;
        try {
          parsed = JSON.parse(jsonArrayMatch[0]);
        } catch (parseError) {
          // Try to fix common JSON issues
          let fixedJson = jsonArrayMatch[0]
            // Fix trailing commas like [1, 2, 3,] or { "a": 1, }
            .replace(/,\s*\]/g, ']')
            .replace(/,\s*\}/g, '}')
            // Fix single quotes to double quotes
            .replace(/'/g, '"');

          // Fix unquoted keys only when they look like real JSON keys
          // (at object/array boundaries) to avoid touching values like
          // "Option A: Explanation" inside strings.
          fixedJson = fixedJson.replace(
            /([\{,]\s*)([a-zA-Z0-9_]+)\s*:/g,
            (match, prefix, key) => `${prefix}"${key}":`
          );

          try {
            parsed = JSON.parse(fixedJson);
          } catch (e2) {
            // As a last resort, attempt to parse individual objects so that
            // a single malformed comma or bracket does not discard all
            // otherwise valid questions.
            console.warn(
              '⚠️ Could not parse full quiz JSON, attempting object-by-object recovery.'
            );

            const objectMatches = fixedJson.match(/\{[\s\S]*?\}/g);
            if (objectMatches && objectMatches.length > 0) {
              const recovered = [];

              for (const objStr of objectMatches) {
                try {
                  const q = JSON.parse(objStr);
                  recovered.push(q);
                } catch (e3) {
                  // Skip invalid fragments and continue
                }
              }

              parsed = recovered.length > 0 ? recovered : null;
            } else {
              parsed = null;
            }
          }
        }

        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          // Format: [{question, options, correctAnswer, explanation}, ...]
          return parsed
            .map(item => {
              const options = item.options || [];
              const correctAnswer = item.correctAnswer || '';

              // Find correct option index - handle multiple formats
              let correctIndex = -1;

              // Try exact match first
              correctIndex = options.findIndex(
                opt =>
                  opt === correctAnswer || opt.trim() === correctAnswer.trim()
              );

              // Try case-insensitive match
              if (correctIndex === -1) {
                correctIndex = options.findIndex(
                  opt =>
                    opt.toLowerCase() === correctAnswer.toLowerCase() ||
                    opt.toLowerCase().trim() ===
                      correctAnswer.toLowerCase().trim()
                );
              }

              // Try "Option A", "Option B" format (0-indexed: A=0, B=1, C=2, D=3)
              if (
                correctIndex === -1 &&
                correctAnswer.match(/option\s*([a-d])/i)
              ) {
                const match = correctAnswer.match(/option\s*([a-d])/i);
                const letter = match[1].toLowerCase();
                correctIndex = letter.charCodeAt(0) - 'a'.charCodeAt(0);
              }

              // Try single letter "A", "B", "C", "D"
              if (
                correctIndex === -1 &&
                /^[a-d]$/i.test(correctAnswer.trim())
              ) {
                const letter = correctAnswer.trim().toLowerCase();
                correctIndex = letter.charCodeAt(0) - 'a'.charCodeAt(0);
              }

              // Try numeric index (0, 1, 2, 3)
              if (correctIndex === -1 && /^\d+$/.test(correctAnswer.trim())) {
                correctIndex = parseInt(correctAnswer.trim(), 10);
              }

              // If still not found, default to first option (fallback)
              if (correctIndex === -1 || correctIndex >= options.length) {
                correctIndex = 0;
              }

              return {
                question: item.question || '',
                options: options.map((opt, idx) => ({
                  text: opt,
                  isCorrect: idx === correctIndex,
                })),
                type: options.length === 2 ? 'TRUE_FALSE' : 'MCQ_SINGLE',
                explanation: item.explanation || '',
              };
            })
            .filter(q => q.question && q.options.length >= 2);
        }
      }
    } catch (e) {
      console.error('Error parsing quiz questions:', e);
      // Not JSON, continue with text parsing
    }

    // Fallback to text parsing
    const questions = [];
    const questionBlocks = quizText.split(/(?=Q\d*:)/i);

    questionBlocks.forEach(block => {
      const qMatch = block.match(/Q\d*:\s*(.+?)(?=\n[a-d]\)|$)/is);
      if (qMatch) {
        const questionText = qMatch[1].trim();
        const options = [];
        const optionMatches = block.matchAll(
          /([a-d])\)\s*(.+?)(?=\n[a-d]\)|$|Answer:)/gis
        );

        for (const match of optionMatches) {
          const isCorrect =
            match[2].includes('✓') || match[2].includes('(correct)');
          options.push({
            text: match[2].replace(/[✓(correct)]/gi, '').trim(),
            isCorrect,
          });
        }

        // Check for True/False
        const tfMatch = block.match(/Answer:\s*(True|False)/i);
        if (tfMatch && options.length === 0) {
          options.push(
            { text: 'True', isCorrect: tfMatch[1].toLowerCase() === 'true' },
            { text: 'False', isCorrect: tfMatch[1].toLowerCase() === 'false' }
          );
        }

        if (questionText && options.length >= 2) {
          questions.push({
            question: questionText,
            options,
            type: options.length === 2 ? 'TRUE_FALSE' : 'MCQ_SINGLE',
          });
        }
      }
    });

    return questions;
  }

  /**
   * Adjust color brightness
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

  createContinueDivider(text = 'CONTINUE', order, color = '#2563eb') {
    // Use inline style for dynamic colors since TailwindCSS doesn't support arbitrary colors in class names
    // But use TailwindCSS classes for all other styling
    const darkerColor = this.adjustColor(color, -20);

    return {
      id: `ai-continue-divider-${Date.now()}-${Math.random()}`,
      type: 'divider',
      subtype: 'continue',
      content: text,
      html_css: `<div class="w-full py-6">
        <div class="text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors duration-200 hover:opacity-90" style="background-color: ${color};" onmouseover="this.style.backgroundColor='${darkerColor}'" onmouseout="this.style.backgroundColor='${color}'">
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
   * Generate contextual caption for an image based on lesson/course context
   * Uses AI to create meaningful explanations instead of generic text
   * @param {string} imageType - Type of image (hero, concept, illustration, etc.)
   * @param {string} lessonTitle - Title of the lesson
   * @param {string} conceptName - Name of the concept (if applicable)
   * @param {string} generatedPrompt - The prompt used to generate the image
   * @param {Object} context - Additional context (moduleTitle, courseTitle, description)
   * @returns {Promise<string>} Contextual caption text
   */
  async generateContextualCaption(
    imageType,
    lessonTitle,
    conceptName = '',
    generatedPrompt = '',
    context = {}
  ) {
    try {
      const { moduleTitle = '', courseTitle = '', description = '' } = context;

      // Build a prompt to generate a meaningful caption
      const captionPrompt = `Generate a concise, educational caption (1-2 sentences) for an AI-generated image.

Image Type: ${imageType}
Lesson: ${lessonTitle}
${conceptName ? `Concept: ${conceptName}` : ''}
${moduleTitle ? `Module: ${moduleTitle}` : ''}
${courseTitle ? `Course: ${courseTitle}` : ''}
${description ? `Context: ${description.substring(0, 150)}` : ''}
${generatedPrompt ? `Image Description: ${generatedPrompt.substring(0, 200)}` : ''}

Requirements:
- Explain what the image shows and its educational value
- Connect it to the lesson/course concepts
- Be specific and informative, NOT generic
- Use professional, educational tone
- Keep it 1-2 sentences maximum
- Do NOT start with "This image shows" or similar generic phrases

Generate ONLY the caption text, no additional explanation.`;

      const result = await this.aiService.generateText(captionPrompt, {
        maxTokens: 100,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content writer. Create concise, meaningful captions that explain images in educational context. Be specific and avoid generic descriptions.',
      });

      // Extract text from result
      let caption = typeof result === 'string' ? result.trim() : '';

      // Fallback if generation fails or returns empty
      if (!caption || caption.length < 10) {
        caption = this.generateFallbackCaption(
          imageType,
          lessonTitle,
          conceptName
        );
      }

      return caption;
    } catch (error) {
      console.warn('⚠️ Caption generation failed:', error.message);
      // Return fallback caption
      return this.generateFallbackCaption(imageType, lessonTitle, conceptName);
    }
  }

  /**
   * Generate fallback caption when AI generation fails
   * More contextual than generic text
   * @param {string} imageType - Type of image
   * @param {string} lessonTitle - Lesson title
   * @param {string} conceptName - Concept name
   * @returns {string} Fallback caption
   */
  generateFallbackCaption(imageType, lessonTitle, conceptName = '') {
    const fallbacks = {
      hero: `Real-world example illustrating key concepts from "${lessonTitle}"`,
      concept: `Visual representation of ${conceptName || 'the concept'} in "${lessonTitle}"`,
      illustration: `Practical application of ${conceptName || 'concepts'} in "${lessonTitle}"`,
      example: `Concrete example demonstrating ${conceptName || 'the principles'} of "${lessonTitle}"`,
      default: `Visual guide to understanding "${lessonTitle}"`,
    };

    return fallbacks[imageType] || fallbacks.default;
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
    // Use proper CSS classes for master heading
    const gradientClassMap = {
      gradient1: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
      gradient2: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
      gradient3: 'bg-gradient-to-r from-green-500 to-blue-500',
      gradient4: 'bg-gradient-to-r from-orange-500 to-red-500',
      gradient5: 'bg-gradient-to-r from-pink-500 to-purple-500',
      gradient6: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    };
    const gradientClass =
      gradientClassMap[gradientId] || gradientClassMap['gradient1'];

    return {
      id: `ai-master-heading-${Date.now()}-${Math.random()}`,
      type: 'text',
      textType: 'master_heading',
      content: title,
      gradient: gradientId,
      html_css: `<div class="rounded-xl p-6 text-white font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-center ${gradientClass}">${title}</div>`,
      order,
      isAIGenerated: true,
      metadata: {
        blockType: 'master_heading',
        gradient: gradientId,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Build context-aware prompt with course data and learning science principles
   * Enhanced with professional prompt templates while keeping existing logic
   * Includes prompt length optimization to stay under 4000 character limit
   */
  buildAdvancedPrompt(basePrompt, sectionType, context = {}) {
    const { lessonTitle, moduleTitle, courseTitle, courseData = {} } = context;
    const blueprint = courseData.blueprint || {};
    const MAX_PROMPT_LENGTH = 3800; // Leave buffer under 4000 limit

    // Learning science principles
    const bloomLevels = {
      objectives: 'Apply, Analyze, Evaluate, Create',
      concept: 'Understand, Remember',
      example: 'Apply, Analyze',
      task: 'Apply, Create',
      quiz: 'Remember, Understand, Apply',
    };

    const bloomLevel = bloomLevels[sectionType] || 'Understand, Apply';

    // Use enhanced prompts if enabled (Option 3: Hybrid approach)
    if (this.useEnhancedPrompts) {
      try {
        // Map section types to prompt templates
        const templateMap = {
          objectives: 'learningObjectives',
          'key-terms': 'keyTerms',
          overview: 'lessonContent',
          concept: 'lessonContent',
          'why-matters': 'lessonContent',
          breakdown: 'lessonContent',
          steps: 'lessonContent',
          example: 'example',
          task: 'lessonContent',
          mistakes: 'lessonContent',
          practices: 'lessonContent',
          summary: 'summary',
          quiz: 'quizQuestion',
          resources: 'lessonContent',
        };

        const templateName = templateMap[sectionType] || 'lessonContent';
        const template = USER_PROMPT_TEMPLATES[templateName];

        if (template) {
          // Build enhanced prompt using template
          const promptData = {
            lessonTitle: lessonTitle || 'Lesson',
            moduleTitle: moduleTitle || 'Module',
            courseTitle: courseTitle || 'Course',
            difficulty: courseData.difficulty || 'intermediate',
            objectives: courseData.objectives || [],
            learningObjectives: courseData.objectives || [],
            bloomLevel: bloomLevel,
            audience:
              blueprint.learnerProfile?.primaryAudience || 'adult learners',
            wordCount: this.getWordCountForSection(sectionType),
            maxWords: this.getMaxWordsForSection(sectionType),
            exampleCount: sectionType === 'example' ? 1 : 2,
            context: basePrompt.substring(0, 200), // Limit basePrompt to 200 chars
            topic: lessonTitle,
            concept: basePrompt.substring(0, 100),
            count:
              sectionType === 'objectives'
                ? 5
                : sectionType === 'key-terms'
                  ? 8
                  : 3,
            maxCount:
              sectionType === 'objectives'
                ? 6
                : sectionType === 'key-terms'
                  ? 10
                  : 5,
            questionType: 'multiple-choice',
            tone: 'professional',
            purpose: 'educational content',
            imageType: 'thumbnail',
            aspectRatio: '16:9',
          };

          // Use concise system prompt to save space
          const conciseSystemPrompt = `You are an expert instructional designer. Apply Bloom's Taxonomy, Gagné's 9 Events, and VAK learning styles. Create clear, engaging, actionable content.`;

          // Build user prompt from template
          const userPrompt = template(promptData);

          // Build context string (concise)
          let contextString = `\nCONTEXT: Course: ${courseTitle} | Module: ${moduleTitle} | Lesson: ${lessonTitle}`;
          if (blueprint.learnerProfile?.primaryAudience) {
            contextString += ` | Audience: ${blueprint.learnerProfile.primaryAudience}`;
          }
          contextString += ` | Level: ${bloomLevel} | Difficulty: ${courseData.difficulty || 'intermediate'}`;

          // Combine with context
          let enhancedPrompt = `${conciseSystemPrompt}\n\n${userPrompt}${contextString}\n\nReturn only the requested content.`;

          // Check prompt length and optimize if needed
          if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
            console.warn(
              `⚠️ Prompt too long (${enhancedPrompt.length} chars), optimizing...`
            );

            // Truncate basePrompt further if needed
            const basePromptTruncated = basePrompt.substring(0, 150);

            // Use even more concise version
            const minimalSystemPrompt = `Expert instructional designer. Create clear, engaging content.`;
            const minimalUserPrompt =
              userPrompt.length > 1000
                ? userPrompt.substring(0, 1000) + '...'
                : userPrompt;

            enhancedPrompt = `${minimalSystemPrompt}\n\n${minimalUserPrompt}${contextString}\n\nReturn only the requested content.`;

            // Final check - if still too long, use fallback
            if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
              console.warn(
                `⚠️ Prompt still too long after optimization, using fallback`
              );
              // Fall through to original prompt building below
            } else {
              return enhancedPrompt;
            }
          } else {
            return enhancedPrompt;
          }
        }
      } catch (error) {
        console.warn(
          '⚠️ Enhanced prompt template failed, falling back to original:',
          error.message
        );
        // Fall through to original prompt building
      }
    }

    // Original prompt building (fallback or if enhanced prompts disabled)
    // Build concise context string
    let contextString = `\nCONTEXT: Course: ${courseTitle} | Module: ${moduleTitle} | Lesson: ${lessonTitle}`;
    if (blueprint.learnerProfile) {
      const audience =
        typeof blueprint.learnerProfile === 'string'
          ? blueprint.learnerProfile
          : blueprint.learnerProfile.primaryAudience;
      if (audience) contextString += ` | Audience: ${audience}`;
    }
    contextString += ` | Level: ${bloomLevel} | Difficulty: ${courseData.difficulty || 'intermediate'}`;

    // Truncate basePrompt if too long
    const maxBasePromptLength = 2000;
    const truncatedBasePrompt =
      basePrompt.length > maxBasePromptLength
        ? basePrompt.substring(0, maxBasePromptLength) + '...'
        : basePrompt;

    // Concise system prompt
    const systemPrompt = `Expert instructional designer. Create clear, engaging, actionable content.`;

    // Build prompt
    let enhancedPrompt = `${systemPrompt}\n\n${truncatedBasePrompt}${contextString}\n\nReturn only the requested content.`;

    // Final length check - if still too long, use minimal version
    if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
      console.warn(
        `⚠️ Prompt too long (${enhancedPrompt.length} chars), using minimal version`
      );
      const minimalBasePrompt = basePrompt.substring(0, 1500);
      enhancedPrompt = `${systemPrompt}\n\n${minimalBasePrompt}${contextString}\n\nReturn only the requested content.`;
    }

    return enhancedPrompt;
  }

  /**
   * Helper: Get word count for section type
   */
  getWordCountForSection(sectionType) {
    const wordCounts = {
      objectives: 50,
      'key-terms': 100,
      overview: 200,
      concept: 500,
      'why-matters': 300,
      breakdown: 400,
      steps: 300,
      example: 200,
      task: 250,
      mistakes: 200,
      practices: 250,
      summary: 150,
      quiz: 100,
      resources: 100,
    };
    return wordCounts[sectionType] || 300;
  }

  /**
   * Helper: Get max word count for section type
   */
  getMaxWordsForSection(sectionType) {
    const maxWordCounts = {
      objectives: 100,
      'key-terms': 200,
      overview: 300,
      concept: 800,
      'why-matters': 500,
      breakdown: 600,
      steps: 500,
      example: 400,
      task: 400,
      mistakes: 350,
      practices: 400,
      summary: 250,
      quiz: 200,
      resources: 200,
    };
    return maxWordCounts[sectionType] || 500;
  }

  /**
   * Generate content with multi-pass refinement
   */
  async generateWithRefinement(prompt, options = {}, maxAttempts = 2) {
    // Validate prompt length before attempting generation
    const MAX_PROMPT_LENGTH = 4000;
    if (prompt.length > MAX_PROMPT_LENGTH) {
      console.error(
        `❌ Prompt exceeds maximum length: ${prompt.length} chars (max: ${MAX_PROMPT_LENGTH})`
      );
      // Try to truncate and warn
      const truncatedPrompt =
        prompt.substring(0, MAX_PROMPT_LENGTH - 100) +
        '\n\n[Content truncated due to length limit]';
      console.warn(
        `⚠️ Using truncated prompt (${truncatedPrompt.length} chars)`
      );
      prompt = truncatedPrompt;
    }

    let bestResult = null;
    let bestScore = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.aiService.generateText(prompt, options);

        // Handle different response formats
        let content = '';
        if (typeof result === 'string') {
          // Direct string response (secureAIService format)
          content = result.trim();
        } else if (result?.success) {
          // Object with success property
          content = (result.data?.text || result.content || '').trim();
        } else if (result?.data?.text) {
          // Object with data.text
          content = result.data.text.trim();
        } else if (result?.content) {
          // Object with content property
          content = result.content.trim();
        } else if (result) {
          // Try to stringify if it's an object
          content =
            typeof result === 'object'
              ? JSON.stringify(result)
              : String(result);
        }

        if (content && content.length > 10) {
          const score = this.scoreContentQuality(content, options.sectionType);

          // If this is better or first attempt, use it
          if (score > bestScore || attempt === 0) {
            bestResult = content;
            bestScore = score;
          }

          // If score is excellent (>= 85), use it immediately
          if (score >= 85) {
            console.log(
              `✅ High-quality content generated (score: ${score}) on attempt ${attempt + 1}`
            );
            return content;
          }
        } else {
          console.warn(
            `Attempt ${attempt + 1}: Empty or too short content (${content?.length || 0} chars)`
          );
        }
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      }
    }

    if (bestResult) {
      const finalScore = this.scoreContentQuality(
        bestResult,
        options.sectionType
      );
      console.log(`📊 Using best result with quality score: ${finalScore}/100`);
    } else {
      console.warn(
        `⚠️ No valid content generated after ${maxAttempts} attempts`
      );
    }

    return bestResult || '';
  }

  /**
   * Score content quality (0-100)
   */
  scoreContentQuality(content, sectionType) {
    if (!content || content.trim().length < 10) return 0;

    let score = 50; // Base score

    // Length check (not too short, not too long)
    const wordCount = content.split(/\s+/).length;
    const idealLengths = {
      objectives: { min: 15, max: 100 },
      'key-terms': { min: 50, max: 200 },
      overview: { min: 30, max: 100 },
      concept: { min: 50, max: 200 },
      example: { min: 40, max: 150 },
      task: { min: 20, max: 80 },
      quiz: { min: 30, max: 150 },
    };

    const ideal = idealLengths[sectionType] || { min: 30, max: 200 };
    if (wordCount >= ideal.min && wordCount <= ideal.max) score += 15;

    // Specificity (has numbers, examples, concrete terms)
    if (/\d+/.test(content)) score += 5;
    if (/example|instance|case|scenario/i.test(content)) score += 10;
    if (/specific|concrete|particular|detailed/i.test(content)) score += 5;

    // Action-oriented (for objectives, tasks)
    if (['objectives', 'task'].includes(sectionType)) {
      const actionVerbs =
        /understand|apply|analyze|create|evaluate|implement|design|build/i;
      if (actionVerbs.test(content)) score += 10;
    }

    // Structure (has bullets, lists, clear organization)
    if (/\n|•|[-*]/.test(content)) score += 5;

    // Engagement (questions, hooks, interesting language)
    if (/\?|!|wonder|imagine|consider/i.test(content)) score += 5;

    return Math.min(100, score);
  }

  /**
   * Get dynamic temperature and tokens based on section type
   */
  getGenerationParams(sectionType) {
    // Original parameters (proven to work well)
    return this.getDefaultParams(sectionType);
  }

  /**
   * Get default parameters (original logic - kept intact)
   */
  getDefaultParams(sectionType) {
    const params = {
      objectives: { temperature: 0.3, maxTokens: 250 }, // Precise, factual
      'key-terms': { temperature: 0.4, maxTokens: 400 }, // Clear definitions
      overview: { temperature: 0.8, maxTokens: 250 }, // Creative, engaging
      concept: { temperature: 0.5, maxTokens: 400 }, // Balanced clarity
      'why-matters': { temperature: 0.6, maxTokens: 300 },
      breakdown: { temperature: 0.5, maxTokens: 450 },
      steps: { temperature: 0.4, maxTokens: 500 }, // Sequential, clear
      example: { temperature: 0.7, maxTokens: 350 }, // Creative scenarios
      task: { temperature: 0.7, maxTokens: 250 },
      mistakes: { temperature: 0.5, maxTokens: 300 },
      practices: { temperature: 0.5, maxTokens: 300 },
      summary: { temperature: 0.4, maxTokens: 250 }, // Concise, factual
      quiz: { temperature: 0.6, maxTokens: 400 },
      resources: { temperature: 0.3, maxTokens: 300 }, // Factual links
    };

    const result = params[sectionType] || { temperature: 0.7, maxTokens: 300 };

    // Ensure model is set (for compatibility)
    if (!result.model) {
      result.model = 'gpt-4o-mini'; // Default model
    }

    return result;
  }

  /**
   * Optional: Toggle enhanced prompts on/off
   * @param {boolean} enabled - Enable or disable enhanced prompts
   */
  setEnhancedPrompts(enabled) {
    this.useEnhancedPrompts = enabled;
    console.log(`✅ Enhanced prompts ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create diverse block variants with html_css generated
   */
  createDiverseBlock(type, content, order, variant = null) {
    const blockId = `${type}-${Date.now()}-${Math.random()}`;

    // Use different variants for variety
    if (type === 'quote' && !variant) {
      // Randomly choose quote variant
      const quoteVariants = ['quote_a', 'quote_b', 'quote_c', 'quote_d'];
      variant = quoteVariants[Math.floor(Math.random() * quoteVariants.length)];
    }

    if (type === 'statement' && !variant) {
      const statementVariants = [
        'callout',
        'important',
        'warning',
        'info',
        'highlight',
      ];
      variant =
        statementVariants[Math.floor(Math.random() * statementVariants.length)];
    }

    if (type === 'image' && !variant) {
      const imageLayouts = [
        'centered',
        'side-by-side',
        'overlay',
        'full-width',
      ];
      variant = imageLayouts[Math.floor(Math.random() * imageLayouts.length)];
    }

    // Create block object
    const block = {
      id: blockId,
      type,
      content,
      order,
      variant,
      isAIGenerated: true,
      metadata: {
        variant,
        generatedAt: new Date().toISOString(),
      },
    };

    // Generate html_css immediately for proper rendering
    block.html_css = this.convertBlockToHTML(block);

    return block;
  }

  /**
   * Generate additional supporting blocks for a section to reach 5-8 blocks
   * This adds variety and depth to each section
   */
  async generateSupportingBlocks(
    sectionType,
    sectionContent,
    context,
    blockOrder,
    minBlocks = 5
  ) {
    const { lessonTitle, moduleTitle, courseTitle } = context;
    const supportingBlocks = [];
    let currentOrder = blockOrder;

    // Determine which additional blocks to add based on section type
    const blockTypesToAdd = this.getBlockTypesForSection(
      sectionType,
      minBlocks
    );

    for (const blockConfig of blockTypesToAdd) {
      try {
        let newBlock = null;

        switch (blockConfig.type) {
          case 'statement':
            const statementContent = await this.generateStatementForSection(
              sectionType,
              sectionContent,
              context
            );
            if (statementContent) {
              // Parse markdown before creating block
              const parsedStatementContent =
                this.parseMarkdownToHTML(statementContent);
              newBlock = this.createDiverseBlock(
                'statement',
                parsedStatementContent,
                currentOrder++,
                blockConfig.variant
              );
            }
            break;

          case 'quote':
            const quoteData = await this.generateQuoteForSection(
              sectionType,
              context
            );
            if (quoteData) {
              // Parse markdown in quote before storing
              const parsedQuote = this.parseMarkdownToHTML(quoteData.quote);
              const quoteBlock = {
                id: `quote-${Date.now()}-${Math.random()}`,
                type: 'quote',
                content: parsedQuote, // Store parsed HTML
                author: quoteData.author,
                order: currentOrder++,
                isAIGenerated: true,
                metadata: { variant: blockConfig.variant || 'quote_a' },
              };
              // Generate html_css for quote block
              quoteBlock.html_css = this.convertBlockToHTML(quoteBlock);
              newBlock = quoteBlock;
            }
            break;

          case 'text_paragraph':
            const paragraphContent = await this.generateParagraphForSection(
              sectionType,
              sectionContent,
              context
            );
            if (paragraphContent) {
              // Parse markdown before storing
              const parsedParagraphContent =
                this.parseMarkdownToHTML(paragraphContent);
              const textBlock = {
                id: `text-para-${Date.now()}-${Math.random()}`,
                type: 'text',
                textType: 'paragraph',
                content: parsedParagraphContent, // Store parsed HTML
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  qualityScore: this.scoreContentQuality(
                    paragraphContent,
                    sectionType
                  ),
                },
              };
              // Generate html_css for text block
              textBlock.html_css = this.convertBlockToHTML(textBlock);
              newBlock = textBlock;
            }
            break;

          case 'text_subheading':
            const subheadingData =
              await this.generateSubheadingParagraphForSection(
                sectionType,
                sectionContent,
                context
              );
            if (subheadingData) {
              // Parse markdown in content before storing
              const parsedSubheadingContent = this.parseMarkdownToHTML(
                subheadingData.content
              );
              const subheadingBlock = {
                id: `text-sub-${Date.now()}-${Math.random()}`,
                type: 'text',
                textType: 'subheading_paragraph',
                subheading: subheadingData.subheading,
                content: parsedSubheadingContent, // Store parsed HTML
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  qualityScore: this.scoreContentQuality(
                    subheadingData.content,
                    sectionType
                  ),
                },
              };
              // Generate html_css for subheading block
              subheadingBlock.html_css =
                this.convertBlockToHTML(subheadingBlock);
              newBlock = subheadingBlock;
            }
            break;

          case 'list_bullet':
            const bulletList = await this.generateBulletListForSection(
              sectionType,
              sectionContent,
              context
            );
            if (bulletList && bulletList.length > 0) {
              // Store as JSON with items array for proper structure
              const listContent = {
                items: bulletList,
                listType: 'bulleted',
                bulletStyle: 'circle',
              };
              const listBlock = {
                id: `list-bullet-${Date.now()}-${Math.random()}`,
                type: 'list',
                listType: 'bulleted',
                items: bulletList,
                content: JSON.stringify(listContent),
                bulletStyle: 'circle',
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  qualityScore: this.scoreContentQuality(
                    bulletList.join('\n'),
                    sectionType
                  ),
                },
              };
              // Generate html_css for list block using proper CSS classes
              listBlock.html_css = this.convertBlockToHTML(listBlock);
              newBlock = listBlock;
            }
            break;

          case 'list_numbered':
            const numberedList = await this.generateNumberedListForSection(
              sectionType,
              sectionContent,
              context
            );
            if (numberedList && numberedList.length > 0) {
              // Store as JSON with items array for proper structure
              const listContent = {
                items: numberedList,
                listType: 'numbered',
                numberingStyle: 'decimal',
              };
              const numberedBlock = {
                id: `list-numbered-${Date.now()}-${Math.random()}`,
                type: 'list',
                listType: 'numbered',
                items: numberedList,
                content: JSON.stringify(listContent),
                numberingStyle: 'decimal',
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  qualityScore: this.scoreContentQuality(
                    numberedList.join('\n'),
                    sectionType
                  ),
                },
              };
              // Generate html_css for numbered list block using proper CSS classes
              numberedBlock.html_css = this.convertBlockToHTML(numberedBlock);
              newBlock = numberedBlock;
            }
            break;

          case 'image':
            const imageData = await this.generateImageForSection(
              sectionType,
              context
            );
            if (imageData) {
              // Actually generate the image and upload to S3
              let imageUrl = null;
              let isPlaceholder = true;

              try {
                console.log(
                  '🎨 Generating actual image for section:',
                  sectionType
                );
                // Use secureAIService directly for image generation
                const { default: secureAIService } = await import(
                  './secureAIService'
                );
                const imageResult = await secureAIService.generateImage(
                  imageData.prompt,
                  {
                    size: '1024x1024',
                    quality: 'standard',
                  }
                );

                if (imageResult && (imageResult.url || imageResult.imageUrl)) {
                  const tempImageUrl = imageResult.url || imageResult.imageUrl;
                  console.log('✅ Image generated:', tempImageUrl);

                  // Upload to S3
                  try {
                    const { uploadAIGeneratedImage } = await import(
                      './aiUploadService'
                    );
                    const uploadResult = await uploadAIGeneratedImage(
                      tempImageUrl,
                      {
                        public: true,
                        folder: 'ai-lesson-images',
                      }
                    );

                    if (uploadResult.success && uploadResult.imageUrl) {
                      imageUrl = uploadResult.imageUrl;
                      isPlaceholder = false;
                      console.log('✅ Image uploaded to S3:', imageUrl);
                    } else {
                      imageUrl = tempImageUrl; // Fallback to temporary URL
                      console.warn('⚠️ S3 upload failed, using temporary URL');
                    }
                  } catch (uploadError) {
                    imageUrl = tempImageUrl; // Fallback to temporary URL
                    console.warn(
                      '⚠️ S3 upload error, using temporary URL:',
                      uploadError.message
                    );
                  }
                }
              } catch (imageError) {
                console.error('❌ Image generation failed:', imageError);
                // Continue with placeholder
              }

              // Randomly select image layout if variant not provided (use all 4 types)
              let imageLayout = blockConfig.variant;
              if (!imageLayout) {
                const imageLayouts = [
                  'centered',
                  'side-by-side',
                  'overlay',
                  'full-width',
                ];
                imageLayout =
                  imageLayouts[Math.floor(Math.random() * imageLayouts.length)];
                console.log(
                  `🎨 Randomly selected image layout: ${imageLayout}`
                );
              }

              // Create image block with proper structure for convertImageBlockToHTML
              newBlock = {
                id: `image-${Date.now()}-${Math.random()}`,
                type: 'image',
                layout: imageLayout,
                template: imageLayout, // For convertImageBlockToHTML
                imageTitle: imageData.title,
                imageDescription: imageData.description,
                imageUrl: imageUrl || '', // Store imageUrl for preview/builder
                text: imageData.description, // For side-by-side/overlay layouts
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  variant: imageLayout,
                  isPlaceholder: isPlaceholder,
                  imagePrompt: imageData.prompt,
                },
              };

              // Generate html_css using convertImageBlockToHTML (uses TailwindCSS classes)
              newBlock.html_css = this.convertImageBlockToHTML(newBlock);

              // Ensure imageUrl is set even if empty (for builder compatibility)
              // The builder will use html_css for rendering, but imageUrl helps with block structure
              if (!newBlock.imageUrl && imageUrl) {
                newBlock.imageUrl = imageUrl;
              }
            }
            break;

          case 'table':
            const tableData = await this.generateTableForSection(
              sectionType,
              context
            );
            if (tableData) {
              const tableBlock = {
                id: `table-${Date.now()}-${Math.random()}`,
                type: 'table',
                content: tableData,
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  variant: 'styled',
                  qualityScore: this.scoreContentQuality(
                    tableData,
                    sectionType
                  ),
                },
              };
              // Generate html_css for table block
              tableBlock.html_css = this.convertBlockToHTML(tableBlock);
              newBlock = tableBlock;
            }
            break;

          case 'interactive_quiz':
            const quizData = await this.generateQuizForSection(
              sectionType,
              context
            );
            if (quizData) {
              const interactiveBlock = {
                id: `interactive-quiz-${Date.now()}-${Math.random()}`,
                type: 'interactive',
                content: JSON.stringify(quizData),
                order: currentOrder++,
                isAIGenerated: true,
                metadata: { variant: 'quiz', interactiveType: 'quiz' },
              };
              // Generate html_css for interactive block
              interactiveBlock.html_css =
                this.convertBlockToHTML(interactiveBlock);
              newBlock = interactiveBlock;
            }
            break;

          case 'link':
            const linkData = await this.generateLinkForSection(
              sectionType,
              context
            );
            if (linkData) {
              const linkBlock = {
                id: `link-${Date.now()}-${Math.random()}`,
                type: 'link',
                content: JSON.stringify(linkData),
                order: currentOrder++,
                isAIGenerated: true,
                metadata: {
                  variant: 'preview-card',
                  resourceType: linkData.type,
                },
              };
              // Generate html_css for link block
              linkBlock.html_css = this.convertBlockToHTML(linkBlock);
              newBlock = linkBlock;
            }
            break;
        }

        if (newBlock) {
          supportingBlocks.push(newBlock);
        }
      } catch (error) {
        console.warn(
          `Failed to generate ${blockConfig.type} for ${sectionType}:`,
          error.message
        );
        // Continue with other blocks even if one fails
      }
    }

    return { blocks: supportingBlocks, nextOrder: currentOrder };
  }

  /**
   * Determine which block types to add for each section type
   */
  getBlockTypesForSection(sectionType, minBlocks) {
    const blockConfigs = {
      objectives: [
        { type: 'statement', variant: 'important' },
        { type: 'statement', variant: 'pro-tip' },
        { type: 'text_paragraph' },
        { type: 'list_bullet' },
      ],
      'key-terms': [
        { type: 'text_paragraph' },
        { type: 'statement', variant: 'info' },
        { type: 'list_bullet' },
      ],
      overview: [
        { type: 'quote' },
        { type: 'statement', variant: 'highlight' },
        { type: 'text_paragraph' },
        { type: 'image' },
      ],
      concept: [
        { type: 'text_subheading' },
        { type: 'image' },
        { type: 'statement', variant: 'callout' },
        { type: 'list_bullet' },
        { type: 'text_paragraph' },
      ],
      'why-matters': [
        { type: 'statement', variant: 'important' },
        { type: 'statement', variant: 'remember' },
        { type: 'quote' },
        { type: 'text_paragraph' },
        { type: 'list_numbered' },
      ],
      breakdown: [
        { type: 'text_subheading' },
        { type: 'table' },
        { type: 'image' },
        { type: 'statement', variant: 'info' },
        { type: 'list_bullet' },
      ],
      steps: [
        { type: 'text_paragraph' },
        { type: 'image' },
        { type: 'statement', variant: 'warning' },
        { type: 'list_numbered' },
        { type: 'text_subheading' },
      ],
      example: [
        { type: 'text_paragraph' },
        { type: 'quote' },
        { type: 'statement', variant: 'callout' },
        { type: 'table' },
        { type: 'image' },
      ],
      task: [
        { type: 'interactive_quiz' },
        { type: 'statement', variant: 'important' },
        { type: 'list_numbered' },
        { type: 'text_paragraph' },
      ],
      mistakes: [
        { type: 'statement', variant: 'warning' },
        { type: 'statement', variant: 'error' },
        { type: 'text_paragraph' },
        { type: 'list_bullet' },
        { type: 'quote' },
      ],
      practices: [
        { type: 'quote' },
        { type: 'statement', variant: 'success' },
        { type: 'text_paragraph' },
        { type: 'list_bullet' },
        { type: 'link' },
      ],
      summary: [
        { type: 'statement', variant: 'key-takeaway' },
        { type: 'statement', variant: 'highlight' },
        { type: 'text_paragraph' },
        { type: 'list_bullet' },
        { type: 'link' },
      ],
      quiz: [
        { type: 'text_paragraph' },
        { type: 'statement', variant: 'info' },
        { type: 'list_bullet' },
      ],
      resources: [
        { type: 'link' },
        { type: 'text_paragraph' },
        { type: 'list_bullet' },
        { type: 'statement', variant: 'callout' },
      ],
    };

    // Get base blocks for this section
    let blocks = blockConfigs[sectionType] || [
      { type: 'text_paragraph' },
      { type: 'statement', variant: 'info' },
      { type: 'list_bullet' },
    ];

    // Ensure we have at least minBlocks
    while (blocks.length < minBlocks) {
      const additionalTypes = [
        { type: 'text_paragraph' },
        { type: 'statement', variant: 'success' },
        { type: 'statement', variant: 'pro-tip' },
        { type: 'list_bullet' },
        { type: 'quote' },
        { type: 'text_subheading' },
      ];
      const randomBlock =
        additionalTypes[Math.floor(Math.random() * additionalTypes.length)];
      blocks.push(randomBlock);
    }

    // Limit to minBlocks + 2 for variety
    return blocks.slice(0, Math.min(minBlocks + 2, blocks.length));
  }

  /**
   * Helper functions to generate content for different block types
   */
  async generateStatementForSection(sectionType, sectionContent, context) {
    const { lessonTitle } = context;
    const prompts = {
      objectives: `Create a brief, motivating statement about the importance of achieving the learning objectives for "${lessonTitle}".`,
      'key-terms': `Create an informative statement explaining why understanding key terms is essential for "${lessonTitle}".`,
      overview: `Create an engaging statement that hooks learners into "${lessonTitle}".`,
      concept: `Create a callout statement highlighting a key insight about "${lessonTitle}".`,
      'why-matters': `Create an important statement emphasizing why "${lessonTitle}" matters.`,
      breakdown: `Create an informational statement about the structure of "${lessonTitle}".`,
      steps: `Create a warning statement about common pitfalls when following steps for "${lessonTitle}".`,
      example: `Create a callout statement highlighting what makes the example for "${lessonTitle}" valuable.`,
      task: `Create an important statement about completing the task for "${lessonTitle}".`,
      mistakes: `Create a warning statement about avoiding mistakes in "${lessonTitle}".`,
      practices: `Create an informational statement about best practices for "${lessonTitle}".`,
      summary: `Create a highlight statement summarizing the value of "${lessonTitle}".`,
    };

    const prompt =
      prompts[sectionType] ||
      `Create a relevant statement about "${lessonTitle}".`;
    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 100,
        temperature: 0.7,
      });
      return typeof result === 'string' ? result.trim() : '';
    } catch {
      return null;
    }
  }

  async generateQuoteForSection(sectionType, context) {
    const { lessonTitle } = context;
    const prompts = {
      overview: `Generate an inspiring quote about learning "${lessonTitle}". Format: "Quote" - Author`,
      'why-matters': `Generate a motivational quote about the importance of "${lessonTitle}". Format: "Quote" - Author`,
      example: `Generate a quote from an expert about practical application of "${lessonTitle}". Format: "Quote" - Author`,
      mistakes: `Generate a cautionary quote about learning from mistakes in "${lessonTitle}". Format: "Quote" - Author`,
      practices: `Generate an expert quote about best practices for "${lessonTitle}". Format: "Quote" - Author`,
    };

    const prompt =
      prompts[sectionType] ||
      `Generate a relevant quote about "${lessonTitle}". Format: "Quote" - Author`;
    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 120,
        temperature: 0.8,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      const match = text.match(/"([^"]+)"\s*[-–—]\s*(.+)/);
      if (match) {
        return { quote: match[1], author: match[2].trim() };
      }
      return null;
    } catch {
      return null;
    }
  }

  async generateParagraphForSection(sectionType, sectionContent, context) {
    const { lessonTitle } = context;
    const prompts = {
      objectives: `Write a brief paragraph explaining how the learning objectives for "${lessonTitle}" will benefit learners.`,
      'key-terms': `Write a paragraph explaining the importance of mastering key terms for "${lessonTitle}".`,
      overview: `Write a supporting paragraph that expands on the overview of "${lessonTitle}".`,
      concept: `Write a paragraph providing additional context about "${lessonTitle}".`,
      'why-matters': `Write a paragraph elaborating on why "${lessonTitle}" matters in practical terms.`,
      breakdown: `Write a paragraph explaining how the components of "${lessonTitle}" work together.`,
      steps: `Write a paragraph providing context for the steps in "${lessonTitle}".`,
      example: `Write a paragraph explaining the significance of the example for "${lessonTitle}".`,
      task: `Write a paragraph explaining the purpose and value of the task for "${lessonTitle}".`,
      mistakes: `Write a paragraph about the impact of avoiding mistakes in "${lessonTitle}".`,
      practices: `Write a paragraph about implementing best practices for "${lessonTitle}".`,
      summary: `Write a paragraph reinforcing the key takeaways from "${lessonTitle}".`,
    };

    const prompt =
      prompts[sectionType] ||
      `Write a relevant paragraph about "${lessonTitle}".`;
    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6,
      });
      return typeof result === 'string' ? result.trim() : '';
    } catch {
      return null;
    }
  }

  async generateSubheadingParagraphForSection(
    sectionType,
    sectionContent,
    context
  ) {
    const { lessonTitle } = context;
    const prompts = {
      concept: {
        subheading: 'Deeper Understanding',
        content: `Explore the deeper aspects of ${lessonTitle} and how it applies in different contexts.`,
      },
      breakdown: {
        subheading: 'Component Relationships',
        content: `Understanding how the components of ${lessonTitle} interact and depend on each other.`,
      },
      steps: {
        subheading: 'Implementation Tips',
        content: `Practical tips for successfully implementing the steps for ${lessonTitle}.`,
      },
    };

    const defaultPrompt = {
      subheading: 'Additional Insights',
      content: `Further insights about ${lessonTitle} that enhance understanding.`,
    };
    const prompt = prompts[sectionType] || defaultPrompt;

    try {
      const contentPrompt = `Write 2-3 sentences expanding on: ${prompt.content}`;
      const result = await this.aiService.generateText(contentPrompt, {
        maxTokens: 150,
        temperature: 0.6,
      });
      return {
        subheading: prompt.subheading,
        content: typeof result === 'string' ? result.trim() : prompt.content,
      };
    } catch {
      return prompt;
    }
  }

  async generateBulletListForSection(sectionType, sectionContent, context) {
    const { lessonTitle } = context;
    const prompts = {
      objectives: `List 3-4 quick tips for achieving the learning objectives for "${lessonTitle}".`,
      'key-terms': `List 3-4 ways to effectively learn and remember key terms for "${lessonTitle}".`,
      concept: `List 3-4 key points to remember about "${lessonTitle}".`,
      'why-matters': `List 3-4 specific benefits of mastering "${lessonTitle}".`,
      breakdown: `List 3-4 important aspects of the components of "${lessonTitle}".`,
      steps: `List 3-4 tips for following the steps of "${lessonTitle}".`,
      example: `List 3-4 takeaways from the example of "${lessonTitle}".`,
      task: `List 3-4 things to keep in mind when completing the task for "${lessonTitle}".`,
      mistakes: `List 3-4 additional mistakes to avoid in "${lessonTitle}".`,
      practices: `List 3-4 additional best practices for "${lessonTitle}".`,
      summary: `List 3-4 action items based on "${lessonTitle}".`,
    };

    const prompt =
      prompts[sectionType] ||
      `List 3-4 relevant points about "${lessonTitle}".`;
    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 150,
        temperature: 0.6,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      return text
        .split('\n')
        .filter(line => line.trim())
        .map(line =>
          line
            .replace(/^\d+\.?\s*/, '')
            .replace(/^[-•]\s*/, '')
            .trim()
        )
        .filter(line => line.length > 0 && line.length < 150);
    } catch {
      return [];
    }
  }

  async generateNumberedListForSection(sectionType, sectionContent, context) {
    const { lessonTitle } = context;
    const prompts = {
      'why-matters': `List 3-4 numbered reasons why "${lessonTitle}" is important.`,
      steps: `List 3-4 numbered tips for implementing "${lessonTitle}".`,
      task: `List 3-4 numbered steps for completing the task related to "${lessonTitle}".`,
    };

    const prompt =
      prompts[sectionType] ||
      `List 3-4 numbered points about "${lessonTitle}".`;
    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 150,
        temperature: 0.6,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      return text
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 150);
    } catch {
      return [];
    }
  }

  async generateImageForSection(sectionType, context) {
    const { lessonTitle } = context;
    const imagePrompts = {
      overview: `Create a realistic, photographic-style image prompt for "${lessonTitle}". Describe a real-world scene or setting that represents this topic. NO infographics, NO diagrams, NO text labels. Just a realistic, professional photograph-style image.`,
      concept: `Create a realistic, photographic-style image prompt for "${lessonTitle}". Describe a real-world scene, object, or situation that visually represents this concept. NO infographics, NO diagrams, NO small text. Just a clean, realistic, professional photograph-style image with minimal or no text.`,
      breakdown: `Create a realistic, photographic-style image prompt showing real-world examples of "${lessonTitle}". Describe actual objects, scenes, or situations. NO infographics, NO diagrams, NO text labels. Just realistic, professional photograph-style images.`,
      steps: `Create a realistic, photographic-style image prompt showing a real-world scene related to "${lessonTitle}". Describe an actual situation or setting. NO flowcharts, NO diagrams, NO infographics, NO small text. Just a clean, realistic, professional photograph-style image.`,
      example: `Create a realistic, photographic-style image prompt for a real-world example of "${lessonTitle}". Describe an actual scene, situation, or case study setting. NO infographics, NO diagrams, NO text labels. Just a realistic, professional photograph-style image.`,
    };

    const prompt = imagePrompts[sectionType];
    if (!prompt) return null;

    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 120,
        temperature: 0.7,
        systemPrompt:
          'You create realistic, photographic-style image prompts. NO infographics, NO diagrams, NO small text. Only realistic scenes, objects, or situations.',
      });
      let description = typeof result === 'string' ? result.trim() : '';

      // Ensure the prompt emphasizes realistic, photographic style
      if (
        description &&
        !description.toLowerCase().includes('realistic') &&
        !description.toLowerCase().includes('photograph')
      ) {
        description = `Realistic, professional photograph-style image: ${description}. NO infographics, NO diagrams, NO small text labels. Clean, realistic visual.`;
      }

      return {
        title: `Visual: ${lessonTitle}`,
        description: description,
        prompt: description,
      };
    } catch {
      return null;
    }
  }

  async generateTableForSection(sectionType, context) {
    const { lessonTitle } = context;
    const tablePrompts = {
      breakdown: `Create a comparison table with columns: Component, Description, Importance. List 3-4 components of "${lessonTitle}". Format as: Component|Description|Importance`,
      example: `Create a comparison table with columns: Aspect, Details, Impact. List 3-4 aspects of the example for "${lessonTitle}". Format as: Aspect|Details|Impact`,
    };

    const prompt = tablePrompts[sectionType];
    if (!prompt) return null;

    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.5,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      if (text.includes('|')) {
        return text;
      }
      return null;
    } catch {
      return null;
    }
  }

  async generateQuizForSection(sectionType, context) {
    const { lessonTitle } = context;
    if (sectionType !== 'task') return null;

    try {
      const prompt = `Create a quick quiz question about "${lessonTitle}" with 4 multiple choice options and indicate the correct answer. Format as: Q: Question? a) Option 1 b) Option 2 c) Option 3 d) Option 4 Answer: c`;
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      const parsed = this.parseQuizQuestions(text);
      if (parsed && parsed.length > 0) {
        return {
          type: 'quiz',
          title: `Quick Check: ${lessonTitle}`,
          questions: parsed,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  async generateLinkForSection(sectionType, context) {
    const { lessonTitle, courseTitle } = context;
    const linkPrompts = {
      practices: `Suggest a helpful resource link for best practices related to "${lessonTitle}". Provide title and description.`,
      summary: `Suggest a helpful resource link for further learning about "${lessonTitle}". Provide title and description.`,
      resources: `Suggest a helpful resource link for "${lessonTitle}" in the context of "${courseTitle}". Provide title and description.`,
    };

    const prompt = linkPrompts[sectionType];
    if (!prompt) return null;

    try {
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 150,
        temperature: 0.6,
      });
      const text = typeof result === 'string' ? result.trim() : '';
      // Extract title and description
      const lines = text.split('\n').filter(l => l.trim());
      const title =
        lines[0]?.replace(/^Title:\s*/i, '').trim() ||
        `Resource: ${lessonTitle}`;
      const description =
        lines[1]?.replace(/^Description:\s*/i, '').trim() ||
        `Additional resources for ${lessonTitle}`;

      return {
        url: '#',
        title: title,
        description: description,
        type: 'article',
      };
    } catch {
      return {
        url: '#',
        title: `Resource: ${lessonTitle}`,
        description: `Additional resources for ${lessonTitle}`,
        type: 'article',
      };
    }
  }

  /**
   * Generate lesson content with 10-section optimized blueprint structure
   * Enhanced with all premium features for best content quality
   * Structure: Title & Overview → Outcomes → Key Concepts → Deep-Dive → Examples → Visuals → Steps → Mistakes → Practice → Summary
   */
  async generateBlueprintStructuredLesson(
    lessonTitle,
    moduleTitle,
    courseTitle,
    courseData = {}
  ) {
    const blocks = [];
    let blockOrder = 0;
    const gradients = [
      'gradient1',
      'gradient2',
      'gradient3',
      'gradient4',
      'gradient5',
      'gradient6',
    ];
    const continueColors = [
      '#2563eb',
      '#6366F1',
      '#8B5CF6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
    ];

    // Build context for all sections
    const context = {
      lessonTitle,
      moduleTitle,
      courseTitle,
      courseData,
    };

    try {
      // ============================================
      // NEW 10-SECTION OPTIMIZED STRUCTURE
      // ============================================

      // Section 1: Lesson Title & Micro-Overview (60-90 words)
      // Components: 1-sentence hook, 1-sentence purpose, 1-sentence result/value
      blocks.push(
        this.createMasterHeading(lessonTitle, blockOrder++, gradients[0])
      );

      const microOverviewPrompt = `Create a compelling micro-overview (60-90 words) for "${lessonTitle}" that includes:
1. One engaging hook sentence (intriguing question, surprising fact, or relatable scenario)
2. One clear purpose sentence (what learners will unlock and why it matters)
3. One result/value sentence (what they'll gain and how it applies)

Make it concise, impactful, and create instant context. Total: 60-90 words exactly.`;

      const microOverviewText = await this.generateWithRefinement(
        this.buildAdvancedPrompt(microOverviewPrompt, 'overview', context),
        {
          ...this.getGenerationParams('overview'),
          sectionType: 'overview',
          maxTokens: 150,
          systemPrompt:
            'You are a master educator who creates compelling, concise overviews that instantly engage learners.',
        }
      );

      const parsedMicroOverview = this.parseMarkdownToHTML(microOverviewText);
      blocks.push({
        id: `micro-overview-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: parsedMicroOverview,
        order: blockOrder++,
        isAIGenerated: true,
        metadata: {
          qualityScore: this.scoreContentQuality(microOverviewText, 'overview'),
        },
      });

      // Add supporting blocks
      const overviewSupport = await this.generateSupportingBlocks(
        'overview',
        microOverviewText,
        context,
        blockOrder,
        5
      );
      blocks.push(...overviewSupport.blocks);
      blockOrder = overviewSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[0])
      );

      // Section 2: Learning Outcomes (Performance-Based) - 4-6 bullets
      // Each: 1 line, measurable, Bloom's verbs (Identify, Explain, Apply, Analyze, Evaluate)
      blocks.push(
        this.createMasterHeading(
          'Learning Outcomes',
          blockOrder++,
          gradients[1]
        )
      );
      const objectivesBasePrompt = `Create 4-6 performance-based learning outcomes for "${lessonTitle}". Each outcome must:
- Start with a Bloom's Taxonomy action verb: Identify, Explain, Apply, Analyze, Evaluate, or Create
- Be measurable and testable (one line only)
- Be specific to this lesson topic
- State what learners will be able to DO after completing this lesson
- Use clear, action-oriented language

Format: One outcome per line, each exactly one sentence. Return 4-6 outcomes.`;

      const objectivesPrompt = this.buildAdvancedPrompt(
        objectivesBasePrompt,
        'objectives',
        context
      );
      const objectivesParams = this.getGenerationParams('objectives');
      const objectivesText = await this.generateWithRefinement(
        objectivesPrompt,
        {
          ...objectivesParams,
          sectionType: 'objectives',
          systemPrompt:
            "You are an expert instructional designer specializing in creating measurable learning objectives aligned with Bloom's Taxonomy.",
        }
      );

      const objectives = objectivesText
        .split('\n')
        .filter(line => line.trim())
        .map(obj =>
          obj
            .replace(/^\d+\.?\s*/, '')
            .replace(/^[-•]\s*/, '')
            .trim()
        )
        .filter(obj => obj.length > 0 && obj.length < 150); // Quality filter

      // Calculate quality score on the final content (objectives list)
      const finalObjectivesContent =
        objectives.length > 0
          ? objectives.join('\n')
          : `Understand the core concepts of ${lessonTitle}\nApply key principles in practical scenarios\nAnalyze different approaches and methodologies`;
      const objectivesQualityScore = this.scoreContentQuality(
        finalObjectivesContent,
        'objectives'
      );

      blocks.push({
        id: `objectives-${Date.now()}`,
        type: 'list',
        listType: 'bullet',
        content: finalObjectivesContent,
        order: blockOrder++,
        isAIGenerated: true,
        metadata: { qualityScore: objectivesQualityScore },
      });

      // Add supporting blocks
      const objectivesSupport = await this.generateSupportingBlocks(
        'objectives',
        finalObjectivesContent,
        context,
        blockOrder,
        4
      );
      blocks.push(...objectivesSupport.blocks);
      blockOrder = objectivesSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[1])
      );

      // Section 3: Key Concepts & Definitions (Mini-Glossary) - 8-12 terms
      // Each term: 1-2 sentences, establishes shared language, removes cognitive friction
      blocks.push(
        this.createMasterHeading(
          'Key Concepts & Definitions',
          blockOrder++,
          gradients[2]
        )
      );
      const keyTermsBasePrompt = `List 8-12 essential concepts and terms that learners MUST understand for "${lessonTitle}". For each term:
- Provide a clear definition (1-2 sentences each)
- Use simple language but maintain accuracy
- Include context relevant to ${courseTitle}
- Build mastery vocabulary and remove cognitive friction
- Format as "Term - definition (1-2 sentences)" on separate lines

Focus on terms that are foundational to understanding this lesson. Return 8-12 terms.`;

      const keyTermsPrompt = this.buildAdvancedPrompt(
        keyTermsBasePrompt,
        'key-terms',
        context
      );
      const keyTermsParams = this.getGenerationParams('key-terms');
      const keyTermsText = await this.generateWithRefinement(keyTermsPrompt, {
        ...keyTermsParams,
        sectionType: 'key-terms',
        systemPrompt:
          'You are a subject matter expert creating clear, accessible definitions for learners.',
      });

      // Create as table block for better presentation
      const keyTermsList = keyTermsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
          return match
            ? { term: match[1].trim(), definition: match[2].trim() }
            : null;
        })
        .filter(Boolean);

      if (keyTermsList.length > 0) {
        // Create table block for key terms
        const tableContent = `Term|Definition\n${keyTermsList.map(kt => `${kt.term}|${kt.definition}`).join('\n')}`;
        const keyTermsQualityScore = this.scoreContentQuality(
          tableContent,
          'key-terms'
        );
        blocks.push({
          id: `key-terms-table-${Date.now()}`,
          type: 'table',
          content: tableContent,
          order: blockOrder++,
          isAIGenerated: true,
          metadata: { variant: 'styled', qualityScore: keyTermsQualityScore },
        });
      } else {
        blocks.push({
          id: `key-terms-${Date.now()}`,
          type: 'text',
          textType: 'paragraph',
          content:
            keyTermsText ||
            `Key terms related to ${lessonTitle} will be defined here.`,
          order: blockOrder++,
          isAIGenerated: true,
        });
      }

      // Add supporting blocks
      const keyTermsSupport = await this.generateSupportingBlocks(
        'key-terms',
        keyTermsText,
        context,
        blockOrder,
        4
      );
      blocks.push(...keyTermsSupport.blocks);
      blockOrder = keyTermsSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[2])
      );

      // Section 4: Deep-Dive Core Explanation (Primary Teaching Content) - 350-500 words
      // Structure: Concept → Why it matters → How it works → Implications
      // Format: Sub-sections, bullets, short paragraphs, micro-examples embedded
      blocks.push(
        this.createMasterHeading(
          'Deep-Dive Core Explanation',
          blockOrder++,
          gradients[3]
        )
      );
      const deepDiveBasePrompt = `Provide a comprehensive, expert-level deep-dive explanation (350-500 words) of "${lessonTitle}" that includes:
- **Concept**: Start with a clear, direct definition
- **Why it matters**: Explain real-world relevance and practical impact
- **How it works**: Break down the mechanics, processes, or principles
- **Implications**: Show consequences, applications, and connections

Structure with:
- Sub-sections with clear headings
- Bullet points for key points
- Short paragraphs (2-3 sentences each)
- Micro-examples embedded throughout the explanation
- Clear transitions between sections

Write exactly 350-500 words. Make it detailed, structured, and expert-level.`;

      const deepDivePrompt = this.buildAdvancedPrompt(
        deepDiveBasePrompt,
        'concept',
        context
      );
      const deepDiveParams = this.getGenerationParams('concept');
      deepDiveParams.maxTokens = 600; // Increase for 350-500 words

      const deepDiveText = await this.generateWithRefinement(deepDivePrompt, {
        ...deepDiveParams,
        sectionType: 'concept',
        systemPrompt:
          'You are an expert educator who delivers detailed, structured, expert-level teaching content with embedded examples.',
      });

      // Parse markdown and structure the content
      const parsedDeepDive = this.parseMarkdownToHTML(deepDiveText);
      const deepDiveQualityScore = this.scoreContentQuality(
        deepDiveText,
        'concept'
      );

      blocks.push({
        id: `deep-dive-${Date.now()}`,
        type: 'text',
        textType: 'heading_paragraph',
        heading: `Understanding ${lessonTitle}: A Deep Dive`,
        content: parsedDeepDive,
        order: blockOrder++,
        isAIGenerated: true,
        metadata: { qualityScore: deepDiveQualityScore },
      });

      // Add supporting blocks
      const deepDiveSupport = await this.generateSupportingBlocks(
        'concept',
        deepDiveText,
        context,
        blockOrder,
        6
      );
      blocks.push(...deepDiveSupport.blocks);
      blockOrder = deepDiveSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[3])
      );

      // Section 5: Real-World Examples (Scenario-Based Learning) - 2-3 scenarios, 80-120 words each
      // Purpose: Bridge theory → application, show context-based learning
      blocks.push(
        this.createMasterHeading(
          'Real-World Examples',
          blockOrder++,
          gradients[4]
        )
      );
      const industryContext =
        courseData.blueprint?.learnerProfile ||
        courseData.targetAudience ||
        'general professionals';

      // Generate 2-3 scenarios, each 80-120 words
      const exampleBasePrompt = `Create 2-3 real-world scenarios (80-120 words each) for "${lessonTitle}" that:
- Show the concept in actual use
- Include specific details (context, situation, outcomes)
- Demonstrate practical application
- Are relatable and memorable
- Bridge theory to application

Example styles: Case study, Before vs after, Role-based scenario, Mistake vs correct approach.

Format each scenario as a separate paragraph, 80-120 words each.`;

      const examplePrompt = this.buildAdvancedPrompt(
        exampleBasePrompt,
        'example',
        context
      );
      const exampleParams = this.getGenerationParams('example');
      exampleParams.maxTokens = 400; // For 2-3 scenarios

      const exampleText = await this.generateWithRefinement(examplePrompt, {
        ...exampleParams,
        sectionType: 'example',
        systemPrompt: `You are a business analyst and educator who creates detailed, realistic scenarios for ${industryContext}.`,
      });

      // Split into scenarios and create blocks
      const scenarios = exampleText
        .split(/\n\n+/)
        .filter(s => s.trim().length >= 50);
      scenarios.forEach((scenario, idx) => {
        const parsedScenario = this.parseMarkdownToHTML(scenario.trim());
        blocks.push({
          id: `example-${idx}-${Date.now()}`,
          type: 'text',
          textType: 'subheading_paragraph',
          subheading: `Example ${idx + 1}: Real-World Application`,
          content: parsedScenario,
          order: blockOrder++,
          isAIGenerated: true,
          metadata: {
            qualityScore: this.scoreContentQuality(scenario, 'example'),
          },
        });
      });

      // Add supporting blocks
      const exampleSupport = await this.generateSupportingBlocks(
        'example',
        exampleText,
        context,
        blockOrder,
        5
      );
      blocks.push(...exampleSupport.blocks);
      blockOrder = exampleSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[4])
      );

      // Section 6: Visual Learning Section (AI Image Prompt Ready) - 1-3 visuals, 40-80 words each
      // Purpose: Reinforce understanding, provide diagrams/flowcharts/models
      blocks.push(
        this.createMasterHeading(
          'Visual Learning Section',
          blockOrder++,
          gradients[5]
        )
      );
      // Generate 1-3 visual descriptions (40-80 words each)
      const visualPrompt = `Create 1-3 visual learning descriptions (40-80 words each) for "${lessonTitle}" that:
- Describe diagrams, flowcharts, models, or visual representations
- Are simple, structured, and descriptive
- Reinforce understanding of key concepts
- Can be used as AI image prompts (realistic, photographic-style)
- Each description: 40-80 words

Format: One visual description per line. Return 1-3 descriptions.`;

      const visualText = await this.aiService.generateText(visualPrompt, {
        maxTokens: 200,
        temperature: 0.7,
        systemPrompt:
          'You create clear, structured visual descriptions that reinforce learning. Keep descriptions 40-80 words each, simple and descriptive.',
      });

      // Split into individual visuals and generate images
      const visualDescriptions = visualText
        .split('\n')
        .filter(v => v.trim().length >= 30)
        .slice(0, 3);

      for (let i = 0; i < visualDescriptions.length; i++) {
        const visualDesc = visualDescriptions[i].trim();
        let imageUrl = null;
        let isPlaceholder = true;

        try {
          // Actually generate the image using secureAIService
          const { default: secureAIService } = await import(
            './secureAIService'
          );
          const imageResult = await secureAIService.generateImage(visualDesc, {
            size: '1024x1024',
            quality: 'standard',
          });

          if (imageResult && (imageResult.url || imageResult.imageUrl)) {
            const tempImageUrl = imageResult.url || imageResult.imageUrl;

            // Upload to S3
            try {
              const uploadResult = await uploadAIGeneratedImage(tempImageUrl, {
                public: true,
                folder: 'ai-lesson-images',
              });

              if (uploadResult.success && uploadResult.imageUrl) {
                imageUrl = uploadResult.imageUrl;
                isPlaceholder = false;
              } else {
                imageUrl = tempImageUrl;
              }
            } catch (uploadError) {
              imageUrl = tempImageUrl;
            }
          }
        } catch (imageError) {
          console.error('❌ Image generation failed:', imageError);
        }

        // Randomly select image layout for variety (use all 4 types)
        const imageLayouts = [
          'centered',
          'side-by-side',
          'overlay',
          'full-width',
        ];
        const selectedLayout =
          imageLayouts[Math.floor(Math.random() * imageLayouts.length)];
        console.log(`🎨 Visual ${i + 1} using layout: ${selectedLayout}`);

        // Create image block with proper structure
        const imageBlock = {
          id: `visual-${i}-${Date.now()}`,
          type: 'image',
          layout: selectedLayout,
          template: selectedLayout, // For convertImageBlockToHTML
          imageTitle: `Visual ${i + 1}: ${lessonTitle}`,
          imageDescription: visualDesc,
          text: visualDesc, // For caption (used in side-by-side/overlay layouts)
          imageUrl: imageUrl || '',
          order: blockOrder++,
          isAIGenerated: true,
          metadata: {
            variant: selectedLayout,
            isPlaceholder: isPlaceholder,
            imagePrompt: visualDesc,
          },
        };

        // Generate html_css using convertImageBlockToHTML (uses TailwindCSS classes)
        imageBlock.html_css = this.convertImageBlockToHTML(imageBlock);

        // Ensure imageUrl is set for builder compatibility
        if (!imageBlock.imageUrl && imageUrl) {
          imageBlock.imageUrl = imageUrl;
        }

        blocks.push(imageBlock);
      }

      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[0])
      );

      // Section 7: Step-by-Step Framework / Method / Procedure - 5-10 steps, each 1-3 lines
      // Purpose: Create clear, executable instructions, convert theory → action
      blocks.push(
        this.createMasterHeading(
          'Step-by-Step Framework',
          blockOrder++,
          gradients[1]
        )
      );
      const stepsBasePrompt = `Provide a clear, executable step-by-step framework for "${lessonTitle}". Include 5-10 steps that:
- Are sequential and logical
- Each step is 1-3 lines only
- Include specific actions or decisions
- Are clear and executable
- Convert theory to actionable steps
- Use clear, action-oriented language

IMPORTANT:
- Focus ONLY on practical steps for this specific lesson topic.
- Do NOT output the generic lesson outline (e.g., "Introduction", "Learning Objectives", "Prior Knowledge", etc.).
- Each step should directly help the learner apply "${lessonTitle}" in practice.

Format as numbered steps, each 1-3 lines. Return 5-10 steps.`;

      const stepsPrompt = this.buildAdvancedPrompt(
        stepsBasePrompt,
        'steps',
        context
      );
      const stepsParams = this.getGenerationParams('steps');
      const stepsText = await this.generateWithRefinement(stepsPrompt, {
        ...stepsParams,
        sectionType: 'steps',
        systemPrompt:
          'You are a process engineer who creates clear, actionable workflows and procedures.',
      });

      const stepsList = stepsText
        .split('\n')
        .filter(line => line.trim())
        .map(step => step.replace(/^\d+\.?\s*/, '').trim())
        .filter(step => step.length > 0 && step.length < 200); // 1-3 lines max

      // Keep steps as an explicit array so that editors can treat each step
      // as a separate item instead of a single long string. Also keep the
      // original joined content for backwards compatibility with any logic
      // that expects a newline-delimited string.
      const defaultSteps = [
        'Begin with the basics',
        'Apply the core concepts to simple examples',
        'Practice and refine your understanding with problems',
      ];

      const stepsItems = stepsList.length > 0 ? stepsList : defaultSteps;
      const finalStepsContent = stepsItems.join('\n');
      const stepsQualityScore = this.scoreContentQuality(
        finalStepsContent,
        'steps'
      );
      blocks.push({
        id: `steps-${Date.now()}`,
        type: 'list',
        listType: 'numbered',
        // Provide both items and content; content is kept for legacy
        // consumers, while items gives the lesson builder a clean array
        // of step strings to render and edit.
        items: stepsItems,
        content: finalStepsContent,
        order: blockOrder++,
        isAIGenerated: true,
        metadata: { qualityScore: stepsQualityScore },
      });

      // Add supporting blocks
      const stepsSupport = await this.generateSupportingBlocks(
        'steps',
        stepsText,
        context,
        blockOrder,
        5
      );
      blocks.push(...stepsSupport.blocks);
      blockOrder = stepsSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[1])
      );

      // Section 8: Common Mistakes & Red Flags - 5-7 items, each 1-2 lines
      // Purpose: Prevent bad habits, reduce confusion, improve accuracy
      blocks.push(
        this.createMasterHeading(
          'Common Mistakes & Red Flags',
          blockOrder++,
          gradients[2]
        )
      );
      const mistakesBasePrompt = `List 5-7 common mistakes, misconceptions, or red flags people encounter when learning about "${lessonTitle}". For each mistake:
- Name the specific mistake clearly (1-2 lines total)
- Explain why it's a problem and its consequence
- Be concise and actionable

Format: Each mistake in 1-2 lines. Return 5-7 mistakes.`;

      const mistakesPrompt = this.buildAdvancedPrompt(
        mistakesBasePrompt,
        'mistakes',
        context
      );
      const mistakesParams = this.getGenerationParams('mistakes');
      const mistakesText = await this.generateWithRefinement(mistakesPrompt, {
        ...mistakesParams,
        sectionType: 'mistakes',
        systemPrompt:
          'You are an experienced educator who helps learners avoid common pitfalls.',
      });

      const mistakesList = mistakesText
        .split('\n')
        .filter(line => line.trim())
        .map(mistake =>
          mistake
            .replace(/^\d+\.?\s*/, '')
            .replace(/^[-•]\s*/, '')
            .trim()
        )
        .filter(mistake => mistake.length > 0 && mistake.length < 150); // 1-2 lines max

      // Use statement block with warning variant for emphasis
      if (mistakesList.length > 0) {
        const finalMistakesContent = mistakesList.join('\n');
        const mistakesQualityScore = this.scoreContentQuality(
          finalMistakesContent,
          'mistakes'
        );
        blocks.push({
          id: `mistakes-${Date.now()}`,
          type: 'list',
          listType: 'bullet',
          content: finalMistakesContent,
          order: blockOrder++,
          isAIGenerated: true,
          metadata: { qualityScore: mistakesQualityScore },
        });

        // Add warning statement
        blocks.push(
          this.createDiverseBlock(
            'statement',
            `Avoiding these common mistakes will help you master ${lessonTitle} more effectively.`,
            blockOrder++,
            'warning'
          )
        );
      } else {
        blocks.push({
          id: `mistakes-${Date.now()}`,
          type: 'list',
          listType: 'bullet',
          content: `Avoiding common pitfalls\nMisunderstanding key concepts\nSkipping important steps`,
          order: blockOrder++,
          isAIGenerated: true,
        });
      }

      // Add supporting blocks
      const mistakesSupport = await this.generateSupportingBlocks(
        'mistakes',
        mistakesText,
        context,
        blockOrder,
        4
      );
      blocks.push(...mistakesSupport.blocks);
      blockOrder = mistakesSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[2])
      );

      // Section 9: Practice Application Section - 4-6 activities
      // Types: MCQs, Short-answer, Mini-case, Identify errors, Apply a rule
      // Purpose: Reinforce & check learning, validate retention, encourage active engagement
      blocks.push(
        this.createMasterHeading(
          'Practice Application',
          blockOrder++,
          gradients[3]
        )
      );
      // Generate 4-6 practice activities (mix of MCQs, short-answer, mini-case, identify errors, apply rule)
      const practicePrompt = `Create 4-6 Multiple Choice Questions (MCQs) for "${lessonTitle}" as a JSON array.

REQUIREMENTS:
- Each question must have exactly 4 options
- Include a clear correctAnswer field (use "Option A", "Option B", "Option C", or "Option D" format)
- Include an explanation for each question
- Questions should test understanding, application, and analysis

OUTPUT FORMAT (JSON array only, no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Return ONLY the JSON array, nothing else.`;

      const practiceText = await this.generateWithRefinement(
        this.buildAdvancedPrompt(practicePrompt, 'quiz', context),
        {
          ...this.getGenerationParams('quiz'),
          sectionType: 'quiz',
          maxTokens: 500,
          systemPrompt:
            'You are an expert assessment designer who creates effective practice activities that reinforce learning.',
        }
      );

      // Parse and create interactive quiz block
      const practiceQuestions = this.parseQuizQuestions(practiceText);

      if (practiceQuestions.length > 0) {
        const interactiveBlock = {
          id: `practice-quiz-${Date.now()}`,
          type: 'interactive',
          content: JSON.stringify({
            questions: practiceQuestions,
            type: 'quiz',
            title: `Practice: ${lessonTitle}`,
          }),
          order: blockOrder++,
          isAIGenerated: true,
          metadata: {
            variant: 'quiz',
            questionCount: practiceQuestions.length,
          },
        };

        // Generate html_css for interactive block
        interactiveBlock.html_css = this.convertBlockToHTML(interactiveBlock);
        blocks.push(interactiveBlock);
      } else {
        // Check if the text is raw JSON - if so, show error message instead
        const trimmedText = practiceText.trim();
        const looksLikeJson =
          trimmedText.startsWith('[') || trimmedText.startsWith('{');

        if (looksLikeJson) {
          // Try one more time with more aggressive parsing
          try {
            const lastAttempt = this.parseQuizQuestions(practiceText);
            if (lastAttempt.length > 0) {
              const interactiveBlock = {
                id: `practice-quiz-${Date.now()}`,
                type: 'interactive',
                content: JSON.stringify({
                  questions: lastAttempt,
                  type: 'quiz',
                  title: `Practice: ${lessonTitle}`,
                }),
                order: blockOrder++,
                isAIGenerated: true,
                metadata: {
                  variant: 'quiz',
                  questionCount: lastAttempt.length,
                },
              };
              interactiveBlock.html_css =
                this.convertBlockToHTML(interactiveBlock);
              blocks.push(interactiveBlock);
            } else {
              // Show user-friendly error message instead of raw JSON
              blocks.push({
                id: `practice-error-${Date.now()}`,
                type: 'text',
                textType: 'paragraph',
                content: `<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p class="text-yellow-800 font-medium">Practice Application</p>
                  <p class="text-yellow-700 text-sm mt-2">Unable to parse practice questions. Please try regenerating this section or manually add practice questions.</p>
                </div>`,
                order: blockOrder++,
                isAIGenerated: true,
              });
            }
          } catch (e) {
            // Show user-friendly error message
            blocks.push({
              id: `practice-error-${Date.now()}`,
              type: 'text',
              textType: 'paragraph',
              content: `<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p class="text-yellow-800 font-medium">Practice Application</p>
                <p class="text-yellow-700 text-sm mt-2">Unable to parse practice questions. Please try regenerating this section or manually add practice questions.</p>
              </div>`,
              order: blockOrder++,
              isAIGenerated: true,
            });
          }
        } else {
          // Fallback to text block (not JSON)
          const parsedPractice = this.parseMarkdownToHTML(practiceText);
          blocks.push({
            id: `practice-${Date.now()}`,
            type: 'text',
            textType: 'paragraph',
            content: parsedPractice,
            order: blockOrder++,
            isAIGenerated: true,
          });
        }
      }

      // Add supporting blocks
      const practiceSupport = await this.generateSupportingBlocks(
        'quiz',
        practiceText,
        context,
        blockOrder,
        4
      );
      blocks.push(...practiceSupport.blocks);
      blockOrder = practiceSupport.nextOrder;
      blocks.push(
        this.createContinueDivider('CONTINUE', blockOrder++, continueColors[3])
      );

      // Section 10: Final Summary & Takeaway Map - 100-150 words
      // Structure: 3-5 big takeaways, 1 closing insight, 1 real-world applicability statement
      blocks.push(
        this.createMasterHeading(
          'Final Summary & Takeaway Map',
          blockOrder++,
          gradients[4]
        )
      );
      const summaryBasePrompt = `Create a powerful, memorable summary (100-150 words) of "${lessonTitle}" that includes:
- 3-5 big takeaways (the most critical points)
- 1 closing insight (memorable final thought)
- 1 real-world applicability statement (how to apply this knowledge)

Structure:
1. Start with 3-5 key takeaways (bulleted or numbered)
2. Add one closing insight that ties everything together
3. End with one statement about real-world applicability

Total: 100-150 words. Make it reinforce key pillars and create a "mental map" for long-term memory.`;

      const summaryPrompt = this.buildAdvancedPrompt(
        summaryBasePrompt,
        'summary',
        context
      );
      const summaryParams = this.getGenerationParams('summary');
      summaryParams.maxTokens = 250; // For 100-150 words
      const summaryText = await this.generateWithRefinement(summaryPrompt, {
        ...summaryParams,
        sectionType: 'summary',
        systemPrompt:
          'You are a master educator who creates memorable, actionable summaries that reinforce learning and create mental maps for long-term retention.',
      });

      // Parse markdown in summary and create takeaway map
      const parsedSummary = this.parseMarkdownToHTML(summaryText);
      const summaryQualityScore = this.scoreContentQuality(
        summaryText,
        'summary'
      );

      // Add summary as text block (100-150 words with takeaways, insight, and applicability)
      blocks.push({
        id: `summary-${Date.now()}`,
        type: 'text',
        textType: 'heading_paragraph',
        heading: 'Key Takeaways & Summary',
        content: parsedSummary,
        order: blockOrder++,
        isAIGenerated: true,
        metadata: { qualityScore: summaryQualityScore },
      });

      // Final "COMPLETE" divider - mark as completion
      const completeDivider = this.createContinueDivider(
        'LESSON COMPLETE',
        blockOrder++,
        '#10b981'
      );
      completeDivider.metadata.type = 'completion';
      completeDivider.metadata.isComplete = true;
      blocks.push(completeDivider);

      // Calculate overall quality score
      const qualityScores = blocks
        .map(b => b.metadata?.qualityScore)
        .filter(score => typeof score === 'number' && score > 0);

      const avgQuality =
        qualityScores.length > 0
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          : 0;

      const blocksWithScores = qualityScores.length;
      const totalBlocks = blocks.length;

      console.log(
        `✅ Generated ${totalBlocks} blocks (${blocksWithScores} with quality scores)`
      );
      if (blocksWithScores > 0) {
        console.log(`📊 Average quality score: ${avgQuality.toFixed(1)}/100`);
        console.log(
          `📈 Quality score range: ${Math.min(...qualityScores)}-${Math.max(...qualityScores)}`
        );
      } else {
        console.warn(
          `⚠️ No quality scores calculated - check content generation`
        );
      }

      return blocks;
    } catch (error) {
      console.error('Error generating blueprint structured lesson:', error);
      // Return fallback with basic structure
      return [
        this.createMasterHeading(lessonTitle, 0, 'gradient1'),
        this.createMasterHeading('Learning Objectives', 1, 'gradient2'),
        {
          id: `fallback-${Date.now()}`,
          type: 'text',
          content: 'Content will be generated here.',
          order: 2,
          isAIGenerated: true,
        },
        this.createContinueDivider('LESSON COMPLETE', 3, '#10b981'),
      ];
    }
  }
}

// Export singleton instance
const universalAILessonService = new UniversalAILessonService();
export default universalAILessonService;
