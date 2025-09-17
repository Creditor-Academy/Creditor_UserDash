// AI Course Service for handling AI-powered course creation
import { getAuthHeader } from './authHeader';
import bytezAPI from './bytezAPI';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
};

/**
 * Generate AI course outline with modules and lessons
 * @param {Object} courseData - Course creation data
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateAICourseOutline(courseData) {
  try {
    console.log('🤖 Generating AI course outline for:', courseData.title);
    
    // Use Bytez API to generate comprehensive course structure
    const response = await bytezAPI.generateCourseOutline({
      title: courseData.title,
      subject: courseData.subject,
      description: courseData.description,
      targetAudience: courseData.targetAudience,
      difficulty: courseData.difficulty,
      duration: courseData.duration
    });

    // Parse and structure the response
    let courseOutline = {
      title: courseData.title,
      subject: courseData.subject,
      modules: []
    };

    // Try to parse structured JSON response
    try {
      if (response.generated_text || response.text) {
        const content = response.generated_text || response.text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.modules) {
            courseOutline.modules = parsed.modules;
          }
        }
      }
    } catch (parseError) {
      console.log('Using fallback course structure');
    }

    // Ensure minimum 3-4 modules with detailed lessons for first 1-2 modules
    if (courseOutline.modules.length === 0) {
      courseOutline.modules = generateFallbackModules(courseData);
    }

    // Enhance first 1-2 modules with detailed lessons
    courseOutline.modules = await enhanceModulesWithLessons(courseOutline.modules, courseData);

    return {
      success: true,
      data: courseOutline
    };

  } catch (error) {
    console.error('❌ AI course outline generation failed:', error);
    
    // Return fallback structure
    return {
      success: false,
      data: {
        title: courseData.title,
        subject: courseData.subject,
        modules: generateFallbackModules(courseData)
      },
      error: error.message
    };
  }
}

/**
 * Generate fallback course modules structure
 */
function generateFallbackModules(courseData) {
  const subject = courseData.subject || courseData.title;
  
  return [
    {
      id: 1,
      title: `Introduction to ${subject}`,
      description: `Foundational concepts and overview of ${subject}`,
      lessons: [
        {
          id: 1,
          title: `What is ${subject}?`,
          description: `Understanding the basics and core concepts`,
          content: '',
          duration: '15 min'
        },
        {
          id: 2,
          title: `Why Learn ${subject}?`,
          description: `Benefits and real-world applications`,
          content: '',
          duration: '10 min'
        },
        {
          id: 3,
          title: 'Getting Started',
          description: 'Setting up your learning environment',
          content: '',
          duration: '20 min'
        }
      ]
    },
    {
      id: 2,
      title: `${subject} Fundamentals`,
      description: `Core principles and essential knowledge`,
      lessons: [
        {
          id: 4,
          title: 'Key Concepts',
          description: 'Essential terminology and principles',
          content: '',
          duration: '25 min'
        },
        {
          id: 5,
          title: 'Basic Techniques',
          description: 'Fundamental methods and approaches',
          content: '',
          duration: '30 min'
        }
      ]
    },
    {
      id: 3,
      title: `Practical ${subject}`,
      description: `Hands-on experience and real-world applications`,
      lessons: []
    },
    {
      id: 4,
      title: `Advanced ${subject}`,
      description: `Expert-level concepts and advanced techniques`,
      lessons: []
    }
  ];
}

/**
 * Enhance modules with detailed lessons using AI
 */
async function enhanceModulesWithLessons(modules, courseData) {
  try {
    // Enhance first 2 modules with detailed lessons
    for (let i = 0; i < Math.min(2, modules.length); i++) {
      const module = modules[i];
      
      if (!module.lessons || module.lessons.length === 0) {
        // Generate lessons for this module
        const lessonResponse = await bytezAPI.generateTopicCurriculum(
          `${module.title} - ${courseData.subject}`,
          courseData.difficulty || 'intermediate'
        );
        
        if (lessonResponse.curriculum) {
          // Parse lessons from curriculum response
          module.lessons = parseLessonsFromCurriculum(lessonResponse.curriculum, module.id);
        }
      }
    }
    
    return modules;
  } catch (error) {
    console.warn('Could not enhance modules with AI lessons:', error);
    return modules;
  }
}

/**
 * Parse lessons from curriculum text
 */
function parseLessonsFromCurriculum(curriculum, moduleId) {
  const lessons = [];
  const lines = curriculum.split('\n').filter(line => line.trim());
  
  let lessonId = (moduleId - 1) * 10 + 1;
  
  for (const line of lines) {
    if (line.includes('lesson') || line.includes('topic') || line.includes('-')) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 5) {
        lessons.push({
          id: lessonId++,
          title: cleanLine,
          description: `Learn about ${cleanLine.toLowerCase()}`,
          content: '',
          duration: '20 min'
        });
      }
    }
  }
  
  // Ensure at least 3 lessons per module
  while (lessons.length < 3) {
    lessons.push({
      id: lessonId++,
      title: `Lesson ${lessons.length + 1}`,
      description: 'Additional learning content',
      content: '',
      duration: '15 min'
    });
  }
  
  return lessons.slice(0, 5); // Max 5 lessons per module
}

/**
 * Generate AI images for course content
 * @param {string} prompt - Image generation prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated image data
 */
export async function generateCourseImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating course image:', prompt);
    
    const response = await bytezAPI.generateImage(prompt, {
      style: options.style || 'realistic',
      size: options.size || '1024x1024',
      ...options
    });
    
    return {
      success: true,
      data: {
        url: response.url,
        prompt: prompt,
        style: options.style,
        size: options.size,
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Course image generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Summarize content for course lessons
 * @param {string} content - Content to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Object>} Summary data
 */
export async function summarizeContent(content, options = {}) {
  try {
    console.log('📝 Summarizing content for course...');
    
    const response = await bytezAPI.summarizeText(content, {
      length: options.length || 'medium',
      type: options.type || 'bullet',
      ...options
    });
    
    return {
      success: true,
      data: {
        summary: response.summary,
        originalLength: content.length,
        summaryLength: response.summary.length,
        type: options.type,
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Content summarization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search and answer questions for course content
 * @param {string} question - Question to answer
 * @param {string} context - Optional context
 * @returns {Promise<Object>} Answer data
 */
export async function searchCourseContent(question, context = '') {
  try {
    console.log('🔍 Searching course content:', question);
    
    const response = await bytezAPI.answerQuestion(question, context);
    
    return {
      success: true,
      data: {
        question: question,
        answer: response.answer,
        context: context,
        type: 'concept', // Default type
        difficulty: 'Intermediate',
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Course content search failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save AI-generated course to backend
 * @param {Object} courseData - Complete course data
 * @returns {Promise<Object>} Save result
 */
export async function saveAICourse(courseData) {
  try {
    console.log('💾 Saving AI-generated course:', courseData.title);
    
    const response = await fetch(`${API_BASE}/api/ai/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...courseData,
        isAIGenerated: true,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          bytezModelsUsed: ['course-outline', 'image-generation', 'summarization'],
          generationMethod: 'langchain-bytez'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Failed to save AI course:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  generateAICourseOutline,
  generateCourseImage,
  summarizeContent,
  searchCourseContent,
  saveAICourse
};
