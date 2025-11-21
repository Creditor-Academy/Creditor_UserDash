import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Loader2,
  BookOpen,
  FileText,
  HelpCircle,
  Lightbulb,
  Wand2,
  Brain,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import universalAILessonService from '@/services/universalAILessonService';
import devLogger from '@lessonbuilder/utils/devLogger';

const UniversalAIContentButton = ({
  lessonData,
  moduleData,
  courseData,
  onContentGenerated,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = '',
  buttonText = 'Generate AI Content',
  showIcon = true,
}) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    contentType: 'comprehensive',
    includeIntroduction: true,
    includeLearningObjectives: true,
    includeExamples: true,
    includeAssessments: true,
    includeSummary: true,
    includeInteractive: false,
  });

  const handleGenerateAIContent = () => {
    setShowAIModal(true);
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      devLogger.debug('🎯 Starting Universal AI Content Generation...');

      // Generate content using universal service
      const generatedBlocks =
        await universalAILessonService.generateLessonContent(
          lessonData,
          moduleData,
          courseData,
          generationOptions
        );

      devLogger.debug('✅ Generated blocks:', generatedBlocks);

      // If lesson has an ID, save directly to lesson
      if (lessonData?.id) {
        try {
          await universalAILessonService.saveContentToLesson(
            lessonData.id,
            generatedBlocks
          );
          toast.success(
            `Generated and saved ${generatedBlocks.length} content blocks to lesson!`
          );

          // IMPORTANT: Always pass to parent component even after successful save
          // This ensures the frontend state is updated immediately
          if (onContentGenerated) {
            onContentGenerated(generatedBlocks);
          }
        } catch (saveError) {
          devLogger.warn(
            'Could not save directly to lesson, passing to parent:',
            saveError
          );
          // Pass to parent component to handle
          if (onContentGenerated) {
            onContentGenerated(generatedBlocks);
          }
          toast.success(
            `Generated ${generatedBlocks.length} content blocks successfully!`
          );
        }
      } else {
        // Pass to parent component to handle
        if (onContentGenerated) {
          onContentGenerated(generatedBlocks);
        }
        toast.success(
          `Generated ${generatedBlocks.length} content blocks successfully!`
        );
      }

      setShowAIModal(false);
    } catch (error) {
      devLogger.error('❌ Universal AI generation failed:', error);
      toast.error('Failed to generate AI content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModalClose = () => {
    setShowAIModal(false);
    setIsGenerating(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerateAIContent}
        disabled={disabled || isGenerating}
        className={`flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 ${className}`}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : showIcon ? (
          <Sparkles className="h-4 w-4 mr-1" />
        ) : null}
        {isGenerating ? 'Generating...' : buttonText}
      </Button>

      <Dialog open={showAIModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Universal AI Content Generation
            </DialogTitle>
            <DialogDescription>
              Generate comprehensive lesson content for "
              {lessonData?.title || 'this lesson'}"
              {moduleData?.title && ` in module "${moduleData.title}"`}
              {courseData?.title && ` from course "${courseData.title}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Content Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Content Generation Type
              </Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    id="comprehensive"
                    name="contentType"
                    value="comprehensive"
                    checked={generationOptions.contentType === 'comprehensive'}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        contentType: e.target.value,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="comprehensive"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium">Comprehensive Lesson</div>
                        <div className="text-sm text-gray-500">
                          Generate complete lesson with introduction, concepts,
                          examples, practices, and summary
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    id="outline"
                    name="contentType"
                    value="outline"
                    checked={generationOptions.contentType === 'outline'}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        contentType: e.target.value,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="outline"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Structured Outline</div>
                        <div className="text-sm text-gray-500">
                          Generate organized outline with main topics and key
                          points
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Components Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Content Components</Label>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeIntroduction"
                    checked={generationOptions.includeIntroduction}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeIntroduction: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeIntroduction"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wand2 className="h-4 w-4 text-blue-600" />
                    Engaging introduction and overview
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeLearningObjectives"
                    checked={generationOptions.includeLearningObjectives}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeLearningObjectives: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeLearningObjectives"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 text-green-600" />
                    Clear learning objectives
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeExamples"
                    checked={generationOptions.includeExamples}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeExamples: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeExamples"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Practical examples and applications
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeAssessments"
                    checked={generationOptions.includeAssessments}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeAssessments: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeAssessments"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 text-red-600" />
                    Reflection questions and assessments
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeSummary"
                    checked={generationOptions.includeSummary}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeSummary: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeSummary"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Summary and key takeaways
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeInteractive"
                    checked={generationOptions.includeInteractive}
                    onChange={e =>
                      setGenerationOptions(prev => ({
                        ...prev,
                        includeInteractive: e.target.checked,
                      }))
                    }
                    className="text-purple-600"
                  />
                  <Label
                    htmlFor="includeInteractive"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-pink-600" />
                    Interactive elements and quotes
                  </Label>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                What will be generated:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-700">
                {generationOptions.includeIntroduction && (
                  <div>• Engaging introduction</div>
                )}
                {generationOptions.includeLearningObjectives && (
                  <div>• Learning objectives</div>
                )}
                {generationOptions.contentType === 'comprehensive' && (
                  <div>• Key concepts & principles</div>
                )}
                {generationOptions.includeExamples && (
                  <div>• Practical examples</div>
                )}
                {generationOptions.contentType === 'comprehensive' && (
                  <div>• Best practices & tips</div>
                )}
                {generationOptions.includeAssessments && (
                  <div>• Reflection questions</div>
                )}
                {generationOptions.includeSummary && (
                  <div>• Summary & takeaways</div>
                )}
                {generationOptions.includeInteractive && (
                  <div>• Interactive elements</div>
                )}
              </div>
              <div className="mt-2 text-xs text-purple-600">
                ✨ All content will be contextually relevant to your lesson,
                module, and course
              </div>
            </div>

            {/* Lesson Context Display */}
            <div className="bg-gray-50 border rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">
                Content Context:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Lesson:</strong> {lessonData?.title || 'Unknown'}
                </div>
                {moduleData?.title && (
                  <div>
                    <strong>Module:</strong> {moduleData.title}
                  </div>
                )}
                {courseData?.title && (
                  <div>
                    <strong>Course:</strong> {courseData.title}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleModalClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={generateAIContent}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UniversalAIContentButton;
