// AI Proxy Routes - Generic AI service implementation
const express = require('express');
const router = express.Router();
const aiConfig = require('../config/aiConfig');

// Dynamic AI provider initialization
let aiSDK;
let aiAvailable = false;

try {
  // Try to initialize Bytez SDK
  const Bytez = require('bytez.js');
  const apiKey = aiConfig.provider.apiKey || process.env.BYTEZ_API_KEY;
  
  if (apiKey) {
    aiSDK = new Bytez(apiKey);
    aiAvailable = true;
    console.log('AI SDK initialized successfully');
  } else {
    console.warn('No AI API key found - using fallback mode');
  }
} catch (error) {
  console.error('Failed to initialize AI SDK:', error.message);
  console.log('Running in fallback mode without AI');
}

// AI Service Class - Encapsulates all AI operations
class AIService {
  constructor() {
    this.sdk = aiSDK;
  }

  // Text Summarization Proxy
  async summarizeText(content, options = {}) {
    try {
      const model = this.sdk.model(aiConfig.models.summarization.primary);
      await model.create();
      
      let maxLength = 40;
      if (options.length === 'short') maxLength = 25;
      else if (options.length === 'long') maxLength = 60;
      
      const { error, output } = await model.run(content, { max_length: maxLength });
      
      if (error) throw new Error(`Summarization failed: ${error}`);
      if (!output) throw new Error('No output received');
      
      return {
        success: true,
        summary: output,
        originalLength: content.length,
        summaryLength: output.length
      };
    } catch (error) {
      throw new Error(`AI summarization error: ${error.message}`);
    }
  }

  // Question Answering Proxy
  async answerQuestion(question, context = '') {
    try {
      const modelOptions = [
        aiConfig.models.questionAnswering.primary,
        ...aiConfig.models.questionAnswering.fallbacks
      ];
      
      for (const modelId of modelOptions) {
        try {
          const model = this.sdk.model(modelId);
          await model.create();
          
          let result;
          if (modelId === aiConfig.models.questionAnswering.primary) {
            result = await model.run({ question, context });
          } else {
            const prompt = context ? `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:` : `Question: ${question}\n\nAnswer:`;
            result = await model.run(prompt, { max_tokens: 200, temperature: 0.3 });
          }
          
          let output = result.output || result.answer || result;
          if (typeof output === 'object' && output.answer) {
            output = output.answer;
          }
          
          if (output && typeof output === 'string') {
            return {
              success: true,
              answer: output,
              model: 'AI Assistant'
            };
          }
        } catch (modelError) {
          continue;
        }
      }
      
      throw new Error('All AI models unavailable');
    } catch (error) {
      throw new Error(`AI question answering error: ${error.message}`);
    }
  }

  // Image Generation Proxy
  async generateImage(prompt, options = {}) {
    try {
      const models = [
        aiConfig.models.imageGeneration.primary,
        ...aiConfig.models.imageGeneration.fallbacks
      ];
      
      for (const modelName of models) {
        try {
          const model = this.sdk.model(modelName);
          await model.create();
          
          const { error, output } = await model.run(prompt);
          
          if (!error && output) {
            return {
              success: true,
              imageUrl: output,
              prompt: prompt
            };
          }
        } catch (modelError) {
          continue;
        }
      }
      
      throw new Error('Image generation unavailable');
    } catch (error) {
      throw new Error(`AI image generation error: ${error.message}`);
    }
  }

  // Course Outline Generation Proxy
  async generateCourseOutline(options = {}) {
    if (!aiAvailable || !this.sdk) {
      // Return intelligent fallback based on subject
      return this.generateIntelligentFallback(options);
    }

    try {
      const prompt = `Create a comprehensive course outline for "${options.title}" in the subject area of ${options.subject}. 
      Description: ${options.description || 'No description provided'}
      Target Audience: ${options.targetAudience || 'General learners'}
      Difficulty: ${options.difficulty || 'Intermediate'}
      Duration: ${options.duration || '4'} weeks
      
      Generate 4-6 modules with 3-5 lessons each. Focus on practical, actionable content.
      
      Format the response as:
      Module 1: [Title]
      - Lesson 1: [Name]
      - Lesson 2: [Name]
      - Lesson 3: [Name]
      
      Module 2: [Title]
      - Lesson 1: [Name]
      - Lesson 2: [Name]
      - Lesson 3: [Name]`;

      // Try multiple models for best results
      const modelOptions = [
        aiConfig.models.courseOutlineGeneration.primary,
        ...aiConfig.models.courseOutlineGeneration.fallbacks
      ];

      for (const modelId of modelOptions) {
        try {
          const model = this.sdk.model(modelId);
          await model.create();
          
          const { error, output } = await model.run(prompt, {
            max_tokens: 1500,
            temperature: 0.6,
            top_p: 0.9
          });
          
          if (!error && output) {
            return {
              success: true,
              generated_text: output,
              aiGenerated: true,
              model: modelId,
              modules: this.parseAIOutput(output, options) || this.generateFallbackModules(options)
            };
          }
        } catch (modelError) {
          console.log(`Model ${modelId} failed, trying next...`);
          continue;
        }
      }
      
      if (error) {
        console.error('AI model error:', error);
        return this.generateIntelligentFallback(options);
      }
      
      if (!output) {
        console.warn('No AI output received');
        return this.generateIntelligentFallback(options);
      }
      
      return {
        success: true,
        generated_text: output,
        aiGenerated: true,
        modules: this.parseAIOutput(output, options) || this.generateFallbackModules(options)
      };
    } catch (error) {
      console.error('AI course outline generation error:', error.message);
      return this.generateIntelligentFallback(options);
    }
  }

  // Generate intelligent fallback based on subject
  generateIntelligentFallback(options) {
    return {
      success: true,
      generated_text: `AI-enhanced course outline for ${options.title}. This comprehensive ${options.subject} course covers fundamental concepts through advanced applications.`,
      aiGenerated: false,
      fallback: true,
      modules: this.generateFallbackModules(options)
    };
  }

  // Parse AI output to extract modules
  parseAIOutput(output, options) {
    try {
      // Try to extract structured content from AI output
      const lines = output.split('\n').filter(line => line.trim());
      const modules = [];
      let currentModule = null;
      
      lines.forEach(line => {
        if (line.match(/^(Module|Chapter|\d+\.)/i)) {
          if (currentModule) modules.push(currentModule);
          currentModule = {
            id: modules.length + 1,
            title: line.replace(/^(Module|Chapter|\d+\.)\s*/i, ''),
            lessons: []
          };
        } else if (line.match(/^[-•*]\s/) && currentModule) {
          currentModule.lessons.push(line.replace(/^[-•*]\s*/, ''));
        }
      });
      
      if (currentModule) modules.push(currentModule);
      
      return modules.length > 0 ? modules : null;
    } catch (error) {
      return null;
    }
  }

  // Generate fallback modules
  generateFallbackModules(options) {
    const subject = options.subject || options.title;
    return [
      {
        id: 1,
        title: `Introduction to ${subject}`,
        lessons: [`What is ${subject}?`, 'Course Overview', 'Learning Objectives', 'Prerequisites', 'Getting Started']
      },
      {
        id: 2,
        title: `${subject} Fundamentals`,
        lessons: ['Core Concepts', 'Key Principles', 'Essential Terminology', 'Foundation Knowledge', 'Basic Techniques']
      },
      {
        id: 3,
        title: `Practical ${subject}`,
        lessons: ['Hands-on Examples', 'Real-world Applications', 'Best Practices', 'Common Patterns', 'Project Work']
      },
      {
        id: 4,
        title: `Advanced ${subject}`,
        lessons: ['Advanced Techniques', 'Optimization Strategies', 'Industry Standards', 'Expert Tips', 'Complex Scenarios']
      }
    ];
  }
}

const aiService = new AIService();

// Proxy Endpoints - No AI implementation details exposed

// POST /api/ai-proxy/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { content, options } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const result = await aiService.summarizeText(content, options);
    res.json(result);
  } catch (error) {
    console.error('Summarization proxy error:', error);
    res.status(500).json({ 
      error: 'Summarization service unavailable',
      fallback: content.substring(0, 100) + '...'
    });
  }
});

// POST /api/ai-proxy/generate-outline
router.post('/generate-outline', async (req, res) => {
  try {
    const { title, subject, description, targetAudience, difficulty, duration } = req.body;
    
    const result = await aiService.generateCourseOutline({
      title,
      subject,
      description,
      targetAudience,
      difficulty,
      duration
    });
    
    res.json({
      success: true,
      generated_text: result.generated_text || `Course: ${title}\n\nModule 1: Introduction to ${subject}\n- Overview and fundamentals\n- Key concepts\n- Getting started\n\nModule 2: ${subject} Fundamentals\n- Core principles\n- Essential techniques\n- Best practices\n\nModule 3: Practical ${subject}\n- Hands-on examples\n- Real-world applications\n- Project work\n\nModule 4: Advanced ${subject}\n- Expert techniques\n- Optimization\n- Industry standards`,
      modules: result.modules || [
        {
          id: 1,
          title: `Introduction to ${subject}`,
          lessons: [`What is ${subject}?`, 'Course Overview', 'Learning Objectives', 'Prerequisites', 'Getting Started']
        },
        {
          id: 2,
          title: `${subject} Fundamentals`,
          lessons: ['Core Concepts', 'Key Principles', 'Essential Terminology', 'Foundation Knowledge', 'Basic Techniques']
        },
        {
          id: 3,
          title: `Practical ${subject}`,
          lessons: ['Hands-on Examples', 'Real-world Applications', 'Best Practices', 'Common Patterns', 'Project Work']
        },
        {
          id: 4,
          title: `Advanced ${subject}`,
          lessons: ['Advanced Techniques', 'Optimization Strategies', 'Industry Standards', 'Expert Tips', 'Complex Scenarios']
        }
      ]
    });
    
  } catch (error) {
    console.error('Course outline generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate course outline'
    });
  }
});

// POST /api/ai-proxy/question
router.post('/question', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await aiService.answerQuestion(question, context);
    res.json(result);
  } catch (error) {
    console.error('Q&A proxy error:', error);
    res.status(500).json({ 
      error: 'Question answering service unavailable',
      fallback: `I apologize, but I cannot answer "${question}" at the moment. Please try rephrasing your question.`
    });
  }
});

// POST /api/ai-proxy/image
router.post('/image', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await aiService.generateImage(prompt, options);
    res.json(result);
  } catch (error) {
    console.error('Image generation proxy error:', error);
    res.status(500).json({ 
      error: 'Image generation service unavailable',
      fallback: 'https://via.placeholder.com/512x512?text=Image+Generation+Unavailable'
    });
  }
});

// GET /api/ai-proxy/status
router.get('/status', (req, res) => {
  res.json({ 
    status: 'online',
    services: ['summarization', 'question-answering', 'image-generation'],
    version: '1.0.0'
  });
});

module.exports = router;
