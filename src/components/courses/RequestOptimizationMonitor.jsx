/**
 * Request Optimization Monitor Component
 * Real-time visualization of optimization metrics and cache statistics
 *
 * Usage:
 * import RequestOptimizationMonitor from '@/components/courses/RequestOptimizationMonitor';
 * <RequestOptimizationMonitor />
 */

import React, { useState, useEffect } from 'react';
import optimizedOpenAIService from '@/services/optimizedOpenAIService';

const RequestOptimizationMonitor = ({ refreshInterval = 5000 }) => {
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const newMetrics = optimizedOpenAIService.getMetrics();
        const newCacheStats = optimizedOpenAIService.getCacheStats();

        setMetrics(newMetrics);
        setCacheStats(newCacheStats);

        // Keep last 20 data points for history
        setHistory(prev => [
          ...prev.slice(-19),
          {
            timestamp: new Date().toLocaleTimeString(),
            hitRate: parseFloat(newMetrics.hitRate),
            avgResponseTime: newMetrics.averageResponseTime,
            activeCalls: newCacheStats.activeCalls,
            queuedRequests: newCacheStats.queuedRequests,
          },
        ]);
      } catch (error) {
        console.error('Error updating metrics:', error);
      }
    };

    // Initial update
    updateMetrics();

    // Set up interval
    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (!metrics || !cacheStats) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">Loading optimization metrics...</div>
      </div>
    );
  }

  const hitRatePercent = parseFloat(metrics.hitRate);
  const deduplicationPercent = parseFloat(metrics.deduplicationRate);
  const failurePercent = parseFloat(metrics.failureRate);

  // Color coding based on performance
  const getHitRateColor = rate => {
    if (rate >= 40) return 'text-green-600';
    if (rate >= 20) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getResponseTimeColor = time => {
    if (time < 1000) return 'text-green-600';
    if (time < 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <span className="text-lg">📊</span>
          <span className="text-sm font-semibold">
            {hitRatePercent.toFixed(1)}% Hit Rate
          </span>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📊</span> Optimization Monitor
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Cache Hit Rate */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold mb-1">
                Cache Hit Rate
              </div>
              <div
                className={`text-2xl font-bold ${getHitRateColor(hitRatePercent)}`}
              >
                {hitRatePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.cacheHits} / {metrics.totalRequests}
              </div>
            </div>

            {/* Deduplication Rate */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold mb-1">
                Deduplication
              </div>
              <div className="text-2xl font-bold text-green-600">
                {deduplicationPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.deduplicatedRequests} requests
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold mb-1">
                Avg Response Time
              </div>
              <div
                className={`text-2xl font-bold ${getResponseTimeColor(metrics.averageResponseTime)}`}
              >
                {(metrics.averageResponseTime / 1000).toFixed(2)}s
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.responseTimes.length} samples
              </div>
            </div>

            {/* Failure Rate */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold mb-1">
                Failure Rate
              </div>
              <div
                className={`text-2xl font-bold ${failurePercent > 5 ? 'text-red-600' : 'text-green-600'}`}
              >
                {failurePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.failedRequests} failed
              </div>
            </div>
          </div>

          {/* Cache Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              Cache Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Size:</span>
                <span className="font-semibold text-gray-800">
                  {cacheStats.cacheSize} entries
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Calls:</span>
                <span className="font-semibold text-gray-800">
                  {cacheStats.activeCalls} / 5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Queued Requests:</span>
                <span className="font-semibold text-gray-800">
                  {cacheStats.queuedRequests}
                </span>
              </div>
            </div>

            {/* Active Calls Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(cacheStats.activeCalls / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Request Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              Request Statistics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Requests:</span>
                <span className="font-semibold text-gray-800">
                  {metrics.totalRequests}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Hits:</span>
                <span className="font-semibold text-green-600">
                  {metrics.cacheHits}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Misses:</span>
                <span className="font-semibold text-yellow-600">
                  {metrics.cacheMisses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed Requests:</span>
                <span className="font-semibold text-red-600">
                  {metrics.failedRequests}
                </span>
              </div>
            </div>
          </div>

          {/* Recent History */}
          {history.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                Recent Activity
              </h4>
              <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                {history
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-600"
                    >
                      <span>{entry.timestamp}</span>
                      <span className="text-gray-800">
                        Hit: {entry.hitRate.toFixed(1)}% | Time:{' '}
                        {(entry.avgResponseTime / 1000).toFixed(2)}s | Active:{' '}
                        {entry.activeCalls}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                optimizedOpenAIService.clearCache();
                alert('Cache cleared!');
              }}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={() => {
                optimizedOpenAIService.resetMetrics();
                alert('Metrics reset!');
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
            >
              Reset Metrics
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-gray-700 border border-blue-200">
            <p className="font-semibold mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Higher hit rate = better performance</li>
              <li>Lower response time = faster generation</li>
              <li>Active calls limited to 5 to prevent rate limiting</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestOptimizationMonitor;
