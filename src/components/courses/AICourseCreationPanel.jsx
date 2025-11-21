import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  generateAICourseOutline,
  generateSafeCourseOutline,
  createCompleteAICourse,
} from '../../services/aiCourseService';
import { generateComprehensiveCourse as generateShowcaseCourse } from '../../services/comprehensiveCourseGenerator';
import {
  createAICourse,
  createModule,
  createLesson,
  updateLessonContent,
} from '../../services/courseService';
import openAIService from '../../services/openAIService';
import secureAIService from '../../services/secureAIService';
import { uploadImage } from '@/services/imageUploadService';
import { toast } from 'react-hot-toast';
import {
  uploadAICourseThumbnail,
  uploadAICourseReferences,
} from '@/services/aiUploadService';
import EnhancedAILessonCreator from './EnhancedAILessonCreator';
import AITextEditor from './AITextEditor';
import AIStreamingGeneration from './AIStreamingGeneration';
import '@lessonbuilder/styles/AITextEditor.css';

const AICourseCreationPanel = ({ isOpen, onClose, onCourseCreated }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outline');
  const [isMinimized, setIsMinimized] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [courseData, setCourseData] = useState({
    courseName: '',
    learningOutcomes: '',
    targetAudience: '',
    priorKnowledge: 'no',
    priorKnowledgeDetails: '',
    description: '',
    duration: '',
    difficulty: 'beginner',
    thumbnail: null,
    // Keep legacy fields for backwards compatibility
    title: '',
    subject: '',
    objectives: '',
    // Blueprint-specific inputs (1.1–1.8)
    blueprintCoursePurpose: '',
    blueprintLearnerProfile: '',
    blueprintLearningConstraints: '',
    blueprintComplianceRequirements: '',
    blueprintPriorKnowledge: '',
    blueprintCourseStructure: '',
    blueprintSuccessMeasurement: '',
    blueprintRequiredResources: '',
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
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [isStreamingGeneration, setIsStreamingGeneration] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState([]);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [createdCourseId, setCreatedCourseId] = useState(null);
  const [createdModuleId, setCreatedModuleId] = useState(null);
  const [createdLessonId, setCreatedLessonId] = useState(null);
  const [generateThumbnails, setGenerateThumbnails] = useState('yes');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [courseBlueprint, setCourseBlueprint] = useState(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [blueprintError, setBlueprintError] = useState('');
  const [hasEnhancedBlueprint, setHasEnhancedBlueprint] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Handle AI image prompt enhancement
  const handleEnhancePrompt = async () => {
    if (!aiImagePrompt?.trim()) {
      toast.error('Please enter an image prompt first');
      return;
    }

    setIsEnhancingPrompt(true);
    try {
      // Call backend image prompt enhancement (already has proper system prompt)
      const enhancedPrompt = await secureAIService.generateText(aiImagePrompt, {
        model: 'gpt-4o-mini',
        maxTokens: 100,
        temperature: 0.5,
        systemPrompt:
          'You are a DALL-E prompt engineer. Output ONLY the prompt text. Maximum 300 characters. NO headings. Start directly with the description.',
        enhancePrompt: true, // Use backend prompt enhancement
      });

      setAiImagePrompt(enhancedPrompt);
      toast.success('Image prompt enhanced successfully!');
    } catch (error) {
      console.error('Image prompt enhancement error:', error);
      toast.error('Failed to enhance image prompt: ' + error.message);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleEnhanceBlueprintInputs = async () => {
    const {
      blueprintCoursePurpose,
      blueprintLearnerProfile,
      blueprintLearningConstraints,
      blueprintComplianceRequirements,
      blueprintPriorKnowledge,
      blueprintCourseStructure,
      blueprintSuccessMeasurement,
      blueprintRequiredResources,
    } = courseData;

    const hasAnyInput = [
      blueprintCoursePurpose,
      blueprintLearnerProfile,
      blueprintLearningConstraints,
      blueprintComplianceRequirements,
      blueprintPriorKnowledge,
      blueprintCourseStructure,
      blueprintSuccessMeasurement,
      blueprintRequiredResources,
    ].some(value => value && value.trim().length > 0);

    if (!hasAnyInput) {
      toast.error(
        'Fill at least one blueprint field (1.1–1.8) before enhancing.'
      );
      return;
    }

    try {
      setIsEnhancingPrompt(true);

      const systemPrompt = `You are an expert instructional designer and prompt engineer.
Rewrite the following course blueprint inputs into clear, professional, structured text that is easy for an AI to understand.
Preserve the original meaning, constraints, and intent. Do NOT add new requirements.
Return ONLY valid JSON with the same keys you receive.`;

      const userPayload = {
        coursePurpose: blueprintCoursePurpose || '',
        targetLearnerProfile: blueprintLearnerProfile || '',
        learningConstraints: blueprintLearningConstraints || '',
        complianceRequirements: blueprintComplianceRequirements || '',
        priorKnowledge: blueprintPriorKnowledge || '',
        courseStructure: blueprintCourseStructure || '',
        successMeasurement: blueprintSuccessMeasurement || '',
        requiredResources: blueprintRequiredResources || '',
      };

      const userPrompt = `Refine these blueprint fields while preserving meaning:

${JSON.stringify(userPayload, null, 2)}`;

      const enhanced = await secureAIService.generateStructured(
        systemPrompt,
        userPrompt,
        {
          model: 'gpt-4o-mini',
          maxTokens: 1800,
          temperature: 0.4,
        }
      );

      if (!enhanced || typeof enhanced !== 'object') {
        toast.error('Enhancement failed. Using original blueprint inputs.');
        return;
      }

      // Helper function to safely convert to string
      const toString = value => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          // If it's an object, try to extract meaningful text
          if (Array.isArray(value)) {
            return value
              .map(item =>
                typeof item === 'string' ? item : JSON.stringify(item)
              )
              .join(', ');
          }
          // Try common object properties
          if (value.text) return String(value.text);
          if (value.content) return String(value.content);
          if (value.description) return String(value.description);
          if (value.value) return String(value.value);
          // Last resort: stringify but remove quotes
          return JSON.stringify(value).replace(/^"|"$/g, '');
        }
        return String(value);
      };

      setCourseData(prev => ({
        ...prev,
        blueprintCoursePurpose:
          toString(enhanced.coursePurpose) || prev.blueprintCoursePurpose,
        blueprintLearnerProfile:
          toString(enhanced.targetLearnerProfile) ||
          prev.blueprintLearnerProfile,
        blueprintLearningConstraints:
          toString(enhanced.learningConstraints) ||
          prev.blueprintLearningConstraints,
        blueprintComplianceRequirements:
          toString(enhanced.complianceRequirements) ||
          prev.blueprintComplianceRequirements,
        blueprintPriorKnowledge:
          toString(enhanced.priorKnowledge) || prev.blueprintPriorKnowledge,
        blueprintCourseStructure:
          toString(enhanced.courseStructure) || prev.blueprintCourseStructure,
        blueprintSuccessMeasurement:
          toString(enhanced.successMeasurement) ||
          prev.blueprintSuccessMeasurement,
        blueprintRequiredResources:
          toString(enhanced.requiredResources) ||
          prev.blueprintRequiredResources,
      }));

      setHasEnhancedBlueprint(true);
      toast.success('Blueprint inputs enhanced successfully.');
    } catch (error) {
      console.error('Blueprint enhancement error:', error);
      toast.error(
        error.message ||
          'Failed to enhance blueprint inputs. Please try again later.'
      );
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamingMessages]);

  // Add streaming message
  const addStreamingMessage = (text, type = 'ai') => {
    setStreamingMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        type,
        timestamp: new Date(),
      },
    ]);
  };

  // Start inline streaming generation
  const startInlineGeneration = async () => {
    setIsStreamingGeneration(true);
    setStreamingMessages([]);
    setStreamingProgress(0);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Welcome
      addStreamingMessage(
        `🎓 Welcome! Creating "${courseData.courseName || courseData.title}"...`,
        'ai'
      );
      await delay(800);
      setStreamingProgress(10);

      // Step 2: Understanding
      addStreamingMessage(
        `📋 Understanding your requirements...\n\n` +
          `👥 Audience: ${courseData.targetAudience}\n` +
          `🎯 Outcome: ${courseData.learningOutcomes}\n` +
          `📚 Prerequisites: ${courseData.priorKnowledge === 'yes' ? courseData.priorKnowledgeDetails : 'None'}`,
        'ai'
      );
      await delay(1200);
      setStreamingProgress(30);

      // Step 3: Start generation
      addStreamingMessage('🏗️ Building course structure...', 'ai');
      await delay(1000);

      // Trigger actual generation
      await generateCourseOutline();

      setStreamingProgress(100);
      addStreamingMessage(
        '✅ Course generated successfully! Review below and click "Create Course" when ready.',
        'success'
      );

      // Reset after a delay
      setTimeout(() => {
        setIsStreamingGeneration(false);
      }, 2000);
    } catch (error) {
      console.error('Generation error:', error);
      addStreamingMessage('❌ Generation failed. Please try again.', 'error');
      setIsStreamingGeneration(false);
    }
  };

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

  const handleGenerateBlueprint = async () => {
    const courseTitle =
      courseData.courseName?.trim() || courseData.title?.trim();
    const outcomes = courseData.learningOutcomes?.trim();
    const audience = courseData.targetAudience?.trim();

    if (!courseTitle) {
      toast.error('Course name is required to generate a blueprint');
      return;
    }
    if (!outcomes) {
      toast.error(
        'Please describe what learners will be able to do before generating a blueprint'
      );
      return;
    }
    if (!audience) {
      toast.error('Please specify who this course is for');
      return;
    }

    setIsGeneratingBlueprint(true);
    setBlueprintError('');

    try {
      // Auto-enhance blueprint inputs (1.1-1.8) if they exist
      const hasBlueprintInputs = [
        courseData.blueprintCoursePurpose,
        courseData.blueprintLearnerProfile,
        courseData.blueprintLearningConstraints,
        courseData.blueprintComplianceRequirements,
        courseData.blueprintPriorKnowledge,
        courseData.blueprintCourseStructure,
        courseData.blueprintSuccessMeasurement,
        courseData.blueprintRequiredResources,
      ].some(value => value && value.trim().length > 0);

      if (hasBlueprintInputs && !hasEnhancedBlueprint) {
        // Auto-enhance blueprint inputs before generating
        await handleEnhanceBlueprintInputs();
      }

      // Get module and lesson counts (default to 1 if not specified)
      const moduleCount = courseData.moduleCount || 1;
      const lessonsPerModule = courseData.lessonsPerModule || 1;

      const blueprintInput = {
        courseTitle,
        subjectDomain: courseData.subject || courseData.targetAudience,
        courseDescription:
          courseData.description?.trim() || courseData.learningOutcomes,
        duration: courseData.duration || '4 weeks',
        difficulty: courseData.difficulty || 'intermediate',
        learningObjectives:
          courseData.learningOutcomes || courseData.objectives,
        targetAudience: courseData.targetAudience,
        priorKnowledge: {
          required: courseData.priorKnowledge === 'yes',
          details: courseData.priorKnowledgeDetails || '',
        },
        // Extended architect inputs (1.1–1.8)
        coursePurpose: courseData.blueprintCoursePurpose,
        targetLearnerProfile: courseData.blueprintLearnerProfile,
        learningConstraints: courseData.blueprintLearningConstraints,
        complianceRequirements: courseData.blueprintComplianceRequirements,
        priorKnowledgeExtra: courseData.blueprintPriorKnowledge,
        courseStructure: courseData.blueprintCourseStructure,
        successMeasurement: courseData.blueprintSuccessMeasurement,
        requiredResources: courseData.blueprintRequiredResources,
        // Add target structure to explicitly control module/lesson count
        targetStructure: `${moduleCount} module${moduleCount !== 1 ? 's' : ''}, ${moduleCount * lessonsPerModule} lesson${moduleCount * lessonsPerModule !== 1 ? 's' : ''}, ${lessonsPerModule} lesson${lessonsPerModule !== 1 ? 's' : ''} per module`,
        moduleCount,
        lessonsPerModule,
      };

      const result =
        await openAIService.generateCourseBlueprint(blueprintInput);

      if (!result?.success || !result.data) {
        throw new Error(result?.error || 'Course blueprint generation failed');
      }

      setCourseBlueprint(result.data);

      // Also derive the outline/comprehensive view directly from the blueprint
      // so the "Comprehensive Course Generated" card always reflects the
      // master blueprint structure rather than a separate 1-module showcase.
      const blueprint = result.data;
      const blueprintModules =
        blueprint?.structure?.modules?.length > 0
          ? blueprint.structure.modules
          : null;

      if (blueprintModules) {
        const outlineFromBlueprint = {
          courseTitle:
            blueprint.meta?.courseTitle ||
            courseData.title ||
            courseData.courseName,
          subject:
            blueprint.meta?.subjectDomain ||
            courseData.subject ||
            courseData.title,
          modules: blueprintModules.map((module, moduleIndex) => {
            const lessons = (module.lessons || []).map(
              (lesson, lessonIndex) => ({
                ...lesson,
                title:
                  lesson.title ||
                  lesson.lessonTitle ||
                  `Lesson ${lessonIndex + 1}`,
                description:
                  lesson.description ||
                  lesson.lessonDescription ||
                  'AI-generated lesson content',
              })
            );

            return {
              ...module,
              title:
                module.title ||
                module.moduleTitle ||
                `Module ${moduleIndex + 1}`,
              description:
                module.description ||
                module.moduleDescription ||
                'AI-generated module content',
              lessons,
            };
          }),
        };

        setAiOutline(outlineFromBlueprint);
        setGeneratedContent(prev => ({
          ...prev,
          outline: outlineFromBlueprint,
          comprehensive: true,
        }));
      }

      toast.success('Master course blueprint generated successfully!');
    } catch (error) {
      console.error('Course blueprint generation error:', error);
      const message =
        error.message ||
        'Failed to generate course blueprint. Please try again.';
      setBlueprintError(message);
      toast.error(message);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Generate course outline / comprehensive view
  const generateCourseOutline = async () => {
    if (!courseData.title.trim()) return;

    setIsGenerating(true);
    setModerationResults(null);

    try {
      // If a master blueprint already exists, derive the outline directly
      // from the blueprint instead of generating a separate 1-module course.
      const blueprintModules =
        courseBlueprint?.structure?.modules?.length > 0
          ? courseBlueprint.structure.modules
          : null;

      if (blueprintModules) {
        console.log(
          '📘 Using Master Course Blueprint to build comprehensive outline instead of standalone showcase course'
        );

        const outlineFromBlueprint = {
          courseTitle:
            courseBlueprint.meta?.courseTitle ||
            courseData.title ||
            courseData.courseName,
          subject:
            courseBlueprint.meta?.subjectDomain ||
            courseData.subject ||
            courseData.title,
          modules: blueprintModules.map((module, moduleIndex) => {
            const lessons = (module.lessons || []).map(
              (lesson, lessonIndex) => ({
                ...lesson,
                title:
                  lesson.title ||
                  lesson.lessonTitle ||
                  `Lesson ${lessonIndex + 1}`,
                description:
                  lesson.description ||
                  lesson.lessonDescription ||
                  'AI-generated lesson content',
              })
            );

            return {
              ...module,
              title:
                module.title ||
                module.moduleTitle ||
                `Module ${moduleIndex + 1}`,
              description:
                module.description ||
                module.moduleDescription ||
                'AI-generated module content',
              lessons,
            };
          }),
        };

        setAiOutline(outlineFromBlueprint);
        setGeneratedContent(prev => ({
          ...prev,
          outline: outlineFromBlueprint,
          comprehensive: true,
        }));

        console.log(
          `✅ Outline derived from blueprint with ${outlineFromBlueprint.modules.length} modules`
        );
        return;
      }

      console.log(
        '🎯 Generating comprehensive showcase course with single module...'
      );

      // Prepare course data for comprehensive generation when no blueprint exists
      const comprehensiveCourseData = {
        courseTitle: courseData.title,
        difficultyLevel: courseData.difficulty || 'intermediate',
        duration: courseData.duration || '4 weeks',
        targetAudience: courseData.targetAudience || 'professionals',
        moduleCount: 1, // ONE MODULE ONLY (legacy showcase mode)
        lessonsPerModule: 1, // ONE LESSON ONLY
        generateThumbnails: generateThumbnails === 'yes', // Pass thumbnail setting
      };

      console.log('📋 Comprehensive course data:', comprehensiveCourseData);
      console.log('🎨 Thumbnail generation:', generateThumbnails);

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
          `🎨 Lesson thumbnail: ${
            result.modules[0].lessons[0].thumbnail || 'Not generated'
          }`
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
        quality: 'standard',
        style: 'vivid',
      });

      // Check if we have a valid image URL (either from success or fallback)
      const imageUrl = response.data?.url || response.url;

      if (response.success && imageUrl) {
        console.log('✅ AI image generated and uploaded to S3 by backend!');

        // Use the S3 URL directly (already uploaded by backend)
        setCourseData(prev => ({
          ...prev,
          thumbnail: imageUrl,
        }));

        // Show success message
        const successMsg =
          `✅ AI thumbnail generated and uploaded successfully!\n\n` +
          `🎨 Generated with: DALL-E 3\n` +
          `📏 Size: 1024x1024\n` +
          `☁️ Uploaded to S3 automatically\n` +
          `📁 S3 URL: ${imageUrl.substring(0, 50)}...`;

        console.log('✅ AI thumbnail generated and uploaded successfully');
        setAiImageError('');
        toast.success('AI thumbnail generated successfully!');
      } else if (imageUrl) {
        // Partial success - we have an image but there might be issues
        console.log('⚠️ AI image generated with warnings');
        setCourseData(prev => ({ ...prev, thumbnail: imageUrl }));
        setAiImageError(
          `Image generated with warnings: ${response.error || 'Check console for details'}`
        );
        toast.warning('AI thumbnail generated with warnings');
      } else {
        // Complete failure - no image URL available
        console.error('❌ AI image generation failed completely');
        setAiImageError(
          response.error ||
            'Failed to generate AI image - no URL returned from backend'
        );
        toast.error('Failed to generate AI thumbnail');
      }
    } catch (error) {
      // Use improved error notification
      const { showAIError } = await import('@/utils/aiErrorNotifications');
      const errorInfo = showAIError(error, 'AI Image Generation', {
        showToast: true,
        logToConsole: true,
        includeDetails: true,
      });
      setAiImageError(errorInfo.userMessage);
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

  // Save the AI-generated course with real-time progress
  const handleSaveCourse = async () => {
    // Validate required fields before saving
    const courseTitle =
      courseData.courseName?.trim() || courseData.title?.trim();
    const courseDesc =
      courseData.learningOutcomes?.trim() || courseData.description?.trim();

    if (!courseTitle) {
      toast.error('Course name is required');
      return;
    }

    if (!courseDesc) {
      toast.error('Learning outcomes are required');
      return;
    }

    setIsCreatingCourse(true);
    setIsStreamingGeneration(true);
    setStreamingMessages([]);
    setStreamingProgress(0);
    setCurrentBlock(null);
    setCreatedCourseId(null);
    setCreatedModuleId(null);
    setCreatedLessonId(null);

    try {
      console.log('🚀 Creating AI course with real-time progress...');
      console.log('📋 Course data:', {
        courseTitle,
        courseDesc,
        generateThumbnails,
      });

      // Step 1: Create Course (10% progress)
      addStreamingMessage('🎓 Creating course...', 'ai');
      setStreamingProgress(10);

      // Build course payload - only include thumbnail if it exists
      const coursePayload = {
        title: courseTitle,
        description: courseDesc,
        difficulty: courseData.difficulty || 'beginner',
        duration: courseData.duration?.trim() || '4 weeks',
        max_students: 100,
        price: 0,
      };

      // Only add thumbnail if it has a valid value
      if (courseData.thumbnail && courseData.thumbnail.trim() !== '') {
        coursePayload.thumbnail = courseData.thumbnail;
      }

      const courseResult = await createAICourse(coursePayload);

      console.log('✅ Course API response:', courseResult);

      if (!courseResult) {
        throw new Error('No response from course creation API');
      }

      // Extract ID from nested data structure (backend returns {code, data, success, message})
      const newCourseId = courseResult.data?.id || courseResult.id;

      if (!newCourseId) {
        console.error('❌ Course result missing ID:', courseResult);
        throw new Error('Failed to create course - no ID returned');
      }
      setCreatedCourseId(newCourseId);
      addStreamingMessage(`✅ Course created: "${courseTitle}"`, 'success');
      setStreamingProgress(20);

      const blueprintModules =
        courseBlueprint?.structure?.modules?.length > 0
          ? courseBlueprint.structure.modules
          : null;
      const fallbackModules = aiOutline?.modules?.length
        ? aiOutline.modules
        : [];
      const modulesToCreate =
        blueprintModules?.length > 0
          ? blueprintModules
          : fallbackModules.length > 0
            ? fallbackModules
            : [
                {
                  title: 'Module 1',
                  description: 'AI-generated module content',
                  lessons: [
                    {
                      title: 'Lesson 1',
                      description: 'AI-generated lesson content',
                      duration: '15 min',
                    },
                  ],
                },
              ];
      const usingBlueprint = blueprintModules?.length > 0;

      if (generateThumbnails === 'yes') {
        addStreamingMessage(
          `📚 Creating ${modulesToCreate.length} modules using ${
            usingBlueprint ? 'blueprint' : 'outline'
          } structure...`,
          'ai'
        );
      } else {
        addStreamingMessage(
          '📚 Creating modules (without thumbnails)...',
          'ai'
        );
      }
      setStreamingProgress(30);

      const createdModules = [];
      const moduleErrors = [];

      for (let i = 0; i < modulesToCreate.length; i++) {
        const moduleData = modulesToCreate[i] || {};
        const moduleTitle =
          moduleData.moduleTitle || moduleData.title || `Module ${i + 1}`;
        const moduleDescription =
          moduleData.moduleDescription ||
          moduleData.description ||
          'Course module content';

        try {
          let moduleThumbnail =
            moduleData.thumbnail || moduleData.module_thumbnail_url;

          // Generate thumbnail if "yes" is selected and thumbnail doesn't exist
          if (
            generateThumbnails === 'yes' &&
            (!moduleThumbnail || moduleThumbnail.trim() === '')
          ) {
            try {
              addStreamingMessage(
                `🎨 Generating thumbnail for ${moduleTitle}...`,
                'ai'
              );
              const { generateModuleThumbnailPrompt } = await import(
                '@/services/comprehensiveCourseGenerator'
              );
              const { detectTopicContext } = await import(
                '@/services/comprehensiveShowcaseLesson'
              );
              const openAIService = (await import('@/services/openAIService'))
                .default;

              const topicContext = detectTopicContext
                ? detectTopicContext(courseTitle)
                : {
                    imageStyle: 'modern',
                    domain: 'education',
                    field: courseData.subject || 'general',
                    keywords: [],
                  };
              let thumbnailPrompt = await generateModuleThumbnailPrompt(
                moduleTitle,
                moduleDescription,
                topicContext
              );

              // Safety check: Ensure prompt is under 1000 characters (backend limit)
              if (thumbnailPrompt && thumbnailPrompt.length > 950) {
                thumbnailPrompt = thumbnailPrompt.substring(0, 950).trim();
                console.warn(
                  `⚠️ Truncated module thumbnail prompt to ${thumbnailPrompt.length} characters`
                );
              }

              const imageResult = await openAIService.generateImage(
                thumbnailPrompt,
                {
                  size: '1024x1024',
                  quality: 'standard',
                  uploadToS3: true,
                  folder: 'ai-thumbnails/modules',
                }
              );

              if (imageResult?.success) {
                const imageUrl =
                  imageResult.data?.url ||
                  imageResult.url ||
                  imageResult.data?.imageUrl ||
                  imageResult.imageUrl;
                if (imageUrl) {
                  moduleThumbnail = imageUrl;
                  console.log(
                    `✅ Generated module thumbnail: ${moduleThumbnail}`
                  );
                }
              }
            } catch (thumbError) {
              console.warn(
                `⚠️ Failed to generate module thumbnail:`,
                thumbError
              );
              // Continue without thumbnail
            }
          }

          const modulePayload = {
            title: moduleTitle,
            description: moduleDescription,
            order: i + 1,
            price: 0,
            module_status: 'PUBLISHED',
          };

          if (
            generateThumbnails === 'yes' &&
            moduleThumbnail &&
            moduleThumbnail.trim() !== ''
          ) {
            modulePayload.thumbnail = moduleThumbnail;
          }

          console.log(
            `📋 Creating module ${i + 1} payload for ${moduleTitle}:`,
            modulePayload
          );

          const createdModule = await createModule(newCourseId, modulePayload);
          const createdModuleId =
            createdModule?.data?.id || createdModule?.id || null;

          createdModules.push({
            id: createdModuleId,
            data: createdModule,
            originalLessons: moduleData.lessons || [],
            title: moduleTitle,
            moduleIndex: i,
          });

          console.log(
            `✅ Module ${moduleTitle} created successfully (ID ${createdModuleId})`
          );
        } catch (moduleError) {
          console.error(
            `❌ Failed to create module ${moduleTitle}:`,
            moduleError
          );
          moduleErrors.push({
            moduleIndex: i,
            moduleTitle,
            error: moduleError.message,
          });
        }
      }

      if (moduleErrors.length > 0) {
        console.warn('⚠️ Module creation errors:', moduleErrors);
      }

      setStreamingProgress(45);
      addStreamingMessage('📖 Creating lessons from blueprint...', 'ai');
      setStreamingProgress(55);

      const createdLessons = [];
      const lessonErrors = [];

      for (const module of createdModules) {
        const moduleId = module.id;
        const moduleLessons = module.originalLessons || [];
        const moduleTitle =
          module.title ||
          `Module ${typeof module.moduleIndex === 'number' ? module.moduleIndex + 1 : 1}`;

        for (let j = 0; j < moduleLessons.length; j++) {
          const lessonData = moduleLessons[j] || {};
          const lessonTitle =
            lessonData.lessonTitle || lessonData.title || `Lesson ${j + 1}`;
          const lessonDescription =
            lessonData.lessonDescription ||
            lessonData.description ||
            'Lesson content';

          try {
            let lessonThumbnail =
              lessonData.thumbnail || lessonData.lesson_thumbnail_url;

            // Generate thumbnail if "yes" is selected and thumbnail doesn't exist
            if (
              generateThumbnails === 'yes' &&
              (!lessonThumbnail || lessonThumbnail.trim() === '')
            ) {
              try {
                addStreamingMessage(
                  `🎨 Generating thumbnail for ${lessonTitle}...`,
                  'ai'
                );
                const { generateLessonThumbnailPrompt } = await import(
                  '@/services/comprehensiveCourseGenerator'
                );
                const { detectTopicContext } = await import(
                  '@/services/comprehensiveShowcaseLesson'
                );
                const openAIService = (await import('@/services/openAIService'))
                  .default;

                const topicContext = detectTopicContext
                  ? detectTopicContext(courseTitle)
                  : {
                      imageStyle: 'modern',
                      domain: 'education',
                      field: courseData.subject || 'general',
                      keywords: [],
                    };
                let thumbnailPrompt = await generateLessonThumbnailPrompt(
                  lessonTitle,
                  lessonDescription,
                  topicContext
                );

                // Safety check: Ensure prompt is under 1000 characters (backend limit)
                if (thumbnailPrompt && thumbnailPrompt.length > 950) {
                  thumbnailPrompt = thumbnailPrompt.substring(0, 950).trim();
                  console.warn(
                    `⚠️ Truncated lesson thumbnail prompt to ${thumbnailPrompt.length} characters`
                  );
                }

                const imageResult = await openAIService.generateImage(
                  thumbnailPrompt,
                  {
                    size: '1024x1024',
                    quality: 'standard',
                    uploadToS3: true,
                    folder: 'ai-thumbnails/lessons',
                  }
                );

                if (imageResult?.success) {
                  const imageUrl =
                    imageResult.data?.url ||
                    imageResult.url ||
                    imageResult.data?.imageUrl ||
                    imageResult.imageUrl;
                  if (imageUrl) {
                    lessonThumbnail = imageUrl;
                    console.log(
                      `✅ Generated lesson thumbnail: ${lessonThumbnail}`
                    );
                  }
                }
              } catch (thumbError) {
                console.warn(
                  `⚠️ Failed to generate lesson thumbnail:`,
                  thumbError
                );
                // Continue without thumbnail
              }
            }

            const lessonPayload = {
              title: lessonTitle,
              description: lessonDescription,
              order: j + 1,
              status: 'PUBLISHED',
              duration: lessonData.duration || '15 min',
              content: lessonData.content || '',
            };

            if (
              generateThumbnails === 'yes' &&
              lessonThumbnail &&
              lessonThumbnail.trim() !== ''
            ) {
              lessonPayload.thumbnail = lessonThumbnail;
            }

            const lessonResult = await createLesson(
              newCourseId,
              moduleId,
              lessonPayload
            );
            const createdLessonId =
              lessonResult?.data?.id || lessonResult?.id || null;

            createdLessons.push({
              id: createdLessonId,
              data: lessonResult,
              moduleId,
              moduleTitle,
              moduleIndex: module.moduleIndex ?? 0,
              lessonIndex: j,
              title: lessonTitle,
              description: lessonDescription,
              blueprintLesson: lessonData,
            });

            console.log(`✅ Lesson created: ${lessonTitle}`);
          } catch (lessonError) {
            console.error(
              `❌ Failed to create lesson ${lessonTitle}:`,
              lessonError
            );
            lessonErrors.push({
              moduleId,
              lessonTitle,
              error: lessonError.message,
            });
          }
        }
      }

      if (lessonErrors.length > 0) {
        console.warn('⚠️ Lesson creation errors:', lessonErrors);
      }

      if (createdModules.length > 0) {
        setCreatedModuleId(createdModules[0].id);
      }

      if (!createdLessons.length) {
        throw new Error('No lessons were created for this course');
      }

      const finalCreatedLesson = createdLessons[0];
      const newLessonId =
        finalCreatedLesson?.data?.id || finalCreatedLesson?.id || null;

      if (newLessonId) {
        setCreatedLessonId(newLessonId);
        addStreamingMessage(
          `✅ Created ${createdLessons.length} lessons`,
          'success'
        );
      }
      setStreamingProgress(60);

      // Step 4: Generate Lesson Content for ALL lessons (60-95% progress)
      addStreamingMessage(
        '✨ Generating lesson content blocks for all lessons...',
        'ai'
      );
      setStreamingProgress(65);

      // Import universal AI lesson service
      const universalAILessonService = (
        await import('@/services/universalAILessonService')
      ).default;

      const totalLessons = createdLessons.length;
      const contentStartProgress = 65;
      const contentEndProgress = 95;
      const perLessonProgress =
        totalLessons > 0
          ? (contentEndProgress - contentStartProgress) / totalLessons
          : 0;
      let currentProgress = contentStartProgress;

      // Helper function to safely convert blueprint fields to strings
      const safeBlueprintString = value => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return value
              .map(item =>
                typeof item === 'string' ? item : JSON.stringify(item)
              )
              .join(', ');
          }
          if (value.text) return String(value.text);
          if (value.content) return String(value.content);
          if (value.description) return String(value.description);
          if (value.value) return String(value.value);
          return JSON.stringify(value).replace(/^"|"$/g, '');
        }
        return String(value);
      };

      // Course-level context for AI
      const aiCourseContext = {
        title: courseTitle,
        description: courseDesc,
        difficulty: courseData.difficulty || 'beginner',
        duration: courseData.duration?.trim() || '4 weeks',
        targetAudience: courseData.targetAudience,
        learningOutcomes: courseData.learningOutcomes,
        blueprint: {
          coursePurpose: safeBlueprintString(courseData.blueprintCoursePurpose),
          learnerProfile: safeBlueprintString(
            courseData.blueprintLearnerProfile
          ),
          learningConstraints: safeBlueprintString(
            courseData.blueprintLearningConstraints
          ),
          complianceRequirements: safeBlueprintString(
            courseData.blueprintComplianceRequirements
          ),
          priorKnowledge: safeBlueprintString(
            courseData.blueprintPriorKnowledge
          ),
          courseStructure: safeBlueprintString(
            courseData.blueprintCourseStructure
          ),
          successMeasurement: safeBlueprintString(
            courseData.blueprintSuccessMeasurement
          ),
          requiredResources: safeBlueprintString(
            courseData.blueprintRequiredResources
          ),
        },
      };

      // Configure generation options based on mode
      let generationOptions = {};
      if (generationMode === 'QUICK') {
        generationOptions = {
          simple: true,
          useContentLibrary: false,
          mode: 'quick',
        };
      } else if (generationMode === 'STANDARD') {
        generationOptions = {
          useBlueprintStructure: true, // Use 15-section blueprint structure
          mode: 'standard',
          includeAssessments: true,
          includeSummary: true,
          includeImages: false,
        };
      } else if (generationMode === 'COMPLETE') {
        generationOptions = {
          useBlueprintStructure: true, // Use 15-section blueprint structure
          mode: 'complete',
        };
      } else if (generationMode === 'PREMIUM') {
        generationOptions = {
          useBlueprintStructure: true, // Use 15-section blueprint structure
          mode: 'premium',
          includeImages: true,
        };
      } else {
        generationOptions = {
          useBlueprintStructure: true, // Default to blueprint structure
          useContentLibrary: false, // Don't use content library by default
        };
      }

      let firstLessonBlocks = null;
      let firstLessonTitle = null;

      for (let index = 0; index < createdLessons.length; index++) {
        const createdLesson = createdLessons[index];
        const lessonId = createdLesson.id;
        const lessonTitle = createdLesson.title || `Lesson ${index + 1}`;
        const moduleTitleForLesson =
          createdLesson.moduleTitle ||
          `Module ${
            typeof createdLesson.moduleIndex === 'number'
              ? createdLesson.moduleIndex + 1
              : 1
          }`;

        if (!lessonId) {
          console.warn(
            '⚠️ Skipping content generation for lesson with missing ID:',
            createdLesson
          );
          continue;
        }

        addStreamingMessage(
          `✨ Generating content for lesson ${index + 1}/${totalLessons}: "${lessonTitle}"`,
          'ai'
        );

        // Build minimal lesson/module data for generator
        const lessonInfo = { id: lessonId, title: lessonTitle };
        const moduleInfo = {
          id: createdLesson.moduleId,
          title: moduleTitleForLesson,
        };

        try {
          const blocks = await universalAILessonService.generateLessonContent(
            lessonInfo,
            moduleInfo,
            aiCourseContext,
            generationOptions
          );

          // Convert blocks into lesson content payload (content + metadata)
          const lessonContent =
            universalAILessonService.convertBlocksToLessonContent(blocks);

          await updateLessonContent(lessonId, lessonContent);

          if (!firstLessonBlocks) {
            firstLessonBlocks = lessonContent.content || blocks;
            firstLessonTitle = lessonTitle;
          }

          currentProgress += perLessonProgress;
          setStreamingProgress(
            Math.min(contentEndProgress, Math.round(currentProgress))
          );
        } catch (contentError) {
          console.error(
            `❌ Failed to generate content for lesson "${lessonTitle}":`,
            contentError
          );
          addStreamingMessage(
            `⚠️ Skipped content for lesson "${lessonTitle}" due to an error.`,
            'error'
          );
        }
      }

      // Step 5: Finalize (95-100%)
      addStreamingMessage('💾 Lesson content saved for all lessons', 'success');
      setStreamingProgress(100);
      setCurrentBlock(null);

      const moduleCount = createdModules.length;
      const summaryLessonCount = createdLessons.length;

      // Success message
      addStreamingMessage(
        `🎉 Course "${courseTitle}" created successfully!\n\n` +
          `📊 Summary:\n` +
          `• ${moduleCount} module${moduleCount !== 1 ? 's' : ''} created\n` +
          `• ${summaryLessonCount} lesson${
            summaryLessonCount !== 1 ? 's' : ''
          } with AI-generated content\n` +
          `• Ready to view in lesson editor`,
        'success'
      );

      // Notify parent component
      if (onCourseCreated) {
        onCourseCreated(courseResult);
      }

      const primaryModuleId = createdModules[0]?.id || null;

      console.log('✅ Course creation complete:', {
        courseId: newCourseId,
        moduleId: primaryModuleId,
        lessonId: newLessonId,
      });

      // Auto-navigate to lesson editor after 2 seconds
      setTimeout(() => {
        const lessonEditorUrl = `/dashboard/courses/${newCourseId}/module/${primaryModuleId}/lesson/${newLessonId}/builder`;
        console.log('🔀 Navigating to lesson editor:', lessonEditorUrl);

        // Use React Router navigate with lesson data state
        navigate(lessonEditorUrl, {
          state: {
            lessonData: {
              id: newLessonId,
              title: firstLessonTitle || courseTitle,
              contentBlocks: firstLessonBlocks || [],
            },
          },
        });
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to create AI course:', error);
      addStreamingMessage(
        `❌ Error: ${error.message}\n\nPlease try again or contact support.`,
        'error'
      );
      setStreamingProgress(0);
      setCurrentBlock(null);

      // Reset back to form after 3 seconds
      setTimeout(() => {
        setIsStreamingGeneration(false);
        setStreamingMessages([]);
        setStreamingProgress(0);
      }, 3000);
    } finally {
      setIsCreatingCourse(false);
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
            module_status: 'PUBLISHED',
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
      const hasThumbnail =
        !!courseData.thumbnail && courseData.thumbnail.trim() !== '';
      const hasBlueprint = !!courseBlueprint;
      const hasSavedWork = hasThumbnail || hasBlueprint || hasEnhancedBlueprint;

      setIsMinimized(false);
      setActiveThumbnailTab('upload');
      setAiImageError('');

      // If no meaningful work was done, reset the session so the next open is fresh
      if (!hasSavedWork) {
        setCourseData({
          courseName: '',
          learningOutcomes: '',
          targetAudience: '',
          priorKnowledge: 'no',
          priorKnowledgeDetails: '',
          description: '',
          duration: '',
          difficulty: 'beginner',
          thumbnail: null,
          // Keep legacy fields for backwards compatibility
          title: '',
          subject: '',
          objectives: '',
          // Blueprint-specific inputs (1.1–1.8)
          blueprintCoursePurpose: '',
          blueprintLearnerProfile: '',
          blueprintLearningConstraints: '',
          blueprintComplianceRequirements: '',
          blueprintPriorKnowledge: '',
          blueprintCourseStructure: '',
          blueprintSuccessMeasurement: '',
          blueprintRequiredResources: '',
        });
        setAiOutline(null);
        setGeneratedContent({});
        setCourseBlueprint(null);
        setBlueprintError('');
        setFormStep(1);
        setGenerationMode('STANDARD');
        setCreatedCourseId(null);
        setCreatedModuleId(null);
        setCreatedLessonId(null);
        setStreamingMessages([]);
        setStreamingProgress(0);
        setIsStreamingGeneration(false);
        setIsCreatingCourse(false);
        setAiImagePrompt('');
        setHasEnhancedBlueprint(false);
      }
    }
  }, [isOpen, courseData.thumbnail, courseBlueprint, hasEnhancedBlueprint]);

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
              title={
                isMinimized
                  ? 'Expand AI Course Creator'
                  : 'Collapse AI Course Creator'
              }
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
                    title="Close AI Course Creator"
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

                    {courseBlueprint && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                          Master Course Blueprint
                          <span className="bg-indigo-600/10 text-indigo-700 text-xs px-2 py-1 rounded-full">
                            ARCHITECT
                          </span>
                        </h3>
                        <div className="bg-white rounded-lg shadow-sm border border-indigo-200 overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {courseBlueprint.meta?.courseTitle ||
                                  courseData.title ||
                                  'Course Blueprint'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {courseBlueprint.meta?.subjectDomain ||
                                  courseData.subject ||
                                  'Subject Domain'}
                              </p>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-3">
                              {courseBlueprint.purpose?.overview ||
                                'The course blueprint overview will appear here once generated.'}
                            </p>

                            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                              <div>
                                <div className="text-lg font-bold text-indigo-600">
                                  {courseBlueprint.structure?.modules?.length ||
                                    0}
                                </div>
                                <div className="text-gray-600">Modules</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-purple-600">
                                  {courseBlueprint.structure?.modules?.reduce(
                                    (total, module) =>
                                      total + (module.lessons?.length || 0),
                                    0
                                  ) || 0}
                                </div>
                                <div className="text-gray-600">Lessons</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-pink-600">
                                  {courseBlueprint.assessmentStrategy
                                    ?.questionTypes?.length || 0}
                                </div>
                                <div className="text-gray-600">
                                  Question Types
                                </div>
                              </div>
                            </div>

                            <div className="border-top border-gray-100 pt-2 mt-1 text-xs text-gray-500">
                              <div>
                                Persona:{' '}
                                {courseBlueprint.learnerPersona
                                  ?.primaryAudience ||
                                  courseData.targetAudience ||
                                  'Not specified'}
                              </div>
                              <div>
                                Tone:{' '}
                                {courseBlueprint.branding?.tone ||
                                  'Professional, friendly'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                    <div className="flex-1 overflow-y-auto p-6">
                      {activeTab === 'outline' && (
                        <div className="space-y-6">
                          {/* Inline Streaming Generation UI */}
                          {isStreamingGeneration && (
                            <div className="space-y-4">
                              {/* Progress Bar */}
                              <div className="bg-white rounded-lg border border-indigo-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Generating Course...
                                  </span>
                                  <span className="text-sm font-bold text-indigo-600">
                                    {streamingProgress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${streamingProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>

                              {/* Current Block Display */}
                              {currentBlock && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 shadow-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {currentBlock.section}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                                          {currentBlock.blockType}
                                        </span>
                                        {currentBlock.gradient && (
                                          <span className="text-xs text-pink-600 font-medium">
                                            • {currentBlock.gradient}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-800 font-medium truncate">
                                        {currentBlock.content}
                                      </p>
                                      <div className="mt-2 text-xs text-gray-500">
                                        Section {currentBlock.section} of{' '}
                                        {currentBlock.totalSections}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Streaming Messages */}
                              <div className="space-y-3">
                                <AnimatePresence>
                                  {streamingMessages.map((message, index) => (
                                    <motion.div
                                      key={message.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className={`p-4 rounded-lg border ${
                                        message.type === 'success'
                                          ? 'bg-green-50 border-green-200'
                                          : message.type === 'error'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-indigo-50 border-indigo-200'
                                      }`}
                                    >
                                      <p className="text-sm text-gray-800 whitespace-pre-line">
                                        {message.text}
                                      </p>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                              </div>

                              {/* Open in Lesson Editor Button */}
                              {streamingProgress === 100 &&
                                createdCourseId &&
                                createdModuleId &&
                                createdLessonId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4"
                                  >
                                    <Button
                                      onClick={() => {
                                        // Navigate to lesson editor
                                        window.location.href = `/courses/${createdCourseId}/modules/${createdModuleId}/lessons/${createdLessonId}/builder`;
                                      }}
                                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                      <Book className="w-5 h-5" />
                                      <span>Open in Lesson Editor</span>
                                    </Button>
                                  </motion.div>
                                )}
                            </div>
                          )}

                          {/* Form - Hidden during generation */}
                          {!isStreamingGeneration && (
                            <div className="space-y-6">
                              {formStep === 1 && (
                                <>
                                  {/* 1. Course Name */}
                                  <div className="group">
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                                        1
                                      </span>
                                      Course Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={courseData.courseName}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setCourseData(prev => ({
                                          ...prev,
                                          courseName: value,
                                          title: value, // Sync legacy field
                                        }));
                                      }}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:border-gray-300"
                                      placeholder="e.g., Introduction to React Development"
                                    />
                                  </div>

                                  {/* 2. Learning Outcomes */}
                                  <div className="group">
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                                        2
                                      </span>
                                      What will learners be able to do after the
                                      course? *
                                    </label>
                                    <textarea
                                      value={courseData.learningOutcomes}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setCourseData(prev => ({
                                          ...prev,
                                          learningOutcomes: value,
                                          objectives: value, // Sync legacy field
                                        }));
                                      }}
                                      rows="3"
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-300"
                                      placeholder="e.g., Build responsive web applications, understand React hooks, create reusable components..."
                                    />
                                  </div>

                                  {/* 3. Target Audience */}
                                  <div className="group">
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">
                                        3
                                      </span>
                                      Who is this course for? (one job/role) *
                                    </label>
                                    <input
                                      type="text"
                                      value={courseData.targetAudience}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setCourseData(prev => ({
                                          ...prev,
                                          targetAudience: value,
                                          subject: value, // Sync legacy field
                                        }));
                                      }}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all group-hover:border-gray-300"
                                      placeholder="e.g., Junior Frontend Developer, Marketing Manager, Data Analyst..."
                                    />
                                  </div>

                                  {/* 4. Prior Knowledge */}
                                  <div className="group">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                                        4
                                      </span>
                                      Do learners need any prior knowledge? *
                                    </label>

                                    <div className="flex gap-4 mb-3">
                                      <label
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                                          courseData.priorKnowledge === 'no'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name="priorKnowledge"
                                          value="no"
                                          checked={
                                            courseData.priorKnowledge === 'no'
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              priorKnowledge: e.target.value,
                                              priorKnowledgeDetails: '',
                                            }))
                                          }
                                          className="w-4 h-4 text-emerald-600"
                                        />
                                        <span className="font-medium">No</span>
                                      </label>

                                      <label
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                                          courseData.priorKnowledge === 'yes'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name="priorKnowledge"
                                          value="yes"
                                          checked={
                                            courseData.priorKnowledge === 'yes'
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              priorKnowledge: e.target.value,
                                            }))
                                          }
                                          className="w-4 h-4 text-emerald-600"
                                        />
                                        <span className="font-medium">Yes</span>
                                      </label>
                                    </div>

                                    {courseData.priorKnowledge === 'yes' && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3"
                                      >
                                        <input
                                          type="text"
                                          value={
                                            courseData.priorKnowledgeDetails
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              priorKnowledgeDetails:
                                                e.target.value,
                                            }))
                                          }
                                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50"
                                          placeholder="Write the required prior knowledge..."
                                        />
                                      </motion.div>
                                    )}
                                  </div>

                                  {/* 5. Generate Thumbnails */}
                                  <div className="group">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                                        5
                                      </span>
                                      Generate AI Thumbnails for Module &
                                      Lesson? *
                                    </label>

                                    <div className="flex gap-4">
                                      <label
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                                          generateThumbnails === 'yes'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name="generateThumbnails"
                                          value="yes"
                                          checked={generateThumbnails === 'yes'}
                                          onChange={e =>
                                            setGenerateThumbnails(
                                              e.target.value
                                            )
                                          }
                                          className="w-4 h-4 text-orange-600"
                                        />
                                        <span className="font-medium">Yes</span>
                                      </label>

                                      <label
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                                          generateThumbnails === 'no'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name="generateThumbnails"
                                          value="no"
                                          checked={generateThumbnails === 'no'}
                                          onChange={e =>
                                            setGenerateThumbnails(
                                              e.target.value
                                            )
                                          }
                                          className="w-4 h-4 text-orange-600"
                                        />
                                        <span className="font-medium">No</span>
                                      </label>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                      AI-generated thumbnails will be created
                                      using DALL-E 3 for visual appeal
                                    </p>
                                  </div>

                                  {/* 6. Course Description (Optional) */}
                                  <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-gray-500" />
                                      Additional Description (Optional)
                                    </label>
                                    <textarea
                                      value={courseData.description}
                                      onChange={e =>
                                        setCourseData(prev => ({
                                          ...prev,
                                          description: e.target.value,
                                        }))
                                      }
                                      rows="2"
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:border-gray-300"
                                      placeholder="Any additional context or specific topics to cover..."
                                    />
                                  </div>

                                  {/* Difficulty Level */}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-2">
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
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                      >
                                        <option value="beginner">
                                          🌱 Beginner
                                        </option>
                                        <option value="intermediate">
                                          ⚡ Intermediate
                                        </option>
                                        <option value="advanced">
                                          🚀 Advanced
                                        </option>
                                      </select>
                                    </div>

                                    <div className="col-span-2">
                                      <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Duration (Optional)
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
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="e.g., 2 weeks"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end pt-2">
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        if (!courseData.courseName.trim()) {
                                          toast.error(
                                            'Please enter a course name'
                                          );
                                          return;
                                        }
                                        if (
                                          !courseData.learningOutcomes.trim()
                                        ) {
                                          toast.error(
                                            'Please describe what learners will be able to do'
                                          );
                                          return;
                                        }
                                        if (!courseData.targetAudience.trim()) {
                                          toast.error(
                                            'Please specify who this course is for'
                                          );
                                          return;
                                        }
                                        setFormStep(2);
                                      }}
                                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                      Next: Course Architect Blueprint
                                    </Button>
                                  </div>
                                </>
                              )}

                              {formStep === 2 && (
                                <>
                                  {/* Course Architect Blueprint (optional) */}
                                  <div className="space-y-2 mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Course Architect Blueprint
                                    </label>
                                    <p className="text-xs text-gray-500">
                                      Let AI design a master course blueprint
                                      (purpose, persona, modules, lessons,
                                      assessments) before building content.
                                    </p>

                                    <div className="mt-2 mb-2">
                                      <span className="text-xs text-gray-500">
                                        Architect inputs 1.1–1.8 (purpose,
                                        persona, constraints, etc.) - Will be
                                        automatically enhanced when generating
                                        blueprint
                                      </span>
                                    </div>

                                    {/* Architect inputs 1.1–1.8 */}
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.1 Course Purpose
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintCoursePurpose
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintCoursePurpose:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="What change must occur in learners' knowledge, skills, or attitude? What business outcome should this course support?"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.2 Target Learner Profile
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintLearnerProfile
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintLearnerProfile:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="Role, background, motivation, challenges, work environment, language level, learning preferences, tech comfort level..."
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.3 Learning Constraints
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintLearningConstraints
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintLearningConstraints:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="Time available, devices used, tools, internet limitations, LMS or platform restrictions..."
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.4 Compliance Requirements
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintComplianceRequirements
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintComplianceRequirements:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="SCORM? Internal L&D model? Industry standards or regulations to follow?"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.5 Prior Knowledge / Prerequisites
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintPriorKnowledge
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintPriorKnowledge:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="Required skills vs optional skills, recommended background before taking this course..."
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.6 Course Length & Structure
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintCourseStructure
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintCourseStructure:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="Total duration, target number of modules/lessons, and flow style (linear vs modular/choose-your-own-path)."
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.7 Success Measurement
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintSuccessMeasurement
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintSuccessMeasurement:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="How will you measure success? Completion, assessment scores, job performance, project submission, etc."
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                          1.8 Required Resources
                                        </label>
                                        <textarea
                                          value={
                                            courseData.blueprintRequiredResources
                                          }
                                          onChange={e =>
                                            setCourseData(prev => ({
                                              ...prev,
                                              blueprintRequiredResources:
                                                e.target.value,
                                            }))
                                          }
                                          rows="2"
                                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                          placeholder="List any SOPs, PPTs, documents, videos, or brand kits that the blueprint should assume are available."
                                        />
                                      </div>
                                    </div>

                                    <Button
                                      type="button"
                                      onClick={handleGenerateBlueprint}
                                      disabled={isGeneratingBlueprint}
                                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                    >
                                      {isGeneratingBlueprint ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Generating blueprint...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-4 h-4" />
                                          Generate Master Blueprint
                                        </>
                                      )}
                                    </Button>
                                    {blueprintError && (
                                      <p className="text-xs text-red-600">
                                        {blueprintError}
                                      </p>
                                    )}
                                    {courseBlueprint &&
                                      !blueprintError &&
                                      !isGeneratingBlueprint && (
                                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                                          <Check className="w-3 h-3" />
                                          Blueprint ready  see preview on the
                                          left
                                        </p>
                                      )}
                                  </div>

                                  {/* Generation Mode Selector */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Content Generation Mode
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setGenerationMode('QUICK')
                                        }
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
                                        onClick={() =>
                                          setGenerationMode('STANDARD')
                                        }
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
                                        onClick={() =>
                                          setGenerationMode('COMPLETE')
                                        }
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
                                        onClick={() =>
                                          setGenerationMode('PREMIUM')
                                        }
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
                                        (Adding content will improve our
                                        results.)
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
                                          onClick={() =>
                                            setActiveContentTab('file')
                                          }
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
                                          onClick={() =>
                                            setActiveContentTab('url')
                                          }
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
                                                  Drag & drop any source
                                                  materials or{' '}
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
                                                Supported file types: .doc,
                                                .docx, .m4a, .mp3, .mp4, .ogg,
                                                .pdf, .ppt, .pptx, .sbv, .srt,
                                                .story, .sub, .text, .txt, .vtt,
                                                .wav, or .webm
                                              </p>
                                              <p>
                                                Maximum size: 1 GB, 200K
                                                characters or less per file.
                                              </p>
                                            </div>

                                            {/* Uploaded Files */}
                                            {uploadedFiles.length > 0 && (
                                              <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700">
                                                  Uploaded Files:
                                                </p>
                                                {uploadedFiles.map(
                                                  (file, index) => (
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
                                                  )
                                                )}
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
                                              You can paste URLs, text content,
                                              or any reference material here
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
                                        onClick={() =>
                                          setActiveThumbnailTab('ai')
                                        }
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
                                        onClick={() =>
                                          fileInputRef.current?.click()
                                        }
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
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                              AI Image Prompt
                                            </label>
                                          </div>
                                          <textarea
                                            value={aiImagePrompt}
                                            onChange={e =>
                                              setAiImagePrompt(e.target.value)
                                            }
                                            placeholder={`Describe the image you want to generate for "${courseData.title || 'your course'}"`}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            rows={3}
                                          />
                                          {!aiImagePrompt &&
                                            courseData.title && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Using course title as prompt:
                                                "Professional course thumbnail
                                                for "{courseData.title}" -
                                                educational, modern, clean
                                                design"
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
                                            Tip: Include details like subject
                                            matter, style, and mood for better
                                            results.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Generate Course Button - Opens Streaming Modal */}
                                  {!aiOutline && (
                                    <Button
                                      onClick={() => {
                                        // Validate required fields
                                        if (!courseData.courseName.trim()) {
                                          toast.error(
                                            'Please enter a course name'
                                          );
                                          return;
                                        }
                                        if (
                                          !courseData.learningOutcomes.trim()
                                        ) {
                                          toast.error(
                                            'Please describe what learners will be able to do'
                                          );
                                          return;
                                        }
                                        if (!courseData.targetAudience.trim()) {
                                          toast.error(
                                            'Please specify who this course is for'
                                          );
                                          return;
                                        }
                                        // Start inline generation
                                        startInlineGeneration();
                                      }}
                                      disabled={isGenerating}
                                      className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-500 hover:via-sky-600 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-base sm:text-lg flex items-center justify-center gap-2"
                                    >
                                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                                      <span className="whitespace-normal text-center leading-tight">
                                        🎯 Generate Comprehensive Course
                                      </span>
                                    </Button>
                                  )}

                                  {/* Show Course Editor button when outline exists */}
                                  {aiOutline && (
                                    <>
                                      <Button
                                        onClick={() =>
                                          setShowLessonCreator(true)
                                        }
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
                                </>
                              )}
                            </div>
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

          {/* AI Streaming Generation Modal */}
          <AIStreamingGeneration
            isOpen={showStreamingModal}
            onClose={() => setShowStreamingModal(false)}
            courseData={courseData}
            onComplete={generatedData => {
              console.log('Course generation complete:', generatedData);
              setShowStreamingModal(false);
              // Trigger the actual course generation
              generateCourseOutline();
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default AICourseCreationPanel;
