import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import bytezAPI from '../../services/bytezAPI';

const BytezTestPanel = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      id: 'connection',
      name: 'API Connection Test',
      description: 'Test basic connection to Bytez API'
    },
    {
      id: 'image',
      name: 'Image Generation Test',
      description: 'Test dreamlike-art image generation'
    },
    {
      id: 'summarize',
      name: 'Text Summarization Test',
      description: 'Test text summarization capability'
    },
    {
      id: 'qa',
      name: 'Question Answering Test',
      description: 'Test Q&A and content search'
    },
    {
      id: 'outline',
      name: 'Course Outline Test',
      description: 'Test course outline generation'
    }
  ];

  const runTest = async (testId) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { status: 'running', message: 'Testing...' }
    }));

    try {
      let result;
      
      switch (testId) {
        case 'connection':
          result = await bytezAPI.testConnection();
          break;
          
        case 'image':
          result = await bytezAPI.generateImage('a beautiful sunset over mountains', {
            width: 512,
            height: 512
          });
          break;
          
        case 'summarize':
          result = await bytezAPI.summarizeText(
            'React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta and the community. React allows developers to create reusable UI components and manage application state efficiently.',
            { max_length: 50 }
          );
          break;
          
        case 'qa':
          result = await bytezAPI.answerQuestion('What is React?');
          break;
          
        case 'outline':
          result = await bytezAPI.generateCourseOutline({
            title: 'Introduction to React',
            description: 'Learn React fundamentals',
            difficulty: 'beginner',
            duration: '4'
          });
          break;
          
        default:
          throw new Error('Unknown test');
      }

      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 'success',
          message: 'Test passed successfully',
          data: result
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 'error',
          message: error.message || 'Test failed',
          error
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    for (const test of tests) {
      await runTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <TestTube className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Bytez API Test Suite</h2>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>API Key:</strong> 936e7d17db26fa9d6e0fd250eb6ed566
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Testing connection to Bytez API with your provided key
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mb-6"
        >
          {isRunning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => {
          const result = testResults[test.id];
          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${getStatusColor(result?.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result?.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => runTest(test.id)}
                  disabled={result?.status === 'running'}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Test
                </button>
              </div>
              
              {result && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm font-medium mb-1">Result:</p>
                  <p className="text-sm text-gray-700">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        View Response Data
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {result.error && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer">
                        View Error Details
                      </summary>
                      <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BytezTestPanel;
