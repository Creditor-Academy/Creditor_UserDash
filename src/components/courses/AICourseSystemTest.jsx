import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Server,
  Database,
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateTestReport, testCompleteAICourseFlow } from '../../utils/aiCourseTestUtils';
import { testUploadEndpoint, testImageUploadService } from '../../utils/testUploadEndpoint';

const AICourseSystemTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [currentTest, setCurrentTest] = useState('');

  const runCompleteTest = async () => {
    setIsRunning(true);
    setCurrentTest('Initializing comprehensive test suite...');
    setTestResults(null);

    try {
      const report = await generateTestReport();
      setTestResults(report);
    } catch (error) {
      setTestResults({
        error: error.message,
        summary: { overallStatus: 'ERROR' }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setCurrentTest('Running quick AI course creation test...');
    setTestResults(null);

    try {
      const quickTestData = {
        title: 'Quick Test Course - React Basics',
        description: 'A quick test course to verify AI course creation functionality',
        subject: 'Web Development',
        targetAudience: 'Developers',
        difficulty: 'beginner',
        duration: '2 weeks',
        learningObjectives: 'Learn React components and hooks'
      };

      const result = await testCompleteAICourseFlow(quickTestData);
      setTestResults({
        tests: { completeFlow: result },
        summary: {
          overallStatus: result.success ? 'PASS' : 'FAIL',
          completeFlowWorking: result.success
        }
      });
    } catch (error) {
      setTestResults({
        error: error.message,
        summary: { overallStatus: 'ERROR' }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runUploadTest = async () => {
    setIsRunning(true);
    setCurrentTest('Testing upload endpoint and image service...');
    setTestResults(null);

    try {
      // Test 1: Check upload endpoint
      setCurrentTest('Step 1: Testing upload endpoint accessibility...');
      const endpointTest = await testUploadEndpoint();
      
      // Test 2: Test image upload service
      setCurrentTest('Step 2: Testing image upload service...');
      const imageUploadTest = await testImageUploadService();
      
      setTestResults({
        tests: {
          uploadEndpoint: endpointTest,
          imageUploadService: imageUploadTest
        },
        summary: {
          overallStatus: (endpointTest.endpointExists && imageUploadTest.success) ? 'PASS' : 'FAIL',
          uploadWorking: endpointTest.endpointExists && imageUploadTest.success
        }
      });
    } catch (error) {
      setTestResults({
        error: error.message,
        summary: { overallStatus: 'ERROR' }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const downloadReport = () => {
    if (!testResults) return;
    
    const reportData = JSON.stringify(testResults, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-course-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
      case 'completed':
      case true:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAIL':
      case 'failed':
      case false:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
      case 'completed':
      case true:
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAIL':
      case 'failed':
      case false:
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ERROR':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI Course System Test Suite</h1>
        <p className="text-gray-600">
          Comprehensive testing for the AI-powered course creation system with deployed backend integration
        </p>
      </div>

      {/* Environment Info */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Environment Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">API Base URL:</span>
            <span className="ml-2 font-mono text-blue-600">
              {import.meta.env.VITE_API_BASE_URL || 'Not configured'}
            </span>
          </div>
          <div>
            <span className="font-medium">AI API Key:</span>
            <span className="ml-2">
              {import.meta.env.VITE_BYTEZ_KEY ? 
                <span className="text-green-600">✓ Configured</span> : 
                <span className="text-red-600">✗ Missing</span>
              }
            </span>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={runQuickTest}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Quick Test
            </>
          )}
        </Button>

        <Button
          onClick={runCompleteTest}
          disabled={isRunning}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Full Suite...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Complete Test Suite
            </>
          )}
        </Button>

        <Button
          onClick={runUploadTest}
          disabled={isRunning}
          variant="outline"
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Upload...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Test Upload API
            </>
          )}
        </Button>

        {testResults && (
          <Button
            onClick={downloadReport}
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* Current Test Status */}
      {isRunning && currentTest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">{currentTest}</span>
          </div>
        </motion.div>
      )}

      {/* Test Results */}
      {testResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Status */}
          <div className={`rounded-lg p-6 border-2 ${getStatusColor(testResults.summary?.overallStatus)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.summary?.overallStatus)}
                <div>
                  <h3 className="text-xl font-bold">
                    Overall Status: {testResults.summary?.overallStatus || 'UNKNOWN'}
                  </h3>
                  <p className="text-sm opacity-75">
                    {testResults.timestamp && `Completed at ${new Date(testResults.timestamp).toLocaleString()}`}
                  </p>
                </div>
              </div>
              {testResults.summary?.overallStatus === 'PASS' && (
                <div className="text-right">
                  <div className="text-2xl font-bold">🎉</div>
                  <div className="text-sm font-medium">All Systems Go!</div>
                </div>
              )}
            </div>
          </div>

          {/* Test Details */}
          {testResults.tests && (
            <div className="space-y-4">
              {/* API Validation */}
              {testResults.tests.apiValidation && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    API Endpoint Validation
                  </h4>
                  <div className="space-y-2">
                    {testResults.tests.apiValidation.endpoints?.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{endpoint.name}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(endpoint.accessible)}
                          <span className={endpoint.accessible ? 'text-green-600' : 'text-red-600'}>
                            {endpoint.accessible ? 'Accessible' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Services */}
              {testResults.tests.individualServices && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Individual AI Services
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(testResults.tests.individualServices).map(([service, result]) => (
                      <div key={service} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-center mb-2">
                          {getStatusIcon(result.success)}
                        </div>
                        <div className="font-medium text-sm capitalize">
                          {service.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result.success ? 'Working' : 'Failed'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Flow Test */}
              {testResults.tests.completeFlow && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Complete Course Creation Flow
                  </h4>
                  
                  {testResults.tests.completeFlow.steps && (
                    <div className="space-y-3">
                      {testResults.tests.completeFlow.steps.map((step, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(step.status)}
                            <div>
                              <div className="font-medium">Step {step.step}: {step.name}</div>
                              {step.result && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {step.name.includes('Course Creation') && 
                                    `${step.result.totalModules} modules, ${step.result.totalLessons} lessons`
                                  }
                                  {step.name.includes('Image') && 
                                    `Uploaded to S3: ${step.result.fileName}`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {step.status === 'completed' ? '✓' : 
                             step.status === 'failed' ? '✗' : 
                             step.status === 'running' ? '⏳' : '⏸'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {testResults.tests.completeFlow.success && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-800 font-medium">
                        🎉 Complete AI course creation successful!
                      </div>
                      <div className="text-green-600 text-sm mt-1">
                        Course created with full backend integration and S3 storage.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {testResults.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error Details
              </h4>
              <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-x-auto">
                {testResults.error}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      {!testResults && !isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            How to Use This Test Suite
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p><strong>Quick Test:</strong> Tests the complete AI course creation flow with a sample course.</p>
            <p><strong>Complete Test Suite:</strong> Comprehensive testing including API validation, individual services, and full integration.</p>
            <p><strong>Requirements:</strong> Ensure VITE_API_BASE_URL and VITE_BYTEZ_KEY are configured in your environment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICourseSystemTest;
