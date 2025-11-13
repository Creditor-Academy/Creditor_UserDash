import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FileText as FileTextIcon } from 'lucide-react';
import { getToolbarModules } from '@lessonbuilder/utils/quillConfig';
import {
  textTypes,
  gradientOptions,
} from '@lessonbuilder/constants/textTypesConfig';
import { toast } from 'react-hot-toast';

const TextBlockComponent = ({
  showTextTypeSidebar,
  setShowTextTypeSidebar,
  showTextEditorDialog,
  setShowTextEditorDialog,
  currentTextBlockId,
  setCurrentTextBlockId,
  currentTextType,
  setCurrentTextType,
  contentBlocks,
  setContentBlocks,
  lessonContent,
  setLessonContent,
  insertionPosition,
  setInsertionPosition,
  setSidebarCollapsed,
  onAICreation,
}) => {
  // Editor state
  const [editorTitle, setEditorTitle] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [masterHeadingGradient, setMasterHeadingGradient] =
    useState('gradient1');
  const [headingBgColor, setHeadingBgColor] = useState('#ffffff'); // Background color for heading block
  const [subheadingBgColor, setSubheadingBgColor] = useState('#ffffff');

  // Handle text type selection
  const handleTextTypeSelect = textType => {
    // Check if the block is already being added
    if (contentBlocks.some(block => block.id === `block_${Date.now()}`)) {
      return;
    }

    // For combined templates, split heading/subheading from paragraph so preview styles apply
    let heading = null;
    let subheading = null;
    let contentHtml = textType.defaultContent || '';

    if (
      textType.id === 'heading_paragraph' ||
      textType.id === 'subheading_paragraph'
    ) {
      try {
        const temp = document.createElement('div');
        temp.innerHTML = contentHtml;
        const h1 = temp.querySelector('h1');
        const h2 = temp.querySelector('h2');
        const p = temp.querySelector('p');
        if (textType.id === 'heading_paragraph') {
          heading = h1 ? h1.innerHTML : '';
        } else if (textType.id === 'subheading_paragraph') {
          subheading = h2 ? h2.innerHTML : '';
        }
        contentHtml = p ? p.innerHTML : '';
      } catch (e) {
        // ignore parsing errors and keep contentHtml as-is
      }
    }

    // Generate proper HTML content with exact same container structure as existing blocks
    let innerContent = '';
    if (textType.id === 'heading_paragraph') {
      innerContent = `<h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 1rem;">${heading || 'Heading'}</h1><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the heading.'}</p>`;
    } else if (textType.id === 'subheading_paragraph') {
      innerContent = `<h2 style="font-size: 20px; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">${subheading || 'Subheading'}</h2><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the subheading.'}</p>`;
    } else if (textType.id === 'master_heading') {
      innerContent = `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 0; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px;">${'Master Heading'}</h1>`;
    } else {
      innerContent = textType.defaultContent || contentHtml;
    }

    // Generate HTML content with proper card styling to match existing blocks
    const htmlContent =
      textType.id === 'master_heading'
        ? innerContent
        : `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="pl-4">
          ${innerContent}
        </div>
      </div>
    `;

    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'text',
      title: textType.title || 'Text Block',
      textType: textType.id,
      content: contentHtml,
      html_css: htmlContent,
      ...(heading !== null && { heading }),
      ...(subheading !== null && { subheading }),
      order:
        (lessonContent?.data?.content
          ? lessonContent.data.content.length
          : contentBlocks.length) + 1,
    };

    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
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
      // Always add to local edit list so it appears immediately in edit mode
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }

    // Close the sidebar
    setShowTextTypeSidebar(false);
    setSidebarCollapsed(true);
  };

  // Handle opening text editor for editing
  const handleTextEditorOpen = (block = null) => {
    setShowTextEditorDialog(true);
    if (block) {
      setEditorTitle(block.title || '');

      // Properly detect and set the text type
      let detectedTextType = block.textType || 'paragraph';

      // If textType is not set or unreliable, detect from HTML content
      if (!block.textType || block.textType === 'heading') {
        const htmlContent = block.html_css || block.content || '';

        // Check for master heading first (has gradient background)
        if (
          htmlContent.includes('linear-gradient') &&
          htmlContent.includes('<h1')
        ) {
          detectedTextType = 'master_heading';
        } else if (htmlContent.includes('<h1') && htmlContent.includes('<p')) {
          detectedTextType = 'heading_paragraph';
        } else if (htmlContent.includes('<h2') && htmlContent.includes('<p')) {
          detectedTextType = 'subheading_paragraph';
        } else if (htmlContent.includes('<h1')) {
          detectedTextType = 'heading';
        } else if (htmlContent.includes('<h2')) {
          detectedTextType = 'subheading';
        }
      }

      setCurrentTextType(detectedTextType);
      setCurrentTextBlockId(block.id || block.block_id);

      // Reset all editors first
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');

      // Set content based on the detected text type
      if (detectedTextType === 'heading_paragraph') {
        // For heading + paragraph, try to get from stored properties first
        if (block.heading !== undefined && block.content !== undefined) {
          setEditorHeading(block.heading || 'Heading');
          // Extract paragraph content from the stored content or html_css
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const proseDiv = tempDiv.querySelector('.prose');
          if (proseDiv) {
            setEditorContent(
              proseDiv.innerHTML || 'Enter your content here...'
            );
          } else {
            setEditorContent(block.content || 'Enter your content here...');
          }
        } else {
          // Fallback: parse from HTML
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;

          const h1Element = tempDiv.querySelector('h1');
          const proseDiv = tempDiv.querySelector('.prose');

          setEditorHeading(h1Element ? h1Element.innerHTML : 'Heading');
          setEditorContent(
            proseDiv ? proseDiv.innerHTML : 'Enter your content here...'
          );
        }
      } else if (detectedTextType === 'subheading_paragraph') {
        // For subheading + paragraph, try to get from stored properties first
        if (block.subheading !== undefined && block.content !== undefined) {
          setEditorSubheading(block.subheading || 'Subheading');
          // Extract paragraph content from the stored content or html_css
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const proseDiv = tempDiv.querySelector('.prose');
          if (proseDiv) {
            setEditorContent(
              proseDiv.innerHTML || 'Enter your content here...'
            );
          } else {
            setEditorContent(block.content || 'Enter your content here...');
          }
        } else {
          // Fallback: parse from HTML
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;

          const h2Element = tempDiv.querySelector('h2');
          const proseDiv = tempDiv.querySelector('.prose');

          setEditorSubheading(h2Element ? h2Element.innerHTML : 'Subheading');
          setEditorContent(
            proseDiv ? proseDiv.innerHTML : 'Enter your content here...'
          );
        }
      } else {
        // For single content blocks (heading, subheading, paragraph)
        const htmlContent = block.html_css || block.content || '';

        // Special handling for master heading to preserve text content only
        if (detectedTextType === 'master_heading') {
          if (htmlContent.includes('<h1')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const h1Element = tempDiv.querySelector('h1');
            if (h1Element) {
              // Extract only the text content, not the styling
              setEditorHtml(
                h1Element.textContent || h1Element.innerText || 'Master Heading'
              );
            } else {
              setEditorHtml('Master Heading');
            }

            // Detect gradient from existing content
            const gradientDiv = tempDiv.querySelector(
              'div[style*="linear-gradient"]'
            );
            if (gradientDiv) {
              const style = gradientDiv.getAttribute('style') || '';
              // Try to match with our gradient options
              const matchedGradient = gradientOptions.find(option =>
                style.includes(
                  option.gradient
                    .replace('linear-gradient(', '')
                    .replace(')', '')
                )
              );
              if (matchedGradient) {
                setMasterHeadingGradient(matchedGradient.id);
              } else {
                setMasterHeadingGradient('gradient1'); // Default fallback
              }
            } else {
              setMasterHeadingGradient('gradient1'); // Default
            }
          } else {
            setEditorHtml(htmlContent || 'Master Heading');
            setMasterHeadingGradient('gradient1'); // Default
          }
        } else {
          // Extract the inner content while preserving rich text formatting for other types
          if (htmlContent.includes('<')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            // Find the main content element
            const contentElement = tempDiv.querySelector(
              'h1, h2, h3, h4, h5, h6, p, div'
            );
            if (contentElement) {
              setEditorHtml(contentElement.innerHTML);
            } else {
              setEditorHtml(htmlContent);
            }

            // Extract background color for heading and subheading blocks
            if (detectedTextType === 'heading') {
              if (block.headingBgColor) {
                setHeadingBgColor(block.headingBgColor);
              } else {
                const containerDiv = tempDiv.querySelector(
                  'div[style*="background-color"]'
                );
                if (containerDiv) {
                  const style = containerDiv.getAttribute('style') || '';
                  const bgColorMatch = style.match(
                    /background-color:\s*([^;]+)/
                  );
                  if (bgColorMatch) {
                    setHeadingBgColor(bgColorMatch[1].trim());
                  } else {
                    setHeadingBgColor('#ffffff');
                  }
                } else {
                  setHeadingBgColor('#ffffff');
                }
              }
            } else if (detectedTextType === 'subheading') {
              if (block.subheadingBgColor) {
                setSubheadingBgColor(block.subheadingBgColor);
              } else {
                const containerDiv = tempDiv.querySelector(
                  'div[style*="background-color"]'
                );
                if (containerDiv) {
                  const style = containerDiv.getAttribute('style') || '';
                  const bgColorMatch = style.match(
                    /background(?:-color)?:\s*([^;]+)/i
                  );
                  if (bgColorMatch) {
                    setSubheadingBgColor(bgColorMatch[1].trim());
                  } else {
                    setSubheadingBgColor('#ffffff');
                  }
                } else {
                  setSubheadingBgColor('#ffffff');
                }
              }
            }
          } else {
            setEditorHtml(htmlContent);
            if (detectedTextType === 'heading') {
              setHeadingBgColor(block.headingBgColor || '#ffffff');
            } else if (detectedTextType === 'subheading') {
              setSubheadingBgColor(block.subheadingBgColor || '#ffffff');
            }
          }
        }
      }
    } else {
      setEditorTitle('');
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
      setCurrentTextBlockId(null);
      setCurrentTextType(null);
      setHeadingBgColor('#ffffff');
      setSubheadingBgColor('#ffffff');
    }
  };

  // Handle saving text editor changes
  const handleTextEditorSave = () => {
    try {
      // First try to find block in contentBlocks (for new lessons)
      let blockToUpdate = contentBlocks.find(b => b.id === currentTextBlockId);

      // If not found, try to find in lessonContent (for fetched lessons)
      if (!blockToUpdate && lessonContent?.data?.content) {
        blockToUpdate = lessonContent.data.content.find(
          b => b.block_id === currentTextBlockId
        );
      }

      if (blockToUpdate) {
        let updatedContent = '';

        // Use currentTextType (detected type) or fallback to blockToUpdate.textType
        let effectiveTextType = currentTextType || blockToUpdate.textType;

        // Double-check for master heading if textType seems wrong
        if (effectiveTextType === 'heading' && blockToUpdate.html_css) {
          const htmlContent = blockToUpdate.html_css || '';
          if (
            htmlContent.includes('linear-gradient') &&
            htmlContent.includes('<h1')
          ) {
            effectiveTextType = 'master_heading';
          }
        }

        // Always use consistent HTML generation for all text types to avoid double-update issues
        const textType = textTypes.find(t => t.id === effectiveTextType);

        if (
          effectiveTextType === 'heading_paragraph' ||
          effectiveTextType === 'subheading_paragraph'
        ) {
          // For compound templates, combine heading/subheading with paragraph in styled container
          const headingTag =
            effectiveTextType === 'heading_paragraph' ? 'h1' : 'h2';
          const headingFontSize =
            effectiveTextType === 'heading_paragraph' ? '24px' : '20px';
          const headingFontWeight =
            effectiveTextType === 'heading_paragraph' ? 'bold' : '600';

          // Use the correct content variables for each template type
          let headingContent =
            effectiveTextType === 'heading_paragraph'
              ? editorHeading
              : editorSubheading;
          let paragraphContent = editorContent;

          // Process heading content for alignment
          if (headingContent) {
            const hasHeadingAlignment =
              headingContent.includes('ql-align-center') ||
              headingContent.includes('ql-align-right') ||
              headingContent.includes('ql-align-justify') ||
              headingContent.includes('text-align: center') ||
              headingContent.includes('text-align: right') ||
              headingContent.includes('text-align: justify');

            if (hasHeadingAlignment) {
              headingContent = headingContent
                .replace(
                  /class="[^"]*ql-align-center[^"]*"/g,
                  'style="text-align: center"'
                )
                .replace(
                  /class="[^"]*ql-align-right[^"]*"/g,
                  'style="text-align: right"'
                )
                .replace(
                  /class="[^"]*ql-align-justify[^"]*"/g,
                  'style="text-align: justify"'
                )
                .replace(
                  /class="[^"]*ql-align-left[^"]*"/g,
                  'style="text-align: left"'
                );
            }
          }

          // Process paragraph content for alignment
          if (paragraphContent) {
            const hasParagraphAlignment =
              paragraphContent.includes('ql-align-center') ||
              paragraphContent.includes('ql-align-right') ||
              paragraphContent.includes('ql-align-justify') ||
              paragraphContent.includes('text-align: center') ||
              paragraphContent.includes('text-align: right') ||
              paragraphContent.includes('text-align: justify');

            if (hasParagraphAlignment) {
              paragraphContent = paragraphContent
                .replace(
                  /class="[^"]*ql-align-center[^"]*"/g,
                  'style="text-align: center"'
                )
                .replace(
                  /class="[^"]*ql-align-right[^"]*"/g,
                  'style="text-align: right"'
                )
                .replace(
                  /class="[^"]*ql-align-justify[^"]*"/g,
                  'style="text-align: justify"'
                )
                .replace(
                  /class="[^"]*ql-align-left[^"]*"/g,
                  'style="text-align: left"'
                );
            }
          }

          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                <${headingTag} style="font-size: ${headingFontSize} !important; font-weight: ${headingFontWeight}; color: #1F2937; margin: 0 0 16px 0; line-height: 1.2;">${headingContent || (effectiveTextType === 'heading_paragraph' ? 'Heading' : 'Subheading')}</${headingTag}>
                <div class="prose prose-lg max-w-none text-gray-700">
                  ${paragraphContent || 'Start typing your content here...'}
                </div>
              </article>
            </div>
          `;
        } else if (effectiveTextType === 'heading') {
          // For heading blocks, preserve Quill editor styling including alignment
          let styledContent = editorHtml || '<h1>Heading</h1>';

          // If the content doesn't have proper heading tags, wrap it in h1 with default styling
          if (
            !styledContent.includes('<h1') &&
            !styledContent.includes('<h2') &&
            !styledContent.includes('<h3')
          ) {
            styledContent = `<h1 style="font-size: 24px; font-weight: bold; margin: 0;">${styledContent}</h1>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment =
              styledContent.includes('ql-align-center') ||
              styledContent.includes('ql-align-right') ||
              styledContent.includes('ql-align-justify') ||
              styledContent.includes('text-align: center') ||
              styledContent.includes('text-align: right') ||
              styledContent.includes('text-align: justify');

            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(
                  /class="[^"]*ql-align-center[^"]*"/g,
                  'style="text-align: center"'
                )
                .replace(
                  /class="[^"]*ql-align-right[^"]*"/g,
                  'style="text-align: right"'
                )
                .replace(
                  /class="[^"]*ql-align-justify[^"]*"/g,
                  'style="text-align: justify"'
                )
                .replace(
                  /class="[^"]*ql-align-left[^"]*"/g,
                  'style="text-align: left"'
                );
            }

            // Preserve existing styles but ensure proper default size if no size is specified
            styledContent = styledContent.replace(
              /<h1([^>]*?)>/g,
              (match, attrs) => {
                // Check if style attribute exists
                if (attrs.includes('style=')) {
                  // Extract existing styles and add default size if not present
                  const styleMatch = attrs.match(/style="([^"]*)"/);
                  if (styleMatch) {
                    let existingStyles = styleMatch[1];
                    // Only add font-size if it's not already present
                    if (!existingStyles.includes('font-size')) {
                      existingStyles += '; font-size: 24px';
                    }
                    if (!existingStyles.includes('font-weight')) {
                      existingStyles += '; font-weight: bold';
                    }
                    if (!existingStyles.includes('color')) {
                      existingStyles += '; color: #1F2937';
                    }
                    if (!existingStyles.includes('margin')) {
                      existingStyles += '; margin: 0';
                    }
                    if (!existingStyles.includes('line-height')) {
                      existingStyles += '; line-height: 1.2';
                    }
                    return `<h1${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                  }
                } else {
                  // No style attribute, add default styles
                  return `<h1${attrs} style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">`;
                }
                return match;
              }
            );
          }

          updatedContent = `
            <div class="relative rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1" style="background-color: ${headingBgColor};">
              <article class="max-w-none">
                  ${styledContent}
              </article>
            </div>
          `;
        } else if (effectiveTextType === 'subheading') {
          // For subheading blocks, preserve Quill editor styling including alignment
          let styledContent = editorHtml || '<h2>Subheading</h2>';

          // If the content doesn't have proper heading tags, wrap it in h2 with default styling
          if (
            !styledContent.includes('<h1') &&
            !styledContent.includes('<h2') &&
            !styledContent.includes('<h3')
          ) {
            styledContent = `<h2 style="font-size: 20px; font-weight: 600; margin: 0;">${styledContent}</h2>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment =
              styledContent.includes('ql-align-center') ||
              styledContent.includes('ql-align-right') ||
              styledContent.includes('ql-align-justify') ||
              styledContent.includes('text-align: center') ||
              styledContent.includes('text-align: right') ||
              styledContent.includes('text-align: justify');

            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(
                  /class="[^"]*ql-align-center[^"]*"/g,
                  'style="text-align: center"'
                )
                .replace(
                  /class="[^"]*ql-align-right[^"]*"/g,
                  'style="text-align: right"'
                )
                .replace(
                  /class="[^"]*ql-align-justify[^"]*"/g,
                  'style="text-align: justify"'
                )
                .replace(
                  /class="[^"]*ql-align-left[^"]*"/g,
                  'style="text-align: left"'
                );
            }

            // Preserve existing styles but ensure proper default size if no size is specified
            styledContent = styledContent.replace(
              /<h2([^>]*?)>/g,
              (match, attrs) => {
                // Check if style attribute exists
                if (attrs.includes('style=')) {
                  // Extract existing styles and add default size if not present
                  const styleMatch = attrs.match(/style="([^"]*)"/);
                  if (styleMatch) {
                    let existingStyles = styleMatch[1];
                    // Only add font-size if it's not already present
                    if (!existingStyles.includes('font-size')) {
                      existingStyles += '; font-size: 20px';
                    }
                    if (!existingStyles.includes('font-weight')) {
                      existingStyles += '; font-weight: 600';
                    }
                    if (!existingStyles.includes('color')) {
                      existingStyles += '; color: #1F2937';
                    }
                    if (!existingStyles.includes('margin')) {
                      existingStyles += '; margin: 0';
                    }
                    if (!existingStyles.includes('line-height')) {
                      existingStyles += '; line-height: 1.2';
                    }
                    return `<h2${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                  }
                } else {
                  // No style attribute, add default styles
                  return `<h2${attrs} style="font-size: 20px; font-weight: 600; color: #1F2937; margin: 0; line-height: 1.2;">`;
                }
                return match;
              }
            );
          }

          updatedContent = `
            <div class="relative rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1" style="background-color: ${subheadingBgColor || '#ffffff'};">
              <article class="max-w-none">
                  ${styledContent}
              </article>
            </div>`;
        } else if (effectiveTextType === 'master_heading') {
          // For master heading, preserve Quill editor styling including alignment and use selected gradient
          let styledContent = editorHtml || 'Master Heading';

          // Get the selected gradient
          const selectedGradient =
            gradientOptions.find(g => g.id === masterHeadingGradient) ||
            gradientOptions[0];

          // Ensure master heading has proper size if no size is specified
          if (
            !styledContent.includes('<h1') &&
            !styledContent.includes('<h2') &&
            !styledContent.includes('<h3')
          ) {
            styledContent = `<h1 style="font-size: 40px; font-weight: 600; margin: 0;">${styledContent}</h1>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment =
              styledContent.includes('ql-align-center') ||
              styledContent.includes('ql-align-right') ||
              styledContent.includes('ql-align-justify') ||
              styledContent.includes('text-align: center') ||
              styledContent.includes('text-align: right') ||
              styledContent.includes('text-align: justify');

            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(
                  /class="[^"]*ql-align-center[^"]*"/g,
                  'style="text-align: center"'
                )
                .replace(
                  /class="[^"]*ql-align-right[^"]*"/g,
                  'style="text-align: right"'
                )
                .replace(
                  /class="[^"]*ql-align-justify[^"]*"/g,
                  'style="text-align: justify"'
                )
                .replace(
                  /class="[^"]*ql-align-left[^"]*"/g,
                  'style="text-align: left"'
                );
            }

            // Ensure h1 tags have proper default size for master heading if no size is specified
            styledContent = styledContent.replace(
              /<h1([^>]*?)>/g,
              (match, attrs) => {
                // Check if style attribute exists
                if (attrs.includes('style=')) {
                  // Extract existing styles and add default size if not present
                  const styleMatch = attrs.match(/style="([^"]*)"/);
                  if (styleMatch) {
                    let existingStyles = styleMatch[1];
                    // Only add font-size if it's not already present
                    if (!existingStyles.includes('font-size')) {
                      existingStyles += '; font-size: 40px';
                    }
                    if (!existingStyles.includes('font-weight')) {
                      existingStyles += '; font-weight: 600';
                    }
                    if (!existingStyles.includes('color')) {
                      existingStyles += '; color: white';
                    }
                    if (!existingStyles.includes('margin')) {
                      existingStyles += '; margin: 0';
                    }
                    if (!existingStyles.includes('line-height')) {
                      existingStyles += '; line-height: 1.2';
                    }
                    return `<h1${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                  }
                } else {
                  // No style attribute, add default styles
                  return `<h1${attrs} style="font-size: 40px; font-weight: 600; color: white; margin: 0; line-height: 1.2;">`;
                }
                return match;
              }
            );
          }

          updatedContent = `<div style="background: ${selectedGradient.gradient}; padding: 20px; border-radius: 8px; color: white;">${styledContent}</div>`;
        } else {
          // For paragraph and other single content blocks - preserve alignment
          let styledContent = editorHtml || 'Enter your content here...';

          // Check if content has alignment classes from Quill
          const hasAlignment =
            styledContent.includes('ql-align-center') ||
            styledContent.includes('ql-align-right') ||
            styledContent.includes('ql-align-justify') ||
            styledContent.includes('text-align: center') ||
            styledContent.includes('text-align: right') ||
            styledContent.includes('text-align: justify');

          // If content has Quill alignment classes, convert them to inline styles
          if (hasAlignment) {
            styledContent = styledContent
              .replace(
                /class="[^"]*ql-align-center[^"]*"/g,
                'style="text-align: center"'
              )
              .replace(
                /class="[^"]*ql-align-right[^"]*"/g,
                'style="text-align: right"'
              )
              .replace(
                /class="[^"]*ql-align-justify[^"]*"/g,
                'style="text-align: justify"'
              )
              .replace(
                /class="[^"]*ql-align-left[^"]*"/g,
                'style="text-align: left"'
              );
          }

          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                <div class="prose prose-lg max-w-none text-gray-700">
                  ${styledContent}
                </div>
              </article>
            </div>
          `;
        }

        // Ensure updatedContent is never empty
        if (!updatedContent || updatedContent.trim() === '') {
          updatedContent = `
            <div class="content-block" style="font-size: 16px; line-height: 1.6; color: #4B5563;">
              Enter your content here...
            </div>
          `;
        }

        // Update contentBlocks with error handling
        setContentBlocks(blocks => {
          try {
            return blocks.map(block =>
              block.id === currentTextBlockId
                ? {
                    ...block,
                    content: updatedContent,
                    html_css: updatedContent,
                    heading:
                      effectiveTextType === 'heading_paragraph'
                        ? editorHeading || block.heading
                        : block.heading,
                    subheading:
                      effectiveTextType === 'subheading_paragraph'
                        ? editorSubheading || block.subheading
                        : block.subheading,
                    headingBgColor:
                      effectiveTextType === 'heading'
                        ? headingBgColor
                        : block.headingBgColor, // Store background color
                    subheadingBgColor:
                      effectiveTextType === 'subheading'
                        ? subheadingBgColor || '#ffffff'
                        : block.subheadingBgColor,
                    updatedAt: new Date().toISOString(),
                    textType: effectiveTextType || block.textType,
                  }
                : block
            );
          } catch (error) {
            console.error('Error updating contentBlocks:', error);
            toast.error('Failed to update content blocks');
            return blocks;
          }
        });

        // Also update lessonContent if it exists (for fetched lessons)
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => ({
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: prevLessonContent.data.content.map(block =>
                block.block_id === currentTextBlockId
                  ? {
                      ...block,
                      content: updatedContent,
                      html_css: updatedContent,
                      heading:
                        effectiveTextType === 'heading_paragraph'
                          ? editorHeading || block.heading
                          : block.heading,
                      subheading:
                        effectiveTextType === 'subheading_paragraph'
                          ? editorSubheading || block.subheading
                          : block.subheading,
                      headingBgColor:
                        effectiveTextType === 'heading'
                          ? headingBgColor
                          : block.headingBgColor, // Store background color
                      subheadingBgColor:
                        effectiveTextType === 'subheading'
                          ? subheadingBgColor || '#ffffff'
                          : block.subheadingBgColor,
                      updatedAt: new Date().toISOString(),
                      textType: effectiveTextType || block.textType,
                    }
                  : block
              ),
            },
          }));
        }
      } else {
        // For new blocks
        const effectiveTextTypeForNew = currentTextType || 'paragraph';
        let newBlockContent = '';

        // Generate content based on textType
        if (
          effectiveTextTypeForNew === 'heading_paragraph' ||
          effectiveTextTypeForNew === 'subheading_paragraph'
        ) {
          const headingTag =
            effectiveTextTypeForNew === 'heading_paragraph' ? 'h1' : 'h2';
          const headingClass =
            effectiveTextTypeForNew === 'heading_paragraph'
              ? 'text-2xl font-bold'
              : 'text-xl font-semibold';

          newBlockContent = `
            <div class="content-block">
              <${headingTag} class="${headingClass} text-gray-800 mb-4">${editorHeading || (effectiveTextTypeForNew === 'heading_paragraph' ? 'Heading' : 'Subheading')}</${headingTag}>
              <div class="prose prose-lg max-w-none text-gray-700">
                ${editorHtml || 'Start typing your content here...'}
              </div>
            </div>
          `;
        } else if (effectiveTextTypeForNew === 'heading') {
          // Preserve Quill editor styling including alignment
          let styledContent = editorHtml || 'Heading';

          // If the content doesn't have proper heading tags, wrap it in h1 with default styling
          if (
            !styledContent.includes('<h1') &&
            !styledContent.includes('<h2') &&
            !styledContent.includes('<h3')
          ) {
            styledContent = `<h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">${styledContent}</h1>`;
          } else {
            // Ensure h1 tags have proper default size if no size is specified, but preserve alignment
            styledContent = styledContent.replace(
              /<h1([^>]*?)>/g,
              (match, attrs) => {
                if (!attrs.includes('style') || !attrs.includes('font-size')) {
                  return `<h1${attrs} style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">`;
                }
                return match;
              }
            );
          }

          newBlockContent = `
            <div class="relative rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1" style="background-color: ${headingBgColor};">
              <article class="max-w-none">
                ${styledContent}
              </article>
            </div>`;
        } else if (effectiveTextTypeForNew === 'subheading') {
          // Preserve Quill editor styling including alignment
          let styledContent = editorHtml || 'Subheading';

          // If the content doesn't have proper heading tags, wrap it in h2 with default styling
          if (
            !styledContent.includes('<h1') &&
            !styledContent.includes('<h2') &&
            !styledContent.includes('<h3')
          ) {
            styledContent = `<h2 style="font-size: 20px; font-weight: 600; margin: 0;">${styledContent}</h2>`;
          } else {
            // Ensure h2 tags have proper default size if no size is specified, but preserve alignment
            styledContent = styledContent.replace(
              /<h2([^>]*?)>/g,
              (match, attrs) => {
                if (!attrs.includes('style') || !attrs.includes('font-size')) {
                  return `<h2${attrs} style="font-size: 20px; font-weight: 600; margin: 0;">`;
                }
                return match;
              }
            );
          }

          newBlockContent = `
            <div class="relative rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1" style="background-color: ${subheadingBgColor || '#ffffff'};">
              <article class="max-w-none">
                ${styledContent}
              </article>
            </div>`;
        }

        const newBlock = {
          id: `text_${Date.now()}`,
          block_id: `text_${Date.now()}`,
          type: 'text',
          title: editorTitle || 'Text Block',
          content: newBlockContent,
          html_css: newBlockContent,
          textType: effectiveTextTypeForNew,
          heading:
            effectiveTextTypeForNew === 'heading_paragraph'
              ? editorHeading
              : undefined,
          subheading:
            effectiveTextTypeForNew === 'subheading_paragraph'
              ? editorSubheading
              : undefined,
          headingBgColor:
            effectiveTextTypeForNew === 'heading' ? headingBgColor : undefined, // Store background color for heading blocks
          subheadingBgColor:
            effectiveTextTypeForNew === 'subheading'
              ? subheadingBgColor || '#ffffff'
              : undefined,
          style:
            textTypes.find(t => t.id === effectiveTextTypeForNew)?.style || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order:
            (lessonContent?.data?.content
              ? lessonContent.data.content.length
              : contentBlocks.length) + 1,
        };

        // If we have existing lesson content, add to that structure
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => ({
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: [...prevLessonContent.data.content, newBlock],
            },
          }));
        } else {
          setContentBlocks(prev => [...prev, newBlock]);
        }
      }

      // Close the dialog and reset form
      handleTextEditorClose();

      // Show success message
      toast.success('Text block updated successfully');
    } catch (error) {
      console.error('Error in handleTextEditorSave:', error);
      toast.error('Failed to save text block. Please try again.');
    }
  };

  // Handle closing text editor
  const handleTextEditorClose = () => {
    setShowTextEditorDialog(false);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
    setCurrentTextType(null);
    setEditorHeading('');
    setEditorSubheading('');
    setEditorContent('');
    setMasterHeadingGradient('gradient1');
    setHeadingBgColor('#ffffff'); // Reset background color
    setSubheadingBgColor('#ffffff');
  };

  // Allow opening the text editor from parent
  useEffect(() => {
    if (currentTextBlockId && showTextEditorDialog) {
      const block =
        contentBlocks.find(b => b.id === currentTextBlockId) ||
        lessonContent?.data?.content?.find(
          b => b.block_id === currentTextBlockId
        );
      if (block) {
        handleTextEditorOpen(block);
      }
    }
  }, [currentTextBlockId, showTextEditorDialog]);

  return (
    <>
      {/* Text Type Sidebar */}
      {showTextTypeSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            onClick={() => setShowTextTypeSidebar(false)}
          />

          {/* Sidebar */}
          <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileTextIcon className="h-6 w-6" />
                  Text Types
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextTypeSidebar(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a text type to add to your lesson
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* AI Generation Option */}
              <div
                onClick={() => {
                  setShowTextTypeSidebar(false);
                  // Call the AI creation handler from parent
                  if (onAICreation) {
                    onAICreation({ id: 'text', title: 'Text' });
                  }
                }}
                className="p-5 border rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 group bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-purple-600 mt-1 group-hover:text-purple-700">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 group-hover:text-purple-900 text-base flex items-center gap-2">
                      Generate with AI
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Describe what you want and let AI create professional text
                      content instantly
                    </p>
                  </div>
                </div>

                {/* Mini Preview */}
                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      AI-powered content generation
                    </span>
                  </div>
                </div>
              </div>

              {textTypes.map(textType => (
                <div
                  key={textType.id}
                  onClick={() => handleTextTypeSelect(textType)}
                  className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                      {textType.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">
                        {textType.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {textType.description}
                      </p>
                    </div>
                  </div>

                  {/* Mini Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    {textType.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Dialog */}
      <Dialog open={showTextEditorDialog} onOpenChange={handleTextEditorClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {currentTextBlockId ? 'Edit' : 'Add'} Text Block
              {(() => {
                const currentBlock = contentBlocks.find(
                  b => b.id === currentTextBlockId
                );
                const textType = currentTextType || currentBlock?.textType;
                if (textType) {
                  const textTypeObj = textTypes.find(t => t.id === textType);
                  return textTypeObj ? ` (${textTypeObj.title})` : '';
                }
                return '';
              })()}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
            <div className="pr-4">
              {(() => {
                const currentBlock = contentBlocks.find(
                  b => b.id === currentTextBlockId
                );
                const textType = currentTextType || currentBlock?.textType;

                // Heading only
                if (textType === 'heading') {
                  return (
                    <div className="space-y-4">
                      <div className="flex-1 flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heading
                        </label>
                        <div
                          className="flex-1 flex flex-col border rounded-md overflow-visible bg-white"
                          style={{ height: '350px' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorHtml}
                            onChange={setEditorHtml}
                            modules={getToolbarModules('heading')}
                            placeholder="Enter your heading text..."
                            style={{ height: '300px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>

                      {/* Background Color Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={headingBgColor}
                            onChange={e => setHeadingBgColor(e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={headingBgColor}
                            onChange={e => setHeadingBgColor(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="#ffffff"
                          />
                        </div>
                        {/* Preview */}
                        <div
                          className="mt-3 p-4 rounded-lg border border-gray-200"
                          style={{ backgroundColor: headingBgColor }}
                        >
                          <p className="text-sm text-gray-600 text-center">
                            Background Preview
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Subheading only
                if (textType === 'subheading') {
                  return (
                    <div className="space-y-4">
                      <div className="flex-1 flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subheading
                        </label>
                        <div
                          className="flex-1 flex flex-col border rounded-md overflow-visible bg-white"
                          style={{ height: '350px' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorHtml}
                            onChange={setEditorHtml}
                            modules={getToolbarModules('heading')}
                            placeholder="Enter your subheading text..."
                            style={{ height: '300px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={subheadingBgColor}
                            onChange={e => setSubheadingBgColor(e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={subheadingBgColor}
                            onChange={e => setSubheadingBgColor(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="#ffffff"
                          />
                        </div>
                        <div
                          className="mt-3 p-4 rounded-lg border border-gray-200"
                          style={{ backgroundColor: subheadingBgColor }}
                        >
                          <p className="text-sm text-gray-600 text-center">
                            Background Preview
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Paragraph only
                if (textType === 'paragraph') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paragraph
                      </label>
                      <div
                        className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white"
                        style={{ height: '350px' }}
                      >
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('paragraph')}
                          placeholder="Enter your paragraph text..."
                          style={{ height: '300px' }}
                        />
                      </div>
                    </div>
                  );
                }

                // Heading with Paragraph
                if (textType === 'heading_paragraph') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heading
                        </label>
                        <div
                          className="border rounded-md bg-white overflow-visible"
                          style={{ height: '120px' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorHeading}
                            onChange={setEditorHeading}
                            modules={getToolbarModules('heading')}
                            placeholder="Type and format your heading here"
                            style={{ height: '80px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div
                          className="border rounded-md bg-white overflow-visible"
                          style={{ height: '230px' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={getToolbarModules('paragraph')}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '180px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Subheading with Paragraph
                if (textType === 'subheading_paragraph') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subheading
                        </label>
                        <div
                          className="border rounded-md bg-white"
                          style={{ height: '120px', overflow: 'visible' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorSubheading}
                            onChange={setEditorSubheading}
                            modules={getToolbarModules('heading')}
                            placeholder="Type and format your subheading here"
                            style={{ height: '80px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div
                          className="border rounded-md bg-white"
                          style={{ height: '230px', overflow: 'visible' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={getToolbarModules('paragraph')}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '180px' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Master Heading with gradient options
                if (textType === 'master_heading') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Master Heading
                        </label>
                        <div
                          className="border rounded-md bg-white overflow-visible"
                          style={{ height: '120px' }}
                        >
                          <ReactQuill
                            theme="snow"
                            value={editorHtml}
                            onChange={setEditorHtml}
                            modules={getToolbarModules('heading')}
                            placeholder="Enter your master heading text..."
                            style={{ height: '80px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gradient Color
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {gradientOptions.map(option => (
                            <div
                              key={option.id}
                              className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                masterHeadingGradient === option.id
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() =>
                                setMasterHeadingGradient(option.id)
                              }
                            >
                              <div
                                className={`h-8 w-full rounded bg-gradient-to-r ${option.preview} mb-2`}
                                style={{ background: option.gradient }}
                              />
                              <p className="text-xs text-center text-gray-600 font-medium">
                                {option.name}
                              </p>
                              {masterHeadingGradient === option.id && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-2 h-2 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Default fallback for new blocks or unknown types
                return (
                  <div className="flex-1 flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading
                    </label>
                    <div className="flex-1 flex flex-col border rounded-md overflow-visible bg-white">
                      <ReactQuill
                        theme="snow"
                        value={editorHtml}
                        onChange={setEditorHtml}
                        modules={getToolbarModules('heading')}
                        placeholder="Enter your heading text..."
                        className="flex-1 quill-editor-overflow-visible"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex justify-end gap-2 px-6 pb-4">
            <Button
              variant="outline"
              onClick={handleTextEditorClose}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTextEditorSave}
              className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
            >
              {currentTextBlockId ? 'Update' : 'Add'} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TextBlockComponent;
