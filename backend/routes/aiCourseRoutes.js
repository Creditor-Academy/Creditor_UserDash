// AI-powered course creation routes
const express = require('express');
const router = express.Router();

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
    const { title, subject, description, targetAudience, difficulty, duration } = req.body;
    
    console.log('🤖 Generating AI course:', title);
    
    // Create comprehensive prompt for course generation
    const prompt = `Create a comprehensive course outline for "${title}" in the ${subject} domain.
    
Course Details:
- Subject: ${subject}
- Description: ${description}
- Target Audience: ${targetAudience}
- Difficulty: ${difficulty}
- Duration: ${duration}

Generate a JSON structure with exactly 2 modules, each containing exactly 1 lesson.
Each module should have:
- id (number)
- title (string)
- description (string)  
- lessons (array with 1 lesson object)

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
1. Create a course outline with 2 modules. 
2. Each module should contain 1 lesson. 
3. Each lesson must include:
   - "lesson_title"
   - "lesson_intro" (short introduction paragraph)
   - "lesson_content" (array of subtopics, each with "subtopic" and "content")
   - "examples" (array of 1–2 short examples, if relevant)
   - "summary" (a short recap)

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

        const { error, output } = await model.run(aiPrompt, {
          max_new_tokens: 300,
          min_new_tokens: 100,
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
        const bytezImage = new ChatBytez({
          apiKey: process.env.BYTEZ_API_KEY,
          model: modelId
        });
        
        const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
        const response = await bytezImage.call(stylePrompt, {
          max_tokens: 1,
          temperature: 0.7
        });
        
        if (response && response.content) {
          imageUrl = response.content;
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

    const response = await bytezChat.call([
      {
        role: 'system',
        content: 'You are an expert content summarizer. Create clear, concise summaries that highlight key learning points.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    
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

// POST /api/ai/search - Content Q&A search
router.post('/search', auth, async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    
    console.log('🔍 Answering question:', question);
    
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nProvide a comprehensive, educational answer that can be used directly in course content.`
      : `Question: ${question}\n\nProvide a comprehensive, educational answer that can be used directly in course content.`;
    
    const response = await bytezChat.call([
      {
        role: 'system',
        content: 'You are an expert educator. Provide clear, comprehensive answers that are suitable for course content.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    
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

// POST /api/ai/courses - Save AI-generated course
router.post('/courses', auth, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id,
      isAIGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const course = new Course(courseData);
    await course.save();
    
    res.status(201).json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error('❌ Failed to save AI course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save course'
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
