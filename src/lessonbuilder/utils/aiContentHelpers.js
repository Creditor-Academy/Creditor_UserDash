/**
 * Helper functions for AI content generation
 * Maps block types to their available templates and provides utility functions
 */

import { textTypes, gradientOptions } from '../constants/textTypesConfig';
import { imageTemplates } from '../constants/imageTemplates';
import devLogger from './devLogger';

/**
 * Get available templates for a specific block type
 */
export function getTemplatesForBlockType(blockType) {
  const templateMap = {
    text: textTypes.map(t => ({
      id: t.id,
      title: t.title,
      description: `${t.title} text block`,
    })),

    statement: [
      {
        id: 'statement-a',
        title: 'Bordered Quote',
        description: 'Border top/bottom styling',
      },
      {
        id: 'statement-b',
        title: 'Elegant Quote',
        description: 'Gradient accents with shadows',
      },
      {
        id: 'statement-c',
        title: 'Highlighted Text',
        description: 'Background highlights on key words',
      },
      {
        id: 'statement-d',
        title: 'Corner Border Quote',
        description: 'Corner accent styling',
      },
      {
        id: 'note',
        title: 'Note',
        description: 'Info icon with colored background',
      },
    ],

    quote: [
      {
        id: 'quote_a',
        title: 'Quote A',
        description: 'Elegant quote with decorative borders',
      },
      {
        id: 'quote_b',
        title: 'Quote B',
        description: 'Clean minimalist with large text',
      },
      {
        id: 'quote_c',
        title: 'Quote C',
        description: 'Quote with author image',
      },
      {
        id: 'quote_d',
        title: 'Quote D',
        description: 'Sophisticated typography',
      },
      {
        id: 'quote_on_image',
        title: 'Quote on Image',
        description: 'Quote overlay on background',
      },
      {
        id: 'quote_carousel',
        title: 'Quote Carousel',
        description: 'Multiple quotes carousel',
      },
    ],

    image: [
      {
        id: 'image-text',
        title: 'Image & Text',
        description: 'Side-by-side layout',
      },
      {
        id: 'text-on-image',
        title: 'Text on Image',
        description: 'Text overlay on image',
      },
      {
        id: 'image-centered',
        title: 'Image Centered',
        description: 'Centered with caption',
      },
      {
        id: 'image-full-width',
        title: 'Image Full Width',
        description: 'Full width with text below',
      },
    ],

    list: [
      {
        id: 'bulleted',
        title: 'Bulleted List',
        description: 'List with bullet points',
      },
      {
        id: 'numbered',
        title: 'Numbered List',
        description: 'Numbered list (1, 2, 3...)',
      },
      {
        id: 'checklist',
        title: 'Checklist',
        description: 'Interactive checkbox list',
      },
    ],

    tables: [
      {
        id: 'two_columns',
        title: 'Two Columns',
        description: 'Side-by-side layout',
      },
      {
        id: 'three_columns',
        title: 'Three Columns',
        description: 'Balanced three-column layout',
      },
      {
        id: 'responsive_table',
        title: 'Responsive Table',
        description: 'Fully responsive table',
      },
    ],

    interactive: [
      { id: 'tabs', title: 'Tabs', description: 'Tabbed content sections' },
      {
        id: 'accordion',
        title: 'Accordion',
        description: 'Collapsible sections',
      },
      {
        id: 'labeled_graphic',
        title: 'Labeled Graphic',
        description: 'Interactive image hotspots',
      },
      {
        id: 'timeline',
        title: 'Timeline',
        description: 'Chronological timeline',
      },
      { id: 'process', title: 'Process', description: 'Step-by-step process' },
    ],

    divider: [
      {
        id: 'continue',
        title: 'Continue Button',
        description: 'Continue button divider',
      },
      {
        id: 'divider',
        title: 'Simple Divider',
        description: 'Horizontal line',
      },
      {
        id: 'numbered_divider',
        title: 'Numbered Divider',
        description: 'Divider with number',
      },
      { id: 'spacer', title: 'Spacer', description: 'Blank space divider' },
    ],

    video: [],
    audio: [],
    youtube: [],
    link: [],
    pdf: [],
  };

  return templateMap[blockType] || [];
}

/**
 * Check if a block type supports AI generation
 */
export function supportsAIGeneration(blockType) {
  const supportedTypes = [
    'text',
    'statement',
    'quote',
    'list',
    'tables',
    'interactive',
    'divider',
    'image',
  ];
  return supportedTypes.includes(blockType);
}

/**
 * Get course context from lesson data
 */
export function getCourseContext(lessonData, lessonContent) {
  return {
    courseName: lessonContent?.data?.course?.title || 'Course',
    courseDescription: lessonContent?.data?.course?.description || '',
    moduleName: lessonContent?.data?.module?.title || 'Module',
    moduleDescription: lessonContent?.data?.module?.description || '',
    lessonTitle:
      lessonData?.title || lessonContent?.data?.lesson?.title || 'Lesson',
    lessonDescription:
      lessonData?.description || lessonContent?.data?.lesson?.description || '',
    lessonOrder: lessonData?.order || lessonContent?.data?.lesson?.order || 1,
  };
}

/**
 * Format AI-generated content to match block structure
 */
export function formatAIContentForBlock(aiResponse, blockType) {
  const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const baseBlock = {
    id: blockId,
    block_id: blockId,
    type: blockType,
    order: Date.now(),
  };

  switch (blockType) {
    case 'text': {
      const textType =
        aiResponse.textType ||
        aiResponse.templateId ||
        aiResponse.template ||
        'paragraph';
      const htmlContent = generateTextHTML(textType, aiResponse.content);

      return {
        ...baseBlock,
        textType,
        content: aiResponse.content,
        text: aiResponse.content,
        html_css: htmlContent,
        metadata: {
          ...(aiResponse.metadata || {}),
          variant: textType,
        },
      };
    }

    case 'statement':
      return {
        ...baseBlock,
        textType: aiResponse.templateId,
        content: aiResponse.content,
        html_css: generateStatementHTML(
          aiResponse.content,
          aiResponse.templateId
        ),
      };

    case 'quote':
      return {
        ...baseBlock,
        textType: aiResponse.templateId,
        content: aiResponse.content,
        html_css: generateQuoteHTML(
          JSON.parse(aiResponse.content),
          aiResponse.templateId
        ),
      };

    case 'list': {
      const listContent = JSON.parse(aiResponse.content);
      return {
        ...baseBlock,
        textType: 'list',
        listType: aiResponse.listType,
        content: aiResponse.content,
        items: listContent.items,
        html_css: generateListHTML(listContent),
      };
    }

    case 'tables':
      return {
        ...baseBlock,
        textType: 'table',
        tableType: aiResponse.templateId,
        templateId: aiResponse.templateId,
        content: aiResponse.content,
        html_css: '', // Will be generated by TableComponent
      };

    case 'interactive':
      return {
        ...baseBlock,
        textType: 'interactive',
        interactiveType: aiResponse.templateId,
        content: aiResponse.content,
        html_css: '', // Will be generated by InteractiveComponent
      };

    case 'divider':
      return {
        ...baseBlock,
        textType: 'divider',
        dividerType: aiResponse.templateId,
        content: aiResponse.content,
        html_css: generateDividerHTML(
          aiResponse.content,
          aiResponse.templateId
        ),
      };

    case 'image': {
      const templateId =
        aiResponse.templateId || aiResponse.template || 'image-centered';
      let imageContent = aiResponse.content;

      if (typeof imageContent === 'string') {
        try {
          imageContent = JSON.parse(imageContent);
        } catch (error) {
          devLogger.warn('Failed to parse AI image content JSON:', error);
          imageContent = {};
        }
      }

      const {
        imageUrl = imageContent?.imageUrl || imageContent?.url || '',
        imageTitle = imageContent?.imageTitle || imageContent?.title || '',
        imageDescription = imageContent?.imageDescription ||
          imageContent?.description ||
          imageContent?.caption ||
          '',
        captionText = imageContent?.captionText ||
          imageContent?.caption ||
          imageContent?.text ||
          '',
        alignment = imageContent?.alignment || 'center',
      } = imageContent || {};

      const template =
        imageTemplates.find(t => t.id === templateId) ||
        imageTemplates.find(t => t.id === 'image-centered');

      const textHtml = captionText
        ? `<p>${captionText}</p>`
        : imageDescription
          ? `<p>${imageDescription}</p>`
          : '';

      const block = {
        ...baseBlock,
        type: 'image',
        title: imageTitle,
        layout: template?.layout || 'centered',
        templateType: templateId,
        alignment,
        imageUrl,
        imageTitle,
        imageDescription: imageDescription || captionText || '',
        text: textHtml,
        details: {
          ...(aiResponse.details || {}),
          image_url: imageUrl,
          caption: captionText || imageDescription || '',
          caption_html: textHtml,
          alt_text: imageTitle,
          layout: template?.layout || 'centered',
          template: templateId,
          alignment,
        },
      };

      block.html_css = generateImageHTML(block);
      return block;
    }

    default:
      return baseBlock;
  }
}

function generateTextHTML(textType, content = '') {
  const trimmed = typeof content === 'string' ? content.trim() : '';

  switch (textType) {
    case 'master_heading': {
      const gradient =
        gradientOptions?.[0]?.gradient ||
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

      return `<div class="rounded-xl p-6 text-white font-extrabold text-3xl leading-tight tracking-tight text-center" style="background:${gradient}">
        ${trimmed}
      </div>`;
    }

    case 'heading':
      return `<h2 class="text-2xl font-bold text-gray-900 leading-tight">${trimmed}</h2>`;

    case 'subheading':
      return `<h3 class="text-xl font-semibold text-gray-800 leading-snug">${trimmed}</h3>`;

    case 'heading_paragraph': {
      const [headingLine, ...rest] = trimmed.split('\n').filter(Boolean);
      const body = rest.join('\n').trim() || trimmed;

      return `<div class="space-y-3">
        <h2 class="text-2xl font-bold text-gray-900 leading-tight">${
          headingLine || 'Heading'
        }</h2>
        <p class="text-base text-gray-700 leading-relaxed">${body}</p>
      </div>`;
    }

    case 'subheading_paragraph': {
      const [headingLine, ...rest] = trimmed.split('\n').filter(Boolean);
      const body = rest.join('\n').trim() || trimmed;

      return `<div class="space-y-3">
        <h3 class="text-xl font-semibold text-gray-800 leading-snug">${
          headingLine || 'Subheading'
        }</h3>
        <p class="text-base text-gray-700 leading-relaxed">${body}</p>
      </div>`;
    }

    case 'paragraph':
    default:
      return `<p class="text-base text-gray-700 leading-relaxed">${trimmed}</p>`;
  }
}

function generateImageHTML(block) {
  const layout = block.layout || 'centered';
  const textContent = (block.text || block.details?.caption_html || '').trim();
  const fallbackText = block.imageDescription || block.details?.caption || '';
  const renderedText =
    textContent || (fallbackText ? `<p>${fallbackText}</p>` : '');
  const imageUrl = block.imageUrl || block.details?.image_url || '';
  const imageTitle = block.imageTitle || block.details?.alt_text || 'Image';
  const alignment = block.alignment || block.details?.alignment || 'center';

  if (!imageUrl) return '';

  if (layout === 'side-by-side') {
    const imageFirst = alignment !== 'right';
    const imageOrder = imageFirst ? 'order-1' : 'order-2';
    const textOrder = imageFirst ? 'order-2' : 'order-1';

    return `
      <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
        <div class="${imageOrder}">
          <img src="${imageUrl}" alt="${imageTitle}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
        </div>
        <div class="${textOrder} text-gray-700 text-lg leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          ${renderedText}
        </div>
      </div>
    `;
  }

  if (layout === 'overlay') {
    return `
      <div class="relative rounded-xl overflow-hidden">
        <img src="${imageUrl}" alt="${imageTitle}" class="w-full h-96 object-cover" />
        ${
          renderedText
            ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
                <div class="text-white p-8 w-full text-xl font-medium leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                  ${renderedText}
                </div>
              </div>`
            : ''
        }
      </div>
    `;
  }

  if (layout === 'full-width') {
    return `
      <div class="space-y-3">
        <img src="${imageUrl}" alt="${imageTitle}" class="w-full max-h-[28rem] object-contain rounded" />
        ${
          renderedText
            ? `<div class="text-sm text-gray-600 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                ${renderedText}
              </div>`
            : ''
        }
      </div>
    `;
  }

  let alignmentClass = 'text-center';
  if (alignment === 'left') alignmentClass = 'text-left';
  if (alignment === 'right') alignmentClass = 'text-right';

  const mxAuto = alignment === 'center' ? 'mx-auto' : '';

  return `
    <div class="${alignmentClass}">
      <img src="${imageUrl}" alt="${imageTitle}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg ${mxAuto}" />
      ${
        renderedText
          ? `<div class="text-gray-600 mt-4 italic text-lg leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
              ${renderedText}
            </div>`
          : ''
      }
    </div>
  `;
}

/**
 * Generate HTML for statement blocks
 */
function generateStatementHTML(content, templateId) {
  switch (templateId) {
    case 'statement-a':
      return `<div class="border-t border-b border-gray-800 py-8 px-6">
        <p class="text-gray-900 text-2xl leading-relaxed text-center font-bold">${content}</p>
      </div>`;

    case 'statement-b':
      return `<div class="relative pt-8 pb-8 px-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        <p class="text-gray-800 text-3xl leading-relaxed text-center font-light">${content}</p>
      </div>`;

    case 'statement-c':
      const highlightedContent = content.replace(
        /\*\*(.*?)\*\*/g,
        '<span class="font-bold text-gray-900 bg-orange-100 px-1 rounded">$1</span>'
      );
      return `<div class="bg-gradient-to-r from-gray-50 to-gray-100 py-8 px-6 border-l-4 border-orange-500">
        <p class="text-gray-700 text-xl leading-relaxed">${highlightedContent}</p>
      </div>`;

    case 'statement-d':
      return `<div class="relative bg-white py-6 px-6">
        <div class="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
        <p class="text-gray-900 text-lg leading-relaxed font-bold">${content}</p>
      </div>`;

    case 'note':
      return `<div class="border border-orange-300 bg-orange-50 p-4 rounded">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 mt-1">
            <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-gray-800 text-sm leading-relaxed">${content}</p>
          </div>
        </div>
      </div>`;

    default:
      return `<p>${content}</p>`;
  }
}

/**
 * Generate HTML for quote blocks (basic version)
 */
function generateQuoteHTML(quoteData, templateId) {
  return `<blockquote class="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700">
    "${quoteData.quote}"
    <footer class="text-sm text-gray-500 mt-2">— ${quoteData.author}</footer>
  </blockquote>`;
}

/**
 * Generate HTML for list blocks
 */
function generateListHTML(listContent) {
  const items = listContent.items.map(item => `<li>${item}</li>`).join('\n');
  return `<ul class="list-disc pl-6 space-y-2">\n${items}\n</ul>`;
}

/**
 * Generate HTML for divider blocks
 */
function generateDividerHTML(content, templateId) {
  switch (templateId) {
    case 'continue':
      return `<div class="w-full py-6">
        <div class="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-8 font-semibold text-lg tracking-wide cursor-pointer transition-colors">
          ${content}
        </div>
      </div>`;

    case 'numbered_divider':
      return `<div class="w-full py-4 relative">
        <hr class="border-gray-300 border-t-2" />
        <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
          <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ${content}
          </div>
        </div>
      </div>`;

    default:
      return `<div class="w-full py-4"><hr class="border-gray-300 border-t-2" /></div>`;
  }
}
