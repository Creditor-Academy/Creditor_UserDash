/**
 * AI Service Diagnostics Component
 *
 * Provides a UI to test and diagnose AI service health
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  runAIServiceDiagnostics,
  quickHealthCheck,
} from '@/services/aiServiceDiagnostics';
import { showDiagnosticResults } from '@/utils/aiErrorNotifications';

const AIServiceDiagnostics = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [quickStatus, setQuickStatus] = useState(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const diagnosticResults = await runAIServiceDiagnostics();
      setResults(diagnosticResults);
      showDiagnosticResults(diagnosticResults);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setResults({
        overall: {
          status: 'error',
          message: `Diagnostics failed: ${error.message}`,
          score: 0,
        },
        checks: [],
        recommendations: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickCheck = async () => {
    setIsRunning(true);
    try {
      const health = await quickHealthCheck();
      setQuickStatus(health);
    } catch (error) {
      setQuickStatus({
        healthy: false,
        message: `Quick check failed: ${error.message}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unhealthy':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              AI Service Diagnostics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
            title="Close Diagnostics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Check */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Health Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickStatus && (
                <Alert
                  className={
                    quickStatus.healthy
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }
                >
                  <div className="flex items-center gap-2">
                    {quickStatus.healthy ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <AlertDescription className="font-medium">
                      {quickStatus.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
              <Button
                onClick={runQuickCheck}
                disabled={isRunning}
                variant="outline"
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Run Quick Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Full Diagnostics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Full Diagnostic Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Run comprehensive tests on all AI service endpoints including
                text generation, image generation, and backend connectivity.
              </p>
              <Button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Run Full Diagnostics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Overall Status */}
              <Card
                className={`border-2 ${getStatusColor(results.overall.status)}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Status</span>
                    <Badge
                      variant={
                        results.overall.status === 'healthy'
                          ? 'success'
                          : results.overall.status === 'degraded'
                            ? 'warning'
                            : 'destructive'
                      }
                      className="text-lg px-3 py-1"
                    >
                      {results.overall.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(results.overall.status)}
                    <p className="text-lg font-semibold">
                      {results.overall.message}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Passed {results.overall.passedChecks} of{' '}
                    {results.overall.totalChecks} checks
                  </div>
                </CardContent>
              </Card>

              {/* Individual Checks */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.checks.map((check, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        check.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {check.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {check.name}
                          </h3>
                        </div>
                        {check.duration && (
                          <Badge variant="outline" className="text-xs">
                            {check.duration}ms
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          check.passed ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {check.message}
                      </p>
                      {check.recommendation && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <strong>💡 Recommendation:</strong>{' '}
                          {check.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              {results.recommendations &&
                results.recommendations.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-5 h-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            rec.priority === 'high'
                              ? 'bg-red-50 border-red-200'
                              : rec.priority === 'medium'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">
                              {rec.priority === 'high'
                                ? '🔴'
                                : rec.priority === 'medium'
                                  ? '🟡'
                                  : '🟢'}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {rec.issue}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                → {rec.solution}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </motion.div>
          )}

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Diagnostic Information</p>
                  <p>
                    Diagnostics test all AI service endpoints to identify
                    issues. Check the browser console for detailed logs. You can
                    also run diagnostics programmatically:
                  </p>
                  <code className="block mt-2 p-2 bg-blue-100 rounded text-xs font-mono">
                    window.runAIServiceDiagnostics()
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Diagnostics
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIServiceDiagnostics;
