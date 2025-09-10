// AI Proxy Service - Clean frontend interface, no implementation details exposed
class AIProxyService {
  constructor() {
    this.baseURL = '/api/ai-proxy';
  }

  // Generic request handler
  async makeRequest(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`AI Proxy request failed:`, error);
      throw error;
    }
  }

  // Generate course outline with modules and lessons
  async generateCourseOutline(courseData) {
    try {
      const response = await fetch(`${this.baseURL}/generate-outline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Course outline generation failed:', error);
      
      // Return fallback structure for any course topic
      return {
        success: true,
        generated_text: `Course: ${courseData.title}\n\nModule 1: Introduction to ${courseData.subject}\n- Overview and fundamentals\n- Key concepts\n- Getting started\n\nModule 2: ${courseData.subject} Fundamentals\n- Core principles\n- Essential techniques\n- Best practices\n\nModule 3: Practical ${courseData.subject}\n- Hands-on examples\n- Real-world applications\n- Project work\n\nModule 4: Advanced ${courseData.subject}\n- Expert techniques\n- Optimization\n- Industry standards`,
        modules: this.generateFallbackModules(courseData)
      };
    }
  }

  // Generate fallback modules for any course topic
  generateFallbackModules(courseData) {
    const subject = courseData.subject || courseData.title;
    return [
      {
        id: 1,
        title: `Introduction to ${subject}`,
        lessons: [
          `What is ${subject}?`,
          'Course Overview',
          'Learning Objectives', 
          'Prerequisites',
          'Getting Started'
        ]
      },
      {
        id: 2,
        title: `${subject} Fundamentals`,
        lessons: [
          'Core Concepts',
          'Key Principles',
          'Essential Terminology',
          'Foundation Knowledge',
          'Basic Techniques'
        ]
      },
      {
        id: 3,
        title: `Practical ${subject}`,
        lessons: [
          'Hands-on Examples',
          'Real-world Applications',
          'Best Practices',
          'Common Patterns',
          'Project Work'
        ]
      },
      {
        id: 4,
        title: `Advanced ${subject}`,
        lessons: [
          'Advanced Techniques',
          'Optimization Strategies',
          'Industry Standards',
          'Expert Tips',
          'Complex Scenarios'
        ]
      },
      {
        id: 5,
        title: `${subject} in Practice`,
        lessons: [
          'Case Studies',
          'Problem Solving',
          'Troubleshooting',
          'Performance',
          'Maintenance'
        ]
      },
      {
        id: 6,
        title: 'Assessment and Next Steps',
        lessons: [
          'Knowledge Check',
          'Practical Projects',
          'Final Assessment',
          'Career Paths',
          'Continued Learning'
        ]
      }
    ];
  }

  // Text Summarization - No model details exposed
  async summarizeContent(content, options = {}) {
    try {
      const result = await this.makeRequest('/summarize', { content, options });
      
      if (result.success) {
        return {
          success: true,
          summary: result.summary,
          generated_text: result.summary,
          originalLength: result.originalLength,
          summaryLength: result.summaryLength,
          model: 'AI Assistant'
        };
      } else {
        throw new Error('Summarization failed');
      }
    } catch (error) {
      // Fallback summary
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const summaryLength = options.length === 'short' ? 1 : options.length === 'long' ? 3 : 2;
      const fallbackSummary = sentences.slice(0, summaryLength).join('. ') + '.';
      
      return {
        success: false,
        summary: fallbackSummary,
        generated_text: fallbackSummary,
        model: 'fallback',
        error: 'AI service unavailable'
      };
    }
  }

  // Question Answering - No model details exposed
  async answerQuestion(question, context = '', options = {}) {
    try {
      const result = await this.makeRequest('/question', { question, context });
      
      if (result.success) {
        return {
          success: true,
          answer: result.answer,
          model: 'AI Assistant',
          question: question,
          context: context
        };
      } else {
        throw new Error('Question answering failed');
      }
    } catch (error) {
      // Fallback answer
      const fallbackAnswer = this.generateFallbackAnswer(question, context);
      
      return {
        success: false,
        answer: fallbackAnswer,
        model: 'fallback',
        question: question,
        context: context,
        error: 'AI service unavailable'
      };
    }
  }

  // Image Generation - No model details exposed
  async generateImage(prompt, options = {}) {
    try {
      const result = await this.makeRequest('/image', { prompt, options });
      
      if (result.success) {
        return {
          success: true,
          imageUrl: result.imageUrl,
          prompt: prompt,
          model: 'AI Assistant'
        };
      } else {
        throw new Error('Image generation failed');
      }
    } catch (error) {
      return {
        success: false,
        imageUrl: 'https://via.placeholder.com/512x512?text=Image+Generation+Unavailable',
        prompt: prompt,
        model: 'fallback',
        error: 'AI service unavailable'
      };
    }
  }

  // Service Status Check
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`);
      return await response.json();
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  }

  // Fallback answer generator
  generateFallbackAnswer(question, context = '') {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('what') || questionLower.includes('define')) {
      return `This question asks for a definition or explanation of "${question}". ${context ? 'Based on the provided context, ' : ''}please refer to educational resources for detailed information.`;
    } else if (questionLower.includes('how')) {
      return `This question asks about the process for "${question}". ${context ? 'The context may contain relevant steps. ' : ''}Consider breaking this into smaller, specific steps.`;
    } else if (questionLower.includes('why')) {
      return `This question seeks to understand the reasoning behind "${question}". ${context ? 'The provided context may offer insights. ' : ''}Consider exploring the fundamental concepts involved.`;
    } else {
      return `I apologize, but I cannot process your question "${question}" at the moment. ${context ? 'While context was provided, ' : ''}Please try rephrasing your question.`;
    }
  }
}

export default new AIProxyService();
