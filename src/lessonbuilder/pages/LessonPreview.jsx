import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  Circle,
  X,
  Menu,
  FileText,
  Plus,
  Edit3,
  Hourglass,
  Star,
  Sparkles,
  Calendar,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import devLogger from '@lessonbuilder/utils/devLogger';
import ImmersiveReader from '@/components/courses/ImmersiveReader';
import { getTtsToken } from '@/services/speechify';

// Helper function to decode HTML entities
const decodeHtmlEntities = text => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const getImageCaptionHtml = block => {
  const captionHtml = (
    block.captionHtml ||
    block.details?.caption_html ||
    block.text ||
    ''
  ).toString();
  const captionPlain = (
    block.caption ||
    block.imageDescription ||
    block.details?.caption ||
    ''
  ).toString();
  return captionHtml.trim() ? captionHtml : captionPlain;
};

const generateImageHtml = block => {
  const imageUrl = block.imageUrl || block.image_url || '';
  if (!imageUrl) return '';

  const layout = block.layout || 'centered';
  const alignment = block.alignment || 'left';
  const caption =
    (block.captionHtml && block.captionHtml.trim()) ||
    (block.caption && block.caption.toString()) ||
    getImageCaptionHtml(block);

  const captionBlock = caption
    ? `<div class="text-gray-700 text-lg leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><div>${caption}</div></div>`
    : '';

  if (layout === 'side-by-side') {
    const imageFirst = alignment === 'left';
    const imageOrder = imageFirst ? 'order-1' : 'order-2';
    const textOrder = imageFirst ? 'order-2' : 'order-1';

    return `
      <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
        <div class="${imageOrder}">
          <img src="${imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
        </div>
        <div class="${textOrder}">
          ${captionBlock}
        </div>
      </div>
    `;
  }

  if (layout === 'overlay') {
    return `
      <div class="relative rounded-xl overflow-hidden">
        <img src="${imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-96 object-cover" />
        ${caption ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full text-xl font-medium leading-relaxed space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><div>${caption}</div></div></div>` : ''}
      </div>
    `;
  }

  if (layout === 'full-width') {
    return `
      <div class="space-y-3">
        <img src="${imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded" />
        ${caption ? `<div class="text-sm text-gray-600 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><div>${caption}</div></div>` : ''}
      </div>
    `;
  }

  // centered/default
  let alignmentClass = 'text-center';
  if (alignment === 'left') alignmentClass = 'text-left';
  else if (alignment === 'right') alignmentClass = 'text-right';

  return `
    <div class="${alignmentClass}">
      <img src="${imageUrl}" alt="${block.imageTitle || 'Image'}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg ${alignment === 'center' ? 'mx-auto' : ''}" />
      ${caption ? `<div class="text-gray-600 mt-4 italic text-lg leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><div>${caption}</div></div>` : ''}
    </div>
  `;
};

const LessonPreview = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentSection, setCurrentSection] = useState(null);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const videoRef = useRef(null);
  const [isVideoOutOfView, setIsVideoOutOfView] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerContent, setReaderContent] = useState('');
  const [readerTitle, setReaderTitle] = useState('');

  useEffect(() => {
    let styleEl = document.getElementById('lesson-preview-image-list-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'lesson-preview-image-list-style';
      styleEl.textContent = `
        .image-block-preview ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          padding-left: 0.25rem;
        }
        .image-block-preview ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          padding-left: 0.25rem;
        }
        .image-block-preview li {
          margin-bottom: 0.35rem;
        }
      `;
      document.head.appendChild(styleEl);
    }

    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  useEffect(() => {
    fetchLessonContent();
  }, [lessonId]);

  // Scroll spy to update current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (
        !lessonData?.headingSections ||
        lessonData.headingSections.length === 0
      )
        return;

      const headerOffset = 150;
      let currentSectionId = null;

      // Find the section that's currently in view
      for (const section of lessonData.headingSections) {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            currentSectionId = section.id;
            break;
          }
        }
      }

      // If no section is in the header area, find the closest one above
      if (!currentSectionId) {
        for (let i = lessonData.headingSections.length - 1; i >= 0; i--) {
          const section = lessonData.headingSections[i];
          const element = document.getElementById(`section-${section.id}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= headerOffset) {
              currentSectionId = section.id;
              break;
            }
          }
        }
      }

      if (currentSectionId && currentSectionId !== currentSection) {
        setCurrentSection(currentSectionId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lessonData, currentSection]);

  // Header visibility based on scroll direction
  useEffect(() => {
    const handleHeaderScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide/show header if scrolled more than 100px
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsHeaderVisible(false);
      } else {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleHeaderScroll);
  }, [lastScrollY]);

  // Setup Process carousel functions for preview mode
  useEffect(() => {
    // Process carousel navigation functions (based on quotes carousel logic)
    window.processCarouselPrev = button => {
      devLogger.debug('Process Carousel Prev clicked');
      const carousel = button.closest('.process-carousel');
      if (!carousel) {
        devLogger.debug('No process carousel found for prev button');
        return;
      }

      const slides = carousel.querySelectorAll('.process-step');
      const dots = carousel.querySelectorAll('.process-carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');

      devLogger.debug(
        'Process carousel prev - current index:',
        currentIndex,
        'total slides:',
        slides.length
      );
      const newIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
      showProcessCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.processCarouselNext = button => {
      devLogger.debug('Process Carousel Next clicked');
      const carousel = button.closest('.process-carousel');
      if (!carousel) {
        devLogger.debug('No process carousel found for next button');
        return;
      }

      const slides = carousel.querySelectorAll('.process-step');
      const dots = carousel.querySelectorAll('.process-carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');

      devLogger.debug(
        'Process carousel next - current index:',
        currentIndex,
        'total slides:',
        slides.length
      );
      const newIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
      showProcessCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.processCarouselGoTo = (button, index) => {
      devLogger.debug('Process Carousel GoTo clicked');
      const carousel = button.closest('.process-carousel');
      if (!carousel) {
        devLogger.debug('No process carousel found for goTo button');
        return;
      }

      const slides = carousel.querySelectorAll('.process-step');
      const dots = carousel.querySelectorAll('.process-carousel-dot');

      devLogger.debug(
        'Process carousel goTo - target index:',
        index,
        'total slides:',
        slides.length
      );
      showProcessCarouselSlide(carousel, slides, dots, index);
    };

    const showProcessCarouselSlide = (carousel, slides, dots, index) => {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
        } else {
          slide.classList.remove('block');
          slide.classList.add('hidden');
        }
      });

      dots.forEach((dot, i) => {
        // Normalize: remove all known active/inactive styles first
        dot.classList.remove(
          // inactive variants
          'bg-gray-300',
          'hover:bg-gray-400',
          'bg-slate-300',
          'hover:bg-slate-400',
          'hover:scale-105',
          // active variants
          'bg-white',
          'scale-110',
          'shadow-md',
          'bg-gradient-to-r',
          'from-blue-500',
          'to-purple-500'
        );

        if (i === index) {
          // Active state: use gradient styling like quotes carousel
          dot.classList.add(
            'bg-gradient-to-r',
            'from-blue-500',
            'to-purple-500',
            'scale-110',
            'shadow-md'
          );
        } else {
          // Inactive state: use slate gray like quotes carousel
          dot.classList.add(
            'bg-slate-300',
            'hover:bg-slate-400',
            'hover:scale-105'
          );
        }
      });

      carousel.dataset.current = index.toString();
    };

    // Add keyboard navigation support
    window.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const focusedElement = document.activeElement;
        const processContainer = focusedElement?.closest('.process-carousel');

        if (processContainer && processContainer.id) {
          event.preventDefault();
          if (event.key === 'ArrowLeft') {
            window.processCarouselPrev &&
              window.processCarouselPrev({ closest: () => processContainer });
          } else {
            window.processCarouselNext &&
              window.processCarouselNext({ closest: () => processContainer });
          }
        }
      }
    });

    // Add click navigation to process content area
    window.addEventListener('click', event => {
      const processContainer = event.target?.closest('.process-carousel');
      if (processContainer && processContainer.id) {
        // Focus the container for keyboard navigation
        processContainer.focus();
      }
    });

    // Cleanup function
    return () => {
      delete window.processCarouselPrev;
      delete window.processCarouselNext;
      delete window.processCarouselGoTo;
    };
  }, []);

  const fetchLessonContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
      const response = await fetch(`${baseUrl}/api/lessoncontent/${lessonId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lesson content: ${response.status}`);
      }

      const responseData = await response.json();
      devLogger.debug('Fetched lesson data:', responseData);

      // Extract the actual data from the API response
      const data = responseData.data || responseData;

      // Parse the lesson content
      const parsedContent = parseLessonContent(data.content || []);

      // Transform the data to match our component structure
      const transformedData = {
        id: data.id || lessonId,
        title:
          data.lesson?.title ||
          data.title ||
          data.lesson_title ||
          'Untitled Lesson',
        description: data.description || data.lesson_description || '',
        // duration: data.duration || data.estimated_duration || '30 min',
        // difficulty: data.difficulty || data.level || 'Intermediate',
        // instructor: data.instructor || data.author || data.created_by || 'Course Instructor',
        progress: data.progress || 0,
        headingSections: parsedContent.headingSections || [],
        allContent: parsedContent.allContent || [],
        objectives: data.objectives || data.learning_objectives || [],
        introduction: data.introduction || data.lesson_introduction || '',
        summary: data.summary || data.lesson_summary || '',
        lessonOrder: data.lesson?.order || data.order || 1,
        totalLessons: 9, // This could be passed from parent or calculated
      };

      setLessonData(transformedData);
      // Build pagination pages using master headings and 'continue' dividers
      const computedPages = computePages(transformedData.allContent);
      setPages(computedPages);

      // Set initial current section to the first heading section if available
      if (
        parsedContent.headingSections &&
        parsedContent.headingSections.length > 0
      ) {
        setCurrentSection(parsedContent.headingSections[0].id);
      }
    } catch (err) {
      devLogger.error('Error fetching lesson content:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load lesson content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseLessonContent = content => {
    const allContent = [];
    const headingSections = [];

    if (!content || !Array.isArray(content)) {
      devLogger.debug('Content is not an array or is empty:', content);
      devLogger.debug('Final parsed content result:', {
        totalAllContent: allContent.length,
        youtubeInAllContent: allContent.filter(
          block => block.type === 'youtube'
        ).length,
        allContentYoutubeIds: allContent
          .filter(block => block.type === 'youtube')
          .map(block => block.id),
        headingSections: headingSections.length,
      });
      return { allContent, headingSections };
    }

    devLogger.debug('Parsing lesson content:', {
      totalBlocks: content.length,
      textBlocks: content.filter(block => block.type === 'text').length,
      masterHeadingBlocks: content.filter(
        block => block.type === 'text' && block.textType === 'master_heading'
      ).length,
      masterHeadingDetails: content
        .filter(
          block => block.type === 'text' && block.textType === 'master_heading'
        )
        .map(block => ({
          id: block.block_id || block.id,
          textType: block.textType,
          hasHtmlCss: !!block.html_css,
          htmlPreview: block.html_css
            ? block.html_css.substring(0, 50) + '...'
            : 'None',
        })),
      allBlockTypes: content.map(block => ({
        id: block.id || block.block_id,
        type: block.type,
        textType: block.textType || block.text_type || 'none',
      })),
    });

    // Check for duplicate blocks
    const seenIds = new Set();
    const duplicateBlocks = [];
    content.forEach((block, index) => {
      const blockId = block.id || block.block_id;
      if (seenIds.has(blockId)) {
        duplicateBlocks.push({ index, id: blockId, type: block.type });
      }
      seenIds.add(blockId);
    });

    if (duplicateBlocks.length > 0) {
      devLogger.warn('Found duplicate blocks:', duplicateBlocks);
    }

    // Filter out duplicate blocks based on ID
    const uniqueContent = content.filter((block, index) => {
      const blockId = block.id || block.block_id;
      const firstIndex = content.findIndex(
        b => (b.id || b.block_id) === blockId
      );
      const isDuplicate = firstIndex !== index;

      if (isDuplicate) {
        devLogger.warn('Found duplicate block:', {
          blockId,
          type: block.type,
          index,
          firstIndex,
        });
      }

      return firstIndex === index;
    });

    if (uniqueContent.length !== content.length) {
      devLogger.warn(
        `Filtered out ${content.length - uniqueContent.length} duplicate blocks`
      );
    }

    // Track processed block IDs to prevent duplicates in allContent
    const processedIds = new Set();

    uniqueContent.forEach((block, index) => {
      devLogger.debug(`Processing block ${index}:`, {
        type: block.type,
        textType: block.textType,
        text_type: block.text_type,
        blockId: block.block_id || block.id,
        hasHtmlCss: !!block.html_css,
      });

      const blockId = block.block_id || block.id || `section-${index}`;

      const blockData = {
        id: blockId,
        originalBlock: block,
        completed: false,
      };

      // CRITICAL: Ensure list blocks are NEVER added to headingSections
      // Check if block is actually a list (even if incorrectly typed)
      const isListBlock =
        block.type === 'list' ||
        block.listType ||
        block.list_type ||
        block.details?.listType ||
        block.details?.list_type ||
        (() => {
          // Check content structure for list indicators
          const content = block.content || block.details?.content || '';
          if (typeof content === 'string') {
            try {
              const parsed = JSON.parse(content);
              return (
                parsed &&
                typeof parsed === 'object' &&
                parsed.items &&
                Array.isArray(parsed.items)
              );
            } catch (e) {
              // Not JSON, check for list HTML patterns
              return (
                content.includes('<ol') ||
                content.includes('<ul') ||
                content.includes('list-decimal') ||
                content.includes('list-disc') ||
                content.includes('numbered-list') ||
                content.includes('bulleted-list')
              );
            }
          }
          return (
            content &&
            typeof content === 'object' &&
            content.items &&
            Array.isArray(content.items)
          );
        })();

      // Handle different block types based on your API structure
      if (block.type === 'text' && !isListBlock) {
        // Check if it's a heading type - check both textType and text_type fields
        const textType = block.textType || block.text_type;
        // Extract content from multiple possible locations
        const content =
          block.details?.content ||
          block.content ||
          block.details?.text ||
          block.text ||
          block.details?.title ||
          block.title ||
          '';

        // CRITICAL: Only show master_heading in sidebar - NEVER list items or numbered content
        // Additional validation to prevent numbered list items from being treated as headings
        const isNumberedListItem = /^\d+[\.)]\s+/.test(
          content.replace(/<[^>]*>/g, '').trim()
        );
        const isListContent =
          content.includes('<li') ||
          content.includes('<ol') ||
          content.includes('<ul') ||
          content.includes('list-item');

        if (
          textType === 'master_heading' &&
          !isNumberedListItem &&
          !isListContent
        ) {
          // Extract heading text from html_css field for master headings
          let headingText = '';

          // First try to get text from html_css field (where master heading content is stored)
          // CRITICAL: Extract only h1 text content, not all HTML content
          if (block.html_css) {
            try {
              // Create a temporary DOM element to parse HTML
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = block.html_css;

              // Try to find h1 element first (most specific)
              const h1Element = tempDiv.querySelector('h1');
              if (h1Element) {
                headingText = (
                  h1Element.textContent ||
                  h1Element.innerText ||
                  ''
                ).trim();
              } else {
                // Fallback: if no h1, try to extract from first text node
                // This handles cases where h1 might be nested or styled differently
                const textContent =
                  tempDiv.textContent || tempDiv.innerText || '';
                headingText = textContent.trim();

                // If extracted text is too long (likely contains other content),
                // try to get first line or first 100 chars
                if (headingText.length > 100) {
                  const firstLine = headingText.split('\n')[0].trim();
                  headingText =
                    firstLine.length > 0
                      ? firstLine
                      : headingText.substring(0, 100).trim();
                }
              }
            } catch (error) {
              devLogger.warn('Error parsing master heading HTML:', error);
              // Fallback to simple tag stripping
              headingText = block.html_css.replace(/<[^>]*>/g, '').trim();
            }
          }

          // Fallback to content field if html_css doesn't have text
          if (!headingText && content) {
            try {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = content;
              const h1Element = tempDiv.querySelector('h1');
              if (h1Element) {
                headingText = (
                  h1Element.textContent ||
                  h1Element.innerText ||
                  ''
                ).trim();
              } else {
                headingText = content.replace(/<[^>]*>/g, '').trim();
              }
            } catch (error) {
              headingText = content.replace(/<[^>]*>/g, '').trim();
            }
          }

          // Final fallback to section number
          if (!headingText || headingText === '') {
            headingText = `Section ${index + 1}`;
          }

          devLogger.debug(
            `Found master heading ${headingSections.length + 1}:`,
            {
              blockId: blockId,
              title: headingText,
              index: index,
              textType: textType,
            }
          );

          // Final validation: Ensure this is NOT a list item or numbered content
          const cleanHeadingText = headingText.replace(/<[^>]*>/g, '').trim();
          const isNumberedContent = /^\d+[\.)]\s+/.test(cleanHeadingText);
          const looksLikeListItem =
            cleanHeadingText.length < 100 &&
            (cleanHeadingText.match(/^\d+[\.)]/) ||
              cleanHeadingText.startsWith('•') ||
              cleanHeadingText.startsWith('-'));

          // CRITICAL: Additional validation - ensure master heading text is not from another block
          // Master headings should be short, descriptive titles, not long content
          const isTooLong = cleanHeadingText.length > 150;
          const hasMultipleLines = cleanHeadingText.includes('\n');
          const hasMultipleSentences =
            (cleanHeadingText.match(/[.!?]/g) || []).length > 1;

          // Only add to headingSections if it's a genuine master heading
          // Additional checks to prevent content from other blocks being treated as master headings
          const isValidMasterHeading =
            !isNumberedContent &&
            !looksLikeListItem &&
            !isTooLong &&
            !hasMultipleLines &&
            !hasMultipleSentences;

          if (isValidMasterHeading) {
            headingSections.push({
              ...blockData,
              title: headingText,
              type: 'heading',
            });
          } else {
            devLogger.warn('Skipping numbered/list content from outline:', {
              blockId,
              headingText: cleanHeadingText,
              isNumberedContent,
              looksLikeListItem,
            });
          }
        }

        // Add to all content (check for duplicates)
        if (!processedIds.has(blockId)) {
          allContent.push({
            ...blockData,
            type: block.type,
            textType: textType,
            content: content,
            htmlCss: block.html_css || '',
            style: block.style || {},
          });
          processedIds.add(blockId);
        } else {
          devLogger.warn('Skipping duplicate text block:', blockId);
        }
      } else if (block.type === 'statement') {
        // Handle statement blocks
        const content = block.details?.content || block.content || '';
        const statementType =
          block.details?.statement_type || block.statementType;

        // Don't add statements to sidebar - only show master_heading

        allContent.push({
          ...blockData,
          type: 'statement',
          statementType: statementType,
          content: content,
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'image') {
        const normalizedBlock = {
          ...block,
          imageUrl:
            block.imageUrl ||
            block.image_url ||
            block.details?.image_url ||
            block.url ||
            '',
          imageTitle:
            block.imageTitle ||
            block.image_title ||
            block.details?.alt_text ||
            '',
          layout: block.layout || block.details?.layout || 'centered',
          alignment: block.alignment || block.details?.alignment || 'left',
          captionHtml:
            block.details?.caption_html ||
            block.captionHtml ||
            block.text ||
            '',
          caption:
            block.imageDescription ||
            block.image_description ||
            block.details?.caption ||
            '',
        };

        const htmlContent =
          (block.html_css && block.html_css.trim()) ||
          generateImageHtml(normalizedBlock);

        allContent.push({
          ...blockData,
          ...normalizedBlock,
          type: 'image',
          imageDescription: normalizedBlock.caption,
          text: normalizedBlock.captionHtml,
          htmlCss: htmlContent,
        });
      } else if (block.type === 'video') {
        allContent.push({
          ...blockData,
          type: 'video',
          videoTitle:
            block.videoTitle ||
            block.video_title ||
            block.details?.videoTitle ||
            '',
          videoDescription:
            block.videoDescription ||
            block.video_description ||
            block.details?.videoDescription ||
            '',
          videoUrl:
            block.videoUrl ||
            block.video_url ||
            block.details?.videoUrl ||
            block.url ||
            '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'quote') {
        // Detect quote type from HTML content if not available
        let quoteType =
          block.quoteType || block.quote_type || block.details?.quoteType;

        if (!quoteType && block.html_css) {
          const htmlContent = block.html_css;

          // Quote Carousel - has carousel controls and multiple quotes
          if (
            htmlContent.includes('quote-carousel') ||
            htmlContent.includes('carousel-dot') ||
            htmlContent.includes('carousel-prev') ||
            htmlContent.includes('carousel-next')
          ) {
            quoteType = 'quote_carousel';
          }
          // Quote on Image - has background image with overlay
          else if (
            htmlContent.includes('background-image:') ||
            (htmlContent.includes('bg-gradient-to-t from-black') &&
              htmlContent.includes('absolute inset-0'))
          ) {
            quoteType = 'quote_on_image';
          }
          // Quote C - has author image with horizontal layout
          else if (
            htmlContent.includes('flex items-center space-x-8') ||
            (htmlContent.includes('rounded-full object-cover') &&
              htmlContent.includes('w-16 h-16'))
          ) {
            quoteType = 'quote_c';
          }
          // Quote D - has specific styling with slate background
          else if (
            htmlContent.includes('text-left max-w-3xl') ||
            htmlContent.includes('bg-gradient-to-br from-slate-50')
          ) {
            quoteType = 'quote_d';
          }
          // Quote B - has large text and thin font
          else if (
            htmlContent.includes('text-3xl md:text-4xl') ||
            htmlContent.includes('font-thin')
          ) {
            quoteType = 'quote_b';
          }
          // Quote A - default style
          else {
            quoteType = 'quote_a';
          }
        } else if (!quoteType) {
          quoteType = 'quote_a'; // fallback
        }

        allContent.push({
          ...blockData,
          type: 'quote',
          content: block.content || block.details?.content || '',
          quoteType: quoteType,
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'list' || isListBlock) {
        // CRITICAL: List blocks should NEVER be added to headingSections
        // They should only appear in allContent for rendering
        allContent.push({
          ...blockData,
          type: 'list',
          content: block.content || block.details?.content || '',
          listType:
            block.listType ||
            block.list_type ||
            block.details?.listType ||
            block.details?.list_type ||
            'bulleted',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'pdf') {
        allContent.push({
          ...blockData,
          type: 'pdf',
          pdfTitle:
            block.pdfTitle || block.pdf_title || block.details?.pdfTitle || '',
          pdfDescription:
            block.pdfDescription ||
            block.pdf_description ||
            block.details?.pdfDescription ||
            '',
          pdfUrl:
            block.pdfUrl ||
            block.pdf_url ||
            block.details?.pdfUrl ||
            block.url ||
            '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'table') {
        allContent.push({
          ...blockData,
          type: 'table',
          content: block.content || block.details?.content || '',
          tableData:
            block.tableData ||
            block.table_data ||
            block.details?.tableData ||
            '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'embed') {
        allContent.push({
          ...blockData,
          type: 'embed',
          embedTitle:
            block.embedTitle ||
            block.embed_title ||
            block.details?.embedTitle ||
            '',
          embedDescription:
            block.embedDescription ||
            block.embed_description ||
            block.details?.embedDescription ||
            '',
          embedCode:
            block.embedCode ||
            block.embed_code ||
            block.details?.embedCode ||
            block.content ||
            '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'divider') {
        const normalizedSubtype =
          block.subtype ||
          block.details?.subtype ||
          block.details?.divider_type ||
          block.dividerType ||
          block.divider_type ||
          block.details?.dividerType ||
          'divider';
        allContent.push({
          ...blockData,
          type: 'divider',
          subtype: normalizedSubtype,
          content: block.content || '',
          htmlCss: block.html_css || '',
        });
      } else {
        // Handle other block types - add all blocks to content
        // CRITICAL: Check if this is actually a list block that was incorrectly typed
        const mightBeList =
          isListBlock ||
          (block.content &&
            typeof block.content === 'string' &&
            (block.content.includes('<ol') ||
              block.content.includes('<ul') ||
              block.content.includes('list-decimal') ||
              block.content.includes('list-disc')));

        allContent.push({
          ...blockData,
          type: mightBeList ? 'list' : block.type || 'text',
          content: block.content || block.details?.content || '',
          textType: mightBeList
            ? undefined
            : block.textType ||
              block.text_type ||
              block.statement_type ||
              'paragraph',
          listType: mightBeList
            ? block.listType || block.list_type || 'bulleted'
            : undefined,
          htmlCss: block.html_css || '',
        });
      }
    });

    devLogger.debug('Final parsed content result:', {
      totalAllContent: allContent.length,
      totalHeadingSections: headingSections.length,
      headingSectionTitles: headingSections.map(h => h.title),
      masterHeadingBlocks: allContent.filter(
        block => block.type === 'text' && block.textType === 'master_heading'
      ),
      allTextBlocks: allContent
        .filter(block => block.type === 'text')
        .map(block => ({
          id: block.id,
          textType: block.textType,
          hasContent: !!block.content,
        })),
    });

    return {
      headingSections,
      allContent,
    };
  };

  // Build pages based on master headings and continue dividers
  const computePages = allContent => {
    if (!Array.isArray(allContent) || allContent.length === 0) return [];
    const pages = [];
    const headingIndices = allContent
      .map((b, idx) => ({ b, idx }))
      .filter(({ b }) => b.type === 'text' && b.textType === 'master_heading')
      .map(({ idx }) => idx);

    if (headingIndices.length === 0) {
      const continueIdx = allContent.findIndex(
        b => b.type === 'divider' && b.subtype === 'continue'
      );
      const endExclusive =
        continueIdx >= 0 ? continueIdx + 1 : allContent.length;
      pages.push({ start: 0, endExclusive });
      return pages;
    }

    for (let h = 0; h < headingIndices.length; h++) {
      const start = headingIndices[h];
      const nextHeadingStart = headingIndices[h + 1] ?? allContent.length;
      let endExclusive = nextHeadingStart;
      for (let i = start; i < nextHeadingStart; i++) {
        const block = allContent[i];
        if (
          block &&
          block.type === 'divider' &&
          String(block.subtype).toLowerCase() === 'continue'
        ) {
          endExclusive = i + 1;
          break;
        }
      }
      pages.push({ start, endExclusive });
    }
    return pages;
  };

  const handleSectionClick = sectionId => {
    setCurrentSection(sectionId);
    setSidebarOpen(false);
    // Find the page that contains this section
    const targetIndex =
      lessonData?.headingSections?.findIndex(s => s.id === sectionId) ?? -1;
    if (targetIndex > -1) {
      setCurrentPage(targetIndex);
    }
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      const headerOffset = 100;
      const elementPosition = sectionElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleContinue = () => {
    setCompletedSections(prev => {
      const done = new Set(prev);
      const currentHeading = lessonData?.headingSections?.[currentPage]?.id;
      if (currentHeading) done.add(currentHeading);
      return done;
    });
    const nextPage = pages.length > 0 ? (currentPage + 1) % pages.length : 0;
    setCurrentPage(nextPage);
    const nextHeadingId = lessonData?.headingSections?.[nextPage]?.id;
    if (nextHeadingId) {
      setCurrentSection(nextHeadingId);
      // Defer scroll until DOM updates
      setTimeout(() => {
        const el = document.getElementById(`section-${nextHeadingId}`);
        if (el) {
          const headerOffset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  };

  const markSectionComplete = sectionId => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const handleBackToBuilder = () => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/builder`
    );
  };

  const getReaderHtmlForBlock = block => {
    if (!block) return '';

    if (block.htmlCss && block.htmlCss.trim()) {
      return block.htmlCss;
    }

    // Prefer rich content fields per block type
    switch (block.type) {
      case 'text':
      case 'statement':
      case 'list':
      case 'quote':
      case 'table':
      case 'embed':
      case 'divider':
      case 'audio':
        return block.content || '';
      case 'image': {
        const caption =
          block.captionHtml || block.caption || block.imageDescription || '';
        return caption ? `<p>${caption}</p>` : '';
      }
      case 'video': {
        const text =
          block.videoDescription || block.videoTitle || block.content || '';
        return text ? `<p>${text}</p>` : '';
      }
      case 'youtube': {
        const text =
          block.videoDescription || block.videoTitle || block.content || '';
        return text ? `<p>${text}</p>` : '';
      }
      case 'pdf': {
        const text = block.pdfDescription || block.pdfTitle || '';
        return text ? `<p>${text}</p>` : '';
      }
      default:
        return block.content || '';
    }
  };

  const handleReadBlock = async block => {
    const html = getReaderHtmlForBlock(block);

    if (!html || !html.trim()) {
      toast({
        title: 'Nothing to read',
        description: 'This content block does not contain readable text.',
      });
      return;
    }

    try {
      // Call immersive reader token API (backend integration)
      const { token, subdomain } = await getTtsToken();
      console.debug('[ImmersiveReader] TTS token acquired', {
        hasToken: !!token,
        subdomain,
      });

      setReaderTitle(lessonData?.title || 'Lesson Reader');
      setReaderContent(html);
      setIsReaderOpen(true);
    } catch (error) {
      console.error('[ImmersiveReader] Failed to start reader:', error);
      toast({
        title: 'Immersive Reader unavailable',
        description:
          error?.userMessage ||
          error?.message ||
          'Unable to start Immersive Reader. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Setup carousel functionality for quote carousels
  useEffect(() => {
    // Global carousel navigation functions
    window.carouselPrev = button => {
      devLogger.debug('Carousel Prev clicked');
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) {
        devLogger.debug('No carousel found for prev button');
        return;
      }

      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');

      devLogger.debug(
        'Carousel prev - current index:',
        currentIndex,
        'total slides:',
        slides.length
      );
      const newIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
      showCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.carouselNext = button => {
      devLogger.debug('Carousel Next clicked');
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) {
        devLogger.debug('No carousel found for next button');
        return;
      }

      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      let currentIndex = parseInt(carousel.dataset.current || '0');

      devLogger.debug(
        'Carousel next - current index:',
        currentIndex,
        'total slides:',
        slides.length
      );
      const newIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
      showCarouselSlide(carousel, slides, dots, newIndex);
    };

    window.carouselGoTo = (button, index) => {
      devLogger.debug('Carousel GoTo clicked, index:', index);
      const carousel = button.closest('[class*="quote-carousel"]');
      if (!carousel) {
        devLogger.debug('No carousel found for goTo button');
        return;
      }

      const slides = carousel.querySelectorAll('.quote-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');

      devLogger.debug(
        'Carousel goTo - target index:',
        index,
        'total slides:',
        slides.length
      );
      showCarouselSlide(carousel, slides, dots, index);
    };

    const showCarouselSlide = (carousel, slides, dots, index) => {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.remove('hidden');
          slide.classList.add('block');
        } else {
          slide.classList.remove('block');
          slide.classList.add('hidden');
        }
      });

      dots.forEach((dot, i) => {
        // Normalize: remove all known active/inactive styles first
        dot.classList.remove(
          // inactive variants
          'bg-gray-300',
          'hover:bg-gray-400',
          'bg-slate-300',
          'hover:bg-slate-400',
          'hover:scale-105',
          // active variants
          'bg-indigo-500',
          'scale-110',
          'shadow-md',
          'bg-gradient-to-r',
          'from-blue-500',
          'to-purple-500'
        );

        if (i === index) {
          // Active state: support both simple indigo and gradient style
          // Prefer the gradient look used in generated HTML
          dot.classList.add(
            'bg-gradient-to-r',
            'from-blue-500',
            'to-purple-500',
            'scale-110',
            'shadow-md'
          );
        } else {
          // Inactive state: match the slate gray used in generated HTML
          dot.classList.add(
            'bg-slate-300',
            'hover:bg-slate-400',
            'hover:scale-105'
          );
        }
      });

      carousel.dataset.current = index.toString();
    };

    return () => {
      // Cleanup global functions when component unmounts
      delete window.carouselPrev;
      delete window.carouselNext;
      delete window.carouselGoTo;
    };
  }, []);

  // Re-setup carousel functions when content changes
  useEffect(() => {
    if (
      lessonData &&
      lessonData.allContent &&
      lessonData.allContent.length > 0
    ) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        // Re-setup carousel functions for any new carousels
        if (window.carouselPrev && window.carouselNext && window.carouselGoTo) {
          devLogger.debug('Carousel functions are available');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [lessonData]);

  // Enable interactive checkbox lists in preview
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!lessonData) return;

    const containers = Array.from(
      document.querySelectorAll('.checkbox-container')
    );
    if (containers.length === 0) return;

    const updateVisualState = (container, isChecked) => {
      const hiddenCheckbox = container.querySelector('.checkbox-item');
      const visualCheckbox = container.querySelector('.checkbox-visual');
      const wrapper =
        container.closest('.checkbox-wrapper') || container.parentElement;
      const textElement =
        wrapper?.querySelector('.checkbox-text') ||
        wrapper?.querySelector('.flex-1') ||
        container.parentElement?.parentElement?.querySelector('.checkbox-text');

      if (visualCheckbox && !visualCheckbox.dataset.enhanced) {
        visualCheckbox.classList.add(
          'flex',
          'items-center',
          'justify-center',
          'text-white',
          'text-xs',
          'font-semibold',
          'leading-none'
        );
        if (!visualCheckbox.textContent.trim()) {
          visualCheckbox.textContent = '✓';
        }
        visualCheckbox.dataset.enhanced = 'true';
      }

      if (hiddenCheckbox) {
        hiddenCheckbox.checked = isChecked;
      }

      container.setAttribute('data-checked', isChecked ? 'true' : 'false');
      container.setAttribute('aria-checked', isChecked ? 'true' : 'false');

      if (visualCheckbox) {
        visualCheckbox.classList.toggle('opacity-100', isChecked);
        visualCheckbox.classList.toggle('opacity-0', !isChecked);
      }

      if (textElement) {
        textElement.classList.toggle('line-through', isChecked);
        if (isChecked) {
          textElement.classList.add('text-gray-500');
          textElement.classList.remove('text-gray-800');
        } else {
          textElement.classList.remove('text-gray-500');
          textElement.classList.add('text-gray-800');
        }
      }
    };

    const toggleContainer = container => {
      if (!container) return;
      const hiddenCheckbox = container.querySelector('.checkbox-item');
      const currentChecked =
        hiddenCheckbox && typeof hiddenCheckbox.checked === 'boolean'
          ? hiddenCheckbox.checked
          : container.getAttribute('data-checked') === 'true' ||
            container.getAttribute('aria-checked') === 'true';
      const newChecked = !currentChecked;
      updateVisualState(container, newChecked);
    };

    const handleContainerClick = event => {
      event.preventDefault();
      event.stopPropagation();
      toggleContainer(event.currentTarget);
    };

    const handleContainerKeyDown = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      toggleContainer(event.currentTarget);
    };

    const handleWrapperClick = event => {
      if (event.target.closest('.checkbox-container')) {
        return;
      }
      const container = event.currentTarget.querySelector(
        '.checkbox-container'
      );
      if (!container) return;
      event.preventDefault();
      event.stopPropagation();
      toggleContainer(container);
    };

    containers.forEach(container => {
      container.addEventListener('click', handleContainerClick);
      container.addEventListener('keydown', handleContainerKeyDown);

      const hiddenCheckbox = container.querySelector('.checkbox-item');
      const initialChecked =
        hiddenCheckbox && typeof hiddenCheckbox.checked === 'boolean'
          ? hiddenCheckbox.checked
          : container.getAttribute('data-checked') === 'true' ||
            container.getAttribute('aria-checked') === 'true';
      updateVisualState(container, Boolean(initialChecked));
    });

    const wrappers = Array.from(document.querySelectorAll('.checkbox-wrapper'));
    wrappers.forEach(wrapper => {
      wrapper.addEventListener('click', handleWrapperClick);
    });

    return () => {
      containers.forEach(container => {
        container.removeEventListener('click', handleContainerClick);
        container.removeEventListener('keydown', handleContainerKeyDown);
      });

      wrappers.forEach(wrapper => {
        wrapper.removeEventListener('click', handleWrapperClick);
      });
    };
  }, [lessonData, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Shimmer Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
          <div className="h-screen flex flex-col overflow-hidden">
            {/* Shimmer Lesson Header */}
            <div className="p-6 pb-4 flex-shrink-0">
              <div className="h-4 bg-blue-500 rounded w-20 animate-pulse mb-2"></div>
              <div className="h-6 bg-blue-500 rounded w-full animate-pulse mb-3"></div>
              <div className="h-4 bg-blue-500 rounded w-24 animate-pulse mb-3"></div>
              <div className="bg-blue-700 rounded-full h-2 mb-2">
                <div className="bg-blue-500 rounded-full h-2 w-1/3 animate-pulse"></div>
              </div>
              <div className="h-3 bg-blue-500 rounded w-32 animate-pulse"></div>
            </div>

            {/* Shimmer Navigation Menu */}
            <nav className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {[1, 2, 3, 4, 5].map(index => (
                <div key={index} className="w-full p-3 rounded-lg bg-blue-700">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-500 animate-pulse mr-3"></div>
                    <div className="h-4 bg-blue-500 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Shimmer Main Content */}
        <div className="flex-1 ml-80">
          {/* Shimmer Fixed Header */}
          <header
            className="fixed right-0 z-40 bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-200/80"
            style={{ left: '320px' }}
          >
            <div className="flex items-center justify-between px-6 py-3">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Center Section */}
              <div className="flex flex-col items-center">
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </header>

          {/* Shimmer Content Area */}
          <main className="pt-20 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Master Heading Shimmer */}
              <div className="bg-white rounded-lg p-6">
                <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
              </div>

              {/* Image Shimmer */}
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>

              {/* Paragraph Shimmer */}
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>

              {/* Heading Shimmer */}
              <div className="bg-white rounded-lg p-6">
                <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>

              {/* Paragraph Shimmer */}
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Lesson
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchLessonContent} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToBuilder}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No lesson data available</p>
      </div>
    );
  }

  const currentSectionData =
    lessonData.headingSections.find(s => s.id === currentSection) ||
    lessonData.headingSections[0];

  // Progress based on completed master headings
  const totalSections = lessonData.headingSections?.length || 0;
  const completedCount = Math.min(completedSections.size, totalSections);
  const derivedProgress =
    totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <>
      {/* Custom scrollbar styles for the sidebar */}
      <style jsx>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: #1e40af;
          border-radius: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #60a5fa;
          border-radius: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #93c5fd;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Fixed Sidebar */}
        {sidebarVisible && (
          <div
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden`}
          >
            <div className="flex items-center justify-between p-4 border-b border-blue-500 lg:hidden">
              <h2 className="text-lg font-semibold">Lesson Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-screen flex flex-col overflow-hidden">
              {/* Lesson Header - Fixed at top */}
              <div className="p-6 pb-4 flex-shrink-0">
                <div className="text-sm opacity-75 mb-1">
                  Lesson {lessonData.lessonOrder}
                </div>
                <h1 className="text-xl font-bold leading-tight mb-3">
                  {lessonData.title}
                </h1>

                {/* Section Progress */}
                {totalSections > 0 && (
                  <div className="text-sm opacity-75 mb-3">
                    Section{' '}
                    {Math.max(
                      1,
                      lessonData.headingSections.findIndex(
                        s => s.id === currentSection
                      ) + 1
                    )}{' '}
                    of {totalSections}
                  </div>
                )}

                <div className="bg-blue-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${derivedProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm opacity-75">
                  {derivedProgress}% COMPLETE
                </div>
              </div>

              {/* Navigation Menu - Scrollable area */}
              <nav
                className="sidebar-nav flex-1 overflow-y-auto px-6 pb-6 space-y-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#60a5fa #1e40af',
                }}
              >
                {lessonData.headingSections &&
                lessonData.headingSections.length > 0 ? (
                  lessonData.headingSections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        currentSection === section.id
                          ? 'bg-white text-blue-800'
                          : 'hover:bg-blue-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          {completedSections.has(section.id) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <span className="font-medium">{section.title}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-blue-200">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-60" />
                    <p className="text-sm font-medium">Content Coming Soon</p>
                    <p className="text-xs opacity-75 mt-1">
                      Navigation will appear here
                    </p>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'lg:ml-80' : 'lg:ml-0'}`}
        >
          {/* Fixed Header */}
          <header
            className={`fixed right-0 z-40 bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-200/80 transition-all duration-300 ${
              isHeaderVisible ? 'top-0' : '-top-20'
            }`}
            style={{ left: sidebarVisible ? '320px' : '0' }}
          >
            <div className="flex items-center justify-between px-6 py-3">
              {/* Left Section - Navigation */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 transition-colors"
                  title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                >
                  <Menu className="h-4 w-4 text-gray-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden h-8 w-8 p-0 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded-md transition-colors ml-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Back</span>
                </Button>
              </div>

              {/* Center Section - Lesson Info */}
              <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-8">
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Lesson {lessonData.lessonOrder}
                  </div>
                  <div className="text-base font-semibold text-gray-900 mt-0.5 truncate">
                    {lessonData.title}
                  </div>
                </div>
              </div>

              {/* Right Section - Progress Badges */}
              <div className="flex items-center space-x-3">
                {/* Mobile lesson badge */}
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 md:hidden text-xs px-2 py-1"
                >
                  Lesson {lessonData.lessonOrder}
                </Badge>

                {/* Section progress badge */}
                {totalSections > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-gray-50/80 text-gray-700 border-gray-300 text-xs px-2.5 py-1 font-medium"
                  >
                    Section{' '}
                    {Math.max(
                      1,
                      lessonData.headingSections.findIndex(
                        s => s.id === currentSection
                      ) + 1
                    )}{' '}
                    of {totalSections}
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main
            className={`transition-all duration-300 pt-20 ${sidebarVisible ? 'p-6' : 'px-12 py-8'}`}
          >
            <div
              className={`mx-auto transition-all duration-300 ${sidebarVisible ? 'max-w-4xl' : 'max-w-7xl'}`}
            >
              {/* Display paginated lesson content */}
              <div
                className={`transition-all duration-300 ${sidebarVisible ? 'space-y-6' : 'space-y-8'}`}
              >
                {lessonData.allContent && lessonData.allContent.length > 0 ? (
                  lessonData.allContent.map((block, index) => {
                    if (block.type === 'youtube') {
                      devLogger.debug(`Rendering YouTube block ${index}:`, {
                        id: block.id,
                        index,
                        totalBlocks: lessonData.allContent.length,
                        youtubeBlocks: lessonData.allContent.filter(
                          b => b.type === 'youtube'
                        ).length,
                      });
                    }
                    const visibleStart =
                      pages.length > 0 ? (pages[currentPage]?.start ?? 0) : 0;
                    const visibleEnd =
                      pages.length > 0
                        ? (pages[currentPage]?.endExclusive ??
                          lessonData.allContent.length)
                        : lessonData.allContent.length;
                    if (index < visibleStart || index >= visibleEnd)
                      return null;
                    if (block.type !== 'youtube') {
                      devLogger.debug(`Rendering block ${index}:`, block);
                    }
                    return (
                      <div
                        key={`${block.id || block.block_id || index}-${block.type}`}
                        id={
                          block.textType === 'master_heading'
                            ? `section-${block.id}`
                            : undefined
                        }
                        className={`transition-all duration-300 ${sidebarVisible ? 'mb-6' : 'mb-8'}`}
                      >
                        {/* Statement Content - Use HTML/CSS from API */}
                        {block.type === 'statement' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="text-center py-8 bg-white rounded-lg shadow-sm border p-6">
                                <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                                  {block.content}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Text Content - Use HTML/CSS from API */}
                        {block.type === 'text' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="prose prose-lg max-w-none">
                                {block.textType === 'heading' && (
                                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  </h1>
                                )}
                                {block.textType === 'master_heading' && (
                                  <h1 className="text-4xl font-bold text-gray-900 mb-6">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  </h1>
                                )}
                                {block.textType === 'subheading' && (
                                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  </h2>
                                )}
                                {block.textType === 'heading_paragraph' && (
                                  <div>
                                    {(() => {
                                      const parts = block.content.split('|||');
                                      return (
                                        <>
                                          <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parts[0] || '',
                                              }}
                                            />
                                          </h1>
                                          <div className="text-gray-700 leading-relaxed">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parts[1] || '',
                                              }}
                                            />
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                                {block.textType === 'subheading_paragraph' && (
                                  <div>
                                    {(() => {
                                      const parts = block.content.split('|||');
                                      return (
                                        <>
                                          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parts[0] || '',
                                              }}
                                            />
                                          </h2>
                                          <div className="text-gray-700 leading-relaxed">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parts[1] || '',
                                              }}
                                            />
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                                {(block.textType === 'paragraph' ||
                                  !block.textType) && (
                                  <div className="text-gray-700 leading-relaxed text-lg">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Image Content - Use HTML/CSS from API */}
                        {block.type === 'image' && (
                          <div
                            className="image-block-preview"
                            dangerouslySetInnerHTML={{
                              __html:
                                (block.htmlCss && block.htmlCss.trim()) ||
                                generateImageHtml(block),
                            }}
                          />
                        )}

                        {/* Video Content */}
                        {block.type === 'video' && (
                          <>
                            {(() => {
                              devLogger.debug(
                                'Rendering video block in LessonPreview:',
                                {
                                  id: block.id,
                                  videoUrl: block.videoUrl,
                                  detailsVideoUrl: block.details?.video_url,
                                  videoTitle:
                                    block.videoTitle || block.details?.caption,
                                  hasHtmlCss: !!block.htmlCss,
                                  htmlCssLength: block.htmlCss
                                    ? block.htmlCss.length
                                    : 0,
                                  renderingMethod:
                                    block.htmlCss && block.htmlCss.trim()
                                      ? 'html_css'
                                      : 'fallback',
                                }
                              );
                              return null;
                            })()}
                            {block.htmlCss && block.htmlCss.trim() ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss
                                    .replace(/max-width:\s*600px;?/gi, '')
                                    .replace(/max-width:\s*\d+px;?/gi, ''),
                                }}
                              />
                            ) : (
                              (() => {
                                // Get video URL from multiple sources
                                const videoUrl =
                                  block.videoUrl ||
                                  block.details?.video_url ||
                                  '';
                                const videoTitle =
                                  block.videoTitle ||
                                  block.details?.caption ||
                                  '';
                                const videoDescription =
                                  block.videoDescription ||
                                  block.details?.description ||
                                  '';

                                if (videoUrl && videoUrl.trim()) {
                                  return (
                                    <div className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
                                      {videoTitle && (
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 sm:px-6 lg:px-8">
                                          {videoTitle}
                                        </h3>
                                      )}
                                      {videoDescription && (
                                        <p className="text-sm text-gray-600 mb-3 px-4 sm:px-6 lg:px-8">
                                          {videoDescription}
                                        </p>
                                      )}

                                      <div className="bg-gray-50 p-4">
                                        <video
                                          controls
                                          className="w-full"
                                          style={{
                                            maxHeight: '70vh',
                                            minHeight: '300px',
                                          }}
                                          preload="metadata"
                                        >
                                          <source
                                            src={videoUrl}
                                            type="video/mp4"
                                          />
                                          <source
                                            src={videoUrl}
                                            type="video/webm"
                                          />
                                          <source
                                            src={videoUrl}
                                            type="video/ogg"
                                          />
                                          Your browser does not support the
                                          video element.
                                        </video>

                                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                                          <svg
                                            className="h-3 w-3 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span>{videoTitle}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                      <p className="text-gray-500 text-center">
                                        Video content not available
                                      </p>
                                      <p className="text-xs text-gray-400 mt-2 text-center">
                                        Debug: videoUrl={videoUrl}, details=
                                        {JSON.stringify(block.details)}
                                      </p>
                                    </div>
                                  );
                                }
                              })()
                            )}
                          </>
                        )}

                        {/* YouTube Content */}
                        {block.type === 'youtube' && (
                          <>
                            {(() => {
                              devLogger.debug(
                                'Rendering YouTube block in LessonPreview:',
                                {
                                  id: block.id,
                                  videoTitle: block.videoTitle,
                                  hasHtmlCss: !!block.htmlCss,
                                  embedUrl: block.embedUrl,
                                  htmlCssLength: block.htmlCss
                                    ? block.htmlCss.length
                                    : 0,
                                  htmlCssPreview: block.htmlCss
                                    ? block.htmlCss.substring(0, 100) + '...'
                                    : 'None',
                                  renderingMethod:
                                    block.htmlCss && block.htmlCss.trim()
                                      ? 'html_css'
                                      : 'fallback',
                                  willRenderHtml: !!(
                                    block.htmlCss && block.htmlCss.trim()
                                  ),
                                  willRenderFallback: !(
                                    block.htmlCss && block.htmlCss.trim()
                                  ),
                                }
                              );
                              return null;
                            })()}
                            {block.htmlCss && block.htmlCss.trim() ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="mb-8">
                                {block.videoTitle && (
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {block.videoTitle}
                                  </h3>
                                )}
                                {block.embedUrl && (
                                  <div className="relative rounded-lg overflow-hidden shadow-lg mb-4">
                                    <div className="aspect-video">
                                      <iframe
                                        src={block.embedUrl}
                                        title={
                                          block.videoTitle || 'YouTube Video'
                                        }
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full"
                                      />
                                    </div>
                                  </div>
                                )}
                                {block.videoDescription && (
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {block.videoDescription}
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Quote Content */}
                        {block.type === 'quote' && (
                          <>
                            {(() => {
                              // Debug logging for quote blocks
                              devLogger.debug('Rendering quote block:', {
                                id: block.id,
                                quoteType: block.quoteType,
                                hasHtmlCss: !!block.htmlCss,
                                htmlPreview: block.htmlCss
                                  ? block.htmlCss.substring(0, 100) + '...'
                                  : 'No HTML',
                              });
                              return null;
                            })()}
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-6">
                                <blockquote className="text-xl italic text-gray-700 text-center">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.content,
                                    }}
                                  />
                                </blockquote>
                              </div>
                            )}
                          </>
                        )}

                        {/* List Content */}
                        {block.type === 'list' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="prose prose-lg max-w-none">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: block.content,
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* PDF Content */}
                        {block.type === 'pdf' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="bg-white rounded-lg p-6 border">
                                {block.pdfTitle && (
                                  <h3 className="text-lg font-semibold mb-2">
                                    {block.pdfTitle}
                                  </h3>
                                )}
                                {block.pdfDescription && (
                                  <p className="text-gray-600 mb-4">
                                    {block.pdfDescription}
                                  </p>
                                )}
                                {block.pdfUrl && (
                                  <iframe
                                    src={block.pdfUrl}
                                    className="w-full h-96 border-none rounded-lg"
                                    title={block.pdfTitle || 'PDF Document'}
                                  />
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Table Content */}
                        {block.type === 'table' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="overflow-x-auto">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: block.content,
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Embed Content */}
                        {block.type === 'embed' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="bg-white rounded-lg p-6 border">
                                {block.embedTitle && (
                                  <h3 className="text-lg font-semibold mb-2">
                                    {block.embedTitle}
                                  </h3>
                                )}
                                {block.embedDescription && (
                                  <p className="text-gray-600 mb-4">
                                    {block.embedDescription}
                                  </p>
                                )}
                                {block.embedCode && (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.embedCode,
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Divider Content */}
                        {block.type === 'divider' && (
                          <>
                            {String(block.subtype).toLowerCase() ===
                            'continue' ? (
                              <div
                                className="cursor-pointer"
                                onClick={handleContinue}
                                role="button"
                                aria-label="Continue"
                              >
                                {block.htmlCss ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.htmlCss,
                                    }}
                                  />
                                ) : (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.content,
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              <>
                                {block.htmlCss ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.htmlCss,
                                    }}
                                  />
                                ) : (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: block.content,
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Audio Content */}
                        {block.type === 'audio' && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="prose prose-lg max-w-none">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: block.content,
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Other Content Types - Fallback for any unhandled block types */}
                        {![
                          'text',
                          'statement',
                          'image',
                          'video',
                          'quote',
                          'list',
                          'pdf',
                          'table',
                          'embed',
                          'divider',
                          'youtube',
                          'audio',
                        ].includes(block.type) && (
                          <>
                            {block.htmlCss ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: block.htmlCss,
                                }}
                              />
                            ) : (
                              <div className="prose prose-lg max-w-none">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: block.content,
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}
                        {/* Read button for this block */}
                        {getReaderHtmlForBlock(block)?.trim() && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReadBlock(block)}
                              className="inline-flex items-center gap-1 text-xs"
                            >
                              <BookOpen className="h-3 w-3" />
                              <span>Read</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-full max-w-xl mx-auto">
                      {/* Refined Coming Soon Card (concise + animated) */}
                      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-lg transition-all duration-300 hover:shadow-xl">
                        {/* Animated top bar */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-pulse"></div>

                        {/* Soft gradient backdrop */}
                        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100 opacity-40 blur-3xl"></div>

                        <div className="relative p-8">
                          <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="relative mb-6">
                              <span className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-blue-100 animate-ping opacity-30"></span>
                              <div className="relative z-10 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-blue-50">
                                <Clock className="h-8 w-8 text-blue-600" />
                              </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                              Coming Soon
                            </h1>
                            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
                              This lesson is being prepared. Thank you for your
                              patience while the material is finalized.
                            </p>

                            {/* Status + ETA */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                In Development
                              </span>
                              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                Estimated duration:{' '}
                                {lessonData.duration || '30 min'}
                              </span>
                            </div>

                            <Button
                              onClick={() => navigate(-1)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              Back to Course
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      <ImmersiveReader
        title={readerTitle || lessonData.title}
        content={readerContent}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </>
  );
};

export default LessonPreview;
