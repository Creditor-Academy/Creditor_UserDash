import { toast } from 'react-hot-toast';
import devLogger from '@lessonbuilder/utils/devLogger';

const useLessonBlocks = ({
  contentBlocks,
  setContentBlocks,
  lessonContent,
  setLessonContent,
  insertionPosition,
  setInsertionPosition,
  editingAudioBlock,
  setEditingAudioBlock,
  editingVideoBlock,
  setEditingVideoBlock,
  editingYouTubeBlock,
  setEditingYouTubeBlock,
  editingTableBlock,
  setEditingTableBlock,
  editingListBlock,
  setEditingListBlock,
  editingQuoteBlock,
  setEditingQuoteBlock,
  editingInteractiveBlock,
  setEditingInteractiveBlock,
  editingLinkBlock,
  setEditingLinkBlock,
  editingPdfBlock,
  setEditingPdfBlock,
  setShowDividerTemplateSidebar,
  setShowTableComponent,
  setShowListEditDialog,
  setShowQuoteEditDialog,
  setShowInteractiveEditDialog,
  setShowAudioDialog,
  setShowYouTubeDialog,
  setShowVideoDialog,
  setShowPdfDialog,
  setShowLinkDialog,
  setShowListTemplateSidebar,
  setShowQuoteTemplateSidebar,
  setShowInteractiveTemplateSidebar,
  setShowImageTemplateSidebar,
  setShowImageDialog,
  setShowStatementSidebar,
  setShowTextTypeSidebar,
  setShowTextEditorDialog,
  setCurrentTextBlockId,
  setCurrentTextType,
  listComponentRef,
  statementComponentRef,
  quoteComponentRef,
  dividerComponentRef,
  imageBlockComponentRef,
  imageUploading,
  setImageUploading,
  draggedBlockId,
  setDraggedBlockId,
}) => {
  // Helper function to calculate order based on insertion position
  const calculateOrderForInsertion = position => {
    const blocksToUse =
      lessonContent?.data?.content && lessonContent.data.content.length > 0
        ? lessonContent.data.content
        : contentBlocks;

    if (blocksToUse.length === 0) {
      return 1; // First block
    }

    if (position === 0) {
      // Inserting at the beginning - use order slightly less than first block
      const firstBlock = blocksToUse[0];
      const firstOrder =
        firstBlock?.order !== undefined && firstBlock.order !== null
          ? firstBlock.order
          : 1;
      return Math.max(0, firstOrder - 0.5);
    } else if (position >= blocksToUse.length) {
      // Inserting at the end - use order higher than last block
      const lastBlock = blocksToUse[blocksToUse.length - 1];
      const lastOrder =
        lastBlock?.order !== undefined && lastBlock.order !== null
          ? lastBlock.order
          : blocksToUse.length;
      return lastOrder + 1;
    } else {
      // Inserting between blocks - use average of previous and next block orders
      const prevBlock = blocksToUse[position - 1];
      const nextBlock = blocksToUse[position];
      const prevOrder =
        prevBlock?.order !== undefined && prevBlock.order !== null
          ? prevBlock.order
          : position;
      const nextOrder =
        nextBlock?.order !== undefined && nextBlock.order !== null
          ? nextBlock.order
          : position + 1;
      return (prevOrder + nextOrder) / 2;
    }
  };

  // Helper function to calculate order for adding at the end
  const calculateOrderForEnd = () => {
    const blocksToUse =
      lessonContent?.data?.content && lessonContent.data.content.length > 0
        ? lessonContent.data.content
        : contentBlocks;
    if (blocksToUse.length === 0) {
      return 1;
    }
    const lastBlock = blocksToUse[blocksToUse.length - 1];
    const lastOrder =
      lastBlock?.order !== undefined && lastBlock.order !== null
        ? lastBlock.order
        : blocksToUse.length;
    return lastOrder + 1;
  };

  const addContentBlock = (blockType, textType = null) => {
    const calculatedOrder = calculateOrderForEnd();
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: calculatedOrder,
    };

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock],
        },
      }));
    } else {
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  const insertContentBlockAt = (blockType, position, textType = null) => {
    const calculatedOrder = calculateOrderForInsertion(position);
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: calculatedOrder,
    };

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => {
        const newContent = [...prevLessonContent.data.content];
        newContent.splice(position, 0, newBlock);
        return {
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: newContent,
          },
        };
      });
    } else {
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(position, 0, newBlock);
        return newBlocks;
      });
    }
  };

  const handleStatementSelect = statementBlock => {
    if (insertionPosition !== null) {
      const calculatedOrder = calculateOrderForInsertion(insertionPosition);
      const blockWithOrder = {
        ...statementBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      const calculatedOrder = calculateOrderForEnd();
      const blockWithOrder = {
        ...statementBlock,
        order: calculatedOrder,
      };
      setContentBlocks(prevBlocks => [...prevBlocks, blockWithOrder]);
    }
  };

  const handleStatementEdit = (blockId, content, htmlContent) => {
    let detectedStatementType = 'statement-a';
    if (htmlContent) {
      if (htmlContent.includes('border-t border-b border-gray-800')) {
        detectedStatementType = 'statement-a';
      } else if (
        htmlContent.includes('absolute top-0 left-1/2') &&
        htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')
      ) {
        detectedStatementType = 'statement-b';
      } else if (
        htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') &&
        htmlContent.includes('border-l-4 border-orange-500')
      ) {
        detectedStatementType = 'statement-c';
      } else if (htmlContent.includes('absolute top-0 left-0 w-16 h-1')) {
        detectedStatementType = 'statement-d';
      } else if (htmlContent.includes('border-orange-300 bg-orange-50')) {
        detectedStatementType = 'note';
      }
    }

    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              statementType: detectedStatementType,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  statementType: detectedStatementType,
                  details: {
                    ...block.details,
                    content,
                    statement_type: detectedStatementType,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  const handleQuoteTemplateSelect = newBlock => {
    if (insertionPosition !== null) {
      const calculatedOrder = calculateOrderForInsertion(insertionPosition);
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      const calculatedOrder = calculateOrderForEnd();
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };
      setContentBlocks(prevBlocks => [...prevBlocks, blockWithOrder]);
    }
  };

  const handleTableTemplateSelect = newBlock => {
    if (insertionPosition !== null) {
      const calculatedOrder = calculateOrderForInsertion(insertionPosition);
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      const calculatedOrder = calculateOrderForEnd();
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };
      setContentBlocks(prevBlocks => [...prevBlocks, blockWithOrder]);
    }
  };

  const handleInteractiveTemplateSelect = newBlock => {
    const calculatedOrder =
      insertionPosition !== null
        ? calculateOrderForInsertion(insertionPosition)
        : calculateOrderForEnd();

    const interactiveBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'interactive',
      title: 'Interactive',
      content: newBlock.content,
      html_css: newBlock.html_css,
      order: calculatedOrder,
    };

    if (insertionPosition !== null) {
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, interactiveBlock);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, interactiveBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      setContentBlocks(prevBlocks => [...prevBlocks, interactiveBlock]);
    }
  };

  const handleInteractiveUpdate = (blockId, updatedContent) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              type: 'interactive',
              subtype: updatedContent.subtype || block.subtype || 'accordion',
              content: updatedContent.content,
              html_css: updatedContent.html_css,
            }
          : block
      )
    );
    setEditingInteractiveBlock(null);
  };

  const handleDividerTemplateSelect = newBlock => {
    if (insertionPosition !== null) {
      const calculatedOrder = calculateOrderForInsertion(insertionPosition);
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      const calculatedOrder = calculateOrderForEnd();
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };
      setContentBlocks(prevBlocks => [...prevBlocks, blockWithOrder]);
    }
    setShowDividerTemplateSidebar(false);
  };

  const handleDividerUpdate = (blockId, updatedContent) => {
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content: updatedContent.content,
              html_css: updatedContent.html_css,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content: updatedContent.content,
                  html_css: updatedContent.html_css,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  const handleListTemplateSelect = newBlock => {
    if (insertionPosition !== null) {
      const calculatedOrder = calculateOrderForInsertion(insertionPosition);
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      const calculatedOrder = calculateOrderForEnd();
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };
      setContentBlocks(prevBlocks => [...prevBlocks, blockWithOrder]);
    }
  };

  const handleListUpdate = (blockId, content, updatedHtml = null) => {
    let htmlContent = updatedHtml || '';
    let extractedListType = 'bulleted';

    if (content && !updatedHtml) {
      try {
        const parsedContent = JSON.parse(content);
        extractedListType = parsedContent.listType || 'bulleted';
        const items = parsedContent.items || [];
        const checkedItems = parsedContent.checkedItems || {};
        const numberingStyle = parsedContent.numberingStyle || 'decimal';

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
            case 'decimal':
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

        if (extractedListType === 'numbered') {
          htmlContent = `
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
            </div>`;
        } else if (extractedListType === 'checkbox') {
          htmlContent = `
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
              <div class="space-y-4">
                ${items
                  .map(
                    (item, index) => `
                  <div class="checkbox-container flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200 cursor-pointer" data-index="${index}">
                    <div class="flex-shrink-0 mt-1">
                      <div class="checkbox-wrapper w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center hover:border-pink-500 transition-colors">
                        <input type="checkbox" ${checkedItems[index] ? 'checked' : ''} class="hidden checkbox-item" data-index="${index}" />
                        <div class="checkbox-visual w-3 h-3 bg-pink-500 rounded-sm ${checkedItems[index] ? 'opacity-100' : 'opacity-0'} transition-opacity"></div>
                      </div>
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed ${checkedItems[index] ? 'line-through text-gray-500' : ''}">
                      ${item}
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>`;
        } else {
          htmlContent = `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <ul class="space-y-4 list-none">
                ${items
                  .map(
                    item => `
                  <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                    <div class="flex-shrink-0 mt-2">
                      <div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed">
                      ${item}
                    </div>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </div>`;
        }
      } catch (e) {
        devLogger.error('Error parsing list content:', e);
        extractedListType = 'bulleted';
        htmlContent = `<div class="list-block"><ul class="list-disc list-inside"><li>Error loading list</li></ul></div>`;
      }
    }

    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              listType: extractedListType,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  listType: extractedListType,
                  details: {
                    ...block.details,
                    list_type: extractedListType,
                    listType: extractedListType,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    setEditingListBlock(null);
    setShowListEditDialog(false);
  };

  const handleCheckboxToggle = async (blockId, itemIndex, checked) => {
    try {
      let targetBlock = contentBlocks.find(
        block => block.id === blockId || block.block_id === blockId
      );
      if (!targetBlock && lessonContent?.data?.content) {
        targetBlock = lessonContent.data.content.find(
          block => block.id === blockId || block.block_id === blockId
        );
      }

      if (!targetBlock) {
        devLogger.error('Block not found for checkbox toggle:', blockId);
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(targetBlock.html_css, 'text/html');
      const checkboxContainers = doc.querySelectorAll('.checkbox-container');

      if (checkboxContainers[itemIndex]) {
        const container = checkboxContainers[itemIndex];
        const hiddenCheckbox = container.querySelector('.checkbox-item');
        const visualCheckbox = container.querySelector('.checkbox-visual');
        const textElement = container.querySelector('.flex-1');

        if (hiddenCheckbox && visualCheckbox) {
          hiddenCheckbox.checked = checked;
          if (checked) {
            hiddenCheckbox.setAttribute('checked', 'checked');
          } else {
            hiddenCheckbox.removeAttribute('checked');
          }

          if (checked) {
            visualCheckbox.classList.remove('opacity-0');
            visualCheckbox.classList.add('opacity-100');
          } else {
            visualCheckbox.classList.remove('opacity-100');
            visualCheckbox.classList.add('opacity-0');
          }

          if (textElement) {
            if (checked) {
              if (!textElement.classList.contains('line-through')) {
                textElement.classList.add('line-through', 'text-gray-500');
              }
              textElement.classList.remove('text-gray-800');
            } else {
              textElement.classList.remove('line-through', 'text-gray-500');
              if (!textElement.classList.contains('text-gray-800')) {
                textElement.classList.add('text-gray-800');
              }
            }
          }
        }
      }

      const updatedHtml = doc.body.innerHTML;

      let updatedContent = targetBlock.content;
      try {
        if (targetBlock.content) {
          const contentObj = JSON.parse(targetBlock.content);
          if (contentObj.checkedItems) {
            contentObj.checkedItems[itemIndex] = checked;
            updatedContent = JSON.stringify(contentObj);
          }
        }
      } catch (e) {
        devLogger.debug('Could not update content JSON:', e);
      }

      const updatedBlock = {
        ...targetBlock,
        content: updatedContent,
        html_css: updatedHtml,
        updatedAt: new Date().toISOString(),
      };

      if (
        contentBlocks.find(
          block => block.id === blockId || block.block_id === blockId
        )
      ) {
        setContentBlocks(prevBlocks =>
          prevBlocks.map(block =>
            block.id === blockId || block.block_id === blockId
              ? updatedBlock
              : block
          )
        );
      }

      if (
        lessonContent?.data?.content?.find(
          block => block.id === blockId || block.block_id === blockId
        )
      ) {
        setLessonContent(prevContent => ({
          ...prevContent,
          data: {
            ...prevContent.data,
            content: prevContent.data.content.map(block =>
              block.id === blockId || block.block_id === blockId
                ? updatedBlock
                : block
            ),
          },
        }));
      }

      toast.success('Checkbox state saved');
    } catch (error) {
      devLogger.error('Error in handleCheckboxToggle:', error);
      toast.error('Error updating checkbox');
    }
  };

  const handleQuoteUpdate = (blockId, updatedContentString) => {
    const editingBlock =
      contentBlocks.find(block => block.id === blockId) ||
      lessonContent?.data?.content?.find(
        block => block.block_id === blockId || block.id === blockId
      );

    if (!editingBlock) {
      devLogger.error('Block not found for update:', blockId);
      return;
    }

    let updatedQuoteContent;
    try {
      updatedQuoteContent = JSON.parse(updatedContentString);
    } catch (e) {
      devLogger.error('Error parsing updated content:', e);
      return;
    }

    let newHtmlContent = '';
    const quoteType =
      editingBlock.textType ||
      editingBlock.details?.quoteType ||
      editingBlock.quoteType;

    switch (quoteType) {
      case 'quote_a':
        newHtmlContent = `
          <div class="relative bg-gradient-to-br from-gray-50 to-white p-12 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-100">
            <div class="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg"></div>
            <div class="relative z-10">
              <div class="w-16 h-px bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              <div class="text-center">
                <svg class="w-8 h-8 text-blue-500/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-xl text-gray-700 mb-8 leading-relaxed font-light italic tracking-wide">
                  "${updatedQuoteContent.quote}"
                </blockquote>
                <cite class="text-sm font-semibold text-gray-600 not-italic uppercase tracking-wider letter-spacing-wide">— ${updatedQuoteContent.author}</cite>
              </div>
              <div class="w-16 h-px bg-gradient-to-r from-purple-600 to-blue-500 mx-auto mt-8"></div>
            </div>
          </div>
        `;
        break;
      case 'quote_b':
        newHtmlContent = `
          <div class="relative bg-white py-16 px-8 max-w-5xl mx-auto">
            <div class="text-center">
              <blockquote class="text-3xl md:text-4xl text-gray-800 mb-12 leading-relaxed font-thin tracking-wide">
                ${updatedQuoteContent.quote}
              </blockquote>
              <cite class="text-lg font-medium text-orange-500 not-italic tracking-wider">${updatedQuoteContent.author}</cite>
            </div>
          </div>
        `;
        break;
      case 'quote_c':
        newHtmlContent = `
          <div class="relative bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto border border-gray-100">
            <div class="flex items-center space-x-8">
              <div class="flex-shrink-0">
                <img src="${updatedQuoteContent.authorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80'}" alt="${updatedQuoteContent.author}" class="w-32 h-32 rounded-full object-cover shadow-md" />
              </div>
              <div class="flex-1">
                <blockquote class="text-xl text-gray-700 mb-4 leading-relaxed font-normal italic">
                  "${updatedQuoteContent.quote}"
                </blockquote>
                <cite class="text-base font-semibold text-gray-600 not-italic">— ${updatedQuoteContent.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_d':
        newHtmlContent = `
          <div class="relative bg-gradient-to-br from-slate-50 to-gray-50 py-20 px-12 max-w-4xl mx-auto">
            <div class="text-left max-w-3xl">
              <div class="mb-8">
                <svg class="w-12 h-12 text-slate-300 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light mb-8">
                  ${updatedQuoteContent.quote}
                </blockquote>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-px bg-slate-400 mr-4"></div>
                <cite class="text-sm font-medium text-slate-600 not-italic uppercase tracking-widest">${updatedQuoteContent.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_on_image':
        newHtmlContent = `
          <div class="relative rounded-3xl overflow-hidden shadow-2xl max-w-6xl mx-auto min-h-[600px]" style="background-image: url('${updatedQuoteContent.backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}'); background-size: cover; background-position: center;">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
            <div class="relative z-10 flex items-center justify-center h-full p-16">
              <div class="text-center max-w-4xl">
                <div class="mb-8">
                  <svg class="w-16 h-16 text-white/30 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                  <blockquote class="text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-extralight mb-12 tracking-wide">
                    ${updatedQuoteContent.quote}
                  </blockquote>
                </div>
                <div class="flex items-center justify-center">
                  <div class="w-12 h-px bg-white/60 mr-6"></div>
                  <cite class="text-xl font-light text-white/95 not-italic uppercase tracking-[0.2em]">${updatedQuoteContent.author}</cite>
                  <div class="w-12 h-px bg-white/60 ml-6"></div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_carousel': {
        const quotes = updatedQuoteContent.quotes || [updatedQuoteContent];
        newHtmlContent = `
        <div class="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl shadow-lg border border-slate-200/50 p-6 max-w-2xl mx-auto overflow-hidden backdrop-blur-sm">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
          <div class="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-br from-indigo-200/20 via-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
          <div class="absolute top-1/2 right-8 w-16 h-16 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-xl"></div>
          <div class="quote-carousel-${Date.now()} relative z-10" data-current="0">
            ${quotes
              .map(
                (q, index) => `
              <div class="quote-slide ${index === 0 ? 'block' : 'hidden'} transition-all duration-700 ease-in-out transform" data-index="${index}">
                <div class="text-center py-8 px-6">
                  <div class="flex justify-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <svg class="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                  </div>
                  <blockquote class="text-lg md:text-xl text-slate-800 mb-6 leading-relaxed font-light italic min-h-[80px] flex items-center justify-center tracking-wide">
                    <span class="relative">
                      "${q.quote}"
                      <div class="absolute -left-4 -top-2 text-6xl text-blue-200/30 font-serif">"</div>
                      <div class="absolute -right-4 -bottom-6 text-6xl text-purple-200/30 font-serif">"</div>
                    </span>
                  </blockquote>
                  <div class="flex items-center justify-center spacex-4">
                    <div class="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-slate-400"></div>
                    <cite class="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text not-italic tracking-wider uppercase text-sm letter-spacing-widest">${q.author}</cite>
                    <div class="w-12 h-px bg-gradient-to-r from-slate-400 via-slate-400 to-transparent"></div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
            <div class="flex justify-center items-center space-x-6 mt-6 pt-4 border-t border-slate-200/60">
              <button onclick="window.carouselPrev && window.carouselPrev(this)" class="carousel-prev group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div class="flex space-x-2">
                ${quotes
                  .map(
                    (_, index) => `
                  <button onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" class="carousel-dot w-3 h-3 rounded-full transition-all duration-300 transform ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-md' : 'bg-slate-300 hover:bg-slate-400 hover:scale-105'}" data-index="${index}"></button>
                `
                  )
                  .join('')}
              </div>
              <button onclick="window.carouselNext && window.carouselNext(this)" class="carousel-next group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
        break;
      }
      default:
        newHtmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 border">
          <blockquote class="text-lg italic text-gray-700 mb-3">
            "${updatedQuoteContent.quote}"
          </blockquote>
          <cite class="text-sm font-medium text-gray-500">— ${updatedQuoteContent.author}</cite>
        </div>
      `;
    }

    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content: JSON.stringify(updatedQuoteContent),
              html_css: newHtmlContent,
              details: {
                ...block.details,
                quote:
                  updatedQuoteContent.quote ||
                  updatedQuoteContent.quotes?.[0]?.quote ||
                  '',
                author:
                  updatedQuoteContent.author ||
                  updatedQuoteContent.quotes?.[0]?.author ||
                  '',
                authorImage: updatedQuoteContent.authorImage || '',
                backgroundImage: updatedQuoteContent.backgroundImage || '',
              },
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content: JSON.stringify(updatedQuoteContent),
                  html_css: newHtmlContent,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    setEditingQuoteBlock(null);
  };

  const handleAudioUpdate = audioBlock => {
    if (editingAudioBlock) {
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingAudioBlock.id
            ? {
                ...block,
                ...audioBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingAudioBlock.id ||
              block.id === editingAudioBlock.id
                ? {
                    ...block,
                    ...audioBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      if (insertionPosition !== null) {
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, audioBlock);
          return newBlocks;
        });

        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, audioBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        setContentBlocks(prevBlocks => [...prevBlocks, audioBlock]);
      }
    }

    setEditingAudioBlock(null);
  };

  const handleYouTubeUpdate = youTubeBlock => {
    if (editingYouTubeBlock) {
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingYouTubeBlock.id
            ? {
                ...block,
                ...youTubeBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingYouTubeBlock.id ||
              block.id === editingYouTubeBlock.id
                ? {
                    ...block,
                    ...youTubeBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      if (insertionPosition !== null) {
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, youTubeBlock);
          return newBlocks;
        });

        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, youTubeBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        setContentBlocks(prevBlocks => [...prevBlocks, youTubeBlock]);
      }
    }

    setEditingYouTubeBlock(null);
  };

  const handleVideoUpdate = videoBlock => {
    if (editingVideoBlock) {
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingVideoBlock.id
            ? {
                ...block,
                ...videoBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingVideoBlock.id ||
              block.id === editingVideoBlock.id
                ? {
                    ...block,
                    ...videoBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      if (insertionPosition !== null) {
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, videoBlock);
          return newBlocks;
        });

        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, videoBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        setContentBlocks(prevBlocks => [...prevBlocks, videoBlock]);
      }
    }

    setEditingVideoBlock(null);
  };

  const handleTableUpdate = (blockId, content, htmlContent, templateId) => {
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              templateId: templateId,
              tableType: templateId,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  templateId: templateId,
                  tableType: templateId,
                  details: {
                    ...block.details,
                    templateId: templateId,
                    tableType: templateId,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    setEditingTableBlock(null);
    setShowTableComponent(false);
  };

  const removeContentBlock = blockId => {
    setContentBlocks(contentBlocks.filter(block => block.id !== blockId));

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.filter(
            block => block.block_id !== blockId && block.id !== blockId
          ),
        },
      }));
    }
  };

  const updateBlockContent = (
    blockId,
    content,
    heading = null,
    subheading = null
  ) => {
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              heading,
              subheading,
              order:
                block.order !== undefined && block.order !== null
                  ? block.order
                  : block.order,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId
              ? {
                  ...block,
                  content,
                  heading,
                  subheading,
                  order:
                    block.order !== undefined && block.order !== null
                      ? block.order
                      : block.order,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  const handleEditBlock = blockId => {
    let block = contentBlocks.find(b => b.id === blockId);

    if (!block && lessonContent?.data?.content) {
      block = lessonContent.data.content.find(b => b.block_id === blockId);
    }

    if (!block) return;

    const isInteractiveBlock =
      block.type === 'interactive' ||
      (block.subtype &&
        (block.subtype === 'accordion' ||
          block.subtype === 'tabs' ||
          block.subtype === 'labeled-graphic' ||
          block.subtype === 'timeline' ||
          block.subtype === 'process')) ||
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return (
            content.template &&
            (content.tabsData ||
              content.accordionData ||
              content.labeledGraphicData ||
              content.timelineData ||
              content.processData)
          );
        } catch {
          return false;
        }
      })() ||
      (block.html_css &&
        (block.html_css.includes('interactive-tabs') ||
          block.html_css.includes('interactive-accordion') ||
          block.html_css.includes('accordion-content') ||
          block.html_css.includes('tab-button') ||
          block.html_css.includes('accordion-header') ||
          block.html_css.includes('data-template="tabs"') ||
          block.html_css.includes('data-template="accordion"') ||
          block.html_css.includes('data-template="labeled-graphic"') ||
          block.html_css.includes('data-template="timeline"') ||
          block.html_css.includes('data-template="process"') ||
          block.html_css.includes('labeled-graphic-container') ||
          block.html_css.includes('timeline-container') ||
          block.html_css.includes('process-carousel')));

    if (isInteractiveBlock) {
      block = { ...block, type: 'interactive' };
      setEditingInteractiveBlock(block);
      setShowInteractiveEditDialog(true);
      return;
    }

    const isQuoteBlock =
      block.type === 'quote' ||
      (block.textType && block.textType.startsWith('quote_')) ||
      block.details?.quote_type ||
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return content.quote && content.author;
        } catch {
          return false;
        }
      })() ||
      (block.html_css &&
        !block.html_css.includes('process-carousel') &&
        (block.html_css.includes('quote-carousel') ||
          (block.html_css.includes('carousel-dot') &&
            block.html_css.includes('blockquote')) ||
          block.html_css.includes('blockquote') ||
          block.html_css.includes('<cite') ||
          (block.html_css.includes('background-image:') &&
            block.html_css.includes('bg-gradient-to-t from-black')) ||
          (block.html_css.includes('flex items-center space-x-8') &&
            block.html_css.includes('rounded-full object-cover')) ||
          (block.html_css.includes('text-left max-w-3xl') &&
            block.html_css.includes('bg-gradient-to-br from-slate-50')) ||
          (block.html_css.includes('text-3xl md:text-4xl') &&
            block.html_css.includes('font-thin')) ||
          (block.html_css.includes('bg-gradient-to-br from-gray-50') &&
            block.html_css.includes('backdrop-blur-sm'))));

    if (isQuoteBlock) {
      let quoteType =
        block.textType || block.details?.quote_type || block.details?.quoteType;

      block = { ...block, type: 'quote' };

      if (!quoteType && block.html_css) {
        const htmlContent = block.html_css;

        if (
          htmlContent.includes('quote-carousel') ||
          htmlContent.includes('carousel-dot') ||
          htmlContent.includes('carousel-prev') ||
          htmlContent.includes('carousel-next')
        ) {
          quoteType = 'quote_carousel';
        } else if (
          htmlContent.includes('background-image:') ||
          (htmlContent.includes('bg-gradient-to-t from-black') &&
            htmlContent.includes('absolute inset-0'))
        ) {
          quoteType = 'quote_on_image';
        } else if (
          htmlContent.includes('flex items-center space-x-8') ||
          (htmlContent.includes('rounded-full object-cover') &&
            htmlContent.includes('w-16 h-16'))
        ) {
          quoteType = 'quote_c';
        } else if (
          htmlContent.includes('text-left max-w-3xl') ||
          htmlContent.includes('bg-gradient-to-br from-slate-50')
        ) {
          quoteType = 'quote_d';
        } else if (
          htmlContent.includes('text-3xl md:text-4xl') ||
          htmlContent.includes('font-thin') ||
          htmlContent.includes('text-center bg-gray-50')
        ) {
          quoteType = 'quote_b';
        } else if (
          htmlContent.includes('flex items-start space-x-4') ||
          htmlContent.includes('w-12 h-12 rounded-full') ||
          htmlContent.includes('bg-gradient-to-br from-gray-50')
        ) {
          quoteType = 'quote_a';
        } else if (
          htmlContent.includes('blockquote') &&
          htmlContent.includes('cite')
        ) {
          if (htmlContent.includes('text-center')) {
            quoteType = 'quote_b';
          } else if (htmlContent.includes('space-x-4')) {
            quoteType = 'quote_a';
          } else {
            quoteType = 'quote_a';
          }
        } else {
          quoteType = 'quote_a';
        }
      } else if (!quoteType) {
        quoteType = 'quote_a';
      }

      let quoteContent = {};
      try {
        if (block.content) {
          quoteContent = JSON.parse(block.content);
        }
      } catch (e) {
        if (block.html_css) {
          const htmlContent = block.html_css;
          const quoteMatch = htmlContent.match(
            /<blockquote[^>]*>(.*?)<\/blockquote>/s
          );
          const quoteText = quoteMatch
            ? quoteMatch[1].replace(/"/g, '').trim()
            : '';

          const authorMatch = htmlContent.match(
            /<cite[^>]*>.*?—\s*(.*?)<\/cite>/s
          );
          const authorText = authorMatch ? authorMatch[1].trim() : '';

          const imgMatch = htmlContent.match(
            /<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"[^>]*class="[^"]*rounded-full[^"]*"/
          );
          const authorImage = imgMatch ? imgMatch[1] : '';

          const bgMatch = htmlContent.match(
            /background-image:\s*url\(['"]([^'"]*)['"]\)/
          );
          const backgroundImage = bgMatch ? bgMatch[1] : '';

          quoteContent = {
            quote: quoteText,
            author: authorText,
            authorImage: authorImage,
            backgroundImage: backgroundImage,
          };
        } else {
          quoteContent = {
            quote: block.content || '',
            author: '',
            authorImage: '',
            backgroundImage: '',
          };
        }
      }

      const blockWithType = {
        ...block,
        type: 'quote',
        textType: quoteType,
        quoteType: quoteType,
        content: JSON.stringify(quoteContent),
      };
      setEditingQuoteBlock(blockWithType);

      if (quoteType === 'quote_carousel') {
        try {
          if (quoteContent.quotes && Array.isArray(quoteContent.quotes)) {
            quoteComponentRef.current?.setCarouselQuotes(quoteContent.quotes);
            quoteComponentRef.current?.setActiveCarouselTab(0);
          }
        } catch (e) {
          devLogger.error('Error setting carousel content:', e);
        }
      }

      setShowQuoteEditDialog(true);
      return;
    }

    if (block.type === 'statement') {
      let statementType =
        block.statementType ||
        block.details?.statement_type ||
        block.details?.statementType;

      if (!statementType && block.html_css) {
        const htmlContent = block.html_css;
        if (htmlContent.includes('border-t border-b border-gray-800')) {
          statementType = 'statement-a';
        } else if (
          htmlContent.includes('absolute top-0 left-1/2') &&
          htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')
        ) {
          statementType = 'statement-b';
        } else if (
          htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') &&
          htmlContent.includes('border-l-4 border-orange-500')
        ) {
          statementType = 'statement-c';
        } else if (htmlContent.includes('absolute top-0 left-0 w-16 h-1')) {
          statementType = 'statement-d';
        } else if (htmlContent.includes('border-orange-300 bg-orange-50')) {
          statementType = 'note';
        } else {
          statementType = 'statement-a';
        }
      } else if (!statementType) {
        statementType = 'statement-c';
      }

      const content = block.content || block.details?.content || '';
      const htmlCss = block.html_css || '';

      statementComponentRef.current?.handleEditStatement(
        blockId,
        statementType,
        content,
        htmlCss
      );
      return;
    }

    const isListBlock =
      block.type === 'list' ||
      block.details?.list_type ||
      block.details?.listType ||
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return content.items && Array.isArray(content.items);
        } catch {
          return false;
        }
      })() ||
      (block.html_css &&
        (block.html_css.includes(
          'bg-gradient-to-br from-orange-50 to-red-50'
        ) ||
          block.html_css.includes(
            'bg-gradient-to-br from-pink-50 to-rose-50'
          ) ||
          block.html_css.includes(
            'bg-gradient-to-br from-blue-50 to-indigo-50'
          ) ||
          block.html_css.includes('checkbox-item') ||
          block.html_css.includes('list-none') ||
          (block.html_css.includes('<ol') &&
            block.html_css.includes('space-y-4')) ||
          (block.html_css.includes('<ul') &&
            block.html_css.includes('space-y-4'))));

    if (isListBlock) {
      let listType =
        block.listType || block.details?.list_type || block.details?.listType;

      block = { ...block, type: 'list' };

      if (!listType && block.html_css) {
        const htmlContent = block.html_css;

        if (
          htmlContent.includes('bg-gradient-to-br from-orange-50 to-red-50') ||
          htmlContent.includes('from-orange-500 to-red-500') ||
          htmlContent.includes('<ol')
        ) {
          listType = 'numbered';
        } else if (
          htmlContent.includes('bg-gradient-to-br from-pink-50 to-rose-50') ||
          htmlContent.includes('checkbox-item') ||
          htmlContent.includes('border-pink-400')
        ) {
          listType = 'checkbox';
        } else if (
          htmlContent.includes('bg-gradient-to-br from-blue-50 to-indigo-50') ||
          htmlContent.includes('from-blue-500 to-indigo-500') ||
          htmlContent.includes('rounded-full shadow-sm')
        ) {
          listType = 'bulleted';
        } else if (htmlContent.includes('<ol')) {
          listType = 'numbered';
        } else if (
          htmlContent.includes('checkbox') ||
          htmlContent.includes('input type="checkbox"')
        ) {
          listType = 'checkbox';
        } else {
          listType = 'bulleted';
        }
      } else if (!listType) {
        listType = 'bulleted';
      }

      let listContent = {};
      try {
        if (block.content) {
          listContent = JSON.parse(block.content);
        }
      } catch (e) {
        if (block.html_css) {
          const htmlContent = block.html_css;
          const items = [];

          if (listType === 'numbered') {
            const matches = htmlContent.match(
              /<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else if (listType === 'checkbox') {
            const matches = htmlContent.match(
              /<div[^>]*class="flex items-start space-x-4[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/div>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else {
            const matches = htmlContent.match(
              /<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          }

          listContent = {
            items: items.length > 0 ? items : [''],
            listType: listType,
            checkedItems: {},
          };
        } else {
          listContent = {
            items: [''],
            listType: listType,
            checkedItems: {},
          };
        }
      }

      const blockWithType = {
        ...block,
        type: 'list',
        listType: listType,
        content: JSON.stringify(listContent),
      };
      setEditingListBlock(blockWithType);

      if (listComponentRef.current) {
        listComponentRef.current.setListItems(listContent.items || ['']);
        listComponentRef.current.setListType(listType);
        listComponentRef.current.setCheckedItems(
          listContent.checkedItems || {}
        );
        listComponentRef.current.setNumberingStyle(
          listContent.numberingStyle || 'decimal'
        );
      }

      setShowListEditDialog(true);
      return;
    }

    if (block.type === 'text') {
      setCurrentTextBlockId(blockId);

      // Detect master_heading from HTML content if textType is not set correctly
      let detectedType = block.textType || 'paragraph';
      const htmlContent = block.html_css || block.content || '';

      // Check for master heading (has gradient background)
      if (
        (htmlContent.includes('linear-gradient') ||
          htmlContent.includes('bg-gradient-to-r') ||
          htmlContent.includes('gradient')) &&
        (htmlContent.includes('<h1') ||
          htmlContent.includes('text-3xl') ||
          htmlContent.includes('text-4xl') ||
          htmlContent.includes('font-extrabold') ||
          block.gradient)
      ) {
        detectedType = 'master_heading';
      }

      // Also check if textType or text_type is explicitly master_heading
      if (
        block.textType === 'master_heading' ||
        block.text_type === 'master_heading'
      ) {
        detectedType = 'master_heading';
      }

      setCurrentTextType(detectedType);
      setShowTextEditorDialog(true);
      return;
    } else if (block.type === 'table') {
      let tableType =
        block.tableType ||
        block.templateId ||
        block.details?.table_type ||
        block.details?.templateId;

      if (!tableType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          tableType =
            parsedContent.templateId ||
            parsedContent.tableType ||
            'two_columns';
        } catch (e) {
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (
              htmlContent.includes('grid') &&
              htmlContent.includes('md:grid-cols-2')
            ) {
              tableType = 'two_columns';
            } else if (
              htmlContent.includes('grid') &&
              htmlContent.includes('md:grid-cols-3')
            ) {
              tableType = 'three_columns';
            } else if (
              htmlContent.includes('<table') ||
              htmlContent.includes('divide-y')
            ) {
              tableType = 'responsive_table';
            } else {
              tableType = 'two_columns';
            }
          } else {
            tableType = 'two_columns';
          }
        }
      } else if (!tableType) {
        tableType = 'two_columns';
      }

      const blockWithType = {
        ...block,
        tableType: tableType,
        templateId: tableType,
      };

      setEditingTableBlock(blockWithType);
      setShowTableComponent(true);
    } else if (block.type === 'list') {
      let listType =
        block.listType || block.details?.list_type || block.details?.listType;

      if (!listType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          listType = parsedContent.listType || 'bulleted';
        } catch (e) {
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (
              htmlContent.includes('<ol') ||
              htmlContent.includes('list-decimal')
            ) {
              listType = 'numbered';
            } else if (
              htmlContent.includes('type="checkbox"') ||
              htmlContent.includes('input[type="checkbox"]')
            ) {
              listType = 'checkbox';
            } else {
              listType = 'bulleted';
            }
          } else {
            listType = 'bulleted';
          }
        }
      } else if (!listType) {
        listType = 'bulleted';
      }

      const blockWithType = {
        ...block,
        listType: listType,
      };

      setEditingListBlock(blockWithType);
      setShowListEditDialog(true);
    } else if (block.type === 'audio') {
      setEditingAudioBlock(block);
      setShowAudioDialog(true);
    } else if (block.type === 'youtube') {
      setEditingYouTubeBlock(block);
      setShowYouTubeDialog(true);
    } else if (block.type === 'video') {
      setEditingVideoBlock(block);
      setShowVideoDialog(true);
    } else if (block.type === 'divider') {
      if (dividerComponentRef.current) {
        dividerComponentRef.current.editDivider(block);
      }
    } else if (block.type === 'link') {
      setEditingLinkBlock(block);
      setShowLinkDialog(true);
    } else if (block.type === 'pdf') {
      setEditingPdfBlock(block);
      setShowPdfDialog(true);
    }
  };

  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';

    const element = e.target;
    element.classList.add('dragging');

    const ghost = element.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);

    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleDragEnd = () => {
    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.classList.remove('dragging');
    });
    setDraggedBlockId(null);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const draggedElement = document.querySelector(
      `[data-block-id="${draggedBlockId}"]`
    );
    if (!draggedElement) return;

    const dropTarget = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-block-id]');
    if (!dropTarget || dropTarget === draggedElement) return;

    const blocks = Array.from(document.querySelectorAll('[data-block-id]'));
    const draggedIndex = blocks.indexOf(draggedElement);
    const dropIndex = blocks.indexOf(dropTarget);

    blocks.forEach(block => {
      if (block !== draggedElement) {
        block.style.transform = '';
      }
    });

    const moveUp = draggedIndex > dropIndex;
    dropTarget.style.transform = `translateY(${moveUp ? '40px' : '-40px'})`;
    dropTarget.style.transition = 'transform 0.2s ease';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    if (draggedBlockId === null || draggedBlockId === targetBlockId) return;

    if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
      const content = lessonContent.data.content;
      const sourceIndex = content.findIndex(
        b => (b.block_id || b.id) === draggedBlockId
      );
      const targetIndex = content.findIndex(
        b => (b.block_id || b.id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedContent = [...content];
      const [moved] = updatedContent.splice(sourceIndex, 1);
      updatedContent.splice(targetIndex, 0, moved);

      setLessonContent({
        ...lessonContent,
        data: {
          ...lessonContent.data,
          content: updatedContent.map((block, index) => ({
            ...block,
            order: index + 1,
          })),
        },
      });
    } else {
      const sourceIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === draggedBlockId
      );
      const targetIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedBlocks = [...contentBlocks];
      const [moved] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.splice(targetIndex, 0, moved);

      // Re-number orders so visual drag-and-drop order is preserved
      const reOrderedBlocks = updatedBlocks.map((block, index) => ({
        ...block,
        order: index + 1,
      }));

      setContentBlocks(reOrderedBlocks);
    }

    setDraggedBlockId(null);

    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.style.transition = '';
    });
  };

  const handleImageTemplateSelect = newBlock => {
    if (insertionPosition !== null) {
      // Calculate correct order based on insertion position
      const blocksToUse =
        lessonContent?.data?.content && lessonContent.data.content.length > 0
          ? lessonContent.data.content
          : contentBlocks;

      let calculatedOrder;
      if (insertionPosition === 0) {
        // Inserting at the beginning - use order slightly less than first block
        const firstBlock = blocksToUse[0];
        const firstOrder =
          firstBlock?.order !== undefined && firstBlock.order !== null
            ? firstBlock.order
            : 1;
        calculatedOrder = Math.max(0, firstOrder - 0.5);
      } else if (insertionPosition >= blocksToUse.length) {
        // Inserting at the end - use order higher than last block
        const lastBlock = blocksToUse[blocksToUse.length - 1];
        const lastOrder =
          lastBlock?.order !== undefined && lastBlock.order !== null
            ? lastBlock.order
            : blocksToUse.length;
        calculatedOrder = lastOrder + 1;
      } else {
        // Inserting between blocks - use average of previous and next block orders
        const prevBlock = blocksToUse[insertionPosition - 1];
        const nextBlock = blocksToUse[insertionPosition];
        const prevOrder =
          prevBlock?.order !== undefined && prevBlock.order !== null
            ? prevBlock.order
            : insertionPosition;
        const nextOrder =
          nextBlock?.order !== undefined && nextBlock.order !== null
            ? nextBlock.order
            : insertionPosition + 1;
        calculatedOrder = (prevOrder + nextOrder) / 2;
      }

      // Update the block with calculated order
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Adding at the end - calculate order based on last block
      const blocksToUse =
        lessonContent?.data?.content && lessonContent.data.content.length > 0
          ? lessonContent.data.content
          : contentBlocks;
      const lastBlock = blocksToUse[blocksToUse.length - 1];
      const lastOrder =
        lastBlock?.order !== undefined && lastBlock.order !== null
          ? lastBlock.order
          : blocksToUse.length;
      const blockWithOrder = {
        ...newBlock,
        order: lastOrder + 1,
      };
      setContentBlocks(prev => [...prev, blockWithOrder]);
    }
  };

  const handleImageUpdate = (newBlock, currentBlock) => {
    if (insertionPosition !== null) {
      // Calculate correct order based on insertion position
      const blocksToUse =
        lessonContent?.data?.content && lessonContent.data.content.length > 0
          ? lessonContent.data.content
          : contentBlocks;

      let calculatedOrder;
      if (insertionPosition === 0) {
        // Inserting at the beginning - use order slightly less than first block
        const firstBlock = blocksToUse[0];
        const firstOrder =
          firstBlock?.order !== undefined && firstBlock.order !== null
            ? firstBlock.order
            : 1;
        calculatedOrder = Math.max(0, firstOrder - 0.5);
      } else if (insertionPosition >= blocksToUse.length) {
        // Inserting at the end - use order higher than last block
        const lastBlock = blocksToUse[blocksToUse.length - 1];
        const lastOrder =
          lastBlock?.order !== undefined && lastBlock.order !== null
            ? lastBlock.order
            : blocksToUse.length;
        calculatedOrder = lastOrder + 1;
      } else {
        // Inserting between blocks - use average of previous and next block orders
        const prevBlock = blocksToUse[insertionPosition - 1];
        const nextBlock = blocksToUse[insertionPosition];
        const prevOrder =
          prevBlock?.order !== undefined && prevBlock.order !== null
            ? prevBlock.order
            : insertionPosition;
        const nextOrder =
          nextBlock?.order !== undefined && nextBlock.order !== null
            ? nextBlock.order
            : insertionPosition + 1;
        calculatedOrder = (prevOrder + nextOrder) / 2;
      }

      // Update the block with calculated order
      const blockWithOrder = {
        ...newBlock,
        order: calculatedOrder,
      };

      setContentBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(insertionPosition, 0, blockWithOrder);
        return newBlocks;
      });

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, blockWithOrder);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else if (
      currentBlock &&
      contentBlocks.find(b => b.id === currentBlock.id)
    ) {
      const getPlainText = html => {
        const temp =
          typeof document !== 'undefined'
            ? document.createElement('div')
            : null;
        if (!temp) return html || '';
        temp.innerHTML = html || '';
        return temp.textContent || temp.innerText || '';
      };

      setContentBlocks(prev =>
        prev.map(block =>
          block.id === currentBlock.id
            ? {
                ...newBlock,
                order:
                  currentBlock.order !== undefined &&
                  currentBlock.order !== null
                    ? currentBlock.order
                    : newBlock.order || block.order,
                imageDescription: getPlainText(
                  newBlock.text || newBlock.imageDescription || ''
                ),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prev => ({
          ...prev,
          data: {
            ...prev.data,
            content: prev.data.content.map(b =>
              b.block_id === currentBlock.id
                ? {
                    ...b,
                    order:
                      b.order !== undefined && b.order !== null
                        ? b.order
                        : newBlock.order || b.order,
                    html_css: newBlock.html_css,
                    details: newBlock.details,
                    imageUrl: newBlock.imageUrl,
                    imageTitle: newBlock.imageTitle,
                    imageDescription: getPlainText(
                      newBlock.text || newBlock.imageDescription || ''
                    ),
                    text: newBlock.text,
                    layout: newBlock.layout,
                    templateType: newBlock.templateType,
                  }
                : b
            ),
          },
        }));
      }
    } else {
      setContentBlocks(prev => [...prev, newBlock]);
    }
  };

  const toggleImageBlockEditing = blockId => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, isEditing: !block.isEditing } : block
      )
    );
  };

  const handleImageFileUpload = async (blockId, file, retryCount = 0) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleImageFileUpload
    ) {
      await imageBlockComponentRef.current.handleImageFileUpload(
        blockId,
        file,
        retryCount
      );
    }
  };

  const handleImageBlockEdit = (blockId, field, value) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleImageBlockEdit
    ) {
      imageBlockComponentRef.current.handleImageBlockEdit(
        blockId,
        field,
        value
      );
    }
  };

  const saveImageTemplateChanges = blockId => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.saveImageTemplateChanges
    ) {
      imageBlockComponentRef.current.saveImageTemplateChanges(blockId);
    }
  };

  const handleInlineImageFileUpload = (blockId, file) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleInlineImageFileUpload
    ) {
      imageBlockComponentRef.current.handleInlineImageFileUpload(blockId, file);
    }
  };

  const handleLinkUpdate = linkBlock => {
    if (editingLinkBlock) {
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingLinkBlock.id
            ? {
                ...block,
                ...linkBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingLinkBlock.id ||
              block.id === editingLinkBlock.id
                ? {
                    ...block,
                    ...linkBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      if (insertionPosition !== null) {
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, linkBlock);
          return newBlocks;
        });

        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, linkBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        setContentBlocks(prevBlocks => [...prevBlocks, linkBlock]);
      }
    }

    setEditingLinkBlock(null);
  };

  const handlePdfUpdate = pdfBlock => {
    if (editingPdfBlock) {
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingPdfBlock.id
            ? {
                ...block,
                ...pdfBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingPdfBlock.id ||
              block.id === editingPdfBlock.id
                ? {
                    ...block,
                    ...pdfBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      if (insertionPosition !== null) {
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, pdfBlock);
          return newBlocks;
        });

        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, pdfBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        setContentBlocks(prevBlocks => [...prevBlocks, pdfBlock]);
      }
    }

    setEditingPdfBlock(null);
  };

  return {
    addContentBlock,
    insertContentBlockAt,
    handleStatementSelect,
    handleStatementEdit,
    handleQuoteTemplateSelect,
    handleTableTemplateSelect,
    handleInteractiveTemplateSelect,
    handleInteractiveUpdate,
    handleDividerTemplateSelect,
    handleDividerUpdate,
    handleListTemplateSelect,
    handleListUpdate,
    handleCheckboxToggle,
    handleQuoteUpdate,
    handleAudioUpdate,
    handleYouTubeUpdate,
    handleVideoUpdate,
    handleTableUpdate,
    removeContentBlock,
    updateBlockContent,
    handleEditBlock,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleImageTemplateSelect,
    handleImageUpdate,
    toggleImageBlockEditing,
    handleImageFileUpload,
    handleImageBlockEdit,
    saveImageTemplateChanges,
    handleInlineImageFileUpload,
    handleLinkUpdate,
    handlePdfUpdate,
  };
};

export default useLessonBlocks;
