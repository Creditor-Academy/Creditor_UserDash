import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { saveAILessons } from '../../services/aiCourseService';
import { contentBlockTypes } from '@lessonbuilder/constants/blockTypes';

const AILessonCreator = ({
  isOpen,
  onClose,
  courseTitle,
  onLessonsCreated,
}) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editingBlockLessonId, setEditingBlockLessonId] = useState(null);
  const [contentBlocks, setContentBlocks] = useState({});
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState(null);

  const tabs = [
    { id: 'lessons', label: 'AI Lessons', icon: FileText },
    { id: 'edit', label: 'Edit Lessons', icon: Edit3 },
    { id: 'blocks', label: 'Block Editor', icon: Square },
    { id: 'preview', label: 'Preview', icon: Video },
  ];

  // Generate AI lessons based on course title
  const generateAILessons = async () => {
    if (!courseTitle) return;

    setIsGenerating(true);
    try {
      // Create a prompt for generating lessons
      const prompt = `Create 6 comprehensive lessons for a course titled "${courseTitle}".
      
      Generate lessons with the following structure:
      1. Introduction lesson
      2. 3 core concept lessons
      3. 1 practical application lesson
      4. 1 summary/advanced concepts lesson
      
      For each lesson, provide:
      - title (string)
      - description (brief overview, 1-2 sentences)
      - content (detailed educational content with sections)
      - duration (estimated time, e.g., "15 min")
      - keyPoints (array of 3-5 key learning points)
      
      Format as valid JSON array:
      [
        {
          "id": 1,
          "title": "Lesson Title",
          "description": "Brief overview",
          "content": "Detailed educational content with multiple sections",
          "duration": "15 min",
          "keyPoints": ["Point 1", "Point 2", "Point 3"]
        }
      ]`;

      // For now, we'll simulate AI generation with mock data
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockLessons = [
        {
          id: 1,
          title: `Introduction to ${courseTitle}`,
          description: `Understanding the fundamentals and core concepts of ${courseTitle}`,
          content: `Welcome to your ${courseTitle} course! In this lesson, you'll learn the essential concepts that form the foundation of ${courseTitle}. We'll cover key terminology, basic principles, and real-world applications that will prepare you for more advanced topics.\n\nBy the end of this lesson, you'll have a solid understanding of what ${courseTitle} is and why it's important in today's world.`,
          duration: '15 min',
          keyPoints: [
            'Understand core terminology',
            'Learn fundamental principles',
            'Explore real-world applications',
          ],
        },
        {
          id: 2,
          title: 'Core Concepts and Principles',
          description:
            'Dive deep into the essential concepts that drive this field',
          content: `In this lesson, we'll explore the core concepts and principles that are fundamental to ${courseTitle}. You'll learn about the key theories, methodologies, and frameworks that professionals use in practice.\n\nWe'll break down complex ideas into digestible sections and provide practical examples to help you understand how these concepts apply in real-world scenarios.`,
          duration: '25 min',
          keyPoints: [
            'Master key theories',
            'Understand methodologies',
            'Apply frameworks in practice',
          ],
        },
        {
          id: 3,
          title: 'Advanced Techniques and Methods',
          description:
            'Learn advanced approaches used by professionals in the field',
          content: `This lesson focuses on advanced techniques and methods used by experienced practitioners in ${courseTitle}. You'll discover cutting-edge approaches, best practices, and optimization strategies that can help you excel in your work.\n\nWe'll also cover common challenges and how to overcome them effectively.`,
          duration: '30 min',
          keyPoints: [
            'Implement advanced techniques',
            'Follow industry best practices',
            'Solve complex challenges',
          ],
        },
        {
          id: 4,
          title: 'Practical Applications',
          description:
            'Apply your knowledge to real-world projects and scenarios',
          content: `In this hands-on lesson, you'll apply everything you've learned to practical projects and real-world scenarios. We'll walk through several case studies and provide step-by-step guidance on how to implement solutions.\n\nYou'll gain valuable experience that you can immediately apply in your own work or projects.`,
          duration: '35 min',
          keyPoints: [
            'Work on real-world projects',
            'Apply theoretical knowledge',
            'Gain practical experience',
          ],
        },
        {
          id: 5,
          title: 'Tools and Resources',
          description: 'Explore the essential tools and resources for success',
          content: `Every professional needs the right tools and resources to be successful. In this lesson, we'll introduce you to the essential software, platforms, and resources that are commonly used in ${courseTitle}.\n\nYou'll learn how to select the right tools for your needs and how to maximize their potential.`,
          duration: '20 min',
          keyPoints: [
            'Master essential software',
            'Utilize key platforms',
            'Access valuable resources',
          ],
        },
        {
          id: 6,
          title: 'Next Steps and Career Path',
          description: 'Plan your learning journey and career development',
          content: `As we conclude this course, it's important to think about your next steps. In this final lesson, we'll discuss career opportunities, advanced learning paths, and how to continue developing your skills in ${courseTitle}.\n\nWe'll also provide recommendations for further study and professional development.`,
          duration: '15 min',
          keyPoints: [
            'Explore career opportunities',
            'Plan advanced learning paths',
            'Continue skill development',
          ],
        },
      ];

      setLessons(mockLessons);

      // Initialize content blocks for each lesson
      const initialBlocks = {};
      mockLessons.forEach(lesson => {
        initialBlocks[lesson.id] = [
          {
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: lesson.content,
            order: 1,
          },
        ];
      });
      setContentBlocks(initialBlocks);
    } catch (error) {
      console.error('Failed to generate AI lessons:', error);
      alert('Failed to generate lessons: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start editing a lesson
  const startEditing = lesson => {
    setEditingLessonId(lesson.id);
    setEditContent(lesson.content);
  };

  // Save edited lesson
  const saveEdit = () => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === editingLessonId
          ? { ...lesson, content: editContent }
          : lesson
      )
    );
    setEditingLessonId(null);
    setEditContent('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingLessonId(null);
    setEditContent('');
  };

  // CRUD Operations for Lessons

  // Create new lesson
  const createNewLesson = () => {
    const newLesson = {
      id: Date.now(),
      title: 'New Lesson',
      description: 'Click edit to add description',
      content: 'Add your lesson content here...',
      duration: '15 min',
      keyPoints: ['Key point 1', 'Key point 2'],
    };

    setLessons(prev => [...prev, newLesson]);
    setEditingLessonId(newLesson.id);
    setEditContent(newLesson.content);
  };

  // Update lesson
  const updateLesson = (lessonId, updatedData) => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === lessonId ? { ...lesson, ...updatedData } : lesson
      )
    );
  };

  // Delete a lesson
  const deleteLesson = lessonId => {
    if (
      confirm(
        'Are you sure you want to delete this lesson? This action cannot be undone.'
      )
    ) {
      setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      setContentBlocks(prev => {
        const newBlocks = { ...prev };
        delete newBlocks[lessonId];
        return newBlocks;
      });

      // Clear editing states if deleting currently edited lesson
      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
        setEditContent('');
      }
      if (editingBlockLessonId === lessonId) {
        setEditingBlockLessonId(null);
      }
    }
  };

  // Duplicate lesson
  const duplicateLesson = lessonId => {
    const lessonToDuplicate = lessons.find(lesson => lesson.id === lessonId);
    if (lessonToDuplicate) {
      const duplicatedLesson = {
        ...lessonToDuplicate,
        id: Date.now(),
        title: `${lessonToDuplicate.title} (Copy)`,
      };

      setLessons(prev => [...prev, duplicatedLesson]);

      // Duplicate content blocks if they exist
      if (contentBlocks[lessonId]) {
        const duplicatedBlocks = contentBlocks[lessonId].map(block => ({
          ...block,
          id: `block-${Date.now()}-${Math.random()}`,
        }));
        setContentBlocks(prev => ({
          ...prev,
          [duplicatedLesson.id]: duplicatedBlocks,
        }));
      }
    }
  };

  // Start block editing for a lesson
  const startBlockEditing = lessonId => {
    setEditingBlockLessonId(lessonId);
    setShowContentLibrary(true);
  };

  // Add a content block to a lesson
  const addContentBlock = (lessonId, blockType) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: blockType.id,
      content: getDefaultContent(blockType.id),
      order: (contentBlocks[lessonId] ? contentBlocks[lessonId].length : 0) + 1,
    };

    setContentBlocks(prev => ({
      ...prev,
      [lessonId]: [...(prev[lessonId] || []), newBlock],
    }));

    setSelectedBlockType(null);
  };

  // Get default content for a block type
  const getDefaultContent = type => {
    switch (type) {
      case 'text':
        return '<p>Start typing your content here...</p>';
      case 'statement':
        return '<p><strong>Important Statement:</strong> Add your key point here.</p>';
      case 'quote':
        return '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">Add your quote here...</blockquote>';
      case 'image':
        return { url: '', alt: 'Image', caption: '' };
      case 'video':
        return { url: '', title: 'Video' };
      case 'audio':
        return { url: '', title: 'Audio' };
      case 'youtube':
        return { url: '', title: 'YouTube Video' };
      case 'link':
        return { url: '', text: 'Link text', description: '' };
      case 'pdf':
        return { url: '', title: 'PDF Document' };
      case 'tables':
        return '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header 1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header 2</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><tr><td class="px-6 py-4 whitespace-nowrap">Cell 1</td><td class="px-6 py-4 whitespace-nowrap">Cell 2</td></tr></tbody></table>';
      case 'scorm':
        return { packageUrl: '', title: 'SCORM Package' };
      default:
        return '';
    }
  };

  // CRUD Operations for Content Blocks

  // Create content block (already exists as addContentBlock)

  // Read content blocks (already handled in state)

  // Update a content block
  const updateContentBlock = (
    lessonId,
    blockId,
    content,
    additionalData = {}
  ) => {
    setContentBlocks(prev => ({
      ...prev,
      [lessonId]: prev[lessonId].map(block =>
        block.id === blockId ? { ...block, content, ...additionalData } : block
      ),
    }));
  };

  // Delete a content block
  const deleteContentBlock = (lessonId, blockId) => {
    if (confirm('Delete this content block?')) {
      setContentBlocks(prev => ({
        ...prev,
        [lessonId]: prev[lessonId].filter(block => block.id !== blockId),
      }));
    }
  };

  // Duplicate content block
  const duplicateContentBlock = (lessonId, blockId) => {
    const blockToDuplicate = contentBlocks[lessonId]?.find(
      block => block.id === blockId
    );
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}-${Math.random()}`,
        order: (contentBlocks[lessonId]?.length || 0) + 1,
      };

      setContentBlocks(prev => ({
        ...prev,
        [lessonId]: [...(prev[lessonId] || []), duplicatedBlock],
      }));
    }
  };

  // Move content block up/down
  const moveContentBlock = (lessonId, blockId, direction) => {
    const blocks = contentBlocks[lessonId] || [];
    const currentIndex = blocks.findIndex(block => block.id === blockId);

    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[currentIndex],
    ];

    setContentBlocks(prev => ({
      ...prev,
      [lessonId]: newBlocks,
    }));
  };

  // Save all lessons
  const saveLessons = async () => {
    if (lessons.length === 0) {
      alert('Please generate lessons first');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare lesson data with blocks if using block editor
      const lessonsWithBlocks = lessons.map(lesson => ({
        ...lesson,
        blocks: contentBlocks[lesson.id] || [],
      }));

      // Save to backend
      const result = await saveAILessons({
        courseTitle,
        lessons: lessonsWithBlocks,
        blockBased: true,
      });

      if (result.success) {
        if (onLessonsCreated) {
          onLessonsCreated({
            courseTitle,
            courseId: result.data.data.courseId,
            lessons: lessonsWithBlocks,
          });
        }

        alert('Lessons saved successfully!');
        onClose();
      } else {
        throw new Error(result.error || 'Failed to save lessons');
      }
    } catch (error) {
      console.error('Failed to save lessons:', error);
      alert('Failed to save lessons: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate lessons when panel opens and course title is provided
  useEffect(() => {
    if (isOpen && courseTitle && lessons.length === 0) {
      console.log(
        '🎓 AI Lesson Creator opened with course title:',
        courseTitle
      );
      generateAILessons();
    } else if (isOpen && !courseTitle) {
      console.warn('⚠️ AI Lesson Creator opened without course title');
    }
  }, [isOpen, courseTitle]);

  // Reset form when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setLessons([]);
      setEditingLessonId(null);
      setEditContent('');
      setEditingBlockLessonId(null);
      setContentBlocks({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Render content block based on type
  const renderContentBlock = (block, lessonId) => {
    const isEditing = editingBlockLessonId === lessonId;

    switch (block.type) {
      case 'text':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {isEditing ? (
              <textarea
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '')
                    : ''
                }
                onChange={e =>
                  updateContentBlock(lessonId, block.id, e.target.value)
                }
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your text content..."
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            )}
          </div>
        );
      case 'statement':
        return (
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            {isEditing ? (
              <textarea
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '')
                    : ''
                }
                onChange={e =>
                  updateContentBlock(
                    lessonId,
                    block.id,
                    `<p><strong>Important Statement:</strong> ${e.target.value}</p>`
                  )
                }
                className="w-full min-h-[60px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your statement..."
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            )}
          </div>
        );
      case 'quote':
        return (
          <div
            className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded-r-lg italic text-gray-700"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'image':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white text-center">
            {block.content.url ? (
              <img
                src={block.content.url}
                alt={block.content.alt}
                className="max-w-full h-auto rounded"
              />
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content.caption && (
              <p className="mt-2 text-sm text-gray-600">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.url ? (
              <div className="relative pb-[56.25%] h-0">
                {' '}
                {/* 16:9 Aspect Ratio */}
                <iframe
                  src={block.content.url}
                  className="absolute top-0 left-0 w-full h-full rounded"
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
            {block.content.title && (
              <p className="mt-2 text-sm font-medium">{block.content.title}</p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.url ? (
              <audio controls className="w-full">
                <source src={block.content.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-24 flex items-center justify-center">
                <AudioLines className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content.title && (
              <p className="mt-2 text-sm font-medium">{block.content.title}</p>
            )}
          </div>
        );
      case 'youtube':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.url ? (
              <div className="relative pb-[56.25%] h-0">
                {' '}
                {/* 16:9 Aspect Ratio */}
                <iframe
                  src={block.content.url}
                  className="absolute top-0 left-0 w-full h-full rounded"
                  frameBorder="0"
                  allowFullScreen
                  title={block.content.title}
                />
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex items-center justify-center">
                <Youtube className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content.title && (
              <p className="mt-2 text-sm font-medium">{block.content.title}</p>
            )}
          </div>
        );
      case 'link':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.url ? (
              <a
                href={block.content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {block.content.text}
              </a>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-16 flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {block.content.description && (
              <p className="mt-2 text-sm text-gray-600">
                {block.content.description}
              </p>
            )}
          </div>
        );
      case 'pdf':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.url ? (
              <div className="relative pb-[100%] h-0">
                {' '}
                {/* 1:1 Aspect Ratio for PDF preview */}
                <iframe
                  src={block.content.url}
                  className="absolute top-0 left-0 w-full h-full rounded"
                  frameBorder="0"
                  title={block.content.title}
                />
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content.title && (
              <p className="mt-2 text-sm font-medium">{block.content.title}</p>
            )}
          </div>
        );
      case 'tables':
        return (
          <div
            className="p-4 border border-gray-200 rounded-lg bg-white overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'scorm':
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {block.content.packageUrl ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-800">SCORM Package Ready</p>
                <p className="text-sm text-blue-600 mt-1">
                  {block.content.title}
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-full h-24 flex items-center justify-center">
                <Box className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {block.content.title && (
              <p className="mt-2 text-sm font-medium">{block.content.title}</p>
            )}
          </div>
        );
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <p>Unsupported block type: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      {/* Header - Responsive adjustments */}
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
            <h2 className="text-lg font-semibold text-gray-900">
              AI Lesson Creator
            </h2>
            <span className="text-sm text-gray-500 hidden md:inline">
              {courseTitle ? `for "${courseTitle}"` : '(No course selected)'}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Content - Full Screen Layout with responsive adjustments */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left panel - Lesson list - Responsive adjustments */}
        <div className="w-full md:w-1/4 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto max-h-40 md:max-h-full">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Lessons
              </h3>
              <Button
                onClick={createNewLesson}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={`${lesson.id}-${index}`}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    (activeTab === 'edit' && editingLessonId === lesson.id) ||
                    (activeTab === 'blocks' &&
                      editingBlockLessonId === lesson.id)
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-white border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (activeTab === 'edit') {
                      startEditing(lesson);
                    } else if (activeTab === 'blocks') {
                      startBlockEditing(lesson.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.duration}
                      </p>
                    </div>

                    {/* CRUD Action Buttons */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          duplicateLesson(lesson.id);
                        }}
                        className="text-gray-400 hover:text-blue-500 p-1"
                        title="Duplicate lesson"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteLesson(lesson.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete lesson"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {lessons.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">
                  {isGenerating
                    ? 'Generating AI lessons...'
                    : 'No lessons generated yet'}
                </p>
                {isGenerating && (
                  <div className="mt-3">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Middle panel - Content Library (only shown in block editor) - Responsive adjustments */}
        {activeTab === 'blocks' && showContentLibrary && (
          <div className="w-full md:w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto max-h-40 md:max-h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-800">
                Content Library
              </h3>
              <button
                onClick={() => setShowContentLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Drag and drop content blocks to build your lesson
            </p>

            <div className="space-y-3">
              {contentBlockTypes.map(blockType => (
                <Card
                  key={blockType.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
                  onClick={() => {
                    if (editingBlockLessonId) {
                      addContentBlock(editingBlockLessonId, blockType);
                    }
                  }}
                >
                  <CardContent className="flex items-center p-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                      {blockType.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">
                        {blockType.title}
                      </h4>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Right panel - Content area - Responsive adjustments */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-8rem)] md:max-h-full">
          {/* Tab Navigation - Responsive adjustments */}
          <div className="bg-gray-100 flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area - Responsive adjustments */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      AI-Generated Lessons
                    </h3>
                    <Button
                      onClick={generateAILessons}
                      disabled={isGenerating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="hidden sm:inline">
                            Generating...
                          </span>
                          <span className="sm:hidden">Gen...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">
                            Regenerate Lessons
                          </span>
                          <span className="sm:hidden">Regen</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {lessons.length > 0 ? (
                    <div className="space-y-4">
                      {lessons.map((lesson, index) => (
                        <div
                          key={`${lesson.id}-${index}`}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {lesson.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {lesson.description}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {lesson.duration}
                            </span>
                          </div>

                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Key Points
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {lesson.keyPoints.map((point, pointIndex) => (
                                <li
                                  key={`${point}-${pointIndex}`}
                                  className="text-sm text-gray-600"
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {lesson.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {!courseTitle
                          ? 'No Course Selected'
                          : 'No Lessons Generated'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {!courseTitle
                          ? 'Please select a course first before generating lessons.'
                          : 'Click the "Generate Lessons" button to create AI-powered lessons for your course.'}
                      </p>
                      <Button
                        onClick={generateAILessons}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generating Lessons...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Lessons
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-600" />
                      Edit Lessons
                    </h3>
                    <Button
                      onClick={saveLessons}
                      disabled={isSaving || lessons.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="hidden sm:inline">Saving...</span>
                          <span className="sm:hidden">Save...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">
                            Save All Lessons
                          </span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {lessons.length > 0 ? (
                    <div className="space-y-4">
                      {lessons.map(lesson => (
                        <div
                          key={`${lesson.id}-${lesson.title}`}
                          className="bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-medium text-gray-900">
                                {lesson.title}
                              </h4>
                              {editingLessonId === lesson.id ? (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={saveEdit}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={cancelEdit}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => startEditing(lesson)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {lesson.description}
                            </p>
                          </div>

                          <div className="p-4">
                            {editingLessonId === lesson.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Lesson Title
                                    </label>
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={e =>
                                        updateLesson(lesson.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      placeholder="Enter lesson title..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Duration
                                    </label>
                                    <input
                                      type="text"
                                      value={lesson.duration}
                                      onChange={e =>
                                        updateLesson(lesson.id, {
                                          duration: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      placeholder="e.g., 15 min"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    value={lesson.description}
                                    onChange={e =>
                                      updateLesson(lesson.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Brief lesson description..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                  </label>
                                  <textarea
                                    value={editContent}
                                    onChange={e =>
                                      setEditContent(e.target.value)
                                    }
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                    placeholder="Edit lesson content..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-line text-gray-700">
                                  {lesson.content}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Edit3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Lessons to Edit
                      </h3>
                      <p className="text-gray-500">
                        Generate lessons first in the "AI Lessons" tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Square className="w-4 h-4 text-purple-600" />
                      Block Editor
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {editingBlockLessonId && (
                        <Button
                          onClick={() =>
                            setShowContentLibrary(!showContentLibrary)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {showContentLibrary ? 'Hide Blocks' : 'Add Blocks'}
                        </Button>
                      )}
                      <Button
                        onClick={saveLessons}
                        disabled={isSaving || lessons.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="hidden sm:inline">Saving...</span>
                            <span className="sm:hidden">Save...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">
                              Save All Lessons
                            </span>
                            <span className="sm:hidden">Save</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {lessons.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Square className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Lessons Available
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Generate lessons first in the "AI Lessons" tab to use
                        the block editor.
                      </p>
                      <Button
                        onClick={() => setActiveTab('lessons')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Go to AI Lessons
                      </Button>
                    </div>
                  )}

                  {lessons.length > 0 ? (
                    <div className="space-y-6">
                      {lessons.map(lesson => (
                        <div
                          key={`${lesson.id}-${lesson.title}`}
                          className="bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-medium text-gray-900">
                                {lesson.title}
                              </h4>
                              <div className="flex gap-2">
                                {editingBlockLessonId === lesson.id ? (
                                  <Button
                                    onClick={() =>
                                      setEditingBlockLessonId(null)
                                    }
                                    variant="outline"
                                    size="sm"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Done Editing
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => startBlockEditing(lesson.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                  >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Edit Blocks
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {lesson.description}
                            </p>
                          </div>

                          <div className="p-4">
                            {editingBlockLessonId === lesson.id ? (
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                                    <Edit3 className="w-4 h-4" />
                                    <span className="font-medium">
                                      Editing Mode Active
                                    </span>
                                  </div>
                                  <p className="text-blue-700 text-xs mt-1">
                                    Click on any content block below to edit it.
                                    Use "Add Blocks" to add new content types.
                                  </p>
                                </div>

                                {contentBlocks[lesson.id] &&
                                contentBlocks[lesson.id].length > 0 ? (
                                  contentBlocks[lesson.id].map(
                                    (block, index) => (
                                      <div
                                        key={`${block.id}-${index}`}
                                        className="relative group border-2 border-dashed border-transparent hover:border-blue-300 rounded-lg transition-colors"
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="mt-3 cursor-grab text-gray-400 hover:text-gray-600">
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="relative">
                                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                  Click to edit
                                                </span>
                                              </div>
                                              {renderContentBlock(
                                                block,
                                                lesson.id
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex flex-col gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() =>
                                                moveContentBlock(
                                                  lesson.id,
                                                  block.id,
                                                  'up'
                                                )
                                              }
                                              className="text-gray-400 hover:text-blue-500 p-1"
                                              title="Move up"
                                              disabled={index === 0}
                                            >
                                              <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                moveContentBlock(
                                                  lesson.id,
                                                  block.id,
                                                  'down'
                                                )
                                              }
                                              className="text-gray-400 hover:text-blue-500 p-1"
                                              title="Move down"
                                              disabled={
                                                index ===
                                                contentBlocks[lesson.id]
                                                  .length -
                                                  1
                                              }
                                            >
                                              <ChevronDown className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                duplicateContentBlock(
                                                  lesson.id,
                                                  block.id
                                                )
                                              }
                                              className="text-gray-400 hover:text-green-500 p-1"
                                              title="Duplicate block"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                deleteContentBlock(
                                                  lesson.id,
                                                  block.id
                                                )
                                              }
                                              className="text-gray-400 hover:text-red-500 p-1"
                                              title="Delete this block"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                    <Square className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700 mb-2">
                                      No Content Blocks Yet
                                    </h4>
                                    <p className="text-sm mb-4">
                                      Start building your lesson by adding
                                      content blocks.
                                    </p>
                                    <Button
                                      onClick={() =>
                                        setShowContentLibrary(true)
                                      }
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Your First Block
                                    </Button>
                                  </div>
                                )}
                                {contentBlocks[lesson.id] &&
                                  contentBlocks[lesson.id].length > 0 && (
                                    <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
                                      <Button
                                        onClick={() =>
                                          setShowContentLibrary(true)
                                        }
                                        variant="outline"
                                        className="flex items-center gap-2"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Add More Blocks
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-line text-gray-700">
                                  {lesson.content}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Square className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Lessons to Edit
                      </h3>
                      <p className="text-gray-500">
                        Generate lessons first in the "AI Lessons" tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600" />
                    Lesson Preview
                  </h3>

                  {lessons.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          {courseTitle}
                        </h2>
                        <p className="text-gray-600 mb-6">
                          This course contains {lessons.length} comprehensive
                          lessons designed to take you from beginner to
                          proficient.
                        </p>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Course Lessons
                          </h3>
                          <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                              <div
                                key={`${lesson.id}-${index}`}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-purple-800">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={saveLessons}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Saving Lessons...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Save Lessons to Course
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Lessons to Preview
                      </h3>
                      <p className="text-gray-500">
                        Generate lessons first in the "AI Lessons" tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILessonCreator;
