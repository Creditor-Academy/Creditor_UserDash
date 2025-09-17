import React, { useState } from 'react';
import { BookOpen, Play, Eye, Sparkles } from 'lucide-react';

const ModernLessonDemo = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());

  // Sample lesson data for demonstration
  const sampleLesson = {
    id: 'demo-lesson-1',
    title: 'Introduction to Modern Web Development',
    description: 'Learn the fundamentals of modern web development including React, TypeScript, and best practices for building scalable applications.',
    duration: '25 min',
    instructor: 'Sarah Johnson',
    createdAt: new Date().toISOString(),
    content: {
      introduction: `Welcome to this comprehensive lesson on modern web development. In this session, we'll explore the fundamental concepts that power today's web applications, dive into practical implementations, and discover best practices used by industry professionals. Whether you're a beginner looking to understand the basics or an experienced developer seeking to modernize your skills, this lesson will provide valuable insights and actionable knowledge.`,
      objectives: [
        'Understand the core principles of modern web development',
        'Learn about component-based architecture and its benefits',
        'Master TypeScript fundamentals for type-safe development',
        'Explore state management patterns and best practices',
        'Implement responsive design using modern CSS techniques',
        'Apply security considerations in web application development'
      ],
      mainContent: [
        {
          point: 'Component-Based Architecture',
          description: 'Modern web development revolves around breaking down complex user interfaces into smaller, reusable components. This approach promotes code reusability, maintainability, and easier testing. Components encapsulate their own state and logic, making applications more modular and scalable.',
          example: 'Think of a social media feed where each post is a component that can display different content but maintains the same structure and behavior.'
        },
        {
          point: 'TypeScript for Type Safety',
          description: 'TypeScript adds static type checking to JavaScript, helping catch errors at compile time rather than runtime. This leads to more robust applications, better developer experience with improved autocomplete and refactoring capabilities, and clearer code documentation.',
          example: 'Defining interfaces for API responses ensures that your components receive the expected data structure, preventing common runtime errors.'
        },
        {
          point: 'State Management Patterns',
          description: 'Managing application state effectively is crucial for complex applications. Modern patterns include local component state, context for shared state, and dedicated state management libraries for complex scenarios. Understanding when and how to use each approach is key to building maintainable applications.',
          example: 'Using React Context for theme management while keeping form data in local component state provides the right balance of accessibility and isolation.'
        },
        {
          point: 'Responsive Design Principles',
          description: 'Creating applications that work seamlessly across all device sizes requires understanding flexible layouts, relative units, and modern CSS features. Mobile-first design approaches and progressive enhancement ensure optimal user experiences regardless of device capabilities.',
          example: 'Using CSS Grid and Flexbox together allows for complex layouts that automatically adapt to different screen sizes without media query complexity.'
        }
      ],
      multimedia: {
        image: {
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000',
          alt: 'Modern web development workspace with multiple screens showing code',
          caption: 'A modern development environment showcasing the tools and technologies covered in this lesson'
        },
        video: {
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          duration: '5:30'
        }
      },
      qa: [
        {
          question: 'What are the main benefits of using TypeScript over JavaScript?',
          answer: 'TypeScript provides static type checking, better IDE support with autocomplete and refactoring, early error detection, improved code documentation, and better team collaboration through clearly defined interfaces and types.',
          difficulty: 'easy'
        },
        {
          question: 'When should you use Context vs local state in React?',
          answer: 'Use local state for data that only affects a single component or its immediate children. Use Context for data that needs to be shared across multiple components at different levels of the component tree, such as user authentication, theme settings, or language preferences.',
          difficulty: 'medium'
        },
        {
          question: 'How do you implement responsive design without relying heavily on media queries?',
          answer: 'Use intrinsic web design principles: flexible grid systems (CSS Grid with fr units), flexible units (rem, em, vw, vh), container queries, clamp() function for fluid typography, and modern CSS features like aspect-ratio. This creates layouts that naturally adapt to their containers.',
          difficulty: 'hard'
        }
      ],
      keyTakeaways: [
        'Component-based architecture improves code reusability and maintainability',
        'TypeScript helps catch errors early and improves developer productivity',
        'Choose the right state management approach based on data sharing requirements',
        'Modern CSS features enable responsive design with less complexity',
        'Security should be considered from the beginning of development',
        'Performance optimization is an ongoing process, not a one-time task'
      ],
      summary: `You've successfully completed this comprehensive introduction to modern web development. You now understand the fundamental concepts of component-based architecture, the benefits of TypeScript for building robust applications, effective state management strategies, and responsive design principles. These skills form the foundation for building scalable, maintainable web applications that provide excellent user experiences across all devices.`
    },
    metadata: {
      aiGenerated: false,
      generatedAt: new Date().toISOString(),
      contentTypes: ['text', 'image', 'video', 'qa']
    }
  };

  const handleSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            New Preview System
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Lesson Preview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience our redesigned lesson preview system with trackable navigation, 
            smooth scrolling, and a modern full-screen interface designed for optimal learning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Trackable Navigation</h3>
            <p className="text-gray-600">
              Left-hand vertical navigation panel with section indicators that fill as you progress through the content.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smooth Scrolling</h3>
            <p className="text-gray-600">
              Seamless navigation between sections with automatic scroll tracking and visual feedback.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Rich Content</h3>
            <p className="text-gray-600">
              Support for multimedia content, interactive Q&A, objectives, takeaways, and comprehensive summaries.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Try the Preview</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Click the button below to experience the new lesson preview system with a sample lesson 
            that demonstrates all the features and capabilities.
          </p>
          
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5" />
            Open Lesson Preview
          </button>

          {completedSections.size > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                Great! You've completed {completedSections.size} section{completedSections.size !== 1 ? 's' : ''} in the demo.
              </p>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Technical Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">TypeScript</div>
              <p className="text-gray-600 text-sm">Built with full type safety</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">Framer Motion</div>
              <p className="text-gray-600 text-sm">Smooth animations & transitions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">Intersection Observer</div>
              <p className="text-gray-600 text-sm">Accurate scroll tracking</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">Responsive</div>
              <p className="text-gray-600 text-sm">Full-screen adaptive design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Lesson Preview Modal - Disabled */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Lesson Preview Disabled</h3>
            <p className="text-gray-600 mb-4">Modern lesson preview functionality has been removed.</p>
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernLessonDemo;