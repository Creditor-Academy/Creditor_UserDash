import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Circle,
  Wand2,
  Edit3,
  Brain,
  Zap,
  Target,
  BookOpen,
  FileText,
  List,
  Quote,
  Type,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import unifiedAIContentService from '@/services/unifiedAIContentService';

const AIWorkflowManager = ({
  lessonTitle,
  contentBlocks,
  onBlockGenerated,
  onWorkflowComplete,
  isActive = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [workflowActive, setWorkflowActive] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({});

  // Define AI workflow steps
  const workflowSteps = [
    {
      id: 'introduction',
      title: 'Introduction',
      description: 'Create an engaging lesson introduction',
      blockType: 'text',
      icon: <BookOpen className="w-4 h-4" />,
      prompt:
        'Create an engaging introduction that hooks learners and introduces the main topic',
      essential: true,
    },
    {
      id: 'objectives',
      title: 'Learning Objectives',
      description: 'Define clear learning goals',
      blockType: 'list',
      icon: <Target className="w-4 h-4" />,
      prompt: 'Create 3-5 clear, measurable learning objectives',
      essential: true,
    },
    {
      id: 'main-content',
      title: 'Main Content',
      description: 'Core lesson material',
      blockType: 'text',
      icon: <FileText className="w-4 h-4" />,
      prompt: 'Provide detailed explanation of the main concepts with examples',
      essential: true,
    },
    {
      id: 'key-points',
      title: 'Key Points',
      description: 'Important takeaways',
      blockType: 'list',
      icon: <List className="w-4 h-4" />,
      prompt: 'List the most important points students should remember',
      essential: false,
    },
    {
      id: 'insight',
      title: 'Key Insight',
      description: 'Important note or tip',
      blockType: 'quote',
      icon: <Quote className="w-4 h-4" />,
      prompt:
        'Create an insightful quote or important tip that reinforces learning',
      essential: false,
    },
    {
      id: 'summary',
      title: 'Summary',
      description: 'Lesson conclusion',
      blockType: 'text',
      icon: <CheckCircle className="w-4 h-4" />,
      prompt: 'Summarize the lesson and provide actionable next steps',
      essential: true,
    },
  ];

  // Calculate workflow progress
  const progress = (completedSteps.size / workflowSteps.length) * 100;
  const essentialSteps = workflowSteps.filter(step => step.essential);
  const essentialProgress =
    (essentialSteps.filter(step => completedSteps.has(step.id)).length /
      essentialSteps.length) *
    100;

  // Start AI workflow
  const startWorkflow = async () => {
    setWorkflowActive(true);
    setCurrentStep(0);

    // Generate content for all steps automatically
    for (let i = 0; i < workflowSteps.length; i++) {
      await generateStepContent(i);
      setCurrentStep(i + 1);

      // Small delay between generations for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setWorkflowActive(false);
    if (onWorkflowComplete) {
      onWorkflowComplete(generatedContent);
    }
  };

  // Generate content for specific step
  const generateStepContent = async stepIndex => {
    const step = workflowSteps[stepIndex];
    if (!step) return;

    setIsGenerating(true);

    try {
      const result = await unifiedAIContentService.generateContextualContent(
        lessonTitle,
        contentBlocks,
        step.blockType,
        step.prompt
      );

      if (result.success) {
        const newContent = {
          ...result,
          stepId: step.id,
          stepTitle: step.title,
          blockType: step.blockType,
        };

        setGeneratedContent(prev => ({
          ...prev,
          [step.id]: newContent,
        }));

        setCompletedSteps(prev => new Set([...prev, step.id]));

        // Notify parent component
        if (onBlockGenerated) {
          onBlockGenerated({
            id: `workflow-${step.id}-${Date.now()}`,
            type: step.blockType,
            content: result.content,
            metadata: {
              ...result.metadata,
              workflowStep: step.id,
              stepTitle: step.title,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to generate content for step ${step.id}:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate individual step on demand
  const generateSingleStep = async stepIndex => {
    setCurrentStep(stepIndex);
    await generateStepContent(stepIndex);
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setGeneratedContent({});
    setWorkflowActive(false);
  };

  // Check if step is available (previous essential steps completed)
  const isStepAvailable = stepIndex => {
    const step = workflowSteps[stepIndex];
    if (stepIndex === 0) return true;

    // Check if all previous essential steps are completed
    const previousEssentialSteps = workflowSteps
      .slice(0, stepIndex)
      .filter(s => s.essential);

    return previousEssentialSteps.every(s => completedSteps.has(s.id));
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Lesson Workflow
          </h3>
          <p className="text-sm text-gray-600">
            Automated content generation for "{lessonTitle}"
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={startWorkflow}
            disabled={workflowActive}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {workflowActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Workflow
              </>
            )}
          </Button>

          <Button onClick={resetWorkflow} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {completedSteps.size}/{workflowSteps.length} steps
              </span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Essential Steps</span>
              <span className="text-sm text-gray-600">
                {essentialSteps.filter(s => completedSteps.has(s.id)).length}/
                {essentialSteps.length} completed
              </span>
            </div>
            <Progress value={essentialProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-3">
        {workflowSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === index && workflowActive;
          const isAvailable = isStepAvailable(index);
          const hasContent = generatedContent[step.id];

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`transition-all duration-200 ${
                  isCurrent
                    ? 'border-purple-500 shadow-md'
                    : isCompleted
                      ? 'border-green-500 bg-green-50'
                      : isAvailable
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Step Status Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-purple-500 text-white animate-pulse'
                              : isAvailable
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isCurrent ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>

                      {/* Step Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          {step.icon}
                          <h4 className="font-medium text-gray-900">
                            {step.title}
                          </h4>
                          {step.essential && (
                            <Badge variant="secondary" className="text-xs">
                              Essential
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="flex items-center gap-2">
                      {hasContent && (
                        <Badge variant="outline" className="text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          Generated
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateSingleStep(index)}
                        disabled={!isAvailable || isGenerating}
                      >
                        {isGenerating && isCurrent ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Wand2 className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Generated Content Preview */}
                  <AnimatePresence>
                    {hasContent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-100"
                      >
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-medium text-gray-700">
                              AI Generated Content
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {typeof hasContent.content === 'string'
                              ? hasContent.content
                                  .replace(/<[^>]*>/g, '')
                                  .substring(0, 100) + '...'
                              : 'Content generated successfully'}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Workflow Summary */}
      {completedSteps.size > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                Workflow Progress
              </span>
            </div>
            <p className="text-sm text-green-700">
              {completedSteps.size} of {workflowSteps.length} steps completed.
              {essentialProgress === 100 &&
                ' All essential content has been generated!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIWorkflowManager;
