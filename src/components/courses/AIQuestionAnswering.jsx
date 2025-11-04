import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Copy,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Brain,
  FileText,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';
import { useAIFeatureAccess, withAIFeatureAccess } from './AIFeatureAccess';

const AIQuestionAnswering = ({ onFeatureUse, usageInfo }) => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [showContext, setShowContext] = useState(false);
  const { hasAccess, trackUsage } = useAIFeatureAccess();
  const questionInputRef = useRef(null);

  // Error boundary wrapper
  if (!hasAccess) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
        <p className="text-gray-600">AI Question Answering access required</p>
      </div>
    );
  }

  const sampleQuestions = [
    'What is machine learning?',
    'How does photosynthesis work?',
    'Explain the concept of blockchain',
    'What are the benefits of renewable energy?',
    'How do neural networks function?',
  ];

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setIsGenerating(true);

      // Track feature usage
      if (trackUsage) {
        trackUsage('QUESTION_ANSWERING');
      }

      // AI Q&A functionality removed - Bytez API no longer used
      const newQA = {
        id: Date.now(),
        question: question,
        answer:
          'AI Question Answering feature is currently unavailable. This feature has been deprecated.',
        context: context || null,
        model: 'unavailable',
        success: false,
        confidence: 'none',
        createdAt: new Date().toISOString(),
        isError: true,
      };

      setQaHistory([newQA, ...qaHistory]);

      // Clear inputs
      setQuestion('');
      setContext('');

      if (onFeatureUse) {
        onFeatureUse('QUESTION_ANSWERING', newQA);
      }
    } catch (error) {
      console.error('Question answering failed:', error);
      const errorQA = {
        id: Date.now(),
        question: question,
        answer: `Error: ${error.message}`,
        context: context || null,
        model: 'error',
        success: false,
        confidence: 'none',
        createdAt: new Date().toISOString(),
        isError: true,
      };
      setQaHistory([errorQA, ...qaHistory]);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteQA = id => {
    setQaHistory(qaHistory.filter(qa => qa.id !== id));
  };

  const copyAnswer = answer => {
    navigator.clipboard.writeText(answer);
  };

  const downloadAnswer = (question, answer) => {
    const content = `Question: ${question}\n\nAnswer: ${answer}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa-${question.slice(0, 20).replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertIntoCourse = qa => {
    console.log('Inserting Q&A into course:', qa);
  };

  const useSampleQuestion = sampleQuestion => {
    setQuestion(sampleQuestion);
    questionInputRef.current?.focus();
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      askQuestion();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Input Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-600" />
          AI Question Answering
        </h3>

        {/* Sample Questions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Try these sample questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sample, index) => (
              <button
                key={index}
                onClick={() => useSampleQuestion(sample)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask your question
            </label>
            <textarea
              ref={questionInputRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here... (Ctrl+Enter to submit)"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows="3"
            />
          </div>

          {/* Context Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
            >
              <FileText className="w-4 h-4" />
              {showContext ? 'Hide Context' : 'Add Context (Optional)'}
            </button>
          </div>

          {/* Context Input */}
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provide context (optional)
                </label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Provide any relevant context or background information that might help answer your question..."
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows="4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={askQuestion}
            disabled={isGenerating || !question.trim()}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <LoadingBuffer
                type="ai"
                message="Analyzing your question..."
                className="text-white"
              />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask Question
              </>
            )}
          </button>
        </div>
      </div>

      {/* Q&A History */}
      {qaHistory.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-600" />
            Question & Answer History
          </h4>

          {qaHistory.map(qa => (
            <motion.div
              key={qa.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg border p-6 ${qa.isError ? 'border-red-200' : 'border-gray-200'}`}
            >
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">Question</h5>
                    <p className="text-gray-700">{qa.question}</p>
                  </div>
                </div>

                {qa.context && (
                  <div className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Context provided:
                    </p>
                    <p className="text-sm text-gray-600">{qa.context}</p>
                  </div>
                )}
              </div>

              {/* Answer */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${qa.isError ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {qa.isError ? <AlertCircle /> : <CheckCircle />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">Answer</h5>
                      {qa.success && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          {qa.confidence} confidence
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {qa.model}
                      </span>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${qa.isError ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {qa.answer}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  {new Date(qa.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => insertIntoCourse(qa)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    title="Insert into Course"
                  >
                    Insert
                  </button>
                  <button
                    onClick={() => copyAnswer(qa.answer)}
                    className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                    title="Copy Answer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadAnswer(qa.question, qa.answer)}
                    className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                    title="Download Q&A"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQA(qa.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {qaHistory.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No questions asked yet</p>
          <p className="text-sm">
            Ask your first question above to get started with AI-powered answers
          </p>
        </div>
      )}
    </div>
  );
};

// Export with AI Feature Access protection
export default withAIFeatureAccess(AIQuestionAnswering, 'QUESTION_ANSWERING');
