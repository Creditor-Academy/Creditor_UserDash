import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, User, BookOpen, CheckCircle, Circle, X, Menu, FileText, Plus, Edit3, Hourglass, Star, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    fetchLessonContent();
  }, [lessonId]);

  const fetchLessonContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
      const response = await fetch(`${baseUrl}/api/lessoncontent/${lessonId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lesson content: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Fetched lesson data:', responseData);
      
      // Extract the actual data from the API response
      const data = responseData.data || responseData;
      
      // Parse the lesson content
      const parsedContent = parseLessonContent(data.content || []);
      
      // Transform the data to match our component structure
      const transformedData = {
        id: data.id || lessonId,
        title: data.title || data.lesson_title || 'Untitled Lesson',
        description: data.description || data.lesson_description || '',
        duration: data.duration || data.estimated_duration || '30 min',
        difficulty: data.difficulty || data.level || 'Intermediate',
        instructor: data.instructor || data.author || data.created_by || 'Course Instructor',
        progress: data.progress || 0,
        headingSections: parsedContent.headingSections || [],
        allContent: parsedContent.allContent || [],
        objectives: data.objectives || data.learning_objectives || [],
        introduction: data.introduction || data.lesson_introduction || '',
        summary: data.summary || data.lesson_summary || '',
      };

      setLessonData(transformedData);
      
      // Set initial current section to the first heading section if available
      if (parsedContent.headingSections && parsedContent.headingSections.length > 0) {
        setCurrentSection(parsedContent.headingSections[0].id);
      }
    } catch (err) {
      console.error('Error fetching lesson content:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load lesson content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseLessonContent = (content) => {
    console.log('Parsing lesson content:', content);
    
    if (!content || !Array.isArray(content)) {
      console.log('Content is not an array or is empty:', content);
      return { headingSections: [], allContent: [] };
    }
    
    const headingSections = []; // Only for sidebar navigation
    const allContent = []; // All content for main display
    
    content.forEach((block, index) => {
      console.log(`Processing block ${index}:`, block);
      
      const blockData = {
        id: block.block_id || block.id || `section-${index}`,
        originalBlock: block,
        completed: false,
      };

      // Handle different block types based on your API structure
      if (block.type === 'text') {
        // Check if it's a heading type
        const textType = block.textType || block.text_type;
        const content = block.details?.content || block.content || '';
        
        // Only show master_heading in sidebar
        if (textType === 'master_heading') {
          // Extract heading text for sidebar
          let headingText = content || `Section ${index + 1}`;
          
          headingSections.push({
            ...blockData,
            title: headingText.replace(/<[^>]*>/g, ''), // Remove HTML tags
            type: 'heading',
          });
        }
        
        // Add to all content
        allContent.push({
          ...blockData,
          type: block.type,
          textType: textType,
          content: content,
          htmlCss: block.html_css || '',
          style: block.style || {},
        });
      } else if (block.type === 'statement') {
        // Handle statement blocks
        const content = block.details?.content || block.content || '';
        const statementType = block.details?.statement_type || block.statementType;
        
        // Don't add statements to sidebar - only show master_heading
        
        allContent.push({
          ...blockData,
          type: 'statement',
          statementType: statementType,
          content: content,
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'image') {
        allContent.push({
          ...blockData,
          type: 'image',
          imageTitle: block.imageTitle || block.image_title || block.details?.imageTitle || '',
          imageDescription: block.imageDescription || block.image_description || block.details?.imageDescription || '',
          imageUrl: block.imageUrl || block.image_url || block.details?.imageUrl || block.url || '',
          layout: block.layout || block.details?.layout || 'centered',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'video') {
        allContent.push({
          ...blockData,
          type: 'video',
          videoTitle: block.videoTitle || block.video_title || block.details?.videoTitle || '',
          videoDescription: block.videoDescription || block.video_description || block.details?.videoDescription || '',
          videoUrl: block.videoUrl || block.video_url || block.details?.videoUrl || block.url || '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'quote') {
        allContent.push({
          ...blockData,
          type: 'quote',
          content: block.content || block.details?.content || '',
          quoteType: block.quoteType || block.quote_type || block.details?.quoteType || 'quote_a',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'list') {
        allContent.push({
          ...blockData,
          type: 'list',
          content: block.content || block.details?.content || '',
          listType: block.listType || block.list_type || block.details?.listType || 'bulleted',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'pdf') {
        allContent.push({
          ...blockData,
          type: 'pdf',
          pdfTitle: block.pdfTitle || block.pdf_title || block.details?.pdfTitle || '',
          pdfDescription: block.pdfDescription || block.pdf_description || block.details?.pdfDescription || '',
          pdfUrl: block.pdfUrl || block.pdf_url || block.details?.pdfUrl || block.url || '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'table') {
        allContent.push({
          ...blockData,
          type: 'table',
          content: block.content || block.details?.content || '',
          tableData: block.tableData || block.table_data || block.details?.tableData || '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'audio') {
        allContent.push({
          ...blockData,
          type: 'audio',
          audioTitle: block.audioTitle || block.audio_title || block.details?.audioTitle || '',
          audioDescription: block.audioDescription || block.audio_description || block.details?.audioDescription || '',
          audioUrl: block.audioUrl || block.audio_url || block.details?.audioUrl || block.url || '',
          htmlCss: block.html_css || '',
        });
      } else if (block.type === 'embed') {
        allContent.push({
          ...blockData,
          type: 'embed',
          embedTitle: block.embedTitle || block.embed_title || block.details?.embedTitle || '',
          embedDescription: block.embedDescription || block.embed_description || block.details?.embedDescription || '',
          embedCode: block.embedCode || block.embed_code || block.details?.embedCode || block.content || '',
          htmlCss: block.html_css || '',
        });
      } else {
        // Handle other block types - add all blocks to content
        allContent.push({
          ...blockData,
          type: block.type || 'text',
          content: block.content || block.details?.content || '',
          textType: block.textType || block.text_type || block.statement_type || 'paragraph',
          htmlCss: block.html_css || '',
        });
      }
    });

    console.log('Parsed content result:', { headingSections, allContent });
    return {
      headingSections,
      allContent
    };
  };

  const handleSectionClick = (sectionId) => {
    setCurrentSection(sectionId);
    setSidebarOpen(false);
  };

  const markSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const handleBackToBuilder = () => {
    navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/builder`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson content...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lesson</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchLessonContent} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleBackToBuilder} className="w-full">
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

  const currentSectionData = lessonData.headingSections.find(s => s.id === currentSection) || lessonData.headingSections[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Fixed Sidebar */}
      {sidebarVisible && (
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden`}>
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

        <div className="p-6 h-screen flex flex-col overflow-hidden">
          {/* Lesson Header */}
          <div className="mb-6 flex-shrink-0">
            <div className="text-sm opacity-75 mb-1">Lesson 1 of 9</div>
            <h1 className="text-xl font-bold leading-tight mb-2">{lessonData.title}</h1>
            <div className="flex items-center text-sm opacity-75 mb-4">
              <Clock className="h-4 w-4 mr-1" />
              {lessonData.duration}
            </div>
            <div className="bg-blue-700 rounded-full h-2 mb-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${lessonData.progress}%` }}
              ></div>
            </div>
            <div className="text-sm opacity-75">{lessonData.progress}% COMPLETE</div>
          </div>

          {/* Navigation Menu - Only show master heading sections */}
          <nav className="space-y-2 flex-1 overflow-hidden">
            {lessonData.headingSections && lessonData.headingSections.length > 0 ? (
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
                <p className="text-xs opacity-75 mt-1">Navigation will appear here</p>
              </div>
            )}
          </nav>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'lg:ml-80' : 'lg:ml-0'}`}>
        {/* Fixed Header */}
        <header 
          className="fixed top-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 transition-all duration-300" 
          style={{ left: sidebarVisible ? '320px' : '0' }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 transition-colors"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="font-medium">Back</span>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Lesson 1 of 9
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`transition-all duration-300 pt-20 ${sidebarVisible ? 'p-6' : 'px-12 py-8'}`}>
          <div className={`mx-auto transition-all duration-300 ${sidebarVisible ? 'max-w-4xl' : 'max-w-7xl'}`}>
            {/* Display all lesson content */}
            <div className={`transition-all duration-300 ${sidebarVisible ? 'space-y-6' : 'space-y-8'}`}>
              {lessonData.allContent && lessonData.allContent.length > 0 ? (
                lessonData.allContent.map((block, index) => {
                  console.log(`Rendering block ${index}:`, block);
                  return (
                  <div key={block.id || index} className={`transition-all duration-300 ${sidebarVisible ? 'mb-6' : 'mb-8'}`}>
                    {/* Statement Content - Use HTML/CSS from API */}
                    {block.type === 'statement' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
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
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="prose prose-lg max-w-none">
                            {block.textType === 'heading' && (
                              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                              </h1>
                            )}
                            {block.textType === 'master_heading' && (
                              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                              </h1>
                            )}
                            {block.textType === 'subheading' && (
                              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                              </h2>
                            )}
                            {block.textType === 'heading_paragraph' && (
                              <div>
                                {(() => {
                                  const parts = block.content.split('|||');
                                  return (
                                    <>
                                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        <div dangerouslySetInnerHTML={{ __html: parts[0] || '' }} />
                                      </h1>
                                      <div className="text-gray-700 leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: parts[1] || '' }} />
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
                                        <div dangerouslySetInnerHTML={{ __html: parts[0] || '' }} />
                                      </h2>
                                      <div className="text-gray-700 leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: parts[1] || '' }} />
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                            {(block.textType === 'paragraph' || !block.textType) && (
                              <div className="text-gray-700 leading-relaxed text-lg">
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Image Content */}
                    {block.type === 'image' && block.imageUrl && (
                      <div className="text-center">
                        <img
                          src={block.imageUrl}
                          alt={block.imageTitle || 'Lesson Image'}
                          className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        />
                        {block.imageTitle && (
                          <h3 className="text-lg font-semibold mt-4 text-gray-800">{block.imageTitle}</h3>
                        )}
                        {block.imageDescription && (
                          <p className="text-gray-600 mt-2">{block.imageDescription}</p>
                        )}
                      </div>
                    )}

                    {/* Video Content */}
                    {block.type === 'video' && block.videoUrl && (
                      <div className="text-center">
                        <video
                          src={block.videoUrl}
                          controls
                          className="w-full max-w-3xl rounded-lg shadow-md mx-auto"
                        />
                        {block.videoTitle && (
                          <h3 className="text-lg font-semibold mt-4 text-gray-800">{block.videoTitle}</h3>
                        )}
                        {block.videoDescription && (
                          <p className="text-gray-600 mt-2">{block.videoDescription}</p>
                        )}
                      </div>
                    )}

                    {/* Quote Content */}
                    {block.type === 'quote' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-6">
                            <blockquote className="text-xl italic text-gray-700 text-center">
                              <div dangerouslySetInnerHTML={{ __html: block.content }} />
                            </blockquote>
                          </div>
                        )}
                      </>
                    )}

                    {/* List Content */}
                    {block.type === 'list' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="prose prose-lg max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: block.content }} />
                          </div>
                        )}
                      </>
                    )}

                    {/* PDF Content */}
                    {block.type === 'pdf' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="bg-white rounded-lg p-6 border">
                            {block.pdfTitle && (
                              <h3 className="text-lg font-semibold mb-2">{block.pdfTitle}</h3>
                            )}
                            {block.pdfDescription && (
                              <p className="text-gray-600 mb-4">{block.pdfDescription}</p>
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
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: block.content }} />
                          </div>
                        )}
                      </>
                    )}

                    {/* Audio Content */}
                    {block.type === 'audio' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="bg-white rounded-lg p-6 border text-center">
                            {block.audioTitle && (
                              <h3 className="text-lg font-semibold mb-2">{block.audioTitle}</h3>
                            )}
                            {block.audioDescription && (
                              <p className="text-gray-600 mb-4">{block.audioDescription}</p>
                            )}
                            {block.audioUrl && (
                              <audio controls className="w-full max-w-md mx-auto">
                                <source src={block.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Embed Content */}
                    {block.type === 'embed' && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="bg-white rounded-lg p-6 border">
                            {block.embedTitle && (
                              <h3 className="text-lg font-semibold mb-2">{block.embedTitle}</h3>
                            )}
                            {block.embedDescription && (
                              <p className="text-gray-600 mb-4">{block.embedDescription}</p>
                            )}
                            {block.embedCode && (
                              <div dangerouslySetInnerHTML={{ __html: block.embedCode }} />
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Other Content Types - Fallback for any unhandled block types */}
                    {!['text', 'statement', 'image', 'video', 'quote', 'list', 'pdf', 'table', 'audio', 'embed'].includes(block.type) && (
                      <>
                        {block.htmlCss ? (
                          <div dangerouslySetInnerHTML={{ __html: block.htmlCss }} />
                        ) : (
                          <div className="prose prose-lg max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: block.content }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center max-w-md mx-auto">
                    {/* Clean Coming Soon Card */}
                    <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
                      {/* Simple icon */}
                      <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      
                      {/* Main heading */}
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Coming Soon
                      </h1>
                      
                      {/* Description */}
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        This lesson content is currently being prepared. 
                        Please check back soon for updates.
                      </p>
                      
                      {/* Status indicator */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700">In Development</span>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <Button 
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Course
                      </Button>
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
  );
};

export default LessonPreview;
