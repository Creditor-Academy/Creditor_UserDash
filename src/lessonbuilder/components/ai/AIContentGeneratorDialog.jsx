import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Info, Wand2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Universal AI Content Generator Dialog
 * Works for all 13 content block types with context-aware generation
 */
const AIContentGeneratorDialog = ({
  show,
  onClose,
  blockType,
  courseContext,
  onGenerate,
  availableTemplates = [],
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Set default template when templates change
  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(availableTemplates[0].id);
    }
  }, [availableTemplates, selectedTemplate]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!show) {
      setUserPrompt('');
      setIsGenerating(false);
      setIsEnhancing(false);
    }
  }, [show]);

  const handleEnhancePrompt = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      // Enhance the prompt with AI
      const enhancedPrompt = `Create detailed ${blockType?.title?.toLowerCase()} content about: ${userPrompt}. Include relevant examples, clear explanations, and professional formatting. Context: ${courseContext?.courseName} - ${courseContext?.moduleName} - ${courseContext?.lessonTitle}.`;

      setUserPrompt(enhancedPrompt);
      toast.success('Prompt enhanced successfully!');
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      toast.error('Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    setIsGenerating(true);

    try {
      await onGenerate({
        userPrompt: userPrompt.trim(),
        instructions: '',
        templateId: selectedTemplate,
      });

      toast.success('Content generated successfully!');
      onClose();
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(
        error.message || 'Failed to generate content. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getPlaceholder = () => {
    const placeholders = {
      text: 'e.g., "Explain the concept of variables in JavaScript for beginners"',
      statement:
        'e.g., "Create an inspiring quote about the importance of continuous learning"',
      quote:
        'e.g., "Add a motivational quote from Steve Jobs about innovation"',
      image:
        'e.g., "Create an image showing the React component lifecycle diagram"',
      list: 'e.g., "List 5 best practices for writing clean, maintainable code"',
      tables:
        'e.g., "Create a comparison table of React, Vue, and Angular features"',
      interactive:
        'e.g., "Create a timeline showing the evolution of JavaScript from 1995 to present"',
      video:
        'e.g., "Find a tutorial video explaining async/await in JavaScript"',
      audio:
        'e.g., "Create an audio explanation of JavaScript closures for beginners"',
      link: 'e.g., "Add a link to MDN documentation about JavaScript arrays"',
      pdf: 'e.g., "Add a reference to a JavaScript cheat sheet PDF"',
      divider: 'e.g., "Add a section divider with the number 3"',
      youtube:
        'e.g., "Embed a YouTube video about React hooks from Traversy Media"',
    };

    return (
      placeholders[blockType?.id] ||
      'Describe what you want to create in detail...'
    );
  };

  const getExamples = () => {
    const examples = {
      text: [
        'Explain how JavaScript hoisting works',
        'Write an introduction to async programming',
        'Describe the benefits of using TypeScript',
      ],
      statement: [
        'Create a note about code quality',
        'Add a highlighted text about best practices',
        'Write an elegant quote about learning',
      ],
      quote: [
        'Quote from Linus Torvalds about software design',
        'Inspirational quote about problem-solving',
        'Famous saying about debugging',
      ],
      list: [
        'List 7 JavaScript array methods every developer should know',
        'Create a checklist for code review best practices',
        'List steps to set up a React project',
      ],
      tables: [
        'Compare SQL vs NoSQL databases',
        'Create a pricing table for subscription plans',
        'Show differences between var, let, and const',
      ],
      interactive: [
        'Create an accordion showing JavaScript fundamentals',
        'Build a tab interface for different programming paradigms',
        'Timeline of web development milestones',
      ],
    };

    return examples[blockType?.id] || [];
  };

  // State for generated content preview
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGeneratePreview = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    setIsGenerating(true);
    setShowPreview(true);

    try {
      // Simulate AI generation for preview
      // TODO: Replace with actual AI generation
      const mockContent = {
        type: blockType?.id,
        content: `Generated ${blockType?.title} content based on: "${userPrompt}"`,
        template: selectedTemplate,
      };

      setGeneratedContent(mockContent);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(
        error.message || 'Failed to generate content. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLesson = async () => {
    try {
      await onGenerate({
        userPrompt: userPrompt.trim(),
        instructions: '',
        templateId: selectedTemplate,
      });

      toast.success('Content added to lesson!');
      onClose();
    } catch (error) {
      console.error('Add to lesson error:', error);
      toast.error('Failed to add content to lesson');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar Dialog */}
      <div className="relative bg-white w-full max-w-6xl h-full shadow-xl overflow-hidden animate-slide-in-left flex">
        {/* Left Panel - Input */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Generate {blockType?.title} with AI
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Describe what you want to create
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Context Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">
                    {courseContext?.courseName}
                  </span>{' '}
                  → {courseContext?.moduleName} → {courseContext?.lessonTitle}
                </p>
              </div>
            </div>

            {/* Main Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-900">
                  What do you want to create?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || isGenerating || !userPrompt.trim()}
                  className="h-7 text-xs flex items-center gap-1 hover:bg-purple-50 hover:border-purple-300"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  Enhance
                </Button>
              </div>
              <textarea
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full min-h-[120px] p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                disabled={isGenerating || isEnhancing}
              />

              {/* Quick Examples */}
              {getExamples().length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Quick examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {getExamples()
                      .slice(0, 3)
                      .map((example, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors text-xs py-1 px-3"
                          onClick={() => setUserPrompt(example)}
                        >
                          {example}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Template Selection */}
            {availableTemplates.length > 0 && (
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-900">
                  Template Style
                </label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full h-10 text-sm border-2 border-gray-200 rounded-lg focus:border-purple-500">
                    <SelectValue placeholder="Choose a template style" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map(template => (
                      <SelectItem
                        key={template.id}
                        value={template.id}
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.title}</span>
                          {template.description && (
                            <span className="text-xs text-gray-500">
                              - {template.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePreview}
              disabled={!userPrompt.trim() || isGenerating || isEnhancing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Preview
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <p className="text-sm text-gray-600">
                  Generated content will appear here
                </p>
              </div>
              {generatedContent && (
                <Button
                  onClick={handleAddToLesson}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Lesson
                </Button>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!showPreview ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No content generated yet</p>
                <p className="text-sm">
                  Fill in the prompt and click "Generate Preview"
                </p>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Generated {blockType?.title}
                    </span>
                  </div>

                  {/* TODO: Render content based on blockType with proper styling */}
                  <div className="prose prose-sm max-w-none">
                    <p>{generatedContent.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                <p className="text-lg font-medium">Generating content...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentGeneratorDialog;
