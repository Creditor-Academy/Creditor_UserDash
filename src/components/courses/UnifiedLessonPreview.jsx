import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Edit3,
  Save,
  X,
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
  Lightbulb,
  FileText,
  Link,
  Quote,
  Table,
  Music,
  File,
  Maximize2,
  Minimize2,
  RotateCcw,
  Palette
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UnifiedLessonPreview = ({ 
  lesson, 
  contentBlocks = [], 
  isOpen, 
  onClose, 
  onEdit,
  isAILesson = false,
  onBlockUpdate
}) => {
  const [editingBlock, setEditingBlock] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'edit'
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());
  const [completedBlocks, setCompletedBlocks] = useState(new Set());
  const [videoStates, setVideoStates] = useState({});
  const [fullscreenBlock, setFullscreenBlock] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const videoRefs = useRef({});

  if (!isOpen) return null;

  // Combine AI lesson content with regular content blocks
  const allBlocks = isAILesson && lesson?.content ? 
    convertAILessonToBlocks(lesson) : 
    contentBlocks || [];

  const themes = {
    modern: {
      primary: 'from-blue-500 to-purple-600',
      secondary: 'from-purple-500 to-pink-500',
      accent: 'from-green-500 to-teal-500',
      warm: 'from-orange-500 to-red-500',
      cool: 'from-cyan-500 to-blue-500'
    },
    vibrant: {
      primary: 'from-pink-500 to-rose-500',
      secondary: 'from-violet-500 to-purple-500',
      accent: 'from-emerald-500 to-green-500',
      warm: 'from-amber-500 to-orange-500',
      cool: 'from-sky-500 to-blue-500'
    },
    professional: {
      primary: 'from-slate-600 to-gray-700',
      secondary: 'from-blue-600 to-indigo-700',
      accent: 'from-teal-600 to-cyan-700',
      warm: 'from-orange-600 to-red-700',
      cool: 'from-blue-600 to-purple-700'
    }
  };

  // Convert AI lesson structure to unified block format
  function convertAILessonToBlocks(lesson) {
    const blocks = [];
    let blockIndex = 0;

    // Title block
    if (lesson.title) {
      blocks.push({
        id: `title_${blockIndex++}`,
        type: 'heading',
        content: lesson.title,
        order: blocks.length + 1,
        theme: 'primary'
      });
    }

    // Introduction block
    if (lesson.content?.introduction) {
      blocks.push({
        id: `intro_${blockIndex++}`,
        type: 'text',
        content: lesson.content.introduction,
        title: 'Introduction',
        order: blocks.length + 1,
        theme: 'secondary'
      });
    }

    // Main content blocks
    if (lesson.content?.mainContent) {
      lesson.content.mainContent.forEach((point, index) => {
        blocks.push({
          id: `content_${blockIndex++}`,
          type: 'text',
          content: point.description,
          title: point.point,
          example: point.example,
          order: blocks.length + 1,
          theme: 'accent'
        });
      });
    }

    // Multimedia blocks
    if (lesson.content?.multimedia) {
      if (lesson.content.multimedia.image) {
        blocks.push({
          id: `image_${blockIndex++}`,
          type: 'image',
          imageUrl: typeof lesson.content.multimedia.image === 'string' ? 
            lesson.content.multimedia.image : 
            lesson.content.multimedia.image.url,
          title: 'Visual Learning',
          content: typeof lesson.content.multimedia.image === 'object' ? 
            lesson.content.multimedia.image.caption : 
            'Lesson illustration',
          order: blocks.length + 1,
          theme: 'warm'
        });
      }

      if (lesson.content.multimedia.video) {
        blocks.push({
          id: `video_${blockIndex++}`,
          type: 'video',
          videoUrl: lesson.content.multimedia.video.url,
          title: 'Educational Video',
          content: `Duration: ${lesson.content.multimedia.video.duration}`,
          order: blocks.length + 1,
          theme: 'cool'
        });
      }
    }

    // Q&A blocks
    if (lesson.content?.qa) {
      lesson.content.qa.forEach((qa, index) => {
        blocks.push({
          id: `qa_${blockIndex++}`,
          type: 'qa',
          question: qa.question,
          answer: qa.answer,
          difficulty: qa.difficulty,
          title: `Question ${index + 1}`,
          order: blocks.length + 1,
          theme: 'secondary'
        });
      });
    }

    // Summary block
    if (lesson.content?.summary) {
      blocks.push({
        id: `summary_${blockIndex++}`,
        type: 'text',
        content: lesson.content.summary,
        title: 'Summary',
        order: blocks.length + 1,
        theme: 'primary'
      });
    }

    return blocks;
  }

  const getBlockIcon = (type) => {
    const icons = {
      heading: BookOpen,
      text: FileText,
      image: ImageIcon,
      video: Video,
      audio: Music,
      pdf: File,
      link: Link,
      quote: Quote,
      table: Table,
      qa: HelpCircle
    };
    return icons[type] || FileText;
  };

  const getThemeGradient = (theme) => {
    return themes[selectedTheme][theme] || themes[selectedTheme].primary;
  };

  const handleBlockEdit = (block) => {
    setEditingBlock(block.id);
    setEditContent(block.content || '');
    setViewMode('edit');
  };

  const handleSaveEdit = () => {
    if (onBlockUpdate && editingBlock) {
      onBlockUpdate(editingBlock, editContent);
    }
    setEditingBlock(null);
    setEditContent('');
    setViewMode('preview');
  };

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setEditContent('');
    setViewMode('preview');
  };

  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const markBlockComplete = (blockId) => {
    setCompletedBlocks(prev => new Set([...prev, blockId]));
  };

  const toggleVideoPlay = (blockId) => {
    const video = videoRefs.current[blockId];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      setVideoStates(prev => ({
        ...prev,
        [blockId]: { ...prev[blockId], playing: !video.paused }
      }));
    }
  };

  const toggleVideoMute = (blockId) => {
    const video = videoRefs.current[blockId];
    if (video) {
      video.muted = !video.muted;
      setVideoStates(prev => ({
        ...prev,
        [blockId]: { ...prev[blockId], muted: video.muted }
      }));
    }
  };

  const renderBlock = (block, index) => {
    const Icon = getBlockIcon(block.type);
    const isExpanded = expandedBlocks.has(block.id);
    const isCompleted = completedBlocks.has(block.id);
    const isEditing = editingBlock === block.id;
    const isFullscreen = fullscreenBlock === block.id;
    const themeGradient = getThemeGradient(block.theme || 'primary');

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative group ${isFullscreen ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl' : ''}`}
      >
        <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
          {/* Block Header */}
          <div className={`bg-gradient-to-r ${themeGradient} p-4 text-white relative`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{block.title || `${block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block`}</h3>
                  <p className="text-white text-opacity-80 text-sm">Block {index + 1} of {allBlocks.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Theme selector */}
                <div className="relative group/theme">
                  <button className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all">
                    <Palette className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2 opacity-0 group-hover/theme:opacity-100 transition-opacity pointer-events-none group-hover/theme:pointer-events-auto z-10">
                    {Object.keys(themes).map(theme => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`block w-full text-left px-3 py-2 rounded text-sm capitalize ${selectedTheme === theme ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => handleBlockEdit(block)}
                  className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setFullscreenBlock(isFullscreen ? null : block.id)}
                  className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Completion status */}
                <button
                  onClick={() => markBlockComplete(block.id)}
                  className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${((index + 1) / allBlocks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Block Content */}
          <div className={`p-6 ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
            {isEditing ? (
              <div className="space-y-4">
                <ReactQuill
                  value={editContent}
                  onChange={setEditContent}
                  className="bg-white"
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'clean']
                    ]
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Render different block types */}
                {block.type === 'heading' && (
                  <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                    {block.content}
                  </h1>
                )}

                {block.type === 'text' && (
                  <div className="space-y-3">
                    <div 
                      className="text-gray-700 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                    {block.example && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Example:</p>
                        <p className="text-blue-700">{block.example}</p>
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="space-y-3">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title}
                      className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    />
                    {block.content && (
                      <p className="text-gray-600 text-center italic">{block.content}</p>
                    )}
                  </div>
                )}

                {block.type === 'video' && (
                  <div className="space-y-3">
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                      <video 
                        ref={el => videoRefs.current[block.id] = el}
                        src={block.videoUrl}
                        className="w-full h-64 object-cover"
                        controls
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => toggleVideoPlay(block.id)}
                          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          {videoStates[block.id]?.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleVideoMute(block.id)}
                          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          {videoStates[block.id]?.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {block.content && (
                      <p className="text-gray-600 text-center">{block.content}</p>
                    )}
                  </div>
                )}

                {block.type === 'qa' && (
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleBlockExpansion(block.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                            Q
                          </div>
                          <span className="font-medium text-gray-800">{block.question}</span>
                          {block.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              block.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              block.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {block.difficulty}
                            </span>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-orange-200 p-4 bg-orange-50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                A
                              </div>
                              <p className="text-orange-800">{block.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Add more block types as needed */}
              </div>
            )}
          </div>

          {/* Block Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Block {index + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <button
                  onClick={() => markBlockComplete(block.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark Complete
                </button>
              )}
              {isCompleted && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getThemeGradient('primary')} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {isAILesson ? lesson?.title : 'Lesson Preview'}
                </h2>
                <div className="flex items-center gap-4 text-white text-opacity-80">
                  <div className="flex items-center gap-1">
                    <Eye className="w-5 h-5" />
                    <span>Interactive Preview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-5 h-5" />
                    <span>{allBlocks.length} Blocks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-5 h-5" />
                    <span>{completedBlocks.size}/{allBlocks.length} Complete</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    {Math.round((completedBlocks.size / allBlocks.length) * 100)}% Complete
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedBlocks.size / allBlocks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              {allBlocks.map((block, index) => renderBlock(block, index))}
              
              {allBlocks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Content Available</h3>
                  <p className="text-gray-500">Add some content blocks to see the preview.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedLessonPreview;
