// Bot Service - Handles communication with backend APIs

import { api } from '@/services/apiClient';

export class BotService {
  /**
   * @type {BotService}
   */
  static instance;

  /**
   * @type {string}
   */
  baseUrl;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      'https://saas-backend-coki.onrender.com';
  }

  /**
   * @returns {BotService}
   */
  static getInstance() {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  /**
   * @param {string} message
   * @returns {Promise<import('./bot.types').BotMessage>}
   */
  async sendMessage(message) {
    try {
      const response = await api.post('/api/bot/chat', { message });
      const data = response.data;

      return {
        id: data.id || Date.now().toString(),
        text: data.response || data.text || "Sorry, I didn't understand that.",
        sender: 'bot',
        timestamp: new Date(data.timestamp || Date.now()),
        type: data.type || 'text',
        suggestions: data.suggestions || [],
      };
    } catch (error) {
      console.error('BotService: Error sending message', error);
      return {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
    }
  }

  /**
   * @returns {Promise<import('./bot.types').BotMessage[]>}
   */
  async getInitialMessages() {
    try {
      // In a real implementation, this might fetch conversation history
      return [
        {
          id: '1',
          text: "Hello! I'm your AI assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          suggestions: [
            'What courses are available?',
            'How do I enroll in a course?',
            'Tell me about certifications',
          ],
        },
      ];
    } catch (error) {
      console.error('BotService: Error fetching initial messages', error);
      return [];
    }
  }

  /**
   * @param {string} [context]
   * @returns {Promise<string[]>}
   */
  async getSuggestions(context) {
    try {
      const response = await api.post('/api/bot/suggestions', { context });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('BotService: Error fetching suggestions', error);
      // Return default suggestions
      return [
        'What courses are available?',
        'How do I enroll in a course?',
        'Tell me about certifications',
        'How do I reset my password?',
        'Where can I find my certificates?',
      ];
    }
  }
}

export default BotService.getInstance();
