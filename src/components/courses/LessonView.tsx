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
  ChevronRight
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

interface LessonViewProps {
  lesson: LessonData;
  isOpen: boolean;
  onClose: () => void;
  isAILesson?: boolean;
  onSectionComplete?: (sectionId: string) => void;
  completedSections?: Set<string>;
  onSave?: (updatedLesson: LessonData) => void;
}

const LessonView: React.FC<LessonViewProps> = ({
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

  // Toggle video controls
  const toggleVideo = (videoId: string, action: 'play' | 'mute') => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [action === 'play' ? 'playing' : 'muted']: 
          action === 'play' ? !prev[videoId]?.playing : !prev[videoId]?.muted
      }
    }));
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
      title: 'Q&A Practice',
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
          className="w-full h-full bg-white flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Navigation Panel */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Navigation Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Lesson Progress</span>
                  </h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-blue-500 transition-all duration-300"></div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Progress Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{localCompletedSections.size}/{sections.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  />
                </div>
                <div className="text-center text-sm font-medium text-gray-700">
                  {getProgressPercentage()}% Complete
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isCompleted = localCompletedSections.has(section.id);
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group ${
                        isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500' 
                            : isActive 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'bg-white border-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium text-sm ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                              {section.title}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Section {index + 1} of {sections.length}
                          </div>
                        </div>
                        
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700">{lesson.duration || '15 min'}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Duration
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700">{sections.length}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Sections
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content Header - Compact Bar Style */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold">{lesson.title}</h1>
                  {lesson.duration && (
                    <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-blue-100">
                  {lesson.instructor && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{lesson.instructor}</span>
                    </div>
                  )}
                  {lesson.createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(lesson.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {isAILesson && (
                    <div className="flex items-center space-x-1 bg-purple-500/30 px-2 py-1 rounded-full text-xs">
                      <Lightbulb className="w-3 h-3" />
                      <span>AI</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="w-full p-3 space-y-3">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    ref={setSectionRef(section.id)}
                    data-section-id={section.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-h-[250px]"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${
                        section.color === 'blue' ? 'from-blue-50 to-blue-100' :
                        section.color === 'purple' ? 'from-purple-50 to-purple-100' :
                        section.color === 'indigo' ? 'from-indigo-50 to-indigo-100' :
                        section.color === 'green' ? 'from-green-50 to-green-100' :
                        section.color === 'orange' ? 'from-orange-50 to-orange-100' :
                        section.color === 'yellow' ? 'from-yellow-50 to-yellow-100' :
                        'from-emerald-50 to-emerald-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-opacity-10">
                              <section.icon className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                              <p className="text-gray-600">Section {index + 1}</p>
                            </div>
                          </div>
                          
                          {!localCompletedSections.has(section.id) && (
                            <button
                              onClick={() => markSectionComplete(section.id)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Render section-specific content */}
                        {section.id === 'introduction' && lesson.content?.introduction && (
                          <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed text-base mb-0">
                              {lesson.content.introduction}
                            </p>
                          </div>
                        )}
                        
                        {section.id === 'objectives' && lesson.content?.objectives && (
                          <div className="space-y-3">
                            <p className="text-gray-600 mb-4">By the end of this lesson, you will be able to:</p>
                            <div className="grid gap-3">
                              {lesson.content.objectives.map((objective, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                  </div>
                                  <p className="text-gray-700 leading-relaxed text-sm">{objective}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {section.id === 'content' && lesson.content?.mainContent && (
                          <div className="space-y-6">
                            {lesson.content.mainContent.map((item, idx) => (
                              <div key={idx} className="border-l-4 border-indigo-400 pl-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.point}</h3>
                                <p className="text-gray-700 leading-relaxed mb-3 text-sm">{item.description}</p>
                                {item.example && (
                                  <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-indigo-800 mb-1">Example:</p>
                                    <p className="text-indigo-700 text-sm">{item.example}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {section.id === 'multimedia' && lesson.content?.multimedia && (
                          <div className="space-y-6">
                            {lesson.content.multimedia.image && (
                              <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                                  <ImageIcon className="w-5 h-5 text-green-600" />
                                  <span>Visual Learning</span>
                                </h3>
                                <div className="relative group">
                                  <img 
                                    src={typeof lesson.content.multimedia.image === 'string' ? 
                                      lesson.content.multimedia.image : 
                                      lesson.content.multimedia.image.url
                                    }
                                    alt={typeof lesson.content.multimedia.image === 'object' ? 
                                      lesson.content.multimedia.image.alt : 
                                      'Lesson illustration'
                                    }
                                    className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                  />
                                  {typeof lesson.content.multimedia.image === 'object' && lesson.content.multimedia.image.caption && (
                                    <p className="text-center text-gray-600 italic mt-3">
                                      {lesson.content.multimedia.image.caption}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {lesson.content.multimedia.video && (
                              <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                                  <Video className="w-5 h-5 text-green-600" />
                                  <span>Educational Video</span>
                                  <span className="text-sm text-gray-500">({lesson.content.multimedia.video.duration})</span>
                                </h3>
                                <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                                  <video 
                                    src={lesson.content.multimedia.video.url}
                                    className="w-full h-64 object-cover"
                                    controls
                                    poster="/api/placeholder/800/400"
                                  />
                                  <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button
                                      onClick={() => toggleVideo('main', 'play')}
                                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                    >
                                      {videoStates.main?.playing ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => toggleVideo('main', 'mute')}
                                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                    >
                                      {videoStates.main?.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {section.id === 'qa' && lesson.content?.qa && (
                          <div className="space-y-4">
                            <p className="text-gray-600 mb-6">Test your understanding with these practice questions:</p>
                            {lesson.content.qa.map((item, idx) => (
                              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors">
                                <button
                                  onClick={() => setExpandedQA(expandedQA === idx ? null : idx)}
                                  className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-50 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                                      Q{idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-800">{item.question}</span>
                                    {item.difficulty && (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                        item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {item.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <motion.div
                                    animate={{ rotate: expandedQA === idx ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  </motion.div>
                                </button>
                                <AnimatePresence>
                                  {expandedQA === idx && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3, ease: "easeInOut" }}
                                      className="border-t border-gray-200 bg-orange-50"
                                    >
                                      <div className="p-4 flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                          A
                                        </div>
                                        <p className="text-orange-800 leading-relaxed">{item.answer}</p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {section.id === 'takeaways' && lesson.content?.keyTakeaways && (
                          <div className="space-y-4">
                            <p className="text-gray-600 mb-6">Remember these key points from this lesson:</p>
                            <div className="grid gap-4">
                              {lesson.content.keyTakeaways.map((takeaway, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-700 leading-relaxed">{takeaway}</p>
                                  </div>
                                  <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {section.id === 'summary' && lesson.content?.summary && (
                          <div className="space-y-6">
                            <div className="prose prose-lg max-w-none">
                              <p className="text-gray-700 leading-relaxed text-lg">
                                {lesson.content.summary}
                              </p>
                            </div>
                            
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 text-white rounded-full mb-4">
                                <Award className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Congratulations!</h3>
                              <p className="text-emerald-700">You've completed this lesson. You now have the knowledge to apply these concepts effectively.</p>
                            </div>
                            
                            {isAILesson && lesson.metadata && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                                  <Lightbulb className="w-4 h-4 text-purple-600" />
                                  <span>AI Generation Details</span>
                                </h4>
                                <div className="text-sm text-gray-600 space-y-2">
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
                        
                        {localCompletedSections.has(section.id) && (
                          <div className="mt-6 flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-green-700 font-medium">Section Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LessonView;