import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile } from "lucide-react";
import { AttachmentModal } from "./AttachmentModal";
import { ImagePreview } from "./ImagePreview";
import { EmojiPicker } from "./EmojiPicker";
import PollComposer from "./PollComposer";

export function ChatInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  onFileSelect,
  onImageSelect,
  onCreatePoll,
  selectedImage,
  isSending = false
}) {
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentModal(true);
  };

  const handleImageSelect = (file) => {
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleCancelImage = () => {
    if (onImageSelect) {
      onImageSelect(null);
    }
  };


  const handleEmojiClick = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  if (selectedImage) {
    return (
      <ImagePreview
        imageFile={selectedImage}
        onSend={onSendMessage}
        onCancel={handleCancelImage}
        isSending={isSending}
      />
    );
  }

  return (
    <div className="border-t bg-gray-50 p-4 flex-shrink-0">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAttachmentClick}
            className="absolute left-3 bottom-3 h-7 w-7 text-gray-400 hover:text-gray-600 z-10"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEmojiClick}
            className="absolute right-12 bottom-3 h-7 w-7 text-gray-400 hover:text-gray-600 z-10"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-12 pr-20 min-h-[48px] text-sm resize-none rounded-2xl border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <Button 
          onClick={onSendMessage}
          disabled={!newMessage.trim() && !selectedImage}
          size="icon"
          className="h-[48px] w-[48px] rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onImageSelect={handleImageSelect}
        onPollCreate={() => setShowPollComposer(true)}
      />

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      <PollComposer
        isOpen={showPollComposer}
        onClose={() => setShowPollComposer(false)}
        onCreate={(payload) => {
          onCreatePoll?.(payload);
          setShowPollComposer(false);
        }}
      />
    </div>
  );
}

export default ChatInput;