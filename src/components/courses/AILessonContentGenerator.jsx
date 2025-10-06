import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, BookOpen, FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';
import enhancedAIService from '@/services/enhancedAIService';

const AILessonContentGenerator = ({ 
  isOpen, 
  onClose, 
  lessonData, 
  moduleData, 
  courseData,
  onContentGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    contentType: 'comprehensive',
    includeAssessments: true,
    includeInteractive: true,
    includeExamples: true
  });

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      console.log('🎯 Starting AI lesson content generation...');
      
      const lessonTitle = lessonData?.title || 'Untitled Lesson';
      const moduleTitle = moduleData?.title || 'Module';
      const courseTitle = courseData?.title || 'Course';
      
      // Generate comprehensive lesson content
      const generatedBlocks = await generateLessonBlocks({
        lessonTitle,
        moduleTitle,
        courseTitle,
        options: generationOptions
      });
      
      console.log('✅ Generated blocks:', generatedBlocks);
      
      // Pass generated content back to parent
      onContentGenerated(generatedBlocks);
      
      toast.success(`Generated ${generatedBlocks.length} content blocks successfully!`);
      onClose();
      
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      toast.error('Failed to generate AI content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLessonBlocks = async ({ lessonTitle, moduleTitle, courseTitle, options }) => {
    const blocks = [];
    let blockOrder = 0;

    try {
      // 1. Generate Introduction
      console.log('📝 Generating introduction...');
      const introPrompt = `Create an engaging introduction for the lesson "${lessonTitle}" in the module "${moduleTitle}" of the course "${courseTitle}". The introduction should hook the reader and set clear expectations for what they will learn.`;
      
      const introContent = await enhancedAIService.generateText(introPrompt, {
        maxTokens: 300,
        temperature: 0.7
      });

      blocks.push({
        id: `ai-intro-${Date.now()}`,
        type: 'text',
        content: introContent || `Welcome to ${lessonTitle}! In this lesson, you'll explore key concepts and gain practical knowledge that will enhance your understanding of ${moduleTitle}.`,
        order: blockOrder++,
        isAIGenerated: true
      });

      // 2. Generate Learning Objectives
      console.log('🎯 Generating learning objectives...');
      const objectivesPrompt = `Create 4-6 clear, specific learning objectives for the lesson "${lessonTitle}". Each objective should start with an action verb and be measurable.`;
      
      const objectivesContent = await enhancedAIService.generateText(objectivesPrompt, {
        maxTokens: 200,
        temperature: 0.6
      });

      const objectives = objectivesContent ? 
        objectivesContent.split('\n').filter(line => line.trim()).map(obj => obj.replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, '')) :
        [
          `Understand the core concepts of ${lessonTitle}`,
          `Apply key principles in practical scenarios`,
          `Analyze different approaches and methodologies`,
          `Evaluate the effectiveness of various strategies`
        ];

      blocks.push({
        id: `ai-objectives-${Date.now()}`,
        type: 'list',
        content: objectives.join('\n'),
        listType: 'bullet',
        order: blockOrder++,
        isAIGenerated: true
      });

      // 3. Generate Main Content Sections
      if (options.contentType === 'comprehensive') {
        console.log('📚 Generating main content sections...');
        
        // Section 1: Key Concepts
        const conceptsPrompt = `Explain the key concepts and fundamental principles of "${lessonTitle}". Provide clear definitions and explanations that are easy to understand.`;
        
        const conceptsContent = await enhancedAIService.generateText(conceptsPrompt, {
          maxTokens: 400,
          temperature: 0.7
        });

        blocks.push({
          id: `ai-concepts-${Date.now()}`,
          type: 'heading',
          content: 'Key Concepts and Principles',
          level: 2,
          order: blockOrder++,
          isAIGenerated: true
        });

        blocks.push({
          id: `ai-concepts-text-${Date.now()}`,
          type: 'text',
          content: conceptsContent || `This section covers the fundamental concepts of ${lessonTitle}. Understanding these principles is essential for mastering the subject matter and applying it effectively in real-world scenarios.`,
          order: blockOrder++,
          isAIGenerated: true
        });

        // Section 2: Practical Applications
        if (options.includeExamples) {
          console.log('💡 Generating practical examples...');
          
          const examplesPrompt = `Provide 3-4 practical examples or real-world applications of "${lessonTitle}". Make them relevant and easy to understand.`;
          
          const examplesContent = await enhancedAIService.generateText(examplesPrompt, {
            maxTokens: 350,
            temperature: 0.8
          });

          blocks.push({
            id: `ai-examples-heading-${Date.now()}`,
            type: 'heading',
            content: 'Practical Applications and Examples',
            level: 2,
            order: blockOrder++,
            isAIGenerated: true
          });

          blocks.push({
            id: `ai-examples-${Date.now()}`,
            type: 'text',
            content: examplesContent || `Here are some practical applications of ${lessonTitle} that demonstrate its real-world relevance and importance in various contexts.`,
            order: blockOrder++,
            isAIGenerated: true
          });
        }

        // Section 3: Best Practices
        console.log('⭐ Generating best practices...');
        
        const practicesPrompt = `List 5-7 best practices or important tips related to "${lessonTitle}". Format as a clear, actionable list.`;
        
        const practicesContent = await enhancedAIService.generateText(practicesPrompt, {
          maxTokens: 300,
          temperature: 0.6
        });

        const practices = practicesContent ? 
          practicesContent.split('\n').filter(line => line.trim()).map(practice => practice.replace(/^\d+\.?\s*/, '').replace(/^[-•]\s*/, '')) :
          [
            `Always start with a clear understanding of the fundamentals`,
            `Practice regularly to reinforce your learning`,
            `Seek feedback and continuously improve your approach`,
            `Stay updated with the latest developments in the field`,
            `Apply theoretical knowledge to practical situations`
          ];

        blocks.push({
          id: `ai-practices-heading-${Date.now()}`,
          type: 'heading',
          content: 'Best Practices and Tips',
          level: 2,
          order: blockOrder++,
          isAIGenerated: true
        });

        blocks.push({
          id: `ai-practices-${Date.now()}`,
          type: 'list',
          content: practices.join('\n'),
          listType: 'bullet',
          order: blockOrder++,
          isAIGenerated: true
        });
      }

      // 4. Generate Assessment Questions
      if (options.includeAssessments) {
        console.log('❓ Generating assessment questions...');
        
        const questionsPrompt = `Create 4-5 thought-provoking questions about "${lessonTitle}" that test understanding and encourage critical thinking.`;
        
        const questionsContent = await enhancedAIService.generateText(questionsPrompt, {
          maxTokens: 250,
          temperature: 0.7
        });

        const questions = questionsContent ? 
          questionsContent.split('\n').filter(line => line.trim() && line.includes('?')).map(q => q.replace(/^\d+\.?\s*/, '')) :
          [
            `What are the main benefits of applying ${lessonTitle} in practice?`,
            `How does ${lessonTitle} relate to other concepts in ${moduleTitle}?`,
            `What challenges might you face when implementing these concepts?`,
            `How would you explain ${lessonTitle} to someone new to the subject?`
          ];

        blocks.push({
          id: `ai-assessment-heading-${Date.now()}`,
          type: 'heading',
          content: 'Reflection Questions',
          level: 2,
          order: blockOrder++,
          isAIGenerated: true
        });

        blocks.push({
          id: `ai-assessment-${Date.now()}`,
          type: 'list',
          content: questions.join('\n'),
          listType: 'ordered',
          order: blockOrder++,
          isAIGenerated: true
        });
      }

      // 5. Generate Summary
      console.log('📋 Generating summary...');
      
      const summaryPrompt = `Create a concise summary of the key takeaways from the lesson "${lessonTitle}". Include the most important points students should remember.`;
      
      const summaryContent = await enhancedAIService.generateText(summaryPrompt, {
        maxTokens: 200,
        temperature: 0.6
      });

      blocks.push({
        id: `ai-summary-heading-${Date.now()}`,
        type: 'heading',
        content: 'Key Takeaways',
        level: 2,
        order: blockOrder++,
        isAIGenerated: true
      });

      blocks.push({
        id: `ai-summary-${Date.now()}`,
        type: 'text',
        content: summaryContent || `In this lesson on ${lessonTitle}, we've covered the essential concepts, practical applications, and best practices. Remember to apply these insights in your own work and continue exploring the subject further.`,
        order: blockOrder++,
        isAIGenerated: true
      });

      // 6. Add Interactive Element (if requested)
      if (options.includeInteractive) {
        blocks.push({
          id: `ai-quote-${Date.now()}`,
          type: 'quote',
          content: `"The best way to learn ${lessonTitle} is through consistent practice and real-world application."`,
          author: 'Learning Insight',
          order: blockOrder++,
          isAIGenerated: true
        });
      }

      return blocks;

    } catch (error) {
      console.error('Error generating lesson blocks:', error);
      // Return fallback content
      return [{
        id: `fallback-${Date.now()}`,
        type: 'text',
        content: `This lesson covers ${lessonTitle} as part of ${moduleTitle}. The content will help you understand key concepts and apply them effectively.`,
        order: 0,
        isAIGenerated: true
      }];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate AI Lesson Content
          </DialogTitle>
          <DialogDescription>
            Create comprehensive lesson content using AI for "{lessonData?.title || 'this lesson'}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Content Type</Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  id="comprehensive"
                  name="contentType"
                  value="comprehensive"
                  checked={generationOptions.contentType === 'comprehensive'}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    contentType: e.target.value
                  }))}
                  className="text-purple-600"
                />
                <div className="flex-1">
                  <Label htmlFor="comprehensive" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Comprehensive Lesson</div>
                      <div className="text-sm text-gray-500">
                        Generate complete lesson with introduction, main content, examples, and summary
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
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    contentType: e.target.value
                  }))}
                  className="text-purple-600"
                />
                <div className="flex-1">
                  <Label htmlFor="outline" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Lesson Outline</div>
                      <div className="text-sm text-gray-500">
                        Generate structured outline with headings and key points
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Features</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="includeAssessments"
                  checked={generationOptions.includeAssessments}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    includeAssessments: e.target.checked
                  }))}
                  className="text-purple-600"
                />
                <Label htmlFor="includeAssessments" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-green-600" />
                  Include reflection questions and assessments
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="includeInteractive"
                  checked={generationOptions.includeInteractive}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    includeInteractive: e.target.checked
                  }))}
                  className="text-purple-600"
                />
                <Label htmlFor="includeInteractive" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="h-4 w-4 text-pink-600" />
                  Include interactive elements and quotes
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="includeExamples"
                  checked={generationOptions.includeExamples}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    includeExamples: e.target.checked
                  }))}
                  className="text-purple-600"
                />
                <Label htmlFor="includeExamples" className="flex items-center gap-2 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Include practical examples and applications
                </Label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What will be generated:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Introduction and learning objectives</li>
              <li>• Main content sections with explanations</li>
              {generationOptions.includeExamples && <li>• Practical examples and applications</li>}
              <li>• Best practices and key tips</li>
              {generationOptions.includeAssessments && <li>• Reflection questions</li>}
              <li>• Summary and key takeaways</li>
              {generationOptions.includeInteractive && <li>• Interactive elements and quotes</li>}
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
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
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AILessonContentGenerator;
