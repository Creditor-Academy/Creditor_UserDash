// AI Course Service for handling AI-powered course creation
import { getAuthHeader } from './authHeader';
import bytezAPI from './bytezAPI';
import AIServiceRouter from './AIServiceRouter';

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
    
    // Use AIServiceRouter for better text generation
    const aiServiceRouter = new AIServiceRouter();
    
    // Create a detailed prompt for course structure generation
    const prompt = `Create a comprehensive course structure for "${courseData.title}".
    
    Subject: ${courseData.subject || courseData.title}
    Description: ${courseData.description || 'No description provided'}
    Target Audience: ${courseData.targetAudience || 'General learners'}
    Difficulty: ${courseData.difficulty || 'Intermediate'}
    Duration: ${courseData.duration || '4 weeks'}
    Learning Objectives: ${courseData.learningObjectives || 'Not specified'}
    
    Generate exactly 4 modules with:
    1. Module title
    2. Detailed description (2-3 sentences)
    3. 3-5 lessons per module with titles and brief descriptions
    
    Format the response as valid JSON with this structure:
    {
      "title": "Course Title",
      "subject": "Course Subject",
      "modules": [
        {
          "id": 1,
          "title": "Module Title",
          "description": "Module description",
          "lessons": [
            {
              "id": 1,
              "title": "Lesson Title",
              "description": "Lesson description",
              "duration": "15 min"
            }
          ]
        }
      ]
    }
    
    Only return the JSON object, no other text.`;
    
    // Try to generate course structure with OpenAI GPT-4o first
    let courseStructure;
    try {
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.7
      });
      
      // Try to parse the JSON response
      try {
        courseStructure = JSON.parse(response);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          courseStructure = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from response');
        }
      }
    } catch (openAIError) {
      console.warn('OpenAI generation failed, falling back to Bytez:', openAIError.message);
      
      // Fallback to Bytez API
      const bytezResponse = await bytezAPI.generateCourseOutline({
        title: courseData.title,
        subject: courseData.subject,
        description: courseData.description,
        targetAudience: courseData.targetAudience,
        difficulty: courseData.difficulty,
        duration: courseData.duration,
        learningObjectives: courseData.learningObjectives
      });
      
      // Parse and structure the response
      courseStructure = {
        title: courseData.title,
        subject: courseData.subject,
        modules: []
      };
      
      // Try to parse structured JSON response
      try {
        if (bytezResponse.generated_text || bytezResponse.text) {
          const content = bytezResponse.generated_text || bytezResponse.text;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.modules) {
              courseStructure.modules = parsed.modules;
            }
          }
        }
      } catch (parseError) {
        console.log('Using fallback course structure');
      }
    }

    // Ensure minimum 3-4 modules with detailed lessons for first 1-2 modules
    if (!courseStructure.modules || courseStructure.modules.length === 0) {
      courseStructure.modules = generateFallbackModules(courseData);
    }

    // Enhance first 1-2 modules with detailed lessons
    courseStructure.modules = await enhanceModulesWithLessons(courseStructure.modules, courseData);

    return {
      success: true,
      data: courseStructure
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
    
    // Use AIServiceRouter for better image generation
    const aiServiceRouter = new AIServiceRouter();
    
    // Try to generate image with Stability AI or DALL·E first
    let imageUrl;
    try {
      imageUrl = await aiServiceRouter.generateImage(prompt, {
        style: options.style || 'realistic',
        size: options.size || '1024x1024',
        ...options
      });
    } catch (imageError) {
      console.warn('Primary image generation failed, falling back to Bytez:', imageError.message);
      
      // Fallback to Bytez API
      try {
        const response = await bytezAPI.generateImage(prompt, {
          style: options.style || 'realistic',
          size: options.size || '1024x1024',
          ...options
        });
        
        imageUrl = response.images ? response.images[0] : response.url;
      } catch (bytezError) {
        console.error('Bytez image generation also failed:', bytezError.message);
        throw new Error(`Failed to generate image with all available providers. Primary error: ${imageError.message}. Bytez error: ${bytezError.message}`);
      }
    }
    
    return {
      success: true,
      data: {
        url: imageUrl,
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
    
    // Use AIServiceRouter for better text summarization
    const aiServiceRouter = new AIServiceRouter();
    
    // Try to summarize with OpenAI GPT-4o first
    let summary;
    try {
      const prompt = `Summarize the following content in ${options.length || 'medium'} length and format as ${options.type || 'bullet'}:
      
      ${content}`;
      
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 300,
        temperature: 0.3
      });
      
      summary = response;
    } catch (summarizeError) {
      console.warn('OpenAI summarization failed, falling back to Bytez:', summarizeError.message);
      
      // Fallback to Bytez API
      const response = await bytezAPI.summarizeText(content, {
        length: options.length || 'medium',
        type: options.type || 'bullet',
        ...options
      });
      
      summary = response.summary;
    }
    
    return {
      success: true,
      data: {
        summary: summary,
        originalLength: content.length,
        summaryLength: summary.length,
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
    
    // Use AIServiceRouter for better question answering
    const aiServiceRouter = new AIServiceRouter();
    
    // Try to answer with OpenAI GPT-4o first
    let answer;
    try {
      const prompt = `Answer the following question based on the provided context:
      
      Question: ${question}
      
      Context: ${context || 'No specific context provided'}
      
      Provide a clear, educational answer that would be helpful for a student learning this topic.`;
      
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 500,
        temperature: 0.5
      });
      
      answer = response;
    } catch (qaError) {
      console.warn('OpenAI QA failed, falling back to Bytez:', qaError.message);
      
      // Fallback to Bytez API
      const response = await bytezAPI.answerQuestion(question, context);
      
      answer = response.answer;
    }
    
    return {
      success: true,
      data: {
        question: question,
        answer: answer,
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
 * Generate a small set of Q&A pairs for a lesson/topic
 * @param {string} topic - Topic or lesson title
 * @param {number} count - Number of Q&A pairs
 * @param {string} context - Optional extra context
 * @returns {Promise<{success:boolean, data:{qa:Array<{question:string,answer:string}>}}>} Q&A pairs
 */
export async function generateQAPairs(topic, count = 3, context = '') {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const prompt = `Create ${count} high-quality quiz Q&A pairs for the topic "${topic}".
${context ? `Context: ${context}` : ''}

Return valid JSON only in this format:
{
  "qa": [
    {"question": "...", "answer": "..."}
  ]
}`;

    let qa = [];
    try {
      const response = await aiServiceRouter.generateText(prompt, {
        model: 'gpt-4o',
        maxTokens: 600,
        temperature: 0.5
      });

      const jsonMatch = typeof response === 'string' ? response.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
      qa = Array.isArray(parsed.qa) ? parsed.qa : [];
    } catch (primaryError) {
      console.warn('Primary QA generation failed, using simple fallback:', primaryError.message);
      // Simple fallback without external API
      qa = Array.from({ length: count }).map((_, i) => ({
        question: `What is a key concept about ${topic}? (${i + 1})`,
        answer: `A fundamental idea related to ${topic}.`
      }));
    }

    // Normalize
    qa = qa
      .filter(p => p && p.question && p.answer)
      .map(p => ({ question: String(p.question), answer: String(p.answer) }));

    return { success: true, data: { qa } };
  } catch (error) {
    console.error('❌ QA generation failed:', error);
    return { success: false, data: { qa: [] }, error: error.message };
  }
}

/**
 * Generate a structured lesson from a topic/prompt
 * @param {string} prompt - Lesson topic or prompt
 * @param {Object} options - { context?: string, level?: string }
 * @returns {Promise<{success:boolean, data:Object}>}
 */
export async function generateLessonFromPrompt(prompt, options = {}) {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const sysPrompt = `Create a structured lesson as JSON with keys: introduction (string), mainContent (array of strings), examples (array of {title, description}), keyTakeaways (array of strings), summary (string). Keep concise and instructional.`;
    const userPrompt = `Topic: ${prompt}${options.context ? `\nContext: ${options.context}` : ''}\nLevel: ${options.level || 'beginner'}`;

    let lesson;
    try {
      const response = await aiServiceRouter.generateStructured(sysPrompt, userPrompt);
      lesson = response;
    } catch {
      const text = await aiServiceRouter.generateText(`${sysPrompt}\n\n${userPrompt}`, { model: 'gpt-4o', maxTokens: 800, temperature: 0.6 });
      const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      lesson = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    }

    // Normalize fields
    lesson = lesson || {};
    return {
      success: true,
      data: {
        introduction: lesson.introduction || '',
        mainContent: Array.isArray(lesson.mainContent) ? lesson.mainContent : [],
        examples: Array.isArray(lesson.examples) ? lesson.examples : [],
        keyTakeaways: Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [],
        summary: lesson.summary || ''
      }
    };
  } catch (error) {
    console.error('❌ Prompt-to-lesson generation failed:', error);
    return { success: false, data: { introduction: '', mainContent: [], examples: [], keyTakeaways: [], summary: '' }, error: error.message };
  }
}

/**
 * Generate MCQ assessments for a topic
 * Returns normalized questions for bulk upload API
 */
export async function generateAssessmentQuestions(topic, count = 5, context = '') {
  try {
    const aiServiceRouter = new AIServiceRouter();
    const prompt = `Create ${count} multiple-choice questions (MCQs) for the topic "${topic}"${context ? ` with context: ${context}` : ''}. Return JSON {"questions": [{"question": "...", "options": ["A","B","C","D"], "answerIndex": 0}]}`;
    let questions = [];
    try {
      const text = await aiServiceRouter.generateText(prompt, { model: 'gpt-4o', maxTokens: 1000, temperature: 0.6 });
      const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch (e) {
      console.warn('Primary assessment generation failed, using fallback:', e.message);
      questions = Array.from({ length: count }).map((_, i) => ({
        question: `Which statement about ${topic} is correct? (${i + 1})`,
        options: [
          `${topic} relates to concept A`,
          `${topic} relates to concept B`,
          `${topic} relates to concept C`,
          `${topic} relates to concept D`
        ],
        answerIndex: 0
      }));
    }
    // Normalize for bulk upload format
    const normalized = questions.map((q, idx) => ({
      question_text: String(q.question),
      options: (q.options || []).map(String),
      correct_option_index: Number.isInteger(q.answerIndex) ? q.answerIndex : 0,
      order: idx + 1,
      difficulty: options?.level || 'EASY'
    }));
    return { success: true, data: { questions: normalized } };
  } catch (error) {
    console.error('❌ Assessment generation failed:', error);
    return { success: false, data: { questions: [] }, error: error.message };
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

/**
 * Save AI-generated lessons to backend
 * @param {Object} lessonData - Lesson data including course title and lessons array
 * @returns {Promise<Object>} Save result
 */
export async function saveAILessons(lessonData) {
  try {
    console.log('💾 Saving AI-generated lessons:', lessonData.courseTitle);
    
    const response = await fetch(`${API_BASE}/api/ai/lessons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData)
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
    console.error('❌ Failed to save AI lessons:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get AI-generated lessons for a course
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Lessons data
 */
export async function getAILessons(courseId) {
  try {
    console.log('📚 Retrieving AI-generated lessons for course ID:', courseId);
    
    const response = await fetch(`${API_BASE}/api/ai/lessons/${courseId}`, {
      method: 'GET',
      headers: getAuthHeaders()
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
    console.error('❌ Failed to retrieve AI lessons:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all AI-generated courses
 * @returns {Promise<Object>} Courses data
 */
export async function getAICourses() {
  try {
    console.log('📚 Retrieving all AI-generated courses');
    
    const response = await fetch(`${API_BASE}/api/ai/courses`, {
      method: 'GET',
      headers: getAuthHeaders()
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
    console.error('❌ Failed to retrieve AI courses:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Mock AI Course Service for demonstration purposes
// In a real implementation, this would integrate with actual AI services

class AICourseService {
  async generateCourseOutline(courseData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response - in a real implementation, this would call an AI service
    const mockOutline = {
      course_title: courseData.title || 'Untitled Course',
      modules: [
        {
          module_title: 'Introduction to ' + (courseData.subject || 'the subject'),
          lesson: {
            lesson_title: 'Getting Started',
            lesson_intro: 'An introduction to the fundamental concepts',
            lesson_content: [
              { subtopic: 'Key Concepts', content: 'Understanding the basic principles' },
              { subtopic: 'Practical Applications', content: 'Real-world examples and use cases' }
            ],
            summary: 'This lesson provides a foundation for understanding the subject matter.'
          }
        },
        {
          module_title: 'Advanced ' + (courseData.subject || 'Topics'),
          lesson: {
            lesson_title: 'Deep Dive',
            lesson_intro: 'Exploring advanced concepts and techniques',
            lesson_content: [
              { subtopic: 'Advanced Techniques', content: 'In-depth exploration of complex topics' },
              { subtopic: 'Best Practices', content: 'Industry-standard approaches and methodologies' }
            ],
            summary: 'This lesson builds on the foundation to explore more complex topics.'
          }
        }
      ]
    };
    
    return {
      success: true,
      data: mockOutline
    };
  }
  
  async generateCourseImage(prompt, options = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - in a real implementation, this would call an image generation service
    return {
      success: true,
      data: {
        url: 'https://placehold.co/600x400/cccccc/ffffff?text=AI+Generated+Image',
        prompt: prompt,
        style: options.style || 'realistic'
      }
    };
  }
  
  async summarizeContent(content, options = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock response - in a real implementation, this would call a summarization service
    return {
      success: true,
      data: {
        summary: 'This is a summarized version of the provided content. In a real implementation, this would be generated by an AI summarization service.',
        originalLength: content.length,
        summaryLength: 100,
        type: options.type || 'bullet'
      }
    };
  }
}

const aiCourseService = new AICourseService();
export default aiCourseService;