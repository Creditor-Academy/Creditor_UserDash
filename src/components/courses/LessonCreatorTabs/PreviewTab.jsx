import React, { useState } from 'react';
import {
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  Clock,
  Target,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PreviewTab = ({ lessons, contentBlocks, modules }) => {
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const lessonBlocks = contentBlocks[selectedLessonId] || [];
  const lessonModule = modules.find(m => m.id === selectedLesson?.moduleId);

  // Mark section as completed
  const toggleSectionCompletion = sectionId => {
    setCompletedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Navigate between blocks
  const navigateBlock = direction => {
    if (direction === 'next' && currentBlockIndex < lessonBlocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
    }
  };

  // Render content block for preview
  const renderPreviewBlock = block => {
    switch (block.type) {
      case 'text':
      case 'heading':
        return (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'statement':
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
      case 'quote':
        return (
          <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg italic text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
      case 'image':
        return (
          <div className="text-center">
            {block.content?.url ? (
              <div>
                <img
                  src={block.content.url}
                  alt={block.content.alt}
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {block.content.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        );
      case 'video':
      case 'youtube':
        return (
          <div className="relative">
            {block.content?.url ? (
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  src={block.content.url}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                  title={block.content.title}
                />
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content?.title && (
              <p className="text-center font-medium mt-2">
                {block.content.title}
              </p>
            )}
          </div>
        );
      case 'table':
        return (
          <div
            className="overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            <p>Preview not available for {block.type} block</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
    >
      {/* Lesson Selector Sidebar */}
      {!isFullscreen && (
        <div className="w-80 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lesson Preview
            </h3>
            <p className="text-sm text-gray-600">
              Select a lesson to preview its content as students would see it.
            </p>
          </div>

          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const lessonBlockCount = contentBlocks[lesson.id]?.length || 0;
              const isCompleted = completedSections.has(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLessonId === lesson.id
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setCurrentBlockIndex(0);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSectionCompletion(lesson.id);
                          }}
                          className="text-gray-400 hover:text-green-500"
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {lesson.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {lesson.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 ml-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{lessonBlockCount} blocks</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No lessons to preview
            </div>
          )}
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {!selectedLessonId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Lesson Selected
              </h3>
              <p className="text-gray-600">
                Select a lesson from the sidebar to preview its content.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Preview Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedLesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedLesson.duration}</span>
                    </div>
                    {lessonModule && <span>Module: {lessonModule.title}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    variant="outline"
                    size="sm"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Navigation */}
            {lessonBlocks.length > 1 && (
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => navigateBlock('prev')}
                    disabled={currentBlockIndex === 0}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Block {currentBlockIndex + 1} of {lessonBlocks.length}
                    </span>
                    <div className="flex gap-1">
                      {lessonBlocks.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBlockIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentBlockIndex
                              ? 'bg-purple-600'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => navigateBlock('next')}
                    disabled={currentBlockIndex === lessonBlocks.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              {lessonBlocks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Content Blocks
                  </h3>
                  <p className="text-gray-600">
                    This lesson doesn't have any content blocks to preview.
                  </p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {/* Lesson Description */}
                  {selectedLesson.description && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                      <p className="text-blue-800">
                        {selectedLesson.description}
                      </p>
                    </div>
                  )}

                  {/* Current Content Block */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      {renderPreviewBlock(lessonBlocks[currentBlockIndex])}
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  {selectedLesson.keyPoints &&
                    selectedLesson.keyPoints.length > 0 && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Key Learning Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedLesson.keyPoints.map((point, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{point}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewTab;
