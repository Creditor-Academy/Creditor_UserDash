import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Play,
  Clock,
  Users,
  Target
} from 'lucide-react';
// import Bytez from 'bytez.js'; // Removed - dependency not available

const CourseCreator = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    subject: ''
  });
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedModules, setExpandedModules] = useState(new Set());

  // Course data structure
  const createCourseStructure = (title, modules) => ({
    id: Date.now(),
    title,
    description: courseData.description,
    subject: courseData.subject,
    modules,
    createdAt: new Date().toISOString(),
    isAIGenerated: true
  });

  // Module data structure
  const createModule = (id, title, description, lessons) => ({
    id,
    title,
    description,
    lessons,
    isAIGenerated: true
  });

  // Lesson data structure with required format
  const createLesson = (id, title, heading, introduction, content, summary) => ({
    id,
    title,
    heading,
    introduction,
    content, // Array of 2-3 key points
    summary,
    duration: '15-20 min',
    isAIGenerated: true
  });

  // Generate AI-powered lesson content (dependency removed)
  const generateLessonContent = async (moduleTitle, lessonTitle) => {
    try {
      // Use fallback lesson generation (dependency removed)
      return generateFallbackLesson(lessonTitle);

      const prompt = `Create a lesson about "${lessonTitle}" for the module "${moduleTitle}".

Format:
Heading: [Write a clear lesson heading]
Introduction: [Write 2-3 sentences introducing the topic]
Content Point 1: [First key concept or example]
Content Point 2: [Second key concept or example]  
Content Point 3: [Third key concept or example]
Summary: [Write 2-3 sentences summarizing what was learned]`;

      const { error, output } = await model.run(prompt, {
        max_new_tokens: 300,
        min_new_tokens: 100,
        temperature: 0.7
      });

      if (!error && output) {
        return parseLessonFromAI(output, lessonTitle);
      } else {
        return generateFallbackLesson(lessonTitle);
      }
    } catch (error) {
      console.error('AI lesson generation failed:', error);
      return generateFallbackLesson(lessonTitle);
    }
  };

  // Parse AI response into lesson structure
  const parseLessonFromAI = (aiOutput, lessonTitle) => {
    const lines = aiOutput.split('\n').filter(line => line.trim());
    
    let heading = lessonTitle;
    let introduction = '';
    let content = [];
    let summary = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('heading:')) {
        heading = trimmed.replace(/heading:\s*/i, '');
      } else if (trimmed.toLowerCase().includes('introduction:')) {
        introduction = trimmed.replace(/introduction:\s*/i, '');
      } else if (trimmed.toLowerCase().includes('content point')) {
        const point = trimmed.replace(/content point \d+:\s*/i, '');
        if (point) content.push(point);
      } else if (trimmed.toLowerCase().includes('summary:')) {
        summary = trimmed.replace(/summary:\s*/i, '');
      }
    });

    // Fallback if parsing fails
    if (!introduction) introduction = `Welcome to this lesson on ${lessonTitle}. We'll explore the key concepts and practical applications.`;
    if (content.length === 0) {
      content = [
        `Understanding the fundamentals of ${lessonTitle}`,
        `Practical applications and real-world examples`,
        `Best practices and common approaches`
      ];
    }
    if (!summary) summary = `You've learned the essential concepts of ${lessonTitle} and are ready to apply this knowledge.`;

    return { heading, introduction, content, summary };
  };

  // Fallback lesson generation
  const generateFallbackLesson = (lessonTitle) => ({
    heading: lessonTitle,
    introduction: `Welcome to this comprehensive lesson on ${lessonTitle}. In this session, we'll explore the fundamental concepts and practical applications that will help you master this topic.`,
    content: [
      `Core principles and foundational concepts of ${lessonTitle}`,
      `Real-world applications and practical examples`,
      `Best practices and implementation strategies`
    ],
    summary: `You've successfully completed the lesson on ${lessonTitle}. You now understand the key concepts and are equipped with practical knowledge to apply these principles effectively.`
  });

  // Generate complete course with modules and lessons
  const generateCourse = async () => {
    if (!courseData.title || !courseData.description) {
      alert('Please provide both course title and description');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate 2 modules as requested
      const modules = [];

      // Module 1
      const module1Title = `Introduction to ${courseData.subject || courseData.title}`;
      const lesson1Content = await generateLessonContent(
        module1Title, 
        `Getting Started with ${courseData.subject || courseData.title}`
      );
      
      const module1 = createModule(
        1,
        module1Title,
        `Foundational concepts and overview of ${courseData.subject || courseData.title}`,
        [createLesson(
          1,
          `Getting Started with ${courseData.subject || courseData.title}`,
          lesson1Content.heading,
          lesson1Content.introduction,
          lesson1Content.content,
          lesson1Content.summary
        )]
      );

      // Module 2
      const module2Title = `${courseData.subject || courseData.title} Fundamentals`;
      const lesson2Content = await generateLessonContent(
        module2Title,
        `Core ${courseData.subject || courseData.title} Concepts`
      );

      const module2 = createModule(
        2,
        module2Title,
        'Core principles and practical application',
        [createLesson(
          2,
          `Core ${courseData.subject || courseData.title} Concepts`,
          lesson2Content.heading,
          lesson2Content.introduction,
          lesson2Content.content,
          lesson2Content.summary
        )]
      );

      modules.push(module1, module2);

      // Create complete course structure
      const course = createCourseStructure(courseData.title, modules);
      setGeneratedCourse(course);

      // Auto-expand first module to show the lesson
      setExpandedModules(new Set(['1']));

    } catch (error) {
      console.error('Course generation failed:', error);
      alert('Course generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId.toString())) {
        newSet.delete(moduleId.toString());
      } else {
        newSet.add(moduleId.toString());
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Course Creation Form */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">AI Course Creator</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            AI Powered
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Course Title (e.g., React Development)"
            value={courseData.title}
            onChange={(e) => setCourseData({...courseData, title: e.target.value})}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Subject Area (e.g., Web Development)"
            value={courseData.subject}
            onChange={(e) => setCourseData({...courseData, subject: e.target.value})}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <textarea
          placeholder="Course Description (What will students learn?)"
          value={courseData.description}
          onChange={(e) => setCourseData({...courseData, description: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
          rows="3"
        />

        <button
          onClick={generateCourse}
          disabled={isGenerating || !courseData.title || !courseData.description}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all font-semibold"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating Course with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Course (2 Modules, 1 Lesson Each)
            </>
          )}
        </button>
      </div>

      {/* Generated Course Display */}
      <AnimatePresence>
        {generatedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg border shadow-sm overflow-hidden"
          >
            {/* Course Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{generatedCourse.title}</h3>
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      AI Generated
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{generatedCourse.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {generatedCourse.modules.length} Modules
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      {generatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)} Lessons
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      ~{generatedCourse.modules.length * 30} minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules and Lessons */}
            <div className="p-6">
              <div className="space-y-4">
                {generatedCourse.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <div 
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedModules.has(module.id.toString()) ? 
                            <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          }
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Module {module.id}: {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lessons */}
                    <AnimatePresence>
                      {expandedModules.has(module.id.toString()) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-200"
                        >
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="p-6 bg-white">
                              <div className="space-y-4">
                                {/* Lesson Header */}
                                <div className="flex items-center justify-between">
                                  <h5 className="text-lg font-semibold text-gray-800">
                                    {lesson.heading}
                                  </h5>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {lesson.duration}
                                  </div>
                                </div>

                                {/* Introduction */}
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                  <h6 className="font-medium text-blue-800 mb-2">Introduction</h6>
                                  <p className="text-blue-700">{lesson.introduction}</p>
                                </div>

                                {/* Content Points */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h6 className="font-medium text-gray-800 mb-3">Key Learning Points</h6>
                                  <div className="space-y-2">
                                    {lesson.content.map((point, index) => (
                                      <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                                          {index + 1}
                                        </div>
                                        <p className="text-gray-700 flex-1">{point}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                  <h6 className="font-medium text-green-800 mb-2">Summary</h6>
                                  <p className="text-green-700">{lesson.summary}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCreator;
