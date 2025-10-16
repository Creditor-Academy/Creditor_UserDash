import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Loader2,
  Check,
  Database,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAILessons, updateEnhancedLessonContent } from '../../services/aiCourseService';
import { contentBlockTypes } from '@/constants/LessonBuilder/blockTypes';
import OutlineTab from './LessonCreatorTabs/OutlineTab';

const EnhancedAILessonCreator = ({ 
  isOpen, 
  onClose, 
  courseTitle, 
  courseData,
  aiOutline,
  onLessonsCreated 
}) => {
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [contentBlocks, setContentBlocks] = useState({});
  const [globalContent, setGlobalContent] = useState({});
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  
  const editorRef = useRef(null);

  // Initialize from course outline
  useEffect(() => {
    if (isOpen && aiOutline && aiOutline.modules) {
      console.log('🎓 Initializing Enhanced AI Lesson Creator with outline:', aiOutline);
      
      // Set modules from outline
      setModules(aiOutline.modules.map((module, index) => ({
        id: module.id || `module-${index + 1}`,
        title: module.module_title || module.title || `Module ${index + 1}`,
        description: module.description || '',
        lessons: module.lessons || [],
        order: index + 1
      })));
      
      // Initialize lessons from all modules
      const allLessons = [];
      const initialBlocks = {};
      
      aiOutline.modules.forEach((module, moduleIndex) => {
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.forEach((lesson, lessonIndex) => {
            const lessonId = `lesson-${moduleIndex}-${lessonIndex}`;
            const enhancedLesson = {
              id: lessonId,
              moduleId: module.id || `module-${moduleIndex + 1}`,
              title: lesson.lesson_title || lesson.title || `Lesson ${lessonIndex + 1}`,
              description: lesson.description || '',
              content: lesson.content || '',
              duration: lesson.duration || '15 min',
              keyPoints: lesson.keyPoints || [],
              order: lessonIndex + 1
            };
            
            allLessons.push(enhancedLesson);
            
            // Initialize content blocks
            initialBlocks[lessonId] = [{
              id: `block-${Date.now()}-${Math.random()}`,
              type: 'text',
              content: lesson.content || 'Add lesson content here...',
              order: 1
            }];
            
          });
        }
      });
      
      setLessons(allLessons);
      setContentBlocks(initialBlocks);
      
      console.log('📚 Initialized lessons:', allLessons.length);
      console.log('🧩 Initialized content blocks for lessons:', Object.keys(initialBlocks).length);
    }
  }, [isOpen, aiOutline]);


  // Save content to backend
  const saveContentToBackend = async () => {
    setIsSaving(true);
    try {
      // Prepare lessons with enhanced content blocks
      const lessonsWithBlocks = lessons.map(lesson => {
        const blocks = contentBlocks[lesson.id] || [];
        
        // Convert blocks to structured content
        const structuredContent = blocks.map(block => {
          switch (block.type) {
            case 'text':
              return {
                type: 'paragraph',
                content: block.content,
                settings: block.settings
              };
            case 'heading':
              return {
                type: 'heading',
                content: block.content,
                level: block.settings?.level || 'h2',
                settings: block.settings
              };
            case 'image':
              return {
                type: 'image',
                url: block.content?.url,
                alt: block.content?.alt,
                caption: block.content?.caption,
                settings: block.settings
              };
            case 'video':
            case 'youtube':
              return {
                type: 'video',
                url: block.content?.url,
                title: block.content?.title,
                description: block.content?.description,
                settings: block.settings
              };
            case 'list':
              return {
                type: 'list',
                items: block.content?.split('\n').filter(item => item.trim()),
                listType: block.settings?.listType || 'bulleted',
                settings: block.settings
              };
            default:
              return {
                type: block.type,
                content: block.content,
                settings: block.settings
              };
          }
        });
        
        return {
          ...lesson,
          blocks: blocks,
          structuredContent: structuredContent,
          contentUpdatedAt: new Date().toISOString()
        };
      });
      
      // Save to localStorage as backup
      const saveData = {
        courseTitle,
        courseId: courseData?.id,
        lessons: lessonsWithBlocks,
        globalContent,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`ai_course_content_${courseData?.id || 'temp'}`, JSON.stringify(saveData));
      
      // Try to save to backend
      const result = await updateEnhancedLessonContent(saveData);
      
      if (result.success) {
        console.log('✅ Content saved successfully:', {
          lessons: lessonsWithBlocks.length,
          totalBlocks: Object.values(contentBlocks).flat().length
        });
        
        // Show success notification
        if (window.showNotification) {
          window.showNotification('Content saved successfully!', 'success');
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('❌ Failed to save content:', error);
      
      // Show error notification
      if (window.showNotification) {
        window.showNotification(`Save failed: ${error.message}`, 'error');
      } else {
        alert(`Save failed: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 w-full h-full bg-white z-[9999] overflow-hidden flex flex-col" style={{ margin: 0, padding: 0 }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Course Editor</h2>
            <span className="text-sm text-gray-500 hidden md:inline">
              {courseTitle ? `for "${courseTitle}"` : '(No course selected)'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPromptInput(!showPromptInput)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {showPromptInput ? 'Hide Prompt' : 'Modify Outline'}
          </Button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Prompt Input Section */}
      {showPromptInput && (
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Modify Course Outline with AI
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Describe what you want to change, add, or remove from the course outline
            </p>
            <div className="flex gap-2">
              <textarea
                value={modifyPrompt}
                onChange={(e) => setModifyPrompt(e.target.value)}
                placeholder="e.g., 'Add a lesson about advanced React hooks in Module 1' or 'Add a new module about TypeScript basics'"
                className="flex-1 px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none text-sm"
                rows="2"
                disabled={isGenerating}
              />
              <Button
                onClick={() => {
                  if (modifyPrompt.trim()) {
                    alert('AI regeneration will be implemented soon!');
                    // TODO: Implement regeneration logic
                  }
                }}
                disabled={!modifyPrompt.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <OutlineTab 
          modules={modules}
          lessons={lessons}
          onModuleSelect={setEditingModuleId}
          onLessonSelect={setEditingLessonId}
        />
      </div>
      
      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database className="w-4 h-4" />
          <span>{lessons.length} lessons • {modules.length} modules</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={saveContentToBackend}
            disabled={isSaving || lessons.length === 0}
            variant="outline"
            className={isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All ({Object.values(contentBlocks).flat().length} blocks)
              </>
            )}
          </Button>
          
          <Button
            onClick={async () => {
              const success = await saveContentToBackend();
              if (success && onLessonsCreated) {
                // Prepare lessons with all necessary data for database saving
                const lessonsWithCompleteData = lessons.map(lesson => ({
                  ...lesson,
                  blocks: contentBlocks[lesson.id] || [],
                  structuredContent: (contentBlocks[lesson.id] || []).map(block => {
                    switch (block.type) {
                      case 'text':
                        return { type: 'paragraph', content: block.content, settings: block.settings };
                      case 'heading':
                        return { type: 'heading', content: block.content, level: block.settings?.level || 'h2', settings: block.settings };
                      case 'image':
                        return { type: 'image', url: block.content?.url, alt: block.content?.alt, caption: block.content?.caption, settings: block.settings };
                      case 'video':
                      case 'youtube':
                        return { type: 'video', url: block.content?.url, title: block.content?.title, description: block.content?.description, settings: block.settings };
                      case 'list':
                        return { type: 'list', items: block.content?.split('\\n').filter(item => item.trim()), listType: block.settings?.listType || 'bulleted', settings: block.settings };
                      default:
                        return { type: block.type, content: block.content, settings: block.settings };
                    }
                  }),
                  moduleTitle: modules.find(m => m.id === lesson.moduleId)?.title || 'Unknown Module',
                  contentUpdatedAt: new Date().toISOString()
                }));
                
                onLessonsCreated({
                  courseTitle,
                  courseId: courseData?.id,
                  lessons: lessonsWithCompleteData,
                  modules: modules,
                  totalBlocks: Object.values(contentBlocks).flat().length
                });
              }
              onClose();
            }}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete & Close
          </Button>
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
};

export default EnhancedAILessonCreator;
