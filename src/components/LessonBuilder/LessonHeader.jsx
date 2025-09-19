import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Loader2, Sparkles } from 'lucide-react';

const LessonHeader = ({ 
  lessonTitle,
  lessonData,
  onBack,
  onView,
  onSave,
  onUpdate,
  isUploading,
  onAIEnhance
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-[800px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-lg font-bold">
            {lessonData?.title || lessonTitle || 'Untitled Lesson'}
          </h1>
        </div>
       
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAIEnhance}
            className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          >
            <Sparkles className="h-4 w-4" />
            AI Enhance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
         
          <Button variant="outline" size="sm" onClick={onSave}>
            Save as Draft
          </Button>
          <Button
            size="sm"
            onClick={onUpdate}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;