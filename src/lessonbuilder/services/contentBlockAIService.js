import secureAIService from '../../services/secureAIService';
import devLogger from '@lessonbuilder/utils/devLogger';

/**
 * AI Service for generating content blocks with proper template formatting
 * Generates content that matches existing CSS templates exactly
 * Now uses secure backend APIs instead of direct OpenAI calls
 */
class ContentBlockAIService {
  constructor() {
    this.aiService = secureAIService;
    devLogger.debug(
      '✅ ContentBlockAIService initialized (using secure backend APIs)'
    );
  }

  /**
   * Main entry point for generating content blocks
   */
  async generateContentBlock({
    blockType,
    templateId,
    userPrompt,
    instructions = '',
    courseContext = {},
  }) {
    devLogger.debug(`🎯 Generating ${blockType} with template ${templateId}`);

    const context = this.buildContextPrompt(courseContext);

    switch (blockType) {
      case 'text':
        return await this.generateText(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'statement':
        return await this.generateStatement(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'quote':
        return await this.generateQuote(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'list':
        return await this.generateList(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'tables':
        return await this.generateTable(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'interactive':
        return await this.generateInteractive(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'divider':
        return await this.generateDivider(
          userPrompt,
          instructions,
          templateId,
          context
        );

      case 'image':
        return await this.generateImageBlock(
          userPrompt,
          instructions,
          templateId,
          context
        );

      default:
        throw new Error(`Unsupported block type: ${blockType}`);
    }
  }

  /**
   * Build context prompt from course/module/lesson info
   */
  buildContextPrompt(courseContext) {
    return `
COURSE CONTEXT:
- Course: ${courseContext.courseName || 'Not specified'}
- Module: ${courseContext.moduleName || 'Not specified'}
- Lesson: ${courseContext.lessonTitle || 'Not specified'}
- Description: ${courseContext.lessonDescription || 'Not specified'}
`;
  }

  /**
   * Clean markdown formatting from AI-generated content
   */
  /*
   * Remove common markdown artefacts from AI responses and return plain text
   */
  cleanMarkdown(text) {
    if (!text || typeof text !== 'string') return text;

    // Remove markdown bold (**text** or __text__)
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/__(.*?)__/g, '$1');

    // Remove markdown headers (##, ###, etc.)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    // Remove markdown italic (*text* or _text_)
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/_(.*?)_/g, '$1');

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`(.*?)`/g, '$1');

    // Remove markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // Remove markdown images ![alt](url)
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Safely parse AI JSON responses that may contain markdown code fences
   */
  safeParseJSON(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Empty response');
    }

    // Remove common markdown fences like ```json ... ``` or ```
    let cleaned = text
      .replace(/```json[\r\n]*/gi, '')
      .replace(/```/g, '')
      .trim();

    // Attempt direct parse first
    try {
      return JSON.parse(cleaned);
    } catch {
      // Extract first '{' and last '}' segment and try again
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        const candidate = cleaned.substring(first, last + 1);
        return JSON.parse(candidate);
      }
      // If still fails, throw original error
      throw new SyntaxError('Unable to parse AI JSON response');
    }
  }

  /**
   * Generate TEXT block content
   */
  async generateText(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Template Type: ${templateId}

Generate appropriate text content based on the template:
- heading: A clear, concise heading (5-10 words)
- master_heading: A bold, impactful heading (5-8 words)
- subheading: A descriptive subheading (8-15 words)
- paragraph: A well-written paragraph (100-200 words)
- heading_paragraph: A heading followed by a supporting paragraph
- subheading_paragraph: A subheading followed by explanatory paragraph

IMPORTANT: Return ONLY plain text content. Do NOT use markdown formatting like **bold**, ## headers, or any other markdown syntax. Use plain text only.`;

    const response = await this.callOpenAI(prompt, 500);
    const cleanedContent = this.cleanMarkdown(response.trim());

    return {
      type: 'text',
      textType: templateId,
      content: cleanedContent,
    };
  }

  /**
   * Generate STATEMENT block content
   */
  async generateStatement(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Template: ${templateId}

Generate a statement based on the template style:
- statement-a (Bordered Quote): A bold, memorable statement (20-40 words)
- statement-b (Elegant Quote): An elegant, inspiring statement (25-45 words)
- statement-c (Highlighted Text): A statement with 3-4 key phrases to highlight
- statement-d (Corner Border): A short, powerful statement (15-30 words)
- note: An informative note or tip (30-60 words)

For statement-c, mark words to highlight with ** like: **important word**

IMPORTANT: Return only plain text. Do NOT use markdown headers (##) or other markdown syntax except ** for statement-c highlights.`;

    const response = await this.callOpenAI(prompt, 300);
    // Only clean markdown headers, keep ** for statement-c highlights
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    return {
      type: 'statement',
      templateId: templateId,
      content: cleaned,
    };
  }

  /**
   * Generate QUOTE block content
   */
  async generateQuote(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Template: ${templateId}

Generate a quote based on the request. Return JSON format:
{
  "quote": "The actual quote text (15-50 words)",
  "author": "Author name or 'Anonymous'"
}

${templateId === 'quote_carousel' ? 'Generate 3 different related quotes in an array format.' : ''}

Return ONLY valid JSON, no other text.`;

    const response = await this.callOpenAI(prompt, 400);
    const quoteData = this.safeParseJSON(response);

    return {
      type: 'quote',
      templateId: templateId,
      content: JSON.stringify(quoteData),
    };
  }

  /**
   * Generate LIST block content
   */
  async generateList(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Generate a list with 5-10 items. Each item should be clear and concise (10-30 words per item).

Return JSON format:
{
  "items": [
    "First item with description",
    "Second item with details",
    ...
  ]
}

Return ONLY valid JSON, no other text.`;

    const response = await this.callOpenAI(prompt, 600);
    const listData = this.safeParseJSON(response);

    return {
      type: 'list',
      listType:
        templateId === 'numbered'
          ? 'numbered'
          : templateId === 'checklist' || templateId === 'checkbox'
            ? 'checkbox'
            : 'bulleted',
      content: JSON.stringify({
        items: listData.items,
        numberingStyle: 'decimal',
        bulletStyle: 'circle',
      }),
    };
  }

  /**
   * Generate TABLE block content
   */
  async generateTable(userPrompt, instructions, templateId, context) {
    const columnCount =
      templateId === 'two_columns' ? 2 : templateId === 'three_columns' ? 3 : 4;

    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Generate a table with ${columnCount} columns and 3-5 data rows.

Return JSON format:
{
  "headers": ["Header 1", "Header 2", ...],
  "data": [
    ["Cell 1", "Cell 2", ...],
    ["Cell 1", "Cell 2", ...],
    ...
  ]
}

Each cell should contain 5-30 words of relevant content.
Return ONLY valid JSON, no other text.`;

    const response = await this.callOpenAI(prompt, 800);
    const tableData = this.safeParseJSON(response);

    return {
      type: 'table',
      templateId: templateId,
      content: JSON.stringify({
        ...tableData,
        templateId: templateId,
        columns: tableData.headers.length,
        rows: tableData.data.length,
      }),
    };
  }

  /**
   * Generate INTERACTIVE block content
   */
  async generateInteractive(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Template: ${templateId}

Generate interactive content. Return JSON format:

For tabs/accordion (generate 3-5 sections):
{
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content (50-100 words)"
    },
    ...
  ]
}

For timeline (generate 3-5 events):
{
  "events": [
    {
      "date": "YYYY-MM-DD or descriptive date",
      "title": "Event title",
      "description": "Event description (30-60 words)"
    },
    ...
  ]
}

For process (generate 3-5 steps):
{
  "steps": [
    {
      "title": "Step title",
      "description": "Step description (40-80 words)"
    },
    ...
  ]
}

Return ONLY valid JSON, no other text.`;

    const response = await this.callOpenAI(prompt, 1000);
    const interactiveData = this.safeParseJSON(response);

    return {
      type: 'interactive',
      templateId: templateId,
      content: JSON.stringify(interactiveData),
    };
  }

  /**
   * Generate DIVIDER block content
   */
  async generateDivider(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}

Template: ${templateId}

For 'continue' divider: Return a short action text (1-2 words) like "CONTINUE", "NEXT", "PROCEED"
For 'numbered_divider': Return just a number
For others: Return "DIVIDER"

Return only the text, no JSON.`;

    const response = await this.callOpenAI(prompt, 50);

    return {
      type: 'divider',
      templateId: templateId,
      content: response.trim(),
    };
  }

  /**
   * Generate IMAGE block placeholder
   */
  async generateImageBlock(userPrompt, instructions, templateId, context) {
    const prompt = `${context}

USER REQUEST: ${userPrompt}
${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ''}

Generate descriptive text for an image block. Return JSON:
{
  "imageTitle": "Descriptive title for the image",
  "imageDescription": "What the image should show (detailed, 50-100 words)",
  "captionText": "Caption or accompanying text (30-60 words)"
}

Return ONLY valid JSON, no other text.`;

    const response = await this.callOpenAI(prompt, 400);
    const imageData = JSON.parse(response);

    return {
      type: 'image',
      templateId: templateId,
      content: JSON.stringify(imageData),
    };
  }

  /**
   * Call Backend AI API (secure)
   */
  async callOpenAI(prompt, maxTokens = 500) {
    try {
      devLogger.debug('🤖 Generating content via secure backend API...');

      const response = await this.aiService.generateText(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: maxTokens,
        temperature: 0.7,
        systemPrompt:
          'You are an expert educational content creator. Generate clear, concise, and engaging content for online courses. Always follow the exact format requested.',
        enhancePrompt: false, // No auto-enhancement for content blocks
      });

      devLogger.debug('✅ Content generated via backend API');
      return response.trim();
    } catch (error) {
      devLogger.error('❌ Backend AI API error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const contentBlockAIService = new ContentBlockAIService();
export default contentBlockAIService;
