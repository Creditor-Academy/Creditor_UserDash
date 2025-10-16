import enhancedAIService from './enhancedAIService';
import { generateLessonFromPrompt } from './aiCourseService';
import { updateLessonContent } from './courseService';

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
  async generateLessonContent(lessonData, moduleData = {}, courseData = {}, options = {}) {
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
        return this.generateSimpleLessonContent(lessonTitle, moduleTitle, courseTitle);
      }

      // Generate content blocks based on options
      const blocks = await this.generateContentBlocks({
        lessonTitle,
        moduleTitle,
        courseTitle,
        options
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
          generatedAt: new Date().toISOString()
        }
      },
      
      // Learning objectives
      {
        id: `simple-objectives-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Learning Objectives',
        order: 2,
        isAIGenerated: true
      },
      
      {
        id: `simple-objectives-list-${Date.now()}`,
        type: 'list',
        listType: 'bullet',
        content: `Understand the core concepts of ${safeTitle}\nApply the principles in practical scenarios\nAnalyze different approaches and methods\nEvaluate the effectiveness of various strategies`,
        order: 3,
        isAIGenerated: true
      },
      
      // Main content
      {
        id: `simple-content-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Key Concepts',
        order: 4,
        isAIGenerated: true
      },
      
      {
        id: `simple-content-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `This section covers the fundamental concepts of ${safeTitle}. Understanding these principles is essential for mastering the subject matter and applying it effectively in real-world scenarios. The concepts build upon each other to provide a comprehensive understanding of the topic.`,
        order: 5,
        isAIGenerated: true
      },
      
      // Summary
      {
        id: `simple-summary-heading-${Date.now()}`,
        type: 'text',
        textType: 'subheading',
        content: 'Summary',
        order: 6,
        isAIGenerated: true
      },
      
      {
        id: `simple-summary-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `In this lesson, you've learned about ${safeTitle} and its key applications. Continue practicing these concepts and exploring additional resources to deepen your understanding. The knowledge gained here will serve as a foundation for more advanced topics in ${safeModule}.`,
        order: 7,
        isAIGenerated: true
      },
      
      // Continue divider to end the lesson
      this.createContinueDivider('LESSON COMPLETE', 8, '#10b981')
    ];
  }

  /**
   * Generate structured content blocks for lesson
   */
  async generateContentBlocks({ lessonTitle, moduleTitle, courseTitle, options }) {
    const blocks = [];
    let blockOrder = 0;

    try {
      // 0. Generate Lesson Title Master Heading
      blocks.push(this.createMasterHeading(lessonTitle, blockOrder++, 'gradient1'));

      // 1. Generate Introduction
      if (options.includeIntroduction !== false) {
        const introBlock = await this.generateIntroductionBlock(lessonTitle, moduleTitle, courseTitle, blockOrder++);
        blocks.push(introBlock);
      }

      // 2. Generate Learning Objectives
      if (options.includeLearningObjectives !== false) {
        const objectivesBlock = await this.generateLearningObjectivesBlock(lessonTitle, blockOrder++);
        blocks.push(objectivesBlock);
      }

      // 3. Generate Main Content Sections
      if (options.contentType === 'comprehensive') {
        // Key Concepts Section
        const conceptsBlocks = await this.generateKeyConceptsSection(lessonTitle, moduleTitle, blockOrder);
        blocks.push(...conceptsBlocks);
        blockOrder += conceptsBlocks.length;

        // Add continue divider after key concepts
        blocks.push(this.createContinueDivider('CONTINUE TO EXAMPLES', blockOrder++, '#6366F1'));

        // Practical Examples Section
        if (options.includeExamples !== false) {
          const examplesBlocks = await this.generateExamplesSection(lessonTitle, blockOrder);
          blocks.push(...examplesBlocks);
          blockOrder += examplesBlocks.length;

          // Add continue divider after examples
          blocks.push(this.createContinueDivider('CONTINUE TO BEST PRACTICES', blockOrder++, '#8B5CF6'));
        }

        // Best Practices Section
        const practicesBlocks = await this.generateBestPracticesSection(lessonTitle, blockOrder);
        blocks.push(...practicesBlocks);
        blockOrder += practicesBlocks.length;
      } else if (options.contentType === 'outline') {
        // Generate outline-style content
        const outlineBlocks = await this.generateOutlineContent(lessonTitle, moduleTitle, blockOrder);
        blocks.push(...outlineBlocks);
        blockOrder += outlineBlocks.length;
      }

      // 4. Generate Assessment Questions
      if (options.includeAssessments !== false) {
        const assessmentBlocks = await this.generateAssessmentSection(lessonTitle, blockOrder);
        blocks.push(...assessmentBlocks);
        blockOrder += assessmentBlocks.length;
      }

      // 5. Generate Summary
      if (options.includeSummary !== false) {
        const summaryBlocks = await this.generateSummarySection(lessonTitle, moduleTitle, blockOrder);
        blocks.push(...summaryBlocks);
        blockOrder += summaryBlocks.length;
      }

      // 6. Add Interactive Elements
      if (options.includeInteractive) {
        const interactiveBlock = await this.generateInteractiveBlock(lessonTitle, blockOrder++);
        blocks.push(interactiveBlock);
      }

      // 7. Add final lesson completion divider
      blocks.push(this.createContinueDivider('LESSON COMPLETE', blockOrder++, '#10b981'));

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
  async generateIntroductionBlock(lessonTitle, moduleTitle, courseTitle, order) {
    try {
      const prompt = `Create an engaging introduction for the lesson "${lessonTitle}" in the module "${moduleTitle}" of the course "${courseTitle}". The introduction should hook the reader, set clear expectations, and explain what they will learn. Keep it concise but compelling.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.7
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      return {
        id: `ai-intro-${Date.now()}`,
        type: 'text',
        content: content || `Welcome to ${lessonTitle}! In this lesson, you'll explore key concepts and gain practical knowledge that will enhance your understanding of ${moduleTitle}.`,
        order,
        isAIGenerated: true,
        metadata: {
          blockType: 'introduction',
          generatedAt: new Date().toISOString()
        }
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
        temperature: 0.6
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      // Parse objectives into array
      const objectives = content ? 
        content.split('\n').filter(line => line.trim()).map(obj => obj.replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, '').trim()) :
        [
          `Understand the core concepts of ${lessonTitle}`,
          `Apply key principles in practical scenarios`,
          `Analyze different approaches and methodologies`,
          `Evaluate the effectiveness of various strategies`
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
          generatedAt: new Date().toISOString()
        }
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
      blocks.push(this.createMasterHeading('Key Concepts and Principles', startOrder, 'gradient2'));

      // Content
      const prompt = `Explain the key concepts and fundamental principles of "${lessonTitle}". Provide clear definitions and explanations that are easy to understand. Include the most important concepts that students need to master.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.7
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      blocks.push({
        id: `ai-concepts-content-${Date.now()}`,
        type: 'text',
        content: content || `This section covers the fundamental concepts of ${lessonTitle}. Understanding these principles is essential for mastering the subject matter and applying it effectively in real-world scenarios.`,
        order: startOrder + 1,
        isAIGenerated: true
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
      blocks.push(this.createMasterHeading('Practical Applications and Examples', startOrder, 'gradient3'));

      const prompt = `Provide 3-4 practical examples or real-world applications of "${lessonTitle}". Make them relevant, specific, and easy to understand. Show how the concepts apply in different contexts.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 350,
        temperature: 0.8
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      blocks.push({
        id: `ai-examples-content-${Date.now()}`,
        type: 'text',
        content: content || `Here are some practical applications of ${lessonTitle} that demonstrate its real-world relevance and importance in various contexts.`,
        order: startOrder + 1,
        isAIGenerated: true
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
      blocks.push({
        id: `ai-practices-heading-${Date.now()}`,
        type: 'heading',
        content: 'Best Practices and Tips',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      });

      const prompt = `List 5-7 best practices or important tips related to "${lessonTitle}". Make them actionable and practical. Format as clear, concise points.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.6
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      const practices = content ? 
        content.split('\n').filter(line => line.trim()).map(practice => practice.replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, '').trim()) :
        [
          `Always start with a clear understanding of the fundamentals`,
          `Practice regularly to reinforce your learning`,
          `Seek feedback and continuously improve your approach`,
          `Stay updated with the latest developments in the field`,
          `Apply theoretical knowledge to practical situations`
        ];

      blocks.push({
        id: `ai-practices-content-${Date.now()}`,
        type: 'list',
        content: practices.join('\n'),
        listType: 'bullet',
        order: startOrder + 1,
        isAIGenerated: true
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
      blocks.push({
        id: `ai-assessment-heading-${Date.now()}`,
        type: 'heading',
        content: 'Reflection Questions',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      });

      const prompt = `Create 4-5 thought-provoking questions about "${lessonTitle}" that test understanding and encourage critical thinking. Make them open-ended and engaging.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 250,
        temperature: 0.7
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      const questions = content ? 
        content.split('\n').filter(line => line.trim() && line.includes('?')).map(q => q.replace(/^\d+\.?\s*/, '').trim()) :
        [
          `What are the main benefits of applying ${lessonTitle} in practice?`,
          `How does ${lessonTitle} relate to other concepts you've learned?`,
          `What challenges might you face when implementing these concepts?`,
          `How would you explain ${lessonTitle} to someone new to the subject?`
        ];

      blocks.push({
        id: `ai-assessment-content-${Date.now()}`,
        type: 'list',
        content: questions.join('\n'),
        listType: 'ordered',
        order: startOrder + 1,
        isAIGenerated: true
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
      blocks.push({
        id: `ai-summary-heading-${Date.now()}`,
        type: 'heading',
        content: 'Key Takeaways',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      });

      const prompt = `Create a concise summary of the key takeaways from the lesson "${lessonTitle}". Include the most important points students should remember and how they can apply this knowledge.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      blocks.push({
        id: `ai-summary-content-${Date.now()}`,
        type: 'text',
        content: content || `In this lesson on ${lessonTitle}, we've covered the essential concepts, practical applications, and best practices. Remember to apply these insights in your own work and continue exploring the subject further.`,
        order: startOrder + 1,
        isAIGenerated: true
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
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate outline-style content
   */
  async generateOutlineContent(lessonTitle, moduleTitle, startOrder) {
    const blocks = [];
    
    try {
      const prompt = `Create a structured outline for the lesson "${lessonTitle}" in the module "${moduleTitle}". Include main topics, subtopics, and key points. Format as a hierarchical structure.`;
      
      const result = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.6
      });

      // Extract text from result object
      const content = result?.success 
        ? (result.data?.text || result.content || '') 
        : '';

      blocks.push({
        id: `ai-outline-${Date.now()}`,
        type: 'text',
        content: content || `This lesson outline covers the main topics and key concepts of ${lessonTitle}, providing a structured approach to learning.`,
        order: startOrder,
        isAIGenerated: true
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
      console.log(`💾 Saving ${blocks.length} AI-generated blocks to lesson ${lessonId}`);
      
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
          totalBlocks: 0
        }
      };
    }

    // Convert blocks with proper html_css field
    const processedBlocks = blocks.map(block => ({
      ...block,
      html_css: block.html_css || this.convertBlockToHTML(block)
    }));

    return {
      content: processedBlocks, // Backend expects 'content' field
      metadata: {
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        totalBlocks: blocks.length
      }
    };
  }

  /**
   * Convert block to HTML format
   */
  convertBlockToHTML(block) {
    // If block already has html_css, return it
    if (block.html_css) {
      return block.html_css;
    }

    switch (block.type) {
      case 'heading':
        const level = block.level || 2;
        return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-4">${block.content}</h${level}>`;
      
      case 'text':
        // Handle different text types
        if (block.textType === 'master_heading') {
          // Return master heading with gradient
          return `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 0; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px;">${block.content}</h1>`;
        } else if (block.textType === 'subheading') {
          return `<h2 class="text-2xl font-semibold text-gray-800 mb-3">${block.content}</h2>`;
        } else {
          // Regular paragraph
          return `<div class="prose max-w-none mb-4"><p>${block.content}</p></div>`;
        }
      
      case 'list':
        const listTag = block.listType === 'ordered' ? 'ol' : 'ul';
        const items = (block.content || '').split('\n').filter(item => item.trim());
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return `<${listTag} class="list-${block.listType === 'ordered' ? 'decimal' : 'disc'} ml-6 mb-4">${listItems}</${listTag}>`;
      
      case 'quote':
        return `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">"${block.content}"${block.author ? ` <cite>- ${block.author}</cite>` : ''}</blockquote>`;
      
      case 'divider':
        // Handle different divider types
        if (block.subtype === 'continue') {
          const text = block.content || 'CONTINUE';
          const color = block.metadata?.color || '#2563eb';
          return `<div style="width: 100%; padding: 24px 0;">
            <div style="background-color: ${color}; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;">
              ${text}
            </div>
          </div>`;
        } else if (block.subtype === 'numbered_divider') {
          const number = block.content || '1';
          const bgColor = block.metadata?.bgColor || '#f97316';
          return `<div style="width: 100%; padding: 16px 0; position: relative;">
            <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
            <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 12px;">
              <div style="width: 32px; height: 32px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                ${number}
              </div>
            </div>
          </div>`;
        } else {
          // Simple divider
          return `<div style="width: 100%; padding: 16px 0;">
            <hr style="border: none; border-top: 2px solid #d1d5db; margin: 0;" />
          </div>`;
        }
      
      default:
        return `<div class="mb-4">${block.content || ''}</div>`;
    }
  }

  // Fallback methods
  getFallbackIntroduction(lessonTitle, moduleTitle, order) {
    return {
      id: `fallback-intro-${Date.now()}`,
      type: 'text',
      content: `Welcome to ${lessonTitle}! This lesson is part of ${moduleTitle} and will provide you with essential knowledge and practical skills.`,
      order,
      isAIGenerated: true
    };
  }

  getFallbackObjectives(lessonTitle, order) {
    return {
      id: `fallback-objectives-${Date.now()}`,
      type: 'list',
      content: `Understand the key concepts of ${lessonTitle}\nApply the knowledge in practical situations\nAnalyze different approaches and methods\nEvaluate the effectiveness of solutions`,
      listType: 'bullet',
      order,
      isAIGenerated: true
    };
  }

  getFallbackKeyConcepts(lessonTitle, startOrder) {
    return [
      {
        id: `fallback-concepts-heading-${Date.now()}`,
        type: 'heading',
        content: 'Key Concepts',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      },
      {
        id: `fallback-concepts-content-${Date.now()}`,
        type: 'text',
        content: `This section covers the fundamental concepts of ${lessonTitle}. These concepts form the foundation for understanding and applying the knowledge effectively.`,
        order: startOrder + 1,
        isAIGenerated: true
      }
    ];
  }

  getFallbackExamples(lessonTitle, startOrder) {
    return [
      {
        id: `fallback-examples-heading-${Date.now()}`,
        type: 'heading',
        content: 'Examples and Applications',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      },
      {
        id: `fallback-examples-content-${Date.now()}`,
        type: 'text',
        content: `Here are practical examples of how ${lessonTitle} can be applied in real-world scenarios.`,
        order: startOrder + 1,
        isAIGenerated: true
      }
    ];
  }

  getFallbackBestPractices(lessonTitle, startOrder) {
    return [
      {
        id: `fallback-practices-heading-${Date.now()}`,
        type: 'heading',
        content: 'Best Practices',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      },
      {
        id: `fallback-practices-content-${Date.now()}`,
        type: 'list',
        content: `Start with the basics and build gradually\nPractice regularly to reinforce learning\nSeek feedback from others\nStay curious and keep learning`,
        listType: 'bullet',
        order: startOrder + 1,
        isAIGenerated: true
      }
    ];
  }

  getFallbackAssessment(lessonTitle, startOrder) {
    return [
      {
        id: `fallback-assessment-heading-${Date.now()}`,
        type: 'heading',
        content: 'Reflection Questions',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      },
      {
        id: `fallback-assessment-content-${Date.now()}`,
        type: 'list',
        content: `What did you learn about ${lessonTitle}?\nHow can you apply this knowledge?\nWhat questions do you still have?\nHow does this relate to your goals?`,
        listType: 'ordered',
        order: startOrder + 1,
        isAIGenerated: true
      }
    ];
  }

  getFallbackSummary(lessonTitle, moduleTitle, startOrder) {
    return [
      {
        id: `fallback-summary-heading-${Date.now()}`,
        type: 'heading',
        content: 'Summary',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      },
      {
        id: `fallback-summary-content-${Date.now()}`,
        type: 'text',
        content: `This lesson on ${lessonTitle} has covered the essential concepts and practical applications. Continue practicing and exploring to deepen your understanding.`,
        order: startOrder + 1,
        isAIGenerated: true
      }
    ];
  }

  getFallbackOutline(lessonTitle, moduleTitle, startOrder) {
    return [
      {
        id: `fallback-outline-${Date.now()}`,
        type: 'text',
        content: `This lesson covers ${lessonTitle} as part of ${moduleTitle}. The content includes key concepts, practical applications, and important takeaways.`,
        order: startOrder,
        isAIGenerated: true
      }
    ];
  }

  generateFallbackContent(lessonTitle, moduleTitle) {
    return [
      {
        id: `fallback-${Date.now()}`,
        type: 'text',
        content: `This lesson covers ${lessonTitle} as part of ${moduleTitle}. The content will help you understand key concepts and apply them effectively.`,
        order: 0,
        isAIGenerated: true
      }
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
        generatedAt: new Date().toISOString()
      }
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
        generatedAt: new Date().toISOString()
      }
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
        generatedAt: new Date().toISOString()
      }
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
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  }

  /**
   * Helper function to create master heading blocks for page separation
   */
  createMasterHeading(title, order, gradientId = 'gradient1') {
    const gradients = {
      gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient2: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      gradient3: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      gradient4: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      gradient5: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      gradient6: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
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
        generatedAt: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
const universalAILessonService = new UniversalAILessonService();
export default universalAILessonService;
