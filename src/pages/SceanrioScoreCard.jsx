import React, { useEffect, useMemo, useState } from 'react';
import { getScenarioAttempts } from '@/services/scenarioService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronRight, Star, User, Mail, BarChart3, Clock } from 'lucide-react';

const formatDateTime = (isoString) => {
  try {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString || '—';
  }
};

const formatDateShort = (isoString) => {
  try {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString();
  } catch {
    return '—';
  }
};

const getBestScore = (attempts) => {
  if (!Array.isArray(attempts) || attempts.length === 0) return 0;
  return attempts.reduce((max, a) => Math.max(max, Number(a?.score || 0)), 0);
};

/**
 * Scenario Score Card
 * Props:
 * - scenarioId: string (required)
 * - scenarioTitle?: string
 */
const ScenarioScoreCard = ({ scenarioId, scenarioTitle }) => {
  const [attemptRows, setAttemptRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getScenarioAttempts(scenarioId);
        if (!isMounted) return;
        setAttemptRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load scenario attempts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (scenarioId) load();
    return () => { isMounted = false; };
  }, [scenarioId]);

  // Filter users based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return attemptRows;
    
    const term = searchTerm.toLowerCase();
    return attemptRows.filter(row => 
      (row.name?.toLowerCase().includes(term)) ||
      (row.email?.toLowerCase().includes(term)) ||
      (row.userId?.toLowerCase().includes(term))
    );
  }, [attemptRows, searchTerm]);

  const totalUsers = filteredRows.length;
  const averageBestScore = useMemo(() => {
    if (filteredRows.length === 0) return 0;
    const sum = filteredRows.reduce((acc, row) => acc + getBestScore(row.attempts || []), 0);
    return Math.round((sum / filteredRows.length) * 10) / 10;
  }, [filteredRows]);

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scenario Scores</h2>
          {scenarioTitle && (
            <p className="text-lg text-gray-600 mt-1">{scenarioTitle}</p>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Participants</div>
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Average Best Score</div>
              <div className="text-2xl font-bold text-gray-900">{averageBestScore}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Attempts</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredRows.reduce((total, row) => total + (row.attempts?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="w-full text-center text-red-600 py-8 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="w-full text-center text-gray-600 py-8 bg-gray-50 rounded-lg border border-gray-200">
          {searchTerm ? 'No users found matching your search.' : 'No attempts found.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2 text-center">Attempts</div>
            <div className="col-span-3 text-center">Best Score</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* User Rows */}
          <div className="divide-y divide-gray-200">
            {filteredRows.map((row) => {
              const bestScore = getBestScore(row.attempts);
              const isExpanded = expandedUsers.has(row.userId);
              
              return (
                <div key={row.userId} className="hover:bg-gray-50 transition-colors">
                  {/* Main User Row */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(row.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{row.name || row.userId}</div>
                          {row.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              {row.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                        <BarChart3 className="h-3 w-3" />
                        {row.totalAttempts ?? (row.attempts?.length || 0)}
                      </span>
                    </div>
                    
                    <div className="col-span-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(bestScore)}`}>
                        <Star className="h-3 w-3" />
                        {bestScore}
                      </span>
                    </div>
                    
                    <div className="col-span-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserExpansion(row.userId)}
                        className="flex items-center gap-2 ml-auto"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Hide Attempts
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-4 w-4" />
                            Show Attempts
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Attempts Section */}
                  {isExpanded && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Attempt History ({row.attempts?.length || 0})
                      </h4>
                      
                      {(!row.attempts || row.attempts.length === 0) ? (
                        <div className="text-center text-gray-500 py-4">
                          No attempts recorded
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {row.attempts.map((attempt, index) => (
                            <div
                              key={attempt.attemptId}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">#{(attempt.attemptNo || index + 1)}</span>
                                    {attempt.score === bestScore && (
                                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                        Best
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(attempt.score)}`}>
                                    Score: {attempt.score}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDateTime(attempt.completedAt)}
                                  </div>
                                </div>
                              </div>
                              
                              {attempt.duration && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Duration: {Math.round(attempt.duration / 60)} minutes
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioScoreCard;