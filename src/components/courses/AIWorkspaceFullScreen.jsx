import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Image, 
  FileText, 
  Search,
  Plus,
  Edit3,
  Save,
  Download,
  Copy,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Sparkles,
  RefreshCw,
  Eye,
  Upload,
  Wand2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LoadingBuffer from '../LoadingBuffer';
import aiCourseService from '../../services/aiCourseService';

const AIWorkspaceFullScreen = ({ isOpen, onClose, initialCourseData, onSave }) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [courseData, setCourseData] = useState({
    title: initialCourseData?.title || '',
    subject: initialCourseData?.subject || '',
    description: initialCourseData?.description || '',
    targetAudience: initialCourseData?.targetAudience || '',
    difficulty: initialCourseData?.difficulty || 'intermediate',
    duration: initialCourseData?.duration || '4 weeks',
    modules: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [expandedModules, setExpandedModules] = useState(new Set());
  
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'outline', name: 'Course Outline', icon: BookOpen, color: 'blue' },
    { id: 'images', name: 'AI Images', icon: Image, color: 'purple' },
    { id: 'summarize', name: 'Summarization', icon: FileText, color: 'green' },
    { id: 'search', name: 'Content Q&A', icon: Search, color: 'orange' }
  ];

  // Course Outline Generation
  const generateCourseOutline = useCallback(async () => {
    if (!courseData.title || !courseData.subject) return;
    
    setIsGenerating(true);
    
    try {
      const result = await aiCourseService.generateAICourseOutline(courseData);
      
      if (result.success) {
        setCourseData(prev => ({
          ...prev,
          modules: result.data.modules
        }));
        
        // Expand first 2 modules by default
        setExpandedModules(new Set([1, 2]));
      }
    } catch (error) {
      console.error('Course outline generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [courseData.title, courseData.subject, courseData.description]);

  // Module and Lesson Management
  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const updateModule = (moduleId, updates) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId ? { ...module, ...updates } : module
      )
    }));
  };

  const updateLesson = (moduleId, lessonId, updates) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              )
            }
          : module
      )
    }));
  };

  const addNewModule = () => {
    const newModule = {
      id: Date.now(),
      title: 'New Module',
      description: 'Module description',
      lessons: []
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const addNewLesson = (moduleId) => {
    const newLesson = {
      id: Date.now(),
      title: 'New Lesson',
      description: 'Lesson description',
      content: '',
      duration: '15 min'
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: [...(module.lessons || []), newLesson] }
          : module
      )
    }));
  };

  const deleteModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const deleteLesson = (moduleId, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
            }
          : module
      )
    }));
  };

  // Drag and Drop Handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'module') {
      const newModules = Array.from(courseData.modules);
      const [reorderedModule] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedModule);
      
      setCourseData(prev => ({ ...prev, modules: newModules }));
    } else if (type === 'lesson') {
      const moduleId = parseInt(source.droppableId.split('-')[1]);
      const module = courseData.modules.find(m => m.id === moduleId);
      
      if (module) {
        const newLessons = Array.from(module.lessons || []);
        const [reorderedLesson] = newLessons.splice(source.index, 1);
        newLessons.splice(destination.index, 0, reorderedLesson);
        
        updateModule(moduleId, { lessons: newLessons });
      }
    }
  };

  // Save Course
  const handleSaveCourse = async () => {
    try {
      setIsGenerating(true);
      const result = await aiCourseService.saveAICourse(courseData);
      
      if (result.success) {
        onSave?.(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Insert AI Content into Course
  const insertIntoLesson = (content, type = 'text') => {
    // Find first lesson in first module to insert content
    if (courseData.modules.length > 0 && courseData.modules[0].lessons?.length > 0) {
      const firstLesson = courseData.modules[0].lessons[0];
      const updatedContent = firstLesson.content + '\n\n' + content;
      updateLesson(courseData.modules[0].id, firstLesson.id, { content: updatedContent });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">AI Course Creator</h1>
            <p className="text-sm text-gray-600">
              {courseData.title || 'Untitled Course'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveCourse}
            disabled={isGenerating || !courseData.title}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Course
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50 border-b px-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? `bg-white text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full overflow-y-auto p-6"
          >
            {activeTab === 'outline' && (
              <OutlineTab
                courseData={courseData}
                setCourseData={setCourseData}
                isGenerating={isGenerating}
                onGenerate={generateCourseOutline}
                expandedModules={expandedModules}
                onToggleModule={toggleModuleExpansion}
                onUpdateModule={updateModule}
                onUpdateLesson={updateLesson}
                onAddModule={addNewModule}
                onAddLesson={addNewLesson}
                onDeleteModule={deleteModule}
                onDeleteLesson={deleteLesson}
                onDragEnd={handleDragEnd}
              />
            )}
            
            {activeTab === 'images' && (
              <ImagesTab
                images={generatedImages}
                setImages={setGeneratedImages}
                onInsertIntoLesson={insertIntoLesson}
              />
            )}
            
            {activeTab === 'summarize' && (
              <SummarizationTab
                summaries={summaries}
                setSummaries={setSummaries}
                onInsertIntoLesson={insertIntoLesson}
              />
            )}
            
            {activeTab === 'search' && (
              <SearchTab
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                onInsertIntoLesson={insertIntoLesson}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIWorkspaceFullScreen;
