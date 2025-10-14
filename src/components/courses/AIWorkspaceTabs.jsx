import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Download,
  Copy,
  Trash2,
  Upload,
  Wand2,
  RefreshCw,
  Search,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';
import { 
  generateAndUploadCourseImage, 
  summarizeContent, 
  searchCourseContent 
} from '../../services/aiCourseService';

// Images Tab Component
export const ImagesTab = ({ images, setImages, onInsertIntoLesson }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await generateAndUploadCourseImage(prompt, { style });
      if (result.success) {
        const imageData = {
          ...result.data,
          url: result.data.s3Url, // Use S3 URL for display
          prompt: prompt,
          style: style
        };
        setImages(prev => [imageData, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'course-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          Generate Course Images
        </h3>
        
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate (e.g., 'A modern classroom with students learning React programming')"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
          
          <div className="flex gap-4">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="realistic">Realistic</option>
              <option value="illustration">Illustration</option>
              <option value="cartoon">Cartoon</option>
              <option value="abstract">Abstract</option>
            </select>
            
            <button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-white rounded-lg border">
          <LoadingBuffer 
            type="generation" 
            message="Creating your image..." 
            showSparkles={true}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold mb-4">Generated Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="border rounded-lg overflow-hidden group">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onInsertIntoLesson(`![${image.prompt}](${image.url})`)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Insert to Course
                    </button>
                    <button
                      onClick={() => downloadImage(image.url, `course-image-${index + 1}.jpg`)}
                      className="p-1 text-gray-500 hover:text-purple-600"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Summarization Tab Component
export const SummarizationTab = ({ summaries, setSummaries, onInsertIntoLesson }) => {
  const [inputMethod, setInputMethod] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryType, setSummaryType] = useState('bullet');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const generateSummary = async () => {
    let content = '';
    
    if (inputMethod === 'text' && textInput.trim()) {
      content = textInput;
    } else if (inputMethod === 'url' && urlInput.trim()) {
      // In a real implementation, you'd fetch the URL content
      content = `Content from: ${urlInput}`;
    } else if (inputMethod === 'file' && uploadedFile) {
      // In a real implementation, you'd read the file content
      content = `Content from file: ${uploadedFile.name}`;
    }
    
    if (!content) return;
    
    setIsGenerating(true);
    try {
      const result = await aiCourseService.summarizeContent(content, {
        length: summaryLength,
        type: summaryType
      });
      
      if (result.success) {
        setSummaries(prev => [result.data, ...prev]);
        setTextInput('');
        setUrlInput('');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Summarize Content
        </h3>
        
        <div className="space-y-4">
          {/* Input Method Selection */}
          <div className="flex gap-2 mb-4">
            {['text', 'url', 'file'].map((method) => (
              <button
                key={method}
                onClick={() => setInputMethod(method)}
                className={`px-3 py-2 text-sm rounded-md ${
                  inputMethod === method
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {method === 'text' ? 'Text' : method === 'url' ? 'URL' : 'File'}
              </button>
            ))}
          </div>

          {/* Input Fields */}
          {inputMethod === 'text' && (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your content here to summarize..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              rows="6"
            />
          )}

          {inputMethod === 'url' && (
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            />
          )}

          {inputMethod === 'file' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Upload File (PDF, DOC, TXT)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Summary Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <select
                value={summaryLength}
                onChange={(e) => setSummaryLength(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="short">Short (2-3 sentences)</option>
                <option value="medium">Medium (1 paragraph)</option>
                <option value="long">Long (2-3 paragraphs)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Type
              </label>
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="bullet">Bullet Points</option>
                <option value="paragraph">Paragraph</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateSummary}
            disabled={isGenerating || (
              inputMethod === 'text' ? !textInput.trim() :
              inputMethod === 'url' ? !urlInput.trim() :
              !uploadedFile
            )}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-white rounded-lg border">
          <LoadingBuffer 
            type="ai" 
            message="Summarizing your content..." 
            showSparkles={true}
          />
        </div>
      )}

      {summaries.length > 0 && (
        <div className="space-y-4">
          {summaries.map((summary, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Summary</h4>
                  <p className="text-sm text-gray-500">
                    {summary.type} • {summary.originalLength} chars → {summary.summaryLength} chars
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onInsertIntoLesson(summary.summary)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Insert to Course
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(summary.summary)}
                    className="p-2 text-gray-500 hover:text-green-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{summary.summary}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Search Tab Component (Q&A with Bytez.js)
export const SearchTab = ({ searchResults, setSearchResults, onInsertIntoLesson }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // AI Q&A functionality removed - Bytez API no longer used
      const qaResult = {
        id: Date.now(),
        question: searchQuery,
        answer: 'AI search feature is currently unavailable. This feature has been deprecated.',
        context: context || null,
        model: 'unavailable',
        success: false,
        confidence: 'none',
        type: 'Q&A',
        difficulty: 'Failed'
      };
      
      setSearchResults(prev => [qaResult, ...prev]);
      setSearchQuery('');
      setContext('');
    } catch (error) {
      console.error('Q&A Search failed:', error);
      const errorResult = {
        id: Date.now(),
        question: searchQuery,
        answer: `Error: ${error.message}`,
        context: context || null,
        model: 'error',
        success: false,
        confidence: 'none',
        type: 'Error',
        difficulty: 'Failed'
      };
      setSearchResults(prev => [errorResult, ...prev]);
    } finally {
      setIsSearching(false);
    }
  };

  const quickQuestions = [
    'What is React?',
    'How does JavaScript work?',
    'Database design principles',
    'Machine learning basics',
    'Web security best practices'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-orange-600" />
          Content Q&A Search
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && performSearch()}
              placeholder="Ask any question... (Ctrl+Enter to submit)"
              className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-2 focus:ring-orange-500 resize-none"
              rows="2"
            />
            <button
              onClick={performSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 bottom-2 p-2 text-orange-600 hover:text-orange-700 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Context Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
            >
              <FileText className="w-4 h-4" />
              {showContext ? 'Hide Context' : 'Add Context (Optional)'}
            </button>
          </div>

          {/* Context Input */}
          {showContext && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provide context (optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any relevant context or background information..."
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                rows="3"
              />
            </div>
          )}

          {/* Quick Questions */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(question)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="bg-white rounded-lg border">
          <LoadingBuffer 
            type="ai" 
            message="Searching for answers..." 
            showSparkles={true}
          />
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((result, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{result.question}</h4>
                  <p className="text-sm text-gray-500">
                    {result.type} • {result.difficulty}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onInsertIntoLesson(result.answer)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Insert to Course
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.answer)}
                    className="p-2 text-gray-500 hover:text-orange-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-800">{result.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Search for any topic</p>
          <p className="text-sm">Get AI-powered answers that you can insert directly into your course</p>
        </div>
      )}
    </div>
  );
};
