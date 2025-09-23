import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  AudioLines, 
  Users, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Upload,
  Plus,
  Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  generateAICourseOutline, 
  createCompleteAICourse, 
  generateAndUploadCourseImage 
} from '../../services/aiCourseService';
import { uploadImage } from '@/services/imageUploadService';
import AILessonCreator from './AILessonCreator';

const AICourseCreationPanel = ({ isOpen, onClose, onCourseCreated }) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [isMinimized, setIsMinimized] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    subject: '',
    description: '',
    targetAudience: '',
    duration: '',
    difficulty: 'beginner',
    objectives: '',
    thumbnail: null
  });
  const [aiOutline, setAiOutline] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeContentTab, setActiveContentTab] = useState('file'); // 'file' or 'url'
  const [sourceContent, setSourceContent] = useState('');
  const [activeThumbnailTab, setActiveThumbnailTab] = useState('upload'); // 'upload' or 'ai'
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [aiImageError, setAiImageError] = useState('');
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'outline', label: 'Course Outline', icon: BookOpen },
    { id: 'content', label: 'Content Creation', icon: FileText },
    { id: 'media', label: 'Media Assets', icon: ImageIcon },
    { id: 'interactives', label: 'Interactives', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Handle drag and drop events
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    try {
      if (file && file.type.startsWith('image/')) {
        const res = await uploadImage(file, { folder: 'course-thumbnails', public: true });
        if (res?.success && res.imageUrl) {
          setCourseData(prev => ({ ...prev, thumbnail: res.imageUrl }));
          alert('Thumbnail uploaded successfully');
        }
      } else {
        alert('Please select an image file');
      }
    } catch (e) {
      console.error('Thumbnail upload failed:', e);
      alert(`Failed to upload thumbnail: ${e.message}`);
    }
  };

  // Handle file upload for source content
  const handleSourceFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const results = await Promise.all(files.map(async (file) => {
        const isPdf = file.type === 'application/pdf';
        const options = isPdf ? { type: 'pdf', folder: 'course-references', public: true } : { folder: 'course-references', public: true };
        const res = await uploadImage(file, options);
        return {
          name: file.name,
          url: res?.imageUrl || null,
          type: isPdf ? 'pdf' : 'image',
          size: file.size
        };
      }));
      setUploadedFiles(prev => [...prev, ...results.filter(r => r.url)]);
      alert('Reference files uploaded');
    } catch (err) {
      console.error('Reference upload failed:', err);
      alert(`Failed to upload reference files: ${err.message}`);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Generate AI course outline
  const generateCourseOutline = async () => {
    if (!courseData.title.trim()) return;
    
    setIsGenerating(true);
    try {
      // Include uploaded files and source content in the request
      const courseDataWithContent = {
        ...courseData,
        uploadedFiles: uploadedFiles,
        referenceUrls: uploadedFiles.map(f => f.url),
        sourceContent: sourceContent
      };
      
      const result = await generateAICourseOutline(courseDataWithContent);
      if (result.success) {
        setAiOutline(result.data);
        setGeneratedContent(prev => ({
          ...prev,
          outline: result.data
        }));
      }
    } catch (error) {
      console.error('Failed to generate course outline:', error);
      alert('Failed to generate course outline: ' + error.message);
      // Log detailed error for debugging
      console.error("AI course outline generation error details:", {
        message: error.message,
        stack: error.stack,
        courseData: courseDataWithContent
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI thumbnail
  const generateAiThumbnail = async () => {
    if (!courseData.title.trim() && !aiImagePrompt.trim()) {
      setAiImageError("Please enter a course title or image prompt");
      return;
    }

    setAiImageGenerating(true);
    setAiImageError("");

    try {
      // Create a more descriptive prompt based on course title if no prompt is provided
      const prompt = aiImagePrompt.trim() || `Professional course thumbnail for "${courseData.title}" - educational, modern, clean design`;
      
      const response = await generateAndUploadCourseImage(prompt, {
        style: 'realistic',
        size: '1024x1024'
      });

      if (response.success) {
        setCourseData(prev => ({ ...prev, thumbnail: response.data.s3Url }));
        setAiImageError("");
        // Show success message
        alert("AI thumbnail generated and uploaded to S3 successfully!");
      } else {
        setAiImageError(response.error || "Failed to generate AI image");
      }
    } catch (error) {
      setAiImageError("Failed to generate AI image: " + error.message);
      // Log detailed error for debugging
      console.error("AI thumbnail generation error details:", {
        message: error.message,
        stack: error.stack,
        prompt: aiImagePrompt.trim() || `Professional course thumbnail for "${courseData.title}" - educational, modern, clean design`
      });
    } finally {
      setAiImageGenerating(false);
    }
  };

  // Save the AI-generated course
  const handleSaveCourse = async () => {
    // Validate required fields before saving
    if (!courseData.title?.trim()) {
      alert('Please enter a course title before saving.');
      return;
    }
    
    if (!courseData.description?.trim()) {
      alert('Please enter a course description before saving.');
      return;
    }

    try {
      console.log('Creating complete AI course with deployed backend APIs...');
      
      // Prepare course data for the new backend-integrated service
      const completeAICourseData = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        subject: courseData.subject?.trim() || courseData.title.trim(),
        targetAudience: courseData.targetAudience?.trim() || 'General learners',
        difficulty: courseData.difficulty || 'beginner',
        duration: courseData.duration?.trim() || '4 weeks',
        learningObjectives: courseData.objectives?.trim() || 'Learn new skills and concepts',
        max_students: 100,
        price: '0',
        thumbnail: courseData.thumbnail || null
      };

      console.log('Creating AI course with payload:', completeAICourseData);
      
      // Use the new backend-integrated service to create complete course
      const result = await createCompleteAICourse(completeAICourseData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create complete AI course');
      }
      
      console.log('Complete AI course created successfully:', result.data);
      
      // Notify parent component
      if (onCourseCreated) {
        const courseObj = result.data.course?.data || result.data.course;
        onCourseCreated(courseObj);
      }
      
      // Close the panel
      onClose();
      
      // Show detailed success message
      alert(`Course "${courseData.title}" created successfully!\n\n` +
            `✅ Course: Created\n` +
            `✅ Modules: ${result.data.totalModules} created\n` +
            `✅ Lessons: ${result.data.totalLessons} created\n\n` +
            `All data has been saved to your deployed backend database.`);
    } catch (error) {
      console.error('Failed to save AI course:', error);
      alert('Failed to save course: ' + error.message);
      // Log detailed error for debugging
      console.error("AI course save error details:", {
        message: error.message,
        stack: error.stack,
        courseData: courseData,
        aiOutline: aiOutline
      });
    }
  };

  // Handle lessons created
  const handleLessonsCreated = (lessonData) => {
    console.log('Lessons created:', lessonData);
    // Here you would typically update the course with the new lessons
    // For now, we'll just close the lesson creator and show a success message
    setShowLessonCreator(false);
    alert(`Successfully created ${lessonData.lessons.length} lessons for "${lessonData.courseTitle}"!`);
  };

  // Reset form when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setCourseData({
        title: '',
        subject: '',
        description: '',
        targetAudience: '',
        duration: '',
        difficulty: 'beginner',
        objectives: '',
        thumbnail: null
      });
      setAiOutline(null);
      setGeneratedContent({});
      setIsMinimized(false);
      setActiveThumbnailTab('upload');
      setAiImagePrompt('');
      setAiImageError('');
    }
  }, [isOpen]);

  const [showLessonCreator, setShowLessonCreator] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isMinimized ? 'calc(100% - 4rem)' : 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex ${
              isMinimized ? 'w-16' : 'w-full max-w-4xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimize/Expand Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute top-4 -left-10 bg-gray-700 text-white p-2 rounded-l-lg hover:bg-gray-600 transition-colors z-10"
            >
              {isMinimized ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            
            {isMinimized ? (
              // Minimized view - just show tabs
              <div className="flex flex-col items-center py-4 space-y-6 w-full">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setIsMinimized(false);
                        setActiveTab(tab.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              // Full panel view
              <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">AI Course Creator</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Two-panel layout */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left panel - Course preview */}
                  <div className="w-1/2 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Course Preview</h3>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Course thumbnail */}
                        <div className="h-40 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                          {courseData.thumbnail ? (
                            <div className="text-white text-center">
                              <span className="text-sm">{courseData.thumbnail}</span>
                            </div>
                          ) : (
                            <span className="text-white text-sm font-medium">Course Thumbnail</span>
                          )}
                        </div>
                        
                        {/* Course info */}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {courseData.title || 'Course Title'}
                          </h4>
                          <p className="text-sm text-gray-500 mb-3">
                            {courseData.subject || 'Subject Domain'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {courseData.description || 'Course description will appear here...'}
                          </p>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Duration: {courseData.duration || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Level: {courseData.difficulty || 'Beginner'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI-generated outline preview */}
                    {aiOutline && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Generated Outline</h3>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">{aiOutline.course_title}</h4>
                            <div className="space-y-3">
                              {aiOutline.modules.map((module, index) => (
                                <div key={`${module.module_title}-${index}`} className="border-l-2 border-purple-500 pl-3">
                                  <p className="font-medium text-gray-900 text-sm">{module.module_title}</p>
                                  <p className="text-xs text-gray-600">{module.lesson.lesson_title}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right panel - Form inputs */}
                  <div className="w-1/2 flex flex-col">
                    {/* Tab Navigation */}
                    <div className="bg-gray-100 flex border-b border-gray-200">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                              activeTab === tab.id
                                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {activeTab === 'outline' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Title *
                              </label>
                              <input
                                type="text"
                                value={courseData.title}
                                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="e.g., Introduction to React"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject Domain
                              </label>
                              <input
                                type="text"
                                value={courseData.subject}
                                onChange={(e) => setCourseData(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="e.g., Web Development"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Description
                              </label>
                              <textarea
                                value={courseData.description}
                                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Briefly describe what this course covers..."
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  value={courseData.duration}
                                  onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="e.g., 4 weeks"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Difficulty
                                </label>
                                <select
                                  value={courseData.difficulty}
                                  onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Learning Objectives
                              </label>
                              <textarea
                                value={courseData.objectives}
                                onChange={(e) => setCourseData(prev => ({ ...prev, objectives: e.target.value }))}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="What will students learn?"
                              />
                            </div>

                            {/* Source Content Section */}
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-800">
                                  What source content should I reference? (Adding content will improve our results.)
                                </label>
                                
                                {/* Tab Navigation */}
                                <div className="flex border-b border-gray-200">
                                  <button
                                    type="button"
                                    className={`py-2 px-4 text-sm font-medium ${
                                      activeContentTab === 'file'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveContentTab('file')}
                                  >
                                    Upload Files
                                  </button>
                                  <button
                                    type="button"
                                    className={`py-2 px-4 text-sm font-medium ${
                                      activeContentTab === 'url'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveContentTab('url')}
                                  >
                                    Paste URLs
                                  </button>
                                </div>
                                
                                {/* Tab Content */}
                                <div className="pt-3">
                                  {activeContentTab === 'file' ? (
                                    <div className="space-y-3">
                                      {/* File Upload Area */}
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-gray-50">
                                        <div className="flex flex-col items-center">
                                          <Upload className="w-8 h-8 text-gray-400 mb-3" />
                                          <p className="text-sm text-gray-600 mb-1">
                                            Drag & drop any source materials or <span className="text-purple-600 font-medium cursor-pointer">choose file</span>
                                          </p>
                                          <input
                                            type="file"
                                            multiple
                                            onChange={handleSourceFileUpload}
                                            className="hidden"
                                            id="source-file-upload"
                                            accept=".doc,.docx,.m4a,.mp3,.mp4,.ogg,.pdf,.ppt,.pptx,.sbv,.srt,.story,.sub,.text,.txt,.vtt,.wav,.webm"
                                          />
                                          <label 
                                            htmlFor="source-file-upload"
                                            className="text-xs text-gray-500 cursor-pointer hover:text-purple-700 mt-2"
                                          >
                                            Supported file types and sizes
                                          </label>
                                        </div>
                                      </div>
                                      
                                      {/* File Types and Sizes Info */}
                                      <div className="text-xs text-gray-500 space-y-1">
                                        <p>Supported file types: .doc, .docx, .m4a, .mp3, .mp4, .ogg, .pdf, .ppt, .pptx, .sbv, .srt, .story, .sub, .text, .txt, .vtt, .wav, or .webm</p>
                                        <p>Maximum size: 1 GB, 200K characters or less per file.</p>
                                      </div>

                                      {/* Uploaded Files */}
                                      {uploadedFiles.length > 0 && (
                                        <div className="space-y-2">
                                          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                                          {uploadedFiles.map((file, index) => (
                                            <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                                              <span className="text-gray-700 truncate flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
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
                                        value={sourceContent}
                                        onChange={(e) => setSourceContent(e.target.value)}
                                        placeholder="Paste text or URLs you want me to reference"
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      />
                                      <p className="text-xs text-gray-500">You can paste URLs, text content, or any reference material here</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Thumbnail Section with Tabs */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Thumbnail
                              </label>
                              
                              {/* Tab Navigation */}
                              <div className="flex border-b border-gray-200 mb-3">
                                <button
                                  type="button"
                                  className={`py-2 px-4 text-sm font-medium ${
                                    activeThumbnailTab === 'upload'
                                      ? 'text-purple-600 border-b-2 border-purple-600'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                  onClick={() => setActiveThumbnailTab('upload')}
                                >
                                  Upload Image
                                </button>
                                <button
                                  type="button"
                                  className={`py-2 px-4 text-sm font-medium ${
                                    activeThumbnailTab === 'ai'
                                      ? 'text-purple-600 border-b-2 border-purple-600'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                  onClick={() => setActiveThumbnailTab('ai')}
                                >
                                  Generate with AI
                                </button>
                              </div>
                              
                              {/* Tab Content */}
                              {activeThumbnailTab === 'upload' ? (
                                <div 
                                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
                                  onDragEnter={handleDragEnter}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileInput}
                                    accept="image/*"
                                  />
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 mb-1">
                                    {courseData.thumbnail ? courseData.thumbnail : 'Drag & drop an image or click to browse'}
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      AI Image Prompt
                                    </label>
                                    <textarea
                                      value={aiImagePrompt}
                                      onChange={(e) => setAiImagePrompt(e.target.value)}
                                      placeholder={`Describe the image you want to generate for "${courseData.title || 'your course'}"`}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      rows={3}
                                    />
                                    {!aiImagePrompt && courseData.title && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Using course title as prompt: "Professional course thumbnail for "{courseData.title}" - educational, modern, clean design"
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={generateAiThumbnail}
                                    disabled={aiImageGenerating}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                  >
                                    {aiImageGenerating ? (
                                      <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                        Generating...
                                      </>
                                    ) : (
                                      "Generate AI Thumbnail"
                                    )}
                                  </button>
                                  {aiImageError && (
                                    <div className="text-sm text-red-600">{aiImageError}</div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    <p>Tip: Include details like subject matter, style, and mood for better results.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            onClick={generateCourseOutline}
                            disabled={isGenerating || !courseData.title.trim()}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating Outline...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate AI Outline
                              </>
                            )}
                          </Button>
                          
                          {/* Add this button after the Generate AI Outline button */}
                          {aiOutline && (
                            <>
                              <Button
                                onClick={() => setShowLessonCreator(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 mt-3"
                              >
                                <Book className="w-4 h-4" />
                                Create AI Lessons
                              </Button>
                              <Button
                                onClick={handleSaveCourse}
                                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2 mt-3"
                              >
                                <Check className="w-4 h-4" />
                                Create Course
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'content' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            Content Creation
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Generate and customize lesson content for your course modules.
                          </p>
                          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Content creation tools will appear here</p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'media' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-600" />
                            Media Assets
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Generate images, videos, and other media for your course content.
                          </p>
                          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Media generation tools will appear here</p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'interactives' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Interactive Elements
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Add quizzes, discussions, and collaborative activities to your course.
                          </p>
                          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Interactive tools will appear here</p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'analytics' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            Analytics & Insights
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Track engagement and performance metrics for your AI-generated course.
                          </p>
                          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Analytics dashboard will appear here</p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'settings' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-purple-600" />
                            Course Settings
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Configure course visibility, pricing, and access settings.
                          </p>
                          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">Publish Course</h4>
                                <p className="text-sm text-gray-500">Make course available to students</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">Require Final Quiz</h4>
                                <p className="text-sm text-gray-500">Students must pass a final quiz to complete course</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Course Price</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="0.00"
                                  defaultValue="0"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                  <label htmlFor="currency" className="sr-only">Currency</label>
                                  <select id="currency" name="currency" className="focus:ring-purple-500 focus:border-purple-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 rounded-md">
                                    <option>USD</option>
                                    <option>CAD</option>
                                    <option>EUR</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={handleSaveCourse}
                            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Save and Publish Course
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Lesson Creator Modal */}
                {showLessonCreator && (
                  <AILessonCreator
                    isOpen={showLessonCreator}
                    onClose={() => setShowLessonCreator(false)}
                    courseTitle={courseData.title}
                    aiOutline={aiOutline}
                    onLessonsCreated={handleLessonsCreated}
                  />
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AICourseCreationPanel;