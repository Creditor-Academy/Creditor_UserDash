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
  Wand2,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Clock,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AICourseOutlineModal = ({ isOpen, onClose, onGenerateOutline }) => {
  const [formData, setFormData] = useState({
    courseTitle: '',
    subject: '',
    targetAudience: '',
    difficulty: 'intermediate',
    duration: '4 weeks',
    learningObjectives: '',
    sourceContent: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'url'

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = e => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = index => {
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
        subject: formData.subject,
        targetAudience: formData.targetAudience,
        difficulty: formData.difficulty,
        duration: formData.duration,
        learningObjectives: formData.learningObjectives,
        sourceContent: formData.sourceContent,
        uploadedFiles: uploadedFiles,
      });

      // Reset form after successful generation
      setFormData({
        courseTitle: '',
        subject: '',
        targetAudience: '',
        difficulty: 'intermediate',
        duration: '4 weeks',
        learningObjectives: '',
        sourceContent: '',
      });
      setUploadedFiles([]);
      setActiveTab('file');
    } catch (error) {
      console.error('Error generating course outline:', error);
      alert('Failed to generate course outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

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
          zIndex: 9999,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          style={{ cursor: 'pointer' }}
        />

        {/* Modal */}
        <div
          className="ml-auto w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative"
          style={{
            zIndex: 10000,
            pointerEvents: 'auto',
            transform: 'translateX(0)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Course Builder</h2>
                  <p className="text-indigo-100 text-sm">
                    Create your course outline with AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close AI Course Builder"
                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Course Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                What's your course about?
              </label>
              <p className="text-xs text-gray-500">
                Enter a clear, descriptive title for your course
              </p>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="e.g., Complete Web Development Bootcamp"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                What subject does this course cover?
              </label>
              <p className="text-xs text-gray-500">
                Specify the main topic or field of study
              </p>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Web Development, Data Science, Marketing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Users className="w-4 h-4 text-indigo-600" />
                Who is your target audience?
              </label>
              <p className="text-xs text-gray-500">
                Describe who this course is designed for
              </p>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="e.g., Beginners, Professionals, Students..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Course Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="4 weeks">4 Weeks</option>
                  <option value="8 weeks">8 Weeks</option>
                  <option value="12 weeks">12 Weeks</option>
                </select>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Target className="w-4 h-4 text-indigo-600" />
                What should students learn?
              </label>
              <p className="text-xs text-gray-500">
                List specific skills or knowledge students will gain
              </p>
              <textarea
                name="learningObjectives"
                value={formData.learningObjectives}
                onChange={handleInputChange}
                placeholder="e.g., Build responsive websites with HTML/CSS, Create interactive web apps with JavaScript..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
              />
            </div>

            {/* Source Content */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                What source content should I reference? (Adding content will
                improve our results.)
              </label>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === 'file'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('file')}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === 'url'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('url')}
                >
                  Paste URLs
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-3">
                {activeTab === 'file' ? (
                  <div className="space-y-3">
                    {/* File Upload Area */}
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".doc,.docx,.m4a,.mp3,.mp4,.ogg,.pdf,.ppt,.pptx,.sbv,.srt,.story,.sub,.text,.txt,.vtt,.wav,.webm"
                    />
                    <label
                      htmlFor="file-upload"
                      className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors bg-gray-50 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                          Drag & drop any source materials or{' '}
                          <span className="text-indigo-600 font-medium">
                            choose file
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported file types and sizes
                        </p>
                      </div>
                    </label>

                    {/* File Types and Sizes Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        Supported file types: .doc, .docx, .m4a, .mp3, .mp4,
                        .ogg, .pdf, .ppt, .pptx, .sbv, .srt, .story, .sub,
                        .text, .txt, .vtt, .wav, or .webm
                      </p>
                      <p>
                        Maximum size: 1 GB, 200K characters or less per file.
                      </p>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Uploaded Files:
                        </p>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg"
                          >
                            <span className="text-gray-700 truncate flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              <span className="text-sm">{file.name}</span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      name="sourceContent"
                      value={formData.sourceContent}
                      onChange={handleInputChange}
                      placeholder="Paste text or URLs you want me to reference"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      You can paste URLs, text content, or any reference
                      material here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Tip */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800">
                    AI Tip
                  </p>
                  <p className="text-sm text-indigo-700 mt-1">
                    Providing detailed learning objectives and source materials
                    will help generate a more accurate and comprehensive course
                    outline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t bg-gray-50 flex-shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.courseTitle.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating AI Course Outline...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Course Outline with AI
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
