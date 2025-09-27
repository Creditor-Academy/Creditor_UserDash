import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Smile } from "lucide-react";

// Simple faces emojis for now
const facesEmojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
  "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
  "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
  "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", 
  "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
  "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠"
];

export function EmojiPicker({ isOpen, onClose, onEmojiSelect }) {
  if (!isOpen) return null;

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Choose Emoji</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Emoji Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-500 mb-2">
            Showing {facesEmojis.length} face emojis
          </div>
          <div className="grid grid-cols-8 gap-2">
            {facesEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Smile className="h-4 w-4" />
            <span>Click an emoji to add it to your message</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmojiPicker;
