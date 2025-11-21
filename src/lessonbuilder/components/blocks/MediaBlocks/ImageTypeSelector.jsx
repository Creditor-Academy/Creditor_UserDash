import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { imageTemplates } from '@lessonbuilder/constants/imageTemplates';

const ImageTypeSelector = ({ open, onClose, selectedImage, onConfirm }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Filter out AI-generated template as it's not applicable for gallery images
  const availableTemplates = imageTemplates.filter(
    t => t.id !== 'ai-generated'
  );

  const handleConfirm = () => {
    if (selectedTemplate && selectedImage) {
      onConfirm({
        ...selectedImage,
        template: selectedTemplate,
      });
      setSelectedTemplate(null);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  if (!open || !selectedImage) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[60]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Select Image Type
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Choose how you want to display this image in your lesson
          </p>
        </DialogHeader>

        {/* Selected Image Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={selectedImage.url}
                alt={selectedImage.fileName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedImage.fileName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {selectedImage.folder}
              </p>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Choose Layout Type:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                  >
                    {template.icon || <Image className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {template.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="min-w-[120px]"
          >
            Add to Lesson
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageTypeSelector;
