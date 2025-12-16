import { useEffect, useState } from 'react';
import devLogger from '@lessonbuilder/utils/devLogger';

const useLessonLoader = ({
  courseId,
  moduleId,
  lessonId,
  location,
  navigate,
}) => {
  const [contentBlocks, setContentBlocks] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(
    location.state?.lessonData || null
  );
  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingContent, setFetchingContent] = useState(false);

  const buildEmptyContent = lessonId => ({
    success: true,
    data: {
      content: [],
      lesson_id: lessonId,
      html_css: '',
      css: '',
      script: '',
      scorm_url: null,
      scormUrl: null,
    },
    message: 'No lesson content found - using empty defaults',
  });

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        setFetchingContent(true);

        if (location.state?.lessonData) {
          const { title, contentBlocks } = location.state.lessonData;
          setLessonTitle(title);
          setContentBlocks(contentBlocks || []);
          setLessonData(location.state.lessonData);

          try {
            const lessonId = location.state.lessonData.id;
            devLogger.debug('Fetching lesson content for:', lessonId);

            const baseUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
            const response = await fetch(
              `${baseUrl}/api/lessoncontent/${lessonId}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (response.status === 404) {
              devLogger.info(
                'No lesson content found yet, initializing empty content'
              );
              setLessonContent(buildEmptyContent(lessonId));
              setFetchingContent(false);
              setLoading(false);
              return;
            }

            if (!response.ok) {
              throw new Error(
                `Failed to fetch lesson content: ${response.status}`
              );
            }

            const responseData = await response.json();
            devLogger.debug('Fetched lesson content:', responseData);

            const scormUrl =
              responseData.data?.scorm_url ||
              responseData.data?.scormUrl ||
              null;

            const contentData = {
              success: true,
              data: {
                content: responseData.data?.content || [],
                lesson_id: lessonId,
                html_css: responseData.data?.html_css || '',
                css: responseData.data?.css || '',
                script: responseData.data?.script || '',
                scorm_url: scormUrl,
                scormUrl,
              },
              message: 'Lesson content fetched successfully',
            };
            devLogger.debug('Content response:', contentData);

            if (contentData) {
              devLogger.debug('Setting lesson content:', contentData);
              setLessonContent(contentData);

              try {
                const fetchedBlocks = Array.isArray(contentData?.data?.content)
                  ? contentData.data.content
                  : [];
                const mappedEditBlocks = fetchedBlocks.map((b, i) => {
                  const base = {
                    id: b.block_id || `block_${i + 1}`,
                    block_id: b.block_id || `block_${i + 1}`,
                    type: b.type,
                    order:
                      b.order !== undefined && b.order !== null
                        ? b.order
                        : i + 1,
                    html_css: b.html_css || '',
                    details: b.details || {},
                    isEditing: false,
                    timestamp: new Date().toISOString(),
                  };
                  if (b.type === 'image') {
                    const captionHtml = b.details?.caption_html || '';
                    const captionPlain = b.details?.caption || '';
                    return {
                      ...base,
                      title: b.details?.alt_text || b.title || 'Image',
                      layout: b.details?.layout || 'centered',
                      templateType: b.details?.template || undefined,
                      alignment: b.details?.alignment || 'left',
                      imageUrl: b.details?.image_url || '',
                      imageTitle: b.details?.alt_text || 'Image',
                      imageDescription: captionPlain,
                      text: captionHtml || captionPlain,
                    };
                  }
                  if (b.type === 'pdf') {
                    return {
                      ...base,
                      type: 'pdf',
                      pdfUrl: b.details?.pdf_url || '',
                      pdfTitle: b.details?.caption || 'PDF Document',
                      pdfDescription: b.details?.description || '',
                    };
                  }
                  if (b.type === 'video') {
                    return {
                      ...base,
                      type: 'video',
                      videoUrl: b.details?.video_url || '',
                      videoTitle: b.details?.caption || '',
                    };
                  }
                  if (b.type === 'statement') {
                    return {
                      ...base,
                      type: 'statement',
                      title: b.details?.title || 'Statement',
                      statementType:
                        b.details?.statement_type ||
                        b.details?.statementType ||
                        'statement-a',
                      content: b.details?.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  // Auto-detect table blocks even if type is wrong
                  const isTableContent = (() => {
                    const content = b.details?.content || b.content || '';
                    if (typeof content === 'string') {
                      try {
                        const parsed = JSON.parse(content);
                        return (
                          parsed &&
                          typeof parsed === 'object' &&
                          parsed.headers &&
                          Array.isArray(parsed.headers) &&
                          parsed.data &&
                          Array.isArray(parsed.data)
                        );
                      } catch (e) {
                        return false;
                      }
                    }
                    return (
                      content &&
                      typeof content === 'object' &&
                      content.headers &&
                      Array.isArray(content.headers) &&
                      content.data &&
                      Array.isArray(content.data)
                    );
                  })();

                  if (b.type === 'table' || isTableContent) {
                    return {
                      ...base,
                      type: 'table', // Always use 'table' (singular)
                      title: b.details?.title || 'Table',
                      tableType:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      templateId:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                      textType: 'table',
                    };
                  }
                  if (b.type === 'quote') {
                    return {
                      ...base,
                      type: 'quote',
                      title: b.details?.title || 'Quote',
                      textType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      quoteType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'divider') {
                    let dividerSubtype = b.details?.divider_type || b.subtype;
                    if (!dividerSubtype && typeof b.html_css === 'string') {
                      const html = b.html_css;
                      if (
                        (html.includes('cursor-pointer') ||
                          html.includes('letter-spacing')) &&
                        (html.includes('background-color') ||
                          html.includes('bg-blue'))
                      ) {
                        dividerSubtype = 'continue';
                      } else if (
                        (html.includes('rounded-full') ||
                          html.includes('border-radius: 50%')) &&
                        (html.includes('<hr') || html.includes('border-top'))
                      ) {
                        dividerSubtype = 'numbered_divider';
                      } else if (html.includes('<hr')) {
                        dividerSubtype = 'divider';
                      } else {
                        dividerSubtype = 'continue';
                      }
                    }
                    return {
                      ...base,
                      type: 'divider',
                      title: 'Divider',
                      subtype: dividerSubtype || 'continue',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'interactive') {
                    let template = b.subtype || b.details?.template;
                    if (!template && b.content) {
                      try {
                        const content = JSON.parse(b.content);
                        template = content.template;
                      } catch {
                        devLogger.warn(
                          'Could not parse interactive content as JSON'
                        );
                      }
                    }
                    if (!template && b.html_css) {
                      const htmlContent = b.html_css;
                      if (
                        htmlContent.includes('data-template="accordion"') ||
                        htmlContent.includes('accordion-header') ||
                        htmlContent.includes('accordion-content') ||
                        htmlContent.includes('interactive-accordion')
                      ) {
                        template = 'accordion';
                      } else if (
                        htmlContent.includes('data-template="tabs"') ||
                        htmlContent.includes('tab-button') ||
                        htmlContent.includes('interactive-tabs')
                      ) {
                        template = 'tabs';
                      } else if (
                        htmlContent.includes(
                          'data-template="labeled-graphic"'
                        ) ||
                        htmlContent.includes('labeled-graphic-container')
                      ) {
                        template = 'labeled-graphic';
                      }
                    }
                    return {
                      ...base,
                      type: 'interactive',
                      title: b.details?.title || 'Interactive Content',
                      subtype: template || 'accordion',
                      template: template || 'accordion',
                      content: b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'audio') {
                    let audioContent = {};
                    if (b.content) {
                      try {
                        audioContent = JSON.parse(b.content);
                      } catch {
                        devLogger.warn(
                          'Could not parse existing audio content, reconstructing from details'
                        );
                      }
                    }
                    if (!audioContent.title && !audioContent.url) {
                      audioContent = {
                        title:
                          b.details?.audioTitle ||
                          b.details?.title ||
                          b.title ||
                          'Audio',
                        description:
                          b.details?.audioDescription ||
                          b.details?.description ||
                          '',
                        uploadMethod: b.details?.uploadMethod || 'url',
                        url: b.details?.audioUrl || b.details?.audio_url || '',
                        uploadedData: b.details?.uploadedData || null,
                        createdAt: b.createdAt || new Date().toISOString(),
                      };
                    }
                    return {
                      ...base,
                      type: 'audio',
                      title: audioContent.title || 'Audio',
                      content: JSON.stringify(audioContent),
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'youtube') {
                    let youTubeContent = {};
                    if (b.content) {
                      try {
                        youTubeContent = JSON.parse(b.content);
                      } catch {
                        devLogger.warn(
                          'Could not parse existing YouTube content, reconstructing from details'
                        );
                      }
                    }
                    if (
                      !youTubeContent.url ||
                      youTubeContent.url.trim() === ''
                    ) {
                      devLogger.debug(
                        'Reconstructing YouTube content from details:',
                        b.details
                      );
                      devLogger.debug('Available block data:', {
                        details: b.details,
                        content: b.content,
                        html_css: b.html_css ? 'Present' : 'Missing',
                      });

                      youTubeContent = {
                        title:
                          b.details?.youTubeTitle ||
                          b.details?.title ||
                          b.title ||
                          'YouTube Video',
                        description:
                          b.details?.youTubeDescription ||
                          b.details?.description ||
                          '',
                        url:
                          b.details?.youTubeUrl || b.details?.youtube_url || '',
                        videoId: b.details?.videoId || '',
                        embedUrl: b.details?.embedUrl || '',
                        createdAt: b.createdAt || new Date().toISOString(),
                      };

                      if (!youTubeContent.url && b.html_css) {
                        const srcMatch =
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/embed\/[^"]*)"/
                          ) ||
                          b.html_css.match(/src="([^"]*youtu\.be\/[^"]*)"/) ||
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/watch\?v=[^"]*)"/
                          );
                        if (srcMatch) {
                          const extractedUrl = srcMatch[1];
                          devLogger.debug(
                            'Extracted URL from html_css:',
                            extractedUrl
                          );

                          let watchUrl = extractedUrl;
                          if (extractedUrl.includes('/embed/')) {
                            const videoId = extractedUrl
                              .split('/embed/')[1]
                              .split('?')[0];
                            watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                            youTubeContent.videoId = videoId;
                            youTubeContent.embedUrl = extractedUrl;
                          }
                          youTubeContent.url = watchUrl;
                        }
                      }
                    }

                    devLogger.debug('YouTube block loading result:', {
                      blockId: b.id,
                      finalContent: youTubeContent,
                      hasUrl: !!youTubeContent.url,
                    });

                    return {
                      ...base,
                      type: 'youtube',
                      title: youTubeContent.title || 'YouTube Video',
                      content: JSON.stringify(youTubeContent),
                      html_css: b.html_css || '',
                    };
                  }

                  const html = b.html_css || b.content || '';
                  const lowered = html.toLowerCase();

                  // Prefer explicit text type from backend when available
                  const explicitTextType = b.textType || b.text_type || null;

                  const hasH1 = lowered.includes('<h1');
                  const hasH2 = lowered.includes('<h2');
                  const hasP = lowered.includes('<p');

                  // Detect gradient-based master headings (supports both inline styles and Tailwind classes)
                  const hasGradient =
                    lowered.includes('linear-gradient') ||
                    lowered.includes('bg-gradient-to-r') ||
                    lowered.includes('gradient');

                  const hasLargeHeadingClasses =
                    hasH1 ||
                    lowered.includes('text-3xl') ||
                    lowered.includes('text-4xl') ||
                    lowered.includes('font-extrabold');

                  const isMasterHeading =
                    explicitTextType === 'master_heading' ||
                    b.gradient ||
                    (hasGradient && hasLargeHeadingClasses);

                  let detectedType;

                  if (isMasterHeading) {
                    detectedType = 'master_heading';
                  } else if (
                    !explicitTextType ||
                    explicitTextType === 'heading' ||
                    explicitTextType === 'paragraph'
                  ) {
                    // Only infer complex types when we can't fully trust the stored textType
                    detectedType =
                      hasH1 && hasP
                        ? 'heading_paragraph'
                        : hasH2 && hasP
                          ? 'subheading_paragraph'
                          : hasH1
                            ? 'heading'
                            : hasH2
                              ? 'subheading'
                              : 'paragraph';
                  } else {
                    detectedType = explicitTextType;
                  }

                  return {
                    ...base,
                    type: 'text',
                    title: 'Text Block',
                    textType: detectedType,
                    content: html,
                    // Preserve gradient so master headings remain identifiable when editing
                    ...(b.gradient && { gradient: b.gradient }),
                  };
                });
                if (mappedEditBlocks.length > 0) {
                  setContentBlocks(mappedEditBlocks);
                  setLessonContent(null);
                }
              } catch (e) {
                devLogger.warn(
                  'Failed to map fetched content to edit blocks:',
                  e
                );
              }
            } else {
              devLogger.debug('No content found for this lesson');
            }
          } catch (contentError) {
            devLogger.error('Error fetching lesson content:', contentError);
            devLogger.error(
              'Error details:',
              contentError.response?.data || contentError.message
            );
          }

          setLoading(false);
          setFetchingContent(false);
          return;
        }

        if (lessonId) {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          devLogger.debug('Fetching lesson data for:', {
            courseId,
            moduleId,
            lessonId,
          });

          const baseUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
          const lessonResponse = await fetch(
            `${baseUrl}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!lessonResponse.ok) {
            throw new Error(
              `Failed to fetch lesson data: ${lessonResponse.status}`
            );
          }

          const lessonResponseData = await lessonResponse.json();
          devLogger.debug('Fetched lesson data:', lessonResponseData);

          const lessonData = lessonResponseData.data || lessonResponseData;

          setLessonData(lessonData);
          setLessonTitle(lessonData.title || 'Untitled Lesson');
          setContentBlocks(lessonData.contentBlocks || []);

          try {
            devLogger.debug('Fetching lesson content for lessonId:', lessonId);

            const contentResponse = await fetch(
              `${baseUrl}/api/lessoncontent/${lessonId}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (contentResponse.status === 404) {
              devLogger.info(
                'No lesson content found yet, initializing empty content'
              );
              setLessonContent(buildEmptyContent(lessonId));
              setFetchingContent(false);
              return;
            }

            if (contentResponse.ok) {
              const contentResponseData = await contentResponse.json();
              devLogger.debug('Fetched lesson content:', contentResponseData);

              const scormUrl =
                contentResponseData.data?.scorm_url ||
                contentResponseData.data?.scormUrl ||
                null;

              const contentData = {
                success: true,
                data: {
                  content: contentResponseData.data?.content || [],
                  lesson_id: lessonId,
                  html_css: contentResponseData.data?.html_css || '',
                  css: contentResponseData.data?.css || '',
                  script: contentResponseData.data?.script || '',
                  scorm_url: scormUrl,
                  scormUrl,
                },
                message: 'Lesson content fetched successfully',
              };

              setLessonContent(contentData);

              const fetchedBlocks = Array.isArray(contentData?.data?.content)
                ? contentData.data.content
                : [];

              if (fetchedBlocks.length > 0) {
                const mappedEditBlocks = fetchedBlocks.map((b, i) => {
                  const base = {
                    id: b.block_id || `block_${i + 1}`,
                    block_id: b.block_id || `block_${i + 1}`,
                    type: b.type,
                    order:
                      b.order !== undefined && b.order !== null
                        ? b.order
                        : i + 1,
                    html_css: b.html_css || '',
                    details: b.details || {},
                    isEditing: false,
                    timestamp: new Date().toISOString(),
                  };

                  if (b.type === 'image') {
                    const captionHtml = b.details?.caption_html || '';
                    const captionPlain = b.details?.caption || '';
                    return {
                      ...base,
                      title: b.details?.alt_text || b.title || 'Image',
                      layout: b.details?.layout || 'centered',
                      templateType: b.details?.template || undefined,
                      alignment: b.details?.alignment || 'left',
                      imageUrl: b.details?.image_url || '',
                      imageTitle: b.details?.alt_text || 'Image',
                      imageDescription: captionPlain,
                      text: captionHtml || captionPlain,
                    };
                  }

                  if (b.type === 'pdf') {
                    return {
                      ...base,
                      type: 'pdf',
                      pdfUrl: b.details?.pdf_url || '',
                      pdfTitle: b.details?.caption || 'PDF Document',
                      pdfDescription: b.details?.description || '',
                    };
                  }
                  if (b.type === 'video') {
                    return {
                      ...base,
                      type: 'video',
                      videoUrl: b.details?.video_url || '',
                      videoTitle: b.details?.caption || '',
                    };
                  }
                  if (b.type === 'statement') {
                    return {
                      ...base,
                      type: 'statement',
                      title: b.details?.title || 'Statement',
                      statementType:
                        b.details?.statement_type ||
                        b.details?.statementType ||
                        'statement-a',
                      content: b.details?.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  // Auto-detect table blocks even if type is wrong
                  const isTableContent = (() => {
                    const content = b.details?.content || b.content || '';
                    if (typeof content === 'string') {
                      try {
                        const parsed = JSON.parse(content);
                        return (
                          parsed &&
                          typeof parsed === 'object' &&
                          parsed.headers &&
                          Array.isArray(parsed.headers) &&
                          parsed.data &&
                          Array.isArray(parsed.data)
                        );
                      } catch (e) {
                        return false;
                      }
                    }
                    return (
                      content &&
                      typeof content === 'object' &&
                      content.headers &&
                      Array.isArray(content.headers) &&
                      content.data &&
                      Array.isArray(content.data)
                    );
                  })();

                  if (b.type === 'table' || isTableContent) {
                    return {
                      ...base,
                      type: 'table', // Always use 'table' (singular)
                      title: b.details?.title || 'Table',
                      tableType:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      templateId:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                      textType: 'table',
                    };
                  }
                  if (b.type === 'quote') {
                    return {
                      ...base,
                      type: 'quote',
                      title: b.details?.title || 'Quote',
                      textType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      quoteType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'divider') {
                    let dividerSubtype = b.details?.divider_type || b.subtype;
                    if (!dividerSubtype && typeof b.html_css === 'string') {
                      const html = b.html_css;
                      if (
                        (html.includes('cursor-pointer') ||
                          html.includes('letter-spacing')) &&
                        (html.includes('background-color') ||
                          html.includes('bg-blue'))
                      ) {
                        dividerSubtype = 'continue';
                      } else if (
                        (html.includes('rounded-full') ||
                          html.includes('border-radius: 50%')) &&
                        (html.includes('<hr') || html.includes('border-top'))
                      ) {
                        dividerSubtype = 'numbered_divider';
                      } else if (html.includes('<hr')) {
                        dividerSubtype = 'divider';
                      } else {
                        dividerSubtype = 'continue';
                      }
                    }
                    return {
                      ...base,
                      type: 'divider',
                      title: 'Divider',
                      subtype: dividerSubtype || 'continue',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'interactive') {
                    let template = b.subtype || b.details?.template;
                    if (!template && b.content) {
                      try {
                        const content = JSON.parse(b.content);
                        template = content.template;
                      } catch {
                        devLogger.warn(
                          'Could not parse interactive content as JSON'
                        );
                      }
                    }
                    if (!template && b.html_css) {
                      const htmlContent = b.html_css;
                      if (
                        htmlContent.includes('data-template="accordion"') ||
                        htmlContent.includes('accordion-header') ||
                        htmlContent.includes('accordion-content') ||
                        htmlContent.includes('interactive-accordion')
                      ) {
                        template = 'accordion';
                      } else if (
                        htmlContent.includes('data-template="tabs"') ||
                        htmlContent.includes('tab-button') ||
                        htmlContent.includes('interactive-tabs')
                      ) {
                        template = 'tabs';
                      } else if (
                        htmlContent.includes(
                          'data-template="labeled-graphic"'
                        ) ||
                        htmlContent.includes('labeled-graphic-container')
                      ) {
                        template = 'labeled-graphic';
                      }
                    }
                    return {
                      ...base,
                      type: 'interactive',
                      title: b.details?.title || 'Interactive Content',
                      subtype: template || 'accordion',
                      template: template || 'accordion',
                      content: b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'audio') {
                    let audioContent = {};
                    if (b.content) {
                      try {
                        audioContent = JSON.parse(b.content);
                      } catch {
                        devLogger.warn(
                          'Could not parse existing audio content, reconstructing from details'
                        );
                      }
                    }
                    if (!audioContent.title && !audioContent.url) {
                      audioContent = {
                        title:
                          b.details?.audioTitle ||
                          b.details?.title ||
                          b.title ||
                          'Audio',
                        description:
                          b.details?.audioDescription ||
                          b.details?.description ||
                          '',
                        uploadMethod: b.details?.uploadMethod || 'url',
                        url: b.details?.audioUrl || b.details?.audio_url || '',
                        uploadedData: b.details?.uploadedData || null,
                        createdAt: b.createdAt || new Date().toISOString(),
                      };
                    }
                    return {
                      ...base,
                      type: 'audio',
                      title: audioContent.title || 'Audio',
                      content: JSON.stringify(audioContent),
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'youtube') {
                    let youTubeContent = {};
                    if (b.content) {
                      try {
                        youTubeContent = JSON.parse(b.content);
                      } catch {
                        devLogger.warn(
                          'Could not parse existing YouTube content, reconstructing from details'
                        );
                      }
                    }
                    if (
                      !youTubeContent.url ||
                      youTubeContent.url.trim() === ''
                    ) {
                      devLogger.debug(
                        'Reconstructing YouTube content from details:',
                        b.details
                      );
                      devLogger.debug('Available block data:', {
                        details: b.details,
                        content: b.content,
                        html_css: b.html_css ? 'Present' : 'Missing',
                      });

                      youTubeContent = {
                        title:
                          b.details?.youTubeTitle ||
                          b.details?.title ||
                          b.title ||
                          'YouTube Video',
                        description:
                          b.details?.youTubeDescription ||
                          b.details?.description ||
                          '',
                        url:
                          b.details?.youTubeUrl || b.details?.youtube_url || '',
                        videoId: b.details?.videoId || '',
                        embedUrl: b.details?.embedUrl || '',
                        createdAt: b.createdAt || new Date().toISOString(),
                      };

                      if (!youTubeContent.url && b.html_css) {
                        const srcMatch =
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/embed\/[^"]*)"/
                          ) ||
                          b.html_css.match(/src="([^"]*youtu\.be\/[^"]*)"/) ||
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/watch\?v=[^"]*)"/
                          );
                        if (srcMatch) {
                          const extractedUrl = srcMatch[1];
                          devLogger.debug(
                            'Extracted URL from html_css:',
                            extractedUrl
                          );

                          let watchUrl = extractedUrl;
                          if (extractedUrl.includes('/embed/')) {
                            const videoId = extractedUrl
                              .split('/embed/')[1]
                              .split('?')[0];
                            watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                            youTubeContent.videoId = videoId;
                            youTubeContent.embedUrl = extractedUrl;
                          }
                          youTubeContent.url = watchUrl;
                        }
                      }
                    }

                    devLogger.debug('YouTube block loading result:', {
                      blockId: b.id,
                      finalContent: youTubeContent,
                      hasUrl: !!youTubeContent.url,
                    });

                    return {
                      ...base,
                      type: 'youtube',
                      title: youTubeContent.title || 'YouTube Video',
                      content: JSON.stringify(youTubeContent),
                      html_css: b.html_css || '',
                    };
                  }

                  const html = b.html_css || '';
                  const lowered = html.toLowerCase();
                  const hasH1 = lowered.includes('<h1');
                  const hasH2 = lowered.includes('<h2');
                  const hasP = lowered.includes('<p');
                  const isMasterHeading =
                    hasH1 &&
                    (lowered.includes('linear-gradient') ||
                      lowered.includes('gradient'));

                  const detectedType = isMasterHeading
                    ? 'master_heading'
                    : hasH1 && hasP
                      ? 'heading_paragraph'
                      : hasH2 && hasP
                        ? 'subheading_paragraph'
                        : hasH1
                          ? 'heading'
                          : hasH2
                            ? 'subheading'
                            : 'paragraph';
                  return {
                    ...base,
                    type: 'text',
                    title: 'Text Block',
                    textType: detectedType,
                    content: html,
                  };
                });

                if (mappedEditBlocks.length > 0) {
                  setContentBlocks(mappedEditBlocks);
                  setLessonContent(null);
                }
              }
            } else {
              devLogger.debug(
                'No content found for this lesson or content fetch failed'
              );
            }
          } catch (contentError) {
            devLogger.error('Error fetching lesson content:', contentError);
          } finally {
            setFetchingContent(false);
          }
        } else {
          setLessonTitle('New Lesson');
          setLessonData({
            id: null,
            title: 'New Lesson',
            description: '',
            contentBlocks: [],
            status: 'DRAFT',
          });
          setContentBlocks([]);
        }
      } catch (error) {
        devLogger.error('Error loading lesson data:', error);
        setLessonTitle('Untitled Lesson');
        if (error.message.includes('token') || error.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [courseId, moduleId, lessonId, navigate, location.state]);

  return {
    contentBlocks,
    setContentBlocks,
    lessonTitle,
    lessonData,
    lessonContent,
    setLessonContent,
    loading,
    fetchingContent,
  };
};

export default useLessonLoader;
