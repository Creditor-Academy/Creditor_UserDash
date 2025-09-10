// AI Proxy Routes - Generic AI service implementation
const express = require('express');
const router = express.Router();
const aiConfig = require('../config/aiConfig');

// Dynamic AI provider initialization
let aiSDK;
try {
  const AIProvider = require(aiConfig.provider.name.toLowerCase() + '.js');
  aiSDK = new AIProvider(aiConfig.provider.apiKey);
} catch (error) {
  // Fallback to environment-based initialization
  const Bytez = require('bytez.js');
  aiSDK = new Bytez(aiConfig.provider.apiKey);
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
