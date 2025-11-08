import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Image, BarChart2 } from "lucide-react";

export function AttachmentModal({ 
  isOpen, 
  onClose, 
  onImageSelect,
  onPollCreate
}) {
  const imageInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      onClose();
    }
  };


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Attach File</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Options */}
          <div className="p-6">
            <div className="flex justify-center gap-4">
              {/* Image Option */}
              <Button
                variant="outline"
                className="h-24 w-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={handleImageClick}
              >
                <Image className="h-8 w-8 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Image</span>
              </Button>

              {/* Poll Option */}
              <Button
                variant="outline"
                className="h-24 w-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                onClick={() => { onPollCreate?.(); onClose(); }}
              >
                <BarChart2 className="h-8 w-8 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Poll</span>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Select an image or create a poll</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for images */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
      />
    </>
  );
}

export default AttachmentModal;
