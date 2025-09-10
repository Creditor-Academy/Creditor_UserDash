import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import bytezAPI from '../../services/bytezAPI';

const AIQuestionAnsweringTest = () => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const testQuestions = [
    "What is machine learning?",
    "How does photosynthesis work?",
    "Explain the concept of blockchain",
    "What are the benefits of renewable energy?",
    "How do neural networks function?"
  ];

  const askQuestion = async () => {
    if (!question.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      console.log('🧪 Testing Q&A with:', { question, context });
      
      const response = await bytezAPI.answerQuestionWithFlanT5(
        question,
        context,
        {
          max_new_tokens: 200,
          min_new_tokens: 50,
          temperature: 0.5
        }
      );

      console.log('✅ Q&A Response:', response);
      setResult(response);
    } catch (error) {
      console.error('❌ Q&A Test failed:', error);
      setResult({
        success: false,
        answer: `Error: ${error.message}`,
        model: 'error',
        question: question,
        context: context,
        error: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAnswer = () => {
    if (result?.answer) {
      navigator.clipboard.writeText(result.answer);
    }
  };

  const downloadAnswer = () => {
    if (result?.answer) {
      const content = `Question: ${result.question}\n\nAnswer: ${result.answer}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qa-test-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Q&A Test with Bytez.js
          </h1>
          <p className="text-gray-600">
            Testing the google/flan-t5-base model for question answering
          </p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Ask a Question</h2>
          
          {/* Sample Questions */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Try these sample questions:</p>
            <div className="flex flex-wrap gap-2">
              {testQuestions.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(sample)}
                  className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="3"
              />
            </div>

            {/* Context Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any relevant context or background information..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows="3"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={askQuestion}
              disabled={isGenerating || !question.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Answer...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ask Question
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI is thinking...
              </h3>
              <p className="text-gray-600">
                Processing your question with google/flan-t5-base model
              </p>
            </div>
          </motion.div>
        )}

        {/* Result Display */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.success ? 'Answer Generated' : 'Error Occurred'}
                  </h3>
                  {result.success && (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {result.confidence} confidence
                    </span>
                  )}
                  <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {result.model}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Question:</h4>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                {result.question}
              </p>
            </div>

            {/* Context Display */}
            {result.context && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Context:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm">
                  {result.context}
                </p>
              </div>
            )}

            {/* Answer Display */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Answer:</h4>
              <div className={`p-6 rounded-lg ${
                result.success 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                  {result.answer}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={copyAnswer}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Answer
              </button>
              <button
                onClick={downloadAnswer}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Q&A
              </button>
            </div>

            {/* Debug Info */}
            {result.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Debug Information:</h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                  {result.error}
                </pre>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Test
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Click on any sample question or type your own</li>
            <li>• Optionally provide context to help the AI understand better</li>
            <li>• Click "Ask Question" to generate an answer</li>
            <li>• The AI uses the google/flan-t5-base model via Bytez.js SDK</li>
            <li>• Results show success/failure status and model confidence</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionAnsweringTest;
