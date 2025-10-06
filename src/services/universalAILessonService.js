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
      throw error;
    }
  }

  /**
   * Generate structured content blocks for lesson
   */
  async generateContentBlocks({ lessonTitle, moduleTitle, courseTitle, options }) {
    const blocks = [];
    let blockOrder = 0;

    try {
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

        // Practical Examples Section
        if (options.includeExamples !== false) {
          const examplesBlocks = await this.generateExamplesSection(lessonTitle, blockOrder);
          blocks.push(...examplesBlocks);
          blockOrder += examplesBlocks.length;
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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.7
      });

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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6
      });

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
      // Heading
      blocks.push({
        id: `ai-concepts-heading-${Date.now()}`,
        type: 'heading',
        content: 'Key Concepts and Principles',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      });

      // Content
      const prompt = `Explain the key concepts and fundamental principles of "${lessonTitle}". Provide clear definitions and explanations that are easy to understand. Include the most important concepts that students need to master.`;
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.7
      });

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
      blocks.push({
        id: `ai-examples-heading-${Date.now()}`,
        type: 'heading',
        content: 'Practical Applications and Examples',
        level: 2,
        order: startOrder,
        isAIGenerated: true
      });

      const prompt = `Provide 3-4 practical examples or real-world applications of "${lessonTitle}". Make them relevant, specific, and easy to understand. Show how the concepts apply in different contexts.`;
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 350,
        temperature: 0.8
      });

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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.6
      });

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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 250,
        temperature: 0.7
      });

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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.6
      });

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
      
      const content = await this.aiService.generateText(prompt, {
        maxTokens: 400,
        temperature: 0.6
      });

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
    return {
      blocks: blocks.map(block => ({
        ...block,
        html_css: this.convertBlockToHTML(block)
      })),
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
    switch (block.type) {
      case 'heading':
        const level = block.level || 2;
        return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-4">${block.content}</h${level}>`;
      
      case 'text':
        return `<div class="prose max-w-none mb-4"><p>${block.content}</p></div>`;
      
      case 'list':
        const listTag = block.listType === 'ordered' ? 'ol' : 'ul';
        const items = block.content.split('\n').filter(item => item.trim());
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return `<${listTag} class="list-${block.listType === 'ordered' ? 'decimal' : 'disc'} ml-6 mb-4">${listItems}</${listTag}>`;
      
      case 'quote':
        return `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">"${block.content}"${block.author ? ` <cite>- ${block.author}</cite>` : ''}</blockquote>`;
      
      default:
        return `<div class="mb-4">${block.content}</div>`;
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
}

// Export singleton instance
const universalAILessonService = new UniversalAILessonService();
export default universalAILessonService;
