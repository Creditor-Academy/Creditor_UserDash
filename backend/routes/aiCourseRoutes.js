// AI-powered course creation routes
const express = require('express');
const router = express.Router();
const { LangChain } = require('langchain');
const Bytez = require('bytez.js');

// Initialize Bytez SDK
const bytezSDK = new Bytez(process.env.BYTEZ_API_KEY);

// AI Proxy Endpoints - Hide implementation from frontend

// Initialize Bytez LangChain integration
const bytezChat = new ChatBytez({
  apiKey: process.env.BYTEZ_API_KEY,
  model: 'microsoft/Phi-3-mini-4k-instruct'
});

// POST /api/ai/create-course - Generate initial course modules and lessons
router.post('/create-course', auth, async (req, res) => {
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

Generate a JSON structure with 3-4 modules, where the first 2 modules contain detailed lessons.
Each module should have:
- id (number)
- title (string)
- description (string)  
- lessons (array of lesson objects)

Each lesson should have:
- id (number)
- title (string)
- description (string)
- content (string, can be empty for now)
- duration (string, e.g., "20 min")

Ensure the first 1-2 modules have at least 3-5 lessons each.
Return only valid JSON without any markdown formatting.`;

    // Generate course outline using Bytez LangChain
    const response = await bytezChat.call([
      {
        role: 'system',
        content: 'You are an expert course designer. Generate comprehensive, well-structured course outlines in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    
    let courseStructure;
    try {
      // Parse the AI response
      const cleanResponse = response.content.replace(/```json\n?|\n?```/g, '').trim();
      courseStructure = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback structure');
      courseStructure = generateFallbackStructure(title, subject, difficulty);
    }
    
    // Ensure minimum requirements
    if (!courseStructure.modules || courseStructure.modules.length < 3) {
      courseStructure = generateFallbackStructure(title, subject, difficulty);
    }
    
    // Enhance first 2 modules with detailed lessons if needed
    for (let i = 0; i < Math.min(2, courseStructure.modules.length); i++) {
      const module = courseStructure.modules[i];
      if (!module.lessons || module.lessons.length < 3) {
        module.lessons = await generateModuleLessons(module.title, subject, difficulty);
      }
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
            title: `What is ${subject}?`,
            description: 'Understanding the basics and core concepts',
            content: '',
            duration: '15 min'
          },
          {
            id: 2,
            title: `Why Learn ${subject}?`,
            description: 'Benefits and real-world applications',
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
        description: 'Core principles and essential knowledge',
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
        description: 'Hands-on experience and real-world applications',
        lessons: []
      },
      {
        id: 4,
        title: `Advanced ${subject}`,
        description: 'Expert-level concepts and advanced techniques',
        lessons: []
      }
    ]
  };
}

async function generateModuleLessons(moduleTitle, subject, difficulty) {
  try {
    const prompt = `Generate 3-5 detailed lessons for the module "${moduleTitle}" in ${subject} at ${difficulty} level.
    
Return a JSON array of lesson objects with:
- id (number)
- title (string)
- description (string)
- content (empty string for now)
- duration (string like "20 min")

Focus on practical, actionable learning objectives.`;

    const response = await bytezChat.call([
      {
        role: 'system',
        content: 'You are a curriculum designer. Generate detailed lesson plans in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    
    const lessons = JSON.parse(response.content.replace(/```json\n?|\n?```/g, '').trim());
    return Array.isArray(lessons) ? lessons : [];
    
  } catch (error) {
    console.warn('Failed to generate module lessons:', error);
    return [
      {
        id: Date.now(),
        title: 'Lesson 1',
        description: 'Introduction to the topic',
        content: '',
        duration: '20 min'
      }
    ];
  }
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
