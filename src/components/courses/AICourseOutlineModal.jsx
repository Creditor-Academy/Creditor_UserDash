import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Target, 
  Users, 
  FileText, 
  Upload,
  Plus,
  Brain,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AICourseOutlineModal = ({ isOpen, onClose, onGenerateOutline }) => {
  const [formData, setFormData] = useState({
    courseTitle: '',
    targetAudience: '',
    learningObjectives: '',
    sourceContent: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!formData.courseTitle.trim()) {
      alert('Please enter a course title');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the onGenerateOutline callback with form data
      await onGenerateOutline({
        title: formData.courseTitle,
        targetAudience: formData.targetAudience,
        learningObjectives: formData.learningObjectives,
        sourceContent: formData.sourceContent,
        uploadedFiles: uploadedFiles
      });
      
      // Reset form after successful generation
      setFormData({
        courseTitle: '',
        targetAudience: '',
        learningObjectives: '',
        sourceContent: ''
      });
      setUploadedFiles([]);
      
    } catch (error) {
      console.error('Error generating course outline:', error);
      alert('Failed to generate course outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    hidden: { 
      x: '100%',
      opacity: 0
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!isOpen) return null;

  // Use a portal-like approach to ensure modal is completely isolated
  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex"
        style={{ 
          isolation: 'isolate',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
      >
        {/* Backdrop - much simpler */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Modal - simplified and more direct */}
        <div
          className="ml-auto w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative"
          style={{ 
            zIndex: 10000,
            pointerEvents: 'auto',
            transform: 'translateX(0)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Brain className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">Generate course outline</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-200 text-sm">
              Let's create your course outline. The more details you provide, 
              the better my suggestions will be!
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Course Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 text-gray-600" />
                What's your course about?
              </label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="Enter course title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                required
              />
              <span className="text-xs text-gray-500 mt-1 block">Required</span>
            </div>

            {/* Target Audience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                If you have a target audience, who are they?
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="e.g., Beginners, Professionals..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
              />
            </div>

            {/* Learning Objectives */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 text-gray-600" />
                If you have specific learning objectives, what are they?
              </label>
              <textarea
                name="learningObjectives"
                value={formData.learningObjectives}
                onChange={handleInputChange}
                placeholder="What should students learn?"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none resize-none text-sm"
              />
            </div>

            {/* Source Content */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                What source content should I reference? (Adding content will improve our results.)
              </label>
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop or <span className="text-gray-800 font-medium cursor-pointer">choose file</span>
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".doc,.docx,.pdf,.txt,.md,.mp3,.mp4,.ogg,.pdf,.ppt,.pptx,.srt,.story,.vtt,.wav,.webm"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                  >
                    Supported: .doc, .pdf, .txt, .mp4, .wav, .webm
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max: 1GB, 200K chars</p>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                      <span className="text-gray-700 truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Input for URLs */}
              <div className="mt-3">
                <textarea
                  name="sourceContent"
                  value={formData.sourceContent}
                  onChange={handleInputChange}
                  placeholder="Paste text or URLs you want me to reference"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.courseTitle.trim()}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating outline...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Continue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AICourseOutlineModal;