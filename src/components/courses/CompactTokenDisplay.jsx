import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, AlertCircle } from 'lucide-react';
import './CompactTokenDisplay.css';

/**
 * CompactTokenDisplay Component
 * Compact token display for header/top bar
 * Shows quick token status at a glance
 */
export const CompactTokenDisplay = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats?.organization) {
    return (
      <div className="compact-token-display loading">
        <Zap size={14} />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compact-token-display error">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    );
  }

  const { organization } = stats;
  const percentage = Math.round(
    (organization.ai_tokens_used / organization.ai_token_limit) * 100
  );
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;
  const tokensRemaining =
    organization.ai_token_limit - organization.ai_tokens_used;

  return (
    <div
      className={`compact-token-display ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'normal'}`}
    >
      <div className="token-icon-wrapper">
        <Zap size={16} className="token-icon" />
      </div>

      <div className="token-info">
        <div className="token-label">AI Tokens</div>
        <div className="token-value">
          {organization.ai_tokens_used.toLocaleString()} /{' '}
          {organization.ai_token_limit.toLocaleString()}
        </div>
      </div>

      <div className="token-bar-wrapper">
        <div className="token-bar">
          <div
            className={`token-bar-fill ${isExceeded ? 'exceeded' : isWarning ? 'warning' : ''}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="token-percentage">{percentage}%</span>
      </div>

      {isExceeded && (
        <div
          className="token-status exceeded-status"
          title="Token limit exceeded"
        >
          ⚠️
        </div>
      )}
      {isWarning && !isExceeded && (
        <div className="token-status warning-status" title="Approaching limit">
          ⚡
        </div>
      )}
    </div>
  );
};

export default CompactTokenDisplay;
