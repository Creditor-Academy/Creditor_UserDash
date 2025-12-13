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
      {
        id: 'quiz',
        title: 'Quiz',
        description: 'Multiple choice quiz questions with answers',
      },
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
 * Auto-detect block type from content structure
 */
function detectBlockTypeFromContent(aiResponse, requestedBlockType) {
  // If blockType is explicitly set and valid, use it
  if (requestedBlockType && requestedBlockType !== 'text') {
    return requestedBlockType;
  }

  const content = aiResponse.content || '';

  // Check for table structure (JSON with headers and data)
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        // Check if it's a table structure
        if (
          parsed.headers &&
          Array.isArray(parsed.headers) &&
          parsed.data &&
          Array.isArray(parsed.data)
        ) {
          return 'tables';
        }
        // Check if it's a list structure
        if (parsed.items && Array.isArray(parsed.items)) {
          return 'list';
        }
        // Check if it's a quote structure
        if (parsed.quote || parsed.text || parsed.author) {
          return 'quote';
        }
      }
    } catch (e) {
      // Not JSON, continue checking
    }
  } else if (content && typeof content === 'object') {
    // Check if it's a table structure (object)
    if (
      content.headers &&
      Array.isArray(content.headers) &&
      content.data &&
      Array.isArray(content.data)
    ) {
      return 'tables';
    }
    // Check if it's a list structure
    if (content.items && Array.isArray(content.items)) {
      return 'list';
    }
    // Check if it's a quote structure
    if (content.quote || content.text || content.author) {
      return 'quote';
    }
  }

  // Check for image content
  if (
    aiResponse.imageUrl ||
    aiResponse.url ||
    (content &&
      typeof content === 'object' &&
      (content.imageUrl || content.url))
  ) {
    return 'image';
  }

  // Default to requested type or text
  return requestedBlockType || 'text';
}

/**
 * Format AI-generated content to match block structure
 */
export function formatAIContentForBlock(aiResponse, blockType) {
  const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Auto-detect block type from content if not explicitly set or if it's text
  const detectedBlockType = detectBlockTypeFromContent(aiResponse, blockType);

  // Use detected type if it's more specific than the requested type
  const finalBlockType =
    detectedBlockType !== 'text' && blockType === 'text'
      ? detectedBlockType
      : blockType || detectedBlockType;

  const baseBlock = {
    id: blockId,
    block_id: blockId,
    type: finalBlockType,
    order: Date.now(),
  };

  switch (finalBlockType) {
    case 'text': {
      const textType =
        aiResponse.textType ||
        aiResponse.templateId ||
        aiResponse.template ||
        'paragraph';

      // Clean markdown from content
      let cleanedContent = aiResponse.content || '';
      if (typeof cleanedContent === 'string') {
        // Remove markdown formatting
        cleanedContent = cleanedContent.replace(/\*\*(.*?)\*\*/g, '$1');
        cleanedContent = cleanedContent.replace(/^#{1,6}\s+/gm, '');
        cleanedContent = cleanedContent.replace(/\*(.*?)\*/g, '$1');
        cleanedContent = cleanedContent.replace(/__(.*?)__/g, '$1');
        cleanedContent = cleanedContent.trim();
      }

      const htmlContent = generateTextHTML(textType, cleanedContent);

      return {
        ...baseBlock,
        textType,
        content: cleanedContent,
        text: cleanedContent,
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
        html_css: generateListHTML(listContent, aiResponse.listType),
      };
    }

    case 'tables':
      // Parse table content and generate HTML
      let tableHtml = '';
      try {
        const tableData =
          typeof aiResponse.content === 'string'
            ? JSON.parse(aiResponse.content)
            : aiResponse.content;

        const templateId = aiResponse.templateId || 'responsive_table';

        // Generate HTML using the same logic as TableComponent
        if (templateId === 'two_columns' || templateId === 'three_columns') {
          const colClass =
            tableData.columns === 2
              ? 'md:grid-cols-2'
              : tableData.columns === 3
                ? 'md:grid-cols-3'
                : `md:grid-cols-${tableData.columns || 2}`;
          tableHtml = `
            <div class="grid ${colClass} gap-8">
              ${(tableData.data && tableData.data[0]
                ? tableData.data[0]
                : tableData.headers || []
              )
                .map(
                  (content, index) => `
              <div class="group relative p-6 rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 min-h-fit">
                <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg"></div>
                <div class="flex items-start mb-2">
                  <div class="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  <h3 class="font-bold text-lg text-gray-900 break-words leading-tight">${tableData.headers && tableData.headers[index] ? tableData.headers[index] : `Column ${index + 1}`}</h3>
                </div>
                <div class="text-gray-700 leading-relaxed text-base break-words whitespace-pre-wrap overflow-wrap-anywhere">${content || ''}</div>
              </div>
            `
                )
                .join('')}
            </div>
          `;
        } else {
          tableHtml = `
            <div class="relative">
              <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm table-scrollbar">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      ${(tableData.headers || [])
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
                        ${(row || [])
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
      } catch (e) {
        console.error('Error generating table HTML:', e);
        tableHtml = `<div class="p-4 border border-gray-200 rounded-lg bg-gray-50"><p class="text-gray-500 text-sm">Table content</p></div>`;
      }

      return {
        ...baseBlock,
        type: 'table', // Always use 'table' (singular) for consistency
        textType: 'table',
        tableType: aiResponse.templateId || 'responsive_table',
        templateId: aiResponse.templateId || 'responsive_table',
        content:
          typeof aiResponse.content === 'string'
            ? aiResponse.content
            : JSON.stringify(aiResponse.content),
        html_css: tableHtml, // Generate HTML immediately
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

      // Extract image URL - prioritize S3 URL if available, otherwise use OpenAI URL
      let imageUrl =
        aiResponse.data?.url || // Backend returns S3 URL in data.url if uploaded
        aiResponse.url || // Fallback to direct URL
        imageContent?.imageUrl ||
        imageContent?.url ||
        '';

      // Check if URL is already an S3 URL
      const isS3Url =
        imageUrl.includes('s3.amazonaws.com') ||
        imageUrl.includes('.s3.') ||
        imageUrl.includes('amazonaws.com');

      // Check if URL is from OpenAI (temporary, needs S3 upload)
      const isOpenAIUrl =
        imageUrl.includes('oaidalleapiprodscus') ||
        imageUrl.includes('dalle') ||
        (imageUrl.startsWith('https://') &&
          !isS3Url &&
          imageUrl.includes('openai'));

      // If it's an OpenAI URL and not already uploaded to S3, mark it for upload
      const needsS3Upload = isOpenAIUrl && !isS3Url;

      devLogger.debug('Image URL analysis:', {
        imageUrl,
        isS3Url,
        isOpenAIUrl,
        needsS3Upload,
        uploadedToS3: aiResponse.data?.uploadedToS3 || aiResponse.uploadedToS3,
      });

      const {
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
        // Store metadata about S3 upload status
        needsS3Upload, // Flag to indicate if image needs S3 upload
        originalImageUrl: isOpenAIUrl ? imageUrl : undefined, // Store original OpenAI URL if needed
        uploadedToS3:
          aiResponse.data?.uploadedToS3 || aiResponse.uploadedToS3 || isS3Url,
        details: {
          ...(aiResponse.details || {}),
          image_url: imageUrl,
          caption: captionText || imageDescription || '',
          caption_html: textHtml,
          alt_text: imageTitle,
          layout: template?.layout || 'centered',
          template: templateId,
          alignment,
          uploadedToS3:
            aiResponse.data?.uploadedToS3 || aiResponse.uploadedToS3 || isS3Url,
          needsS3Upload, // Store flag in details too
        },
      };

      block.html_css = generateImageHTML(block);
      return block;
    }

    default:
      // For unknown block types, try to preserve the type and content
      devLogger.warn(`Unknown block type: ${finalBlockType}, preserving as-is`);
      return {
        ...baseBlock,
        content:
          typeof aiResponse.content === 'string'
            ? aiResponse.content
            : JSON.stringify(aiResponse.content || {}),
        html_css: aiResponse.html_css || '',
      };
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
      // Handle heading_paragraph with proper heading and content separation
      const lines = trimmed.split('\n').filter(Boolean);
      const headingLine = lines[0] || 'Heading';
      const bodyLines = lines.slice(1);

      // If no separate heading provided, use the first line as heading
      const body =
        bodyLines.length > 0
          ? bodyLines
              .map(
                p =>
                  `<p class="text-base text-gray-700 leading-relaxed mb-3">${p.trim()}</p>`
              )
              .join('')
          : lines.length > 1
            ? lines
                .slice(1)
                .map(
                  p =>
                    `<p class="text-base text-gray-700 leading-relaxed mb-3">${p.trim()}</p>`
                )
                .join('')
            : '';

      return `<div class="space-y-3">
        <h2 class="text-2xl font-bold text-gray-900 leading-tight">${headingLine}</h2>
        ${body || '<p class="text-base text-gray-700 leading-relaxed">Content goes here...</p>'}
      </div>`;
    }

    case 'subheading_paragraph': {
      // Handle subheading_paragraph with proper subheading and content separation
      const lines = trimmed.split('\n').filter(Boolean);
      const subheadingLine = lines[0] || 'Subheading';
      const bodyLines = lines.slice(1);

      // Preserve line breaks in body content
      const body =
        bodyLines.length > 0
          ? bodyLines
              .map(
                p =>
                  `<p class="text-base text-gray-700 leading-relaxed mb-3">${p.trim()}</p>`
              )
              .join('')
          : lines.length > 1
            ? lines
                .slice(1)
                .map(
                  p =>
                    `<p class="text-base text-gray-700 leading-relaxed mb-3">${p.trim()}</p>`
                )
                .join('')
            : '';

      return `<div class="space-y-3">
        <h3 class="text-xl font-semibold text-gray-800 leading-snug">${subheadingLine}</h3>
        ${body || '<p class="text-base text-gray-700 leading-relaxed">Content goes here...</p>'}
      </div>`;
    }

    case 'paragraph':
    default:
      // Preserve line breaks in paragraph content
      if (trimmed.includes('\n')) {
        const paragraphs = trimmed.split('\n').filter(p => p.trim());
        return paragraphs
          .map(
            p =>
              `<p class="text-base text-gray-700 leading-relaxed mb-3">${p.trim()}</p>`
          )
          .join('');
      }
      return `<p class="text-base text-gray-700 leading-relaxed">${trimmed}</p>`;
  }
}

export function generateImageHTML(block) {
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
// Generate styled HTML for list blocks to match template previews
function generateListHTML(listContent = {}, listType = 'bulleted') {
  const items = Array.isArray(listContent.items) ? listContent.items : [];
  const numberingStyle = listContent.numberingStyle || 'decimal';

  // Helper for numbering symbols used in fancy template
  const getNumbering = (index, style) => {
    const num = index + 1;
    switch (style) {
      case 'upper-roman':
        return toRoman(num).toUpperCase();
      case 'lower-roman':
        return toRoman(num).toLowerCase();
      case 'upper-alpha':
        return String.fromCharCode(64 + num);
      case 'lower-alpha':
        return String.fromCharCode(96 + num);
      default:
        return num.toString();
    }
  };

  const toRoman = num => {
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
  };

  if (listType === 'numbered') {
    return `
      <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
        <ol class="space-y-4 list-none">
          ${items
            .map(
              (item, index) => `
            <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                ${getNumbering(index, numberingStyle)}
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

  if (listType === 'checkbox') {
    return `
      <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
        <div class="space-y-4">
          ${items
            .map(
              (item, index) => `
            <div class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200">
              <div class="flex-shrink-0 mt-1">
                <div class="w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center">
                  <span class="w-3 h-3 bg-pink-500 rounded-sm opacity-0"></span>
                </div>
              </div>
              <div class="checkbox-text flex-1 text-gray-800 leading-relaxed">
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

  // Default bulleted list with fancy bullets
  const getBullet = () => {
    return `<div class="flex-shrink-0 mt-2 w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow"></div>`;
  };

  return `
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
      <ul class="space-y-4 list-none">
        ${items
          .map(
            item => `
          <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
            ${getBullet()}
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
