import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UniversalAIContentButton from './UniversalAIContentButton';
import devLogger from '@lessonbuilder/utils/devLogger';

/**
 * Integration component for LessonBuilder to handle AI content generation
 * This component can be easily added to any lesson builder interface
 */
const LessonBuilderAIIntegration = ({
  lessonData,
  moduleData,
  courseData,
  contentBlocks,
  setContentBlocks,
  handleUpdate,
  toast,
}) => {
  const location = useLocation();
  const [showAIModal, setShowAIModal] = useState(false);

  // Auto-open AI modal if navigated with openAIGenerator flag
  useEffect(() => {
    const state = location.state;
    if (state?.openAIGenerator) {
      setShowAIModal(true);
    }
  }, [location.state]);

  const handleAIContentGenerated = generatedBlocks => {
    devLogger.debug(
      '🎯 AI Content Generated for Lesson Builder:',
      generatedBlocks
    );

    // Add generated blocks to existing content
    const newBlocks = generatedBlocks.map((block, index) => ({
      ...block,
      order: contentBlocks.length + index,
      id: block.id || `ai-block-${Date.now()}-${index}`,
    }));

    setContentBlocks(prev => [...prev, ...newBlocks]);

    // Auto-save the lesson after a short delay
    setTimeout(() => {
      if (handleUpdate) {
        handleUpdate();
      }
    }, 500);

    if (toast) {
      toast.success(
        `Added ${generatedBlocks.length} AI-generated content blocks!`
      );
    }
  };

  return (
    <>
      {/* AI Content Button for Header */}
      <UniversalAIContentButton
        lessonData={lessonData}
        moduleData={moduleData}
        courseData={courseData}
        onContentGenerated={handleAIContentGenerated}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
        buttonText="Generate AI Content"
        showIcon={true}
      />

      {/* Auto-open modal if navigated with flag */}
      {showAIModal && (
        <UniversalAIContentButton
          lessonData={lessonData}
          moduleData={moduleData}
          courseData={courseData}
          onContentGenerated={blocks => {
            handleAIContentGenerated(blocks);
            setShowAIModal(false);
          }}
          variant="outline"
          size="sm"
          className="hidden" // Hidden component just for modal functionality
          buttonText=""
          showIcon={false}
        />
      )}
    </>
  );
};

export default LessonBuilderAIIntegration;
