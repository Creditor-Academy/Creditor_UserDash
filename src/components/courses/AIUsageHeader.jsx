import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, TrendingUp, AlertCircle, BarChart3, Clock } from 'lucide-react';
import './AIUsageHeader.css';

/**
 * AIUsageHeader Component
 * Premium AI usage display for top of page
 * Shows organization token usage with detailed breakdown
 */
export const AIUsageHeader = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchTokenStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTokenStats = async () => {
    try {
      const response = await axios.get(
        '/api/admin/ai/my-organization/ai-usage'
      );
      if (response.data?.data) {
        setStats(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch token stats:', err);
      setError('Failed to load AI usage');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-usage-header loading">
        <div className="header-skeleton">
          <div className="skeleton-bar"></div>
        </div>
      </div>
    );
  }

  if (error || !stats?.organization) {
    return null;
  }

  const { organization, monthlySummary } = stats;
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
            <p className="header-subtitle">Organization monthly allocation</p>
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
          <span
            className={`billing-badge ${organization.ai_billing_mode.toLowerCase()}`}
          >
            {organization.ai_billing_mode}
          </span>
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
          {/* Monthly Summary */}
          {monthlySummary && (
            <div className="details-section">
              <div className="section-header">
                <TrendingUp size={16} />
                <h4>This Month's Activity</h4>
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Total Operations</span>
                  <span className="detail-value">
                    {monthlySummary.total_operations}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Blueprints Generated</span>
                  <span className="detail-value">
                    {monthlySummary.blueprint_count}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Images Generated</span>
                  <span className="detail-value">
                    {monthlySummary.image_count}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Text Operations</span>
                  <span className="detail-value">
                    {monthlySummary.text_count}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Cost</span>
                  <span className="detail-value">
                    ${(monthlySummary.total_cost_usd || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Avg Cost/Operation</span>
                  <span className="detail-value">
                    $
                    {monthlySummary.total_operations > 0
                      ? (
                          (monthlySummary.total_cost_usd || 0) /
                          monthlySummary.total_operations
                        ).toFixed(3)
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}

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

          {/* Cost Breakdown */}
          {monthlySummary && (
            <div className="details-section">
              <div className="section-header">
                <BarChart3 size={16} />
                <h4>Cost Breakdown</h4>
              </div>
              <div className="cost-breakdown">
                {monthlySummary.blueprint_count > 0 && (
                  <div className="cost-item">
                    <div className="cost-label">
                      <span className="cost-type">📋 Blueprints</span>
                      <span className="cost-count">
                        {monthlySummary.blueprint_count} ops
                      </span>
                    </div>
                    <span className="cost-amount">
                      ${(monthlySummary.blueprint_cost || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {monthlySummary.image_count > 0 && (
                  <div className="cost-item">
                    <div className="cost-label">
                      <span className="cost-type">🖼️ Images</span>
                      <span className="cost-count">
                        {monthlySummary.image_count} ops
                      </span>
                    </div>
                    <span className="cost-amount">
                      ${(monthlySummary.image_cost || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {monthlySummary.text_count > 0 && (
                  <div className="cost-item">
                    <div className="cost-label">
                      <span className="cost-type">📝 Text</span>
                      <span className="cost-count">
                        {monthlySummary.text_count} ops
                      </span>
                    </div>
                    <span className="cost-amount">
                      ${(monthlySummary.text_cost || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIUsageHeader;
