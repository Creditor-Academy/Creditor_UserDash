import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Image, X, Loader2, Crop, Grid3x3, Layout } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/services/imageUploadService';
import devLogger from '@lessonbuilder/utils/devLogger';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageEditor from './ImageEditor';
import ImageGallery from './ImageGallery';
import ImageTypeSelector from './ImageTypeSelector';

const ImageBlockComponent = forwardRef(
  (
    {
      showImageTemplateSidebar,
      setShowImageTemplateSidebar,
      showImageDialog,
      setShowImageDialog,
      onImageTemplateSelect,
      onImageUpdate,
      editingImageBlock,
      imageUploading,
      setImageUploading,
      contentBlocks,
      setContentBlocks,
      lessonContent,
      onAICreation,
    },
    ref
  ) => {
    // Image state
    const [imageTitle, setImageTitle] = useState('');
    const [imageDescription, setImageDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageTemplateText, setImageTemplateText] = useState('');
    const [imageAlignment, setImageAlignment] = useState('left');
    const [standaloneImageAlignment, setStandaloneImageAlignment] =
      useState('center');
    const [mainImageUploading, setMainImageUploading] = useState(false);
    const [currentBlock, setCurrentBlock] = useState(null);

    // Image Editor state
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [imageToEdit, setImageToEdit] = useState(null);
    const [imageEditorTitle, setImageEditorTitle] = useState('Edit Image');

    // Gallery state
    const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'templates'
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [pendingGalleryImage, setPendingGalleryImage] = useState(null);

    // Image block templates
    const imageTemplates = [
      {
        id: 'image-text',
        title: 'Image & text',
        description: 'Image with text content side by side',
        icon: <Image className="h-6 w-6" />,
        layout: 'side-by-side',
        alignment: 'left',
        defaultContent: {
          imageUrl:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          text: 'When we show up to the present moment with all of our senses, we invite the world to fill us with joy. The pains of the past are behind us. The future has yet to unfold. But the now is full of beauty always waiting for our attention.',
        },
      },
      {
        id: 'text-on-image',
        title: 'Text on image',
        description: 'Text overlay on background image',
        icon: <Image className="h-6 w-6" />,
        layout: 'overlay',
        defaultContent: {
          imageUrl:
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          text: 'Daylight in the forest. Light filters through the trees and the forest. Every step is filled with the sounds of nature, and the scent of pine and earth fills the air. This is where peace begins.',
        },
      },
      {
        id: 'image-centered',
        title: 'Image centered',
        description: 'Centered image with optional caption',
        icon: <Image className="h-6 w-6" />,
        layout: 'centered',
        alignment: 'center',
        defaultContent: {
          imageUrl:
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          text: 'A peaceful moment captured in time',
        },
      },
      {
        id: 'image-full-width',
        title: 'Image full width',
        description: 'Full width image with text below',
        icon: <Image className="h-6 w-6" />,
        layout: 'full-width',
        defaultContent: {
          imageUrl:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
          text: 'When we show up to the present moment with all of our senses, we invite the world to fill us with joy.',
        },
      },
    ];

    // Expose methods to parent if needed
    useImperativeHandle(ref, () => ({
      handleImageFileUpload,
      handleImageBlockEdit,
      saveImageTemplateChanges,
      handleInlineImageFileUpload,
      handleEditImage: blockId => {
        devLogger.debug('🔍 handleEditImage called with blockId:', blockId);
        devLogger.debug('🔍 contentBlocks length:', contentBlocks.length);
        devLogger.debug('🔍 lessonContent exists:', !!lessonContent);
        devLogger.debug(
          '🔍 lessonContent.data.content length:',
          lessonContent?.data?.content?.length || 0
        );

        // Find block from both contentBlocks and lessonContent
        let block = contentBlocks.find(b => {
          const matches = b.id === blockId || b.block_id === blockId;
          if (matches) {
            devLogger.debug('✅ Found block in contentBlocks:', {
              id: b.id,
              block_id: b.block_id,
              type: b.type,
              hasImageUrl: !!b.imageUrl,
              hasDetails: !!b.details,
            });
          }
          return matches;
        });

        // If not found, try to get from lessonContent (for AI-generated blocks from course creation)
        if (!block && lessonContent?.data?.content) {
          block = lessonContent.data.content.find(b => {
            const matches = (b.block_id || b.id) === blockId;
            if (matches) {
              devLogger.debug('✅ Found block in lessonContent:', {
                id: b.id,
                block_id: b.block_id,
                type: b.type,
                hasImageUrl: !!b.imageUrl,
                hasDetails: !!b.details,
                detailsKeys: b.details ? Object.keys(b.details) : [],
              });
            }
            return matches;
          });
        }

        if (!block) {
          devLogger.error('❌ Block not found for editing:', {
            blockId,
            contentBlocksIds: contentBlocks.map(b => b.id || b.block_id),
            lessonContentIds:
              lessonContent?.data?.content?.map(b => b.block_id || b.id) || [],
          });
          toast.error('Block not found. Please try again.');
          return;
        }

        devLogger.debug('📝 Editing image block - FULL BLOCK DATA:', {
          blockId,
          blockType: block.type,
          hasImageUrl: !!block.imageUrl,
          imageUrl: block.imageUrl,
          hasDetails: !!block.details,
          detailsKeys: block.details ? Object.keys(block.details) : [],
          detailsImageUrl: block.details?.image_url,
          hasHtmlCss: !!block.html_css,
          htmlCssLength: block.html_css?.length || 0,
          hasContent: !!block.content,
          contentType: typeof block.content,
          allBlockKeys: Object.keys(block),
        });

        setCurrentBlock(block);

        // Extract image URL from multiple possible locations (for AI-generated blocks)
        const imageUrl =
          block.imageUrl ||
          block.details?.image_url ||
          block.content?.imageUrl ||
          block.content?.url ||
          (() => {
            // Last resort: extract from html_css img src
            if (block.html_css) {
              try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = block.html_css;
                const img = tempDiv.querySelector('img');
                return img?.src || img?.getAttribute('src') || '';
              } catch (e) {
                return '';
              }
            }
            return '';
          })();

        // Extract image title from multiple possible locations
        const imageTitle =
          block.imageTitle ||
          block.details?.alt_text ||
          block.content?.imageTitle ||
          block.title ||
          '';

        // Extract description/caption from multiple possible locations
        const imageDescription =
          block.imageDescription ||
          block.details?.caption ||
          block.content?.caption ||
          block.content?.captionText ||
          '';

        // Extract text/caption HTML from multiple possible locations
        let imageText =
          block.text ||
          block.details?.caption_html ||
          block.content?.captionHtml ||
          block.content?.text ||
          '';

        // CRITICAL: If text is empty but we have html_css, extract text from HTML
        // This handles AI-generated blocks from course creation
        if (!imageText && block.html_css) {
          try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = block.html_css;

            const layout = block.layout || block.details?.layout;
            const isSideBySide =
              layout === 'side-by-side' ||
              block.html_css.includes('side-by-side') ||
              block.html_css.includes('grid md:grid-cols-2');
            const isOverlay =
              layout === 'overlay' ||
              block.html_css.includes('overlay') ||
              block.html_css.includes('absolute inset-0');

            if (isSideBySide) {
              // For side-by-side: find the text div (the one without img)
              const allDivs = tempDiv.querySelectorAll('div[class*="order-"]');
              let textDiv = null;

              for (const div of allDivs) {
                if (!div.querySelector('img')) {
                  textDiv = div;
                  break;
                }
              }

              if (textDiv) {
                imageText = textDiv.innerHTML.trim();
              } else {
                // Fallback: get all text content, remove image alt
                const img = tempDiv.querySelector('img');
                const imgAlt = img?.alt || '';
                const allText = tempDiv.textContent || tempDiv.innerText || '';
                imageText = allText.replace(imgAlt, '').trim();
              }
            } else if (isOverlay) {
              // For overlay: find text in absolute positioned div
              const overlayDiv = tempDiv.querySelector(
                '[class*="absolute"], .text-white'
              );
              if (overlayDiv) {
                imageText = overlayDiv.innerHTML.trim();
              } else {
                // Fallback: get text from any div with white text
                const whiteTextDiv = Array.from(
                  tempDiv.querySelectorAll('div')
                ).find(
                  d =>
                    d.classList.contains('text-white') ||
                    getComputedStyle(d).color.includes('rgb(255')
                );
                if (whiteTextDiv) {
                  imageText = whiteTextDiv.innerHTML.trim();
                }
              }
            } else {
              // For centered or other layouts: extract any text content
              const img = tempDiv.querySelector('img');
              if (img) {
                // Remove the img element and get remaining HTML
                const clone = tempDiv.cloneNode(true);
                clone.querySelector('img')?.remove();
                imageText = clone.innerHTML.trim();
              }
            }

            // If still no text, try to get from caption paragraph
            if (!imageText) {
              const captionP = tempDiv.querySelector('p');
              if (captionP) {
                imageText = captionP.innerHTML.trim();
              }
            }
          } catch (error) {
            devLogger.warn('Failed to extract text from HTML:', error);
          }
        }

        // Also check if description exists but text doesn't - use description as fallback
        if (!imageText && imageDescription) {
          imageText = `<p>${imageDescription}</p>`;
        }

        devLogger.debug('Extracted image block data:', {
          imageUrl,
          imageTitle,
          imageDescription,
          imageTextLength: imageText?.length || 0,
          hasImageUrl: !!imageUrl,
          hasImageText: !!imageText,
        });

        setImageTitle(imageTitle);
        setImageDescription(imageDescription);
        setImageFile(block.imageFile);
        setImagePreview(imageUrl); // CRITICAL: Set preview with the extracted URL
        setImageTemplateText(imageText);

        // Set appropriate alignment and layout based on block structure
        const blockLayout = block.layout || block.details?.layout || 'centered';
        const blockAlignment =
          block.alignment || block.details?.alignment || 'left';

        // Detect layout from html_css if not explicitly set
        let detectedLayout = blockLayout;
        if (block.html_css && !blockLayout) {
          if (
            block.html_css.includes('side-by-side') ||
            block.html_css.includes('grid md:grid-cols-2')
          ) {
            detectedLayout = 'side-by-side';
          } else if (
            block.html_css.includes('overlay') ||
            block.html_css.includes('absolute inset-0')
          ) {
            detectedLayout = 'overlay';
          } else if (
            block.html_css.includes('full-width') ||
            block.html_css.includes('w-full h-')
          ) {
            detectedLayout = 'full-width';
          }
        }

        // Set layout state if needed
        if (detectedLayout === 'side-by-side') {
          setImageAlignment(blockAlignment);
        } else {
          setStandaloneImageAlignment(blockAlignment);
        }

        // Update current block with detected layout
        setCurrentBlock(prev =>
          prev ? { ...prev, layout: detectedLayout } : null
        );

        devLogger.debug('Loading image block for editing:', {
          blockId,
          imageUrl,
          imageTitle,
          imageDescription,
          layout: block.layout || block.details?.layout,
        });

        setShowImageDialog(true);
      },
    }));

    // Reset form when dialog closes
    useEffect(() => {
      if (!showImageDialog) {
        resetForm();
      }
    }, [showImageDialog]);

    const resetForm = () => {
      setImageTitle('');
      setImageDescription('');
      setImageFile(null);
      setImagePreview('');
      setImageTemplateText('');
      setImageAlignment('left');
      setStandaloneImageAlignment('center');
      setCurrentBlock(null);
    };

    const handleImageDialogClose = () => {
      setShowImageDialog(false);
      resetForm();
    };

    const handleImageInputChange = e => {
      const { name, value, files } = e.target;

      if (name === 'file' && files && files[0]) {
        const file = files[0];

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          alert('Please upload only JPG or PNG images');
          return;
        }

        // Check file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          alert('Image size should be less than 50MB');
          return;
        }

        // Show image editor instead of directly setting the file
        setImageToEdit(file);
        setImageEditorTitle('Edit Image');
        setShowImageEditor(true);
      } else if (name === 'title') {
        setImageTitle(value);
      } else if (name === 'description') {
        setImageDescription(value);
      }
    };

    const handleImageTemplateSelect = template => {
      const imageUrl = template.defaultContent?.imageUrl || '';
      const imageTitle = template.title;
      const imageText = template.defaultContent?.text || '';
      const textHtml = imageText ? `<p>${imageText}</p>` : '';

      const newBlock = {
        id: `image-${Date.now()}`,
        block_id: `image-${Date.now()}`,
        type: 'image',
        title: template.title,
        layout: template.layout,
        templateType: template.id,
        alignment: template.alignment || 'left',
        imageUrl: imageUrl,
        imageTitle: imageTitle,
        imageDescription: '',
        text: textHtml,
        isEditing: false,
        timestamp: new Date().toISOString(),
        order: 0, // Will be set by parent
        details: {
          image_url: imageUrl,
          caption: imageText,
          caption_html: textHtml,
          alt_text: imageTitle,
          layout: template.layout,
          template: template.id,
          alignment: template.alignment || 'left',
        },
      };

      // Generate HTML content immediately for the new block
      newBlock.html_css = generateImageBlockHtml(newBlock);

      // Call parent callback
      onImageTemplateSelect(newBlock);
      setShowImageTemplateSidebar(false);
    };

    const handleGalleryImageSelect = galleryImage => {
      // Close the sidebar first to avoid dialog stacking issues
      setShowImageTemplateSidebar(false);
      // Show type selector dialog instead of directly creating block
      setPendingGalleryImage(galleryImage);
      // Use setTimeout to ensure sidebar closes before opening type selector
      setTimeout(() => {
        setShowTypeSelector(true);
      }, 100);
    };

    const handleTypeSelectorConfirm = imageWithTemplate => {
      const { template, ...galleryImage } = imageWithTemplate;

      // Create block with selected template
      const newBlock = {
        id: `image-${Date.now()}`,
        block_id: `image-${Date.now()}`,
        type: 'image',
        title: template.title || galleryImage.fileName || 'Image',
        layout: template.layout || 'centered',
        templateType: template.id || 'gallery-image',
        alignment: template.alignment || 'center',
        imageUrl: galleryImage.url,
        imageTitle: galleryImage.fileName || 'Image',
        imageDescription: '',
        text: template.defaultContent?.text
          ? `<p>${template.defaultContent.text}</p>`
          : '',
        isEditing: false,
        timestamp: new Date().toISOString(),
        order: 0, // Will be set by parent
        details: {
          image_url: galleryImage.url,
          caption: template.defaultContent?.text || '',
          caption_html: template.defaultContent?.text
            ? `<p>${template.defaultContent.text}</p>`
            : '',
          alt_text: galleryImage.fileName || 'Image',
          layout: template.layout || 'centered',
          template: template.id || 'gallery-image',
          alignment: template.alignment || 'center',
          source: 'gallery',
          folder: galleryImage.folder,
        },
      };

      // Generate HTML content immediately for the new block
      newBlock.html_css = generateImageBlockHtml(newBlock);

      // Call parent callback
      onImageTemplateSelect(newBlock);
      setShowTypeSelector(false);
      setPendingGalleryImage(null);
      setShowImageTemplateSidebar(false);
    };

    const handleTypeSelectorClose = () => {
      setShowTypeSelector(false);
      setPendingGalleryImage(null);
    };

    const handleImageBlockEdit = (blockId, field, value) => {
      setContentBlocks(prev =>
        prev.map(block => {
          if (block.id !== blockId) return block;

          const updatedBlock = { ...block, [field]: value };

          if (field === 'text') {
            const plainText = getPlainText(value || '');
            updatedBlock.imageDescription = plainText;
            updatedBlock.details = {
              ...(updatedBlock.details || {}),
              caption: plainText,
              caption_html: value,
            };
          }

          if (field === 'imageDescription') {
            updatedBlock.details = {
              ...(updatedBlock.details || {}),
              caption: value,
            };
          }

          // If alignment is being changed, regenerate the HTML
          if (
            field === 'alignment' ||
            field === 'text' ||
            field === 'imageDescription'
          ) {
            updatedBlock.html_css = generateImageBlockHtml(updatedBlock);
          }

          return updatedBlock;
        })
      );
    };

    const handleImageFileUpload = async (blockId, file, retryCount = 0) => {
      if (!file) return;

      // Set loading state for this specific block
      setImageUploading(prev => ({ ...prev, [blockId]: true }));

      try {
        devLogger.debug('Attempting to upload image to AWS S3:', {
          blockId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          retryCount,
        });

        // Upload image to API
        const uploadResult = await uploadImage(file, {
          folder: 'lesson-images',
          public: true,
        });

        if (uploadResult.success && uploadResult.imageUrl) {
          // Update the block with the uploaded AWS S3 image URL
          handleImageBlockEdit(blockId, 'imageUrl', uploadResult.imageUrl);
          handleImageBlockEdit(blockId, 'imageFile', file);
          handleImageBlockEdit(blockId, 'uploadedImageData', uploadResult);

          // Clear any local URL flag
          handleImageBlockEdit(blockId, 'isUsingLocalUrl', false);

          devLogger.debug('Image uploaded successfully to AWS S3:', {
            blockId,
            awsUrl: uploadResult.imageUrl,
            uploadResult,
          });

          toast.success('Image uploaded successfully to AWS S3!');
        } else {
          throw new Error('Upload failed - no image URL returned');
        }
      } catch (error) {
        devLogger.error('Error uploading image to AWS S3:', error);
        devLogger.error('Upload error details:', {
          blockId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: error.message,
          retryCount,
        });

        const isStorageLimitExceeded =
          error?.code === 'STORAGE_LIMIT_EXCEEDED' ||
          (error?.message &&
            (error.message.toLowerCase().includes('limit exceeded') ||
              error.message.toLowerCase().includes('storage limit')));

        if (isStorageLimitExceeded) {
          toast.error(
            'Storage limit exceeded. Please free up space or upgrade before uploading new images.'
          );
          return;
        }

        // Retry up to 2 times for network errors
        if (
          retryCount < 2 &&
          (error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('fetch'))
        ) {
          devLogger.debug(`Retrying upload (attempt ${retryCount + 1}/2)...`);
          setTimeout(
            () => {
              handleImageFileUpload(blockId, file, retryCount + 1);
            },
            1000 * (retryCount + 1)
          );
          return;
        }

        toast.error(
          `Failed to upload image to AWS S3: ${error.message || 'Unknown error'}. Using local preview.`
        );

        // Fallback to local URL for immediate preview
        const localImageUrl = URL.createObjectURL(file);
        handleImageBlockEdit(blockId, 'imageUrl', localImageUrl);
        handleImageBlockEdit(blockId, 'imageFile', file);
        handleImageBlockEdit(blockId, 'isUsingLocalUrl', true);

        devLogger.warn('Using local blob URL as fallback:', localImageUrl);
      } finally {
        // Clear loading state
        setImageUploading(prev => ({ ...prev, [blockId]: false }));
      }
    };

    const getPlainText = html => {
      if (typeof html !== 'string') return '';
      if (typeof document === 'undefined') return html;
      const temp = document.createElement('div');
      temp.innerHTML = html || '';
      return temp.textContent || temp.innerText || '';
    };

    const generateImageBlockHtml = block => {
      const layout = block.layout || 'centered';
      const textContentHtml = (
        (block.text ?? block.details?.caption_html ?? '') ||
        ''
      ).toString();
      const fallbackText = (
        block.imageDescription ||
        block.details?.caption ||
        ''
      ).toString();
      const textContent = textContentHtml.trim()
        ? textContentHtml
        : fallbackText;
      const imageUrl = block.imageUrl || '';
      const imageTitle = block.imageTitle || '';
      const alignment = block.alignment || block.details?.alignment || 'left';

      if (!imageUrl) return '';

      if (layout === 'side-by-side') {
        const imageFirst = alignment === 'left';
        const imageOrder = imageFirst ? 'order-1' : 'order-2';
        const textOrder = imageFirst ? 'order-2' : 'order-1';

        return `
        <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
          <div class="${imageOrder}">
            <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-auto object-contain rounded-lg shadow-lg" style="max-height: min(60vh, 400px);" />
          </div>
          <div class="${textOrder} text-gray-700 text-lg leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
            ${textContent ? `<div>${textContent}</div>` : ''}
          </div>
        </div>
      `;
      } else if (layout === 'overlay') {
        return `
        <div class="relative rounded-xl overflow-hidden">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-96 object-cover" />
          ${textContent ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full text-xl font-medium leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><div>${textContent}</div></div></div>` : ''}
        </div>
      `;
      } else if (layout === 'full-width') {
        return `
        <div class="space-y-3">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-auto object-contain rounded" style="max-height: min(60vh, 400px);" />
          ${textContent ? `<div class="text-sm text-gray-600 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">${textContent}</div>` : ''}
        </div>
      `;
      } else {
        // centered or default - Handle standalone image alignment
        let alignmentClass = 'text-center';
        if (alignment === 'left') {
          alignmentClass = 'text-left';
        } else if (alignment === 'right') {
          alignmentClass = 'text-right';
        }

        return `
        <div class="${alignmentClass}">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="max-w-full h-auto object-contain rounded-xl shadow-lg" style="max-height: min(60vh, 400px); width: auto; ${alignment === 'center' ? 'mx-auto' : ''}" />
          ${textContent ? `<div class="text-gray-600 mt-4 italic text-lg leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">${textContent}</div>` : ''}
        </div>
      `;
      }
    };

    const saveImageTemplateChanges = blockId => {
      setContentBlocks(prev =>
        prev.map(block => {
          if (block.id !== blockId) return block;
          if (block.type === 'image') {
            const captionPlainText = getPlainText(block.text || '');

            // Ensure we're using the uploaded AWS URL, not local URL
            let finalImageUrl =
              block.imageUrl || block.details?.image_url || '';

            // If imageUrl is a local blob URL, try to get the uploaded URL from uploadedImageData
            if (
              finalImageUrl.startsWith('blob:') &&
              block.uploadedImageData?.imageUrl
            ) {
              finalImageUrl = block.uploadedImageData.imageUrl;
              devLogger.debug(
                'Using uploaded AWS URL instead of local blob URL:',
                finalImageUrl
              );
            }

            const updatedDetails = {
              ...(block.details || {}),
              image_url: finalImageUrl,
              caption: captionPlainText || block.details?.caption || '',
              caption_html: block.text || block.details?.caption_html || '',
              alt_text: block.imageTitle || block.details?.alt_text || '',
              layout: block.layout || block.details?.layout,
              template: block.templateType || block.details?.template,
              alignment: block.alignment || block.details?.alignment || 'left',
            };

            // Create updated block with final image URL for HTML generation
            const updatedBlock = {
              ...block,
              imageUrl: finalImageUrl,
              details: updatedDetails,
            };

            // Generate HTML content with the correct AWS URL
            const htmlContent = generateImageBlockHtml(updatedBlock);

            devLogger.debug('Saving image block:', {
              blockId,
              layout: block.layout,
              originalUrl: block.imageUrl,
              finalUrl: finalImageUrl,
              isLocalUrl: finalImageUrl.startsWith('blob:'),
              hasUploadedData: !!block.uploadedImageData,
              isUsingLocalUrl: block.isUsingLocalUrl,
            });

            // Warn if still using local URL
            if (finalImageUrl.startsWith('blob:') || block.isUsingLocalUrl) {
              devLogger.warn(
                'WARNING: Image block is using local URL instead of AWS S3 URL'
              );
              toast.warning(
                'Warning: Image is stored locally and may not be accessible after page refresh. Please re-upload the image.'
              );
            }

            const finalBlock = {
              ...updatedBlock,
              isEditing: false,
              html_css: htmlContent,
              imageDescription: captionPlainText,
              details: updatedDetails,
            };

            // Also update lessonContent if it exists
            if (onImageUpdate && contentBlocks.find(b => b.id === blockId)) {
              // Call parent's handleImageUpdate to sync with lessonContent
              const currentBlock = contentBlocks.find(b => b.id === blockId);
              if (currentBlock) {
                onImageUpdate(finalBlock, currentBlock);
              }
            }

            return finalBlock;
          }
          return { ...block, isEditing: false };
        })
      );
      devLogger.debug('Image template changes saved for block:', blockId);
    };

    const toggleImageBlockEditing = blockId => {
      setContentBlocks(prev =>
        prev.map(block =>
          block.id === blockId
            ? { ...block, isEditing: !block.isEditing }
            : block
        )
      );
    };

    const handleAddImage = async () => {
      if (!imageTitle || (!imageFile && !imagePreview)) {
        alert('Please fill in all required fields');
        return;
      }

      // Set loading state
      setMainImageUploading(true);

      try {
        // Handle both File object and string URL cases
        let imageUrl = '';
        let uploadedImageData = null;

        if (imageFile && typeof imageFile === 'object' && 'name' in imageFile) {
          // It's a File object - upload to API
          try {
            const uploadResult = await uploadImage(imageFile, {
              folder: 'lesson-images',
              public: true,
            });

            if (uploadResult.success && uploadResult.imageUrl) {
              imageUrl = uploadResult.imageUrl;
              uploadedImageData = uploadResult;
              toast.success('Image uploaded successfully!');
            } else {
              throw new Error('Upload failed - no image URL returned');
            }
          } catch (error) {
            devLogger.error('Error uploading image:', error);
            toast.error(
              error.message || 'Failed to upload image. Please try again.'
            );

            // Fallback to local URL for immediate preview
            imageUrl = URL.createObjectURL(imageFile);
          }
        } else if (typeof imageFile === 'string') {
          // It's already a URL string
          imageUrl = imageFile;
        } else if (imagePreview) {
          // Fallback to imagePreview if available
          imageUrl = imagePreview;
        }

        const layout = currentBlock?.layout || null;
        const templateType = currentBlock?.templateType || null;
        const textHtml = (imageTemplateText || '').trim();
        const textPlain = getPlainText(textHtml).trim();

        // Determine which alignment to use based on layout
        const finalAlignment =
          layout === 'side-by-side' ? imageAlignment : standaloneImageAlignment;

        const newBlock = {
          id: currentBlock?.id || `image-${Date.now()}`,
          block_id: currentBlock?.id || `image-${Date.now()}`,
          type: 'image',
          title: imageTitle,
          layout: layout || undefined,
          templateType: templateType || undefined,
          alignment: finalAlignment,
          details: {
            image_url: imageUrl,
            caption: textPlain || '',
            caption_html: textHtml,
            alt_text: imageTitle,
            layout: layout || undefined,
            template: templateType || undefined,
            alignment: finalAlignment,
          },
          imageTitle: imageTitle,
          imageDescription: textPlain,
          text: textHtml,
          imageFile: imageFile,
          imageUrl: imageUrl,
          uploadedImageData: uploadedImageData,
          timestamp: new Date().toISOString(),
          order: 0, // Will be set by parent
        };

        newBlock.html_css = generateImageBlockHtml(newBlock);

        // Call parent callback to update
        onImageUpdate(newBlock, currentBlock);

        handleImageDialogClose();
      } finally {
        setMainImageUploading(false);
      }
    };

    // Image Editor callbacks
    const handleImageEditorSave = editedFile => {
      // Check if this is inline editing (currentBlock has an id)
      if (currentBlock && currentBlock.id) {
        // Inline editing - upload the edited file directly
        handleImageFileUpload(currentBlock.id, editedFile);
      } else {
        // Regular image dialog editing
        setImageFile(editedFile);
        setImagePreview(URL.createObjectURL(editedFile));
      }

      setShowImageEditor(false);
      setImageToEdit(null);
      setCurrentBlock(null);
    };

    const handleImageEditorClose = () => {
      setShowImageEditor(false);
      setImageToEdit(null);
    };

    // Inline image editing with image editor
    const handleInlineImageFileUpload = (blockId, file) => {
      if (!file) return;

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only JPG or PNG images');
        return;
      }

      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        alert('Image size should be less than 50MB');
        return;
      }

      // Show image editor for inline editing
      setImageToEdit(file);
      setImageEditorTitle('Edit Image');
      setShowImageEditor(true);

      // Store the block ID for when the editor saves
      setCurrentBlock({ id: blockId });
    };

    return (
      <>
        {/* Image Template Sidebar */}
        {showImageTemplateSidebar && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
              onClick={() => setShowImageTemplateSidebar(false)}
            />

            {/* Sidebar */}
            <div className="relative bg-white w-[500px] h-full shadow-xl flex flex-col animate-slide-in-left">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Image className="h-6 w-6" />
                    Add Image
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageTemplateSidebar(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Choose from gallery or use templates
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`
                    flex-1 px-4 py-3 text-sm font-medium transition-colors
                    ${
                      activeTab === 'gallery'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    <span>Gallery</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`
                    flex-1 px-4 py-3 text-sm font-medium transition-colors
                    ${
                      activeTab === 'templates'
                        ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Layout className="h-4 w-4" />
                    <span>Templates</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'gallery' && (
                  <div className="h-full">
                    <ImageGallery
                      onSelectImage={handleGalleryImageSelect}
                      onClose={() => setShowImageTemplateSidebar(false)}
                    />
                  </div>
                )}

                {activeTab === 'templates' && (
                  <div className="h-full overflow-y-auto p-6 space-y-4">
                    {/* AI Generation Option */}
                    <div
                      onClick={() => {
                        setShowImageTemplateSidebar(false);
                        if (onAICreation) {
                          onAICreation({ id: 'image', title: 'Image' });
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
                            Describe what you want and let AI create
                            professional images instantly
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
                            AI-powered image generation
                          </span>
                        </div>
                      </div>
                    </div>

                    {imageTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => handleImageTemplateSelect(template)}
                        className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">
                              {template.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>

                        {/* Mini Preview */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          {template.layout === 'side-by-side' && (
                            <div className="flex gap-3 items-start">
                              <div className="w-1/2">
                                <img
                                  src={template.defaultContent.imageUrl}
                                  alt="Preview"
                                  className="w-full h-20 object-cover rounded"
                                />
                              </div>
                              <div className="w-1/2">
                                <p className="text-xs text-gray-600 line-clamp-4">
                                  {template.defaultContent.text.substring(
                                    0,
                                    60
                                  )}
                                  ...
                                </p>
                              </div>
                            </div>
                          )}
                          {template.layout === 'overlay' && (
                            <div className="relative">
                              <img
                                src={template.defaultContent.imageUrl}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 rounded flex items-center justify-center p-2">
                                <p className="text-white text-sm text-center line-clamp-3">
                                  {template.defaultContent.text.substring(
                                    0,
                                    50
                                  )}
                                  ...
                                </p>
                              </div>
                            </div>
                          )}
                          {template.layout === 'centered' && (
                            <div className="text-center space-y-2">
                              <img
                                src={template.defaultContent.imageUrl}
                                alt="Preview"
                                className="mx-auto h-20 object-cover rounded"
                              />
                              <p className="text-xs text-gray-600 italic line-clamp-2">
                                {template.defaultContent.text.substring(0, 40)}
                                ...
                              </p>
                            </div>
                          )}
                          {template.layout === 'full-width' && (
                            <div className="space-y-2">
                              <img
                                src={template.defaultContent.imageUrl}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded"
                              />
                              <p className="text-xs text-gray-600 line-clamp-3">
                                {template.defaultContent.text.substring(0, 60)}
                                ...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={handleImageDialogClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImageBlock ? 'Edit Image' : 'Add Image'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={imageTitle}
                  onChange={handleImageInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter image title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text on/with Image
                </label>
                <ReactQuill
                  theme="snow"
                  value={imageTemplateText}
                  onChange={setImageTemplateText}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ align: [] }],
                      ['clean'],
                    ],
                  }}
                  style={{ minHeight: '120px' }}
                  placeholder="Enter text to show with or on the image"
                />
              </div>

              {/* Image Alignment Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Alignment
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-2">
                    For Image & Text blocks:
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageAlignment"
                        value="left"
                        checked={imageAlignment === 'left'}
                        onChange={e => setImageAlignment(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Image Left, Text Right</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageAlignment"
                        value="right"
                        checked={imageAlignment === 'right'}
                        onChange={e => setImageAlignment(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Image Right, Text Left</span>
                    </label>
                  </div>

                  <div className="text-sm text-gray-600 mb-2 mt-4">
                    For standalone images:
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="standaloneImageAlignment"
                        value="left"
                        checked={standaloneImageAlignment === 'left'}
                        onChange={e =>
                          setStandaloneImageAlignment(e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Left Aligned</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="standaloneImageAlignment"
                        value="center"
                        checked={standaloneImageAlignment === 'center'}
                        onChange={e =>
                          setStandaloneImageAlignment(e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Center Aligned</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="standaloneImageAlignment"
                        value="right"
                        checked={standaloneImageAlignment === 'right'}
                        onChange={e =>
                          setStandaloneImageAlignment(e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Right Aligned</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* S3 URL Display (when editing existing image with S3 URL) */}
              {(() => {
                // Get the actual S3 URL from currentBlock or imagePreview
                const s3Url =
                  currentBlock?.imageUrl ||
                  currentBlock?.details?.image_url ||
                  currentBlock?.uploadedImageData?.imageUrl ||
                  imagePreview ||
                  '';

                // Check if it's an S3 URL
                const isS3Url =
                  s3Url &&
                  (s3Url.includes('s3.amazonaws.com') ||
                    s3Url.includes('.s3.') ||
                    s3Url.includes('amazonaws.com'));

                // Show S3 URL field if we have a currentBlock (editing) and it's an S3 URL
                return currentBlock && isS3Url ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      S3 Image URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={s3Url}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-50 text-sm font-mono text-gray-700 pr-20 break-all"
                        placeholder="S3 URL will appear here after upload"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(s3Url);
                          toast.success('S3 URL copied to clipboard!');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This image is stored on AWS S3. The URL above is the
                      permanent link.
                    </p>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          name="file"
                          className="sr-only"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={handleImageInputChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG up to 50MB</p>
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleImageDialogClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAddImage}
                disabled={
                  !imageTitle ||
                  (!imageFile && !imagePreview) ||
                  mainImageUploading
                }
              >
                {mainImageUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Add Image'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Editor */}
        <ImageEditor
          isOpen={showImageEditor}
          onClose={handleImageEditorClose}
          imageFile={imageToEdit}
          onSave={handleImageEditorSave}
          title={imageEditorTitle}
        />

        {/* Image Type Selector Dialog */}
        <ImageTypeSelector
          open={showTypeSelector}
          onClose={handleTypeSelectorClose}
          selectedImage={pendingGalleryImage}
          onConfirm={handleTypeSelectorConfirm}
        />
      </>
    );
  }
);

ImageBlockComponent.displayName = 'ImageBlockComponent';

export default ImageBlockComponent;
