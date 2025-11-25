// Unified AI Content Service - Specialized for Block Editor Integration
import enhancedAIService from './enhancedAIService';
import apiKeyManager from './apiKeyManager';

/**
 * Specialized AI service for unified block editor
 * Provides context-aware content generation and smart suggestions
 */
class UnifiedAIContentService {
  constructor() {
    this.enhancedAI = enhancedAIService;
    this.apiKeyManager = apiKeyManager;

    // Content templates for different block types
    this.contentTemplates = {
      text: {
        introduction:
          'Create an engaging introduction that hooks the reader and sets up the main topic',
        explanation:
          'Provide a clear, detailed explanation of the concept with examples',
        conclusion: 'Summarize the key points and provide actionable takeaways',
      },
      heading: {
        section: 'Create a clear, descriptive section heading',
        chapter: 'Generate an engaging chapter title',
        topic: 'Create a focused topic heading',
      },
      list: {
        objectives: 'Create 3-5 clear learning objectives',
        keyPoints: 'List the most important points to remember',
        steps: 'Break down the process into clear, actionable steps',
        benefits: 'List the key benefits or advantages',
      },
      quote: {
        insight: 'Create an insightful quote that reinforces the main concept',
        tip: 'Provide a practical tip or best practice',
        warning: 'Highlight an important warning or consideration',
      },
    };
  }

  /**
   * Generate contextual content based on lesson and existing blocks
   */
  async generateContextualContent(
    lessonTitle,
    existingBlocks,
    blockType,
    customPrompt = ''
  ) {
    try {
      const context = this.buildLessonContext(lessonTitle, existingBlocks);
      const prompt = customPrompt || this.buildSmartPrompt(blockType, context);

      console.log(`🎯 Generating ${blockType} content with context:`, {
        lessonTitle,
        blockCount: existingBlocks.length,
      });

      const result = await this.enhancedAI.generateText(prompt, {
        maxTokens: this.getTokenLimitForType(blockType),
        temperature: 0.7,
        context: context,
      });

      if (result.success) {
        return {
          success: true,
          content: this.formatContentForBlock(blockType, result.content),
          metadata: {
            generated: true,
            timestamp: new Date().toISOString(),
            blockType,
            context: context.summary,
          },
        };
      } else {
        return this.generateFallbackContent(blockType, lessonTitle);
      }
    } catch (error) {
      console.error('Contextual content generation failed:', error);
      return this.generateFallbackContent(blockType, lessonTitle);
    }
  }

  /**
   * Generate smart suggestions based on lesson progress
   */
  async generateSmartSuggestions(
    lessonTitle,
    existingBlocks,
    maxSuggestions = 3
  ) {
    try {
      const context = this.buildLessonContext(lessonTitle, existingBlocks);
      const missingElements = this.identifyMissingElements(existingBlocks);

      const suggestions = [];

      // Prioritize missing essential elements
      for (const element of missingElements.slice(0, maxSuggestions)) {
        const suggestion = await this.generateSuggestionForElement(
          element,
          context
        );
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }

      // Fill remaining slots with contextual suggestions
      while (suggestions.length < maxSuggestions) {
        const contextualSuggestion = this.generateContextualSuggestion(
          context,
          suggestions
        );
        if (contextualSuggestion) {
          suggestions.push(contextualSuggestion);
        } else {
          break;
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Smart suggestions generation failed:', error);
      return this.getFallbackSuggestions(lessonTitle);
    }
  }

  /**
   * Enhance existing block content with AI
   */
  async enhanceBlockContent(block, enhancementType = 'improve') {
    try {
      const prompts = {
        improve: `Improve this ${block.type} content to make it more engaging and educational: "${block.content}"`,
        expand: `Expand this ${block.type} content with more details and examples: "${block.content}"`,
        simplify: `Simplify this ${block.type} content to make it easier to understand: "${block.content}"`,
        examples: `Add practical examples to this ${block.type} content: "${block.content}"`,
      };

      const prompt = prompts[enhancementType] || prompts.improve;

      const result = await this.enhancedAI.generateText(prompt, {
        maxTokens: this.getTokenLimitForType(block.type),
        temperature: 0.6,
      });

      if (result.success) {
        return {
          success: true,
          content: this.formatContentForBlock(block.type, result.content),
          enhancementType,
          original: block.content,
        };
      } else {
        return { success: false, error: 'Enhancement failed' };
      }
    } catch (error) {
      console.error('Block enhancement failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate content outline for entire lesson
   */
  async generateLessonOutline(lessonTitle, learningObjectives = []) {
    try {
      const prompt = `Create a structured lesson outline for "${lessonTitle}" with the following learning objectives: ${learningObjectives.join(', ')}. 
      Return a JSON array of content blocks with: type, title, description, estimatedLength`;

      const result = await this.enhancedAI.generateText(prompt, {
        maxTokens: 600,
        temperature: 0.7,
      });

      if (result.success) {
        try {
          const outline = JSON.parse(result.content);
          return {
            success: true,
            outline: outline.map((block, index) => ({
              ...block,
              id: `outline-${Date.now()}-${index}`,
              order: index + 1,
            })),
          };
        } catch (parseError) {
          return this.generateFallbackOutline(lessonTitle);
        }
      } else {
        return this.generateFallbackOutline(lessonTitle);
      }
    } catch (error) {
      console.error('Lesson outline generation failed:', error);
      return this.generateFallbackOutline(lessonTitle);
    }
  }

  /**
   * Build lesson context from existing content
   */
  buildLessonContext(lessonTitle, existingBlocks) {
    const blockTypes = existingBlocks.map(b => b.type);
    const contentLength = existingBlocks.reduce(
      (acc, b) => acc + (b.content?.length || 0),
      0
    );

    return {
      title: lessonTitle,
      blockCount: existingBlocks.length,
      blockTypes: [...new Set(blockTypes)],
      contentLength,
      hasIntroduction:
        blockTypes.includes('text') && existingBlocks[0]?.type === 'text',
      hasObjectives: blockTypes.includes('list'),
      hasConclusion:
        blockTypes.includes('text') &&
        existingBlocks[existingBlocks.length - 1]?.type === 'text',
      summary: `Lesson "${lessonTitle}" with ${existingBlocks.length} blocks (${blockTypes.join(', ')})`,
    };
  }

  /**
   * Build smart prompt based on context
   */
  buildSmartPrompt(blockType, context) {
    const basePrompts = {
      text: `Write educational content for the lesson "${context.title}".`,
      heading: `Create a clear section heading for the lesson "${context.title}".`,
      list: `Create a structured list for the lesson "${context.title}".`,
      quote: `Create an important note or insight for the lesson "${context.title}".`,
    };

    let prompt = basePrompts[blockType] || basePrompts.text;

    // Add context-specific guidance
    if (!context.hasIntroduction && blockType === 'text') {
      prompt +=
        ' Focus on creating an engaging introduction that hooks the reader.';
    } else if (!context.hasObjectives && blockType === 'list') {
      prompt += ' Focus on learning objectives or key points.';
    } else if (context.blockCount > 5 && blockType === 'text') {
      prompt += ' Focus on a conclusion that summarizes key takeaways.';
    }

    return (
      prompt +
      ' Keep it educational, engaging, and appropriate for the lesson context.'
    );
  }

  /**
   * Identify missing essential elements
   */
  identifyMissingElements(existingBlocks) {
    const blockTypes = existingBlocks.map(b => b.type);
    const missing = [];

    if (!blockTypes.includes('text') || existingBlocks.length === 0) {
      missing.push({ type: 'text', priority: 'high', reason: 'introduction' });
    }

    if (!blockTypes.includes('list')) {
      missing.push({ type: 'list', priority: 'medium', reason: 'objectives' });
    }

    if (!blockTypes.includes('quote') && existingBlocks.length > 2) {
      missing.push({ type: 'quote', priority: 'low', reason: 'emphasis' });
    }

    return missing.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate suggestion for specific element
   */
  async generateSuggestionForElement(element, context) {
    const suggestions = {
      introduction: {
        type: 'text',
        title: 'Introduction',
        description: 'Engaging lesson introduction',
        icon: 'type',
      },
      objectives: {
        type: 'list',
        title: 'Learning Objectives',
        description: 'Key learning goals',
        icon: 'list',
      },
      emphasis: {
        type: 'quote',
        title: 'Key Insight',
        description: 'Important point to remember',
        icon: 'quote',
      },
    };

    return suggestions[element.reason] || null;
  }

  /**
   * Format content based on block type
   */
  formatContentForBlock(blockType, content) {
    switch (blockType) {
      case 'text':
        return content.startsWith('<p>') ? content : `<p>${content}</p>`;
      case 'heading':
        return content.startsWith('<h') ? content : `<h2>${content}</h2>`;
      case 'list':
        if (content.includes('•') || content.includes('-')) {
          return content;
        }
        const items = content.split('\n').filter(item => item.trim());
        return items.map(item => `• ${item.trim()}`).join('\n');
      case 'quote':
        return content.startsWith('"') ? content : `"${content}"`;
      default:
        return content;
    }
  }

  /**
   * Get appropriate token limit for block type
   */
  getTokenLimitForType(blockType) {
    const limits = {
      text: 400,
      heading: 50,
      list: 200,
      quote: 100,
      image: 50,
      video: 100,
    };
    return limits[blockType] || 300;
  }

  /**
   * Generate fallback content when AI fails
   */
  generateFallbackContent(blockType, lessonTitle) {
    const fallbacks = {
      text: `This section covers important concepts related to ${lessonTitle}. Add your content here to explain the key ideas and provide examples that help students understand the material.`,
      heading: `${lessonTitle} - Key Concepts`,
      list: `• Key point about ${lessonTitle}\n• Important concept to remember\n• Practical application example`,
      quote: `"Remember: Understanding ${lessonTitle} is essential for your learning journey."`,
    };

    return {
      success: true,
      content: this.formatContentForBlock(
        blockType,
        fallbacks[blockType] || fallbacks.text
      ),
      metadata: {
        generated: true,
        fallback: true,
        timestamp: new Date().toISOString(),
        blockType,
      },
    };
  }

  /**
   * Generate fallback suggestions
   */
  getFallbackSuggestions(lessonTitle) {
    return [
      {
        type: 'text',
        title: 'Introduction',
        description: 'Add an engaging introduction',
        content: `Introduction to ${lessonTitle}`,
      },
      {
        type: 'list',
        title: 'Key Points',
        description: 'List important concepts',
        content: `Key concepts for ${lessonTitle}`,
      },
      {
        type: 'quote',
        title: 'Important Note',
        description: 'Highlight key information',
        content: `Important insight about ${lessonTitle}`,
      },
    ];
  }

  /**
   * Generate fallback lesson outline
   */
  generateFallbackOutline(lessonTitle) {
    return {
      success: true,
      outline: [
        {
          type: 'heading',
          title: 'Introduction',
          description: 'Lesson overview',
          estimatedLength: 'short',
        },
        {
          type: 'text',
          title: 'Main Content',
          description: 'Core concepts',
          estimatedLength: 'medium',
        },
        {
          type: 'list',
          title: 'Key Points',
          description: 'Important takeaways',
          estimatedLength: 'short',
        },
        {
          type: 'quote',
          title: 'Summary',
          description: 'Final thoughts',
          estimatedLength: 'short',
        },
      ].map((block, index) => ({
        ...block,
        id: `fallback-${Date.now()}-${index}`,
        order: index + 1,
      })),
    };
  }

  /**
   * Generate contextual suggestion based on existing content
   */
  generateContextualSuggestion(context, existingSuggestions) {
    const usedTypes = existingSuggestions.map(s => s.type);
    const availableTypes = ['text', 'list', 'quote', 'heading'].filter(
      t => !usedTypes.includes(t)
    );

    if (availableTypes.length === 0) return null;

    const type = availableTypes[0];
    const suggestions = {
      text: { title: 'Additional Content', description: 'Expand on the topic' },
      list: { title: 'Summary Points', description: 'Key takeaways' },
      quote: { title: 'Important Note', description: 'Highlight key concept' },
      heading: { title: 'Section Header', description: 'Organize content' },
    };

    return {
      type,
      ...suggestions[type],
      content: `Content for ${context.title}`,
    };
  }
}

// Export singleton instance
const unifiedAIContentService = new UnifiedAIContentService();
export default unifiedAIContentService;
