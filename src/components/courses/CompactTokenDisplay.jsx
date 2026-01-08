import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Zap, AlertCircle } from "lucide-react";
import "./CompactTokenDisplay.css";
import { subscribeActiveOrgUsageRefresh } from "../../utils/activeOrgUsageEvents";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

export const CompactTokenDisplay = () => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noOrg, setNoOrg] = useState(false);

  const fetchTokenStats = useCallback(async () => {
    try {
      // const response = await axios.get('/api/my-active-organization');
      const response = await axios.get(
        `${API_BASE}/api/my-active-organization`,
        { withCredentials: true },
      );
      if (response.data?.data) {
        setOrg(response.data.data);
        setError(null);
        setNoOrg(false);
      } else {
        setOrg(null);
        setNoOrg(true);
      }
    } catch (err) {
      console.error("Failed to fetch active org tokens:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setNoOrg(true);
        // setError('No active organization. Please login again.');
        setError("No active organization. Please login again.");
      } else {
        // setError('Failed to load tokens');
        setError("Failed to load tokens");
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

  if (noOrg || !org) {
    return (
      <div className="compact-token-display error">
        <AlertCircle size={14} />
        <span>No active organization. Please login again.</span>
      </div>
    );
  }

  const organization = org;
  const percentage = Math.round(
    (organization.ai_tokens_used / organization.ai_token_limit) * 100,
  );
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;
  const tokensRemaining =
    organization.ai_token_limit - organization.ai_tokens_used;

  return (
    <div
      // className={`compact-token-display ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'normal'}`}
      className={`compact-token-display ${isExceeded ? "exceeded" : isWarning ? "warning" : "normal"}`}
    >
      <div className="token-icon-wrapper">
        <Zap size={16} className="token-icon" />
      </div>

      <div className="token-info">
        <div className="token-label">AI Tokens</div>
        <div className="token-value">
          {/* {organization.ai_tokens_used.toLocaleString()} /{' '} */}
          {organization.ai_tokens_used.toLocaleString()} /{" "}
          {organization.ai_token_limit.toLocaleString()}
        </div>
      </div>

      <div className="token-bar-wrapper">
        <div className="token-bar">
          <div
            // className={`token-bar-fill ${isExceeded ? 'exceeded' : isWarning ? 'warning' : ''}`}
            className={`token-bar-fill ${isExceeded ? "exceeded" : isWarning ? "warning" : ""}`}
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
