import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceMessage } from "@/components/messages/VoiceMessage";
import PollMessage from "./PollMessage";
import { Download, Pencil, Trash2, Check, X } from "lucide-react";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { renderTextWithLinks } from "@/utils/linkUtils.jsx";

export function ChatMessage({ message, currentUserId, onEditMessage, onDeleteMessage, onVotePoll, onPinToggle, onPollPinToggle, isAdmin = false, groupId }) {
  const isUser = String(message.senderId) === String(currentUserId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content || "");
  const [showDelete, setShowDelete] = useState(false);

  // Render lightweight centered system notices
  if (message.isSystem) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="max-w-[80%] text-center text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100">
        <AvatarImage src={message.senderAvatar} />
        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-semibold">
          {message.senderName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className={`group relative flex flex-col min-w-0 max-w-[65%] ${
        isUser ? "items-end" : "items-start"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            {message.senderName}
          </span>
          <span className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors">
            {message.timestamp}
          </span>
        </div>
        {/* Hover actions for owner (edit/delete) and admin (delete) */}
        {(isUser || isAdmin) && (
          <div className={`absolute ${isUser ? "left-0" : "right-0"} -top-2 opacity-0 group-hover:opacity-100 transition-opacity`}> 
            <div className="flex items-center gap-1 bg-white/90 border border-gray-200 rounded-full px-2 py-1 shadow-sm">
              {isUser && !isEditing && (
                <button
                  className="p-1 hover:text-indigo-600"
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {(isUser || isAdmin) && (
                <button
                  className="p-1 hover:text-red-600"
                  onClick={() => setShowDelete(true)}
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {message.type === 'poll' && message.poll ? (
          <PollMessage
            message={message}
            currentUserId={currentUserId}
            onVote={onVotePoll}
            onPinToggle={isAdmin ? onPollPinToggle : undefined}
            groupId={groupId}
          />
        ) : message.type === 'voice' && message.audioBlob && message.duration ? (
          <VoiceMessage 
            audioBlob={message.audioBlob}
            duration={message.duration}
            isUser={isUser}
          />
        ) : message.type === 'image' && (message.imageUrl || message.fileUrl) ? (
          <div className="max-w-full">
            <img
              src={message.imageUrl || message.fileUrl}
              alt="Shared image"
              className="max-w-full max-h-64 rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.imageUrl || message.fileUrl, '_blank')}
            />
            {message.content && (
              <div className={`mt-2 px-3 py-2 rounded-lg ${
                isUser
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {renderTextWithLinks(message.content)}
                </div>
              </div>
            )}
          </div>
        ) : message.type === 'file' && message.fileUrl && message.fileName ? (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm break-words word-wrap overflow-wrap-anywhere max-w-full ${
              isUser
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}
          >
            <a
              href={message.fileUrl}
              download={message.fileName}
              className={`flex items-center gap-2 hover:underline ${isUser ? 'text-white' : 'text-blue-600'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span role="img" aria-label="attachment">📎</span>
              <span className={isUser ? 'text-white' : 'text-blue-600'}>{message.fileName}</span>
              <Download className={`ml-2 h-4 w-4 ${isUser ? 'text-red' : 'text-blue-500'}`} />
            </a>
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm break-words word-wrap overflow-wrap-anywhere max-w-full ${
              isUser
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}
          >
            {isEditing ? (
              <div className={`flex items-center gap-2 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                <textarea
                  className={`text-sm leading-relaxed w-full bg-transparent outline-none resize-none ${isUser ? 'placeholder-purple-100' : ''}`}
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  className="p-1 rounded hover:bg-white/20"
                  onClick={() => { onEditMessage?.(message.id, draft); setIsEditing(false); }}
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="p-1 rounded hover:bg-white/20"
                  onClick={() => { setDraft(message.content || ""); setIsEditing(false); }}
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderTextWithLinks(message.content)}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => { setShowDelete(false); onDeleteMessage?.(message.id); }}
        title="Delete message for everyone?"
        message="This action cannot be undone. The message will be removed for all participants."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default ChatMessage;