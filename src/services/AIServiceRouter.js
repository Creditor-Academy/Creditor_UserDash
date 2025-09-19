// AIServiceRouter.js - Multi-provider AI service router
import Bytez from 'bytez.js';

class AIServiceRouter {
  constructor() {
    // API Keys from environment variables
    this.apiKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      stability: import.meta.env.VITE_STABILITY_API_KEY,
      elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY,
      azure: {
        key: import.meta.env.VITE_AZURE_TTS_KEY,
        region: import.meta.env.VITE_AZURE_REGION
      },
      assemblyai: import.meta.env.VITE_ASSEMBLYAI_API_KEY,
      bytez: import.meta.env.VITE_BYTEZ_API_KEY
    };
    
    // Provider priority order (fallback sequence)
    this.providerPriority = {
      text: ['openai', 'bytez'],
      image: ['stability', 'openai', 'bytez'],
      tts: ['elevenlabs', 'azure', 'bytez'],
      stt: ['assemblyai', 'openai', 'bytez']
    };
    
    // Initialize Bytez SDK if key is available
    if (this.apiKeys.bytez) {
      this.bytezSDK = new Bytez(this.apiKeys.bytez);
    }
  }

  /**
   * Generate text using the best available provider
   * @param {string} prompt - Text generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    const providers = this.providerPriority.text;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'openai':
            if (this.apiKeys.openai) {
              return await this.generateTextWithOpenAI(prompt, options);
            }
            break;
          case 'bytez':
            if (this.bytezSDK) {
              return await this.generateTextWithBytez(prompt, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Text generation failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    throw new Error('All text generation providers failed');
  }

  /**
   * Generate text using OpenAI GPT-4o/GPT-4o mini
   */
  async generateTextWithOpenAI(prompt, options = {}) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Generate text using Bytez SDK as fallback
   */
  async generateTextWithBytez(prompt, options = {}) {
    const model = this.bytezSDK.model(options.model || 'meta-llama/Llama-2-7b-chat-hf');
    await model.create();
    
    const { error, output } = await model.run(prompt, {
      max_new_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      ...options
    });
    
    if (error) {
      throw new Error(`Bytez error: ${error}`);
    }
    
    return output;
  }

  /**
   * Generate image using the best available provider
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated image URL or base64 data
   */
  async generateImage(prompt, options = {}) {
    const providers = this.providerPriority.image;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'stability':
            if (this.apiKeys.stability) {
              return await this.generateImageWithStability(prompt, options);
            }
            break;
          case 'openai':
            if (this.apiKeys.openai) {
              return await this.generateImageWithDalle(prompt, options);
            }
            break;
          case 'bytez':
            if (this.bytezSDK) {
              return await this.generateImageWithBytez(prompt, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Image generation failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    // If all providers failed, throw an error with more details
    const availableProviders = [];
    if (this.apiKeys.stability) availableProviders.push('Stability AI');
    if (this.apiKeys.openai) availableProviders.push('OpenAI');
    if (this.bytezSDK) availableProviders.push('Bytez');
    
    throw new Error(`All image generation providers failed. Available providers: ${availableProviders.join(', ') || 'None'}. Please check your API keys.`);
  }

  /**
   * Generate image using Stability AI
   */
  async generateImageWithStability(prompt, options = {}) {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.stability}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: options.cfgScale || 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: options.samples || 1,
        steps: options.steps || 30
      })
    });

    if (!response.ok) {
      throw new Error(`Stability AI API error: ${response.status}`);
    }

    const data = await response.json();
    // Return base64 encoded image
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }

  /**
   * Generate image using OpenAI DALL·E
   */
  async generateImageWithDalle(prompt, options = {}) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'dall-e-3',
        prompt: prompt,
        n: options.samples || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard'
      })
    });

    if (!response.ok) {
      throw new Error(`DALL·E API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }

  /**
   * Generate image using Bytez SDK as fallback
   */
  async generateImageWithBytez(prompt, options = {}) {
    const model = this.bytezSDK.model(options.model || 'dreamlike-art/dreamlike-photoreal-2.0');
    await model.create();
    
    const { error, output } = await model.run(prompt, {
      width: options.width || 512,
      height: options.height || 512,
      ...options
    });
    
    if (error) {
      throw new Error(`Bytez error: ${error}`);
    }
    
    // Return image URL
    return Array.isArray(output) ? output[0] : output;
  }

  /**
   * Convert text to speech using the best available provider
   * @param {string} text - Text to convert to speech
   * @param {Object} options - TTS options
   * @returns {Promise<string>} Audio file URL
   */
  async textToSpeech(text, options = {}) {
    const providers = this.providerPriority.tts;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'elevenlabs':
            if (this.apiKeys.elevenlabs) {
              return await this.textToSpeechWithElevenLabs(text, options);
            }
            break;
          case 'azure':
            if (this.apiKeys.azure.key) {
              return await this.textToSpeechWithAzure(text, options);
            }
            break;
          case 'bytez':
            if (this.bytezSDK) {
              return await this.textToSpeechWithBytez(text, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Text-to-speech failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    throw new Error('All text-to-speech providers failed');
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeechWithElevenLabs(text, options = {}) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': this.apiKeys.elevenlabs,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: options.modelId || 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));
  }

  /**
   * Convert text to speech using Azure TTS
   */
  async textToSpeechWithAzure(text, options = {}) {
    // Note: This is a simplified implementation
    // In practice, you would need to implement proper Azure TTS integration
    throw new Error('Azure TTS implementation pending');
  }

  /**
   * Convert text to speech using Bytez SDK as fallback
   */
  async textToSpeechWithBytez(text, options = {}) {
    // Note: This is a simplified implementation
    // Bytez may not have direct TTS support, so we might need to use a different approach
    throw new Error('Bytez TTS not implemented');
  }

  /**
   * Convert speech to text using the best available provider
   * @param {ArrayBuffer} audioBuffer - Audio file buffer
   * @param {Object} options - STT options
   * @returns {Promise<string>} Transcribed text
   */
  async speechToText(audioBuffer, options = {}) {
    const providers = this.providerPriority.stt;
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'assemblyai':
            if (this.apiKeys.assemblyai) {
              return await this.speechToTextWithAssemblyAI(audioBuffer, options);
            }
            break;
          case 'openai':
            if (this.apiKeys.openai) {
              return await this.speechToTextWithWhisper(audioBuffer, options);
            }
            break;
          case 'bytez':
            if (this.bytezSDK) {
              return await this.speechToTextWithBytez(audioBuffer, options);
            }
            break;
        }
      } catch (error) {
        console.warn(`Speech-to-text failed with ${provider}:`, error.message);
        // Continue to next provider
      }
    }
    
    throw new Error('All speech-to-text providers failed');
  }

  /**
   * Convert speech to text using Whisper (OpenAI)
   */
  async speechToTextWithWhisper(audioBuffer, options = {}) {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
    formData.append('model', options.model || 'whisper-1');
    formData.append('response_format', 'text');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    return await response.text();
  }

  /**
   * Convert speech to text using AssemblyAI
   */
  async speechToTextWithAssemblyAI(audioBuffer, options = {}) {
    // Upload audio file
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': this.apiKeys.assemblyai
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload error: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    
    // Transcribe audio
    const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': this.apiKeys.assemblyai,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: uploadData.upload_url,
        language_detection: options.detectLanguage || false
      })
    });

    if (!transcribeResponse.ok) {
      throw new Error(`AssemblyAI transcribe error: ${transcribeResponse.status}`);
    }

    const transcribeData = await transcribeResponse.json();
    const transcriptId = transcribeData.id;
    
    // Poll for completion
    let transcript;
    do {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': this.apiKeys.assemblyai
        }
      });
      transcript = await pollResponse.json();
    } while (transcript.status !== 'completed' && transcript.status !== 'error');
    
    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
    }
    
    return transcript.text;
  }

  /**
   * Convert speech to text using Bytez SDK as fallback
   */
  async speechToTextWithBytez(audioBuffer, options = {}) {
    // Note: This is a simplified implementation
    // Bytez may not have direct STT support, so we might need to use a different approach
    throw new Error('Bytez STT not implemented');
  }

  /**
   * Check if a specific provider is configured
   * @param {string} provider - Provider name
   * @returns {boolean} Whether the provider is configured
   */
  isProviderConfigured(provider) {
    switch (provider) {
      case 'openai':
        return !!this.apiKeys.openai;
      case 'stability':
        return !!this.apiKeys.stability;
      case 'elevenlabs':
        return !!this.apiKeys.elevenlabs;
      case 'azure':
        return !!this.apiKeys.azure.key;
      case 'assemblyai':
        return !!this.apiKeys.assemblyai;
      case 'bytez':
        return !!this.bytezSDK;
      default:
        return false;
    }
  }

  /**
   * Get list of available providers for a service type
   * @param {string} serviceType - Service type (text, image, tts, stt)
   * @returns {Array<string>} Available providers
   */
  getAvailableProviders(serviceType) {
    const providers = this.providerPriority[serviceType] || [];
    return providers.filter(provider => this.isProviderConfigured(provider));
  }
}

// Export singleton instance
export default new AIServiceRouter();