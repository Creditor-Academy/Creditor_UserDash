import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Clock,
  Play,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAuthHeader } from '@/services/authHeader';
import { SidebarContext } from '@/layouts/DashboardLayout';

const LessonContentView = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSidebarCollapsed } = useContext(SidebarContext);

  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('LessonContentView rendered with params:', {
    courseId,
    moduleId,
    lessonId,
  });

  // Fetch lesson content
  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      fetchLessonContent();
    }
  }, [courseId, moduleId, lessonId]);

  const fetchLessonContent = async () => {
    try {
      setLoading(true);
      console.log('Fetching lesson content for:', {
        courseId,
        moduleId,
        lessonId,
      });

      // Fetch both lesson content and lesson details
      const [contentResponse, lessonsResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/${lessonId}`,
          {
            headers: getAuthHeader(),
            withCredentials: true,
          }
        ),
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/all-lessons`,
          {
            headers: getAuthHeader(),
            withCredentials: true,
          }
        ),
      ]).catch(async error => {
        console.error('Error in parallel requests:', error);
        // If lessons API fails, try to get content only
        const contentResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/${lessonId}`,
          {
            headers: getAuthHeader(),
            withCredentials: true,
          }
        );
        return [contentResponse, { data: [] }];
      });

      console.log('Lesson content response:', contentResponse.data);
      console.log('Lessons response:', lessonsResponse.data);

      // Process content data
      const contentData = contentResponse.data.data || contentResponse.data;

      // Process lessons data to find the specific lesson
      let lessonsData = [];
      if (Array.isArray(lessonsResponse.data)) {
        lessonsData = lessonsResponse.data;
      } else if (lessonsResponse.data?.data) {
        lessonsData = Array.isArray(lessonsResponse.data.data)
          ? lessonsResponse.data.data
          : [lessonsResponse.data.data];
      } else if (lessonsResponse.data?.lessons) {
        lessonsData = Array.isArray(lessonsResponse.data.lessons)
          ? lessonsResponse.data.lessons
          : [lessonsResponse.data.lessons];
      }

      // Debug lesson data
      console.log('All lessons data:', lessonsData);
      console.log('Looking for lesson ID:', lessonId, 'Type:', typeof lessonId);

      // Find the specific lesson by ID - try multiple matching strategies
      let currentLesson = lessonsData.find(lesson => {
        const lessonIdNum = parseInt(lessonId);
        const lessonIdStr = String(lessonId);

        console.log('Checking lesson:', lesson, 'ID fields:', {
          id: lesson.id,
          lesson_id: lesson.lesson_id,
          lessonIdNum,
          lessonIdStr,
        });

        return (
          lesson.id === lessonIdNum ||
          lesson.lesson_id === lessonIdNum ||
          lesson.id === lessonIdStr ||
          lesson.lesson_id === lessonIdStr ||
          String(lesson.id) === lessonIdStr ||
          String(lesson.lesson_id) === lessonIdStr
        );
      });

      console.log('Found current lesson:', currentLesson);

      // If not found, try a different approach - get the first lesson if only one exists
      if (!currentLesson && lessonsData.length === 1) {
        console.log('Using single lesson as fallback');
        currentLesson = lessonsData[0];
      }

      // Combine content and lesson metadata
      const combinedData = {
        ...contentData,
        // Use lesson metadata if available, otherwise fall back to content data
        title:
          currentLesson?.title ||
          currentLesson?.lesson_title ||
          contentData.title ||
          contentData.lesson_title,
        description:
          currentLesson?.description ||
          currentLesson?.lesson_description ||
          contentData.description ||
          contentData.lesson_description,
        // status: currentLesson?.status || currentLesson?.lesson_status || contentData.status || contentData.lesson_status,
        duration:
          currentLesson?.duration ||
          currentLesson?.lesson_duration ||
          contentData.duration ||
          contentData.lesson_duration,
        order:
          currentLesson?.order ||
          currentLesson?.lesson_order ||
          contentData.order ||
          contentData.lesson_order,
        type:
          currentLesson?.type ||
          currentLesson?.lesson_type ||
          contentData.type ||
          contentData.lesson_type,
      };

      console.log('Final combined lesson data:', combinedData);
      setLessonContent(combinedData);
    } catch (err) {
      console.error('Error fetching lesson content:', err);
      setError('Failed to load lesson content. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load lesson content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status?.toUpperCase()) {
  //     case 'PUBLISHED':
  //       return 'default';

  //     case 'DRAFT':
  //       return 'secondary';
  //     case 'COMPLETED':
  //       return 'success';
  //     default:
  //       return 'secondary';
  //   }
  // };

  const formatDuration = duration => {
    if (!duration) return '0 min';
    if (typeof duration === 'string' && duration.includes('min'))
      return duration;
    return `${duration} min`;
  };

  const processLessonContent = content => {
    console.log('Processing lesson content:', content);

    if (!content) return null;

    // If content is a string (likely HTML from AI-generated lessons), return it directly
    if (typeof content === 'string') {
      // Check if it's HTML content (contains HTML tags)
      if (content.includes('<') && content.includes('>')) {
        return content;
      }
      // If it's plain text, wrap it in a paragraph
      return `<p class="mb-6 text-slate-700 leading-relaxed text-base">${content}</p>`;
    }

    // If content is an array of objects, process each block
    if (Array.isArray(content)) {
      return content
        .map((block, index) => {
          console.log(`Processing block ${index}:`, block);

          if (typeof block === 'string') {
            return block.includes('<') && block.includes('>')
              ? block
              : `<p class="mb-6 text-slate-700 leading-relaxed text-base">${block}</p>`;
          }

          if (typeof block === 'object' && block !== null) {
            // Handle AI-generated lesson structure
            if (block.type === 'point' && block.title && block.description) {
              return `<div class="bg-gray-50 border border-gray-200 p-4 mb-4 rounded-lg">
                      <h4 class="text-lg font-semibold text-gray-800 mb-2">${block.title}</h4>
                      <p class="text-gray-700">${block.description}</p>
                    </div>`;
            }

            // First priority: Check for html_css content (the actual rendered HTML)
            if (block.html_css && typeof block.html_css === 'string') {
              return block.html_css;
            }

            // Second priority: Check for direct HTML content
            if (block.html && typeof block.html === 'string') {
              return block.html;
            }

            // Third priority: Check for content property
            if (block.content && typeof block.content === 'string') {
              return block.content;
            }

            // Fourth priority: Check for text content
            if (block.text && typeof block.text === 'string') {
              return block.text;
            }

            // Handle specific block types
            if (block.type === 'heading') {
              const headingText = block.heading || block.title || '';
              const level = block.level || 2;
              if (headingText) {
                return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-6 text-slate-800">${headingText}</h${level}>`;
              }
            }

            if (block.type === 'paragraph') {
              const paragraphText = block.paragraph || '';
              if (paragraphText) {
                return `<p class="mb-6 text-slate-700 leading-relaxed text-base">${paragraphText}</p>`;
              }
            }

            if (block.type === 'image' && block.src) {
              const alt = block.alt || 'Image';
              const caption = block.caption
                ? `<p class="text-sm text-slate-600 text-center mt-3 italic">${block.caption}</p>`
                : '';
              return `<div class="mb-8 text-center">
                      <img src="${block.src}" alt="${alt}" class="w-full max-w-2xl mx-auto rounded-lg shadow-md" />
                      ${caption}
                    </div>`;
            }

            // If no specific handling, try to extract any text content
            const extractedText =
              block.text || block.content || block.value || '';
            if (extractedText) {
              return `<div class="mb-6 text-slate-700 leading-relaxed text-base">${extractedText}</div>`;
            }
          }

          return '';
        })
        .filter(Boolean)
        .join('\n\n');
    }

    // If content is an object, try to extract meaningful content
    if (typeof content === 'object' && content !== null) {
      // If it's an object with blocks or sections, process recursively
      if (content.blocks || content.sections) {
        return processLessonContent(content.blocks || content.sections);
      }
    }

    // Fallback: convert to string
    return String(content);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Loading lesson content...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your lesson.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Error Loading Lesson
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchLessonContent}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!lessonContent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lesson Not Found
          </h3>
          <p className="text-gray-600">
            The requested lesson could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-8 py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open the sidebar when going back
              if (setSidebarCollapsed) {
                setSidebarCollapsed(false);
              }
              navigate(-1);
            }}
            className="flex items-center gap-2 hover:bg-slate-50 border-slate-300 text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" /> Back to lessons
          </Button>
        </div>

        {/* Lesson Header - Clean and Formal */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
                {lessonContent.title || 'Untitled Lesson'}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                {lessonContent.description || 'No description available.'}
              </p>
            </div>
            {/* <Badge 
              variant={getStatusColor(lessonContent.status)} 
              className="ml-6 px-3 py-1 text-sm font-medium"
            >
              {lessonContent.status || 'DRAFT'}
            </Badge> */}
          </div>
        </div>

        {/* Lesson Content - Full Width Clean Style */}
        <div className="w-full max-w-6xl mx-auto">
          {(() => {
            const rawContent =
              lessonContent.content || lessonContent.lesson_content;
            const processedContent = processLessonContent(rawContent);

            if (processedContent) {
              return (
                <>
                  <style>{`
                    .lesson-content * {
                      border-left: none !important;
                      border-right: none !important;
                      background: none !important;
                      background-color: transparent !important;
                      background-image: none !important;
                      box-shadow: none !important;
                      margin-left: 0 !important;
                      padding-left: 0 !important;
                    }
                    .lesson-content h1, .lesson-content h2, .lesson-content h3, .lesson-content h4, .lesson-content h5, .lesson-content h6 {
                      color: #1e293b !important;
                      font-weight: 700 !important;
                      margin-bottom: 1.5rem !important;
                      margin-top: 2rem !important;
                      line-height: 1.3 !important;
                    }
                    .lesson-content h1 { font-size: 2.25rem !important; }
                    .lesson-content h2 { font-size: 1.875rem !important; }
                    .lesson-content h3 { font-size: 1.5rem !important; }
                    .lesson-content h4 { font-size: 1.25rem !important; }
                    .lesson-content p {
                      color: #475569 !important;
                      line-height: 1.8 !important;
                      margin-bottom: 1.5rem !important;
                      font-size: 17px !important;
                    }
                    .lesson-content div {
                      color: #475569 !important;
                      line-height: 1.8 !important;
                      margin-bottom: 1.5rem !important;
                      font-size: 17px !important;
                    }
                    .lesson-content ul, .lesson-content ol {
                      margin-bottom: 1.5rem !important;
                      padding-left: 1.5rem !important;
                    }
                    .lesson-content li {
                      color: #475569 !important;
                      margin-bottom: 0.5rem !important;
                      line-height: 1.7 !important;
                    }
                    .lesson-content img {
                      max-width: 100% !important;
                      height: auto !important;
                      margin: 2rem 0 !important;
                      border-radius: 8px !important;
                    }
                    .lesson-content pre {
                      background-color: #f8fafc !important;
                      border: 1px solid #e2e8f0 !important;
                      border-radius: 8px !important;
                      padding: 1rem !important;
                      margin: 1.5rem 0 !important;
                      overflow-x: auto !important;
                    }
                    .lesson-content code {
                      background-color: #f1f5f9 !important;
                      padding: 0.25rem 0.5rem !important;
                      border-radius: 4px !important;
                      font-size: 0.9em !important;
                    }
                  `}</style>
                  <div
                    className="lesson-content w-full max-w-none"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                    style={{
                      lineHeight: '1.8',
                      fontSize: '17px',
                      color: '#475569',
                    }}
                  />
                </>
              );
            } else {
              return (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Content Coming Soon
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    The content for this lesson is being prepared. Please check
                    back later.
                  </p>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && rawContent && (
                    <details className="mt-6 text-left max-w-2xl mx-auto">
                      <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                        Debug: Raw Content
                      </summary>
                      <pre className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs overflow-auto max-h-60 text-left">
                        {JSON.stringify(rawContent, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default LessonContentView;
