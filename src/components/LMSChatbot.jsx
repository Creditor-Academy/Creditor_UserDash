import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Bot,
  User,
  Loader2,
  HelpCircle,
  Sparkles,
  Zap,
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Search,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

const LMSChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hello! I'm your LMS assistant. I can help you with course creation, navigation, AI features, and any questions about the Creditor Academy platform. How can I assist you today?",
      timestamp: new Date(),
      reactions: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const quickQuestions = [
    'How do I create a course?',
    'What AI features are available?',
    'How do I manage students?',
    'How to use the course builder?',
    'What are the pricing plans?',
    'How do I upload content?',
    'Can you help me with assessment creation?',
    'How do I track student progress?',
  ];

  const aiFeatures = [
    {
      title: 'AI Course Creator',
      icon: Sparkles,
      description: 'Generate complete courses with AI',
      command: 'Create a course on machine learning',
    },
    {
      title: 'AI Content Generator',
      icon: GraduationCap,
      description: 'Create lessons and modules',
      command: 'Generate content for lesson 1',
    },
    {
      title: 'AI Image Generator',
      icon: Zap,
      description: 'Create course visuals',
      command: 'Generate an image for my course',
    },
  ];

  const getLMSContext = () => {
    return `You are an AI assistant for Creditor Academy LMS platform. Here's what you should know:

PLATFORM FEATURES:
- Course creation with AI assistance (AI Course Creator)
- AI-powered content generation (images, summaries, Q&A, outlines)
- Student management and enrollment
- Interactive course builder with drag-and-drop
- Assessment and quiz creation
- Progress tracking and analytics
- Multi-media content support
- Mobile-responsive design

AI FEATURES:
- AI Image Generation for course materials
- AI Text Summarization for content
- AI Course Outline Generator with topic-specific templates
- AI Content Q&A and search
- Smart course recommendations

COURSE CREATION PROCESS:
1. Click "Create Course" button
2. Choose between Manual or AI-Assisted creation
3. Fill in course details (title, description, objectives)
4. Use AI tools to generate content, images, and outlines
5. Add modules and lessons
6. Set pricing and enrollment options
7. Publish course

NAVIGATION:
- Dashboard: Overview of courses and analytics
- Courses: Manage all courses
- Students: View and manage enrollments
- Analytics: Track performance metrics
- Settings: Account and platform configuration

Always be helpful, concise, and specific to the LMS platform. If asked about technical issues, suggest contacting support.`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      reactions: [],
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Create chat session with LMS context
      const chatMessages = [
        { role: 'system', content: getLMSContext() },
        ...messages.slice(-5).map(msg => ({
          // Keep last 5 messages for context
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userMessage.content },
      ];

      // Simulate API call to backend
      // In a real implementation, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enhanced response generation based on user input
      let botResponse = generateSmartResponse(userMessage.content, messages);

      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: botResponse,
        timestamp: new Date(),
        reactions: [],
      };

      setMessages(prev => [...prev, botMessage]);

      // Generate follow-up suggestions
      if (messages.length < 5) {
        setSuggestions(generateSuggestions(userMessage.content));
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          "I'm experiencing some technical difficulties. Please try again in a moment or contact our support team for assistance.",
        timestamp: new Date(),
        reactions: [],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSmartResponse = (userInput, messageHistory) => {
    const lowerInput = userInput.toLowerCase();

    // Check for specific keywords and generate appropriate responses
    if (lowerInput.includes('create') && lowerInput.includes('course')) {
      return "To create a course, navigate to the 'Courses' section and click 'Create Course'. You can choose between manual creation or AI-assisted creation. With AI assistance, simply provide a course topic and let our AI generate a complete course outline for you!";
    }

    if (
      lowerInput.includes('ai') ||
      lowerInput.includes('artificial intelligence')
    ) {
      return 'Our LMS platform includes several AI features:\n• AI Course Creator - Generate complete courses\n• AI Content Generator - Create lessons and modules\n• AI Image Generator - Create course visuals\n• AI Assessment Builder - Generate quizzes and tests\n\nWould you like to learn more about any specific AI feature?';
    }

    if (lowerInput.includes('student') || lowerInput.includes('manage')) {
      return "To manage students:\n• Go to the 'Students' section in your dashboard\n• View enrolled students and their progress\n• Send messages to individual students or groups\n• Track performance and engagement metrics";
    }

    if (
      lowerInput.includes('assessment') ||
      lowerInput.includes('quiz') ||
      lowerInput.includes('test')
    ) {
      return "Creating assessments:\n• Navigate to your course and select 'Assessments'\n• Choose from multiple question types (MCQ, essay, true/false)\n• Use our AI to generate questions based on your content\n• Set grading criteria and feedback options";
    }

    if (lowerInput.includes('progress') || lowerInput.includes('track')) {
      return "To track student progress:\n• Access the 'Analytics' section\n• View detailed reports on student engagement\n• Monitor completion rates and assessment scores\n• Identify students who may need additional support";
    }

    // Default response
    return "Thank you for your question! I've processed your request and here's the information you need. If you need more specific details, please provide additional context or ask follow-up questions.";
  };

  const generateSuggestions = userInput => {
    const suggestions = [];

    if (
      userInput.toLowerCase().includes('create') ||
      userInput.toLowerCase().includes('course')
    ) {
      suggestions.push(
        'How do I customize my course settings?',
        'Can I add prerequisites?',
        'How do I set up course pricing?'
      );
    } else if (userInput.toLowerCase().includes('ai')) {
      suggestions.push(
        'Show me all AI features',
        'How do I use the AI course creator?',
        'Can AI generate assessments?'
      );
    } else if (
      userInput.toLowerCase().includes('student') ||
      userInput.toLowerCase().includes('manage')
    ) {
      suggestions.push(
        'How do I send messages to students?',
        'Can I track individual student progress?',
        'How do I manage student enrollments?'
      );
    } else {
      suggestions.push(
        'Can you show me the dashboard?',
        'How do I access analytics?',
        'What are the recent updates?'
      );
    }

    return suggestions.slice(0, 3);
  };

  const handleQuickQuestion = question => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = suggestion => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
    setSuggestions([]);
  };

  const handleReaction = (messageId, reaction) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = [...(msg.reactions || [])];
          const reactionIndex = newReactions.findIndex(
            r => r.type === reaction
          );
          if (reactionIndex >= 0) {
            // Remove reaction if already exists
            newReactions.splice(reactionIndex, 1);
          } else {
            // Add reaction
            newReactions.push({ type: reaction, timestamp: new Date() });
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendMessageFromDialog = message => {
    setInputMessage(message);
    sendMessage();
  };

  const handleFollowUp = messageContent => {
    setInputMessage(`Following up on: "${messageContent.substring(0, 60)}..."`);
    inputRef.current?.focus();
  };

  const formatTime = timestamp => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden ${
              isMinimized ? 'h-16' : 'h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <div>
                  <h3 className="font-semibold text-sm">LMS Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 h-80 bg-gray-50">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg relative ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot
                              size={16}
                              className="text-blue-600 mt-1 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                message.role === 'user'
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>

                        {/* Message actions for user messages */}
                        {message.role === 'user' && (
                          <div className="flex space-x-1 mt-2 absolute bottom-1 right-1">
                            <button
                              onClick={() => setInputMessage(message.content)}
                              className="p-1 rounded hover:bg-blue-200 text-xs"
                              title="Edit message"
                            >
                              <Send size={10} />
                            </button>
                          </div>
                        )}

                        {/* Message reactions */}
                        {message.role === 'assistant' && (
                          <div className="flex space-x-1 mt-2 absolute bottom-1 right-1">
                            <button
                              onClick={() => handleReaction(message.id, 'copy')}
                              className="p-1 rounded hover:bg-gray-200 text-xs"
                              title="Copy message"
                            >
                              <Copy size={10} />
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, 'like')}
                              className={`p-1 rounded text-xs ${message.reactions?.some(r => r.type === 'like') ? 'text-green-600' : 'text-gray-400'}`}
                              title="Like this response"
                            >
                              <ThumbsUp size={10} />
                            </button>
                            <button
                              onClick={() =>
                                handleReaction(message.id, 'dislike')
                              }
                              className={`p-1 rounded text-xs ${message.reactions?.some(r => r.type === 'dislike') ? 'text-red-600' : 'text-gray-400'}`}
                              title="Dislike this response"
                            >
                              <ThumbsDown size={10} />
                            </button>
                            <button
                              onClick={() => handleFollowUp(message.content)}
                              className="p-1 rounded hover:bg-gray-200 text-xs"
                              title="Ask follow-up"
                            >
                              <MessageCircle size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white p-3 rounded-lg rounded-bl-sm shadow-sm border max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot size={16} className="text-blue-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions and AI Features */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 border-t bg-white">
                    <p className="text-xs text-gray-600 mb-2 flex items-center">
                      <HelpCircle size={12} className="mr-1" />
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 mb-2 flex items-center">
                      <Sparkles size={12} className="mr-1" />
                      AI Features:
                    </p>
                    <div className="flex gap-2 mb-3">
                      {aiFeatures.map((feature, index) => (
                        <button
                          key={index}
                          onClick={() => setInputMessage(feature.command)}
                          className="flex items-center text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg px-2 py-1 transition-all hover:from-blue-100 hover:to-purple-100"
                        >
                          <feature.icon
                            size={12}
                            className="mr-1 text-blue-600"
                          />
                          {feature.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && showSuggestions && (
                  <div className="px-4 py-2 border-t bg-blue-50">
                    <p className="text-xs text-blue-700 mb-2 flex items-center">
                      <Sparkles size={12} className="mr-1" />
                      You might also ask:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors flex items-center"
                        >
                          <Search size={10} className="mr-1" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the LMS..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md"
                    >
                      {isTyping ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Powered by AI</span>
                    <span>Press Enter to send</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LMSChatbot;
