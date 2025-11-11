/**
 * Batch Lesson Generator Component
 * Generates multiple lessons simultaneously using LangChain Bytez batch operations
 */

import React, { useState } from 'react';
import { langChainBytezService } from '../../services/langchainBytez';
import { Users, CheckCircle, AlertCircle, Clock, Sparkles } from 'lucide-react';

const BatchLessonGenerator = ({ 
  lessonRequests, 
  apiKey, 
  onComplete, 
  onProgress 
}) => {
  const [batchStatus, setBatchStatus] = useState('idle'); // idle, processing, complete, error
  const [completedLessons, setCompletedLessons] = useState([]);
  const [failedLessons, setFailedLessons] = useState([]);
  const [processingTime, setProcessingTime] = useState(0);

  const startBatchGeneration = async () => {
    if (!lessonRequests?.length || !apiKey) {
      return;
    }

    setBatchStatus('processing');
    setCompletedLessons([]);
    setFailedLessons([]);
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      setProcessingTime(Date.now() - startTime);
    }, 100);

    try {
      // Use batch generation for efficiency
      const results = await langChainBytezService.batchGenerateLessons(
        lessonRequests,
        apiKey
      );

      clearInterval(timer);
      
      const completed = [];
      const failed = [];

      results.forEach((result, index) => {
        const request = lessonRequests[index];
        
        if (result.error) {
          failed.push({
            ...request,
            error: result.error
          });
        } else {
          completed.push({
            ...request,
            content: result.content,
            generatedAt: new Date().toISOString()
          });
        }
      });

      setCompletedLessons(completed);
      setFailedLessons(failed);
      setBatchStatus('complete');
      
      onComplete?.({
        completed,
        failed,
        totalTime: Date.now() - startTime
      });

    } catch (error) {
      clearInterval(timer);
      setBatchStatus('error');
      console.error('Batch generation failed:', error);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStatusColor = () => {
    switch (batchStatus) {
      case 'processing':
        return 'blue';
      case 'complete':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${getStatusColor()}-100`}>
              <Users className={`w-5 h-5 text-${getStatusColor()}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Batch Lesson Generator</h3>
              <p className="text-sm text-gray-600">
                {lessonRequests?.length || 0} lessons queued
              </p>
            </div>
          </div>

          {batchStatus === 'idle' && (
            <button
              onClick={startBatchGeneration}
              disabled={!lessonRequests?.length || !apiKey}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate All
            </button>
          )}
        </div>

        {/* Processing Status */}
        {batchStatus === 'processing' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Processing {lessonRequests.length} lessons...</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>Time elapsed: {formatTime(processingTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Queue */}
      {lessonRequests?.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Lesson Queue</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lessonRequests.map((request, index) => {
              const isCompleted = completedLessons.some(l => 
                l.lessonTitle === request.lessonTitle && l.moduleTitle === request.moduleTitle
              );
              const isFailed = failedLessons.some(l => 
                l.lessonTitle === request.lessonTitle && l.moduleTitle === request.moduleTitle
              );

              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isCompleted ? 'bg-green-50 border-green-200' :
                    isFailed ? 'bg-red-50 border-red-200' :
                    batchStatus === 'processing' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {request.lessonTitle}
                      </p>
                      <p className="text-xs text-gray-600">
                        Module: {request.moduleTitle}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {isFailed && <AlertCircle className="w-4 h-4 text-red-600" />}
                      {batchStatus === 'processing' && !isCompleted && !isFailed && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {batchStatus === 'complete' && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    {completedLessons.length} Completed
                  </p>
                  <p className="text-sm text-green-700">Successfully generated</p>
                </div>
              </div>
            </div>

            {failedLessons.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {failedLessons.length} Failed
                    </p>
                    <p className="text-sm text-red-700">Need retry</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total processing time: {formatTime(processingTime)}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {batchStatus === 'error' && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Batch generation failed</p>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please check your API key and try again.
            </p>
            <button
              onClick={() => setBatchStatus('idle')}
              className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchLessonGenerator;
