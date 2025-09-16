import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

export default function PollMessage({ message, currentUserId, onVote, onPinToggle }) {
  const poll = message.poll || {};
  const options = poll.options || [];
  const votes = poll.votes || {}; // { optionIndex: [userId, ...] }
  const isLoading = !poll.optionIds || (poll.optionIds || []).length === 0;
  const isUser = String(message.senderId) === String(currentUserId);
  const totalVotes = useMemo(() => Object.values(votes).reduce((acc, arr) => acc + (arr?.length || 0), 0), [votes]);
  const userVotes = useMemo(() => {
    const list = [];
    Object.entries(votes).forEach(([idx, arr]) => {
      if ((arr || []).some(uid => String(uid) === String(currentUserId))) list.push(Number(idx));
    });
    return list;
  }, [votes, currentUserId]);

  const multiple = Boolean(poll.allowMultiple);
  const closed = !isLoading && Boolean(poll.closedAt) && new Date(poll.closedAt).getTime() <= Date.now();

  const handleVote = (idx) => {
    if (closed) return;
    onVote?.(message.id, idx, multiple);
  };

  const isPinned = Boolean(message.isPinned);

  const hasVoted = userVotes.length > 0;

  const containerClasses = isUser
    ? "rounded-2xl p-3 shadow-sm min-w-[260px] bg-gradient-to-r from-purple-500 to-purple-600 text-white"
    : "rounded-2xl border border-gray-200 bg-white p-3 shadow-sm min-w-[260px]";

  const optionBase = isUser
    ? "relative overflow-hidden rounded-lg border px-3 py-2 text-sm border-white/40 hover:bg-white/10"
    : "relative overflow-hidden rounded-lg border px-3 py-2 text-sm border-gray-200 hover:bg-gray-50";

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between">
        <div className={`text-sm font-semibold flex items-center gap-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>
          <span>{poll.question}</span>
          {!isLoading && hasVoted && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${isUser ? 'bg-white/20 text-white border border-white/30' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              <CheckCircle className="w-3 h-3" /> Voted
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
          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              className={`w-full text-left ${optionBase} ${selected ? (isUser ? 'bg-white/20 border-white' : 'border-purple-500 bg-purple-50') : ''}`}
              disabled={closed || isLoading}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selected ? (
                    <CheckCircle className={`w-4 h-4 ${isUser ? 'text-white' : 'text-purple-600'}`} />
                  ) : (
                    <Circle className={`w-4 h-4 ${isUser ? 'text-white/60' : 'text-gray-300'}`} />
                  )}
                  <span className={`${selected ? (isUser ? 'text-white' : 'text-purple-700') : (isUser ? 'text-white' : 'text-gray-800')}`}>{opt}</span>
                </div>
                <span className={`${isUser ? 'text-white/90' : 'text-gray-600'} font-medium tabular-nums`}>{ratio}%</span>
              </div>
              <div className="absolute inset-0 -z-0">
                <div className={`h-full transition-[width] duration-300 ease-out ${isUser ? 'bg-white/30' : 'bg-purple-100'}`} style={{ width: `${ratio}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className={isUser ? 'text-white/90' : ''}>
          {totalVotes} vote{totalVotes === 1 ? '' : 's'}{multiple ? ' • Multiple choice' : ''}
        </div>
        <div className={isUser ? 'text-white/90' : 'text-gray-500'}>
          {isLoading ? 'Loading…' : (closed ? 'Closed' : (poll.closesAt ? `Ends ${new Date(poll.closesAt).toLocaleString()}` : ''))}
        </div>
      </div>
    </div>
  );
}


