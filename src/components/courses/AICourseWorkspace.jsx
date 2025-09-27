import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Image, 
  FileText, 
  Search,
  Upload,
  Sparkles,
  Download,
  Copy,
  Plus,
  Edit3,
  Save,
  RefreshCw,
  Wand2,
  Check,
  Eye,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  Target
} from 'lucide-react';
import Bytez from 'bytez.js';
import { langChainBytezService, HumanMessage, SystemMessage } from '../../services/langchainBytez';
// Frontend-only mode: no backend proxy for outline
import AIImageGenerator from './AIImageGenerator';
import AISummarizationTool from './AISummarizationTool';
import AIQuestionAnswering from './AIQuestionAnswering';
import { AIFeatureAccessProvider } from './AIFeatureAccess';
import LoadingBuffer from '../LoadingBuffer';
import { convertToModernLessonFormat } from '@/utils/lessonDataConverter.ts';
import { generateCourseImage } from '@/services/aiCourseService';
import { createModule, createLesson, createAICourse, createAIModulesAndLessons } from '@/services/courseService';

const AICourseWorkspace = ({ isOpen, onClose, courseData, onSave }) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [outlines, setOutlines] = useState([]);
  const [images, setImages] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [qaResults, setQaResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [showOutlineDetails, setShowOutlineDetails] = useState(false);
  const [isApiRequestActive, setIsApiRequestActive] = useState(false);
  const [taskLocks, setTaskLocks] = useState({ structure: false, text: false, image: false, default: false });
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingQA, setIsGeneratingQA] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: courseData?.title || '',
    subject: '',
    description: courseData?.description || '',
    difficulty: courseData?.difficulty || 'intermediate',
    duration: courseData?.duration || '4',
    targetAudience: '',
    learningObjectives: '',
    uploadedFiles: []
  });
  const fileInputRef = useRef(null);

  // Helper function to convert contentBlocks to HTML
  const convertContentBlocksToHTML = (contentBlocks) => {
    if (!contentBlocks || contentBlocks.length === 0) return '';
    
    return contentBlocks
      .sort((a, b) => a.order - b.order)
      .map(block => block.html_css)
      .join('\n\n');
  };

  const handleSaveCourse = async (status = 'PUBLISHED') => {
    if (!formData.title || !formData.description) {
      alert('Please fill in the course title and description');
      return;
    }

    setIsGenerating(true);
    console.log('AICourseWorkspace - handleSaveCourse called with status:', status, 'courseData:', courseData);
    
    try {
      // Collect all modules and lessons from generated outlines
      const allModules = [];
      const allLessons = [];
      
      outlines.forEach(outline => {
        if (outline.modules) {
          outline.modules.forEach(module => {
            allModules.push({
              id: module.id,
              title: module.title.length > 150 ? module.title.substring(0, 147) + '...' : module.title,
              description: module.description || `Learn about ${module.title}`,
              order: module.id,
              estimated_duration: 60,
              module_status: 'PUBLISHED',
              isAIGenerated: module.isAIGenerated || true,
              createdAt: new Date().toISOString()
            });
            
            if (module.lessons) {
              module.lessons.forEach((lesson, lessonIndex) => {
                // Generate comprehensive lesson content blocks for backend
                const contentBlocks = [];
                
                // Add heading block
                if (lesson.heading || lesson.title) {
                  contentBlocks.push({
                    block_id: `heading_${lesson.id}_1`,
                    type: 'heading',
                    order: contentBlocks.length + 1,
                    html_css: `<h1>${lesson.heading || lesson.title}</h1>`,
                    details: { level: 1, text: lesson.heading || lesson.title }
                  });
                }
                
                // Add introduction block
                if (lesson.content?.introduction || lesson.introduction || lesson.intro) {
                  const introText = lesson.content?.introduction || lesson.introduction || lesson.intro;
                  contentBlocks.push({
                    block_id: `intro_${lesson.id}_${contentBlocks.length + 1}`,
                    type: 'text',
                    order: contentBlocks.length + 1,
                    html_css: `<div class="intro"><h4>Introduction</h4><p>${introText}</p></div>`,
                    details: { content: introText, section: 'introduction' }
                  });
                }
                
                // Add text explanations blocks
                if (lesson.content?.textExplanations && Array.isArray(lesson.content.textExplanations)) {
                  lesson.content.textExplanations.forEach((explanation, index) => {
                    contentBlocks.push({
                      block_id: `explanation_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'text',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="explanation"><h5>${explanation.concept}</h5><p>${explanation.explanation}</p></div>`,
                      details: { concept: explanation.concept, explanation: explanation.explanation, section: 'textExplanations' }
                    });
                  });
                }
                
                // Add examples blocks
                if (lesson.content?.examples && Array.isArray(lesson.content.examples)) {
                  lesson.content.examples.forEach((example, index) => {
                    contentBlocks.push({
                      block_id: `example_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'text',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="example"><h5>${example.title}</h5><p>${example.description}</p></div>`,
                      details: { title: example.title, description: example.description, section: 'examples' }
                    });
                  });
                }
                
                // Add multimedia blocks (images and videos)
                if (lesson.content?.multimedia) {
                  const multimedia = lesson.content.multimedia;
                  
                  // Add image block
                  if (multimedia.image) {
                    const imageData = typeof multimedia.image === 'string' ? 
                      { url: multimedia.image, alt: `${lesson.title} illustration`, caption: `Visual representation of ${lesson.title}` } :
                      multimedia.image;
                    
                    contentBlocks.push({
                      block_id: `image_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'image',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="image"><img src="${imageData.url}" alt="${imageData.alt}" /></div>`,
                      details: { 
                        type: 'image', 
                        url: imageData.url, 
                        alt: imageData.alt, 
                        caption: imageData.caption, 
                        section: 'multimedia' 
                      }
                    });
                  }
                  
                  // Add video block
                  if (multimedia.video && multimedia.hasVideo) {
                    contentBlocks.push({
                      block_id: `video_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'video',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="video"><video src="${multimedia.video.url}" controls></video></div>`,
                      details: { 
                        type: 'video', 
                        url: multimedia.video.url, 
                        duration: multimedia.video.duration, 
                        prompt: multimedia.video.prompt,
                        section: 'multimedia' 
                      }
                    });
                  }
                }
                
                // Add activities blocks
                if (lesson.content?.activities && Array.isArray(lesson.content.activities)) {
                  lesson.content.activities.forEach((activity, index) => {
                    contentBlocks.push({
                      block_id: `activity_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'text',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="activity"><h5>${activity.title}</h5><p>${activity.description}</p></div>`,
                      details: { type: activity.type, title: activity.title, description: activity.description, section: 'activities' }
                    });
                  });
                }
                
                // Add key takeaways block
                if (lesson.content?.keyTakeaways && Array.isArray(lesson.content.keyTakeaways)) {
                  const takeawaysHtml = lesson.content.keyTakeaways.map((takeaway, index) => 
                    `<li>${index + 1}. ${takeaway}</li>`
                  ).join('');
                  
                  contentBlocks.push({
                    block_id: `takeaways_${lesson.id}_${contentBlocks.length + 1}`,
                    type: 'text',
                    order: contentBlocks.length + 1,
                    html_css: `<div class="takeaways"><h4>Key Takeaways</h4><ul>${takeawaysHtml}</ul></div>`,
                    details: { takeaways: lesson.content.keyTakeaways, section: 'keyTakeaways' }
                  });
                }
                
                // Add summary block
                if (lesson.content?.summary || lesson.summary) {
                  const summaryText = lesson.content?.summary || lesson.summary;
                  contentBlocks.push({
                    block_id: `summary_${lesson.id}_${contentBlocks.length + 1}`,
                    type: 'text',
                    order: contentBlocks.length + 1,
                    html_css: `<div class="summary"><h4>Summary</h4><p>${summaryText}</p></div>`,
                    details: { content: summaryText, section: 'summary' }
                  });
                }
                
                // Fallback for old format
                if (lesson.content && Array.isArray(lesson.content)) {
                  lesson.content.forEach((point, index) => {
                    const pointText = typeof point === 'object' ? `${point.point}: ${point.description}` : point;
                    contentBlocks.push({
                      block_id: `point_${lesson.id}_${contentBlocks.length + 1}`,
                      type: 'text',
                      order: contentBlocks.length + 1,
                      html_css: `<div class="lesson-point bg-gray-50 border border-gray-200 p-4 rounded mb-3"><h5 class="font-medium text-gray-800 mb-2">${index + 1}. ${typeof point === 'object' ? point.point : 'Key Point'}</h5><p class="text-gray-600">${typeof point === 'object' ? point.description : point}</p></div>`,
                      details: { content: pointText, section: 'content' }
                    });
                  });
                }

                allLessons.push({
                  id: lesson.id,
                  title: lesson.title.length > 150 ? lesson.title.substring(0, 147) + '...' : lesson.title,
                  description: lesson.content?.introduction || lesson.introduction || lesson.intro || `This lesson covers ${lesson.title}`,
                  order: lessonIndex + 1,
                  status: 'PUBLISHED',
                  moduleId: module.id,
                  isAIGenerated: lesson.isAIGenerated || true,
                  createdAt: new Date().toISOString(),
                  contentBlocks: contentBlocks // Add the structured content blocks
                });
              });
            }
          });
        }
        
        // Also include lessons directly from outline
        if (outline.lessons) {
          outline.lessons.forEach((lesson, lessonIndex) => {
            // Generate structured lesson content for direct lessons with proper formatting
            let lessonContent = '';
            
            // Add heading
            if (lesson.heading || lesson.title) {
              lessonContent += `# ${lesson.heading || lesson.title}\n\n`;
            }
            
            // Add introduction
            if (lesson.introduction || lesson.intro) {
              lessonContent += `## Introduction

${lesson.introduction || lesson.intro}

`;
            }
            
            // Add content points
            if (lesson.content && Array.isArray(lesson.content)) {
              lessonContent += `## Key Learning Points\n\n`;
              lesson.content.forEach((point, index) => {
                if (typeof point === 'object' && point.title && point.description) {
                  lessonContent += `### ${index + 1}. ${point.title}

${point.description}

`;
                } else {
                  lessonContent += `### ${index + 1}. ${point}\n\n`;
                }
              });
            }
            
            // Add images if available
            if (lesson.images && lesson.images.length > 0) {
              lessonContent += `## Visual Learning\n\n`;
              lesson.images.forEach((image, index) => {
                lessonContent += `![${image.alt}](${image.url})\n*${image.caption}*\n\n`;
              });
            }
            
            // Add summary
            if (lesson.summary) {
              lessonContent += `## Summary

${lesson.summary}

`;
            }

            allLessons.push({
              id: lesson.id,
              title: lesson.title.length > 150 ? lesson.title.substring(0, 147) + '...' : lesson.title,
              description: lessonContent || lesson.intro || `This lesson covers ${lesson.title}`,
              order: lessonIndex + 1,
              status: 'PUBLISHED',
              isAIGenerated: lesson.isAIGenerated || true,
              createdAt: new Date().toISOString()
            });
          });
        }
      });

      // Create the final course data structure - frontend only, no API calls
      const finalCourseData = {
        id: Date.now(), // Generate a temporary ID
        title: formData.title,
        description: formData.description,
        learning_objectives: formData.learningObjectives ? formData.learningObjectives.split('\n').map(s => s.trim()).filter(Boolean) : [],
        course_status: status,
        estimated_duration: formData.duration || '4 weeks',
        max_students: 100,
        course_level: 'BEGINNER',
        courseType: 'OPEN',
        lockModules: 'UNLOCKED',
        price: '0',
        requireFinalQuiz: true,
        thumbnail: null,
        isHidden: false,
        modules: allModules,
        lessons: allLessons,
        isAIGenerated: true,
        generatedAt: new Date().toISOString(),
        aiOutlines: outlines,
        aiImages: images.map(img => ({
          ...img,
          insertedToCourse: true
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Final course data (frontend-only):', finalCourseData);
      
      // First create the course in the database
      const createdCourse = await createAICourse(finalCourseData);
      console.log('Course created in database:', createdCourse);
      
      // Then create modules and lessons in the database with rich content
      if (allModules.length > 0) {
        console.log('Creating modules and lessons in database...');
        // Pass the rich content data along with outlines
        const enrichedOutlines = outlines.map(outline => ({
          ...outline,
          modules: outline.modules?.map(module => ({
            ...module,
            lessons: module.lessons?.map(lesson => {
              // Find the corresponding lesson in allLessons to get contentBlocks
              const enrichedLesson = allLessons.find(l => l.id === lesson.id);
              return {
                ...lesson,
                contentBlocks: enrichedLesson?.contentBlocks || [],
                richContent: enrichedLesson?.contentBlocks ? 
                  convertContentBlocksToHTML(enrichedLesson.contentBlocks) : null
              };
            })
          }))
        }));
        
        const moduleResults = await createAIModulesAndLessons(createdCourse.data.id, enrichedOutlines);
        console.log('Modules and lessons created:', moduleResults);
      }
      
      // Pass the database-created course to parent component
      await onSave(createdCourse.data);
      
      // Show success message
      alert(`Course "${finalCourseData.title}" created successfully with ${allModules.length} modules and ${allLessons.length} lessons!`);
      
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Per-task-type rate limiting: allow up to 4 concurrent (one per type)
  const executeWithTaskLock = async (taskType, requestFunction) => {
    const type = taskType || 'default';
    if (taskLocks[type]) {
      alert(`Another ${type} request is in progress. Please wait...`);
      return;
    }
    setTaskLocks(prev => ({ ...prev, [type]: true }));
    try {
      await requestFunction();
    } catch (error) {
      console.error(`[${type}] API request error:`, error);
    } finally {
      setTaskLocks(prev => ({ ...prev, [type]: false }));
    }
  };

  // Enhanced API Key Management System for Multiple Content Types
  const getAvailableApiKey = (taskType = 'default') => {
    const keys = [
      import.meta.env.VITE_BYTEZ_API_KEY,
      import.meta.env.VITE_BYTEZ_API_KEY_2,
      import.meta.env.VITE_BYTEZ_API_KEY_3, 
      import.meta.env.VITE_BYTEZ_API_KEY_4
    ].filter(Boolean);

    // Enhanced task-specific key assignment for multimedia content
    const keyAssignment = {
      'structure': 0,    // Course structure → Key 1
      'text': 1,         // Lesson text → Key 2  
      'image': 2,        // Images → Key 3
      'video': 3,        // Videos → Key 4
      'qa': 0,           // Q&A → Key 1 (reuse)
      'default': 0
    };

    const preferredIndex = keyAssignment[taskType] || 0;
    
    // Return preferred key or first available
    return keys[preferredIndex] || keys[0] || localStorage.getItem('BYTEZ_API_KEY');
  };

  // Retry with different API key on failure
  const executeWithApiKeyRotation = async (taskType, apiCall) => {
    const keys = [
      import.meta.env.VITE_BYTEZ_API_KEY,
      import.meta.env.VITE_BYTEZ_API_KEY_2,
      import.meta.env.VITE_BYTEZ_API_KEY_3,
      import.meta.env.VITE_BYTEZ_API_KEY_4
    ].filter(Boolean);

    console.log(`🔍 Available API keys for ${taskType}:`, keys.length);
    
    if (keys.length === 0) {
      console.error('❌ No API keys found in environment variables');
      throw new Error('No API keys available');
    }

    for (let i = 0; i < keys.length; i++) {
      try {
        console.log(`🔑 Using API Key ${i + 1} for ${taskType}`);
        return await apiCall(keys[i]);
      } catch (error) {
        console.warn(`❌ API Key ${i + 1} failed for ${taskType}:`, error.message);
        if (i === keys.length - 1) throw error; // Last key failed
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay before next key
      }
    }
  };

  // Generate lesson text (heading, intro, main points with examples, Q&A, summary)
  const generateLessonText = async (lessonTitle, moduleTitle, subject) => {
    const system = new SystemMessage(
      'You are an expert course creator. Return ONLY valid JSON with fields: heading, introduction, mainContent (array of {point, description, example}), qa (array of {question, answer}), summary.'
    );
    const user = new HumanMessage(
      `Create a structured lesson for "${lessonTitle}" (module: ${moduleTitle}, subject: ${subject}).

Return this exact JSON shape without markdown fences:
{
  "heading": "${lessonTitle}",
  "introduction": "2–3 lines about the purpose",
  "mainContent": [
    {"point": "Key Point 1", "description": "2–3 sentences", "example": "short example"},
    {"point": "Key Point 2", "description": "2–3 sentences", "example": "short example"},
    {"point": "Key Point 3", "description": "2–3 sentences", "example": "short example"}
  ],
  "qa": [
    {"question": "Simple question 1", "answer": "Short answer"},
    {"question": "Simple question 2", "answer": "Short answer"},
    {"question": "Simple question 3", "answer": "Short answer"}
  ],
  "summary": "1–2 line recap"
}`
    );

    try {
      // small delay to respect free model rate limits
      await new Promise(r => setTimeout(r, 500));
      // use 'text' channel implicitly via per-lesson orchestration
      const resp = await langChainBytezService.call([system, user], { temperature: 0.5, max_tokens: 700 });
      const content = (resp?.content || '').replace(/^```json\n?|```$/g, '').trim();
      const parsed = JSON.parse(content);
      // minimal validation
      if (!parsed.heading) parsed.heading = lessonTitle;
      if (!Array.isArray(parsed.mainContent)) parsed.mainContent = [];
      if (!Array.isArray(parsed.qa)) parsed.qa = [];
      if (!parsed.introduction) parsed.introduction = `An introduction to ${lessonTitle}.`;
      if (!parsed.summary) parsed.summary = `Key takeaways from ${lessonTitle}.`;
      return parsed;
    } catch (e) {
      console.warn('Lesson text generation failed, using fallback:', e?.message);
      return {
        heading: lessonTitle,
        introduction: `This lesson introduces ${lessonTitle} within ${moduleTitle}.`,
        mainContent: [
          { point: 'Core Concept', description: `Understand ${lessonTitle} basics.`, example: 'Simple illustrative example.' },
          { point: 'Application', description: 'How to apply the concept.', example: 'Short use-case example.' },
          { point: 'Best Practices', description: 'Guidelines and pitfalls.', example: 'Do X, avoid Y.' }
        ],
        qa: [
          { question: `What is ${lessonTitle}?`, answer: `A concept in ${subject}.` },
          { question: 'How to start?', answer: 'Follow the main steps described.' },
          { question: 'One key tip?', answer: 'Focus on fundamentals first.' }
        ],
        summary: `You learned the essentials of ${lessonTitle}.`
      };
    }
  };

  // Generate lesson video using text-to-video model
  const generateLessonVideo = async (lessonHeading, subject, apiKey) => {
    try {
      console.log(`🎥 Generating video for: ${lessonHeading}`);
      
      const sdk = new Bytez(apiKey);
      const model = sdk.model("ali-vilab/text-to-video-ms-1.7b");
      
      const videoPrompt = `Educational video about ${lessonHeading} in ${subject}, clear and informative, 2-3 seconds`;
      
      const { error, output } = await model.run(videoPrompt);
      
      if (error) {
        console.warn('Video generation error:', error);
        return null;
      }
      
      if (output) {
        console.log('✅ Video generated successfully');
        return {
          url: output,
          prompt: videoPrompt,
          duration: '2-3 seconds',
          type: 'educational'
        };
      }
      
      return null;
    } catch (e) {
      console.warn('Video generation failed:', e?.message);
      return null;
    }
  };

  // Generate lesson image with enhanced prompts
  const generateLessonImage = async (lessonHeading, subject, apiKey) => {
    try {
      console.log(`🖼️ Generating image for: ${lessonHeading}`);
      
      const sdk = new Bytez(apiKey);
      const model = sdk.model("dreamlike-art/dreamlike-photoreal-2.0");
      
      const imagePrompt = `Educational illustration of ${lessonHeading} in ${subject}, clean, modern, informative style, high quality`;
      
      const { error, output } = await model.run(imagePrompt);
      
      if (error) {
        console.warn('Image generation error:', error);
        return '/placeholder-lesson-image.jpg';
      }
      
      if (output) {
        console.log('✅ Image generated successfully');
        return {
          url: output,
          prompt: imagePrompt,
          alt: `Illustration for ${lessonHeading}`,
          caption: `Visual representation of ${lessonHeading} concepts`
        };
      }
      
      return '/placeholder-lesson-image.jpg';
    } catch (e) {
      console.warn('Image generation failed, using placeholder:', e?.message);
      return '/placeholder-lesson-image.jpg';
    }
  };

  // Generate enhanced Q&A content
  const generateEnhancedQA = async (lessonTitle, mainContent, subject, apiKey) => {
    try {
      console.log(`❓ Generating Q&A for: ${lessonTitle}`);
      
      const sdk = new Bytez(apiKey);
      const model = sdk.model("google/flan-t5-base");
      
      const qaPrompt = `Generate 5 educational questions and answers for lesson "${lessonTitle}" in ${subject}. 
      Content context: ${mainContent.map(c => c.point).join(', ')}.
      
      Return JSON format:
      {
        "questions": [
          {"question": "What is...", "answer": "...", "difficulty": "easy|medium|hard"},
          {"question": "How does...", "answer": "...", "difficulty": "easy|medium|hard"}
        ]
      }`;
      
      const { error, output } = await model.run(qaPrompt);
      
      if (error) {
        console.warn('Q&A generation error:', error);
        return generateFallbackQA(lessonTitle, mainContent);
      }
      
      try {
        const parsed = JSON.parse(output.replace(/```json\n?|\n?```/g, '').trim());
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions;
        }
      } catch (parseError) {
        console.warn('Q&A parsing failed:', parseError);
      }
      
      return generateFallbackQA(lessonTitle, mainContent);
    } catch (e) {
      console.warn('Q&A generation failed:', e?.message);
      return generateFallbackQA(lessonTitle, mainContent);
    }
  };

  // Enhanced complete lesson generation with multimedia content
  const generateCompleteLesson = async (lessonTitle, moduleTitle, subject, courseId, moduleId) => {
    console.log(`🚀 Generating complete multimedia lesson: ${lessonTitle}`);
    
    try {
      // Generate text content first
      const textContent = await executeWithApiKeyRotation('text', async (apiKey) => {
        return await generateLessonText(lessonTitle, moduleTitle, subject);
      });

      // Generate multimedia content in parallel with different API keys
      const [image, video, enhancedQA] = await Promise.allSettled([
        executeWithApiKeyRotation('image', async (apiKey) => {
          return await generateLessonImage(textContent.heading || lessonTitle, subject, apiKey);
        }),
        executeWithApiKeyRotation('video', async (apiKey) => {
          return await generateLessonVideo(textContent.heading || lessonTitle, subject, apiKey);
        }),
        executeWithApiKeyRotation('qa', async (apiKey) => {
          return await generateEnhancedQA(lessonTitle, textContent.mainContent, subject, apiKey);
        })
      ]);

      // Process results
      const imageResult = image.status === 'fulfilled' ? image.value : '/placeholder-lesson-image.jpg';
      const videoResult = video.status === 'fulfilled' ? video.value : null;
      const qaResult = enhancedQA.status === 'fulfilled' ? enhancedQA.value : textContent.qa;

      return {
        id: `lesson_${Date.now()}`,
        title: textContent.heading || lessonTitle,
        moduleId,
        courseId,
        duration: '15-20 min',
        content: {
          heading: textContent.heading,
          introduction: textContent.introduction,
          mainContent: textContent.mainContent,
          multimedia: {
            image: imageResult,
            video: videoResult,
            hasVideo: !!videoResult
          },
          qa: qaResult,
          summary: textContent.summary
        },
        metadata: {
          aiGenerated: true,
          generatedAt: new Date().toISOString(),
          models: {
            text: 'flan-t5-base',
            image: 'dreamlike-photoreal-2.0',
            video: 'text-to-video-ms-1.7b',
            qa: 'flan-t5-base'
          },
          contentTypes: ['text', 'image', videoResult ? 'video' : null, 'qa'].filter(Boolean)
        }
      };
    } catch (error) {
      console.error('Complete lesson generation failed:', error);
      // Return fallback lesson
      return generateFallbackCompleteLesson(lessonTitle, moduleTitle, subject);
    }
  };

  // Generate lessons for the currently selected outline and persist to backend
  const generateLessonsForSelectedOutline = async () => {
    if (!selectedOutline) {
      alert('Please generate/select an outline first.');
      return;
    }
    if (!courseData?.id) {
      alert('Missing course id. Please save or open a course before generating lessons.');
      return;
    }

    const subject = formData.subject || formData.title || 'General';
    const outline = selectedOutline;

    const executeGeneration = async () => {
      setIsGenerating(true);
      try {
        const moduleIdMap = new Map();

        for (let mIndex = 0; mIndex < (outline.modules?.length || 0); mIndex++) {
          const mod = outline.modules[mIndex];

          // Create module in backend first
          let createdModule;
          try {
            createdModule = await createModule(courseData.id, {
              title: mod.title || `Module ${mIndex + 1}`,
              description: mod.description || `About ${mod.title}`,
              order: mIndex + 1,
              estimated_duration: 60,
              module_status: 'PUBLISHED',
              thumbnail: mod.thumbnail || ''
            });
          } catch (e) {
            console.error('Module creation failed:', e);
            // If module creation fails, skip to next module
            continue;
          }

          const backendModuleId = createdModule?.id || createdModule?._id;
          moduleIdMap.set(mod.id, backendModuleId);

          // Ensure lessons array
          const lessons = Array.isArray(mod.lessons) && mod.lessons.length > 0
            ? mod.lessons
            : [
                { id: `${mod.id}-1`, title: `Getting Started with ${mod.title}` },
                { id: `${mod.id}-2`, title: `Core Concepts of ${mod.title}` }
              ];

          for (let lIndex = 0; lIndex < lessons.length; lIndex++) {
            const les = lessons[lIndex];

            // Sequential: text then image
            const completeLesson = await generateCompleteLesson(
              les.title,
              mod.title,
              subject,
              courseData.id,
              backendModuleId
            );

            // Save lesson to backend only after fully generated
            const intro = completeLesson?.content?.introduction || '';
            const points = (completeLesson?.content?.mainContent || []).map((p, i) => `- ${p.point}: ${p.description}`).join('\n');
            const qa = (completeLesson?.content?.qa || []).map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join('\n');
            const summary = completeLesson?.content?.summary || '';
            const description = [intro, points && `
Key Points:
${points}`, qa && `
Practice:
${qa}`, summary && `
Summary:
${summary}`]
              .filter(Boolean)
              .join('\n\n');

            try {
              await createLesson(courseData.id, backendModuleId, {
                title: completeLesson.title,
                description: description,
                order: lIndex + 1,
                status: 'PUBLISHED'
              });
            } catch (e) {
              console.error('Lesson creation failed, continuing:', e);
            }

            // Rate-limit between lessons
            await new Promise(r => setTimeout(r, 700));
          }

          // Small delay between modules
          await new Promise(r => setTimeout(r, 500));
        }

        // Mark outline as having generated lessons
        setOutlines(prev => prev.map(o => o.id === outline.id ? { ...o, lessonsGenerated: true } : o));
        console.log('✅ All lessons generated and saved');
      } catch (error) {
        console.error('Lesson generation failed:', error);
        alert('Lesson generation failed: ' + (error?.message || 'Unknown error'));
      } finally {
        setIsGenerating(false);
      }
    };

    executeWithTaskLock('text', executeGeneration);
  };

  // Generate course structure using LangChain Bytez
  const generateCourseStructure = async (data) => {
    console.log('🤖 Generating course structure via frontend Bytez (key rotation)...');
    const source = data || formData;
    const title = (source?.title || '').trim();
    const description = source?.description || '';
    const subject = source?.subject || title;
    
    try {
      return await executeWithApiKeyRotation('structure', async (apiKey) => {
        console.log('🔑 Attempting AI generation with API key:', apiKey ? 'Available' : 'Missing');
        
        if (!apiKey) {
          console.log('⚠️ No API key available, will use fallback');
          throw new Error('No API key available');
        }
        
        console.log('🚀 Calling LangChain Bytez service...');
        const lc = await langChainBytezService.generateCourseStructure(title, description, subject, apiKey);
        
        if (lc?.content) {
          console.log('✅ AI generated content received:', lc.content.substring(0, 100) + '...');
          return parseStructureOutput(lc.content, { title, description, subject });
        }
        
        throw new Error('AI service returned no content');
      });
    } catch (error) {
      console.error('❌ Course structure generation failed:', error);
      console.log('🔄 Falling back to template generation...');
      return generateFallbackStructure({ title, description, subject });
    }
  };

  // Parse structure output to modules
  const parseStructureOutput = (output, formData) => {
    console.log('🔍 Parsing AI-generated structure output...');
    const lines = output.split('\n').filter(line => line.trim());
    const modules = [];
    
    let currentModule = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('module')) {
        if (currentModule) {
          // Mark previous module as AI-generated
          currentModule.isAIGenerated = true;
          modules.push(currentModule);
        }
        
        // Extract module title and create proper structure
        const moduleTitle = trimmed.replace(/^module \d+:\s*/i, '');
        currentModule = {
          id: Date.now() + Math.random(),
          title: moduleTitle,
          description: `Learn about ${moduleTitle}`,
          lessons: [
            {
              id: `lesson-${Date.now()}-1`,
              title: `Getting Started with ${moduleTitle}`,
              heading: `Getting Started with ${moduleTitle}`,
              duration: '15-20 min',
              lessonsGenerated: false,
              isAIGenerated: true // Mark as AI-generated
            },
            {
              id: `lesson-${Date.now()}-2`, 
              title: `Core Concepts of ${moduleTitle}`,
              heading: `Core Concepts of ${moduleTitle}`,
              duration: '20-25 min',
              lessonsGenerated: false,
              isAIGenerated: true // Mark as AI-generated
            }
          ],
          lessonsGenerated: false,
          isAIGenerated: true
        };
      } else if (currentModule && trimmed.length > 0 && !trimmed.toLowerCase().includes('module')) {
        // This is module description - use AI-generated description
        currentModule.description = trimmed;
      }
    });
    
    if (currentModule) {
      currentModule.isAIGenerated = true;
      modules.push(currentModule);
    }
    
    console.log(`✅ Parsed ${modules.length} AI-generated modules`);
    
    // Only use fallback if no modules were parsed from AI output
    if (modules.length === 0) {
      console.log('⚠️ No modules parsed from AI output, using fallback');
      return generateFallbackStructure(formData);
    }
    
    return { modules };
  };

  // Generate fallback structure
  const generateFallbackStructure = (formData) => {
    return {
      modules: [
        {
          id: Date.now() + 1,
          title: `Introduction to ${formData.title}`,
          description: `Get started with the basics of ${formData.title}`,
          lessons: [
            {
              id: `lesson-${Date.now()}-1`,
              title: `Getting Started with ${formData.title}`,
              heading: `Getting Started with ${formData.title}`,
              duration: '15-20 min',
              lessonsGenerated: false,
              isAIGenerated: false
            },
            {
              id: `lesson-${Date.now()}-2`,
              title: `Understanding ${formData.title} Basics`,
              heading: `Understanding ${formData.title} Basics`,
              duration: '20-25 min',
              lessonsGenerated: false,
              isAIGenerated: false
            }
          ],
          lessonsGenerated: false
        },
        {
          id: Date.now() + 2,
          title: `${formData.title} Fundamentals`,
          description: `Master the core concepts of ${formData.title}`,
          lessons: [
            {
              id: `lesson-${Date.now()}-3`,
              title: `Advanced ${formData.title} Concepts`,
              heading: `Advanced ${formData.title} Concepts`,
              duration: '25-30 min',
              lessonsGenerated: false,
              isAIGenerated: false
            },
            {
              id: `lesson-${Date.now()}-4`,
              title: `Practical ${formData.title} Applications`,
              heading: `Practical ${formData.title} Applications`,
              duration: '30-35 min',
              lessonsGenerated: false,
              isAIGenerated: false
            }
          ],
          lessonsGenerated: false
        }
      ]
    };
  };

  // Parse AI output into structured modules with enhanced content
  const parseAIContentToModules = async (aiOutput, formData) => {
    const subject = formData.subject || formData.title;
    
    // Generate enhanced lessons with images and Q&A
    const lesson1 = await generateEnhancedLesson(
      `Getting Started with ${subject}`,
      `Welcome to your ${subject} learning journey. This comprehensive lesson will introduce you to the essential concepts and provide you with a solid foundation to build upon.`,
      [
        `Understanding what ${subject} is and why it's important in today's world`,
        `Key terminology, concepts, and fundamental principles you need to know`,
        `Setting up your learning environment and exploring available resources`
      ],
      `You now have a clear understanding of ${subject} fundamentals and are well-prepared to continue your learning journey with confidence.`,
      subject
    );

    const lesson2 = await generateEnhancedLesson(
      `Core ${subject} Concepts`,
      `Building on your foundational knowledge, this lesson dives deeper into the core concepts that make ${subject} powerful and practical for real-world applications.`,
      [
        `Essential principles and methodologies that drive ${subject} success`,
        `Common patterns, best practices, and industry standards to follow`,
        `Practical examples and hands-on exercises to reinforce your learning`
      ],
      `You've successfully mastered the core concepts of ${subject} and are now equipped with the knowledge to tackle more advanced topics and real-world challenges.`,
      subject
    );

    const modules = [
      {
        id: 1,
        title: `Introduction to ${subject}`,
        description: `Foundational concepts and overview of ${subject}`,
        lessons: [lesson1],
        isAIGenerated: true
      },
      {
        id: 2,
        title: `${subject} Fundamentals`,
        description: 'Core principles and practical application',
        lessons: [lesson2],
        isAIGenerated: true
      }
    ];

    return { modules };
  };

  // Generate lessons for a specific module
  const generateModuleLessons = async (outlineId, moduleIndex) => {
    const outline = outlines.find(o => o.id === outlineId);
    if (!outline || !outline.modules[moduleIndex]) return;
    
    const module = outline.modules[moduleIndex];
    
    // Mark module as generating lessons
    setOutlines(prev => prev.map(o => 
      o.id === outlineId ? {
        ...o,
        modules: o.modules.map((m, idx) => 
          idx === moduleIndex ? { ...m, isGeneratingLessons: true } : m
        )
      } : o
    ));
    
    try {
      console.log(`🚀 Generating lessons for module: ${module.title}`);
      
      // Generate 2-3 lessons for this module
      const lessonTitles = [
        `Getting Started with ${module.title}`,
        `Core Concepts of ${module.title}`,
        `Advanced ${module.title} Techniques`
      ];
      
      const generatedLessons = [];
      
      // Generate lessons sequentially to avoid rate limits
      for (let i = 0; i < 2; i++) { // Generate 2 lessons per module
        const lessonTitle = lessonTitles[i];
        console.log(`📚 Generating lesson ${i + 1}: ${lessonTitle}`);
        
        const lesson = await generateCompleteLesson(
          lessonTitle,
          module.title,
          outline.subject || outline.title
        );
        
        generatedLessons.push(lesson);
        
        // Add delay between lessons
        if (i < 1) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
      }
      
      // Update outline with generated lessons
      setOutlines(prev => prev.map(o => 
        o.id === outlineId ? {
          ...o,
          modules: o.modules.map((m, idx) => 
            idx === moduleIndex ? {
              ...m,
              lessons: generatedLessons,
              lessonsGenerated: true,
              isGeneratingLessons: false
            } : m
          )
        } : o
      ));
      
      console.log(`✅ Generated ${generatedLessons.length} lessons for ${module.title}`);
      
      // Save to backend if authenticated
      try {
        const { isAuthenticated } = await import('../../services/tokenService');
        if (isAuthenticated() && outline.backendId) {
          await saveLessonsToBackend(outline.backendId, module, generatedLessons);
        }
      } catch (error) {
        console.warn('Backend save failed:', error);
      }
      
    } catch (error) {
      console.error(`❌ Lesson generation failed for ${module.title}:`, error);
      
      // Mark as failed and remove loading state
      setOutlines(prev => prev.map(o => 
        o.id === outlineId ? {
          ...o,
          modules: o.modules.map((m, idx) => 
            idx === moduleIndex ? {
              ...m,
              isGeneratingLessons: false,
              generationFailed: true
            } : m
          )
        } : o
      ));
    }
  };

  // Save lessons to backend
  const saveLessonsToBackend = async (courseId, module, lessons) => {
    try {
      const { createAIModulesAndLessons } = await import('../../services/courseService');
      
      const moduleWithLessons = {
        ...module,
        lessons: lessons
      };
      
      await createAIModulesAndLessons(courseId, [{ modules: [moduleWithLessons] }]);
      console.log('✅ Lessons saved to backend');
    } catch (error) {
      console.error('❌ Backend lesson save failed:', error);
    }
  };

  // (Removed duplicate older lesson generation implementations to avoid identifier conflicts)

  // Parse lesson text output
  const parseLessonTextOutput = (output, lessonTitle) => {
    const sections = {
      introduction: '',
      mainContent: [],
      qa: [],
      summary: ''
    };
    
    const lines = output.split('\n').filter(line => line.trim());
    let currentSection = null;
    
    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.includes('introduction')) {
        currentSection = 'introduction';
      } else if (trimmed.includes('main') || trimmed.includes('content') || trimmed.includes('key')) {
        currentSection = 'mainContent';
      } else if (trimmed.includes('q&a') || trimmed.includes('question')) {
        currentSection = 'qa';
      } else if (trimmed.includes('summary')) {
        currentSection = 'summary';
      } else if (line.trim() && currentSection) {
        if (currentSection === 'introduction' || currentSection === 'summary') {
          sections[currentSection] += line.trim() + ' ';
        } else if (currentSection === 'mainContent') {
          sections.mainContent.push(line.trim());
        } else if (currentSection === 'qa') {
          if (line.includes('?')) {
            sections.qa.push({ question: line.trim(), answer: 'Answer will be provided.' });
          }
        }
      }
    });
    
    // Ensure we have content
    if (!sections.introduction) {
      sections.introduction = `Welcome to ${lessonTitle}. This lesson will provide you with essential knowledge and practical skills.`;
    }
    
    if (sections.mainContent.length === 0) {
      sections.mainContent = [
        `Understanding the fundamentals of ${lessonTitle}`,
        `Practical applications and examples`,
        `Best practices and common patterns`
      ];
    }
    
    if (sections.qa.length === 0) {
      sections.qa = generateFallbackQA(lessonTitle, sections.mainContent);
    }
    
    if (!sections.summary) {
      sections.summary = `You have successfully completed ${lessonTitle} and gained valuable insights.`;
    }
    
    return sections;
  };

  // Generate fallback lesson text
  const generateFallbackLessonText = (lessonTitle, moduleTitle, subject) => {
    return {
      introduction: `Welcome to ${lessonTitle}. This lesson is part of ${moduleTitle} and will help you understand key concepts in ${subject}.`,
      mainContent: [
        `Core principles of ${lessonTitle}`,
        `Practical applications and real-world examples`,
        `Best practices and implementation strategies`
      ],
      qa: generateFallbackQA(lessonTitle, []),
      summary: `You have completed ${lessonTitle} and are ready to apply these concepts in practice.`
    };
  };

  // Generate fallback complete lesson
  const generateFallbackCompleteLesson = (lessonTitle, moduleTitle, subject) => {
    const textContent = generateFallbackLessonText(lessonTitle, moduleTitle, subject);
    const image = generatePlaceholderImage(lessonTitle);
    
    return {
      id: Date.now() + Math.random(),
      title: lessonTitle,
      heading: lessonTitle,
      introduction: textContent.introduction,
      mainContent: textContent.mainContent,
      qa: textContent.qa,
      image: image,
      summary: textContent.summary,
      duration: '15-20 min',
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    };
  };

  // Fallback Q&A generation
  const generateFallbackQA = (lessonTitle, contentPoints) => {
    return [
      {
        question: `What is the main focus of ${lessonTitle}?`,
        answer: contentPoints[0] || `The main focus is understanding the core concepts of ${lessonTitle}.`
      },
      {
        question: `What are the key benefits of learning ${lessonTitle}?`,
        answer: contentPoints[1] || `Learning ${lessonTitle} provides practical skills and knowledge.`
      },
      {
        question: `How can you apply ${lessonTitle} concepts?`,
        answer: contentPoints[2] || `You can apply these concepts through hands-on practice and real-world projects.`
      }
    ];
  };

  // Parse Q&A from AI text response
  const parseQAFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const qa = [];
    let currentQ = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^Q\d+:/)) {
        if (currentQ) qa.push(currentQ);
        currentQ = {
          id: qa.length + 1,
          question: trimmed.replace(/^Q\d+:\s*/, ''),
          answer: ''
        };
      } else if (trimmed.match(/^A\d+:/) && currentQ) {
        currentQ.answer = trimmed.replace(/^A\d+:\s*/, '');
      }
    });
    
    if (currentQ) qa.push(currentQ);
    
    // Fallback Q&A if parsing fails
    if (qa.length === 0) {
      return [
        {
          id: 1,
          question: "What are the key concepts covered in this lesson?",
          answer: "This lesson covers fundamental concepts and practical applications."
        }
      ];
    }
    
    return qa;
  };

  // Generate fallback content when AI is unavailable
  const generateFallbackContent = (formData) => {
    const subject = formData.subject || formData.title;
    
    return {
      modules: [
        {
          id: 1,
          title: `Introduction to ${subject}`,
          description: `Foundational concepts and overview of ${subject}`,
          lessons: [
            {
              id: 1,
              title: `Getting Started with ${subject}`,
              heading: `Getting Started with ${subject}`,
              introduction: `${subject} is a modern technology for building applications.`,
              content: {
                introduction: `${subject} is a modern technology for building applications.`,
                mainContent: [
                  `Understanding what ${subject} is and why it's important in today's world`,
                  `Key terminology, concepts, and fundamental principles you need to know`,
                  `Setting up your learning environment and exploring available resources`
                ],
                examples: [
                  { title: `Basic ${subject} Example`, description: `A simple demonstration of ${subject} concepts in action` },
                  { title: `Real-world Application`, description: `How ${subject} is used in professional environments` }
                ],
                multimedia: {
                  image: `/placeholder-${subject.toLowerCase()}-diagram.jpg`,
                  video: null,
                  hasVideo: false
                },
                qa: [
                  { question: `What is ${subject}?`, answer: `${subject} is a powerful technology/concept that enables developers to build modern applications efficiently.` },
                  { question: `Why should I learn ${subject}?`, answer: `Learning ${subject} opens up numerous career opportunities and helps you build better applications.` }
                ],
                keyTakeaways: [
                  `${subject} is essential for modern development`,
                  `Understanding core concepts is crucial for success`,
                  `Practical application reinforces theoretical knowledge`
                ],
                summary: `${subject} fundamentals covered successfully.`
              },
              summary: `${subject} fundamentals covered successfully.`,
              duration: '15-20 min',
              isAIGenerated: false
            }
          ],
          isAIGenerated: false
        },
        {
          id: 2,
          title: `${subject} Fundamentals`,
          description: 'Core principles and practical application',
          lessons: [
            {
              id: 2,
              title: `Core ${subject} Concepts`,
              heading: `Core ${subject} Concepts`,
              introduction: `Advanced ${subject} concepts and implementation.`,
              content: {
                introduction: `Advanced ${subject} concepts and implementation.`,
                mainContent: [
                  `Essential principles and methodologies that drive ${subject} success`,
                  `Common patterns, best practices, and industry standards to follow`,
                  `Practical examples and hands-on exercises to reinforce your learning`
                ],
                examples: [
                  { title: `Advanced ${subject} Pattern`, description: `Complex implementation showcasing ${subject} best practices` },
                  { title: `Performance Optimization`, description: `Techniques to optimize ${subject} applications for better performance` }
                ],
                multimedia: {
                  image: `/placeholder-${subject.toLowerCase()}-architecture.jpg`,
                  video: `/placeholder-${subject.toLowerCase()}-tutorial.mp4`,
                  hasVideo: true
                },
                qa: [
                  { question: `What are the key principles of ${subject}?`, answer: `The key principles include modularity, reusability, and maintainability.` },
                  { question: `How do I implement best practices?`, answer: `Follow established patterns, write clean code, and test thoroughly.` },
                  { question: `What are common mistakes to avoid?`, answer: `Avoid overcomplicating solutions and neglecting performance considerations.` }
                ],
                keyTakeaways: [
                  `Master the fundamental principles before moving to advanced topics`,
                  `Best practices ensure maintainable and scalable code`,
                  `Regular practice and real-world application solidify understanding`
                ],
                summary: `Core ${subject} concepts mastered.`
              },
              summary: `Core ${subject} concepts mastered.`,
              duration: '20-25 min',
              isAIGenerated: false
            }
          ],
          isAIGenerated: false
        }
      ]
    };
  };

  // Generate local course structure for API submission
  const generateLocalCourseStructure = (title, subject, difficulty) => {
    return {
      modules: [
        {
          id: 1,
          title: `Introduction to ${subject}`,
          description: `Foundational concepts and overview of ${subject}`,
          lessons: [
            {
              id: 1,
              title: `Getting Started with ${subject}`,
              intro: `Welcome to your ${subject} learning journey. This lesson covers the essential basics you need to know.`,
              subtopics: [
                `What is ${subject} and why is it important?`,
                'Key terminology and concepts',
                'Real-world applications and benefits',
                'Setting up your learning environment'
              ],
              summary: `You now have a solid foundation in ${subject} basics and are ready to dive deeper into the fundamentals.`,
              duration: '15 min'
            }
          ]
        },
        {
          id: 2,
          title: `${subject} Fundamentals`,
          description: 'Core principles and practical application',
          lessons: [
            {
              id: 2,
              title: `Core ${subject} Concepts`,
              intro: `Now that you understand the basics, let's explore the fundamental concepts that form the backbone of ${subject}.`,
              subtopics: [
                'Essential principles and methodologies',
                'Common patterns and best practices',
                'Hands-on examples and exercises',
                'Troubleshooting common issues'
              ],
              summary: `You've mastered the core concepts of ${subject} and can now apply these principles in practical scenarios.`,
              duration: '20 min'
            }
          ]
        }
      ]
    };
  };

  // Generate fallback outline when AI service is unavailable
  const generateFallbackOutline = (title, description, targetAudience, learningObjectives) => {
    const courseTitle = title || `Complete Guide to ${description}`;
    
    // Create structured modules with lessons (limited to 2 modules, 1 lesson each)
    const modules = [
      {
        id: 1,
        title: `Introduction to ${description}`,
        description: `Foundational concepts and overview of ${description}`,
        lessons: [
          {
            id: 1,
            title: `Getting Started with ${description}`,
            intro: `Welcome to your ${description} learning journey. This lesson covers the essential basics you need to know.`,
            subtopics: [
              `What is ${description} and why is it important?`,
              'Key terminology and concepts',
              'Real-world applications and benefits',
              'Setting up your learning environment'
            ],
            summary: `You now have a solid foundation in ${description} basics and are ready to dive deeper into the fundamentals.`,
            duration: '15 min',
            isAIGenerated: false
          }
        ],
        isAIGenerated: false
      },
      {
        id: 2,
        title: `${description} Fundamentals`,
        description: 'Core principles and practical application',
        lessons: [
          {
            id: 2,
            title: `Core ${description} Concepts`,
            intro: `Now that you understand the basics, let's explore the fundamental concepts that form the backbone of ${description}.`,
            subtopics: [
              'Essential principles and methodologies',
              'Common patterns and best practices',
              'Hands-on examples and exercises',
              'Troubleshooting common issues'
            ],
            summary: `You've mastered the core concepts of ${description} and can now apply these principles in practical scenarios.`,
            duration: '20 min',
            isAIGenerated: false
          }
        ],
        isAIGenerated: false
      }
    ];

    return {
      id: Date.now(),
      title: courseTitle,
      description: description,
      targetAudience: targetAudience,
      learningObjectives: learningObjectives,
      modules: modules,
      lessons: [], // Lessons are now organized under modules
      rawContent: `Generated local fallback course outline for: ${description}`,
      createdAt: new Date().toISOString(),
      isAIGenerated: false,
      aiModel: 'Local Fallback Generator'
    };
  };

  // Parse modules from AI text response - simplified to create only 1 module with 1 comprehensive lesson
  const parseModulesFromText = (text) => {
    // Create single module with comprehensive lesson content
    const singleLesson = generateComprehensiveLesson(formData.title || 'Course Content', text);
    
    return [{
      id: 'module-1',
      title: formData.title || 'Main Course Module',
      description: formData.description || 'Complete course content in a single comprehensive lesson',
      lessons: [singleLesson],
      isAIGenerated: true
    }];
  };

  // Generate a single comprehensive lesson with all course content
  const generateComprehensiveLesson = (courseTitle, aiContent) => {
    // Generate AI images for the lesson
    const lessonImages = [
      {
        id: `img-comprehensive-1`,
        url: `https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=${encodeURIComponent(courseTitle)}`,
        alt: `Visual representation of ${courseTitle}`,
        caption: `Comprehensive overview of ${courseTitle}`
      },
      {
        id: `img-comprehensive-2`,
        url: `https://via.placeholder.com/600x300/059669/FFFFFF?text=${encodeURIComponent('Practical Examples')}`,
        alt: `Practical examples for ${courseTitle}`,
        caption: `Real-world applications and examples`
      }
    ];

    // Parse AI content to extract key points or create structured content
    const contentPoints = [];
    
    if (aiContent && typeof aiContent === 'string') {
      const lines = aiContent.split('\n').filter(line => line.trim());
      let pointCount = 0;
      
      lines.forEach(line => {
        if (line.includes('Module') && line.includes(':') && pointCount < 5) {
          const title = line.split(':')[1]?.trim() || `Key Concept ${pointCount + 1}`;
          contentPoints.push({
            type: 'point',
            title: title,
            description: `Comprehensive coverage of ${title.toLowerCase()} including fundamental concepts, practical applications, and real-world examples.`
          });
          pointCount++;
        }
      });
    }
    
    // If no content points extracted, create default comprehensive structure
    if (contentPoints.length === 0) {
      contentPoints.push(
        {
          type: 'point',
          title: 'Introduction and Fundamentals',
          description: `Core concepts and foundational principles of ${courseTitle}. Understanding the basic terminology, key components, and fundamental theories.`
        },
        {
          type: 'point',
          title: 'Key Concepts and Methodology',
          description: `Essential concepts, methodologies, and approaches in ${courseTitle}. Step-by-step processes and best practices for implementation.`
        },
        {
          type: 'point',
          title: 'Practical Applications',
          description: `Real-world applications, case studies, and hands-on examples of ${courseTitle}. Common use cases and practical implementation strategies.`
        },
        {
          type: 'point',
          title: 'Advanced Topics and Techniques',
          description: `Advanced concepts, specialized techniques, and expert-level knowledge in ${courseTitle}. Complex scenarios and optimization strategies.`
        },
        {
          type: 'point',
          title: 'Best Practices and Troubleshooting',
          description: `Industry best practices, common pitfalls to avoid, troubleshooting techniques, and optimization tips for ${courseTitle}.`
        }
      );
    }

    return {
      id: `lesson-comprehensive-1`,
      title: `Complete Guide to ${courseTitle}`,
      heading: `Complete Guide to ${courseTitle}`,
      introduction: `This comprehensive lesson covers everything you need to know about ${courseTitle}. You'll learn from basic fundamentals to advanced concepts, with practical examples and real-world applications throughout.`,
      content: contentPoints,
      summary: `You've completed a comprehensive study of ${courseTitle}, covering fundamental concepts, practical methodologies, real-world applications, advanced techniques, and best practices. This knowledge provides you with a solid foundation and practical skills to apply ${courseTitle} effectively.`,
      images: lessonImages,
      isAIGenerated: true
    };
  };

  // Parse detailed course outline from AI response
  const parseDetailedCourseOutline = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    let courseTitle = '';
    const lessons = [];
    const modules = [];
    let currentLesson = null;
    let currentModule = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Extract course title
      if (trimmedLine.startsWith('Course Title:')) {
        courseTitle = trimmedLine.replace('Course Title:', '').trim();
      }
      // Extract module
      else if (trimmedLine.match(/^Module \d+:/)) {
        if (currentModule) modules.push(currentModule);
        currentModule = {
          id: `module-${modules.length + 1}`,
          title: trimmedLine.replace(/^Module \d+:\s*/, ''),
          lessons: [],
          isAIGenerated: true
        };
      }
      // Extract lesson
      else if (trimmedLine.match(/^-?\s*Lesson \d+/)) {
        if (currentLesson) {
          if (currentModule) {
            currentModule.lessons.push(currentLesson);
          } else {
            lessons.push(currentLesson);
          }
        }
        currentLesson = {
          id: `lesson-${(currentModule ? currentModule.lessons.length : lessons.length) + 1}`,
          title: trimmedLine.replace(/^-?\s*Lesson \d+[.:]\d*\s*/, ''),
          subtopics: [],
          isAIGenerated: true
        };
      }
      // Extract subtopics/topics
      else if (trimmedLine.match(/^\*\s*Topic:/) && currentLesson) {
        currentLesson.subtopics.push(trimmedLine.replace(/^\*\s*Topic:\s*/, ''));
      }
      else if (trimmedLine.startsWith('-') && currentLesson) {
        currentLesson.subtopics.push(trimmedLine.replace(/^-\s*/, ''));
      }
    });
    
    // Add final lesson and module
    if (currentLesson) {
      if (currentModule) {
        currentModule.lessons.push(currentLesson);
      } else {
        lessons.push(currentLesson);
      }
    }
    if (currentModule) modules.push(currentModule);
    
    return { title: courseTitle, lessons, modules };
  };

  // Generate lessons for a specific module (async version)
  const generateLessonsForModuleAsync = async (outlineId, moduleIndex) => {
    const outline = outlines.find(o => o.id === outlineId);
    if (!outline || !outline.modules[moduleIndex]) return;

    const module = outline.modules[moduleIndex];
    
    // Set loading state for this specific module
    setOutlines(prev => prev.map(o => 
      o.id === outlineId ? {
        ...o,
        modules: o.modules.map((m, idx) => 
          idx === moduleIndex ? { ...m, isGeneratingLessons: true } : m
        )
      } : o
    ));

    try {
      // Use Bytez SDK for lesson generation
      const bytezKey = import.meta.env.VITE_BYTEZ_KEY || localStorage.getItem('BYTEZ_API_KEY');
      
      if (!bytezKey) {
        throw new Error('Bytez API key not configured');
      }
      
      const sdk = new Bytez(bytezKey);
      const model = sdk.model("gpt2");
      await model.create();
      
      const aiPrompt = `Generate 3 lessons for "${module.title}":
      Lesson 1: [Title]
      Lesson 2: [Title] 
      Lesson 3: [Title]`;
      
      const modelResponse = await model.run(aiPrompt, {
        max_new_tokens: 50,
        min_new_tokens: 20,
        temperature: 0.5
      });
      
      let response = { success: false, generated_text: '' };
      
      if (modelResponse && typeof modelResponse === 'object') {
        if (!modelResponse.error && modelResponse.output) {
          response = { success: true, generated_text: modelResponse.output };
        }
      } else if (typeof modelResponse === 'string') {
        response = { success: true, generated_text: modelResponse };
      }

      if (response.success) {
        const lessons = parseLessonsFromText(response.generated_text || response.text);
        
        // Update the outline with generated lessons
        setOutlines(prev => prev.map(o => 
          o.id === outlineId ? {
            ...o,
            modules: o.modules.map((m, idx) => 
              idx === moduleIndex ? { 
                ...m, 
                lessons: lessons,
                isGeneratingLessons: false,
                aiGenerated: true 
              } : m
            )
          } : o
        ));
      }
    } catch (error) {
      console.error('Lesson generation failed:', error);
      alert('Lesson generation failed. Please try again.');
      
      // Remove loading state
      setOutlines(prev => prev.map(o => 
        o.id === outlineId ? {
          ...o,
          modules: o.modules.map((m, idx) => 
            idx === moduleIndex ? { ...m, isGeneratingLessons: false } : m
          )
        } : o
      ));
    }
  };

  // Parse lessons from AI text response
  const parseLessonsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lessons = [];
    
    lines.forEach(line => {
      const match = line.match(/^Lesson \d+:\s*(.+)$/i);
      if (match) {
        lessons.push(match[1].trim());
      }
    });
    
    // Fallback if no lessons parsed
    if (lessons.length === 0) {
      return ['Introduction', 'Core Concepts', 'Practical Application', 'Summary & Review'];
    }
    
    return lessons;
  };

  // Toggle module expansion
  const toggleModule = (moduleKey) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return newSet;
    });
  };

  // Delete outline
  const deleteOutline = (id) => {
    setOutlines(outlines.filter(outline => outline.id !== id));
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.doc', '.docx', '.m4a', '.mp3', '.mp4', '.ogg', '.pdf', '.ppt', '.pptx', '.sbv', '.srt', '.story', '.sub', '.text', '.txt', '.vtt', '.wav', '.webm'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(fileExtension);
      const isValidSize = file.size <= 1024 * 1024 * 1024; // 1GB limit
      
      if (!isValidType) {
        alert(`File "${file.name}" is not a supported file type.`);
        return false;
      }
      if (!isValidSize) {
        alert(`File "${file.name}" exceeds the 1GB size limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...validFiles]
      }));
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'outline', label: 'Course Outline', icon: BookOpen, color: 'blue', enabled: true },
    { id: 'images', label: 'Image Generator', icon: Image, color: 'purple', enabled: true },
    { id: 'summarize', label: 'Summarization', icon: FileText, color: 'green', enabled: true },
    { id: 'qa', label: 'AI Q&A', icon: Search, color: 'orange', enabled: true }
  ];

  // Generate comprehensive course from title only
  const generateCourseOutline = async (titleOverride = null) => {
    const courseTitle = titleOverride || formData.title;
    
    if (!courseTitle?.trim()) {
      alert('Please provide a course title');
      return;
    }

    setIsGenerating(true);
    console.log('🚀 Starting course generation for:', courseTitle);
    
    try {
      // Check for API key using actual environment variable names
      const apiKey = import.meta.env.VITE_BYTEZ_API_KEY || localStorage.getItem('BYTEZ_API_KEY');
      
      console.log('🔑 Final API key check:', apiKey ? 'API key available' : 'No API key found');
      
      if (!apiKey) {
        console.log('No Bytez API key found, using fallback generation');
        const fallbackOutline = generateFallbackContent(courseTitle, `Complete guide to ${courseTitle}`);
        setOutlines(prev => [...prev, fallbackOutline]);
        console.log('✅ Fallback course generated successfully (offline mode)');
        return;
      }

      // Updated API accounts with correct Bytez endpoint format
      const apiAccounts = [
        { key: import.meta.env.VITE_BYTEZ_API_KEY, model: 'openai-community/gpt2' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_2, model: 'microsoft/DialoGPT-medium' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_3, model: 'openai-community/gpt2' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_4, model: 'microsoft/DialoGPT-medium' }
      ].filter(account => account.key); // Only use accounts with valid keys

      // Try each API account until one works
      let response = null;
      let usedAccount = null;
      
      for (const account of apiAccounts) {
        try {
          console.log(`🔄 Trying API account with model: ${account.model}`);
          console.log('🔑 Using API Key:', account.key.substring(0, 8) + '...');
          
          // Initialize Bytez with current API key
          const sdk = new Bytez(account.key);
          const model = sdk.model(account.model);
          
          console.log('🏗️ Creating model instance...');
          await model.create();
          console.log('✅ Model instance created successfully');
          
          const prompt = `Create a course outline for ${courseTitle}. 
          
Title: ${courseTitle}
Description: Complete guide to ${courseTitle}
Module: ${courseTitle} Fundamentals
Lesson: Introduction to ${courseTitle}

Return only the lesson title.`;
          
          console.log('📝 Prompt:', prompt);
          console.log('🚀 Running model with parameters...');
          
          const result = await model.run(prompt, {
            max_new_tokens: 50,
            min_new_tokens: 10,
            temperature: 0.3
          });
          
          console.log('📊 Model result:', result);
          
          if (result.error) {
            console.log(`❌ Error with ${account.model}:`, result.error);
            continue;
          }
          
          response = result.output;
          usedAccount = account;
          console.log(`✅ Success with ${account.model}`);
          break;
          
        } catch (error) {
          console.log(`❌ Failed with ${account.model}:`, error.message);
          continue;
        }
      }

      console.log('✅ Bytez API response received:', response);
      console.log('📊 Response length:', response?.length || 0);
      
      if (response && response.length > 0) {
        console.log('🔍 Parsing AI response as JSON...');
        
        try {
          // Try to parse as JSON first
          let courseData;
          try {
            // Clean the response - remove any non-JSON text
            const cleanResponse = response.trim();
            const jsonStart = cleanResponse.indexOf('{');
            const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
              courseData = JSON.parse(jsonString);
              console.log('✅ Successfully parsed JSON response:', courseData);
            } else {
              throw new Error('No valid JSON found in response');
            }
          } catch (jsonError) {
            console.log('❌ JSON parsing failed, using fallback structure:', jsonError.message);
            // Create comprehensive structured data from text response
            courseData = {
              title: courseTitle,
              description: `Complete guide to ${courseTitle}`,
              targetAudience: 'Beginners to intermediate learners',
              learningObjectives: [`Master the fundamentals of ${courseTitle}`, `Apply ${courseTitle} concepts in real-world scenarios`, `Build practical projects using ${courseTitle}`],
              modules: [{
                id: 1,
                title: `${courseTitle} Fundamentals`,
                description: `Core concepts and principles of ${courseTitle}`,
                lessons: [{
                  id: 1,
                  title: `Introduction to ${courseTitle}`,
                  content: {
                    introduction: `This lesson introduces you to the fundamental concepts of ${courseTitle}. You'll learn the basic principles and understand how to apply them effectively in real-world scenarios.`,
                    textExplanations: [
                      {concept: `What is ${courseTitle}?`, explanation: `${courseTitle} is a fundamental concept/technology that enables developers and professionals to create efficient solutions. Understanding its core principles is essential for mastering the subject.`},
                      {concept: `Key Terminology`, explanation: `Learn the essential vocabulary and terminology used in ${courseTitle}. This foundation will help you communicate effectively and understand advanced concepts.`},
                      {concept: `Historical Context`, explanation: `Understanding how ${courseTitle} evolved over time provides valuable context for its current applications and future developments.`}
                    ],
                    examples: [
                      {title: `Basic ${courseTitle} Example`, description: `A step-by-step walkthrough of a simple ${courseTitle} implementation, demonstrating core concepts in action.`},
                      {title: `Real-World Case Study`, description: `Examine how major companies use ${courseTitle} to solve complex problems and improve their operations.`},
                      {title: `Common Use Cases`, description: `Explore typical scenarios where ${courseTitle} provides significant value and practical benefits.`}
                    ],
                    media: [
                      {type: "image", description: `Conceptual diagram showing the architecture and components of ${courseTitle}`},
                      {type: "video", description: `Interactive demonstration of ${courseTitle} basics with visual examples`},
                      {type: "infographic", description: `Visual comparison of ${courseTitle} with alternative approaches`}
                    ],
                    activities: [
                      {type: "exercise", title: `Hands-on ${courseTitle} Setup`, description: `Follow guided steps to set up your first ${courseTitle} environment and run a basic example.`},
                      {type: "question", title: `Reflection Questions`, description: `Consider how ${courseTitle} might apply to your current projects or career goals.`},
                      {type: "quiz", title: `Knowledge Check`, description: `Test your understanding of key ${courseTitle} concepts and terminology.`}
                    ],
                    keyTakeaways: [
                      `${courseTitle} is a powerful tool for solving complex problems efficiently`,
                      `Understanding the fundamentals is crucial before moving to advanced topics`,
                      `Practical application reinforces theoretical knowledge`,
                      `${courseTitle} has wide-ranging applications across multiple industries`
                    ],
                    summary: `You've completed an introduction to ${courseTitle}, covering its definition, key concepts, practical examples, and real-world applications. You now have a solid foundation to build upon in subsequent lessons.`
                  }
                }]
              }]
            };
          }
          
          // Update form data with AI-generated content
          setFormData(prev => ({
            ...prev,
            title: courseData.title,
            description: courseData.description,
            targetAudience: courseData.targetAudience,
            learningObjectives: Array.isArray(courseData.learningObjectives) ? courseData.learningObjectives.join(', ') : courseData.learningObjectives
          }));
          
          const outline = {
            id: Date.now(),
            title: courseData.title,
            description: courseData.description,
            targetAudience: courseData.targetAudience,
            learningObjectives: courseData.learningObjectives,
            modules: courseData.modules || [],
            lessons: [], // Lessons are now organized under modules
            rawContent: response,
            createdAt: new Date().toISOString(),
            isAIGenerated: true,
            aiModel: usedAccount?.model || 'fallback'
          };
          
          setOutlines(prev => [...prev, outline]);
          console.log('✅ Course generated and saved successfully!');
          
        } catch (error) {
          console.error('❌ Error processing AI response:', error);
          throw error;
        }
      } else {
        console.log('❌ No valid response from any API account, using fallback');
        const fallbackOutline = generateFallbackContent(courseTitle, `Complete guide to ${courseTitle}`);
        setOutlines(prev => [...prev, fallbackOutline]);
        console.log('✅ Fallback course generated successfully');
      }
      
    } catch (error) {
      console.error('Error generating course outline:', error);
      
      // Fallback to local generation
      console.log('Falling back to local generation due to error:', error.message);
      const fallbackOutline = generateFallbackContent(courseTitle, `Complete guide to ${courseTitle}`);
      setOutlines(prev => [...prev, fallbackOutline]);
      console.log('✅ Fallback course generated successfully');
    } finally {
      setIsGenerating(false);
    }
  };


  const generateLessonContent = async (lesson) => {
    console.log('🚀 Generating content for lesson:', lesson.title);
    
    try {
      const apiKey = import.meta.env.VITE_BYTEZ_KEY || import.meta.env.VITE_BYTEZ_API_KEY;
      
      if (!apiKey) {
        // Fallback content
        const fallbackContent = {
          introduction: `This lesson covers ${lesson.title}. You'll learn the essential concepts and practical applications.`,
          mainContent: [
            {point: "Core Concepts", description: `Understanding the fundamental principles of ${lesson.title}`},
            {point: "Practical Examples", description: `Real-world applications and use cases for ${lesson.title}`},
            {point: "Best Practices", description: `Industry standards and recommended approaches for ${lesson.title}`}
          ],
          summary: `You've completed the lesson on ${lesson.title} and gained practical knowledge to apply these concepts.`
        };
        
        // Update the lesson with content
        setOutlines(prev => prev.map(outline => ({
          ...outline,
          modules: outline.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(l => 
              l.id === lesson.id ? { ...l, content: fallbackContent } : l
            )
          }))
        })));
        
        setSelectedLesson(prev => ({ ...prev, content: fallbackContent }));
        return;
      }

      // Try API generation
      const apiAccounts = [
        { key: apiKey, model: 'google/flan-t5-base' },
        { key: import.meta.env.VITE_BYTEZ_KEY_2, model: 'google/flan-t5-small' },
        { key: import.meta.env.VITE_BYTEZ_KEY_3, model: 'microsoft/DialoGPT-small' },
        { key: import.meta.env.VITE_BYTEZ_KEY_4, model: 'gpt2' }
      ].filter(account => account.key);

      for (const account of apiAccounts) {
        try {
          const sdk = new Bytez(account.key);
          const model = sdk.model(account.model);
          await model.create();
          
          const prompt = `Generate comprehensive lesson content for: "${lesson.title}".

Return JSON with this complete educational structure:
{
  "introduction": "2-3 sentences introducing the lesson topic",
  "textExplanations": [
    {"concept": "Definition/Theory 1", "explanation": "Clear explanation with context"},
    {"concept": "Definition/Theory 2", "explanation": "Clear explanation with context"}
  ],
  "examples": [
    {"title": "Example 1", "description": "Worked-out problem or case study"},
    {"title": "Example 2", "description": "Real-world demonstration"}
  ],
  "media": [
    {"type": "image", "description": "Visual diagram or illustration"},
    {"type": "video", "description": "Educational video content"}
  ],
  "activities": [
    {"type": "exercise", "title": "Practice Exercise", "description": "Hands-on activity"},
    {"type": "question", "title": "Discussion Question", "description": "Thought-provoking prompt"}
  ],
  "keyTakeaways": [
    "Important point to remember",
    "Key concept summary",
    "Practical application"
  ],
  "summary": "2-3 sentences summarizing what was learned"
}`;
          
          const result = await model.run(prompt, {
            max_new_tokens: 400,
            min_new_tokens: 100,
            temperature: 0.6
          });
          
          if (result.output) {
            let content;
            try {
              const cleanResponse = result.output.trim();
              const jsonStart = cleanResponse.indexOf('{');
              const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
              
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
                content = JSON.parse(jsonString);
              } else {
                throw new Error('No JSON found');
              }
            } catch {
              // Comprehensive fallback if JSON parsing fails
              content = {
                introduction: `This lesson covers ${lesson.title}. You'll learn the essential concepts, see practical examples, and engage with hands-on activities.`,
                textExplanations: [
                  {concept: `What is ${lesson.title}?`, explanation: `${lesson.title} is a fundamental concept that provides essential knowledge for understanding the broader subject matter.`},
                  {concept: `Key Terminology`, explanation: `Learn the important terms and definitions that form the foundation of ${lesson.title}.`}
                ],
                examples: [
                  {title: `Basic Example`, description: `A step-by-step walkthrough demonstrating core concepts of ${lesson.title} in action.`},
                  {title: `Real-World Application`, description: `See how ${lesson.title} is applied in professional settings and industry scenarios.`}
                ],
                media: [
                  {type: "image", description: `Conceptual diagram illustrating key components of ${lesson.title}`},
                  {type: "video", description: `Interactive demonstration showing ${lesson.title} principles in practice`}
                ],
                activities: [
                  {type: "exercise", title: `Hands-on Practice`, description: `Apply what you've learned through guided exercises and practical implementation.`},
                  {type: "question", title: `Reflection Questions`, description: `Consider how ${lesson.title} relates to your goals and current understanding.`}
                ],
                keyTakeaways: [
                  `${lesson.title} provides essential foundation knowledge`,
                  `Practical application reinforces theoretical understanding`,
                  `Real-world examples demonstrate professional relevance`
                ],
                summary: `You've completed the lesson on ${lesson.title}, covering definitions, examples, and practical applications. You now have the knowledge to apply these concepts effectively.`
              };
            }
            
            // Update the lesson with generated content
            setOutlines(prev => prev.map(outline => ({
              ...outline,
              modules: outline.modules.map(module => ({
                ...module,
                lessons: module.lessons.map(l => 
                  l.id === lesson.id ? { ...l, content: content } : l
                )
              }))
            })));
            
            setSelectedLesson(prev => ({ ...prev, content: content }));
            console.log('✅ Lesson content generated successfully');
            return;
          }
        } catch (error) {
          console.log(`❌ Failed with ${account.model}:`, error.message);
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating lesson content:', error);
    }
  };

  // Generate images for lesson
  const generateLessonImages = async (lesson) => {
    setIsGeneratingImage(true);
    try {
      console.log('🖼️ Generating images for lesson:', lesson.title);
      
      const apiAccounts = [
        { key: import.meta.env.VITE_BYTEZ_API_KEY, model: 'google/flan-t5-base' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_2, model: 'google/flan-t5-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_3, model: 'microsoft/DialoGPT-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_4, model: 'gpt2' }
      ].filter(account => account.key);

      for (const account of apiAccounts) {
        try {
          const sdk = new Bytez(account.key);
          const model = sdk.model(account.model);
          await model.create();
          
          const prompt = `Generate a detailed image description for educational content about "${lesson.title}". 
          Describe a clear, educational diagram or illustration that would help students understand this topic. 
          Include visual elements, colors, and layout details.`;
          
          const result = await model.run(prompt, {
            max_new_tokens: 150,
            temperature: 0.7
          });
          
          if (result && result.length > 10) {
            console.log('Generated image description:', result);
            setImages(prev => [...prev, {
              id: Date.now(),
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              description: result,
              prompt: `Educational diagram for ${lesson.title}`,
              timestamp: new Date().toISOString()
            }]);
            break;
          }
        } catch (error) {
          console.log(`Image generation failed with account ${account.model}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating lesson image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate Q&A for lesson
  const generateLessonQA = async (lesson) => {
    setIsGeneratingQA(true);
    try {
      console.log('❓ Generating Q&A for lesson:', lesson.title);
      
      const apiAccounts = [
        { key: import.meta.env.VITE_BYTEZ_API_KEY, model: 'google/flan-t5-base' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_2, model: 'google/flan-t5-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_3, model: 'microsoft/DialoGPT-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_4, model: 'gpt2' }
      ].filter(account => account.key);

      for (const account of apiAccounts) {
        try {
          const sdk = new Bytez(account.key);
          const model = sdk.model(account.model);
          await model.create();
          
          const prompt = `Generate 3 educational questions and answers for the lesson "${lesson.title}".
          Format as:
          Q1: [Question]
          A1: [Answer]
          Q2: [Question] 
          A2: [Answer]
          Q3: [Question]
          A3: [Answer]`;
          
          const result = await model.run(prompt, {
            max_new_tokens: 300,
            temperature: 0.6
          });
          
          if (result && result.length > 20) {
            console.log('Generated Q&A:', result);
            setQaResults(prev => [...prev, {
              id: Date.now(),
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              content: result,
              timestamp: new Date().toISOString()
            }]);
            break;
          }
        } catch (error) {
          console.log(`Q&A generation failed with account ${account.model}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating lesson Q&A:', error);
    } finally {
      setIsGeneratingQA(false);
    }
  };

  // Generate enhanced summary for lesson
  const generateLessonSummary = async (lesson) => {
    setIsGeneratingSummary(true);
    try {
      console.log('📝 Generating enhanced summary for lesson:', lesson.title);
      
      const apiAccounts = [
        { key: import.meta.env.VITE_BYTEZ_API_KEY, model: 'google/flan-t5-base' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_2, model: 'google/flan-t5-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_3, model: 'microsoft/DialoGPT-small' },
        { key: import.meta.env.VITE_BYTEZ_API_KEY_4, model: 'gpt2' }
      ].filter(account => account.key);

      for (const account of apiAccounts) {
        try {
          const sdk = new Bytez(account.key);
          const model = sdk.model(account.model);
          await model.create();
          
          const prompt = `Create an enhanced summary for the lesson "${lesson.title}".
          Include:
          - Key learning outcomes
          - Main concepts covered
          - Practical applications
          - Next steps for learners`;
          
          const result = await model.run(prompt, {
            max_new_tokens: 200,
            temperature: 0.6
          });
          
          if (result && result.length > 20) {
            console.log('Generated enhanced summary:', result);
            setSummaries(prev => [...prev, {
              id: Date.now(),
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              content: result,
              timestamp: new Date().toISOString()
            }]);
            break;
          }
        } catch (error) {
          console.log(`Summary generation failed with account ${account.model}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating lesson summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Helper functions to extract course details from AI response
  const extractCourseDescription = (content) => {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('description:') || line.toLowerCase().includes('about:')) {
        return line.split(':')[1]?.trim();
      }
    }
    return null;
  };

  const extractTargetAudience = (content) => {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('target audience:') || line.toLowerCase().includes('audience:')) {
        return line.split(':')[1]?.trim();
      }
    }
    return null;
  };

  const extractLearningObjectives = (content) => {
    const lines = content.split('\n');
    const objectives = [];
    let inObjectivesSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('learning objectives:') || line.toLowerCase().includes('objectives:')) {
        inObjectivesSection = true;
        continue;
      }
      if (inObjectivesSection && line.trim().startsWith('-')) {
        objectives.push(line.replace('-', '').trim());
      } else if (inObjectivesSection && line.trim() === '') {
        break;
      }
    }
    
    return objectives.length > 0 ? objectives : null;
  };

  // AI-Only Course Outline Generator
  const OutlineGenerator = () => {
    const [generatingModules, setGeneratingModules] = useState(false);
    const [generatingLessons, setGeneratingLessons] = useState(new Set());
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [titleInput, setTitleInput] = useState(formData.title || '');

    // Generate AI-powered course modules
    const generateAIModules = async () => {
      const executeGeneration = async () => {
        setGeneratingModules(true);
        
        try {
        // Use Bytez SDK for course outline generation
        const bytezKey = import.meta.env.VITE_BYTEZ_KEY || localStorage.getItem('BYTEZ_API_KEY');
        
        if (!bytezKey) {
          throw new Error('Bytez API key not configured');
        }
        
        const sdk = new Bytez(bytezKey);
        const model = sdk.model("google/flan-t5-base");
        await model.create();
        
        const aiPrompt = `Create 3 short module titles for "${formData.title}". Each title should be 3-5 words maximum.
        
        Module 1: [Short title]
        Module 2: [Short title]  
        Module 3: [Short title]
        
        Examples: "Introduction to Basics", "Advanced Techniques", "Practical Applications"`;
        
        const { error, output } = await model.run(aiPrompt, {
          max_new_tokens: 200,
          min_new_tokens: 50,
          temperature: 0.5
        });
        
        const modelResponse = { error, output };
        
        let response = { success: false, modules: [] };
        
        if (modelResponse && typeof modelResponse === 'object') {
          if (!modelResponse.error && modelResponse.output) {
            response = { 
              success: true, 
              modules: parseModulesFromText(modelResponse.output),
              generated_text: modelResponse.output 
            };
          }
        } else if (typeof modelResponse === 'string') {
          response = { 
            success: true, 
            modules: parseModulesFromText(modelResponse),
            generated_text: modelResponse 
          };
        }

        if (response.success) {
          const aiGeneratedOutline = {
            id: Date.now(),
            title: formData.title,
            subject: formData.subject,
            description: formData.description,
            modules: response.modules || [],
            aiContent: response.generated_text,
            createdAt: new Date().toISOString(),
            isAIGenerated: true,
            aiModel: response.model || 'Bytez AI'
          };
          
          setOutlines(prev => [...prev, aiGeneratedOutline]);
          
          // Auto-expand first module for lesson generation
          if (aiGeneratedOutline.modules.length > 0) {
            setExpandedModules(new Set([aiGeneratedOutline.modules[0].id]));
          }
        } else {
          throw new Error('AI generation failed');
        }
      } catch (error) {
        console.error('AI module generation failed:', error);
        alert('AI module generation failed. Please check your backend server and API key.');
      } finally {
        setGeneratingModules(false);
      }
      };

      // Use simple rate limiting instead of queue
      executeWithRateLimit(executeGeneration);
    };

    // Generate AI-powered lessons for a specific module
    const generateAILessons = async (moduleId, moduleTitle, outlineId) => {
      const executeGeneration = async () => {
        const lessonKey = `${outlineId}-${moduleId}`;
        setGeneratingLessons(prev => new Set([...prev, lessonKey]));
        
        try {
        // Use Bytez SDK for lesson generation
        const bytezKey = import.meta.env.VITE_BYTEZ_KEY || localStorage.getItem('BYTEZ_API_KEY');
        
        if (!bytezKey) {
          throw new Error('Bytez API key not configured');
        }
        
        const sdk = new Bytez(bytezKey);
        const model = sdk.model("google/flan-t5-base");
        await model.create();
        
        const aiPrompt = `Create 3 specific lessons for the module "${moduleTitle}". Write actual lesson titles, not placeholders.
        
        Lesson 1: Write specific lesson title
        Lesson 2: Write specific lesson title
        Lesson 3: Write specific lesson title
        
        Make them educational and relevant to ${moduleTitle}.`;
        
        const { error, output } = await model.run(aiPrompt, {
          max_new_tokens: 200,
          min_new_tokens: 50,
          temperature: 0.5
        });
        
        const modelResponse = { error, output };
        
        let response = { success: false, generated_text: '' };
        
        if (modelResponse && typeof modelResponse === 'object') {
          if (!modelResponse.error && modelResponse.output) {
            response = { success: true, generated_text: modelResponse.output };
          }
        } else if (typeof modelResponse === 'string') {
          response = { success: true, generated_text: modelResponse };
        }

        if (response.success) {
          // Parse AI response into structured lessons
          const lessons = parseAILessons(response.generated_text || response.text);
          
          // Update the outline with AI-generated lessons
          setOutlines(prev => prev.map(outline => 
            outline.id === outlineId ? {
              ...outline,
              modules: outline.modules.map(module =>
                module.id === moduleId ? {
                  ...module,
                  lessons: lessons,
                  aiGenerated: true
                } : module
              )
            } : outline
          ));
        }
      } catch (error) {
        console.error('AI lesson generation failed:', error);
        alert('AI lesson generation failed. Please try again.');
      } finally {
        setGeneratingLessons(prev => {
          const newSet = new Set(prev);
          newSet.delete(lessonKey);
          return newSet;
        });
      }
      };

      // Use simple rate limiting instead of queue
      executeWithRateLimit(executeGeneration);
    };

    // Parse AI-generated lesson content
    const parseAILessons = (aiText) => {
      const lessons = [];
      const lines = aiText.split('\n').filter(line => line.trim());
      let currentLesson = null;
      
      lines.forEach((line, index) => {
        if (line.match(/^Lesson \d+:/i)) {
          if (currentLesson) lessons.push(currentLesson);
          currentLesson = {
            id: `lesson-${Date.now()}-${lessons.length + 1}`,
            title: line.replace(/^Lesson \d+:\s*/i, ''),
            objectives: [],
            topics: [],
            practice: '',
            aiGenerated: true
          };
        } else if (line.match(/^-\s*Objective:/i) && currentLesson) {
          currentLesson.objectives.push(line.replace(/^-\s*Objective:\s*/i, ''));
        } else if (line.match(/^-\s*Topics:/i) && currentLesson) {
          currentLesson.topics.push(line.replace(/^-\s*Topics:\s*/i, ''));
        } else if (line.match(/^-\s*Practice:/i) && currentLesson) {
          currentLesson.practice = line.replace(/^-\s*Practice:\s*/i, '');
        }
      });
      
      if (currentLesson) lessons.push(currentLesson);
      
      // Fallback if parsing fails
      if (lessons.length === 0) {
        return [
          {
            id: `lesson-${Date.now()}-1`,
            title: 'AI Generated Lesson Content',
            objectives: ['Learn key concepts'],
            topics: [aiText.substring(0, 100) + '...'],
            practice: 'Practice exercises will be provided',
            aiGenerated: true
          }
        ];
      }
      
      return lessons;
    };

    // Toggle module expansion (updated to handle outline-module keys)
    const toggleModule = (moduleKey) => {
      setExpandedModules(prev => {
        const newSet = new Set(prev);
        if (newSet.has(moduleKey)) {
          newSet.delete(moduleKey);
        } else {
          newSet.add(moduleKey);
        }
        return newSet;
      });
    };

    const deleteOutline = (id) => {
      setOutlines(outlines.filter(outline => outline.id !== id));
    };

    return (
      <div className="bg-gray-50 min-h-full">
        {/* Compact Header */}
        <div className="text-center py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" />
              AI Course Generator
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Create Courses with AI
            </h1>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Enter a topic and AI will generate a complete course structure.
            </p>
          </div>
        </div>

        {/* Compact Course Generator */}
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Compact Input Section */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h2 className="text-lg font-bold mb-4 text-center">What course would you like to create?</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-4 py-3 text-base rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/30 text-gray-800 placeholder-gray-500 shadow-md"
                    placeholder="Enter course topic (e.g., JavaScript, Digital Marketing...)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isGenerating && (titleInput || '').trim()) {
                        e.preventDefault();
                        generateCourseOutline(titleInput);
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => generateCourseOutline(titleInput)}
                  disabled={isGenerating || !(titleInput || '').trim()}
                  className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-semibold text-base shadow-md hover:shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      Generating Course...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Course with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Compact Generation Progress */}
            {isGenerating && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    AI is creating your course...
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Analyzing Topic</div>
                      <div className="text-gray-600 text-xs">Understanding requirements...</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Creating Structure</div>
                      <div className="text-gray-600 text-xs">Generating modules...</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Generated Courses */}
        {outlines.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Generated Courses</h2>
              <p className="text-sm text-gray-600">AI-generated course structures ready to use</p>
            </div>
            
            <div className="space-y-4">
              {outlines.map((outline, outlineIndex) => (
                <div key={`outline-${outline.id}-${outlineIndex}`} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  {/* Compact Course Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{outline.title}</h3>
                        <p className="text-blue-100 text-sm mb-2">{outline.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{outline.modules?.length || 0} modules</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Generated</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteOutline(outline.id)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Compact Course Modules */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {outline.modules?.map((module, moduleIndex) => (
                        <div key={`module-${module.id}-${moduleIndex}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {moduleIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-gray-800 mb-1">{module.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                              
                              {/* Compact Lessons */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {module.lessons?.map((lesson, lessonIndex) => (
                                  <div key={`lesson-${lesson.id}-${lessonIndex}`} className="bg-white rounded p-2 border border-gray-200 text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold">
                                        {lessonIndex + 1}
                                      </div>
                                      <span className="font-medium text-gray-800 truncate">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-green-600">
                                        <Check className="w-2 h-2" />
                                        <span>Ready</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setPreviewLesson(lesson);
                                          setShowLessonPreview(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        Preview
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Compact Course Actions */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button 
                        onClick={() => handleSaveCourse('PUBLISHED')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-medium text-sm flex items-center justify-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Empty State */}
        {outlines.length === 0 && !isGenerating && (
          <div className="max-w-2xl mx-auto px-4 text-center py-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Create Your Course?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Enter a topic above and AI will generate a complete course structure.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>AI modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Lesson content</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Ready to use</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Render outline tab content
  const renderOutlineTab = () => {
    return <OutlineGenerator />;
  };

  // Main render function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'outline':
        return renderOutlineTab();
      case 'images':
        return (
          <AIFeatureAccessProvider>
            <AIImageGenerator />
          </AIFeatureAccessProvider>
        );
      case 'summarize':
        return (
          <AIFeatureAccessProvider>
            <AISummarizationTool />
          </AIFeatureAccessProvider>
        );
      case 'qa':
        return (
          <AIFeatureAccessProvider>
            <AIQuestionAnswering />
          </AIFeatureAccessProvider>
        );
      default:
        return renderOutlineTab();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Course Creator</h2>
              <p className="text-gray-600">Create comprehensive courses with AI assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!tab.enabled}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
                  isActive
                    ? `text-${tab.color}-600 bg-white border-b-2 border-${tab.color}-600`
                    : tab.enabled
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {!tab.enabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                {selectedLesson.content ? (
                  <>
                    {selectedLesson.content.introduction && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">Introduction</h4>
                        <p className="text-blue-700">{selectedLesson.content.introduction}</p>
                      </div>
                    )}
                    
                    {selectedLesson.content.textExplanations && selectedLesson.content.textExplanations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Text Explanations</h4>
                        {selectedLesson.content.textExplanations.map((item, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded">
                            <h5 className="font-medium text-gray-800 mb-2">{item.concept}</h5>
                            <p className="text-gray-600">{item.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedLesson.content.examples && selectedLesson.content.examples.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-purple-800">Examples</h4>
                        {selectedLesson.content.examples.map((item, index) => (
                          <div key={index} className="bg-purple-50 border border-purple-200 p-4 rounded">
                            <h5 className="font-medium text-purple-800 mb-2">{item.title}</h5>
                            <p className="text-purple-700">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedLesson.content.media && selectedLesson.content.media.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-indigo-800">Media Resources</h4>
                        {selectedLesson.content.media.map((item, index) => (
                          <div key={index} className="bg-indigo-50 border border-indigo-200 p-4 rounded flex items-center">
                            <div className="mr-3">
                              {item.type === 'image' ? (
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-indigo-800 capitalize">{item.type}</span>
                              <p className="text-indigo-700 text-sm">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedLesson.content.activities && selectedLesson.content.activities.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-800">Activities</h4>
                        {selectedLesson.content.activities.map((item, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 p-4 rounded">
                            <div className="flex items-center mb-2">
                              <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full mr-2 capitalize">
                                {item.type}
                              </span>
                              <h5 className="font-medium text-orange-800">{item.title}</h5>
                            </div>
                            <p className="text-orange-700">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedLesson.content.keyTakeaways && selectedLesson.content.keyTakeaways.length > 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <h4 className="font-semibold text-yellow-800 mb-3">Key Takeaways</h4>
                        <ul className="space-y-2">
                          {selectedLesson.content.keyTakeaways.map((takeaway, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-yellow-700">{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedLesson.content.summary && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">Summary</h4>
                        <p className="text-green-700">{selectedLesson.content.summary}</p>
                      </div>
                    )}
                    
                    {/* Fallback for old format */}
                    {selectedLesson.content.mainContent && selectedLesson.content.mainContent.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Key Learning Points</h4>
                        {selectedLesson.content.mainContent.map((item, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded">
                            <h5 className="font-medium text-gray-800 mb-2">{index + 1}. {item.point}</h5>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Enhancement Buttons */}
                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Enhance This Lesson</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => generateLessonImages(selectedLesson)}
                          disabled={isGeneratingImage}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                        </button>
                        
                        <button
                          onClick={() => generateLessonQA(selectedLesson)}
                          disabled={isGeneratingQA}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {isGeneratingQA ? 'Generating...' : 'Generate Q&A'}
                        </button>
                        
                        <button
                          onClick={() => generateLessonSummary(selectedLesson)}
                          disabled={isGeneratingSummary}
                          className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4" />
                          {isGeneratingSummary ? 'Generating...' : 'Enhance Summary'}
                        </button>
                        
                        <button
                          onClick={() => generateLessonContent(selectedLesson)}
                          disabled={isGeneratingLesson}
                          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          <Wand2 className="w-4 h-4" />
                          {isGeneratingLesson ? 'Regenerating...' : 'Regenerate Content'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No content available for this lesson yet.</p>
                    <button
                      onClick={() => generateLessonContent(selectedLesson)}
                      disabled={isGeneratingLesson}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4" />
                      {isGeneratingLesson ? 'Generating...' : 'Generate Lesson Content'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Lesson Preview Modal - Disabled */}
      {previewLesson && showLessonPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Lesson Preview Disabled</h3>
            <p className="text-gray-600 mb-4">Lesson preview functionality has been removed.</p>
            <button 
              onClick={() => {
                setShowLessonPreview(false);
                setPreviewLesson(null);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICourseWorkspace;
