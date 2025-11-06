import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import AILessonContentGenerator from './AILessonContentGenerator';

const AIContentButton = ({
  lessonData,
  moduleData,
  courseData,
  onContentGenerated,
  disabled = false,
}) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAIContent = () => {
    setShowAIModal(true);
  };

  const handleContentGenerated = generatedBlocks => {
    setIsGenerating(false);
    setShowAIModal(false);
    if (onContentGenerated) {
      onContentGenerated(generatedBlocks);
    }
  };

  const handleModalClose = () => {
    setShowAIModal(false);
    setIsGenerating(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateAIContent}
        disabled={disabled || isGenerating}
        className="flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Sparkles className="h-4 w-4 mr-1" />
        )}
        Generate AI Content
      </Button>

      <AILessonContentGenerator
        isOpen={showAIModal}
        onClose={handleModalClose}
        lessonData={lessonData}
        moduleData={moduleData}
        courseData={courseData}
        onContentGenerated={handleContentGenerated}
      />
    </>
  );
};

export default AIContentButton;
