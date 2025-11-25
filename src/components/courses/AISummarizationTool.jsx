import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Wand2,
  Copy,
  Download,
  Trash2,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link,
  Sparkles,
  X,
  File,
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';
import aiProxyService from '../../services/aiProxyService';
import { useAIFeatureAccess, withAIFeatureAccess } from './AIFeatureAccess';

const AISummarizationTool = ({ onFeatureUse, usageInfo }) => {
  const [inputMethod, setInputMethod] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryType, setSummaryType] = useState('bullet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const { hasAccess, trackUsage } = useAIFeatureAccess();
  const fileInputRef = useRef(null);

  // Error boundary wrapper
  if (!hasAccess) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
        <p className="text-gray-600">AI Summarization access required</p>
      </div>
    );
  }

  const inputMethods = [
    { id: 'text', name: 'Text Input', icon: FileText },
    { id: 'url', name: 'URL/Link', icon: Link },
    { id: 'file', name: 'File Upload', icon: Upload },
  ];

  const lengthOptions = [
    {
      id: 'short',
      name: 'Short (50-100 words)',
      description: 'Quick overview',
      tokens: '50-100',
    },
    {
      id: 'medium',
      name: 'Medium (100-200 words)',
      description: 'Balanced summary',
      tokens: '100-200',
    },
    {
      id: 'long',
      name: 'Long (150-300 words)',
      description: 'Detailed summary',
      tokens: '150-300',
    },
    {
      id: 'detailed',
      name: 'Detailed (200-400 words)',
      description: 'Comprehensive analysis',
      tokens: '200-400',
    },
  ];

  const typeOptions = [
    { id: 'bullet', name: 'Bullet Points', description: 'Easy to scan' },
    { id: 'paragraph', name: 'Paragraph', description: 'Flowing text' },
    { id: 'outline', name: 'Outline', description: 'Structured format' },
  ];

  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const generateSummary = async () => {
    try {
      let content = '';

      if (inputMethod === 'text' && textInput.trim()) {
        content = textInput;
      } else if (inputMethod === 'url' && urlInput.trim()) {
        content = `Content from: ${urlInput}`;
      } else if (inputMethod === 'file' && uploadedFile) {
        content = `Content from file: ${uploadedFile.name}`;
      }

      if (!content) return;

      setIsGenerating(true);

      // Track feature usage
      if (trackUsage) {
        trackUsage('CONTENT_SUMMARIZATION');
      }

      console.log('🚀 Starting advanced summarization with:', {
        length: summaryLength,
        type: summaryType,
        contentLength: content.length,
      });

      const result = await aiProxyService.summarizeContent(content, {
        length: summaryLength,
        type: summaryType,
      });

      const newSummary = {
        id: Date.now(),
        content:
          result.summary ||
          result.generated_text ||
          'Summary generated successfully',
        originalContent:
          content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        length: summaryLength,
        type: summaryType,
        model: result.model,
        chunked: result.chunked || false,
        chunkCount: result.chunkCount || 1,
        originalLength: result.originalLength || content.length,
        summaryLength: result.summaryLength || 0,
        lengthConfig: result.lengthConfig,
        success: result.success !== false,
        createdAt: new Date().toISOString(),
      };

      setSummaries([newSummary, ...summaries]);

      // Clear inputs
      setTextInput('');
      setUrlInput('');
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onFeatureUse) {
        onFeatureUse('CONTENT_SUMMARIZATION', newSummary);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
      const errorSummary = {
        id: Date.now(),
        content: `Error: ${error.message}`,
        originalContent: 'Failed to generate summary',
        length: summaryLength,
        type: 'error',
        model: 'error',
        chunked: false,
        success: false,
        createdAt: new Date().toISOString(),
        isError: true,
      };
      setSummaries([errorSummary, ...summaries]);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSummary = id => {
    setSummaries(summaries.filter(summary => summary.id !== id));
  };

  const copySummary = content => {
    navigator.clipboard.writeText(content);
  };

  const downloadSummary = (content, source) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary-${source.slice(0, 20).replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertIntoCourse = summary => {
    // This would integrate with the course content editor
    console.log('Inserting summary into course:', summary);
    // Implementation would depend on the course editor structure
  };

  return (
    <div className="space-y-6">
      {/* Input Method Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Content Summarization
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {inputMethods.map(method => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setInputMethod(method.id)}
                className={`p-4 text-center border rounded-lg transition-colors ${
                  inputMethod === method.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{method.name}</div>
              </button>
            );
          })}
        </div>

        {/* Input Content */}
        <div className="space-y-4">
          {inputMethod === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your content here
              </label>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Paste the text content you want to summarize..."
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="6"
              />
            </div>
          )}

          {inputMethod === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL or link
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}

          {inputMethod === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload file (PDF, DOC, TXT)
              </label>
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
                    <File className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">
                      {uploadedFile.name}
                    </span>
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
                      Click to upload file
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, or TXT files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <select
                value={summaryLength}
                onChange={e => setSummaryLength(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                {lengthOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Format
              </label>
              <select
                value={summaryType}
                onChange={e => setSummaryType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                {typeOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateSummary}
            disabled={
              isGenerating ||
              (inputMethod === 'text'
                ? !textInput.trim()
                : inputMethod === 'url'
                  ? !urlInput.trim()
                  : !uploadedFile)
            }
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Summaries */}
      {summaries.length > 0 && (
        <div className="space-y-4">
          {summaries.map(summary => (
            <div
              key={summary.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      summary.isError ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-500">
                    {summary.length} • {summary.type} •{' '}
                    {new Date(summary.createdAt).toLocaleString()}
                  </span>
                  {summary.chunked && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {summary.chunkCount} chunks
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteSummary(summary.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <p
                  className={`text-sm leading-relaxed ${
                    summary.isError ? 'text-red-600' : 'text-gray-800'
                  }`}
                >
                  {summary.content}
                </p>
              </div>

              {!summary.isError && summary.model && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>
                      Model:{' '}
                      <code className="bg-white px-1 rounded">
                        {summary.model}
                      </code>
                    </span>
                    {summary.summaryLength > 0 && (
                      <span>Length: {summary.summaryLength} words</span>
                    )}
                  </div>
                  {summary.originalLength && (
                    <div className="mt-1">
                      Original: {summary.originalLength} chars → Summary:{' '}
                      {summary.content.length} chars (
                      {Math.round(
                        (1 - summary.content.length / summary.originalLength) *
                          100
                      )}
                      % reduction)
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Original: {summary.originalContent}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(summary.content)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadSummary(summary)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {summaries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No summaries generated yet</p>
          <p className="text-sm">
            Upload content above to create your first summary
          </p>
        </div>
      )}
    </div>
  );
};

// Export with AI Feature Access protection
export default withAIFeatureAccess(
  AISummarizationTool,
  'CONTENT_SUMMARIZATION'
);
