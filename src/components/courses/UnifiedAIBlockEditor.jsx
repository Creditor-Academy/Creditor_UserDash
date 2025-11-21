import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Type,
  Image as ImageIcon,
  Video,
  List,
  Quote,
  Table,
  Wand2,
  Brain,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Trash2,
  Copy,
  GripVertical,
  RefreshCw,
  Lightbulb,
  Zap,
  Target,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { contentBlockTypes } from '@lessonbuilder/constants/blockTypes';
import enhancedAIService from '@/services/enhancedAIService';
import unifiedAIContentService from '@/services/unifiedAIContentService';
import AIWorkflowManager from './AIWorkflowManager';

const UnifiedAIBlockEditor = ({
  lessons,
  contentBlocks,
  setContentBlocks,
  editingLessonId,
  setEditingLessonId,
  courseTitle = '',
  onContentSync = () => {},
}) => {
  const [aiMode, setAiMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedBlockType, setSelectedBlockType] = useState(null);
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [contextualHelp, setContextualHelp] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowMode, setWorkflowMode] = useState(false);

  const currentLesson = lessons.find(l => l.id === editingLessonId);
  const currentBlocks = contentBlocks[editingLessonId] || [];

  // AI-powered content suggestions based on lesson context
  const generateSmartSuggestions = async (lessonTitle, existingContent) => {
    try {
      const prompt = `Based on the lesson "${lessonTitle}" and existing content, suggest 3 relevant content blocks that would enhance learning. Format as JSON array with: type, title, description, content`;

      const result = await enhancedAIService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.7,
      });

      if (result.success) {
        try {
          const suggestions = JSON.parse(result.content);
          setSmartSuggestions(suggestions.slice(0, 3));
        } catch {
          // Fallback suggestions
          setSmartSuggestions([
            {
              type: 'text',
              title: 'Key Concepts',
              description: 'Explain main concepts',
              content: 'Define and explain the key concepts...',
            },
            {
              type: 'list',
              title: 'Learning Points',
              description: 'Bullet point summary',
              content: '• Point 1\n• Point 2\n• Point 3',
            },
            {
              type: 'quote',
              title: 'Important Note',
              description: 'Highlight key information',
              content: 'Remember: This is crucial for understanding...',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error);
    }
  };

  // Generate AI content for specific block type
  const generateAIContent = async (blockType, customPrompt = '') => {
    setIsGenerating(true);
    try {
      const lessonContext = currentLesson
        ? `for lesson "${currentLesson.title}"`
        : '';
      const basePrompt =
        customPrompt ||
        `Create ${blockType} content ${lessonContext} about ${courseTitle}`;

      const result = await enhancedAIService.generateText(basePrompt, {
        maxTokens: 300,
        temperature: 0.8,
      });

      if (result.success) {
        const newBlock = {
          id: `block-${Date.now()}-${Math.random()}`,
          type: blockType,
          content: formatContentByType(blockType, result.content),
          order: currentBlocks.length + 1,
          settings: { aiGenerated: true },
          createdAt: new Date().toISOString(),
        };

        setContentBlocks(prev => ({
          ...prev,
          [editingLessonId]: [...currentBlocks, newBlock],
        }));

        onContentSync({
          type: 'ai_block_add',
          lessonId: editingLessonId,
          blockType,
          blockId: newBlock.id,
        });
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Format content based on block type
  const formatContentByType = (type, content) => {
    switch (type) {
      case 'text':
        return `<p>${content}</p>`;
      case 'heading':
        return `<h2>${content}</h2>`;
      case 'list':
        const items = content.split('\n').filter(item => item.trim());
        return items.map(item => `• ${item.trim()}`).join('\n');
      case 'quote':
        return `"${content}"`;
      case 'image':
        return { url: '', alt: content, caption: content, width: '100%' };
      default:
        return content;
    }
  };

  // Enhanced block rendering with AI assistance
  const renderEnhancedBlock = (block, index) => {
    const isAIGenerated = block.settings?.aiGenerated;

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`relative group border rounded-lg p-4 mb-4 transition-all duration-200 ${
          isAIGenerated
            ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {/* AI Badge */}
        {isAIGenerated && (
          <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
        )}

        {/* Block Controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => enhanceBlockWithAI(block.id)}
            className="h-6 w-6 p-0"
          >
            <Wand2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => duplicateBlock(block.id)}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteBlock(block.id)}
            className="h-6 w-6 p-0 text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Block Content */}
        <div className="pr-20">{renderBlockContent(block)}</div>

        {/* AI Enhancement Suggestions */}
        {aiMode && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Brain className="w-3 h-3" />
              <span>
                AI suggests: Add examples, include visuals, or expand with
                details
              </span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Render block content based on type
  const renderBlockContent = block => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            value={
              typeof block.content === 'string'
                ? block.content.replace(/<[^>]*>/g, '')
                : ''
            }
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full min-h-[100px] resize-none border-0 p-0 focus:ring-0"
            placeholder="Enter your text content..."
          />
        );
      case 'heading':
        return (
          <Input
            value={
              typeof block.content === 'string'
                ? block.content.replace(/<[^>]*>/g, '')
                : ''
            }
            onChange={e => updateBlock(block.id, e.target.value)}
            className="text-xl font-semibold border-0 p-0 focus:ring-0"
            placeholder="Enter heading..."
          />
        );
      case 'list':
        return (
          <Textarea
            value={typeof block.content === 'string' ? block.content : ''}
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full min-h-[80px] resize-none border-0 p-0 focus:ring-0"
            placeholder="• List item 1&#10;• List item 2"
          />
        );
      default:
        return (
          <div className="text-gray-500 text-sm">
            {block.type} block - Advanced editor coming soon
          </div>
        );
    }
  };

  // Update block content
  const updateBlock = (blockId, content) => {
    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: prev[editingLessonId].map(block =>
        block.id === blockId
          ? { ...block, content, updatedAt: new Date().toISOString() }
          : block
      ),
    }));
  };

  // Enhance existing block with AI
  const enhanceBlockWithAI = async blockId => {
    const block = currentBlocks.find(b => b.id === blockId);
    if (!block) return;

    setIsGenerating(true);
    try {
      const prompt = `Enhance this ${block.type} content: "${block.content}". Make it more engaging and educational.`;
      const result = await enhancedAIService.generateText(prompt, {
        maxTokens: 200,
      });

      if (result.success) {
        updateBlock(blockId, formatContentByType(block.type, result.content));
      }
    } catch (error) {
      console.error('Block enhancement failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Duplicate block
  const duplicateBlock = blockId => {
    const block = currentBlocks.find(b => b.id === blockId);
    if (block) {
      const newBlock = {
        ...block,
        id: `block-${Date.now()}-${Math.random()}`,
        order: currentBlocks.length + 1,
        settings: { ...block.settings, duplicated: true },
      };

      setContentBlocks(prev => ({
        ...prev,
        [editingLessonId]: [...prev[editingLessonId], newBlock],
      }));
    }
  };

  // Delete block
  const deleteBlock = blockId => {
    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: prev[editingLessonId].filter(
        block => block.id !== blockId
      ),
    }));
  };

  // Generate smart suggestions when lesson changes
  useEffect(() => {
    if (currentLesson && aiMode) {
      generateSmartSuggestions(currentLesson.title, currentBlocks);
    }
  }, [editingLessonId, aiMode]);

  if (!editingLessonId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a lesson to start editing content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* AI Sidebar */}
      {showAISidebar && (
        <div className="w-80 border-r border-gray-200 bg-gradient-to-b from-purple-50 to-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showWorkflow ? 'default' : 'outline'}
                onClick={() => setShowWorkflow(!showWorkflow)}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Workflow
              </Button>
              <Switch
                checked={aiMode}
                onCheckedChange={setAiMode}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>

          {/* AI Workflow Manager */}
          {showWorkflow && currentLesson && (
            <div className="mb-4">
              <AIWorkflowManager
                lessonTitle={currentLesson.title}
                contentBlocks={currentBlocks}
                onBlockGenerated={block => {
                  const newBlock = {
                    ...block,
                    order: currentBlocks.length + 1,
                    createdAt: new Date().toISOString(),
                  };

                  setContentBlocks(prev => ({
                    ...prev,
                    [editingLessonId]: [...currentBlocks, newBlock],
                  }));

                  onContentSync({
                    type: 'workflow_block_add',
                    lessonId: editingLessonId,
                    blockType: block.type,
                    blockId: block.id,
                    workflowStep: block.metadata?.workflowStep,
                  });
                }}
                onWorkflowComplete={generatedContent => {
                  console.log('🎯 AI Workflow completed:', generatedContent);
                  setWorkflowMode(false);
                }}
                isActive={workflowMode}
              />
            </div>
          )}

          {/* AI Content Generation */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Generate Content
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  {['text', 'heading', 'list', 'quote'].map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => generateAIContent(type, aiPrompt)}
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        getBlockIcon(type)
                      )}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Smart Suggestions
                </Label>
                <div className="mt-2 space-y-2">
                  {smartSuggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {getBlockIcon(suggestion.type)}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {suggestion.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {suggestion.description}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                generateAIContent(
                                  suggestion.type,
                                  suggestion.content
                                )
                              }
                              className="mt-1 h-6 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Quick Actions
              </Label>
              <div className="mt-2 space-y-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    generateAIContent('text', 'Create an engaging introduction')
                  }
                  className="w-full justify-start text-xs"
                >
                  <Zap className="w-3 h-3 mr-2" />
                  Add Introduction
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    generateAIContent('list', 'Create key learning objectives')
                  }
                  className="w-full justify-start text-xs"
                >
                  <Target className="w-3 h-3 mr-2" />
                  Add Objectives
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    generateAIContent('quote', 'Add an important note or tip')
                  }
                  className="w-full justify-start text-xs"
                >
                  <Quote className="w-3 h-3 mr-2" />
                  Add Key Point
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentLesson?.title || 'Untitled Lesson'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentBlocks.length} content blocks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAISidebar(!showAISidebar)}
              >
                <Brain className="w-4 h-4 mr-1" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentBlocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto mb-2" />
                <p>No content blocks yet</p>
                <p className="text-sm">
                  Use AI Assistant to generate content or add blocks manually
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBlocks.map((block, index) =>
                renderEnhancedBlock(block, index)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get block icons
const getBlockIcon = type => {
  const iconMap = {
    text: <Type className="w-3 h-3" />,
    heading: <Type className="w-3 h-3" />,
    list: <List className="w-3 h-3" />,
    quote: <Quote className="w-3 h-3" />,
    image: <ImageIcon className="w-3 h-3" />,
    video: <Video className="w-3 h-3" />,
    table: <Table className="w-3 h-3" />,
  };
  return iconMap[type] || <Type className="w-3 h-3" />;
};

export default UnifiedAIBlockEditor;
