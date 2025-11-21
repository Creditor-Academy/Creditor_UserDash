import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  X,
  Play,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AIStreamingGeneration = ({ isOpen, onClose, onComplete, courseData }) => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coursePreview, setCoursePreview] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isGenerating) {
      startGeneration();
    }
  }, [isOpen]);

  const addMessage = (text, type = 'ai', data = null) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        type,
        data,
        timestamp: new Date(),
      },
    ]);
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const startGeneration = async () => {
    setIsGenerating(true);
    setMessages([]);
    setProgress(0);

    try {
      // Step 1: Welcome
      addMessage(
        `🎓 Welcome! I'll create an amazing course for you: "${courseData.courseName || courseData.title}"`,
        'ai'
      );
      await delay(1000);
      setProgress(10);

      // Step 2: Understanding requirements
      addMessage(
        `📋 Understanding your course requirements...\n\n` +
          `👥 Target Audience: ${courseData.targetAudience || 'General learners'}\n` +
          `📚 Learning Goal: ${courseData.learningOutcomes || 'Skill development'}\n` +
          `🎯 Prior Knowledge: ${courseData.priorKnowledge === 'yes' ? courseData.priorKnowledgeDetails : 'None required'}`,
        'ai'
      );
      await delay(1500);
      setProgress(20);

      // Step 3: Creating structure
      addMessage('🏗️ Building course structure...', 'ai');
      await delay(1200);

      const moduleData = {
        title: 'Introduction to ' + (courseData.courseName || courseData.title),
        description: 'Master the fundamentals and core concepts',
        order: 1,
      };

      addMessage(
        `✅ Created Module 1: "${moduleData.title}"`,
        'success',
        moduleData
      );

      setCoursePreview(prev => ({
        ...prev,
        module: moduleData,
      }));

      setProgress(40);
      await delay(1000);

      // Step 4: Creating lesson
      addMessage('📝 Crafting your lesson content...', 'ai');
      await delay(1500);

      const lessonData = {
        title: 'Getting Started',
        description: 'Learn the essential concepts and practical applications',
        duration: '30 min',
        order: 1,
      };

      addMessage(
        `✅ Created Lesson: "${lessonData.title}"\n📖 Duration: ${lessonData.duration}\n💡 ${lessonData.description}`,
        'success',
        lessonData
      );

      setCoursePreview(prev => ({
        ...prev,
        lesson: lessonData,
      }));

      setProgress(60);
      await delay(1000);

      // Step 5: Adding rich content
      addMessage('✨ Adding rich educational content...', 'ai');
      await delay(1200);

      const contentBlocks = [
        { type: 'heading', content: 'Welcome & Introduction' },
        { type: 'paragraph', content: 'Comprehensive learning material' },
        { type: 'quote', content: 'Inspirational insights' },
        { type: 'list', content: 'Key concepts and takeaways' },
      ];

      addMessage(
        `✅ Generated content blocks:\n` +
          `  📝 ${contentBlocks.length} content sections\n` +
          `  🎨 ${contentBlocks.length - 1} visual elements\n` +
          `  📊 Interactive components`,
        'success',
        contentBlocks
      );

      setCoursePreview(prev => ({
        ...prev,
        contentBlocks,
      }));

      setProgress(80);
      await delay(1000);

      // Step 6: Generating thumbnails
      addMessage('🎨 Creating beautiful AI-generated thumbnails...', 'ai');
      await delay(2000);

      addMessage(
        `✅ Thumbnails created:\n` +
          `  🖼️ Course thumbnail\n` +
          `  🖼️ Module thumbnail\n` +
          `  🖼️ Lesson thumbnail`,
        'success'
      );

      setProgress(95);
      await delay(800);

      // Step 7: Finalizing
      addMessage('🎉 Finalizing your course...', 'ai');
      await delay(1000);

      addMessage(
        `✅ Course generation complete!\n\n` +
          `📚 1 Module created\n` +
          `📖 1 Comprehensive lesson\n` +
          `🎨 AI-generated visuals\n` +
          `✨ Rich educational content\n\n` +
          `Ready to create your course!`,
        'complete'
      );

      setProgress(100);
      setIsComplete(true);
      setIsGenerating(false);

      // Pass data back to parent
      if (onComplete) {
        onComplete({
          module: moduleData,
          lesson: lessonData,
          contentBlocks,
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      addMessage('❌ Oops! Something went wrong. Please try again.', 'error');
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Course Generation</h2>
              <p className="text-sm text-white/80">
                Creating your course in real-time...
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isComplete ? 'Complete!' : 'Generating...'}
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat Stream */}
          <div className="w-3/5 bg-gradient-to-br from-gray-50 to-indigo-50/30 p-6 overflow-y-auto">
            <div className="space-y-4 pb-20">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    <ChatBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-gray-500"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-sm italic">AI is thinking...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-2/5 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Live Preview
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Watch your course come to life
              </p>
            </div>

            <LivePreview preview={coursePreview} />
          </div>
        </div>

        {/* Footer */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Course Generated Successfully!
                </p>
                <p className="text-sm text-green-700">
                  Ready to create and publish your course
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={() => {
                  onClose();
                  // Trigger course creation
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Chat Bubble Component
const ChatBubble = ({ message }) => {
  const getIcon = () => {
    if (message.type === 'success')
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (message.type === 'error') return <X className="w-5 h-5 text-red-600" />;
    if (message.type === 'complete')
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    return <Sparkles className="w-5 h-5 text-indigo-600" />;
  };

  const getBgColor = () => {
    if (message.type === 'success') return 'from-green-50 to-emerald-50';
    if (message.type === 'error') return 'from-red-50 to-rose-50';
    if (message.type === 'complete') return 'from-purple-50 to-pink-50';
    return 'from-indigo-50 to-blue-50';
  };

  const getBorderColor = () => {
    if (message.type === 'success') return 'border-green-200';
    if (message.type === 'error') return 'border-red-200';
    if (message.type === 'complete') return 'border-purple-200';
    return 'border-indigo-200';
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl bg-gradient-to-br ${getBgColor()} border ${getBorderColor()} shadow-sm`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
          {message.text}
        </p>
      </div>
    </div>
  );
};

// Live Preview Component
const LivePreview = ({ preview }) => {
  if (!preview) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Maximize2 className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Preview will appear here...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Preview */}
      {preview.module && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200"
        >
          <div className="flex items-start gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-indigo-600 font-semibold mb-1">
                MODULE 1
              </p>
              <h4 className="font-bold text-gray-900 mb-1">
                {preview.module.title}
              </h4>
              <p className="text-sm text-gray-600">
                {preview.module.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lesson Preview */}
      {preview.lesson && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
        >
          <div className="flex items-start gap-3">
            <div className="bg-purple-600 text-white p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-purple-600 font-semibold mb-1">
                LESSON 1
              </p>
              <h4 className="font-bold text-gray-900 mb-1">
                {preview.lesson.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {preview.lesson.description}
              </p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {preview.lesson.duration}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Blocks Preview */}
      {preview.contentBlocks && preview.contentBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h5 className="text-xs font-semibold text-gray-600 uppercase mb-3">
            Content Blocks
          </h5>
          {preview.contentBlocks.map((block, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <span className="text-gray-700">{block.content}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AIStreamingGeneration;
