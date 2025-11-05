import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

/**
 * Hook to handle loading and fetching lesson data
 * Extracts lines 4064-4535 from original LessonBuilder.jsx
 */
export const useLessonData = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();

  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(
    location.state?.lessonData || null
  );
  const [lessonContent, setLessonContent] = useState(null);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingContent, setFetchingContent] = useState(false);

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

          // Fetch lesson content
          try {
            const lessonId = location.state.lessonData.id;
            console.log('Fetching lesson content for:', lessonId);

            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No authentication token found');
            }

            const contentResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/${lessonId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!contentResponse.ok) {
              throw new Error(`HTTP error! status: ${contentResponse.status}`);
            }

            const contentData = await contentResponse.json();
            console.log('Content response:', contentData);

            if (contentData) {
              console.log('Setting lesson content:', contentData);
              setLessonContent(contentData);

              // Map fetched content to edit blocks
              try {
                const fetchedBlocks = Array.isArray(contentData?.data?.content)
                  ? contentData.data.content
                  : [];
                const mappedEditBlocks = fetchedBlocks.map((b, i) => {
                  const base = {
                    id: b.block_id || `block_${i + 1}`,
                    block_id: b.block_id || `block_${i + 1}`,
                    type: b.type,
                    order: i + 1,
                    html_css: b.html_css || '',
                    details: b.details || {},
                    isEditing: false,
                    timestamp: new Date().toISOString(),
                  };

                  // Map different block types
                  if (b.type === 'image') {
                    return {
                      ...base,
                      title: 'Image',
                      layout: b.details?.layout || 'centered',
                      templateType: b.details?.template || undefined,
                      alignment: b.details?.alignment || 'left',
                      imageUrl: b.details?.image_url || '',
                      imageTitle: b.details?.alt_text || 'Image',
                      imageDescription: b.details?.caption || '',
                      text: b.details?.caption || '',
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

                  if (b.type === 'table') {
                    return {
                      ...base,
                      type: 'table',
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
                      } catch (error) {
                        console.log(
                          'Could not parse interactive content as JSON'
                        );
                      }
                    }
                    if (!template && b.html_css) {
                      const htmlContent = b.html_css;
                      if (
                        htmlContent.includes('data-template="accordion"') ||
                        htmlContent.includes('accordion-header')
                      ) {
                        template = 'accordion';
                      } else if (
                        htmlContent.includes('data-template="tabs"') ||
                        htmlContent.includes('tab-button')
                      ) {
                        template = 'tabs';
                      } else if (
                        htmlContent.includes('data-template="labeled-graphic"')
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
                      } catch (e) {
                        console.log(
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
                      } catch (e) {
                        console.log(
                          'Could not parse existing YouTube content, reconstructing from details'
                        );
                      }
                    }
                    if (
                      !youTubeContent.url ||
                      youTubeContent.url.trim() === ''
                    ) {
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

                      // Extract from html_css if still no URL
                      if (!youTubeContent.url && b.html_css) {
                        const srcMatch =
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/embed\/[^"]*)"/
                          ) ||
                          b.html_css.match(/src="([^"]*youtu\.be\/[^"]*)"/);
                        if (srcMatch) {
                          const extractedUrl = srcMatch[1];
                          if (extractedUrl.includes('/embed/')) {
                            const videoId = extractedUrl
                              .split('/embed/')[1]
                              .split('?')[0];
                            youTubeContent.url = `https://www.youtube.com/watch?v=${videoId}`;
                            youTubeContent.videoId = videoId;
                            youTubeContent.embedUrl = extractedUrl;
                          }
                        }
                      }
                    }
                    return {
                      ...base,
                      type: 'youtube',
                      title: youTubeContent.title || 'YouTube Video',
                      content: JSON.stringify(youTubeContent),
                      html_css: b.html_css || '',
                    };
                  }

                  // Default to text block
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
              } catch (e) {
                console.warn(
                  'Failed to map fetched content to edit blocks:',
                  e
                );
              }
            } else {
              console.log('No content found for this lesson');
            }
          } catch (contentError) {
            console.error('Error fetching lesson content:', contentError);
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

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch lesson data');
          }

          const lessonData = await response.json();
          setLessonData(lessonData);
          setLessonTitle(lessonData.title || 'Untitled Lesson');
          setContentBlocks(lessonData.contentBlocks || []);
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
        console.error('Error loading lesson data:', error);
        setLessonTitle('Untitled Lesson');
      } finally {
        setLoading(false);
        setFetchingContent(false);
      }
    };

    loadLessonData();
  }, [courseId, moduleId, lessonId, location.state]);

  return {
    lessonTitle,
    setLessonTitle,
    lessonData,
    setLessonData,
    lessonContent,
    setLessonContent,
    contentBlocks,
    setContentBlocks,
    loading,
    fetchingContent,
  };
};
