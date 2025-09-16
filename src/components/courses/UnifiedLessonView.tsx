import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Video,
  Target,
  Award,
  Lightbulb,
  Eye,
  ChevronRight,
  Edit3,
  Save,
  StickyNote,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';

interface LessonSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  content: unknown;
}

interface LessonData {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  instructor?: string;
  createdAt?: string;
  content?: {
    introduction?: string;
    mainContent?: Array<{
      point: string;
      description: string;
      example?: string;
    }>;
    multimedia?: {
      image?: string | { url: string; alt: string; caption: string };
      video?: { url: string; duration: string };
    };
    qa?: Array<{
      question: string;
      answer: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>;
    summary?: string;
    keyTakeaways?: string[];
    objectives?: string[];
  };
  metadata?: {
    aiGenerated?: boolean;
    generatedAt?: string;
    contentTypes?: string[];
  };
}

interface UnifiedLessonViewProps {
  lesson: LessonData;
  isOpen: boolean;
  onClose: () => void;
  isAILesson?: boolean;
  onSectionComplete?: (sectionId: string) => void;
  completedSections?: Set<string>;
  onSave?: (updatedLesson: LessonData) => void;
}

const UnifiedLessonView: React.FC<UnifiedLessonViewProps> = ({
  lesson,
  isOpen,
  onClose,
  isAILesson = false,
  onSectionComplete,
  completedSections = new Set(),
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [localCompletedSections, setLocalCompletedSections] = useState<Set<string>>(completedSections);
  const [videoStates, setVideoStates] = useState<Record<string, { playing: boolean; muted: boolean }>>({});
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const [sectionsInView, setSectionsInView] = useState<Set<string>>(new Set(['introduction']));
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<any>({});
  const [notes, setNotes] = useState<string>('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize section refs
  const setSectionRef = useCallback((sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  }, []);

  // Intersection Observer for tracking sections in view
  useEffect(() => {
    if (!isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const inView = new Set<string>();
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId && entry.isIntersecting) {
            inView.add(sectionId);
          }
        });
        
        if (inView.size > 0) {
          setSectionsInView(prev => new Set([...prev, ...inView]));
          const firstVisible = Array.from(inView)[0];
          if (firstVisible) {
            setActiveSection(firstVisible);
          }
        }
      },
      {
        root: contentRef.current,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen]);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && contentRef.current) {
      const container = contentRef.current;
      const offsetTop = element.offsetTop - container.offsetTop - 80;
      
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
    }
  };

  // Mark section as complete
  const markSectionComplete = (sectionId: string) => {
    const newCompleted = new Set([...localCompletedSections, sectionId]);
    setLocalCompletedSections(newCompleted);
    onSectionComplete?.(sectionId);
  };

  // Toggle section collapse
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Start editing a section
  const startEditing = (sectionId: string, currentContent: any) => {
    setEditingSection(sectionId);
    setEditedContent({ ...editedContent, [sectionId]: currentContent });
  };

  // Save edited content
  const saveEditedContent = (sectionId: string) => {
    if (onSave && editedContent[sectionId]) {
      const updatedLesson = { ...lesson };
      if (sectionId === 'introduction') {
        updatedLesson.content = { ...updatedLesson.content, introduction: editedContent[sectionId] };
      } else if (sectionId === 'objectives') {
        updatedLesson.content = { ...updatedLesson.content, objectives: editedContent[sectionId] };
      } else if (sectionId === 'summary') {
        updatedLesson.content = { ...updatedLesson.content, summary: editedContent[sectionId] };
      }
      onSave(updatedLesson);
    }
    setEditingSection(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSection(null);
    setEditedContent({});
  };

  if (!isOpen || !lesson) return null;

  // Define sections based on available content
  const sections: LessonSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: BookOpen,
      color: 'blue',
      content: lesson.content?.introduction
    },
    {
      id: 'objectives',
      title: 'Learning Objectives',
      icon: Target,
      color: 'purple',
      content: lesson.content?.objectives
    },
    {
      id: 'content',
      title: 'Main Content',
      icon: FileText,
      color: 'indigo',
      content: lesson.content?.mainContent
    },
    {
      id: 'multimedia',
      title: 'Visual Learning',
      icon: Video,
      color: 'green',
      content: lesson.content?.multimedia
    },
    {
      id: 'qa',
      title: 'Key Takeaways',
      icon: HelpCircle,
      color: 'orange',
      content: lesson.content?.qa
    },
    {
      id: 'takeaways',
      title: 'Key Takeaways', 
      icon: Lightbulb,
      color: 'yellow',
      content: lesson.content?.keyTakeaways
    },
    {
      id: 'summary',
      title: 'Summary',
      icon: Award,
      color: 'emerald',
      content: lesson.content?.summary
    }
  ].filter(section => section.content);

  const getProgressPercentage = () => {
    return Math.round((localCompletedSections.size / sections.length) * 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full h-full bg-gray-50 flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Progress Tracker */}
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Completion</span>
                  <span className="font-medium">{localCompletedSections.size}/{sections.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full flex items-center justify-end pr-2"
                  >
                    {getProgressPercentage() > 15 && (
                      <span className="text-xs text-white font-medium">
                        {getProgressPercentage()}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isCompleted = localCompletedSections.has(section.id);
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500' 
                            : isActive 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'bg-white border-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Icon className={`w-4 h-4 ${
                              isActive ? 'text-white' : 'text-gray-400'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className={`font-medium ${
                            isActive ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {section.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {index + 1} of {sections.length}
                          </div>
                        </div>

                        {/* Progress line connector */}
                        {index < sections.length - 1 && (
                          <div className="absolute left-[52px] top-full w-0.5 h-4 bg-gray-200"></div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Notes Section */}
            <div className="p-4 border-t border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <StickyNote className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Notes</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full h-20 text-sm border border-gray-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                {lesson.description && (
                  <p className="text-blue-100 mb-4">{lesson.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-blue-100 text-sm">
                  {lesson.instructor && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{lesson.instructor}</span>
                    </div>
                  )}
                  {lesson.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}</span>
                    </div>
                  )}
                  {isAILesson && (
                    <div className="flex items-center space-x-2 bg-purple-500 bg-opacity-30 px-2 py-1 rounded-full">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs">AI Generated</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Unified Content Container */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto bg-white"
            >
              {/* Single Main Container - Full Width */}
              <div className="h-full">
                {sections.map((section, index) => {
                  const isCollapsed = collapsedSections.has(section.id);
                  const isCompleted = localCompletedSections.has(section.id);
                  const isEditing = editingSection === section.id;
                  
                  return (
                    <motion.div
                      key={section.id}
                      ref={setSectionRef(section.id)}
                      data-section-id={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${index !== sections.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      {/* Section Header - Small Title */}
                      <div className="px-8 py-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <section.icon className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-800">{section.title}</h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleSectionCollapse(section.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            
                            {!isCompleted && (
                              <button
                                onClick={() => markSectionComplete(section.id)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section Content */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-8 pb-6">
                              <div className="pl-9 max-w-none"> {/* Align with icon, remove max-width */}
                                {/* Content based on section type */}
                                {section.id === 'introduction' && lesson.content?.introduction && (
                                  <div>
                                    {isEditing ? (
                                      <div className="space-y-3">
                                        <textarea
                                          value={editedContent[section.id] || lesson.content.introduction}
                                          onChange={(e) => setEditedContent({
                                            ...editedContent,
                                            [section.id]: e.target.value
                                          })}
                                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => saveEditedContent(section.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                                          >
                                            <Save className="w-3 h-3" />
                                            <span>Save</span>
                                          </button>
                                          <button
                                            onClick={cancelEditing}
                                            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="group relative">
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                          {lesson.content.introduction}
                                        </p>
                                        <button
                                          onClick={() => startEditing(section.id, lesson.content.introduction)}
                                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                                        >
                                          <Edit3 className="w-3 h-3 text-gray-500" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {section.id === 'objectives' && lesson.content?.objectives && (
                                  <div>
                                    <p className="text-gray-600 text-sm mb-3">By the end of this lesson, you will be able to:</p>
                                    <ul className="space-y-2">
                                      {lesson.content.objectives.map((objective, idx) => (
                                        <li key={idx} className="flex items-start space-x-2 text-sm">
                                          <span className="text-purple-500 mt-1.5">•</span>
                                          <span className="text-gray-700 leading-relaxed">{objective}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {section.id === 'content' && lesson.content?.mainContent && (
                                  <div className="space-y-4">
                                    {lesson.content.mainContent.map((item, idx) => (
                                      <div key={idx}>
                                        <h4 className="text-base font-medium text-gray-800 mb-2">{item.point}</h4>
                                        <p className="text-gray-700 leading-relaxed mb-2 text-sm">{item.description}</p>
                                        {item.example && (
                                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
                                            <p className="text-xs font-medium text-blue-800 mb-1">Example:</p>
                                            <p className="text-blue-700 text-sm">{item.example}</p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {section.id === 'multimedia' && lesson.content?.multimedia && (
                                  <div className="space-y-4">
                                    {lesson.content.multimedia.image && (
                                      <div>
                                        <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center space-x-2">
                                          <ImageIcon className="w-4 h-4 text-green-600" />
                                          <span>Visual Learning</span>
                                        </h4>
                                        <div className="relative">
                                          <img 
                                            src={typeof lesson.content.multimedia.image === 'string' ? 
                                              lesson.content.multimedia.image : 
                                              lesson.content.multimedia.image.url
                                            }
                                            alt={typeof lesson.content.multimedia.image === 'object' ? 
                                              lesson.content.multimedia.image.alt : 
                                              'Lesson illustration'
                                            }
                                            className="w-full rounded-lg shadow-sm"
                                          />
                                          {typeof lesson.content.multimedia.image === 'object' && lesson.content.multimedia.image.caption && (
                                            <p className="text-center text-gray-600 italic mt-2 text-sm">
                                              {lesson.content.multimedia.image.caption}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {lesson.content.multimedia.video && (
                                      <div>
                                        <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center space-x-2">
                                          <Video className="w-4 h-4 text-green-600" />
                                          <span>Educational Video</span>
                                          <span className="text-sm text-gray-500">({lesson.content.multimedia.video.duration})</span>
                                        </h4>
                                        <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-sm">
                                          <video 
                                            src={lesson.content.multimedia.video.url}
                                            className="w-full h-48 object-cover"
                                            controls
                                            poster="/api/placeholder/800/400"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {section.id === 'qa' && lesson.content?.qa && (
                                  <div>
                                    <p className="text-gray-600 mb-3 text-sm">Test your understanding:</p>
                                    <div className="space-y-2">
                                      {lesson.content.qa.map((item, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
                                          <button
                                            onClick={() => setExpandedQA(expandedQA === idx ? null : idx)}
                                            className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="flex items-center space-x-2">
                                              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                                                {idx + 1}
                                              </span>
                                              <span className="font-medium text-gray-800 text-sm">{item.question}</span>
                                              {item.difficulty && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                  item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                  item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-red-100 text-red-800'
                                                }`}>
                                                  {item.difficulty}
                                                </span>
                                              )}
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                                              expandedQA === idx ? 'rotate-90' : ''
                                            }`} />
                                          </button>
                                          <AnimatePresence>
                                            {expandedQA === idx && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="border-t border-gray-200 bg-gray-50"
                                              >
                                                <div className="p-3 flex items-start space-x-2">
                                                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                                    A
                                                  </span>
                                                  <p className="text-gray-700 leading-relaxed text-sm">{item.answer}</p>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {section.id === 'takeaways' && lesson.content?.keyTakeaways && (
                                  <div>
                                    <p className="text-gray-600 mb-3 text-sm">Key points to remember:</p>
                                    <ul className="space-y-2">
                                      {lesson.content.keyTakeaways.map((takeaway, idx) => (
                                        <li key={idx} className="flex items-start space-x-2 text-sm">
                                          <span className="text-yellow-500 mt-1.5">•</span>
                                          <span className="text-gray-700 leading-relaxed">{takeaway}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {section.id === 'summary' && lesson.content?.summary && (
                                  <div>
                                    {isEditing ? (
                                      <div className="space-y-3">
                                        <textarea
                                          value={editedContent[section.id] || lesson.content.summary}
                                          onChange={(e) => setEditedContent({
                                            ...editedContent,
                                            [section.id]: e.target.value
                                          })}
                                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => saveEditedContent(section.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                                          >
                                            <Save className="w-3 h-3" />
                                            <span>Save</span>
                                          </button>
                                          <button
                                            onClick={cancelEditing}
                                            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="group relative">
                                        <p className="text-gray-700 leading-relaxed text-sm mb-4">
                                          {lesson.content.summary}
                                        </p>
                                        <button
                                          onClick={() => startEditing(section.id, lesson.content.summary)}
                                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                                        >
                                          <Edit3 className="w-3 h-3 text-gray-500" />
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Completion celebration */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full mb-2">
                                        <Award className="w-5 h-5" />
                                      </div>
                                      <h4 className="text-base font-semibold text-green-800 mb-1">Lesson Complete!</h4>
                                      <p className="text-green-700 text-sm">Great job! You've mastered this lesson content.</p>
                                    </div>
                                    
                                    {/* AI metadata */}
                                    {isAILesson && lesson.metadata && (
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                                        <h5 className="font-medium text-gray-800 mb-2 flex items-center space-x-2 text-sm">
                                          <Lightbulb className="w-4 h-4 text-purple-600" />
                                          <span>AI Generated Content</span>
                                        </h5>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          {lesson.metadata.generatedAt && (
                                            <p>Generated: {new Date(lesson.metadata.generatedAt).toLocaleString()}</p>
                                          )}
                                          {lesson.metadata.contentTypes && (
                                            <p>Content Types: {lesson.metadata.contentTypes.join(', ')}</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Completion Status */}
                                {isCompleted && (
                                  <div className="mt-3 flex items-center justify-center p-2 bg-green-50 border border-green-200 rounded-md">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                    <span className="text-green-700 font-medium text-sm">Section Completed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedLessonView;