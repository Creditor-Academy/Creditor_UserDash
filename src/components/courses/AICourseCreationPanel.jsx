import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Upload,
  Book,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  generateAICourseOutline,
  generateSafeCourseOutline,
  createCompleteAICourse,
} from '../../services/aiCourseService';
import { generateComprehensiveCourse as generateShowcaseCourse } from '../../services/comprehensiveCourseGenerator';
import {
  createModule,
  createLesson,
  updateLessonContent,
} from '../../services/courseService';
import openAIService from '../../services/openAIService';
import { uploadImage } from '@/services/imageUploadService';
import { toast } from 'react-hot-toast';
import {
  uploadAICourseThumbnail,
  uploadAICourseReferences,
  uploadAIGeneratedImage,
} from '@/services/aiUploadService';
import EnhancedAILessonCreator from './EnhancedAILessonCreator';
import AITextEditor from './AITextEditor';
import '../../styles/AITextEditor.css';

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
    thumbnail: null,
    subjectDomain: '',
    learningObjectives: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutline, setAiOutline] = useState(null);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [aiImageError, setAiImageError] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'ai'
  const [activeThumbnailTab, setActiveThumbnailTab] = useState('upload');
  const [activeContentTab, setActiveContentTab] = useState('file');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sourceContent, setSourceContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [enableContentModeration, setEnableContentModeration] = useState(true);
  const [creationProgress, setCreationProgress] = useState('');
  const [moderationResults, setModerationResults] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorContent, setTextEditorContent] = useState('');
  const [textEditorType, setTextEditorType] = useState('paragraph');
  const [generatedTextBlocks, setGeneratedTextBlocks] = useState([]);
  const [generationMode, setGenerationMode] = useState('STANDARD');
  const fileInputRef = useRef(null);

  // Handle text editor save
  const handleTextEditorSave = textData => {
    const newBlock = {
      id: Date.now(),
      type: textData.type,
      content: textData.content,
      typeConfig: textData.typeConfig,
      createdAt: new Date().toISOString(),
    };

    setGeneratedTextBlocks(prev => [...prev, newBlock]);
    setShowTextEditor(false);
  };

  const tabs = [{ id: 'outline', label: 'Course Outline', icon: BookOpen }];

  // Handle drag and drop events
  const handleDragEnter = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async file => {
    try {
      if (file && file.type.startsWith('image/')) {
        console.log('🤖 Uploading AI course thumbnail via /api/ai endpoint...');
        const res = await uploadAICourseThumbnail(file, {
          public: true,
        });
        if (res?.success && res.imageUrl) {
          setCourseData(prev => ({ ...prev, thumbnail: res.imageUrl }));
          console.log(
            '✅ AI course thumbnail uploaded successfully via /api/ai:',
            res.imageUrl
          );
        }
      } else {
        console.log('⚠️ Please select an image file');
      }
    } catch (e) {
      console.error('Thumbnail upload failed:', e);
      console.error('❌ Failed to upload thumbnail:', e.message);
    }
  };

  // Handle file upload for source content
  const handleSourceFileUpload = async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      console.log(
        '🤖 Uploading AI course reference files via /api/ai endpoint...'
      );
      const results = await uploadAICourseReferences(files, {
        public: true,
      });

      const successfulUploads = results.filter(r => r.success && r.url);
      setUploadedFiles(prev => [...prev, ...successfulUploads]);

      const successCount = successfulUploads.length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        console.log(
          `✅ All ${successCount} reference files uploaded successfully via /api/ai`
        );
      } else {
        console.warn(
          `⚠️ Uploaded ${successCount}/${totalCount} reference files via /api/ai`
        );
      }
    } catch (err) {
      console.error('Reference upload failed:', err);
      console.error('❌ Failed to upload reference files:', err.message);
    }
  };

  const removeFile = index => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInput = e => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Generate comprehensive course with single module and showcase lesson
  const generateCourseOutline = async () => {
    if (!courseData.title.trim()) return;

    setIsGenerating(true);
    setModerationResults(null);

    console.log(
      '🎯 Generating comprehensive showcase course with single module...'
    );

    try {
      // Prepare course data for comprehensive generation
      const comprehensiveCourseData = {
        courseTitle: courseData.title,
        difficultyLevel: courseData.difficulty || 'intermediate',
        duration: courseData.duration || '4 weeks',
        targetAudience: courseData.targetAudience || 'professionals',
        moduleCount: 1, // ONE MODULE ONLY
        lessonsPerModule: 1, // ONE LESSON ONLY
      };

      console.log('📋 Comprehensive course data:', comprehensiveCourseData);

      // Generate comprehensive course with showcase lesson
      const result = await generateShowcaseCourse(comprehensiveCourseData);

      if (result && result.modules && result.modules.length > 0) {
        console.log('✅ Comprehensive showcase course generated successfully');
        console.log('📋 Generated course structure:', result);
        console.log('📋 Number of modules:', result.modules.length);
        console.log('📋 Module details:', result.modules[0]);
        console.log(
          '📋 Lesson blocks count:',
          result.modules[0].lessons[0].lesson_blocks?.length || 0
        );

        // Set the generated outline
        setAiOutline(result);

        // Set the comprehensive flag since our approach is always comprehensive
        setGeneratedContent(prev => ({
          ...prev,
          outline: result,
          comprehensive: true,
        }));

        console.log(
          `✅ Course outline generated successfully with ${result.modules.length} comprehensive module`
        );
        console.log(
          `🎨 Module thumbnail: ${result.modules[0].thumbnail || 'Not generated'}`
        );
        console.log(
          `🎨 Lesson thumbnail: ${result.modules[0].lessons[0].thumbnail || 'Not generated'}`
        );
      } else {
        console.error(
          '❌ Comprehensive course generation failed: No modules generated'
        );
        throw new Error('Failed to generate comprehensive course structure');
      }
    } catch (error) {
      console.error('❌ Comprehensive course generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        courseData: courseData,
      });

      // Fallback to basic generation if comprehensive fails
      console.log('🔄 Falling back to basic course generation...');
      try {
        const fallbackResult = await generateAICourseOutline({
          title: courseData.title,
          subject: courseData.subject || courseData.title,
          difficulty: courseData.difficulty || 'intermediate',
        });

        if (fallbackResult.success) {
          setAiOutline(fallbackResult.data);
          console.log('✅ Fallback course generation successful');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback generation also failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI thumbnail using Deep AI

  const generateAiThumbnail = async () => {
    if (!courseData.title.trim() && !aiImagePrompt.trim()) {
      setAiImageError('Please enter a course title or image prompt');
      return;
    }

    setAiImageGenerating(true);
    setAiImageError('');

    try {
      // Create a more descriptive prompt based on course title if no prompt is provided
      const prompt =
        aiImagePrompt.trim() ||
        `Professional course thumbnail for "${courseData.title}" - educational, modern, clean design, high quality`;

      console.log('🎨 Generating AI thumbnail with OpenAI DALL-E:', prompt);

      // Use OpenAI service for image generation
      const response = await openAIService.generateCourseImage(prompt, {
        style: 'vivid',
        size: '1024x1024',
      });

      if (response.success && response.data?.url) {
        console.log(
          '🎨 AI image generated, now uploading to S3 via /api/ai...'
        );

        try {
          // Upload the AI-generated image URL directly to S3 using AI endpoint
          const uploadResult = await uploadAIGeneratedImage(response.data.url, {
            public: true,
          });

          if (uploadResult?.success && uploadResult.imageUrl) {
            // Use the S3 URL instead of the temporary generated URL
            setCourseData(prev => ({
              ...prev,
              thumbnail: uploadResult.imageUrl,
            }));
            setAiImageError('');

            // Show success message with S3 upload details
            const successMsg =
              `✅ AI thumbnail generated and uploaded successfully!\n\n` +
              `🎨 Generated with: ${response.data.provider || 'Enhanced AI Service'}\n` +
              `🤖 Model: ${response.data.model || 'Multi-Provider'}\n` +
              `📏 Size: ${response.data.size || '1024x1024'}\n` +
              `☁️ Uploaded via: /api/ai endpoint\n` +
              `📁 S3 URL: ${uploadResult.imageUrl.substring(0, 50)}...`;

            console.log(
              '✅ AI thumbnail generated and uploaded via /api/ai successfully'
            );

            console.log('✅ AI thumbnail uploaded to S3 via /api/ai:', {
              originalUrl: response.data.url,
              s3Url: uploadResult.imageUrl,
              uploadedToS3: uploadResult.uploadedToS3,
              source: uploadResult.source,
            });
          } else {
            // Upload failed, use the generated URL as fallback
            setCourseData(prev => ({ ...prev, thumbnail: response.data.url }));
            setAiImageError(
              `⚠️ Image generated but S3 upload failed. Using temporary URL: ${uploadResult?.message || 'Upload error'}`
            );
            console.warn(
              'S3 upload via /api/ai failed, using generated URL as fallback'
            );
          }
        } catch (uploadError) {
          // Upload failed, use the generated URL as fallback
          setCourseData(prev => ({ ...prev, thumbnail: response.data.url }));
          setAiImageError(
            `⚠️ Image generated but S3 upload failed: ${uploadError.message}. Using temporary URL.`
          );
          console.error('S3 upload error via /api/ai:', uploadError);
        }
      } else {
        // Even if generation "failed", we might have a fallback image
        if (response.data?.url) {
          setCourseData(prev => ({ ...prev, thumbnail: response.data.url }));
          setAiImageError(
            `Using fallback image: ${response.error || 'Generation partially failed'}`
          );
        } else {
          setAiImageError(response.error || 'Failed to generate AI image');
        }
      }
    } catch (error) {
      setAiImageError('Failed to generate AI image: ' + error.message);
      console.error('AI thumbnail generation error details:', {
        message: error.message,
        stack: error.stack,
        prompt:
          aiImagePrompt.trim() ||
          `Professional course thumbnail for "${courseData.title}" - educational, modern, clean design`,
      });
    } finally {
      setAiImageGenerating(false);
    }
  };

  // Save the AI-generated course
  const handleSaveCourse = async () => {
    // Validate required fields before saving
    if (!courseData.title?.trim()) {
      console.log('⚠️ Course title is required');
      return;
    }

    if (!courseData.description?.trim()) {
      console.log('⚠️ Course description is required');
      return;
    }

    setIsCreatingCourse(true);
    setCreationProgress('Initializing course creation...');

    try {
      console.log('Creating complete AI course with deployed backend APIs...');

      setCreationProgress('Preparing course data...');

      // Prepare course data for the new backend-integrated service
      const completeAICourseData = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        subject: courseData.subject?.trim() || courseData.title.trim(),
        targetAudience: courseData.targetAudience?.trim() || 'General learners',
        difficulty: courseData.difficulty || 'beginner',
        duration: courseData.duration?.trim() || '4 weeks',
        learningObjectives:
          courseData.objectives?.trim() || 'Learn new skills and concepts',
        max_students: 100,
        price: '0',
        thumbnail: courseData.thumbnail || null,
        generationMode: generationMode, // Pass generation mode for content generation
        // Include comprehensive course structure with thumbnails if available
        comprehensiveCourseStructure: aiOutline || null,
      };

      console.log('Creating AI course with payload:', completeAICourseData);

      if (aiOutline) {
        console.log(
          '🎨 Using comprehensive course structure with thumbnails:',
          {
            moduleCount: aiOutline.modules?.length || 0,
            moduleThumbnail:
              aiOutline.modules?.[0]?.thumbnail || 'Not available',
            lessonThumbnail:
              aiOutline.modules?.[0]?.lessons?.[0]?.thumbnail ||
              'Not available',
          }
        );
      } else {
        console.log(
          '⚠️ No comprehensive course structure available - will generate basic outline'
        );
      }

      setCreationProgress('Creating course structure...');

      // Add a small delay to show the progress
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCreationProgress('Generating AI content...');

      // Use the new backend-integrated service to create complete course
      const result = await createCompleteAICourse(completeAICourseData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create complete AI course');
      }

      setCreationProgress('Finalizing course creation...');

      // Add another small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Complete AI course created successfully:', result.data);

      // Log thumbnail information for debugging
      if (result.data && result.data.modules) {
        console.log('🎨 Final course creation result - Thumbnail check:', {
          courseId: result.data.courseId,
          moduleCount: result.data.modules?.length || 0,
          moduleThumbnails:
            result.data.modules?.map(m => ({
              moduleId: m.id,
              title: m.title,
              thumbnail: m.thumbnail || 'No thumbnail',
            })) || [],
          lessonThumbnails:
            result.data.lessons?.map(l => ({
              lessonId: l.id,
              title: l.title,
              thumbnail: l.thumbnail || 'No thumbnail',
            })) || [],
        });
      }

      setCreationProgress('Course created successfully!');

      // Notify parent component
      if (onCourseCreated) {
        const courseObj = result.data.course?.data || result.data.course;
        onCourseCreated(courseObj);
      }

      // Show detailed success message
      console.log(
        `✅ Course "${courseData.title}" created successfully! Modules: ${result.data.totalModules}, Lessons: ${result.data.totalLessons}`
      );

      // Close the panel
      onClose();
    } catch (error) {
      console.error('Failed to save AI course:', error);
      setCreationProgress('');
      console.error('❌ Failed to save course:', error.message);
      // Log detailed error for debugging
      console.error('AI course save error details:', {
        message: error.message,
        stack: error.stack,
        courseData: courseData,
        aiOutline: aiOutline,
      });
    } finally {
      setIsCreatingCourse(false);
      setCreationProgress('');
    }
  };

  // Handle lessons created - NOW SAVES TO DATABASE
  const handleLessonsCreated = async lessonData => {
    console.log('🔄 Processing lessons created:', lessonData);

    try {
      // Check if we have a course ID to save to
      if (!courseData.id && !lessonData.courseId) {
        console.warn('⚠️ No course ID available - creating course first');

        // Create the course first if it doesn't exist
        const courseResult = await createCompleteAICourse({
          title: courseData.title,
          description: courseData.description,
          subject: courseData.subject,
          difficulty: courseData.difficulty,
          modules: [], // Will add modules separately
        });

        if (courseResult.success) {
          setCourseData(prev => ({ ...prev, id: courseResult.data.courseId }));
          lessonData.courseId = courseResult.data.courseId;
          console.log('✅ Course created with ID:', courseResult.data.courseId);
        } else {
          throw new Error('Failed to create course: ' + courseResult.error);
        }
      }

      const targetCourseId = courseData.id || lessonData.courseId;

      // Group lessons by module
      const moduleGroups = {};
      lessonData.lessons.forEach(lesson => {
        const moduleId = lesson.moduleId || 'default';
        if (!moduleGroups[moduleId]) {
          moduleGroups[moduleId] = [];
        }
        moduleGroups[moduleId].push(lesson);
      });

      // Create modules and lessons in database
      const createdModules = [];
      const createdLessons = [];

      for (const [moduleId, moduleLessons] of Object.entries(moduleGroups)) {
        try {
          // Create module
          const moduleData = {
            title: moduleLessons[0]?.moduleTitle || `Module for ${moduleId}`,
            description: `Generated module containing ${moduleLessons.length} lessons`,
            order: createdModules.length + 1,
            price: 0, // Required field
            thumbnail:
              moduleLessons[0]?.moduleThumbnail ||
              moduleLessons[0]?.module_thumbnail_url ||
              '',
          };

          console.log('🔄 Creating module:', moduleData.title);
          const createdModule = await createModule(targetCourseId, moduleData);
          createdModules.push(createdModule);

          // Create lessons in this module
          for (const lesson of moduleLessons) {
            try {
              const lessonPayload = {
                title: lesson.title,
                description:
                  lesson.description || 'AI-generated lesson content',
                content: lesson.content || '',
                duration: lesson.duration || '15 min',
                order: createdLessons.length + 1,
                thumbnail:
                  lesson.thumbnail || lesson.lesson_thumbnail_url || '',
              };

              console.log('🔄 Creating lesson:', lessonPayload.title);
              const createdLesson = await createLesson(
                targetCourseId,
                createdModule.id,
                lessonPayload
              );
              createdLessons.push(createdLesson);

              // Update lesson content with blocks if available
              if (lesson.blocks && lesson.blocks.length > 0) {
                const contentData = {
                  content: lesson.structuredContent || lesson.blocks,
                  blocks: lesson.blocks,
                  metadata: {
                    aiGenerated: true,
                    generatedAt: new Date().toISOString(),
                    blockCount: lesson.blocks.length,
                  },
                };

                console.log(
                  '🔄 Updating lesson content for:',
                  lessonPayload.title
                );
                await updateLessonContent(createdLesson.id, contentData);
              }
            } catch (lessonError) {
              console.error(
                '❌ Failed to create lesson:',
                lesson.title,
                lessonError
              );
            }
          }
        } catch (moduleError) {
          console.error('❌ Failed to create module:', moduleId, moduleError);
        }
      }

      // Show success message
      setShowLessonCreator(false);
      console.log(`✅ Successfully saved to database:`, {
        courseId: targetCourseId,
        modules: createdModules.length,
        lessons: createdLessons.length,
        totalBlocks: lessonData.lessons.reduce(
          (acc, lesson) => acc + (lesson.blocks?.length || 0),
          0
        ),
      });

      // Show user notification
      if (window.showNotification) {
        window.showNotification(
          `Successfully created ${createdModules.length} modules and ${createdLessons.length} lessons!`,
          'success'
        );
      } else {
        alert(
          `Successfully created ${createdModules.length} modules and ${createdLessons.length} lessons!`
        );
      }
    } catch (error) {
      console.error('❌ Failed to save lessons to database:', error);

      // Show error notification
      if (window.showNotification) {
        window.showNotification(
          `Failed to save lessons: ${error.message}`,
          'error'
        );
      } else {
        alert(`Failed to save lessons: ${error.message}`);
      }
    }
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
        thumbnail: null,
      });
      setAiOutline(null);
      setGeneratedContent({});
      setIsMinimized(false);
      setActiveThumbnailTab('upload');
      setAiImagePrompt('');
      setAiImageError('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-screen bg-black/30 backdrop-blur-sm z-40"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isMinimized ? 'calc(100% - 4rem)' : 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed top-0 right-0 bottom-0 h-screen bg-white shadow-2xl z-50 flex ${
              isMinimized ? 'w-16' : 'w-full max-w-4xl'
            }`}
            style={{ margin: 0, padding: 0 }}
            onClick={e => e.stopPropagation()}
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
                {tabs.map(tab => {
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
                    <h2 className="text-lg font-semibold text-gray-900">
                      AI Course Creator
                    </h2>
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
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Course Preview
                      </h3>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Course thumbnail */}
                        <div className="h-40 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                          {courseData.thumbnail ? (
                            <img
                              src={courseData.thumbnail}
                              alt="Course Thumbnail"
                              className="w-full h-full object-cover"
                              onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center ${courseData.thumbnail ? 'hidden' : 'flex'}`}
                            style={{
                              display: courseData.thumbnail ? 'none' : 'flex',
                            }}
                          >
                            <span className="text-white text-sm font-medium">
                              Course Thumbnail
                            </span>
                          </div>
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
                            {courseData.description ||
                              'Course description will appear here...'}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>
                                Duration: {courseData.duration || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>
                                Level: {courseData.difficulty || 'Beginner'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI-generated outline preview */}
                    {aiOutline && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                          {generatedContent?.comprehensive ? (
                            <>
                              🎯 Comprehensive Course Generated
                              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                                ARCHITECT
                              </span>
                            </>
                          ) : (
                            'Generated Outline'
                          )}
                        </h3>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              {aiOutline.courseTitle || aiOutline.course_title}
                            </h4>

                            {/* Course stats for comprehensive courses */}
                            {generatedContent?.comprehensive && (
                              <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-lg font-bold text-indigo-600">
                                      {aiOutline.modules?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Modules
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-purple-600">
                                      {aiOutline.modules?.reduce(
                                        (total, module) =>
                                          total + (module.lessons?.length || 0),
                                        0
                                      ) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Lessons
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-pink-600">
                                      {aiOutline.modules?.reduce(
                                        (total, module) =>
                                          total +
                                          (module.lessons?.reduce(
                                            (lessonTotal, lesson) =>
                                              lessonTotal +
                                              (lesson.imagePrompts?.length ||
                                                0),
                                            0
                                          ) || 0),
                                        0
                                      ) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Images
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {aiOutline.modules?.map((module, index) => (
                                <div
                                  key={`${module?.moduleTitle || module?.module_title || module?.title || 'module'}-${index}`}
                                  className={`border-l-2 pl-3 ${
                                    generatedContent?.comprehensive
                                      ? 'border-gradient-to-b from-indigo-500 to-purple-500'
                                      : 'border-purple-500'
                                  }`}
                                >
                                  <p className="font-medium text-gray-900 text-sm">
                                    {module?.moduleTitle ||
                                      module?.module_title ||
                                      module?.title ||
                                      'Untitled Module'}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {module?.moduleDescription ||
                                      module?.description ||
                                      'Module description'}
                                  </p>

                                  {/* Enhanced lesson display for comprehensive courses */}
                                  {generatedContent?.comprehensive &&
                                  module?.lessons?.length > 0 ? (
                                    <div className="mt-2 space-y-1">
                                      {module.lessons
                                        .slice(0, 3)
                                        .map((lesson, lessonIndex) => (
                                          <div
                                            key={lessonIndex}
                                            className="text-xs text-gray-500 pl-2 border-l border-gray-200"
                                          >
                                            •{' '}
                                            {lesson.lessonTitle ||
                                              lesson.lesson_title ||
                                              lesson.title}
                                            {lesson.quiz && (
                                              <span className="ml-1 text-blue-500">
                                                📝
                                              </span>
                                            )}
                                            {lesson.imagePrompts &&
                                              lesson.imagePrompts.length >
                                                0 && (
                                                <span className="ml-1 text-green-500">
                                                  🎨
                                                </span>
                                              )}
                                          </div>
                                        ))}
                                      {module.lessons.length > 3 && (
                                        <div className="text-xs text-gray-400 pl-2">
                                          +{module.lessons.length - 3} more
                                          lessons
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-600">
                                      {module?.lessons?.length > 0
                                        ? `${module.lessons.length} lesson${module.lessons.length > 1 ? 's' : ''}: ${module.lessons[0]?.lessonTitle || module.lessons[0]?.lesson_title || module.lessons[0]?.title || 'Lesson 1'}`
                                        : module?.lesson?.lesson_title ||
                                          'No lessons yet'}
                                    </p>
                                  )}
                                </div>
                              )) || []}
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
                      {tabs.map(tab => {
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
                                onChange={e =>
                                  setCourseData(prev => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
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
                                onChange={e =>
                                  setCourseData(prev => ({
                                    ...prev,
                                    subject: e.target.value,
                                  }))
                                }
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
                                onChange={e =>
                                  setCourseData(prev => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
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
                                  onChange={e =>
                                    setCourseData(prev => ({
                                      ...prev,
                                      duration: e.target.value,
                                    }))
                                  }
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
                                  onChange={e =>
                                    setCourseData(prev => ({
                                      ...prev,
                                      difficulty: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">
                                    Intermediate
                                  </option>
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
                                onChange={e =>
                                  setCourseData(prev => ({
                                    ...prev,
                                    objectives: e.target.value,
                                    learningObjectives: e.target.value, // Sync with learningObjectives
                                  }))
                                }
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="What will students learn?"
                              />
                            </div>

                            {/* Generation Mode Selector */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content Generation Mode
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setGenerationMode('QUICK')}
                                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                                    generationMode === 'QUICK'
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="font-semibold text-sm text-gray-900">
                                    ⚡ Quick
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Fast, minimal content
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setGenerationMode('STANDARD')}
                                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                                    generationMode === 'STANDARD'
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="font-semibold text-sm text-gray-900">
                                    ⭐ Standard
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Balanced quality
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setGenerationMode('COMPLETE')}
                                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                                    generationMode === 'COMPLETE'
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="font-semibold text-sm text-gray-900">
                                    💎 Complete
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Rich multimedia
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setGenerationMode('PREMIUM')}
                                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                                    generationMode === 'PREMIUM'
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="font-semibold text-sm text-gray-900">
                                    👑 Premium
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Highest quality
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* Source Content Section */}
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-800">
                                  What source content should I reference?
                                  (Adding content will improve our results.)
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
                                            Drag & drop any source materials or{' '}
                                            <span className="text-purple-600 font-medium">
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
                                          Supported file types: .doc, .docx,
                                          .m4a, .mp3, .mp4, .ogg, .pdf, .ppt,
                                          .pptx, .sbv, .srt, .story, .sub,
                                          .text, .txt, .vtt, .wav, or .webm
                                        </p>
                                        <p>
                                          Maximum size: 1 GB, 200K characters or
                                          less per file.
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
                                              key={`${file.name}-${index}`}
                                              className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                                            >
                                              <span className="text-gray-700 truncate flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                <span className="text-sm">
                                                  {file.name}
                                                </span>
                                              </span>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  removeFile(index)
                                                }
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
                                        onChange={e =>
                                          setSourceContent(e.target.value)
                                        }
                                        placeholder="Paste text or URLs you want me to reference"
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      />
                                      <p className="text-xs text-gray-500">
                                        You can paste URLs, text content, or any
                                        reference material here
                                      </p>
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
                                  onClick={() =>
                                    setActiveThumbnailTab('upload')
                                  }
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
                                    {courseData.thumbnail
                                      ? courseData.thumbnail
                                      : 'Drag & drop an image or click to browse'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG up to 5MB
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      AI Image Prompt
                                    </label>
                                    <textarea
                                      value={aiImagePrompt}
                                      onChange={e =>
                                        setAiImagePrompt(e.target.value)
                                      }
                                      placeholder={`Describe the image you want to generate for "${courseData.title || 'your course'}"`}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      rows={3}
                                    />
                                    {!aiImagePrompt && courseData.title && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Using course title as prompt:
                                        "Professional course thumbnail for "
                                        {courseData.title}" - educational,
                                        modern, clean design"
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
                                      'Generate AI Thumbnail'
                                    )}
                                  </button>
                                  {aiImageError && (
                                    <div className="text-sm text-red-600">
                                      {aiImageError}
                                    </div>
                                  )}

                                  <div className="text-xs text-gray-500">
                                    <p>
                                      Tip: Include details like subject matter,
                                      style, and mood for better results.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Generate Comprehensive Showcase Course */}
                          {!aiOutline && (
                            <Button
                              onClick={generateCourseOutline}
                              disabled={
                                isGenerating || !courseData.title.trim()
                              }
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Generating Comprehensive Showcase Course...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  🎯 Generate Comprehensive Showcase Course
                                </>
                              )}
                            </Button>
                          )}

                          {/* Show Course Editor button when outline exists */}
                          {aiOutline && (
                            <>
                              <Button
                                onClick={() => setShowLessonCreator(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 mt-3"
                              >
                                <Book className="w-4 h-4" />
                                Course Editor
                              </Button>
                              <Button
                                onClick={handleSaveCourse}
                                disabled={isCreatingCourse}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-3"
                              >
                                {isCreatingCourse ? (
                                  <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                    Creating Course...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Create Course
                                  </>
                                )}
                              </Button>

                              {/* Progress indicator */}
                              {isCreatingCourse && creationProgress && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-blue-700 font-medium">
                                      {creationProgress}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Enhanced AI Lesson Creator Modal */}
          {showLessonCreator && (
            <EnhancedAILessonCreator
              isOpen={showLessonCreator}
              onClose={() => setShowLessonCreator(false)}
              courseTitle={courseData.title}
              courseData={courseData}
              aiOutline={aiOutline}
              onLessonsCreated={handleLessonsCreated}
            />
          )}

          {/* AI Text Editor Modal */}
          {showTextEditor && (
            <AITextEditor
              isOpen={showTextEditor}
              onClose={() => setShowTextEditor(false)}
              onSave={handleTextEditorSave}
              initialContent={textEditorContent}
              initialType={textEditorType}
              title="AI Course Content Editor"
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default AICourseCreationPanel;
