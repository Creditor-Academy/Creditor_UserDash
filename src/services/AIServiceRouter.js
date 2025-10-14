// AIServiceRouter.js - Multi-provider AI service router

class AIServiceRouter {
  constructor() {
    // API Keys from environment variables
    this.apiKeys = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      stability: import.meta.env.VITE_STABILITY_API_KEY,
      elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY,
      assemblyai: import.meta.env.VITE_ASSEMBLYAI_API_KEY
    };
    
    // Provider priority order (fallback sequence)
    this.providerPriority = {
      text: ['openai'],
      image: ['stability', 'openai'],
      tts: ['elevenlabs'],
      stt: ['assemblyai', 'openai']
    };
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
      case 'assemblyai':
        return !!this.apiKeys.assemblyai;
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