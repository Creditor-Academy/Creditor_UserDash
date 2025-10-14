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
  HelpCircle
} from 'lucide-react';

const LMSChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your LMS assistant. I can help you with course creation, navigation, AI features, and any questions about the Creditor Academy platform. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    "How do I create a course?",
    "What AI features are available?",
    "How do I manage students?",
    "How to use the course builder?",
    "What are the pricing plans?",
    "How do I upload content?"
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Create chat session with LMS context
      const chatMessages = [
        { role: 'system', content: getLMSContext() },
        ...messages.slice(-5).map(msg => ({ // Keep last 5 messages for context
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage.content }
      ];

      // AI chat functionality removed - Bytez API no longer used
      // Provide helpful fallback response
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'The AI chatbot feature is currently unavailable. For assistance, please contact our support team or check the Help section.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I\'m experiencing some technical difficulties. Please try again in a moment or contact our support team for assistance.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
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
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 border-t bg-white">
                    <p className="text-xs text-gray-600 mb-2 flex items-center">
                      <HelpCircle size={12} className="mr-1" />
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-1">
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
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the LMS..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isTyping ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
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
