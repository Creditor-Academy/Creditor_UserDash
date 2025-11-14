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
import contentBlockAIService from '../../services/contentBlockAIService';
import openAIService from '../../../services/openAIService';
import { formatAIContentForBlock } from '@lessonbuilder/utils/aiContentHelpers';
import devLogger from '@lessonbuilder/utils/devLogger';

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
      setGeneratedContent(null);
      setPreviewBlock(null);
      setShowPreview(false);
    }
  }, [show]);

  const handleEnhancePrompt = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      // Use the proper backend URL
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

      const response = await fetch(`${API_BASE}/api/ai-proxy/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          enhancePrompt: true,
          title: courseContext?.lessonTitle,
          subject: courseContext?.courseName,
          difficulty: 'intermediate',
          systemPrompt: `You are an expert prompt engineer. Enhance the following user prompt to be more specific, clear, and effective for generating ${blockType?.title?.toLowerCase()} content. Return ONLY the enhanced prompt without any additional text or explanations.`,
          maxTokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to enhance prompt: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const enhancedPrompt = result.data?.text?.trim() || userPrompt;

      setUserPrompt(enhancedPrompt);
      toast.success('Prompt enhanced successfully!');
    } catch (error) {
      devLogger.error('Prompt enhancement error:', error);
      toast.error('Failed to enhance prompt. Using original.');
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
      devLogger.error('AI generation error:', error);
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
  const [previewBlock, setPreviewBlock] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGeneratePreview = async () => {
    if (!userPrompt.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    setIsGenerating(true);
    setShowPreview(true);

    try {
      let generatedContent;
      let previewFormatSource = null;

      // Handle image generation separately
      if (blockType?.id === 'image') {
        devLogger.debug('🎨 Generating AI image with DALL-E...');
        const imageResult = await openAIService.generateImage(userPrompt, {
          size: '1024x1024',
          quality: 'standard',
        });

        const imageUrl = imageResult?.data?.url || imageResult?.url;
        const imageTitle =
          imageResult?.data?.title ||
          imageResult?.imageTitle ||
          `AI Generated: ${userPrompt.substring(0, 50)}...`;

        if (imageResult?.success && imageUrl) {
          generatedContent = {
            type: 'image',
            template: selectedTemplate,
            content: {
              imageUrl,
              imageTitle,
              imageDescription: imageResult?.data?.description || userPrompt,
              captionText:
                imageResult?.data?.caption ||
                imageResult?.captionText ||
                `Generated with DALL-E 3`,
            },
          };
          previewFormatSource = {
            type: 'image',
            templateId: selectedTemplate,
            content: JSON.stringify({
              ...generatedContent.content,
              alignment: 'center',
            }),
          };
        } else {
          devLogger.error('Image generation failed:', imageResult);
          const errorMessage =
            imageResult?.error ||
            imageResult?.message ||
            'Failed to generate image';
          throw new Error(errorMessage);
        }
      } else {
        // Generate other content types using content block AI service
        devLogger.debug(`🤖 Generating ${blockType?.id} content...`);
        const contentResult = await contentBlockAIService.generateContentBlock({
          blockType: blockType?.id,
          templateId: selectedTemplate,
          userPrompt: userPrompt.trim(),
          instructions: '',
          courseContext: courseContext || {},
        });

        generatedContent = {
          type: contentResult.type,
          template: selectedTemplate,
          content: contentResult.content,
          rawData: contentResult, // Store full result for later use
        };
        previewFormatSource = {
          ...contentResult,
          templateId: contentResult.templateId || selectedTemplate,
        };
      }

      setGeneratedContent(generatedContent);

      if (previewFormatSource && blockType?.id) {
        try {
          const formatted = formatAIContentForBlock(
            previewFormatSource,
            blockType.id
          );
          setPreviewBlock(formatted);
        } catch (formatError) {
          devLogger.error('Preview formatting error:', formatError);
          setPreviewBlock(null);
        }
      } else {
        setPreviewBlock(null);
      }

      toast.success('Content generated successfully!');
    } catch (error) {
      devLogger.error('AI generation error:', error);
      toast.error(
        error.message || 'Failed to generate content. Please try again.'
      );
      setShowPreview(false);
      setPreviewBlock(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLesson = async () => {
    try {
      // Pass the generated content data to the parent component
      await onGenerate({
        userPrompt: userPrompt.trim(),
        instructions: '',
        templateId: selectedTemplate,
        generatedContent: generatedContent?.rawData || generatedContent, // Pass the actual generated content
      });

      toast.success('Content added to lesson!');
      onClose();
    } catch (error) {
      devLogger.error('Add to lesson error:', error);
      toast.error('Failed to add content to lesson');
    }
  };

  // Render preview content based on block type
  const renderPreviewContent = content => {
    if (!content) return null;

    if (previewBlock?.html_css) {
      return (
        <div dangerouslySetInnerHTML={{ __html: previewBlock.html_css }} />
      );
    }

    switch (content.type) {
      case 'image':
        return (
          <div className="space-y-3">
            {content.content?.imageUrl && (
              <img
                src={content.content.imageUrl}
                alt={content.content?.imageTitle || 'Generated image'}
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              />
            )}
            {content.content?.imageTitle && (
              <h4 className="font-semibold text-gray-800">
                {content.content.imageTitle}
              </h4>
            )}
            {content.content?.captionText && (
              <p className="text-sm text-gray-600 italic">
                {content.content.captionText}
              </p>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </div>
        );

      case 'statement':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-gray-800 font-medium italic">
              {content.content}
            </p>
          </div>
        );

      case 'quote':
        try {
          const quoteData = JSON.parse(content.content);
          return (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
              <p>"{quoteData.quote}"</p>
              <footer className="text-sm text-gray-500 mt-2">
                — {quoteData.author}
              </footer>
            </blockquote>
          );
        } catch (e) {
          return <p className="text-gray-800">{content.content}</p>;
        }

      case 'list':
        try {
          const listData = JSON.parse(content.content);
          return (
            <ul className="list-disc list-inside space-y-2">
              {listData.items?.map((item, index) => (
                <li key={index} className="text-gray-800">
                  {item}
                </li>
              ))}
            </ul>
          );
        } catch (e) {
          return <p className="text-gray-800">{content.content}</p>;
        }

      case 'table':
        try {
          const tableData = JSON.parse(content.content);
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {tableData.headers?.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.data?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-sm text-gray-600"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } catch (e) {
          return <p className="text-gray-800">{content.content}</p>;
        }

      case 'interactive':
        try {
          const interactiveData = JSON.parse(content.content);
          if (interactiveData.sections) {
            return (
              <div className="space-y-3">
                {interactiveData.sections.map((section, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <h5 className="font-semibold text-gray-800 mb-2">
                      {section.title}
                    </h5>
                    <p className="text-gray-600 text-sm">{section.content}</p>
                  </div>
                ))}
              </div>
            );
          }
          return <p className="text-gray-800">{content.content}</p>;
        } catch (e) {
          return <p className="text-gray-800">{content.content}</p>;
        }

      case 'divider':
        return (
          <div className="flex items-center justify-center py-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
              {content.content}
            </div>
          </div>
        );

      default:
        return <p className="text-gray-800">{content.content}</p>;
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

                  {/* Render content based on blockType with proper styling */}
                  <div className="prose prose-sm max-w-none">
                    {renderPreviewContent(generatedContent)}
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
