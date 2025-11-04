import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  BookOpen,
  Image,
  FileText,
  Search,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Bytez from 'bytez.js'; // Removed - dependency not available

const AIEnhancementPanel = ({
  lessonData,
  onContentGenerated,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [prompt, setPrompt] = useState('');

  // Generate lesson content using AI
  const generateLessonContent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Get API key from environment variables
      // AI enhancement functionality removed - dependency not available
      throw new Error('AI enhancement service is currently unavailable.');

      // Initialize Bytez SDK
      // const sdk = new Bytez(apiKey);
      // const model = sdk.model("google/flan-t5-base");

      // Create model instance
      // await model.create();

      // Generate content
      // const result = await model.run(prompt, {
      //   max_new_tokens: 500,
      //   temperature: 0.7
      // });
      const result = await model.run(prompt, {
        max_new_tokens: 500,
        temperature: 0.7,
      });

      if (result.output) {
        setGeneratedContent(result.output);
        // Pass the generated content back to the parent component
        onContentGenerated(result.output);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate lesson outline
  const generateLessonOutline = async () => {
    const lessonTitle = lessonData?.title || 'Untitled Lesson';
    const outlinePrompt = `Create a structured lesson outline for "${lessonTitle}". Include:
    1. Introduction
    2. Main learning points (3-5 key concepts)
    3. Practical examples
    4. Summary
    
    Format as a clear, educational outline.`;

    setPrompt(outlinePrompt);
    // Trigger generation after setting prompt
    setTimeout(() => {
      generateLessonContent();
    }, 100);
  };

  // Generate lesson introduction
  const generateLessonIntro = async () => {
    const lessonTitle = lessonData?.title || 'Untitled Lesson';
    const introPrompt = `Write an engaging introduction for a lesson on "${lessonTitle}". 
    The introduction should:
    1. Explain what the lesson covers
    2. Why it's important to learn
    3. What students will be able to do after completing it
    
    Keep it concise and educational.`;

    setPrompt(introPrompt);
    // Trigger generation after setting prompt
    setTimeout(() => {
      generateLessonContent();
    }, 100);
  };

  // Generate lesson summary
  const generateLessonSummary = async () => {
    const lessonTitle = lessonData?.title || 'Untitled Lesson';
    const summaryPrompt = `Write a comprehensive summary for a lesson on "${lessonTitle}".
    The summary should:
    1. Recap the main learning points
    2. Highlight key takeaways
    3. Suggest next steps for further learning
    
    Keep it educational and motivating.`;

    setPrompt(summaryPrompt);
    // Trigger generation after setting prompt
    setTimeout(() => {
      generateLessonContent();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              AI Lesson Enhancement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('outline')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'outline'
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Lesson Outline
          </button>
          <button
            onClick={() => setActiveTab('intro')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'intro'
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Introduction
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Custom Prompt
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {activeTab === 'outline' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Generate Lesson Outline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Create a structured outline for your lesson with key
                      learning points and examples.
                    </p>
                    <Button
                      onClick={generateLessonOutline}
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating Outline...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Outline
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'intro' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Generate Lesson Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Create an engaging introduction that explains what the
                      lesson covers and why it's important.
                    </p>
                    <Button
                      onClick={generateLessonIntro}
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating Introduction...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Introduction
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Generate Lesson Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Create a comprehensive summary that recaps key points and
                      suggests next steps.
                    </p>
                    <Button
                      onClick={generateLessonSummary}
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      Custom AI Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Enter your own prompt to generate custom lesson content.
                    </p>
                    <Textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here... e.g., 'Write a detailed explanation of photosynthesis for a high school biology class'"
                      className="min-h-[120px] mb-4"
                    />
                    <Button
                      onClick={generateLessonContent}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating Content...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Generated Content Display */}
            {generatedContent && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        // Clear generated content
                        setGeneratedContent(null);
                        // Close the panel
                        onClose();
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Use This Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedContent(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementPanel;
