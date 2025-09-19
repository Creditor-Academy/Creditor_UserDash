// AI-powered course creation routes
const express = require('express');
const router = express.Router();

// Import the actual course routes to access the database functions
const courseRoutesModule = require('./courseRoutes');

// Use Bytez SDK for AI generation
const Bytez = require('bytez.js');

// Simple auth middleware (or remove auth from routes that don't need it)
const auth = (req, res, next) => {
  // For now, just pass through - implement proper auth later
  next();
};

// Initialize Bytez SDK
let bytezSDK = null;
if (process.env.BYTEZ_API_KEY) {
  try {
    bytezSDK = new Bytez(process.env.BYTEZ_API_KEY);
  } catch (error) {
    console.warn('Failed to initialize Bytez SDK:', error);
  }
}

// POST /api/ai/generate-content - Generate AI course content using Bytez API
router.post('/generate-content', async (req, res) => {
  try {
    const { title, description, subject, difficulty } = req.body;
    
    console.log('🤖 Generating AI content for:', title);
    
    const prompt = `You are an AI course generator. 
Generate content in JSON format only, no extra text. 

Requirements:
1. Create a course outline with 2 modules for "${title}". 
2. Each module should contain 1 lesson. 
3. Each lesson must include:
   - "lesson_title"
   - "lesson_intro" (short introduction paragraph)
   - "lesson_content" (array of subtopics, each with "subtopic" and "content")
   - "examples" (array of 1–2 short examples, if relevant)
   - "summary" (a short recap)

Course Details:
- Title: ${title}
- Description: ${description}
- Subject: ${subject || 'General'}
- Difficulty: ${difficulty || 'intermediate'}

Output JSON format:
{
  "course_name": "${title}",
  "modules": [
    {
      "module_title": "Module 1 Title",
      "module_description": "Brief description",
      "lessons": [
        {
          "lesson_title": "Lesson Title",
          "lesson_intro": "Introduction text",
          "lesson_content": [
            {"subtopic": "Subtopic 1", "content": "Details"},
            {"subtopic": "Subtopic 2", "content": "Details"}
          ],
          "examples": ["Example 1", "Example 2"],
          "summary": "Key takeaways"
        }
      ]
    },
    {
      "module_title": "Module 2 Title", 
      "module_description": "Brief description",
      "lessons": [
        {
          "lesson_title": "Lesson Title",
          "lesson_intro": "Introduction text",
          "lesson_content": [
            {"subtopic": "Subtopic 1", "content": "Details"},
            {"subtopic": "Subtopic 2", "content": "Details"}
          ],
          "examples": ["Example 1", "Example 2"],
          "summary": "Key takeaways"
        }
      ]
    }
  ]
}`;

    // Try Bytez API if available
    if (process.env.BYTEZ_API_KEY) {
      try {
        const response = await fetch('https://api.bytez.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BYTEZ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert course creator. Generate structured, educational content in the exact JSON format requested.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 2000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const result = await response.json();
          const aiContent = result.choices[0].message.content;
          
          // Parse AI response
          const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '').trim();
          const parsedContent = JSON.parse(cleanContent);
          
          // Transform to backend format
          const transformedContent = {
            modules: parsedContent.modules.map((module, index) => ({
              id: index + 1,
              title: module.module_title,
              description: module.module_description,
              lessons: module.lessons.map((lesson, lessonIndex) => ({
                id: lessonIndex + 1,
                title: lesson.lesson_title,
                intro: lesson.lesson_intro,
                subtopics: lesson.lesson_content ? 
                  lesson.lesson_content.map(item => `${item.subtopic}: ${item.content}`) :
                  ['Core concepts and definitions', 'Practical applications'],
                examples: lesson.examples || [],
                summary: lesson.summary,
                duration: '15 min'
              }))
            }))
          };

          return res.json({
            success: true,
            data: transformedContent,
            source: 'ai'
          });
        }
      } catch (aiError) {
        console.warn('AI generation failed:', aiError.message);
      }
    }

    // Fallback to local generation
    const fallbackContent = generateFallbackStructure(title, subject || 'General', difficulty || 'intermediate');
    
    res.json({
      success: true,
      data: fallbackContent,
      source: 'fallback'
    });
    
  } catch (error) {
    console.error('❌ AI content generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI content'
    });
  }
});

// POST /api/ai/create-course - Generate initial course modules and lessons
router.post('/create-course', async (req, res) => {
  try {
    const { title, subject, description, targetAudience, difficulty, duration, learningObjectives } = req.body;
    
    console.log('🤖 Generating AI course:', title);
    
    // Create comprehensive prompt for course generation
    const prompt = `Create a comprehensive course outline for "${title}" in the ${subject} domain.
    
Course Details:
- Subject: ${subject}
- Description: ${description}
- Target Audience: ${targetAudience}
- Difficulty: ${difficulty}
- Duration: ${duration}
- Learning Objectives: ${learningObjectives}

Generate a JSON structure with exactly 4 modules, each containing 3-5 lessons.
Each module should have:
- id (number)
- title (string)
- description (string)  
- lessons (array with 3-5 lesson objects)

Each lesson should have:
- id (number)
- title (string)
- intro (string, brief introduction)
- subtopics (array of 3-4 key points)
- summary (string, brief conclusion)
- duration (string, e.g., "15 min")

Keep content concise for free model usage.
Return only valid JSON without any markdown formatting.`;

    // Try AI generation first, fallback if it fails
    let courseStructure;
    
    if (bytezSDK) {
      try {
        console.log('Attempting AI generation with Bytez...');
        
        const model = bytezSDK.model("google/flan-t5-base");
        await model.create();
        
        const aiPrompt = `You are an AI course generator. 
Generate content in JSON format only, no extra text. 

Requirements:
1. Create a course outline with 4 modules. 
2. Each module should contain 3-5 lessons. 
3. Each lesson must include:
   - "lesson_title"
   - "lesson_intro" (short introduction paragraph)
   - "lesson_content" (array of subtopics, each with "subtopic" and "content")
   - "examples" (array of 1–2 short examples, if relevant)
   - "summary" (a short recap)

Course Details:
- Title: ${title}
- Subject: ${subject || 'General'}
- Description: ${description || 'No description provided'}
- Target Audience: ${targetAudience || 'General learners'}
- Difficulty: ${difficulty || 'intermediate'}
- Learning Objectives: ${learningObjectives || 'Not specified'}

Output JSON format:
{
  "course_name": "${title}",
  "modules": [
    {
      "module_title": "Module 1 Title",
      "module_description": "Brief description",
      "lessons": [
        {
          "lesson_title": "Lesson Title",
          "lesson_intro": "Introduction text",
          "lesson_content": [
            {"subtopic": "Subtopic 1", "content": "Details"},
            {"subtopic": "Subtopic 2", "content": "Details"}
          ],
          "examples": ["Example 1", "Example 2"],
          "summary": "Key takeaways"
        }
      ]
    }
  ]
}`;

        const { error, output } = await model.run(aiPrompt, {
          max_new_tokens: 1000,
          min_new_tokens: 200,
          temperature: 0.7
        });
        
        if (!error && output) {
          try {
            // Try to parse AI response
            const cleanOutput = output.replace(/```json\n?|\n?```/g, '').trim();
            const aiResult = JSON.parse(cleanOutput);
            
            if (aiResult.modules && aiResult.modules.length > 0) {
              // Transform new format to existing structure
              courseStructure = {
                modules: aiResult.modules.map((module, index) => ({
                  id: index + 1,
                  title: module.module_title,
                  description: module.module_description,
                  lessons: module.lessons.map((lesson, lessonIndex) => ({
                    id: lessonIndex + 1,
                    title: lesson.lesson_title,
                    intro: lesson.lesson_intro,
                    subtopics: lesson.lesson_content ? 
                      lesson.lesson_content.map(item => `${item.subtopic}: ${item.content}`) :
                      ['Core concepts and definitions', 'Practical applications'],
                    examples: lesson.examples || [],
                    summary: lesson.summary,
                    duration: '15 min'
                  }))
                }))
              };
              console.log('✅ Successfully generated course with AI');
            } else {
              throw new Error('Invalid AI response structure');
            }
          } catch (parseError) {
            console.warn('Failed to parse AI response, using fallback');
            courseStructure = generateFallbackStructure(title, subject, difficulty);
          }
        } else {
          throw new Error(error || 'AI generation failed');
        }
      } catch (aiError) {
        console.warn('AI generation failed:', aiError.message);
        courseStructure = generateFallbackStructure(title, subject, difficulty);
      }
    } else {
      console.log('Bytez SDK not available, using fallback');
      courseStructure = generateFallbackStructure(title, subject, difficulty);
    }
    
    res.json({
      success: true,
      data: {
        title,
        subject,
        description,
        modules: courseStructure.modules,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiModel: 'microsoft/Phi-3-mini-4k-instruct',
          method: 'langchain-bytez'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ AI course generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate course outline',
      fallback: generateFallbackStructure(req.body.title, req.body.subject, req.body.difficulty)
    });
  }
});

// POST /api/ai/generate-image - Text-to-image generation
router.post('/generate-image', auth, async (req, res) => {
  try {
    const { prompt, style = 'realistic', size = '1024x1024' } = req.body;
    
    console.log('🎨 Generating image:', prompt);
    
    // Use Bytez image generation models
    const imageModels = [
      'dreamlike-art/dreamlike-photoreal-2.0',
      'prompthero/openjourney-v4',
      'SG161222/Realistic_Vision_V3.0_VAE'
    ];
    
    let imageUrl = null;
    let usedModel = null;
    
    for (const modelId of imageModels) {
      try {
        const model = bytezSDK.model(modelId);
        await model.create();
        
        const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
        const { error, output } = await model.run(stylePrompt, {
          max_tokens: 1,
          temperature: 0.7
        });
        
        if (!error && output) {
          imageUrl = output;
          usedModel = modelId;
          break;
        }
      } catch (modelError) {
        console.warn(`Model ${modelId} failed:`, modelError.message);
        continue;
      }
    }
    
    if (!imageUrl) {
      throw new Error('All image generation models failed');
    }
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        prompt,
        style,
        size,
        model: usedModel,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate image'
    });
  }
});

// POST /api/ai/summarize - Content summarization
router.post('/summarize', auth, async (req, res) => {
  try {
    const { content, length = 'medium', type = 'bullet' } = req.body;
    
    console.log('📝 Summarizing content...');
    
    const lengthMap = {
      'short': '2-3 sentences',
      'medium': '1 paragraph (4-6 sentences)',
      'long': '2-3 paragraphs'
    };
    
    const typeMap = {
      'bullet': 'bullet points',
      'paragraph': 'flowing paragraph format',
      'outline': 'structured outline format'
    };
    
    const prompt = `Summarize the following content in ${lengthMap[length]} using ${typeMap[type]}:

${content}

Focus on key learning points and actionable insights that would be valuable for course content.`;

    // Use Bytez SDK for summarization
    const model = bytezSDK.model('facebook/bart-large-cnn');
    await model.create();
    
    const { error, output } = await model.run(prompt, {
      max_new_tokens: 300,
      temperature: 0.3
    });
    
    if (error) {
      throw new Error(error);
    }
    
    const response = { content: output };
    
    res.json({
      success: true,
      data: {
        summary: response.content,
        originalLength: content.length,
        summaryLength: response.content.length,
        type,
        length,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Summarization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize content'
    });
  }
});

// POST /api/ai/lessons - Save AI-generated lessons to actual course database
router.post('/lessons', async (req, res) => {
  try {
    // This route is now deprecated - we're creating lessons directly through the course routes
    res.json({
      success: true,
      message: 'Lessons should be created through the course creation process',
      data: {}
    });
  } catch (error) {
    console.error('❌ Failed to save AI lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save lessons'
    });
  }
});

// GET /api/ai/lessons/:courseId - Get lessons for a course (placeholder)
router.get('/lessons/:courseId', async (req, res) => {
  try {
    // This route is now deprecated - we're getting lessons through the course routes
    res.json({
      success: true,
      data: {
        lessonsCount: 0,
        lessons: []
      }
    });
  } catch (error) {
    console.error('❌ Failed to retrieve lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve lessons'
    });
  }
});

// GET /api/ai/courses - Get all courses (placeholder)
router.get('/courses', async (req, res) => {
  try {
    // This route is now deprecated - we're getting courses through the course routes
    res.json({
      success: true,
      data: {
        coursesCount: 0,
        courses: []
      }
    });
  } catch (error) {
    console.error('❌ Failed to retrieve courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve courses'
    });
  }
});

// POST /api/ai/search - Content Q&A search
router.post('/search', auth, async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    
    console.log('🔍 Answering question:', question);
    
    const prompt = context 
      ? `Context: ${context}

Question: ${question}

Provide a comprehensive, educational answer that can be used directly in course content.`
      : `Question: ${question}\n\nProvide a comprehensive, educational answer that can be used directly in course content.`;
    
    // Use Bytez SDK for Q&A
    const model = bytezSDK.model('deepset/roberta-base-squad2');
    await model.create();
    
    const { error, output } = await model.run(prompt, {
      max_new_tokens: 500,
      temperature: 0.5
    });
    
    if (error) {
      throw new Error(error);
    }
    
    const response = { content: output };
    
    // Determine content type and difficulty based on question
    const contentType = determineContentType(question);
    const difficulty = determineDifficulty(question);
    
    res.json({
      success: true,
      data: {
        question,
        answer: response.content,
        context,
        type: contentType,
        difficulty,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Q&A search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to answer question'
    });
  }
});

// POST /api/ai/courses - Save AI-generated course and integrate with actual course database
router.post('/courses', async (req, res) => {
  console.log('AI courses route hit with body:', req.body);
  try {
    const courseData = req.body;
    console.log('💾 Saving AI-generated course:', courseData.title);
    
    // Create the course using the same pattern as manual course creation
    const newCourseData = {
      title: courseData.title,
      description: courseData.description,
      subject: courseData.subject,
      targetAudience: courseData.targetAudience,
      estimated_duration: courseData.duration || '4 weeks',
      course_level: (courseData.difficulty || 'intermediate').toUpperCase(),
      courseType: 'OPEN',
      lockModules: 'UNLOCKED',
      price: '0', // Default price for AI courses
      requireFinalQuiz: true,
      thumbnail: courseData.thumbnail || null,
      learning_objectives: courseData.objectives ? courseData.objectives.split('\n').filter(Boolean) : [],
      isHidden: false,
      course_status: 'DRAFT'
    };
    
    // Initialize storage if needed
    if (!courseRoutesModule.courses) {
      console.log('Initializing courses array');
      courseRoutesModule.courses = [];
    }
    if (!courseRoutesModule.nextCourseId) {
      console.log('Initializing nextCourseId');
      courseRoutesModule.nextCourseId = 1;
    }
    
    const course = {
      id: courseRoutesModule.nextCourseId++,
      ...newCourseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    courseRoutesModule.courses.push(course);
    console.log('✅ Course created successfully with ID:', course.id);
    const courseId = course.id;
    
    // If we have AI-generated modules, create them using the same pattern as manual module creation
    if (courseData.modules && courseData.modules.length > 0) {
      console.log('Creating modules for course:', courseId);
      
      // Initialize storage if needed
      if (!courseRoutesModule.modules) {
        console.log('Initializing modules array');
        courseRoutesModule.modules = [];
      }
      if (!courseRoutesModule.nextModuleId) {
        console.log('Initializing nextModuleId');
        courseRoutesModule.nextModuleId = 1;
      }
      
      // Initialize lesson storage if needed
      if (!courseRoutesModule.lessons) {
        console.log('Initializing lessons array');
        courseRoutesModule.lessons = [];
      }
      if (!courseRoutesModule.nextLessonId) {
        console.log('Initializing nextLessonId');
        courseRoutesModule.nextLessonId = 1;
      }
      
      // Create each module using the same pattern as manual module creation
      for (let i = 0; i < courseData.modules.length; i++) {
        const moduleData = courseData.modules[i];
        
        const newModuleData = {
          courseId: courseId,
          title: moduleData.title,
          description: moduleData.description,
          order: i + 1,
          estimated_duration: 60,
          module_status: 'PUBLISHED',
          thumbnail: 'AI generated module thumbnail',
          price: '0'
        };
        
        const module = {
          id: courseRoutesModule.nextModuleId++,
          ...newModuleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        courseRoutesModule.modules.push(module);
        console.log('✅ Module created:', module.title);
        const moduleId = module.id;
        
        // Create lessons for this module using the same pattern as manual lesson creation
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          for (let j = 0; j < moduleData.lessons.length; j++) {
            const lessonData = moduleData.lessons[j];
            
            const newLessonData = {
              title: lessonData.title,
              description: lessonData.intro || 'AI generated lesson',
              order: j + 1,
              status: 'PUBLISHED'
            };
            
            const lesson = {
              id: courseRoutesModule.nextLessonId++,
              moduleId: moduleId,
              courseId: courseId,
              ...newLessonData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            courseRoutesModule.lessons.push(lesson);
            console.log('✅ Lesson created:', lesson.title);
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error('❌ Failed to save AI course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save course: ' + error.message
    });
  }
});

// Helper Functions
function generateFallbackStructure(title, subject, difficulty) {
  return {
    modules: [
      {
        id: 1,
        title: `Introduction to ${subject}`,
        description: `Foundational concepts and overview of ${subject}`,
        lessons: [
          {
            id: 1,
            title: `What is ${subject}?`,
            intro: `Welcome to your ${subject} learning journey. This lesson covers the essential basics you need to know.`,
            subtopics: [
              `What is ${subject} and why is it important?`,
              'Key terminology and concepts',
              'Real-world applications and benefits',
              'Setting up your learning environment'
            ],
            summary: `You now have a solid foundation in ${subject} basics and are ready to dive deeper into the fundamentals.`,
            duration: '15 min'
          },
          {
            id: 2,
            title: `Why Learn ${subject}?`,
            intro: `Understanding the value and opportunities in learning ${subject}.`,
            subtopics: [
              'Career opportunities and growth potential',
              'Real-world applications and use cases',
              'Skills development and personal growth',
              'Industry demand and future trends'
            ],
            summary: `You now understand the importance and opportunities in ${subject}.`,
            duration: '10 min'
          }
        ]
      },
      {
        id: 2,
        title: `${subject} Fundamentals`,
        description: 'Core principles and practical application',
        lessons: [
          {
            id: 3,
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
          },
          {
            id: 4,
            title: `Essential ${subject} Skills`,
            intro: `Developing the key skills needed to work effectively with ${subject}.`,
            subtopics: [
              'Technical skills and tools',
              'Problem-solving approaches',
              'Critical thinking techniques',
              'Communication and collaboration'
            ],
            summary: `You've developed essential skills for working with ${subject}.`,
            duration: '25 min'
          }
        ]
      },
      {
        id: 3,
        title: `Practical ${subject}`,
        description: 'Hands-on experience and real-world applications',
        lessons: [
          {
            id: 5,
            title: `Real-World ${subject} Projects`,
            intro: `Applying ${subject} concepts to practical projects and scenarios.`,
            subtopics: [
              'Project planning and setup',
              'Implementation strategies',
              'Testing and validation',
              'Documentation and presentation'
            ],
            summary: `You've applied ${subject} concepts to real-world projects.`,
            duration: '30 min'
          }
        ]
      },
      {
        id: 4,
        title: `Advanced ${subject}`,
        description: 'Expert-level concepts and advanced techniques',
        lessons: [
          {
            id: 6,
            title: `Advanced ${subject} Techniques`,
            intro: `Exploring expert-level concepts and advanced techniques in ${subject}.`,
            subtopics: [
              'Advanced methodologies',
              'Optimization strategies',
              'Performance tuning',
              'Security considerations'
            ],
            summary: `You've mastered advanced techniques in ${subject}.`,
            duration: '35 min'
          }
        ]
      }
    ]
  };
}

async function generateModuleLessons(moduleTitle, subject, difficulty) {
  // Always use fallback for now (AI service disabled)
  return [
    {
      id: Date.now(),
      title: `${moduleTitle} Essentials`,
      intro: `This lesson introduces you to the key concepts of ${moduleTitle}.`,
      subtopics: [
        'Core concepts and definitions',
        'Practical applications',
        'Best practices and tips',
        'Common challenges and solutions'
      ],
      summary: `You now understand the essential aspects of ${moduleTitle} and can apply this knowledge effectively.`,
      duration: '15 min'
    }
  ];
}

function determineContentType(question) {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('define')) {
    return 'concept';
  } else if (lowerQuestion.includes('how to') || lowerQuestion.includes('tutorial')) {
    return 'tutorial';
  } else if (lowerQuestion.includes('advanced') || lowerQuestion.includes('expert')) {
    return 'advanced';
  }
  return 'concept';
}

function determineDifficulty(question) {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('basic') || lowerQuestion.includes('beginner') || lowerQuestion.includes('introduction')) {
    return 'Beginner';
  } else if (lowerQuestion.includes('advanced') || lowerQuestion.includes('expert') || lowerQuestion.includes('complex')) {
    return 'Advanced';
  }
  return 'Intermediate';
}

module.exports = router;