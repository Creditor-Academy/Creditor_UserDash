import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Zap,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Clock,
  Plus,
} from 'lucide-react';
import './AIUsageHeader.css';
import { subscribeActiveOrgUsageRefresh } from '../../utils/activeOrgUsageEvents';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AIUsageHeader Component
 * Premium AI usage display for top of page
 * Shows organization token usage with detailed breakdown
 * Only visible to admin and instructor roles
 */
export const AIUsageHeader = () => {
  const { userRoles } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [noOrg, setNoOrg] = useState(false);

  // Check if user is admin or instructor
  const isAdminOrInstructor = userRoles?.some(
    role => role === 'admin' || role === 'instructor'
  );

  // Hide component for regular users
  if (!isAdminOrInstructor) {
    return null;
  }

  const fetchTokenStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/my-active-organization');
      if (response.data?.data) {
        setOrg(response.data.data);
        setError(null);
        setNoOrg(false);
      } else {
        setOrg(null);
        setNoOrg(true);
      }
    } catch (err) {
      console.error('Failed to fetch active org usage:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setNoOrg(true);
        setError('No active organization. Please login again.');
      } else {
        setError('Failed to load AI usage');
      }
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenStats, 60000);
    const unsubscribe = subscribeActiveOrgUsageRefresh(fetchTokenStats);
    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, [fetchTokenStats]);

  if (loading) {
    return (
      <div className="ai-usage-header loading">
        <div className="header-skeleton">
          <div className="skeleton-bar"></div>
        </div>
      </div>
    );
  }

  if (error && (noOrg || !org)) {
    return (
      <div className="ai-usage-header error">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (noOrg || !org) {
    return (
      <div className="ai-usage-header error">
        <AlertCircle size={16} />
        <span>No active organization. Please login again.</span>
      </div>
    );
  }

  const organization = org;
  const percentage = Math.round(
    (organization.ai_tokens_used / organization.ai_token_limit) * 100
  );
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;
  const tokensRemaining =
    organization.ai_token_limit - organization.ai_tokens_used;

  // Calculate daily average
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const currentDay = today.getDate();
  const dailyAverage = Math.round(organization.ai_tokens_used / currentDay);
  const projectedMonthly = dailyAverage * daysInMonth;

  return (
    <div
      className={`ai-usage-header ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'normal'}`}
    >
      {/* Main Header Bar */}
      <div className="header-main">
        <div className="header-left">
          <div className="icon-wrapper">
            <Zap size={20} className="header-icon" />
          </div>
          <div className="header-content">
            <h3 className="header-title">AI Token Usage</h3>
            <p className="header-subtitle">
              Organization monthly allocation (Active org: {organization.id})
            </p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-box">
            <span className="stat-label">Used</span>
            <span className="stat-value">
              {organization.ai_tokens_used.toLocaleString()}
            </span>
          </div>
          <div className="stat-separator">/</div>
          <div className="stat-box">
            <span className="stat-label">Limit</span>
            <span className="stat-value">
              {organization.ai_token_limit.toLocaleString()}
            </span>
          </div>
          <div className="stat-box remaining">
            <span className="stat-label">Remaining</span>
            <span
              className={`stat-value ${tokensRemaining < 100000 ? 'low' : ''}`}
            >
              {tokensRemaining.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="header-right">
          <span className="billing-badge neutral">Active Org</span>
          <span className="org-id-text">{organization.id}</span>
          <button
            className="token-management-btn"
            onClick={() => (window.location.href = '/storage-and-tokens')}
            title="Manage tokens and storage"
          >
            <Plus size={18} />
          </button>
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              className={`expand-icon ${expanded ? 'rotated' : ''}`}
            >
              <path
                d="M7 8l5 5 5-5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className={`progress-fill ${isExceeded ? 'exceeded' : isWarning ? 'warning' : ''}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              <div className="progress-shimmer"></div>
            </div>
          </div>
          <span className="progress-percentage">{percentage}%</span>
        </div>

        {/* Status Alert */}
        {isExceeded && (
          <div className="status-alert exceeded">
            <AlertCircle size={16} />
            <span>
              ❌ Token limit exceeded! Contact administrator to increase limit.
            </span>
          </div>
        )}
        {isWarning && !isExceeded && (
          <div className="status-alert warning">
            <AlertCircle size={16} />
            <span>⚠️ Approaching token limit ({percentage}% used)</span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="expanded-details">
          {/* Projection Section */}
          <div className="details-section">
            <div className="section-header">
              <BarChart3 size={16} />
              <h4>Monthly Projection</h4>
            </div>
            <div className="projection-grid">
              <div className="projection-item">
                <div className="projection-label">
                  <Clock size={14} />
                  <span>Daily Average</span>
                </div>
                <span className="projection-value">
                  {dailyAverage.toLocaleString()} tokens/day
                </span>
              </div>
              <div className="projection-item">
                <div className="projection-label">
                  <TrendingUp size={14} />
                  <span>Projected Monthly</span>
                </div>
                <span
                  className={`projection-value ${projectedMonthly > organization.ai_token_limit ? 'over-limit' : ''}`}
                >
                  {projectedMonthly.toLocaleString()} tokens
                  {projectedMonthly > organization.ai_token_limit && (
                    <span className="projection-warning"> (⚠️ Over limit)</span>
                  )}
                </span>
              </div>
              <div className="projection-item">
                <div className="projection-label">
                  <Zap size={14} />
                  <span>Days Until Limit</span>
                </div>
                <span className="projection-value">
                  {tokensRemaining > 0 && dailyAverage > 0
                    ? Math.ceil(tokensRemaining / dailyAverage)
                    : '∞'}{' '}
                  days
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="section-header">
              <TrendingUp size={16} />
              <h4>Live Usage Source</h4>
            </div>
            <p className="detail-note">
              Data reflects the active organization attached by the AI quota
              middleware, independent of the admin JWT organization. Refreshes
              after each AI operation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIUsageHeader;
