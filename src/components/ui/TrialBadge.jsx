import React from 'react';
import { Clock, Lock } from 'lucide-react';
import { getTrialBadgeColor } from '../../utils/trialUtils';

const TrialBadge = ({ timeRemaining, className = '' }) => {
  if (!timeRemaining) return null;

  const badgeColor = getTrialBadgeColor(timeRemaining.totalMinutes || 0);
  
  if (timeRemaining.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} ${className}`}>
        <Lock className="w-3 h-3" />
        Trial Expired
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} ${className}`}>
      <Clock className="w-3 h-3" />
      {timeRemaining.formatted}
    </div>
  );
};

export default TrialBadge;
