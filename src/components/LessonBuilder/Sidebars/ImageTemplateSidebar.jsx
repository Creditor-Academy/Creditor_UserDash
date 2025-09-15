import React from 'react';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

const ImageTemplateSidebar = ({ 
  isOpen, 
  onClose, 
  imageTemplates, 
  onImageTemplateSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
        onClick={onClose}
      />
     
      {/* Sidebar */}
      <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Image className="h-6 w-6" />
              Image Templates
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              ×
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Choose a template to add to your lesson
          </p>
        </div>
       
        <div className="p-6 space-y-4">
          {imageTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onImageTemplateSelect(template)}
              className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">{template.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              </div>
             
              {/* Mini Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                {template.layout === 'side-by-side' && (
                  <div className="flex gap-3 items-start">
                    <div className="w-1/2">
                      <img
                        src={template.defaultContent.imageUrl}
                        alt="Preview"
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                    <div className="w-1/2">
                      <p className="text-xs text-gray-600 line-clamp-4">
                        {template.defaultContent.text.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                )}
                {template.layout === 'overlay' && (
                  <div className="relative">
                    <img
                      src={template.defaultContent.imageUrl}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded flex items-center justify-center p-2">
                      <p className="text-white text-sm text-center line-clamp-3">
                        {template.defaultContent.text.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                )}
                {template.layout === 'centered' && (
                  <div className="text-center space-y-2">
                    <img
                      src={template.defaultContent.imageUrl}
                      alt="Preview"
                      className="mx-auto h-20 object-cover rounded"
                    />
                    <p className="text-xs text-gray-600 italic line-clamp-2">
                      {template.defaultContent.text.substring(0, 40)}...
                    </p>
                  </div>
                )}
                {template.layout === 'full-width' && (
                  <div className="space-y-2">
                    <img
                      src={template.defaultContent.imageUrl}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {template.defaultContent.text.substring(0, 60)}...
                    </p>
                  </div>
                )}
                {template.layout === 'ai-generated' && (
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-medium">AI Generated</span>
                    </div>
                    <p className="text-xs text-gray-600 italic line-clamp-2">
                      Generate custom images using AI prompts
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageTemplateSidebar;