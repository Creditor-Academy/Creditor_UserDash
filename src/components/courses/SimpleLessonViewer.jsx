import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';
import Bytez from 'bytez.js';

const SimpleLessonViewer = () => {
  const [lesson, setLesson] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseInput, setCourseInput] = useState({
    title: '',
    subject: ''
  });

  // Generate lesson content using AI
  const generateLesson = async () => {
    if (!courseInput.title) {
      alert('Please enter a lesson title');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Try AI generation first
      const aiLesson = await generateAILesson(courseInput.title, courseInput.subject);
      setLesson(aiLesson);
    } catch (error) {
      console.error('AI generation failed:', error);
      // Use fallback content
      const fallbackLesson = generateFallbackLesson(courseInput.title, courseInput.subject);
      setLesson(fallbackLesson);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI-powered lesson content
  const generateAILesson = async (title, subject) => {
    const bytezKey = import.meta.env.VITE_BYTEZ_KEY || localStorage.getItem('BYTEZ_API_KEY');
    
    if (!bytezKey) {
      throw new Error('No API key available');
    }

    const sdk = new Bytez(bytezKey);
    const model = sdk.model("google/flan-t5-base");
    await model.create();

    const prompt = `Create a detailed lesson about "${title}" in ${subject || 'general education'}.

Format the response exactly like this:
HEADING: [Clear lesson title]
INTRODUCTION: [2-3 sentences introducing the topic]
POINT1: [First key concept or example]
POINT2: [Second key concept or example]  
POINT3: [Third key concept or example]
SUMMARY: [2-3 sentences summarizing what was learned]`;

    const { error, output } = await model.run(prompt, {
      max_new_tokens: 300,
      min_new_tokens: 100,
      temperature: 0.7
    });

    if (error || !output) {
      throw new Error('AI generation failed');
    }

    return parseAIResponse(output, title, subject);
  };

  // Parse AI response into structured lesson
  const parseAIResponse = (aiOutput, title, subject) => {
    const lines = aiOutput.split('\n').filter(line => line.trim());
    
    let heading = title;
    let introduction = '';
    let content = [];
    let summary = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('HEADING:')) {
        heading = trimmed.replace('HEADING:', '').trim();
      } else if (trimmed.startsWith('INTRODUCTION:')) {
        introduction = trimmed.replace('INTRODUCTION:', '').trim();
      } else if (trimmed.startsWith('POINT1:')) {
        content[0] = trimmed.replace('POINT1:', '').trim();
      } else if (trimmed.startsWith('POINT2:')) {
        content[1] = trimmed.replace('POINT2:', '').trim();
      } else if (trimmed.startsWith('POINT3:')) {
        content[2] = trimmed.replace('POINT3:', '').trim();
      } else if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.replace('SUMMARY:', '').trim();
      }
    });

    // Fallback if parsing incomplete
    if (!introduction) {
      introduction = `Welcome to this lesson on ${title}. We'll explore the key concepts and practical applications that will help you understand this topic thoroughly.`;
    }
    
    if (content.length === 0) {
      content = [
        `Understanding the fundamental concepts of ${title}`,
        `Exploring practical applications and real-world examples`,
        `Learning best practices and implementation strategies`
      ];
    }
    
    if (!summary) {
      summary = `You've successfully completed the lesson on ${title}. You now have a solid understanding of the key concepts and are ready to apply this knowledge.`;
    }

    return {
      id: Date.now(),
      heading,
      introduction,
      content,
      summary,
      duration: '15-20 min',
      subject: subject || 'General',
      isAIGenerated: true,
      createdAt: new Date().toISOString()
    };
  };

  // Generate fallback lesson content
  const generateFallbackLesson = (title, subject) => {
    return {
      id: Date.now(),
      heading: title,
      introduction: `Welcome to this comprehensive lesson on ${title}. In this session, we'll explore the fundamental concepts and practical applications that will help you master this important topic.`,
      content: [
        `Understanding the core principles and foundational concepts of ${title}`,
        `Exploring real-world applications and practical examples that demonstrate key concepts`,
        `Learning best practices, implementation strategies, and common approaches to success`
      ],
      summary: `Congratulations! You've successfully completed the lesson on ${title}. You now have a solid understanding of the key concepts and are well-equipped to apply this knowledge in practical situations.`,
      duration: '15-20 min',
      subject: subject || 'General',
      isAIGenerated: false,
      createdAt: new Date().toISOString()
    };
  };

  // Auto-generate a sample lesson on component mount
  useEffect(() => {
    setCourseInput({ title: 'Introduction to React', subject: 'Web Development' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Lesson Viewer</h1>
        <p className="text-gray-600">Generate and view AI-powered lesson content instantly</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Lesson Title (e.g., Introduction to React)"
            value={courseInput.title}
            onChange={(e) => setCourseInput({...courseInput, title: e.target.value})}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Subject (e.g., Web Development)"
            value={courseInput.subject}
            onChange={(e) => setCourseInput({...courseInput, subject: e.target.value})}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={generateLesson}
          disabled={isGenerating || !courseInput.title}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all font-semibold"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating Lesson...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Lesson
            </>
          )}
        </button>
      </div>

      {/* Generated Lesson Display */}
      {lesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border shadow-sm overflow-hidden"
        >
          {/* Lesson Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{lesson.heading}</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Generated
                </div>
                {lesson.isAIGenerated && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    AI Powered
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {lesson.duration}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {lesson.subject}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6 space-y-6">
            {/* Introduction */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Introduction
              </h3>
              <p className="text-blue-700">{lesson.introduction}</p>
            </div>

            {/* Content Points */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Key Learning Points</h3>
              <div className="space-y-3">
                {lesson.content.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 flex-1 pt-1">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Summary
              </h3>
              <p className="text-green-700">{lesson.summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Your Lesson</h3>
            <p className="text-gray-600">AI is creating structured lesson content with introduction, key points, and summary...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleLessonViewer;
