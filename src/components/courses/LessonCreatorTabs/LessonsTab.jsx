import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Save, 
  X, 
  Clock, 
  Target,
  BookOpen,
  Sparkles,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import enhancedAIService from '../../../services/enhancedAIService';

const LessonsTab = ({ 
  lessons, 
  setLessons, 
  editingLessonId, 
  setEditingLessonId,
  isGenerating,
  courseTitle 
}) => {
  const [editContent, setEditContent] = useState('');
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Start editing a lesson
  const startEditing = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditContent(lesson.content);
  };

  // Save edited lesson
  const saveEdit = () => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === editingLessonId 
        ? { ...lesson, content: editContent } 
        : lesson
    ));
    setEditingLessonId(null);
    setEditContent('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingLessonId(null);
    setEditContent('');
  };

  // Create new lesson
  const createNewLesson = () => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      moduleId: 'default',
      title: 'New Lesson',
      description: 'Click edit to add description',
      content: 'Add your lesson content here...',
      duration: '15 min',
      keyPoints: ['Key point 1', 'Key point 2'],
      order: lessons.length + 1
    };
    
    setLessons(prev => [...prev, newLesson]);
    setEditingLessonId(newLesson.id);
    setEditContent(newLesson.content);
  };

  // Generate AI lesson content
  const generateAILessonContent = async (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    setIsGeneratingLesson(true);
    setGenerationStatus('Generating enhanced lesson content...');

    try {
      // Use enhanced AI service for comprehensive lesson generation
      const result = await enhancedAIService.generateLessonContent({
        title: lesson.title,
        description: lesson.description,
        courseTitle: courseTitle,
        duration: lesson.duration,
        includeMultimedia: true,
        generateQA: true
      });

      if (result.success && result.data) {
        setGenerationStatus('Updating lesson content...');
        
        // Update lesson with enhanced content
        const enhancedLesson = {
          ...lesson,
          content: result.data.content || lesson.content,
          keyPoints: result.data.keyPoints || lesson.keyPoints,
          multimedia: result.data.multimedia || {},
          qa: result.data.qa || [],
          aiGenerated: true,
          lastUpdated: new Date().toISOString()
        };

        setLessons(prev => prev.map(l => 
          l.id === lessonId ? enhancedLesson : l
        ));

        setGenerationStatus('Lesson content generated successfully!');
        setTimeout(() => setGenerationStatus(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to generate lesson content');
      }
    } catch (error) {
      console.error('Failed to generate AI lesson content:', error);
      setGenerationStatus('Failed to generate content. Please try again.');
      setTimeout(() => setGenerationStatus(''), 5000);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Update lesson
  const updateLesson = (lessonId, updatedData) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, ...updatedData }
        : lesson
    ));
  };

  // Delete lesson
  const deleteLesson = (lessonId) => {
    if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      
      // Clear editing states if deleting currently edited lesson
      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
        setEditContent('');
      }
    }
  };

  // Duplicate lesson
  const duplicateLesson = (lessonId) => {
    const lessonToDuplicate = lessons.find(lesson => lesson.id === lessonId);
    if (lessonToDuplicate) {
      const duplicatedLesson = {
        ...lessonToDuplicate,
        id: `lesson-${Date.now()}`,
        title: `${lessonToDuplicate.title} (Copy)`,
        order: lessons.length + 1
      };
      
      setLessons(prev => [...prev, duplicatedLesson]);
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Lesson Management</h3>
              <p className="text-gray-600">
                Create, edit, and enhance lessons with AI-powered content generation.
              </p>
            </div>
            <Button
              onClick={createNewLesson}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Lesson
            </Button>
          </div>
        </div>

        {/* Generation Status */}
        {generationStatus && (
          <Card className={`mb-6 border-l-4 ${
            generationStatus.includes('success') ? 'border-green-500 bg-green-50' :
            generationStatus.includes('Failed') ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {isGeneratingLesson && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                {generationStatus.includes('success') && <Check className="w-4 h-4 text-green-600" />}
                {generationStatus.includes('Failed') && <AlertCircle className="w-4 h-4 text-red-600" />}
                <span className={`text-sm font-medium ${
                  generationStatus.includes('success') ? 'text-green-800' :
                  generationStatus.includes('Failed') ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {generationStatus}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Created</h3>
            <p className="text-gray-600 mb-4">
              {isGenerating ? 'AI is generating lessons...' : 'Create your first lesson to get started.'}
            </p>
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="text-purple-600">Generating lessons...</span>
              </div>
            ) : (
              <Button
                onClick={createNewLesson}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Lesson
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          {editingLessonId === lesson.id ? (
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                              className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                            />
                          ) : (
                            lesson.title
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration}</span>
                          </div>
                          {lesson.aiGenerated && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Sparkles className="w-4 h-4" />
                              <span>AI Enhanced</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => generateAILessonContent(lesson.id)}
                        disabled={isGeneratingLesson}
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => startEditing(lesson)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => duplicateLesson(lesson.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteLesson(lesson.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Description */}
                  <div className="mb-4">
                    {editingLessonId === lesson.id ? (
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        rows={2}
                        placeholder="Lesson description..."
                      />
                    ) : (
                      <p className="text-gray-600">{lesson.description}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    {editingLessonId === lesson.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                          rows={8}
                          placeholder="Enter lesson content..."
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={saveEdit}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap line-clamp-4">
                          {lesson.content}
                        </p>
                        {lesson.content.length > 200 && (
                          <button
                            onClick={() => startEditing(lesson)}
                            className="text-purple-600 hover:text-purple-700 text-sm mt-2"
                          >
                            Read more...
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Key Points */}
                  {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Key Learning Points
                      </h4>
                      <div className="space-y-1">
                        {lesson.keyPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multimedia Content */}
                  {lesson.multimedia && Object.keys(lesson.multimedia).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Multimedia Content</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {lesson.multimedia.images && (
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <FileText className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                            <span className="text-xs text-blue-700">Images</span>
                          </div>
                        )}
                        {lesson.multimedia.videos && (
                          <div className="text-center p-2 bg-green-50 rounded">
                            <FileText className="w-6 h-6 mx-auto text-green-600 mb-1" />
                            <span className="text-xs text-green-700">Videos</span>
                          </div>
                        )}
                        {lesson.multimedia.audio && (
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <FileText className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                            <span className="text-xs text-orange-700">Audio</span>
                          </div>
                        )}
                        {lesson.qa && lesson.qa.length > 0 && (
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <FileText className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                            <span className="text-xs text-purple-700">{lesson.qa.length} Q&A</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lesson Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <span>Module: {lesson.moduleId}</span>
                      <span>Order: {lesson.order}</span>
                    </div>
                    {lesson.lastUpdated && (
                      <span>Updated: {new Date(lesson.lastUpdated).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsTab;
