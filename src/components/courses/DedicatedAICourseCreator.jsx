import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Book,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import aiCourseService from '../../services/aiCourseService';
import AILessonCreator from './AILessonCreator';

const DedicatedAICourseCreator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outline');
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
  const [activeContentTab, setActiveContentTab] = useState('file'); // 'file' or 'url'
  const [sourceContent, setSourceContent] = useState('');
  const fileInputRef = useRef(null);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [courseCreationStatus, setCourseCreationStatus] = useState('');

  const tabs = [
    { id: 'outline', label: 'Course Outline', icon: BookOpen }
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

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // In a real implementation, you would upload the file
      // For now, we'll just store the file name
      setCourseData(prev => ({ ...prev, thumbnail: file.name }));
    } else {
      console.log('⚠️ Please select an image file');
    }
  };

  // Handle file upload for source content
  const handleSourceFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  // Remove uploaded file
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
        sourceContent: sourceContent
      };
      
      const result = await aiCourseService.generateAICourseOutline(courseDataWithContent);
      if (result.success) {
        setAiOutline(result.data);
        setGeneratedContent(prev => ({
          ...prev,
          outline: result.data
        }));
      }
    } catch (error) {
      console.error('Failed to generate course outline:', error);
      console.error('❌ Failed to generate course outline:', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the AI-generated course
  const handleSaveCourse = async () => {
    // Validate required fields before saving
    if (!courseData.title?.trim()) {
      console.log('⚠️ Course title is required');
      setCourseCreationStatus('❌ Course title is required');
      return;
    }
    
    if (!courseData.description?.trim()) {
      console.log('⚠️ Course description is required');
      setCourseCreationStatus('❌ Course description is required');
      return;
    }

    if (!aiOutline || !aiOutline.modules || aiOutline.modules.length === 0) {
      console.log('⚠️ Please generate course outline first');
      setCourseCreationStatus('❌ Please generate course outline first');
      return;
    }

    setCourseCreationStatus('🚀 Creating course...');

    try {
      // Use the existing createAICourse function from courseService
      const { createAICourse, createAIModulesAndLessons } = await import('../../services/courseService');
      
      // Create the course first using the existing AI course creation function
      const coursePayload = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        objectives: courseData.objectives?.trim() || 'Learn new skills and concepts',
        duration: courseData.duration?.trim() || '4 weeks',
        max_students: 100,
        price: '0',
        thumbnail: courseData.thumbnail || null
      };

      console.log('Creating AI course with payload:', coursePayload);
      setCourseCreationStatus('📚 Creating course structure...');
      
      // Use the existing createAICourse function
      const createdCourse = await createAICourse(coursePayload);
      
      console.log('Course created successfully:', createdCourse);
      setCourseCreationStatus('📝 Creating modules and lessons...');
      
      // Create modules and lessons
      const outlines = [{
        modules: aiOutline.modules.map((module, index) => ({
          title: module.title || `Module ${index + 1}`,
          description: module.description || '',
          lessons: module.lessons || []
        }))
      }];
      
      // Create modules and lessons using the existing function
      const moduleResult = await createAIModulesAndLessons(createdCourse.data.id, outlines);
      console.log('Modules and lessons created:', moduleResult);
      
      // Check if modules were actually created
      const totalModules = moduleResult?.modules?.length || 0;
      const totalLessons = moduleResult?.lessons?.length || 0;
      
      if (totalModules > 0) {
        setCourseCreationStatus(`✅ Course created successfully! ${totalModules} modules, ${totalLessons} lessons`);
        console.log(`✅ Course "${courseData.title}" created successfully with ${totalModules} modules and ${totalLessons} lessons!`);
        
        // Wait a moment to show success message, then navigate
        setTimeout(() => {
          navigate('/dashboard/courses');
        }, 2000);
      } else {
        setCourseCreationStatus('⚠️ Course created but modules may not have been saved properly');
        console.log('⚠️ Course created but no modules were returned from creation');
      }
      
    } catch (error) {
      console.error('Failed to save AI course:', error);
      console.error('❌ Failed to save course:', error.message);
      setCourseCreationStatus(`❌ Failed to save course: ${error.message}`);
    }
  };

  // Handle lessons created
  const handleLessonsCreated = (lessonData) => {
    console.log('Lessons created:', lessonData);
    // Here you would typically update the course with the new lessons
    // For now, we'll just close the lesson creator
    setShowLessonCreator(false);
  };

  // Edit module functionality
  const editModule = (moduleIndex) => {
    if (aiOutline && aiOutline.modules && aiOutline.modules[moduleIndex]) {
      setEditingModule({
        index: moduleIndex,
        ...aiOutline.modules[moduleIndex]
      });
    }
  };

  // Save edited module
  const saveEditedModule = (editedModule) => {
    if (editingModule && aiOutline) {
      const updatedModules = [...aiOutline.modules];
      updatedModules[editingModule.index] = {
        title: editedModule.title,
        description: editedModule.description,
        lessons: editedModule.lessons || updatedModules[editingModule.index].lessons
      };
      
      setAiOutline({
        ...aiOutline,
        modules: updatedModules
      });
      
      setEditingModule(null);
      console.log('✅ Module updated successfully');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Course Creator</h2>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Main Content - Full Screen Layout */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
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
                  <h4 className="font-semibold text-gray-900 mb-3">{aiOutline.title}</h4>
                  <div className="space-y-3">
                    {aiOutline.modules && aiOutline.modules.map((module, index) => (
                      <div key={`${module.title}-${index}`} className="border-l-2 border-purple-500 pl-3">
                        <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                        <p className="text-xs text-gray-600">{module.description}</p>
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
                              className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-gray-50 cursor-pointer"
                            >
                              <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-1">
                                  Drag & drop any source materials or <span className="text-purple-600 font-medium">choose file</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Supported file types and sizes
                                </p>
                              </div>
                            </label>
                            
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Thumbnail
                    </label>
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
                  <Button
                    onClick={() => setShowLessonCreator(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 mt-3"
                  >
                    <Book className="w-4 h-4" />
                    Create AI Lessons
                  </Button>
                )}
              </div>
            )}
            
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            {courseCreationStatus && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{courseCreationStatus}</p>
              </div>
            )}
            <Button
              onClick={handleSaveCourse}
              disabled={!aiOutline || courseCreationStatus.includes('Creating')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add the AILessonCreator component */}
      <AILessonCreator
        isOpen={showLessonCreator}
        onClose={() => setShowLessonCreator(false)}
        courseTitle={courseData.title}
        onLessonsCreated={handleLessonsCreated}
      />

      {/* Module Edit Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => saveEditedModule(editingModule)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setEditingModule(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DedicatedAICourseCreator;