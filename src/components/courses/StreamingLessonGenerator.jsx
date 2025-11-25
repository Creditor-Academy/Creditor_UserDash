/**
 * Streaming Lesson Generator Component
 * Provides real-time streaming course generation with LangChain Bytez
 */

import React, { useState, useEffect } from 'react';
import { langChainBytezService } from '../../services/langchainBytez';
import { Sparkles, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const StreamingLessonGenerator = ({
  title,
  description,
  subject,
  apiKey,
  onComplete,
  onError,
}) => {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, streaming, complete, error
  const [progress, setProgress] = useState(0);

  const startStreaming = async () => {
    if (!apiKey) {
      onError?.('No API key available');
      return;
    }

    setIsStreaming(true);
    setStatus('streaming');
    setStreamingContent('');
    setProgress(0);

    try {
      let fullContent = '';
      let chunkCount = 0;
      const expectedChunks = 50; // Estimate for progress

      await langChainBytezService.streamCourseGeneration(
        title,
        description,
        subject,
        apiKey,
        (chunk, accumulated) => {
          setStreamingContent(accumulated);
          chunkCount++;
          setProgress(Math.min((chunkCount / expectedChunks) * 100, 95));
          fullContent = accumulated;
        }
      );

      setProgress(100);
      setStatus('complete');
      setIsStreaming(false);
      onComplete?.(fullContent);
    } catch (error) {
      console.error('Streaming generation failed:', error);
      setStatus('error');
      setIsStreaming(false);
      onError?.(error.message);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'streaming':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'streaming':
        return 'Generating course content...';
      case 'complete':
        return 'Course generation complete!';
      case 'error':
        return 'Generation failed';
      default:
        return 'Ready to generate';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">
                Streaming Course Generator
              </h3>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>

          {status === 'idle' && (
            <button
              onClick={startStreaming}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Streaming
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isStreaming && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Streaming Content Display */}
      {streamingContent && (
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {streamingContent}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {status === 'complete' && (
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onComplete?.(streamingContent)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Use This Content
          </button>
          <button
            onClick={() => {
              setStatus('idle');
              setStreamingContent('');
              setProgress(0);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Generate New
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">
              Failed to generate course content. Please try again or check your
              API key.
            </p>
            <button
              onClick={() => {
                setStatus('idle');
                setStreamingContent('');
                setProgress(0);
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingLessonGenerator;
