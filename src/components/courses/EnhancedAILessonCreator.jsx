import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  AudioLines, 
  Users, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Upload,
  Plus,
  Edit3,
  Save,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  GripVertical,
  Type,
  Square,
  Circle,
  MessageSquare,
  Quote,
  Volume2,
  Youtube,
  Link as LinkIcon,
  Table,
  Box,
  Layers,
  RefreshCw,
  Globe,
  Database,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAILessons, updateLessonContent } from '../../services/aiCourseService';
import { contentBlockTypes } from '@/constants/LessonBuilder/blockTypes';
import OutlineTab from './LessonCreatorTabs/OutlineTab';
import LessonsTab from './LessonCreatorTabs/LessonsTab';
import BlockEditorTab from './LessonCreatorTabs/BlockEditorTab';
import PreviewTab from './LessonCreatorTabs/PreviewTab';

const EnhancedAILessonCreator = ({ 
  isOpen, 
  onClose, 
  courseTitle, 
  courseData,
  aiOutline,
  onLessonsCreated 
}) => {
  const [activeTab, setActiveTab] = useState('outline');
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
  const [previewMode, setPreviewMode] = useState(false);
  
  const editorRef = useRef(null);

  const tabs = [
    { id: 'outline', label: 'Course Outline', icon: BookOpen },
    { id: 'lessons', label: 'AI Lessons', icon: FileText },
    { id: 'blocks', label: 'Block Editor', icon: Square },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

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
    try {
      const lessonsWithBlocks = lessons.map(lesson => ({
        ...lesson,
        blocks: contentBlocks[lesson.id] || []
      }));
      
      const result = await updateLessonContent({
        courseTitle,
        courseId: courseData?.id,
        lessons: lessonsWithBlocks,
        globalContent
      });
      
      if (result.success) {
        console.log('✅ Content saved to backend successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('❌ Failed to save content to backend:', error);
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Enhanced AI Lesson Creator</h2>
            <span className="text-sm text-gray-500 hidden md:inline">
              {courseTitle ? `for "${courseTitle}"` : '(No course selected)'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            size="sm"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-gray-100 flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'outline' && (
          <OutlineTab 
            modules={modules}
            lessons={lessons}
            onModuleSelect={setEditingModuleId}
            onLessonSelect={setEditingLessonId}
          />
        )}
        
        {activeTab === 'lessons' && (
          <LessonsTab 
            lessons={lessons}
            setLessons={setLessons}
            editingLessonId={editingLessonId}
            setEditingLessonId={setEditingLessonId}
            isGenerating={isGenerating}
            courseTitle={courseTitle}
          />
        )}
        
        {activeTab === 'blocks' && (
          <BlockEditorTab 
            lessons={lessons}
            contentBlocks={contentBlocks}
            setContentBlocks={setContentBlocks}
            editingLessonId={editingLessonId}
            setEditingLessonId={setEditingLessonId}
            onContentSync={(syncData) => {
              console.log('Content sync requested:', syncData);
              // Handle content synchronization across modules
            }}
            syncSettings={{
              syncAcrossModules: true,
              autoSave: true
            }}
          />
        )}
        
        {activeTab === 'preview' && (
          <PreviewTab 
            lessons={lessons}
            contentBlocks={contentBlocks}
            modules={modules}
          />
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database className="w-4 h-4" />
          <span>{lessons.length} lessons • {modules.length} modules</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={saveContentToBackend}
            disabled={isSaving}
            variant="outline"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All
              </>
            )}
          </Button>
          
          <Button
            onClick={async () => {
              const success = await saveContentToBackend();
              if (success && onLessonsCreated) {
                onLessonsCreated({
                  courseTitle,
                  lessons: lessons.map(lesson => ({
                    ...lesson,
                    blocks: contentBlocks[lesson.id] || []
                  }))
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
  );
};

export default EnhancedAILessonCreator;
