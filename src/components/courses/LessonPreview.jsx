import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Eye, 
  Clock, 
  CheckCircle, 
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Image as ImageIcon,
  Video,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

const LessonPreview = ({ lesson, isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [expandedQA, setExpandedQA] = useState(null);
  const [completedSections, setCompletedSections] = useState(new Set());

  if (!isOpen || !lesson) return null;

  const { content, metadata } = lesson;

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: BookOpen, color: 'blue' },
    { id: 'content', title: 'Main Content', icon: Lightbulb, color: 'purple' },
    { id: 'multimedia', title: 'Visual Learning', icon: Video, color: 'green' },
    { id: 'qa', title: 'Q&A Practice', icon: HelpCircle, color: 'orange' },
    { id: 'summary', title: 'Summary', icon: CheckCircle, color: 'emerald' }
  ];

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const markSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const getSectionColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    };
    return colors[color] || colors.blue;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>Preview Mode</span>
                  </div>
                  {metadata?.contentTypes && (
                    <div className="flex items-center gap-2">
                      {metadata.contentTypes.includes('image') && <ImageIcon className="w-4 h-4" />}
                      {metadata.contentTypes.includes('video') && <Video className="w-4 h-4" />}
                      {metadata.contentTypes.includes('qa') && <HelpCircle className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Lesson Sections</h3>
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isCompleted = completedSections.has(section.id);
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive 
                          ? `${getSectionColor(section.color)} border-2` 
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-500'}`} />
                      <span className={`flex-1 text-left font-medium ${isActive ? '' : 'text-gray-700'}`}>
                        {section.title}
                      </span>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {completedSections.size}/{sections.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSections.size / sections.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeSection === 'introduction' && (
                  <motion.div
                    key="introduction"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Introduction</h3>
                      <p className="text-blue-700 leading-relaxed">{content?.introduction}</p>
                    </div>
                    <button
                      onClick={() => markSectionComplete('introduction')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Complete
                    </button>
                  </motion.div>
                )}

                {activeSection === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Key Learning Points</h3>
                    {content?.mainContent?.map((point, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          {index + 1}. {point.point}
                        </h4>
                        <p className="text-gray-700 mb-3">{point.description}</p>
                        {point.example && (
                          <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                            <span className="text-sm font-medium text-purple-800">Example: </span>
                            <span className="text-purple-700">{point.example}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => markSectionComplete('content')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Mark as Complete
                    </button>
                  </motion.div>
                )}

                {activeSection === 'multimedia' && (
                  <motion.div
                    key="multimedia"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Visual Learning</h3>
                    
                    {/* Image Section */}
                    {content?.multimedia?.image && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Lesson Illustration
                          </h4>
                        </div>
                        <div className="p-6 text-center">
                          {typeof content.multimedia.image === 'string' ? (
                            <img 
                              src={content.multimedia.image} 
                              alt="Lesson illustration"
                              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                            />
                          ) : (
                            <>
                              <img 
                                src={content.multimedia.image.url} 
                                alt={content.multimedia.image.alt}
                                className="w-full max-w-2xl mx-auto rounded-lg shadow-md mb-3"
                              />
                              <p className="text-sm text-gray-600 italic">
                                {content.multimedia.image.caption}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video Section */}
                    {content?.multimedia?.video && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            Educational Video ({content.multimedia.video.duration})
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                            <video 
                              src={content.multimedia.video.url}
                              className="w-full h-64 object-cover"
                              controls
                              muted={videoMuted}
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                              <button
                                onClick={() => setVideoMuted(!videoMuted)}
                                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                              >
                                {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => markSectionComplete('multimedia')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Complete
                    </button>
                  </motion.div>
                )}

                {activeSection === 'qa' && (
                  <motion.div
                    key="qa"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Practice Questions</h3>
                    {content?.qa?.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedQA(expandedQA === index ? null : index)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
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
                          {expandedQA === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <AnimatePresence>
                          {expandedQA === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-200 p-4 bg-orange-50"
                            >
                              <p className="text-orange-800">{item.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <button
                      onClick={() => markSectionComplete('qa')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Mark as Complete
                    </button>
                  </motion.div>
                )}

                {activeSection === 'summary' && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-emerald-50 border-l-4 border-emerald-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-3">Lesson Summary</h3>
                      <p className="text-emerald-700 leading-relaxed">{content?.summary}</p>
                    </div>
                    
                    {metadata?.aiGenerated && (
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">AI Generation Details</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Generated: {new Date(metadata.generatedAt).toLocaleString()}</p>
                          <p>Content Types: {metadata.contentTypes?.join(', ')}</p>
                          {metadata.models && (
                            <div className="mt-2">
                              <p className="font-medium">AI Models Used:</p>
                              <ul className="list-disc list-inside ml-2">
                                {Object.entries(metadata.models).map(([type, model]) => (
                                  <li key={type}>{type}: {model}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => markSectionComplete('summary')}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Mark as Complete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LessonPreview;
