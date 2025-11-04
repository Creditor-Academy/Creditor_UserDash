import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

export default function PollMessage({ message, currentUserId, onVote, onPinToggle, groupId }) {
  const poll = message.poll || {};
  const options = poll.options || [];
  const votes = poll.votes || {}; // { optionIndex: [userId, ...] }
  const isLoading = !poll.optionIds || (poll.optionIds || []).length === 0;
  const isUser = String(message.senderId) === String(currentUserId);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update current time every minute to check if poll should close
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const totalVotes = useMemo(() => Object.values(votes).reduce((acc, arr) => acc + (arr?.length || 0), 0), [votes]);
  const userVotes = useMemo(() => {
    const list = [];
    Object.entries(votes).forEach(([idx, arr]) => {
      if ((arr || []).some(uid => String(uid) === String(currentUserId))) list.push(Number(idx));
    });
    return list;
  }, [votes, currentUserId]);

  const multiple = Boolean(poll.allowMultiple);
  const closed = !isLoading && (() => {
    const now = currentTime; // Use the state that updates every minute
    const closedAtTime = poll.closedAt ? new Date(poll.closedAt).getTime() : null;
    const closesAtTime = poll.closesAt ? new Date(poll.closesAt).getTime() : null;
    
    // Debug logging
    if (poll.closesAt) {
      console.log('Poll closing check:', {
        closesAt: poll.closesAt,
        closesAtTime,
        now,
        isPast: closesAtTime && closesAtTime <= now,
        timeDiff: closesAtTime ? (now - closesAtTime) / 1000 / 60 : 'N/A', // minutes
        pollData: poll
      });
    }
    
    return (
      (Boolean(poll.closedAt) && closedAtTime && closedAtTime <= now) ||
      (Boolean(poll.closesAt) && closesAtTime && closesAtTime <= now)
    );
  })();

  const handleVote = (idx) => {
    if (closed) return;
    onVote?.(message.id, idx, multiple);
  };

  const isPinned = Boolean(message.isPinned);

  const hasVoted = userVotes.length > 0;

  const containerClasses = isUser
    ? "rounded-2xl p-2 sm:p-3 shadow-sm min-w-[200px] sm:min-w-[260px] bg-gradient-to-r from-purple-500 to-purple-600 text-white"
    : "rounded-2xl border border-gray-200 bg-white p-2 sm:p-3 shadow-sm min-w-[200px] sm:min-w-[260px]";

  const optionBase = isUser
    ? "relative overflow-hidden rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border-white/40 hover:bg-white/10"
    : "relative overflow-hidden rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border-gray-200 hover:bg-gray-50";

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between">
        <div className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>
          <span>{poll.question}</span>
          {!isLoading && hasVoted && !closed && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${isUser ? 'bg-white/20 text-white border border-white/30' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              <CheckCircle className="w-3 h-3" /> Voted
            </span>
          )}
          {closed && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${isUser ? 'bg-white/20 text-white border border-white/30' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>
              Final Results
            </span>
          )}
        </div>
        {onPinToggle && (
          <button className={`text-xs hover:underline ${isUser ? 'text-white/80' : 'text-gray-500'}`} onClick={() => onPinToggle(message.id, !isPinned)}>
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {options.map((opt, idx) => {
          const count = (votes?.[idx] || []).length;
          const ratio = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          const selected = userVotes.includes(idx);
          const isWinner = closed && totalVotes > 0 && count === Math.max(...Object.values(votes).map(v => v?.length || 0));
          
          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              className={`w-full text-left whitespace-normal break-words ${optionBase} ${selected ? (isUser ? 'bg-white/20 border-white' : 'border-purple-500 bg-purple-50') : ''} ${closed ? 'cursor-default' : ''}`}
              disabled={closed || isLoading}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {closed ? (
                    isWinner ? (
                      <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${isUser ? 'text-yellow-300' : 'text-green-600'}`} />
                    ) : (
                      <Circle className={`w-3 h-3 sm:w-4 sm:h-4 ${isUser ? 'text-white/40' : 'text-gray-300'}`} />
                    )
                  ) : selected ? (
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${isUser ? 'text-white' : 'text-purple-600'}`} />
                  ) : (
                    <Circle className={`w-3 h-3 sm:w-4 sm:h-4 ${isUser ? 'text-white/60' : 'text-gray-300'}`} />
                  )}
                  <span className={`text-xs sm:text-sm ${selected ? (isUser ? 'text-white' : 'text-purple-700') : (isUser ? 'text-white' : 'text-gray-800')}`}>{opt}</span>
                  {closed && isWinner && (
                    <span className={`text-xs font-medium ${isUser ? 'text-yellow-200' : 'text-green-600'}`}>
                      Winner
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] sm:text-sm ${isUser ? 'text-white/90' : 'text-gray-600'} font-medium tabular-nums`}>
                    {count} vote{count !== 1 ? 's' : ''}
                  </span>
                  <span className={`text-[11px] sm:text-sm ${isUser ? 'text-white/90' : 'text-gray-600'} font-medium tabular-nums`}>
                    {ratio}%
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 -z-0">
                <div className={`h-full transition-[width] duration-300 ease-out ${isUser ? 'bg-white/30' : 'bg-purple-100'}`} style={{ width: `${ratio}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
        <div className={isUser ? 'text-white/90' : ''}>
          {totalVotes} vote{totalVotes === 1 ? '' : 's'}{multiple ? ' • Multiple choice' : ''}
          {closed && totalVotes > 0 && (
            <span className="ml-2">
              • Winner: {(() => {
                const maxVotes = Math.max(...Object.values(votes).map(v => v?.length || 0));
                const winners = options.filter((_, idx) => (votes?.[idx] || []).length === maxVotes);
                return winners.length === 1 ? winners[0] : `${winners.length} tied`;
              })()}
            </span>
          )}
        </div>
        <div className={`${isUser ? 'text-white/90' : 'text-gray-500'} whitespace-nowrap`}>
          {isLoading ? 'Loading…' : (closed ? `Closed ${poll.closedAt ? new Date(poll.closedAt).toLocaleString() : (poll.closesAt ? new Date(poll.closesAt).toLocaleString() : '')}` : (poll.closesAt ? `Ends ${new Date(poll.closesAt).toLocaleString()}` : ''))}
        </div>
      </div>
    </div>
  );
}


