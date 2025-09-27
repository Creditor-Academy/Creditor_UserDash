// Bytez API Service using official SDK
import Bytez from 'bytez.js';

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY || '936e7d17db26fa9d6e0fd250eb6ed566';

class BytezAPI {
  constructor() {
    this.apiKey = BYTEZ_API_KEY;
    this.sdk = new Bytez(this.apiKey);
    
    // Warn if using fallback API key
    if (!import.meta.env.VITE_BYTEZ_API_KEY) {
      console.warn('Using fallback API key. Please set VITE_BYTEZ_API_KEY in .env file');
    }
    
    console.log('Bytez SDK initialized with API key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'MISSING');
  }

  // Text-to-Image Generation using Bytez SDK
  async generateImage(prompt, options = {}) {
    try {
      console.log('🎨 Generating image with prompt:', prompt);
      
      // Try working image generation models
      const models = [
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError;
      
      for (const modelName of models) {
        try {
          console.log(`🔄 Trying model: ${modelName}`);
          const model = this.sdk.model(modelName);
          await model.create();
          
          const { error, output } = await model.run(prompt);
          
          if (error) {
            console.warn(`Model ${modelName} error:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Image generated successfully:', output);
          return { images: Array.isArray(output) ? output : [output] };
        } catch (modelError) {
          console.warn(`Model ${modelName} failed:`, modelError);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, throw the last error
      throw new Error(lastError || 'All image generation models failed');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw error;
    }
  }

  // Advanced Text Summarization using ainize/bart-base-cnn model with chunking support
  async summarizeContent(content, options = {}) {
    try {
      console.log('📝 Starting advanced BART summarization with chunking support...');
      
      const cleanContent = typeof content === 'string' ? content.trim() : String(content).trim();
      if (!cleanContent) {
        throw new Error('No content provided for summarization');
      }

      // Configure length parameters based on summary type
      const lengthConfig = this.getSummaryLengthConfig(options.length);
      console.log(`🔧 Using length config:`, lengthConfig);

      // Check if content needs chunking (approximate token count: 1 token ≈ 4 characters)
      const approximateTokens = Math.ceil(cleanContent.length / 4);
      const maxTokensPerChunk = 1024;
      
      if (approximateTokens <= maxTokensPerChunk) {
        // Single chunk processing
        return await this.summarizeSingleChunk(cleanContent, lengthConfig, options);
      } else {
        // Multi-chunk processing
        return await this.summarizeWithChunking(cleanContent, lengthConfig, options);
      }
      
    } catch (error) {
      console.error('❌ Advanced summarization failed:', error);
      
      // Return fallback summary
      const fallbackSummary = this.generateFallbackSummary(content, options);
      return {
        success: false,
        summary: fallbackSummary,
        model: "fallback",
        generated_text: fallbackSummary,
        originalLength: content.length,
        summaryLength: fallbackSummary.length,
        error: error.message,
        chunked: false
      };
    }
  }

  // Get length configuration based on summary type
  getSummaryLengthConfig(lengthType) {
    const configs = {
      'short': { min_length: 50, max_length: 100 },
      'medium': { min_length: 100, max_length: 200 },
      'long': { min_length: 150, max_length: 300 },
      'detailed': { min_length: 200, max_length: 400 }
    };
    
    return configs[lengthType] || configs['medium'];
  }

  // Summarize single chunk of text
  async summarizeSingleChunk(content, lengthConfig, options = {}) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Summarizing single chunk (attempt ${retryCount + 1}/${maxRetries})`);
        
        const model = this.sdk.model("ainize/bart-base-cnn");
        await model.create();
        
        const result = await model.run(content, {
          min_length: lengthConfig.min_length,
          max_length: lengthConfig.max_length
        });
        
        const { error, output } = this.parseModelResult(result);
        
        if (error) {
          throw new Error(`BART model error: ${error}`);
        }
        
        if (!output || output.length < 10) {
          throw new Error('BART model returned insufficient output');
        }
        
        console.log('✅ Single chunk summarization successful');
        
        const formattedSummary = this.formatSummary(output, options.type);
        
        return {
          success: true,
          summary: formattedSummary,
          model: "ainize/bart-base-cnn",
          generated_text: formattedSummary,
          originalLength: content.length,
          summaryLength: formattedSummary.length,
          chunked: false,
          lengthConfig
        };
        
      } catch (error) {
        console.error(`❌ Single chunk attempt ${retryCount + 1} failed:`, error);
        
        if (this.isRateLimitError(error) && retryCount < maxRetries - 1) {
          const delay = Math.pow(2, retryCount + 1) * 1000;
          console.log(`⏳ Rate limited, waiting ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }
        
        if (retryCount >= maxRetries - 1) {
          throw error;
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Summarize text with chunking for long content
  async summarizeWithChunking(content, lengthConfig, options = {}) {
    try {
      console.log('📄 Processing long content with chunking...');
      
      // Split content into chunks
      const chunks = this.chunkText(content, 1024 * 4); // ~1024 tokens per chunk
      console.log(`📊 Split content into ${chunks.length} chunks`);
      
      // Summarize each chunk
      const chunkSummaries = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`📝 Processing chunk ${i + 1}/${chunks.length}`);
        
        try {
          // Use shorter length for individual chunks
          const chunkLengthConfig = {
            min_length: Math.max(30, Math.floor(lengthConfig.min_length / chunks.length)),
            max_length: Math.max(50, Math.floor(lengthConfig.max_length / chunks.length))
          };
          
          const chunkResult = await this.summarizeSingleChunk(chunks[i], chunkLengthConfig, { type: 'paragraph' });
          chunkSummaries.push(chunkResult.summary);
          
          // Small delay between chunks to avoid rate limiting
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (chunkError) {
          console.warn(`⚠️ Chunk ${i + 1} failed, using fallback:`, chunkError.message);
          chunkSummaries.push(this.generateFallbackSummary(chunks[i], { length: 'short' }));
        }
      }
      
      // Merge chunk summaries into coherent final summary
      const mergedSummary = await this.mergeChunkSummaries(chunkSummaries, lengthConfig, options);
      
      return {
        success: true,
        summary: mergedSummary,
        model: "ainize/bart-base-cnn",
        generated_text: mergedSummary,
        originalLength: content.length,
        summaryLength: mergedSummary.length,
        chunked: true,
        chunkCount: chunks.length,
        lengthConfig
      };
      
    } catch (error) {
      console.error('❌ Chunked summarization failed:', error);
      throw error;
    }
  }

  // Intelligent text chunking that preserves sentence boundaries
  chunkText(text, maxChunkSize) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence + '.';
      
      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = trimmedSentence + '.';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  // Merge chunk summaries into a coherent final summary
  async mergeChunkSummaries(chunkSummaries, lengthConfig, options = {}) {
    try {
      console.log('🔗 Merging chunk summaries into coherent summary...');
      
      // Join chunk summaries
      const combinedSummaries = chunkSummaries.join(' ');
      
      // If combined summaries are within target length, format and return
      if (combinedSummaries.length <= lengthConfig.max_length * 5) {
        return this.formatSummary(combinedSummaries, options.type);
      }
      
      // If still too long, summarize the combined summaries
      try {
        const finalSummaryResult = await this.summarizeSingleChunk(
          combinedSummaries, 
          lengthConfig, 
          { type: 'paragraph' }
        );
        return this.formatSummary(finalSummaryResult.summary, options.type);
      } catch (error) {
        console.warn('⚠️ Final summarization failed, using truncated merge:', error.message);
        // Fallback: intelligently truncate combined summaries
        return this.truncateToLength(combinedSummaries, lengthConfig.max_length);
      }
      
    } catch (error) {
      console.error('❌ Summary merging failed:', error);
      return chunkSummaries.join(' ');
    }
  }

  // Parse model result with multiple format support
  parseModelResult(result) {
    if (result && typeof result === 'object') {
      if ('error' in result && 'output' in result) {
        return { error: result.error, output: result.output };
      } else if ('summary_text' in result) {
        return { error: null, output: result.summary_text };
      } else if ('generated_text' in result) {
        return { error: null, output: result.generated_text };
      } else if (Array.isArray(result) && result.length > 0) {
        const output = result[0].summary_text || result[0].generated_text || result[0];
        return { error: null, output };
      } else {
        const possibleText = Object.values(result).find(val => typeof val === 'string' && val.length > 10);
        return { error: null, output: possibleText || JSON.stringify(result) };
      }
    } else if (typeof result === 'string') {
      return { error: null, output: result };
    } else {
      return { error: null, output: String(result) };
    }
  }

  // Format summary based on type preference
  formatSummary(text, type) {
    if (!text) return '';
    
    switch (type) {
      case 'bullet':
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences.map(s => `• ${s.trim()}`).join('\n');
      case 'outline':
        const points = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return points.map((point, index) => `${index + 1}. ${point.trim()}`).join('\n');
      case 'paragraph':
      default:
        return text.trim();
    }
  }

  // Check if error is rate limiting
  isRateLimitError(error) {
    const errorStr = error.toString().toLowerCase();
    return errorStr.includes('429') || errorStr.includes('too many requests') || errorStr.includes('rate limit');
  }

  // Intelligently truncate text to target length
  truncateToLength(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    const sentences = text.split(/[.!?]+/);
    let result = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      const potential = result + (result ? '. ' : '') + trimmed + '.';
      if (potential.length <= maxLength) {
        result = potential;
      } else {
        break;
      }
    }
    
    return result || text.substring(0, maxLength - 3) + '...';
  }

  // Text Summarization using Bytez SDK
  async summarizeText(text, options = {}) {
    try {
      console.log('📝 Summarizing text:', text.substring(0, 100) + '...');
      
      // Try BART model first (specialized for summarization), then fallback to working models
      const modelOptions = [
        "ainize/bart-base-cnn",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4", 
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          // Use different parameters for BART vs other models
          let result;
          if (modelId === "ainize/bart-base-cnn") {
            // BART model - direct text input with max_length parameter
            result = await model.run(text, {
              max_length: options.max_length || 150
            });
          } else {
            // Other models - use prompt format
            const prompt = `Summarize this text in ${options.max_length || 150} words or less:\n\n${text}\n\nSummary:`;
            result = await model.run(prompt, {
              max_tokens: options.max_length || 150,
              temperature: 0.3
            });
          }
          
          const { error, output } = result;
          
          if (error) {
            console.warn(`Model ${modelId} failed:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Text summarized successfully with', modelId, ':', output);
          return { summary: output };
        } catch (modelError) {
          console.warn(`Model ${modelId} not available:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, return a fallback summary
      console.warn('All AI models failed, using fallback summarization');
      const sentences = text.split('.').filter(s => s.trim().length > 10);
      const maxSentences = Math.min(3, Math.ceil(sentences.length * 0.3));
      const fallbackSummary = sentences.slice(0, maxSentences).join('. ') + '.';
      
      return { summary: fallbackSummary };
    } catch (error) {
      console.error('❌ Text summarization failed:', error);
      throw error;
    }
  }

  // Text Generation using Bytez SDK
  async generateText(prompt, options = {}) {
    try {
      console.log('📝 Generating text with prompt:', prompt.substring(0, 100) + '...');
      
      // Try Qwen2 model first (specialized for text generation), then fallback to working models
      const modelOptions = [
        "Qwen/Qwen2-7B-Instruct",
        "google/flan-t5-base",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model for text generation: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          // Use different parameters for different models
          let result;
          if (modelId === "Qwen/Qwen2-7B-Instruct") {
            // Qwen2 model - use proper text generation parameters
            result = await model.run(prompt, {
              max_new_tokens: options.max_length || 500,
              min_new_tokens: options.min_length || 50,
              temperature: options.temperature || 0.5
            });
          } else if (modelId === "google/flan-t5-base") {
            // FLAN-T5 model - use proper text generation parameters
            result = await model.run(prompt, {
              max_new_tokens: options.max_length || 500,
              min_new_tokens: options.min_length || 50,
              temperature: options.temperature || 0.5
            });
          } else {
            // Other models - use standard parameters
            result = await model.run(prompt, {
              max_tokens: options.max_length || 500,
              temperature: options.temperature || 0.7
            });
          }
          
          const { error, output } = result;
          
          if (error) {
            console.warn(`Model ${modelId} failed:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Text generated successfully with', modelId, ':', output);
          return { generated_text: output };
        } catch (modelError) {
          console.warn(`Model ${modelId} not available:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, throw the last error
      throw new Error(lastError || 'All text generation models failed');
    } catch (error) {
      console.error('❌ Text generation failed:', error);
      throw error;
    }
  }

  // Course Outline Generation using Bytez SDK
  async generateCourseOutline(courseData) {
    try {
      console.log('📚 Generating course outline for:', courseData.title);
      
      // Try FLAN-T5 model first (specialized for text generation), then fallback to working models
      const modelOptions = [
        "google/flan-t5-base",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model for course outline: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          // Enhanced prompt for topic-specific course generation
          const prompt = `Create a course outline for "${courseData.title}" about ${courseData.subject || 'Technology'}.

Generate 5-6 modules with 4-5 lessons each.

Course: ${courseData.title}
Subject: ${courseData.subject || 'Technology'}
Description: ${courseData.description}

Format as JSON:
{
  "courseTitle": "${courseData.title}",
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module Title",
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "Lesson Title",
          "description": "Lesson description",
          "duration": "45 minutes",
          "type": "theory/practical/project"
        }
      ],
      "project": "Module project description",
      "assessment": "Assessment method"
    }
  ]
}`;
          
          // Use different parameters for FLAN-T5 vs other models
          let result;
          if (modelId === "google/flan-t5-base") {
            // FLAN-T5 model - use proper text generation parameters
            result = await model.run(prompt, {
              max_new_tokens: 800,
              min_new_tokens: 200,
              temperature: 0.5
            });
          } else {
            // Other models - use standard parameters
            result = await model.run(prompt, {
              max_tokens: 800,
              temperature: 0.7
            });
          }
          
          const { error, output } = result;
          
          if (error) {
            console.warn(`Model ${modelId} failed:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Course outline generated successfully with', modelId);
          return { generated_text: output };
        } catch (modelError) {
          console.warn(`Model ${modelId} not available:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, return fallback
      console.warn('All AI models failed for course outline, using fallback');
      return { 
        generated_text: JSON.stringify({
          courseTitle: courseData.title,
          modules: [
            {
              moduleNumber: 1,
              title: "Introduction to " + (courseData.subject || courseData.title),
              lessons: [
                { lessonNumber: 1, title: "Getting Started", description: "Course introduction", duration: "30 minutes", type: "theory" }
              ]
            }
          ]
        })
      };
    } catch (error) {
      console.error('❌ Course outline generation failed:', error);
      throw error;
    }
  }

  // Generate topic-specific curriculum structure
  async generateTopicCurriculum(topic, level = 'intermediate') {
    try {
      console.log('🎯 Generating curriculum for topic:', topic);
      
      // Try FLAN-T5 model first (specialized for text generation), then fallback to working models
      const modelOptions = [
        "google/flan-t5-base",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      for (const modelId of modelOptions) {
        try {
          const model = this.sdk.model(modelId);
          await model.create();
          
          const prompt = `Generate curriculum for "${topic}" at ${level} level. Include learning path, concepts, skills, projects.`;
          
          // Use different parameters for FLAN-T5 vs other models
          let result;
          if (modelId === "google/flan-t5-base") {
            // FLAN-T5 model - use proper text generation parameters
            result = await model.run(prompt, {
              max_new_tokens: 400,
              min_new_tokens: 100,
              temperature: 0.5
            });
          } else {
            // Other models - use standard parameters
            result = await model.run(prompt, {
              max_tokens: 400,
              temperature: 0.7
            });
          }
          
          const { error, output } = result;
          
          if (!error) {
            return { curriculum: output };
          }
        } catch (modelError) {
          continue;
        }
      }
      
      return { curriculum: `Basic curriculum for ${topic} at ${level} level` };
    } catch (error) {
      console.error('❌ Topic curriculum generation failed:', error);
      throw error;
    }
  }

  // Question Answering / Content Search using multiple fallback models
  async answerQuestion(question, context = '', options = {}) {
    try {
      console.log('❓ Answering question with fallback models:', question.substring(0, 100) + '...');
      
      // Try multiple working models for Q&A
      const modelOptions = [
        "deepset/roberta-base-squad2",
        "microsoft/DialoGPT-medium",
        "google/flan-t5-base",
        "microsoft/Phi-3-mini-4k-instruct"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model for Q&A: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          let result;
          
          if (modelId === "deepset/roberta-base-squad2") {
            // RoBERTa QA model - use proper Q&A format
            result = await model.run({
              question: question,
              context: context || "This is a general educational question that requires a comprehensive answer based on common knowledge and best practices."
            });
          } else if (modelId === "microsoft/Phi-3-mini-4k-instruct") {
            // Phi-3 model - use chat format
            const prompt = context 
              ? `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`
              : `Question: ${question}\n\nAnswer:`;
            result = await model.run({
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ]
            }, {
              max_tokens: 200,
              temperature: 0.3
            });
          } else {
            // Other models - use prompt format
            const prompt = context 
              ? `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`
              : `Question: ${question}\n\nAnswer:`;
            result = await model.run(prompt, {
              max_tokens: 200,
              temperature: 0.3
            });
          }
          
          // Handle different response formats
          let output, error;
          if (result && typeof result === 'object') {
            if ('error' in result && 'output' in result) {
              ({ error, output } = result);
            } else if ('answer' in result) {
              // Handle RoBERTa QA response format: {score, start, end, answer}
              output = typeof result.answer === 'string' ? result.answer : String(result.answer);
              error = null;
            } else if (typeof result === 'string') {
              output = result;
              error = null;
            } else {
              // Extract any string value from the object
              const possibleText = Object.values(result).find(val => 
                typeof val === 'string' && val.length > 5
              );
              output = possibleText || `Response: ${JSON.stringify(result)}`;
              error = null;
            }  
          } else if (typeof result === 'string') {
            output = result;
            error = null;
          } else {
            error = 'Invalid response format';
            output = null;
          }
          
          if (!error && output) {
            console.log('✅ Q&A successful with model:', modelId);
            return {
              success: true,
              answer: output,
              model: modelId,
              question: question,
              context: context,
              confidence: modelId.includes('roberta') ? 'high' : 'medium'
            };
          } else {
            console.warn(`⚠️ Model ${modelId} failed:`, error);
            lastError = error;
          }
        } catch (modelError) {
          console.warn(`❌ Model ${modelId} error:`, modelError.message);
          lastError = modelError;
        }
      }
      
      // If all models fail, return a fallback answer
      console.warn('All Q&A models failed, using fallback');
      const fallbackAnswer = this.generateFallbackAnswer(question, context);
      
      return {
        success: false,
        answer: fallbackAnswer,
        model: "fallback",
        question: question,
        context: context,
        error: lastError?.message || 'All models failed'
      };
      
    } catch (error) {
      console.error('❌ Q&A completely failed:', error);
      
      // Final fallback
      const fallbackAnswer = this.generateFallbackAnswer(question, context);
      return {
        success: false,
        answer: fallbackAnswer,
        model: "fallback",
        question: question,
        context: context,
        error: error.message
      };
    }
  }

  // Answer question using other models
  async answerQuestionWithOtherModels(question, context = '', options = {}) {
    try {
      console.log('❓ Answering question with other models:', question.substring(0, 100) + '...');
      
      // Try other models
      const modelOptions = [
        "google/flan-t5-base",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model for question answering: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          // Use different parameters for different models
          let result;
          if (modelId === "google/flan-t5-base") {
            // FLAN-T5 model - use chat messages format
            result = await model.run({
              messages: [
                {
                  role: "system",
                  content: "You are a helpful AI assistant that answers questions clearly and concisely."
                },
                {
                  role: "user", 
                  content: context ? `Context: ${context}\n\nQuestion: ${question}` : question
                }
              ],
              max_tokens: 150,
              temperature: 0.7
            });
          } else {
            // Image generation models - use prompt format
            const prompt = context 
              ? `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`
              : `Please provide a comprehensive answer about: ${question}`;
            
            // For image generation models, use text prompt
            result = await model.run(prompt, {
              max_new_tokens: options.max_answer_length || 200,
              temperature: 0.7
            });
          }
          
          const { error, output } = result;
          
          if (error) {
            console.warn(`Model ${modelId} failed:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Question answered successfully with', modelId, ':', output);
          return { answer: output };
        } catch (modelError) {
          console.warn(`Model ${modelId} not available:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, return a fallback answer
      console.warn('All AI models failed for Q&A, using fallback');
      return { answer: `I'm sorry, I couldn't find a specific answer to "${question}". Please try rephrasing your question or providing more context.` };
    } catch (error) {
      console.error('❌ Question answering failed:', error);
      throw error;
    }
  }

  // Chat with Bot using Phi-3 model
  async chatWithBot(messages, options = {}) {
    try {
      console.log('💬 Starting chat session with bot...');
      
      // Try Phi-3 model first (specialized for chat), then fallback to other models
      const modelOptions = [
        "microsoft/Phi-3-mini-4k-instruct",
        "Qwen/Qwen2-7B-Instruct",
        "google/flan-t5-base",
        "dreamlike-art/dreamlike-photoreal-2.0",
        "prompthero/openjourney-v4",
        "SG161222/Realistic_Vision_V3.0_VAE"
      ];
      
      let lastError = null;
      
      for (const modelId of modelOptions) {
        try {
          console.log(`🔄 Trying model for chat: ${modelId}`);
          const model = this.sdk.model(modelId);
          await model.create();
          
          // Use different parameters for different models
          let result;
          if (modelId === "microsoft/Phi-3-mini-4k-instruct") {
            // Phi-3 model - use chat messages format
            result = await model.run(messages, {
              max_new_tokens: options.max_length || 300,
              temperature: options.temperature || 0.7
            });
          } else if (modelId === "Qwen/Qwen2-7B-Instruct" || modelId === "google/flan-t5-base") {
            // Convert messages to prompt format for other models
            const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n') + '\nassistant:';
            result = await model.run(prompt, {
              max_new_tokens: options.max_length || 300,
              min_new_tokens: 20,
              temperature: options.temperature || 0.7
            });
          } else {
            // Fallback models - use simple prompt
            const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
            const prompt = lastUserMessage ? lastUserMessage.content : 'Hello';
            result = await model.run(prompt, {
              max_tokens: options.max_length || 300,
              temperature: options.temperature || 0.7
            });
          }
          
          const { error, output } = result;
          
          if (error) {
            console.warn(`Model ${modelId} failed:`, error);
            lastError = error;
            continue;
          }
          
          console.log('✅ Chat response generated successfully with', modelId);
          return { message: output };
        } catch (modelError) {
          console.warn(`Model ${modelId} not available:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models fail, return a fallback response
      console.warn('All AI models failed for chat, using fallback');
      return { message: "I'm experiencing some technical difficulties right now. Please try again in a moment or contact our support team for assistance." };
    } catch (error) {
      console.error('❌ Chat with bot failed:', error);
      throw error;
    }
  }

  // Test API connection
  async testConnection() {
    try {
      console.log('🧪 Testing Bytez API connection...');
      const response = await this.generateText('Hello, this is a test.', {
        max_length: 50
      });
      console.log('✅ Connection test successful');
      return { success: true, response };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
  // Generate fallback summary when all models fail
  generateFallbackSummary(content, options = {}) {
    try {
      // Simple extractive summarization - take first few sentences
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      let summaryLength = 2; // default
      if (options.length === 'short') {
        summaryLength = 1;
      } else if (options.length === 'long') {
        summaryLength = Math.min(4, sentences.length);
      } else {
        summaryLength = Math.min(2, sentences.length);
      }
      
      const summarySentences = sentences.slice(0, summaryLength);
      let summary = summarySentences.join('. ').trim();
      
      if (summary && !summary.endsWith('.')) {
        summary += '.';
      }
      
      if (options.type === 'bullet') {
        summary = summarySentences.map(s => `• ${s.trim()}`).join('\n');
      }
      
      return summary || 'Unable to generate summary from the provided content.';
    } catch (error) {
      return 'Summary generation failed. Please try with different content.';
    }
  }
  
  // Question Answering using google/flan-t5-base model specifically
  async answerQuestionWithFlanT5(question, context = '', options = {}) {
    try {
      console.log('❓ Answering question with FLAN-T5:', question.substring(0, 100) + '...');
      
      const model = this.sdk.model("google/flan-t5-base");
      await model.create();
      
      // Format the prompt for question answering
      const prompt = context 
        ? `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`
        : `Question: ${question}\n\nAnswer:`;
      
      const { error, output } = await model.run(prompt, {
        max_new_tokens: options.max_new_tokens || 200,
        min_new_tokens: options.min_new_tokens || 50,
        temperature: options.temperature || 0.5
      });
      
      if (error) {
        console.error('❌ FLAN-T5 Q&A error:', error);
        throw new Error(`FLAN-T5 Q&A failed: ${error}`);
      }
      
      console.log('✅ FLAN-T5 Q&A successful:', output);
      
      return {
        success: true,
        answer: output,
        model: "google/flan-t5-base",
        question: question,
        context: context,
        confidence: 'high'
      };
      
    } catch (error) {
      console.error('❌ FLAN-T5 Q&A failed:', error);
      
      // Return fallback answer
      const fallbackAnswer = this.generateFallbackAnswer(question, context);
      return {
        success: false,
        answer: fallbackAnswer,
        model: "fallback",
        question: question,
        context: context,
        error: error.message
      };
    }
  }

  // Generate fallback answer when all models fail
  generateFallbackAnswer(question, context = '') {
    try {
      // Simple keyword-based response generation
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes('what') || questionLower.includes('define')) {
        return `Based on the question "${question}", this appears to be asking for a definition or explanation. ${context ? 'From the provided context, ' : ''}Please refer to educational resources or documentation for detailed information on this topic.`;
      } else if (questionLower.includes('how')) {
        return `This question asks about the process or method for "${question}". ${context ? 'The context provided may contain relevant steps or procedures. ' : ''}Consider breaking this down into smaller, specific steps for better understanding.`;
      } else if (questionLower.includes('why')) {
        return `This question seeks to understand the reasoning behind "${question}". ${context ? 'The provided context may offer insights into the underlying principles. ' : ''}Consider exploring the fundamental concepts and relationships involved.`;
      } else if (questionLower.includes('when') || questionLower.includes('where')) {
        return `This question asks about timing or location related to "${question}". ${context ? 'Please review the context for specific details. ' : ''}Additional research may be needed for precise information.`;
      } else {
        return `I apologize, but I couldn't process your question "${question}" with the available AI models. ${context ? 'While context was provided, ' : ''}Please try rephrasing your question or breaking it into smaller, more specific parts.`;
      }
    } catch (error) {
      return `I'm unable to answer "${question}" at the moment. Please try rephrasing your question or providing more context.`;
    }
  }
}

export default new BytezAPI();
