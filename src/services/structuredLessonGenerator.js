import optimizedOpenAIService from './optimizedOpenAIService.js';
import { updateLessonContent } from './courseService.js';

/**
 * Structured Lesson Generator
 * Generates lessons with fixed 8-block structure using single user prompt
 */
const DEFAULT_IMAGE_OPTIONS = {
  size: '1024x1024',
  quality: 'standard',
  uploadToS3: true,
};

const IMAGE_FOLDERS = {
  left: 'ai-lesson-images/blocks/left',
  right: 'ai-lesson-images/blocks/right',
};

const IMAGE_PLACEHOLDER =
  'https://via.placeholder.com/600x400?text=Image+Placeholder';

function resolveImageResponse(result) {
  if (!result) {
    return { success: false, url: null, uploadedToS3: false };
  }

  const data = result.data || {};
  const primary =
    data.url || data.imageUrl || result.url || result.imageUrl || null;
  const fallback = data.originalUrl || result.originalUrl || null;

  return {
    success: result.success !== false,
    url: primary || fallback,
    originalUrl: fallback,
    uploadedToS3: data.uploadedToS3 ?? result.uploadedToS3 ?? false,
  };
}

class StructuredLessonGenerator {
  constructor() {
    this.gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    ];
  }

  /**
   * Extract context from user's single prompt
   */
  extractContext(courseData) {
    const topic = courseData.title || courseData.courseTitle || 'Course Topic';
    const description = courseData.description || '';
    const difficulty =
      courseData.difficulty || courseData.difficultyLevel || 'intermediate';

    return {
      topic,
      description,
      difficulty,
      subject: courseData.subject || topic,
      targetAudience: courseData.targetAudience || 'learners',
      // Extract keywords from title and description
      keywords: this.extractKeywords(`${topic} ${description}`),
    };
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const commonWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ];
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    return [...new Set(words)].slice(0, 5);
  }

  /**
   */
  async generateLesson(lessonId, courseData, onProgress = null, config = {}) {
    console.log(
      '🎯 Starting structured lesson generation for lesson:',
      lessonId
    );

    // Extract context from single user prompt
    const context = this.extractContext(courseData);
    console.log('📋 Extracted context:', context);

    // Check if images should be skipped (QUICK mode)
    const skipImages =
      config.skipImages || courseData.generationMode === 'QUICK';
    if (skipImages) {
      console.log('⚡ QUICK MODE: Skipping image generation for speed');
    }

    const blocks = [];
    const totalBlocks = skipImages ? 6 : 8; // 6 blocks without images, 8 with

    try {
      // Generate ALL blocks in parallel (OPTIMIZED - Phase 6: Ultra Parallel)
      onProgress?.({
        current: 1,
        total: totalBlocks,
        message: 'Generating all content blocks in parallel...',
      });

      // Generate blocks conditionally based on mode
      const blockPromises = [
        this.generateWithRetry(() => this.generateMasterHeading(context)),
        this.generateWithRetry(() => this.generateParagraph(context)),
        this.generateWithRetry(() => this.generateElegantQuote(context)),
        this.generateWithRetry(() => this.generateCarouselQuotes(context)),
        this.generateWithRetry(() => this.generateNumberedList(context)),
        this.generateWithRetry(() => this.generateTable(context)),
        Promise.resolve(this.generateDivider()), // Static, no async needed
      ];

      // Only add image generation if not in QUICK mode
      if (!skipImages) {
        blockPromises.splice(
          4,
          0,
          this.generateWithRetry(() => this.generateImageLeft(context)),
          this.generateWithRetry(() => this.generateImageRight(context))
        );
      }

      const generatedBlocks = await Promise.all(blockPromises);

      // Destructure based on mode
      let masterHeading,
        paragraph,
        elegantQuote,
        carouselQuotes,
        imageLeft,
        imageRight,
        numberedList,
        table,
        divider;

      if (skipImages) {
        [
          masterHeading,
          paragraph,
          elegantQuote,
          carouselQuotes,
          numberedList,
          table,
          divider,
        ] = generatedBlocks;
      } else {
        [
          masterHeading,
          paragraph,
          elegantQuote,
          carouselQuotes,
          imageLeft,
          imageRight,
          numberedList,
          table,
          divider,
        ] = generatedBlocks;
      }

      // Add all blocks in order
      blocks.push(masterHeading, paragraph, elegantQuote, carouselQuotes);

      if (!skipImages) {
        blocks.push(imageLeft, imageRight);
      }

      blocks.push(numberedList, table, divider);

      // Convert blocks to HTML
      const processedBlocks = blocks.map(block => ({
        ...block,
        html_css: block.html_css || this.convertBlockToHTML(block),
      }));

      // Save to backend
      onProgress?.({
        current: totalBlocks,
        total: totalBlocks,
        message: 'Saving lesson content...',
      });
      await this.saveAllBlocks(lessonId, processedBlocks);

      console.log(
        '✅ Lesson generated successfully with',
        blocks.length,
        'blocks'
      );
      return { success: true, blocks: processedBlocks };
    } catch (error) {
      console.error('❌ Lesson generation failed:', error);
      return {
        success: false,
        error: error.message,
        partialBlocks: blocks,
      };
    }
  }

  /**
   * Generate with retry logic
   */
  async generateWithRetry(generatorFn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await generatorFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.warn(`Retry ${i + 1}/${maxRetries}:`, error.message);
        await this.delay(1000 * (i + 1));
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Block 1: Master Heading with gradient
   */
  async generateMasterHeading(context) {
    const prompt = `Generate a compelling, professional lesson title for: "${context.topic}".
    
Requirements:
- Make it engaging and clear
- 5-10 words maximum
- Suitable for ${context.difficulty} level
- Return ONLY the title text, no quotes or extra formatting`;

    const content = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 50,
      temperature: 0.8,
    });

    // Remove surrounding quotes if present
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/^["'](.+)["']$/, '$1');

    const randomGradient =
      this.gradients[Math.floor(Math.random() * this.gradients.length)];

    return {
      id: `master-heading-${Date.now()}`,
      type: 'text',
      textType: 'master_heading',
      content: cleanedContent,
      gradient: `gradient${Math.floor(Math.random() * 6) + 1}`,
      order: 0,
      isAIGenerated: true,
      metadata: {
        variant: 'master_heading',
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Block 2: Introduction Paragraph
   */
  async generateParagraph(context) {
    const prompt = `Write an engaging introduction paragraph about "${context.topic}".

Requirements:
- 3-4 sentences
- Explain what the topic is and why it's important
- Target audience: ${context.targetAudience}
- Difficulty level: ${context.difficulty}
- Professional and informative tone
- Return ONLY the paragraph text`;

    const content = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.7,
    });

    // Remove surrounding quotes if present
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/^["'](.+)["']$/, '$1');

    return {
      id: `paragraph-${Date.now()}`,
      type: 'text',
      textType: 'paragraph',
      content: cleanedContent,
      order: 1,
      isAIGenerated: true,
      metadata: {
        variant: 'paragraph',
        aiGenerated: true,
      },
    };
  }

  /**
   * Block 3: Elegant Quote (statement-b)
   */
  async generateElegantQuote(context) {
    const prompt = `Create an inspiring, elegant quote about "${context.topic}".

Requirements:
- 1-2 sentences maximum
- Motivational and thought-provoking
- Professional tone
- Should emphasize the value or impact of the topic
- Return ONLY the quote text, no quotation marks`;

    const content = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 100,
      temperature: 0.8,
    });

    // Remove surrounding quotes if present
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/^["'](.+)["']$/, '$1');

    return {
      id: `statement-${Date.now()}`,
      type: 'statement',
      variant: 'statement-b',
      content: cleanedContent,
      order: 2,
      isAIGenerated: true,
      metadata: {
        variant: 'statement-b',
        style: 'elegant-quote',
        aiGenerated: true,
      },
    };
  }

  /**
   * Block 4: Carousel Quotes
   */
  async generateCarouselQuotes(context) {
    const prompt = `Generate 3 expert quotes about "${context.topic}".

Requirements:
- Each quote should be from a different perspective
- Include realistic expert names (can be fictional but sound professional)
- Each quote: 1-2 sentences
- Professional and insightful
- Format as JSON array: [{"quote": "...", "author": "Name", "title": "Title"}]`;

    const response = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 300,
      temperature: 0.8,
    });

    let quotes;
    try {
      quotes = JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      quotes = [
        {
          quote: `${context.topic} is transforming the way we work and learn.`,
          author: 'Expert 1',
          title: 'Industry Leader',
        },
        {
          quote: `Understanding ${context.topic} is essential for modern professionals.`,
          author: 'Expert 2',
          title: 'Specialist',
        },
        {
          quote: `The future belongs to those who master ${context.topic}.`,
          author: 'Expert 3',
          title: 'Thought Leader',
        },
      ];
    }

    return {
      id: `carousel-quotes-${Date.now()}`,
      type: 'quote',
      variant: 'quote_carousel',
      quotes: quotes,
      order: 3,
      isAIGenerated: true,
      metadata: {
        variant: 'carousel',
        quoteCount: quotes.length,
        aiGenerated: true,
      },
    };
  }

  /**
   * Block 5: Content Right + Image Left
   */
  async generateImageLeft(context) {
    const imagePromptText = `Create a professional, detailed infographic/flowchart image prompt showing key concepts of "${context.topic}".
    
Requirements:
- Design a structured, organized visual with clear hierarchy
- Show key concepts with flowchart or diagram elements
- Use professional colors, icons, and typography
- Include detailed information with proper spacing and layout
- Display labels, annotations, and key points clearly visible
- Modern, clean, professional style suitable for educational content
- Ensure all text is readable and well-organized
- Create a visually rich, information-dense design
- Return ONLY the image description`;

    const contentPrompt = `Write 2-3 sentences explaining a key concept about "${context.topic}".

Requirements:
- Clear and informative
- Complements a visual diagram or illustration
- Professional tone
- Return ONLY the text`;

    // OPTIMIZED: Generate image prompt and content text in parallel (Phase 1)
    const [imagePrompt, contentText] = await Promise.all([
      optimizedOpenAIService.generateText(imagePromptText, {
        maxTokens: 200,
        temperature: 0.8,
        systemPrompt:
          'You are an expert infographic designer. Create detailed, professional infographic prompts that emphasize structured layouts, clear hierarchies, readable text, flowcharts, diagrams, icons, and professional design principles. Make prompts specific about visual organization and information density.',
      }),
      optimizedOpenAIService.generateText(contentPrompt, {
        maxTokens: 150,
        temperature: 0.7,
      }),
    ]);

    // Generate AI image with DALL-E - Enhanced with 7-layer premium quality
    let imageUrl = IMAGE_PLACEHOLDER;
    let uploadedToS3 = false;
    let imageError = null;

    try {
      // Enhance prompt with infographic-specific quality system (OPTIMIZED: Simplified for speed)
      const enhancedPrompt = `Professional infographic/flowchart design: ${imagePrompt.trim()}, with clear, readable text labels, professional typography, clear visual hierarchy, organized sections, logical flow, professional icons, visual elements, color-coded sections, ultra-high resolution, 8K quality, crisp details, sharp text, modern professional design, premium color palette, clean spacing, information-rich, well-organized, detailed content. Clean white or light background, no watermarks, vivid colors, professional quality.`;

      console.log(
        '🎨 Generating AI image (left) with premium 7-layer enhancement:',
        enhancedPrompt.substring(0, 100) + '...'
      );
      const imageResult = await optimizedOpenAIService.generateImage(
        enhancedPrompt,
        {
          ...DEFAULT_IMAGE_OPTIONS,
          folder: IMAGE_FOLDERS.left,
        }
      );

      // Validate response
      if (!imageResult) {
        throw new Error('Image generation returned null response');
      }

      const resolved = resolveImageResponse(imageResult);

      if (!resolved.url) {
        throw new Error('Image generation returned no URL');
      }

      imageUrl = resolved.url;
      uploadedToS3 = resolved.uploadedToS3;

      // Validate URL is accessible
      try {
        const headResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
          console.warn(`⚠️ Image URL returned status ${headResponse.status}`);
          imageError = `Image URL not accessible (${headResponse.status})`;
          imageUrl = IMAGE_PLACEHOLDER;
        }
      } catch (urlError) {
        console.warn('⚠️ Could not validate image URL:', urlError.message);
        imageError = 'Image URL validation failed';
        imageUrl = IMAGE_PLACEHOLDER;
      }

      if (!uploadedToS3) {
        console.warn('⚠️ Left image not stored in S3, using OpenAI URL');
        imageError = 'Image not uploaded to S3';
      }
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
      imageError = error.message;
      imageUrl = IMAGE_PLACEHOLDER;
    }

    return {
      id: `image-left-${Date.now()}`,
      type: 'image',
      template: 'image-text',
      layout: 'side-by-side',
      title: `Visual guide for ${context.topic}`, // For editor header
      alignment: 'left', // Image on left, text on right
      imageUrl: imageUrl, // Root level for editor compatibility
      text: contentText.trim(),
      imageTitle: `Visual guide for ${context.topic}`,
      imageDescription: contentText.trim(),
      content: {
        imageUrl: imageUrl,
        text: contentText.trim(),
        caption: `Real-world example illustrating key concepts of ${context.topic}. ${contentText.trim().substring(0, 100)}...`,
        imagePosition: 'left',
      },
      order: 4,
      isAIGenerated: true,
      metadata: {
        variant: 'image-text-left',
        aiGenerated: true,
        imagePrompt: imagePrompt.trim(),
        uploadedToS3: uploadedToS3,
        imageError: imageError, // Track errors
      },
    };
  }

  /**
   * Block 6: Content Left + Image Right
   */
  async generateImageRight(context) {
    const imagePromptText = `Create a professional, detailed infographic/flowchart image prompt showing practical application of "${context.topic}".
    
Requirements:
- Design a structured, organized visual with clear hierarchy
- Show practical applications with flowchart or process diagram elements
- Use professional colors, icons, and typography
- Include detailed information with proper spacing and layout
- Display labels, annotations, and key points clearly visible
- Modern, clean, professional style suitable for educational content
- Ensure all text is readable and well-organized
- Create a visually rich, information-dense design
- Return ONLY the image description`;

    const contentPrompt = `Write 2-3 sentences about practical applications of "${context.topic}".

Requirements:
- Focus on real-world usage
- Clear examples
- Professional tone
- Return ONLY the text`;

    // OPTIMIZED: Generate image prompt and content text in parallel (Phase 1)
    const [imagePrompt, contentText] = await Promise.all([
      optimizedOpenAIService.generateText(imagePromptText, {
        maxTokens: 200,
        temperature: 0.8,
        systemPrompt:
          'You are an expert infographic designer. Create detailed, professional infographic prompts that emphasize structured layouts, clear hierarchies, readable text, flowcharts, diagrams, icons, and professional design principles. Make prompts specific about visual organization and information density.',
      }),
      optimizedOpenAIService.generateText(contentPrompt, {
        maxTokens: 150,
        temperature: 0.7,
      }),
    ]);

    let imageUrl = IMAGE_PLACEHOLDER;
    let uploadedToS3 = false;
    let imageError = null;

    try {
      // Enhance prompt with infographic-specific quality system (OPTIMIZED: Simplified for speed)
      const enhancedPrompt = `Professional infographic/flowchart design: ${imagePrompt.trim()}, with clear, readable text labels, professional typography, clear visual hierarchy, organized sections, logical flow, professional icons, visual elements, color-coded sections, ultra-high resolution, 8K quality, crisp details, sharp text, modern professional design, premium color palette, clean spacing, information-rich, well-organized, detailed content. Clean white or light background, no watermarks, vivid colors, professional quality.`;

      console.log(
        '🎨 Generating AI image (right) with infographic enhancement:',
        enhancedPrompt.substring(0, 100) + '...'
      );
      const imageResult = await optimizedOpenAIService.generateImage(
        enhancedPrompt,
        {
          ...DEFAULT_IMAGE_OPTIONS,
          folder: IMAGE_FOLDERS.right,
        }
      );

      // Validate response
      if (!imageResult) {
        throw new Error('Image generation returned null response');
      }

      const resolved = resolveImageResponse(imageResult);

      if (!resolved.url) {
        throw new Error('Image generation returned no URL');
      }

      imageUrl = resolved.url;
      uploadedToS3 = resolved.uploadedToS3;

      // Validate URL is accessible
      try {
        const headResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
          console.warn(`⚠️ Image URL returned status ${headResponse.status}`);
          imageError = `Image URL not accessible (${headResponse.status})`;
          imageUrl = IMAGE_PLACEHOLDER;
        }
      } catch (urlError) {
        console.warn('⚠️ Could not validate image URL:', urlError.message);
        imageError = 'Image URL validation failed';
        imageUrl = IMAGE_PLACEHOLDER;
      }

      if (!uploadedToS3) {
        console.warn('⚠️ Right image not stored in S3, using OpenAI URL');
        imageError = 'Image not uploaded to S3';
      }
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
      imageError = error.message;
      imageUrl = IMAGE_PLACEHOLDER;
    }

    return {
      id: `image-right-${Date.now()}`,
      type: 'image',
      template: 'image-text',
      layout: 'side-by-side',
      title: `Practical application of ${context.topic}`, // For editor header
      alignment: 'right', // Text on left, image on right
      imageUrl: imageUrl, // Root level for editor compatibility
      text: contentText.trim(),
      imageTitle: `Practical application of ${context.topic}`,
      imageDescription: contentText.trim(),
      content: {
        imageUrl: imageUrl,
        text: contentText.trim(),
        caption: `Real-world application demonstrating practical usage of ${context.topic}. ${contentText.trim().substring(0, 100)}...`,
        imagePosition: 'right',
      },
      order: 5,
      isAIGenerated: true,
      metadata: {
        variant: 'image-text-right',
        aiGenerated: true,
        imagePrompt: imagePrompt.trim(),
        uploadedToS3: uploadedToS3,
        imageError: imageError, // Track errors
      },
    };
  }

  /**
   * Block 7: Numbered List (Decimal)
   */
  async generateNumberedList(context) {
    const prompt = `Generate 5 key points or steps about "${context.topic}".

Requirements:
- Each point should be clear and actionable
- 1-2 sentences per point
- Logical order
- Professional tone
- Format as JSON array: ["Point 1", "Point 2", ...]`;

    const response = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 300,
      temperature: 0.7,
    });

    let items;
    try {
      items = JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      items = [
        `Understand the fundamentals of ${context.topic}`,
        `Learn practical applications and use cases`,
        `Master key concepts and terminology`,
        `Apply knowledge to real-world scenarios`,
        `Continue learning and staying updated`,
      ];
    }

    return {
      id: `list-${Date.now()}`,
      type: 'list',
      listType: 'numbered',
      numberingStyle: 'decimal',
      items: items,
      order: 6,
      isAIGenerated: true,
      metadata: {
        variant: 'numbered-decimal',
        itemCount: items.length,
        aiGenerated: true,
      },
    };
  }

  /**
   * Block 8: Table (Styled with headers)
   */
  async generateTable(context) {
    const prompt = `Create a comparison table about "${context.topic}".

Requirements:
- 3 columns: Concept, Description, Use Case
- 3-4 rows of data
- Clear and informative
- Format as JSON: {"headers": ["Col1", "Col2", "Col3"], "rows": [["cell1", "cell2", "cell3"], ...]}`;

    const response = await optimizedOpenAIService.generateText(prompt, {
      maxTokens: 400,
      temperature: 0.7,
    });

    let tableData;
    try {
      tableData = JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      tableData = {
        headers: ['Concept', 'Description', 'Use Case'],
        rows: [
          [
            'Fundamentals',
            `Core principles of ${context.topic}`,
            'Foundation building',
          ],
          [
            'Applications',
            `Practical uses of ${context.topic}`,
            'Real-world projects',
          ],
          [
            'Best Practices',
            `Recommended approaches for ${context.topic}`,
            'Professional work',
          ],
        ],
      };
    }

    return {
      id: `table-${Date.now()}`,
      type: 'table',
      variant: 'styled',
      headers: tableData.headers,
      rows: tableData.rows,
      order: 7,
      isAIGenerated: true,
      metadata: {
        variant: 'styled-with-headers',
        rowCount: tableData.rows.length,
        aiGenerated: true,
      },
    };
  }

  /**
   * Block 9: Simple Divider
   */
  generateDivider() {
    return {
      id: `divider-${Date.now()}`,
      type: 'divider',
      variant: 'simple',
      order: 8,
      metadata: {
        variant: 'simple',
      },
    };
  }

  /**
   * Convert block to HTML
   */
  convertBlockToHTML(block) {
    switch (block.type) {
      case 'text':
        return this.convertTextBlockToHTML(block);
      case 'statement':
        return this.convertStatementBlockToHTML(block);
      case 'quote':
        return this.convertQuoteBlockToHTML(block);
      case 'image':
        return this.convertImageBlockToHTML(block);
      case 'list':
        return this.convertListBlockToHTML(block);
      case 'table':
        return this.convertTableBlockToHTML(block);
      case 'divider':
        return this.convertDividerBlockToHTML(block);
      default:
        return `<div class="mb-4">${block.content || ''}</div>`;
    }
  }

  convertTextBlockToHTML(block) {
    const { textType, content, gradient } = block;

    const gradientMap = {
      gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient2:
        'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      gradient3: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      gradient4: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      gradient5: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      gradient6: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    };

    if (textType === 'master_heading') {
      const bgGradient = gradientMap[gradient] || gradientMap['gradient1'];
      return `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 24px 0; color: white; background: ${bgGradient}; padding: 20px; border-radius: 8px; text-align: center;">${content}</h1>`;
    }

    if (textType === 'paragraph') {
      return `<div style="margin: 16px 0; line-height: 1.6; color: #4b5563; font-size: 16px;"><p>${content}</p></div>`;
    }

    return `<div class="mb-4">${content}</div>`;
  }

  convertStatementBlockToHTML(block) {
    const { content, variant } = block;

    if (variant === 'statement-b') {
      return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 18px; font-weight: 500; line-height: 1.6;">${content}</div>`;
    }

    return `<div class="statement mb-4">${content}</div>`;
  }

  convertQuoteBlockToHTML(block) {
    const { quotes, variant } = block;

    if (variant === 'quote_carousel' && quotes) {
      const quotesHTML = quotes
        .map(
          q => `
        <div style="padding: 20px; border-left: 4px solid #3b82f6; background: #f3f4f6; margin: 16px 0; border-radius: 4px;">
          <p style="font-size: 18px; font-style: italic; color: #1f2937; margin-bottom: 12px;">"${q.quote}"</p>
          <p style="font-size: 14px; color: #6b7280; font-weight: 600;">— ${q.author}, ${q.title}</p>
        </div>
      `
        )
        .join('');
      return `<div class="quote-carousel">${quotesHTML}</div>`;
    }

    return `<div class="quote mb-4">${block.content || ''}</div>`;
  }

  convertImageBlockToHTML(block) {
    const { content, layout } = block;

    if (layout === 'side-by-side' && content) {
      const { imageUrl, text, imagePosition } = content;

      if (imagePosition === 'left') {
        return `<div style="display: flex; gap: 20px; align-items: center; margin: 24px 0;">
          <img src="${imageUrl}" style="width: 50%; border-radius: 8px; object-fit: cover;" alt="Lesson visual" />
          <div style="width: 50%; font-size: 16px; line-height: 1.6; color: #4b5563;">${text}</div>
        </div>`;
      } else {
        return `<div style="display: flex; gap: 20px; align-items: center; margin: 24px 0;">
          <div style="width: 50%; font-size: 16px; line-height: 1.6; color: #4b5563;">${text}</div>
          <img src="${imageUrl}" style="width: 50%; border-radius: 8px; object-fit: cover;" alt="Lesson visual" />
        </div>`;
      }
    }

    return `<img src="${content?.imageUrl || ''}" alt="Image" style="width: 100%; border-radius: 8px;" />`;
  }

  convertListBlockToHTML(block) {
    const { items, listType, numberingStyle } = block;

    if (!items || items.length === 0) return '';

    const listItems = items
      .map(item => `<li style="margin: 8px 0;">${item}</li>`)
      .join('');

    if (listType === 'numbered') {
      return `<ol style="list-style-type: ${numberingStyle || 'decimal'}; padding-left: 30px; margin: 20px 0; line-height: 1.8; color: #374151;">${listItems}</ol>`;
    }

    return `<ul style="list-style-type: disc; padding-left: 30px; margin: 20px 0;">${listItems}</ul>`;
  }

  convertTableBlockToHTML(block) {
    const { headers, rows } = block;

    if (!headers || !rows) return '';

    const headerHTML = headers
      .map(
        h =>
          `<th style="background: #3b82f6; color: white; padding: 12px; text-align: left; font-weight: 600;">${h}</th>`
      )
      .join('');

    const rowsHTML = rows
      .map(
        (row, i) => `
      <tr style="background: ${i % 2 === 0 ? '#f9fafb' : 'white'};">
        ${row.map(cell => `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`).join('')}
      </tr>
    `
      )
      .join('');

    return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <thead><tr>${headerHTML}</tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>`;
  }

  convertDividerBlockToHTML(block) {
    return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 32px 0;" />`;
  }

  /**
   * Save all blocks to backend
   */
  async saveAllBlocks(lessonId, blocks) {
    try {
      console.log(`💾 Saving ${blocks.length} blocks to lesson ${lessonId}`);

      // Convert blocks to backend format with details object
      const formattedBlocks = blocks.map((block, index) => {
        const baseBlock = {
          type: block.type,
          block_id: block.id || `block_${index + 1}`,
          html_css: block.html_css || this.convertBlockToHTML(block),
          order: block.order || index + 1,
        };

        // For image blocks, create details object
        if (block.type === 'image') {
          baseBlock.details = {
            image_url: block.imageUrl || block.content?.imageUrl || '',
            caption: block.text || block.imageDescription || '',
            alt_text: block.imageTitle || block.title || 'Image',
            layout: block.layout || 'side-by-side',
            alignment: block.alignment || 'left',
            template: block.template || 'image-text',
          };
          console.log(`📸 Formatting image block ${block.id}:`, {
            imageUrl: baseBlock.details.image_url,
            alignment: baseBlock.details.alignment,
            layout: baseBlock.details.layout,
          });
        }
        // For other block types, preserve content
        else if (block.content) {
          baseBlock.content =
            typeof block.content === 'string'
              ? block.content
              : JSON.stringify(block.content);
        }

        return baseBlock;
      });

      const lessonContent = {
        content: formattedBlocks,
        metadata: {
          aiGenerated: true,
          structuredLesson: true,
          generatedAt: new Date().toISOString(),
          totalBlocks: blocks.length,
        },
      };

      console.log('📤 Sending formatted blocks to backend:', {
        totalBlocks: formattedBlocks.length,
        imageBlocks: formattedBlocks.filter(b => b.type === 'image').length,
        imageUrls: formattedBlocks
          .filter(b => b.type === 'image')
          .map(b => ({ id: b.block_id, url: b.details?.image_url })),
      });

      const result = await updateLessonContent(lessonId, lessonContent);
      console.log('✅ Content saved successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to save content to lesson:', error);
      throw error;
    }
  }
}

export default new StructuredLessonGenerator();
