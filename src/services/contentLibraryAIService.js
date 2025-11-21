import {
  textTypes,
  gradientOptions,
} from '@lessonbuilder/constants/textTypesConfig';
import { imageTemplates } from '@lessonbuilder/constants/imageTemplates';
import { contentBlockTypes } from '@lessonbuilder/constants/blockTypes';
import openAIService from './openAIService';
import { uploadAIGeneratedImage } from './aiUploadService';

/**
 * Content Library AI Service - Uses ALL content library variants
 * Ensures every lesson uses each content type at least once
 */
class ContentLibraryAIService {
  constructor() {
    this.usedVariants = new Set();
  }

  /**
   * Get section focus based on lesson structure
   */
  getSectionFocus(sectionNumber, lessonTitle) {
    const focuses = [
      'Introduction and Overview',
      'Core Concepts and Definitions',
      'Key Principles and Theory',
      'Practical Applications',
      'Advanced Techniques',
      'Real-World Examples',
      'Best Practices and Tips',
      'Common Challenges and Solutions',
      'Summary and Review',
      'Next Steps and Resources',
    ];
    return focuses[sectionNumber - 1] || 'Additional Topics';
  }

  /**
   * Generate simplified lesson content: 10x (Master Heading + Description + Divider)
   * Used for quick course creation with progress display
   */
  async generateSimpleLessonContent(
    lessonTitle,
    moduleTitle,
    courseTitle,
    onProgress
  ) {
    console.log(
      '🎯 Generating simplified lesson: 10x (Heading + Description + Divider)'
    );

    const blocks = [];
    let order = 0;

    try {
      // Generate 10 sets of Master Heading + Description + Divider
      for (let i = 0; i < 10; i++) {
        const topicNumber = i + 1;
        const randomGradient =
          gradientOptions[Math.floor(Math.random() * gradientOptions.length)];

        // Topic prompt for OpenAI - more specific to avoid repetition
        const topicPrompt = `Generate a unique, concise topic title (3-5 words) for section ${topicNumber} of 10 in a lesson about "${lessonTitle}". 
        Section ${topicNumber} focus: ${this.getSectionFocus(topicNumber, lessonTitle)}
        Return ONLY the title text, no quotes, no numbering, no extra formatting.`;
        const topicTitle = await this.generateAIContent(topicPrompt, 10);

        // 1. Master Heading with gradient and html_css
        const gradientStyle =
          randomGradient.gradient ||
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        const headingBlock = {
          id: `heading-${topicNumber}-${Date.now()}-${Math.random()}`,
          type: 'text',
          textType: 'master_heading',
          content: topicTitle,
          gradient: randomGradient.id,
          html_css: `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 24px 0; color: white; background: ${gradientStyle}; padding: 20px; border-radius: 8px; text-align: center;">${topicTitle}</h1>`,
          order: order++,
          metadata: {
            variant: 'master_heading',
            gradient: randomGradient.name,
            section: topicNumber,
          },
        };
        blocks.push(headingBlock);

        // Notify progress
        if (onProgress) {
          onProgress({
            blockType: 'Master Heading',
            content: topicTitle,
            gradient: randomGradient.name,
            section: topicNumber,
            totalSections: 10,
          });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));

        // 2. Detailed Educational Description
        const descPrompt = `You are creating educational content for a professional online course.
        
        Course: "${courseTitle}"
        Module: "${moduleTitle}"  
        Lesson: "${lessonTitle}"
        
        For Section ${topicNumber}: "${topicTitle}" (Focus: ${this.getSectionFocus(topicNumber, lessonTitle)})
        
        Write a comprehensive 3-4 sentence educational description that:
        - Explains what students will learn in this specific section
        - Relates it to the overall lesson and module objectives
        - Uses professional, engaging language
        - Provides concrete learning outcomes or examples
        - Avoids generic phrases like "getting started" or "provides an introduction"
        
        Write ONLY the description text, no quotes, no titles.`;
        const description = await this.generateAIContent(descPrompt, 120);

        const descBlock = {
          id: `desc-${topicNumber}-${Date.now()}-${Math.random()}`,
          type: 'text',
          textType: 'paragraph',
          content: description,
          order: order++,
          metadata: {
            variant: 'description',
            section: topicNumber,
          },
        };
        blocks.push(descBlock);

        // Notify progress
        if (onProgress) {
          onProgress({
            blockType: 'Description',
            content: description.substring(0, 50) + '...',
            section: topicNumber,
            totalSections: 10,
          });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. Continue Divider - clickable button between sections
        const dividerBlock = {
          id: `divider-${topicNumber}-${Date.now()}-${Math.random()}`,
          type: 'divider',
          subtype: 'continue',
          content: 'CONTINUE',
          html_css: `<div style="width: 100%; padding: 24px 0;">
        <div style="background-color: #2563eb; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;" onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'">
          CONTINUE
        </div>
      </div>`,
          order: order++,
          metadata: {
            variant: 'continue',
            section: topicNumber,
          },
        };
        blocks.push(dividerBlock);

        // Notify progress
        if (onProgress) {
          onProgress({
            blockType: 'Continue Button',
            content: 'CONTINUE',
            section: topicNumber,
            totalSections: 10,
          });
        }

        // Small delay before next section
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Add final "COMPLETE" continue divider
      const completeDivider = {
        id: `divider-complete-${Date.now()}-${Math.random()}`,
        type: 'divider',
        subtype: 'continue',
        content: 'LESSON COMPLETE',
        html_css: `<div style="width: 100%; padding: 24px 0;">
        <div style="background-color: #10b981; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em; cursor: pointer; transition: background-color 0.2s; border: none;">
          LESSON COMPLETE
        </div>
      </div>`,
        order: order++,
        metadata: {
          variant: 'continue',
          type: 'completion',
        },
      };
      blocks.push(completeDivider);

      console.log(
        `✅ Generated ${blocks.length} content blocks (10 sections + completion divider)`
      );
      return blocks;
    } catch (error) {
      console.error('❌ Error generating simplified content:', error);
      return this.generateFallbackContent(lessonTitle);
    }
  }

  /**
   * Generate comprehensive lesson using ALL content library variants
   */
  async generateComprehensiveLessonContent(
    lessonTitle,
    moduleTitle,
    courseTitle
  ) {
    console.log('🎯 Generating lesson with ALL content library variants');

    const blocks = [];
    let order = 0;

    try {
      // 1. TEXT VARIANTS - Use all 6 types
      blocks.push(...(await this.generateAllTextVariants(lessonTitle, order)));
      order += 6;

      // 2. IMAGE VARIANTS - Use all 5 templates
      blocks.push(...(await this.generateAllImageVariants(lessonTitle, order)));
      order += 5;

      // 3. STATEMENT VARIANTS - Use all 5 types
      blocks.push(
        ...(await this.generateAllStatementVariants(lessonTitle, order))
      );
      order += 5;

      // 4. LIST VARIANTS - Use multiple numbering and bullet styles
      blocks.push(...(await this.generateAllListVariants(lessonTitle, order)));
      order += 11; // 5 numbering + 6 bullet styles

      // 5. QUOTE VARIANTS - Use quote templates
      blocks.push(...(await this.generateQuoteVariants(lessonTitle, order)));
      order += 3;

      // 6. OTHER CONTENT TYPES
      blocks.push(
        ...(await this.generateOtherContentTypes(lessonTitle, order))
      );

      console.log(
        `✅ Generated ${blocks.length} blocks using ALL content library variants`
      );
      return blocks;
    } catch (error) {
      console.error('❌ Error generating comprehensive content:', error);
      return this.generateFallbackContent(lessonTitle);
    }
  }

  /**
   * Generate all 6 text variants
   */
  async generateAllTextVariants(lessonTitle, startOrder) {
    const blocks = [];

    // 1. Master Heading with random gradient
    const randomGradient =
      gradientOptions[Math.floor(Math.random() * gradientOptions.length)];
    blocks.push({
      id: `text-master-${Date.now()}`,
      type: 'text',
      textType: 'master_heading',
      content: lessonTitle,
      gradient: randomGradient.id,
      order: startOrder,
      metadata: { variant: 'master_heading', gradient: randomGradient.name },
    });

    // 2. Standard Heading
    blocks.push({
      id: `text-heading-${Date.now()}`,
      type: 'text',
      textType: 'heading',
      content: 'Key Concepts',
      order: startOrder + 1,
      metadata: { variant: 'heading' },
    });

    // 3. Subheading
    blocks.push({
      id: `text-subheading-${Date.now()}`,
      type: 'text',
      textType: 'subheading',
      content: 'Learning Objectives',
      order: startOrder + 2,
      metadata: { variant: 'subheading' },
    });

    // 4. Paragraph
    const paragraphContent = await this.generateAIContent(
      `Write a comprehensive paragraph about ${lessonTitle}`,
      150
    );
    blocks.push({
      id: `text-paragraph-${Date.now()}`,
      type: 'text',
      textType: 'paragraph',
      content: paragraphContent,
      order: startOrder + 3,
      metadata: { variant: 'paragraph' },
    });

    // 5. Heading + Paragraph
    const headingParagraphContent = await this.generateAIContent(
      `Write content for ${lessonTitle} with heading and explanation`,
      200
    );
    blocks.push({
      id: `text-heading-para-${Date.now()}`,
      type: 'text',
      textType: 'heading_paragraph',
      content: `<h2>Understanding ${lessonTitle}</h2><p>${headingParagraphContent}</p>`,
      order: startOrder + 4,
      metadata: { variant: 'heading_paragraph' },
    });

    // 6. Subheading + Paragraph
    const subheadingParagraphContent = await this.generateAIContent(
      `Write detailed explanation about ${lessonTitle}`,
      180
    );
    blocks.push({
      id: `text-subheading-para-${Date.now()}`,
      type: 'text',
      textType: 'subheading_paragraph',
      content: `<h3>Practical Applications</h3><p>${subheadingParagraphContent}</p>`,
      order: startOrder + 5,
      metadata: { variant: 'subheading_paragraph' },
    });

    return blocks;
  }

  /**
   * Generate all 5 image variants
   */
  async generateAllImageVariants(lessonTitle, startOrder) {
    const blocks = [];

    for (let i = 0; i < imageTemplates.length; i++) {
      const template = imageTemplates[i];
      let imageUrl = '';
      let textContent = '';

      if (template.id === 'ai-generated') {
        // Generate AI image and upload to S3
        try {
          const prompt = `Create an educational illustration for ${lessonTitle}`;
          console.log(`🎨 Generating AI image: ${prompt}`);
          const imageResult = await openAIService.generateImage(prompt);
          const tempImageUrl = imageResult.url || imageResult.imageUrl;

          if (tempImageUrl) {
            console.log(`✅ AI image generated: ${tempImageUrl}`);

            // Upload to S3 using the same logic as course thumbnails
            try {
              console.log('📤 Uploading AI image to S3...');
              const uploadResult = await uploadAIGeneratedImage(tempImageUrl, {
                public: true,
                folder: 'ai-lesson-images',
              });

              if (uploadResult.success && uploadResult.imageUrl) {
                imageUrl = uploadResult.imageUrl;
                console.log(`✅ AI image uploaded to S3: ${imageUrl}`);
              } else {
                imageUrl = tempImageUrl; // Fallback to original URL
                console.warn('⚠️ S3 upload failed, using temporary URL');
              }
            } catch (uploadError) {
              imageUrl = tempImageUrl; // Fallback to original URL
              console.error('❌ S3 upload error:', uploadError);
            }
          } else {
            throw new Error('No image URL returned from AI service');
          }
        } catch (error) {
          console.error('❌ AI image generation failed:', error);
          imageUrl =
            'https://via.placeholder.com/800x400?text=AI+Generated+Image';
        }
        textContent = `AI generated illustration for ${lessonTitle}`;
      } else {
        imageUrl = template.defaultContent.imageUrl;
        textContent = template.defaultContent.text;
      }

      blocks.push({
        id: `image-${template.id}-${Date.now()}`,
        type: 'image',
        template: template.id,
        layout: template.layout,
        content: {
          imageUrl: imageUrl,
          text: textContent,
          caption: `${template.title} example for ${lessonTitle}`,
        },
        order: startOrder + i,
        metadata: { variant: template.id, layout: template.layout },
      });
    }

    return blocks;
  }

  /**
   * Generate all 5 statement variants
   */
  async generateAllStatementVariants(lessonTitle, startOrder) {
    const blocks = [];
    const statementTypes = [
      'statement-a',
      'statement-b',
      'statement-c',
      'statement-d',
      'note',
    ];

    for (let i = 0; i < statementTypes.length; i++) {
      const statementType = statementTypes[i];
      const content = await this.generateAIContent(
        `Create an important statement or key insight about ${lessonTitle}`,
        100
      );

      blocks.push({
        id: `statement-${statementType}-${Date.now()}`,
        type: 'statement',
        statementType: statementType,
        content: content,
        order: startOrder + i,
        metadata: { variant: statementType },
      });
    }

    return blocks;
  }

  /**
   * Generate all list variants (5 numbering + 6 bullet styles)
   */
  async generateAllListVariants(lessonTitle, startOrder) {
    const blocks = [];
    let currentOrder = startOrder;

    // Numbering styles
    const numberingStyles = [
      'decimal',
      'upper-roman',
      'lower-roman',
      'upper-alpha',
      'lower-alpha',
    ];
    for (let i = 0; i < numberingStyles.length; i++) {
      const items = await this.generateListItems(lessonTitle, 'numbered');
      blocks.push({
        id: `list-numbered-${numberingStyles[i]}-${Date.now()}`,
        type: 'list',
        listType: 'numbered',
        numberingStyle: numberingStyles[i],
        items: items,
        order: currentOrder++,
        metadata: { variant: `numbered-${numberingStyles[i]}` },
      });
    }

    // Bullet styles
    const bulletStyles = [
      'circle',
      'square',
      'disc',
      'arrow',
      'star',
      'diamond',
    ];
    for (let i = 0; i < bulletStyles.length; i++) {
      const items = await this.generateListItems(lessonTitle, 'bulleted');
      blocks.push({
        id: `list-bulleted-${bulletStyles[i]}-${Date.now()}`,
        type: 'list',
        listType: 'bulleted',
        bulletStyle: bulletStyles[i],
        items: items,
        order: currentOrder++,
        metadata: { variant: `bulleted-${bulletStyles[i]}` },
      });
    }

    return blocks;
  }

  /**
   * Generate quote variants
   */
  async generateQuoteVariants(lessonTitle, startOrder) {
    const blocks = [];

    // Simple quote
    const quoteContent = await this.generateAIContent(
      `Create an inspiring quote related to ${lessonTitle}`,
      80
    );
    blocks.push({
      id: `quote-simple-${Date.now()}`,
      type: 'quote',
      content: quoteContent,
      author: 'Expert',
      order: startOrder,
      metadata: { variant: 'simple-quote' },
    });

    // Quote with background
    blocks.push({
      id: `quote-background-${Date.now()}`,
      type: 'quote',
      content: quoteContent,
      author: 'Industry Leader',
      backgroundImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      order: startOrder + 1,
      metadata: { variant: 'background-quote' },
    });

    // Carousel quotes
    const carouselQuotes = [];
    for (let i = 0; i < 3; i++) {
      const content = await this.generateAIContent(
        `Create quote ${i + 1} about ${lessonTitle}`,
        60
      );
      carouselQuotes.push({ quote: content, author: `Expert ${i + 1}` });
    }

    blocks.push({
      id: `quote-carousel-${Date.now()}`,
      type: 'quote',
      subtype: 'carousel',
      quotes: carouselQuotes,
      order: startOrder + 2,
      metadata: { variant: 'carousel-quotes' },
    });

    return blocks;
  }

  /**
   * Generate other content types
   */
  async generateOtherContentTypes(lessonTitle, startOrder) {
    const blocks = [];

    // Table
    blocks.push({
      id: `table-${Date.now()}`,
      type: 'table',
      content: {
        headers: ['Concept', 'Definition', 'Example'],
        rows: [
          ['Key Point 1', 'Explanation 1', 'Example 1'],
          ['Key Point 2', 'Explanation 2', 'Example 2'],
          ['Key Point 3', 'Explanation 3', 'Example 3'],
        ],
      },
      order: startOrder,
      metadata: { variant: 'data-table' },
    });

    // Checklist
    blocks.push({
      id: `checklist-${Date.now()}`,
      type: 'checklist',
      items: [
        'Complete the reading assignment',
        'Practice the key concepts',
        'Review the examples',
        'Take the quiz',
      ],
      order: startOrder + 1,
      metadata: { variant: 'task-checklist' },
    });

    // Link
    blocks.push({
      id: `link-${Date.now()}`,
      type: 'link',
      content: {
        url: 'https://example.com',
        title: `Additional Resources for ${lessonTitle}`,
        description: 'Explore more about this topic',
      },
      order: startOrder + 2,
      metadata: { variant: 'external-link' },
    });

    return blocks;
  }

  /**
   * Generate AI content using OpenAI
   */
  async generateAIContent(prompt, maxWords = 100) {
    try {
      console.log(`🤖 Generating AI content: ${prompt}`);
      const result = await openAIService.generateText(prompt, {
        maxTokens: maxWords * 2,
        temperature: 0.7,
      });

      // openAIService.generateText returns a string directly
      if (typeof result === 'string' && result.trim()) {
        // Remove surrounding quotes if present
        let cleanedResult = result.trim();
        cleanedResult = cleanedResult.replace(/^["'](.+)["']$/, '$1');

        console.log(
          `✅ AI content generated: ${cleanedResult.substring(0, 50)}...`
        );
        return cleanedResult;
      }

      console.warn('⚠️ AI content generation returned empty result');
      return `Generated content about ${prompt.toLowerCase()}`;
    } catch (error) {
      console.error('❌ AI content generation failed:', error);
      return `Content about ${prompt.toLowerCase()}`;
    }
  }

  /**
   * Generate list items
   */
  async generateListItems(lessonTitle, type) {
    const items = [];
    const prompts = [
      `Key benefit of ${lessonTitle}`,
      `Important aspect of ${lessonTitle}`,
      `Practical application of ${lessonTitle}`,
      `Essential concept in ${lessonTitle}`,
    ];

    for (const prompt of prompts) {
      const content = await this.generateAIContent(prompt, 20);
      items.push(content);
    }

    return items;
  }

  /**
   * Fallback content if AI generation fails
   */
  generateFallbackContent(lessonTitle) {
    return [
      {
        id: `fallback-${Date.now()}`,
        type: 'text',
        textType: 'master_heading',
        content: lessonTitle,
        gradient: 'gradient1',
        order: 0,
      },
      {
        id: `fallback-content-${Date.now()}`,
        type: 'text',
        textType: 'paragraph',
        content: `This lesson covers the essential concepts of ${lessonTitle}.`,
        order: 1,
      },
    ];
  }
}

export default new ContentLibraryAIService();
