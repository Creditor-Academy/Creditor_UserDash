import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { textTypes } from '@/constants/LessonBuilder/textTypes';

const TextTypeSidebar = ({ isOpen, onTextTypeSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      <div className="w-[480px] bg-white shadow-2xl animate-slide-in-left">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Choose Text Type</h3>
              <p className="text-sm text-gray-600 mt-2">
                Select the type of text content you want to add
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          {textTypes.map((textType) => (
            <div 
              key={textType.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-gray-300 overflow-hidden"
              onClick={() => onTextTypeSelect(textType)}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 hover:bg-green-200 transition-colors">
                    {textType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      {textType.id.replace('_', ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h3>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                      {textType.preview}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-black bg-opacity-50" onClick={onClose} />
    </div>
  );
};

export default TextTypeSidebar;