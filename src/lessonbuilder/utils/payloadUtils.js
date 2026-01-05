import { textTypes } from '@lessonbuilder/constants/textTypesConfig';

export const convertBlocksToHtml = blocks => {
  return blocks.map(block => {
    let html = '';
    let css = '';
    let js = '';

    if (block.type === 'text') {
      const textType = textTypes.find(t => t.id === block.textType);
      const style = block.style || textType?.style || {};
      const styleString = Object.entries(style)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      html = `<div class="lesson-block text-block" style="${styleString}">${block.content}</div>`;
    } else if (block.type === 'image') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        const imageUrl = block.imageUrl || block.details?.image_url || '';
        const layout = block.layout || block.details?.layout || 'centered';
        const captionHtml = (
          block.text ||
          block.details?.caption_html ||
          ''
        ).toString();
        const captionPlain = (
          block.imageDescription ||
          block.details?.caption ||
          ''
        ).toString();
        const caption = captionHtml.trim() ? captionHtml : captionPlain;
        const title = block.imageTitle || block.details?.alt_text || 'Image';
        if (layout === 'side-by-side') {
          const alignment = block.alignment || 'left';
          const imageFirst = alignment === 'left';
          const imageOrder = imageFirst ? 'order-1' : 'order-2';
          const textOrder = imageFirst ? 'order-2' : 'order-1';

          html = `
              <div class="lesson-image side-by-side">
                <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                  <div class="${imageOrder}">
                    <img src="${imageUrl}" alt="${title}" style="max-height: min(60vh, 400px); width: 100%; object-fit: contain;" class="rounded-lg shadow-lg" />
                  </div>
                  <div class="${textOrder} text-gray-700 text-lg leading-relaxed space-y-3">
                    ${caption ? `<div>${caption}</div>` : ''}
                  </div>
                </div>
              </div>`;
        } else if (layout === 'overlay') {
          html = `
              <div class="lesson-image overlay">
                <div class="relative rounded-xl overflow-hidden">
                  <img src="${imageUrl}" alt="${title}" class="w-full h-96 object-cover" />
                  ${caption ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full text-xl font-medium leading-relaxed space-y-3"><div>${caption}</div></div></div>` : ''}
                </div>
              </div>`;
        } else if (layout === 'full-width') {
          html = `
              <div class="lesson-image full-width">
                <div class="space-y-3">
                  <img src="${imageUrl}" alt="${title}" style="max-height: min(60vh, 400px); width: 100%; object-fit: contain;" class="rounded" />
                  ${caption ? `<div class="text-sm text-gray-600 leading-relaxed space-y-2">${caption}</div>` : ''}
                </div>
              </div>`;
        } else {
          html = `
              <div class="lesson-image centered">
                <div class="text-center">
                  <img src="${imageUrl}" alt="${title}" style="max-height: min(60vh, 400px); width: auto; object-fit: contain;" class="rounded-xl shadow-lg mx-auto" />
                  ${caption ? `<div class="text-gray-600 mt-4 italic text-lg leading-relaxed space-y-2">${caption}</div>` : ''}
                </div>
              </div>`;
        }
      }
    } else if (block.type === 'quote') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        const quoteContent = JSON.parse(block.content || '{}');
        const quoteType = block.quoteType || 'quote_a';

        switch (quoteType) {
          case 'quote_a':
            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div class="flex-1">
                      <blockquote class="text-lg italic text-gray-700 mb-3">
                        "${quoteContent.quote || ''}"
                      </blockquote>
                      <cite class="text-sm font-medium text-gray-500">— ${quoteContent.author || ''}</cite>
                    </div>
                  </div>
                </div>
              `;
            break;
          case 'quote_b':
            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="bg-gray-50 rounded-xl p-6">
                    <div class="flex items-center space-x-4 mb-4">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg" />
                      <div>
                        <cite class="text-lg font-semibold text-gray-800">${quoteContent.author || ''}</cite>
                      </div>
                    </div>
                    <blockquote class="text-xl italic text-gray-700 leading-relaxed">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                  </div>
                </div>
              `;
            break;
          case 'quote_c':
            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="text-center">
                    <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-gray-100 shadow-lg" />
                    <blockquote class="text-2xl italic text-gray-700 mb-4 leading-relaxed">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                    <cite class="text-lg font-medium text-gray-600">— ${quoteContent.author || ''}</cite>
                  </div>
                </div>
              `;
            break;
          case 'quote_d':
            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="border-l-4 border-blue-500 pl-4">
                    <blockquote class="text-lg text-gray-700 mb-2">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                    <div class="flex items-center space-x-3">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" className="w-8 h-8 rounded-full object-cover" />
                      <cite class="text-sm font-medium text-gray-500">— ${quoteContent.author || ''}</cite>
                    </div>
                  </div>
                </div>
              `;
            break;
          case 'quote_on_image':
            html = `
                <div class="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="relative">
                    <img src="${quoteContent.backgroundImage || ''}" alt="Quote background" class="w-full h-64 object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                      <div class="p-8 text-white w-full">
                        <blockquote class="text-xl italic mb-3 leading-relaxed">
                          "${quoteContent.quote || ''}"
                        </blockquote>
                        <cite class="text-lg font-medium opacity-90">— ${quoteContent.author || ''}</cite>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            break;
          case 'quote_carousel': {
            const quotes = quoteContent.quotes || [];
            const quotesHtml = quotes
              .map(
                (q, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : 'hidden'}" data-index="${index}">
                  <blockquote class="text-xl italic text-gray-700 mb-4 text-center leading-relaxed">
                    "${q.quote || ''}"
                  </blockquote>
                  <cite class="text-lg font-medium text-gray-600 text-center block">— ${q.author || ''}</cite>
                </div>
              `
              )
              .join('');

            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="quote-carousel relative bg-gray-50 rounded-xl p-8 min-h-[200px] flex flex-col justify-center">
                    ${quotesHtml}
                    <div class="flex justify-center space-x-2 mt-6">
                      ${quotes
                        .map(
                          (_, index) => `
                        <button class="carousel-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}" data-index="${index}"></button>
                      `
                        )
                        .join('')}
                    </div>
                    <div class="flex justify-between items-center mt-4">
                      <button class="carousel-prev text-gray-500 hover:text-gray-700 p-2">‹</button>
                      <button class="carousel-next text-gray-500 hover:text-gray-700 p-2">›</button>
                    </div>
                  </div>
                </div>
              `;

            js = `
                document.addEventListener('DOMContentLoaded', function() {
                  const carousel = document.querySelector('.quote-carousel');
                  if (carousel) {
                    const items = carousel.querySelectorAll('.carousel-item');
                    const dots = carousel.querySelectorAll('.carousel-dot');
                    const prevBtn = carousel.querySelector('.carousel-prev');
                    const nextBtn = carousel.querySelector('.carousel-next');
                    let currentIndex = 0;

                    function showItem(index) {
                      items.forEach((item, i) => {
                        item.classList.toggle('hidden', i !== index);
                        item.classList.toggle('active', i === index);
                      });
                      dots.forEach((dot, i) => {
                        dot.classList.toggle('bg-blue-500', i === index);
                        dot.classList.toggle('bg-gray-300', i !== index);
                      });
                      currentIndex = index;
                    }

                    dots.forEach((dot, index) => {
                      dot.addEventListener('click', () => showItem(index));
                    });

                    prevBtn.addEventListener('click', () => {
                      const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                      showItem(newIndex);
                    });

                    nextBtn.addEventListener('click', () => {
                      const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                      showItem(newIndex);
                    });
                  }
                });
              `;
            break;
          }
          default:
            html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <blockquote class="text-lg italic text-gray-700 mb-3">
                    "${quoteContent.quote || ''}"
                  </blockquote>
                  <cite class="text-sm font-medium text-gray-500">— ${quoteContent.author || ''}</cite>
                </div>
              `;
        }
      }
    } else if (block.type === 'list') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        try {
          // Robustly extract list content supporting multiple block shapes
          let listContent = {};

          // 1. Attempt to parse JSON content if provided as string
          if (typeof block.content === 'string') {
            try {
              listContent = JSON.parse(block.content);
            } catch {
              // 2. Fallback: treat newline-separated string as list items
              listContent = {
                items: block.content
                  .split('\n')
                  .map(i => i.trim())
                  .filter(Boolean),
              };
            }
          } else if (
            typeof block.content === 'object' &&
            block.content !== null
          ) {
            // Content already provided as object
            listContent = block.content;
          }

          // 3. Merge with explicit props that may exist on the block itself
          const listType = listContent.listType || block.listType || 'bulleted';
          let items = listContent.items || block.items || [];
          const checkedItems = listContent.checkedItems || {};

          // 4. Ensure items is an array after all fallbacks
          if (typeof items === 'string') {
            items = items
              .split('\n')
              .map(i => i.trim())
              .filter(Boolean);
          }

          if (listType === 'numbered') {
            html = `
                <div class="list-block numbered-list">
                  <ol class="list-decimal list-inside space-y-2 text-gray-800">
                    ${items.map(item => `<li class="leading-relaxed">${item}</li>`).join('')}
                  </ol>
                </div>`;
          } else if (listType === 'checkbox') {
            html = `
                <div class="list-block checkbox-list">
                  <div class="space-y-3">
                    ${items
                      .map(
                        (item, index) => `
                      <label class="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" ${checkedItems[index] ? 'checked' : ''} 
                               class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="text-gray-800 leading-relaxed ${checkedItems[index] ? 'line-through text-gray-500' : ''}">${item}</span>
                      </label>
                    `
                      )
                      .join('')}
                  </div>
                </div>`;
          } else {
            html = `
                <div class="list-block bulleted-list">
                  <ul class="list-disc list-inside space-y-2 text-gray-800">
                    ${items.map(item => `<li class="leading-relaxed">${item}</li>`).join('')}
                  </ul>
                </div>`;
          }
        } catch (e) {
          html = `<div class="list-block"><ul class="list-disc list-inside"><li>Error loading list</li></ul></div>`;
        }
      }
    } else if (block.type === 'pdf') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        const url = block.pdfUrl || block.details?.pdf_url || '';
        const title =
          block.pdfTitle || block.details?.caption || 'PDF Document';
        const description =
          block.pdfDescription || block.details?.description || '';
        html = `
            <div class="lesson-pdf">
              ${title ? `<h3 class="pdf-title">${title}</h3>` : ''}
              ${description ? `<p class="pdf-description">${description}</p>` : ''}
              <iframe src="${url}" class="pdf-iframe" style="width: 100%; height: 600px; border: none; border-radius: 12px;"></iframe>
            </div>
          `;
      }
    } else if (block.type === 'interactive') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        try {
          const interactiveContent = JSON.parse(block.content || '{}');
          const template = interactiveContent.template;
          const data =
            interactiveContent[
              template === 'tabs' ? 'tabsData' : 'accordionData'
            ] || [];

          if (template === 'tabs') {
            const tabsId = `tabs-${Date.now()}`;
            html = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-blue-500 to-purple-600">
                  <div class="interactive-tabs" data-template="tabs" id="${tabsId}">
                    <div class="flex border-b border-gray-200 mb-4" role="tablist">
                      ${data
                        .map(
                          (tab, index) => `
                        <button class="tab-button px-4 py-2 text-sm font-medium transition-colors duration-200 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" 
                                role="tab" 
                                data-tab="${index}"
                                data-container="${tabsId}"
                                onclick="window.switchTab('${tabsId}', ${index})">
                          ${tab.title}
                        </button>
                      `
                        )
                        .join('')}
                    </div>
                    <div class="tab-content">
                      ${data
                        .map(
                          (tab, index) => `
                        <div class="tab-panel ${index === 0 ? 'block' : 'hidden'}" 
                             role="tabpanel" 
                             data-tab="${index}">
                          <div class="text-gray-700 leading-relaxed">${tab.content}</div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              `;
          } else if (template === 'accordion') {
            const accordionId = `accordion-${Date.now()}`;
            html = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-green-500 to-blue-600">
                  <div class="interactive-accordion" data-template="accordion" id="${accordionId}">
                    <div class="space-y-3">
                      ${data
                        .map(
                          (item, index) => `
                        <div class="accordion-item border border-gray-200 rounded-lg">
                          <button class="accordion-header w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between rounded-lg"
                                  data-accordion="${index}"
                                  data-container="${accordionId}"
                                  onclick="window.toggleAccordion('${accordionId}', ${index})">
                            <span class="font-medium text-gray-800">${item.title}</span>
                            <svg class="accordion-icon w-5 h-5 text-gray-500 transition-transform duration-200" 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                          <div class="accordion-content hidden px-4 py-3 text-gray-700 leading-relaxed border-t border-gray-200">
                            ${item.content}
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              `;
          }
        } catch {
          html =
            '<div class="text-red-500">Error loading interactive content</div>';
        }
      }
    } else if (block.type === 'audio') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        try {
          const audioContent = JSON.parse(block.content || '{}');
          html = `
              <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                <div class="space-y-4">
                  <div class="mb-3">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${audioContent.title || 'Audio'}</h3>
                    ${audioContent.description ? `<p class="text-sm text-gray-600">${audioContent.description}</p>` : ''}
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <audio controls class="w-full" preload="metadata">
                      <source src="${audioContent.url}" type="audio/mpeg">
                      <source src="${audioContent.url}" type="audio/wav">
                      <source src="${audioContent.url}" type="audio/ogg">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            `;
        } catch {
          html = '<div class="text-red-500">Error loading audio content</div>';
        }
      }
    } else if (block.type === 'video') {
      if (block.html_css && block.html_css.trim()) {
        html = block.html_css;
      } else {
        const videoUrl = block.videoUrl || block.details?.video_url || '';
        const videoTitle = (
          block.videoTitle ||
          block.details?.caption ||
          'Video'
        )
          .replace(
            /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
            ''
          )
          .trim();
        const videoDescription =
          block.videoDescription || block.details?.description || '';

        html = `
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div class="space-y-4">
                ${videoTitle ? `<h3 class="text-lg font-semibold text-gray-900">${videoTitle}</h3>` : ''}
                ${videoDescription ? `<p class="text-sm text-gray-600">${videoDescription}</p>` : ''}
                <div class="bg-gray-50 rounded-lg p-4">
                  <video controls style="width: 100%; height: auto; border-radius: 8px;">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          `;
      }
    } else if (block.type === 'youtube') {
      html = '';
    }

    return { html, css, js };
  });
};

export const optimizeHtml = html => {
  if (!html) return '';

  return html
    .replace(/\n\s+/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
};

const removeDuplicateBlocks = blocks => {
  const uniqueBlocks = [];
  const seenIds = new Set();

  blocks.forEach(block => {
    const blockId = block.block_id || block.id;
    if (!seenIds.has(blockId)) {
      uniqueBlocks.push(block);
      seenIds.add(blockId);
    }
  });

  return uniqueBlocks;
};

const mergeBlocks = (contentBlocks, lessonContent) => {
  if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
    const existingBlocks = lessonContent.data.content;
    const existingBlockIds = new Set(
      existingBlocks.map(b => b.block_id || b.id)
    );

    const newBlocks = contentBlocks.filter(b => !existingBlockIds.has(b.id));

    return [...existingBlocks, ...newBlocks];
  }

  return contentBlocks;
};

const mapBlockToPayload = block => {
  const details = {};

  if (
    block.type === 'quote' &&
    block.html_css &&
    block.html_css.trim() !== ''
  ) {
    return {
      type: block.type,
      textType: block.textType,
      script: block.script || '',
      block_id: block.block_id || block.id,
      html_css: block.html_css,
      content: block.content,
      ...(block.details && { details: block.details }),
    };
  }

  if (block.html_css && block.html_css.trim() !== '') {
    const blockData = {
      type: block.type,
      script: block.script || '',
      block_id: block.block_id || block.id,
      html_css: block.html_css,
      ...(block.details && { details: block.details }),
    };

    if (block.type === 'text' && block.textType) {
      blockData.textType = block.textType;
    }

    if (block.type === 'statement') {
      blockData.statementType = block.statementType || 'statement-a';
      blockData.details = {
        ...blockData.details,
        statement_type: block.statementType || 'statement-a',
        content: block.content || '',
      };
    }

    if (block.type === 'divider') {
      blockData.dividerType = block.subtype || 'continue';
      blockData.details = {
        ...blockData.details,
        divider_type: block.subtype || 'continue',
        content: block.content || '',
      };
    }

    if (block.type === 'table') {
      blockData.tableType =
        block.tableType || block.templateId || 'two_columns';
      blockData.details = {
        ...blockData.details,
        table_type: block.tableType || block.templateId || 'two_columns',
        templateId: block.tableType || block.templateId || 'two_columns',
        content: block.content || '',
      };
    }

    return blockData;
  }

  switch (block.type) {
    case 'quote':
      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || '',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          quote_type: block.textType || block.quoteType || 'quote_a',
          content: block.content || '',
        },
      };
    case 'statement':
      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || '',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          statement_type: block.statementType || 'statement-a',
          content: block.content || '',
        },
      };
    case 'image': {
      const layout = block.layout || 'centered';
      const textHtml = (
        block.text ||
        block.details?.caption_html ||
        ''
      ).toString();
      const textPlain = (
        block.imageDescription ||
        block.details?.caption ||
        ''
      ).toString();
      const textContent = textHtml.trim() ? textHtml : textPlain;

      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || '',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          image_url: block.imageUrl,
          caption: textPlain,
          caption_html: textHtml,
          alt_text: block.imageTitle || '',
          layout,
          template: block.templateType || block.template || undefined,
          alignment: block.alignment || 'left',
        },
      };
    }
    case 'audio': {
      let audioContent = {};
      try {
        audioContent = JSON.parse(block.content || '{}');
      } catch {
        audioContent = {};
      }

      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || audioContent.title || 'Audio',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          audioTitle: audioContent.title || 'Audio',
          audioDescription: audioContent.description || '',
          audioUrl: audioContent.url || '',
          audio_url: audioContent.url || '',
          uploadMethod: audioContent.uploadMethod || 'url',
          uploadedData: audioContent.uploadedData || null,
          title: audioContent.title || 'Audio',
        },
      };
    }
    case 'youtube': {
      let youTubeContent = {};
      try {
        youTubeContent = JSON.parse(block.content || '{}');
      } catch {
        youTubeContent = {};
      }

      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || youTubeContent.title || 'YouTube Video',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          youTubeTitle: youTubeContent.title || 'YouTube Video',
          youTubeDescription: youTubeContent.description || '',
          youTubeUrl: youTubeContent.url || '',
          youtube_url: youTubeContent.url || '',
          videoId: youTubeContent.videoId || '',
          embedUrl: youTubeContent.embedUrl || '',
          title: youTubeContent.title || 'YouTube Video',
        },
      };
    }
    case 'video':
      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || block.videoTitle || 'Video',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        details: {
          video_url: block.videoUrl || '',
          caption: block.videoTitle || 'Video',
          description: block.videoDescription || '',
          videoTitle: block.videoTitle || 'Video',
          videoDescription: block.videoDescription || '',
          videoUrl: block.videoUrl || '',
          uploadMethod: block.uploadMethod || 'url',
          originalUrl: block.originalUrl || '',
          title: block.videoTitle || 'Video',
        },
      };
    default:
      return {
        id: block.id,
        type: block.type,
        textType: block.textType,
        title: block.title || '',
        content: block.content || '',
        html_css: block.html_css || block.content || '',
        order: block.order || 0,
        ...(Object.keys(details).length > 0 && { details }),
      };
  }
};

export const buildLessonUpdatePayload = ({
  lessonId,
  contentBlocks,
  lessonContent,
}) => {
  if (!lessonId) {
    throw new Error('No lesson ID found. Please save the lesson first.');
  }

  const mergedBlocks = mergeBlocks(contentBlocks, lessonContent);
  const uniqueBlocks = removeDuplicateBlocks(mergedBlocks);
  // Sort blocks by order to preserve 10-section structure
  const sortedBlocks = uniqueBlocks.sort((a, b) => {
    const orderA = a.order !== undefined && a.order !== null ? a.order : 999999;
    const orderB = b.order !== undefined && b.order !== null ? b.order : 999999;
    return orderA - orderB;
  });
  const content = sortedBlocks.map(mapBlockToPayload);
  const convertedBlocks = convertBlocksToHtml(sortedBlocks);
  const lessonDataToUpdate = {
    lesson_id: lessonId,
    content,
    html_css: convertedBlocks
      .map(block => optimizeHtml(block.html))
      .filter(html => html)
      .join('\n'),
    css: convertedBlocks
      .map(block => block.css)
      .filter(css => css)
      .join('\n'),
    script: '',
  };

  const payloadSize = JSON.stringify(lessonDataToUpdate).length;

  return {
    lessonDataToUpdate,
    payloadSize,
    blocksCount: lessonDataToUpdate.content?.length || 0,
  };
};
