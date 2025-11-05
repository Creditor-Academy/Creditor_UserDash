import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Loader2, CheckCircle, X } from 'lucide-react';

/**
 * Lesson Builder Header Component
 * Shows back button, title, auto-save status, and action buttons
 * Extracts lines 4700-4800 from original LessonBuilder.jsx
 */
const LessonHeader = ({
  lessonData,
  lessonTitle,
  onBack,
  onPreview,
  onUpdate,
  autoSaveStatus,
  hasUnsavedChanges,
  isUploading,
  sidebarCollapsed,
}) => {
  return (
    <div
      className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30"
      style={{
        left: sidebarCollapsed ? 'calc(4.5rem + 16rem)' : 'calc(17rem + 16rem)',
      }}
    >
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

        <div className="flex items-center space-x-3">
          {/* Auto-save status indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    Auto-saving...
                  </span>
                </>
              )}
              {autoSaveStatus === 'saved' && hasUnsavedChanges === false && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Auto-saved</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">
                    Auto-save failed
                  </span>
                </>
              )}
            </div>
            {autoSaveStatus !== 'saving' && (
              <span className="text-xs text-gray-500 mt-0.5">
                Auto-save enabled
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>

          <Button
            size="sm"
            onClick={onUpdate}
            disabled={isUploading || autoSaveStatus === 'saving'}
            title={
              autoSaveStatus === 'error'
                ? 'Auto-save failed - click to save manually'
                : 'Manually save changes now'
            }
            variant={autoSaveStatus === 'error' ? 'destructive' : 'default'}
          >
            {isUploading || autoSaveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : autoSaveStatus === 'error' ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Save Now
              </>
            ) : (
              'Save Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
