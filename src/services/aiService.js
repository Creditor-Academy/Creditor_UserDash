// AI Service - Integrated OpenAI and Deep AI for Course Creation
import OpenAI from 'openai';

/**
 * AI Service class that handles both text generation (OpenAI) and image generation (Deep AI)
 */
class AIService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your_openai_api_key_here',
      dangerouslyAllowBrowser: true, // Enable browser usage
    });

    // Deep AI configuration
    this.deepAIKey =
      import.meta.env.VITE_DEEPAI_API_KEY || 'your_deepai_api_key_here';
  }

  /**
   * Generate course outline using OpenAI
   * @param {Object} courseData - Course information
   * @returns {Promise<Object>} Generated course outline
   */
  async generateCourseOutline(courseData) {
    try {
      console.log('🤖 Generating course outline with OpenAI...');

      const prompt = `Create a comprehensive course outline for "${courseData.title}".
      
Course Details:
- Subject: ${courseData.subject || courseData.title}
- Description: ${courseData.description || 'Not provided'}
- Target Audience: ${courseData.targetAudience || 'General learners'}
- Difficulty: ${courseData.difficulty || 'beginner'}
- Duration: ${courseData.duration || '4 weeks'}

Please create a structured course with:
- 4 modules
- Each module should have 2-3 lessons
- Include clear learning objectives
- Make it practical and engaging

Format the response as JSON with this structure:
{
  "course_title": "Course Title",
  "modules": [
    {
      "module_title": "Module Name",
      "description": "Module description",
      "lessons": [
        {
          "lesson_title": "Lesson Name",
          "description": "Lesson description",
          "duration": "15 min"
        }
      ]
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert course designer. Create well-structured, educational course outlines in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Try to parse JSON response
      let courseOutline;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) ||
          content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        courseOutline = JSON.parse(jsonString);
      } catch (parseError) {
        console.warn('Failed to parse JSON, using fallback structure');
        courseOutline = this.createFallbackOutline(courseData);
      }

      return {
        success: true,
        data: courseOutline,
      };
    } catch (error) {
      console.error('OpenAI course outline generation failed:', error);

      // Return fallback structure
      return {
        success: false,
        data: this.createFallbackOutline(courseData),
        error: error.message,
      };
    }
  }

  /**
   * Generate lesson content using OpenAI
   * @param {string} lessonTitle - Title of the lesson
   * @param {string} moduleTitle - Title of the module
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated lesson content
   */
  async generateLessonContent(lessonTitle, moduleTitle, options = {}) {
    try {
      console.log('📝 Generating lesson content with OpenAI...');

      const prompt = `Create detailed lesson content for "${lessonTitle}" in the module "${moduleTitle}".

Lesson Requirements:
- Target Level: ${options.difficulty || 'beginner'}
- Duration: ${options.duration || '15-20 minutes'}
- Format: Educational and engaging

Please create structured lesson content with:
1. Introduction (2-3 sentences)
2. Main Content (3-4 key points with explanations)
3. Practical Examples (2-3 examples)
4. Key Takeaways (3-4 bullet points)
5. Summary (2-3 sentences)

Format as JSON:
{
  "introduction": "Lesson introduction text",
  "mainContent": [
    "Key point 1 with detailed explanation",
    "Key point 2 with detailed explanation",
    "Key point 3 with detailed explanation"
  ],
  "examples": [
    {
      "title": "Example 1 Title",
      "description": "Example description and explanation"
    }
  ],
  "keyTakeaways": [
    "Important takeaway 1",
    "Important takeaway 2"
  ],
  "summary": "Lesson summary text"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert educator. Create comprehensive, well-structured lesson content in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.6,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse JSON response
      let lessonContent;
      try {
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) ||
          content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        lessonContent = JSON.parse(jsonString);
      } catch (parseError) {
        console.warn('Failed to parse lesson JSON, using fallback');
        lessonContent = {
          introduction: `Welcome to ${lessonTitle}. In this lesson, we'll explore the key concepts and practical applications.`,
          mainContent: [
            `Understanding the fundamentals of ${lessonTitle}`,
            `Practical applications and real-world examples`,
            `Best practices and common pitfalls to avoid`,
          ],
          examples: [
            {
              title: 'Basic Example',
              description: `A simple example demonstrating ${lessonTitle} concepts`,
            },
          ],
          keyTakeaways: [
            `Master the core concepts of ${lessonTitle}`,
            'Apply knowledge to real-world scenarios',
            'Understand best practices and avoid common mistakes',
          ],
          summary: `In this lesson, you learned about ${lessonTitle} and how to apply these concepts effectively.`,
        };
      }

      return {
        success: true,
        data: lessonContent,
      };
    } catch (error) {
      console.error('OpenAI lesson content generation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate course image using Deep AI
   * @param {string} prompt - Image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateCourseImage(prompt, options = {}) {
    try {
      console.log('🎨 Generating course image with Deep AI...');

      // Create form data for Deep AI
      const formData = new FormData();
      formData.append('text', prompt);

      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
          'Api-Key': this.deepAIKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deep AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.output_url) {
        console.log('✅ Image generated successfully');
        return {
          success: true,
          data: {
            url: data.output_url,
            prompt: prompt,
            style: options.style || 'realistic',
            size: options.size || '1024x1024',
            createdAt: new Date().toISOString(),
          },
        };
      } else {
        throw new Error('No output_url in Deep AI response');
      }
    } catch (error) {
      console.error('Deep AI image generation failed:', error);

      // Return placeholder image as fallback
      const placeholderColor = '6366f1';
      const placeholderText = encodeURIComponent('Course Image');

      return {
        success: false,
        data: {
          url: `https://via.placeholder.com/1024x1024/${placeholderColor}/ffffff?text=${placeholderText}`,
          prompt: prompt,
          style: 'placeholder',
          size: '1024x1024',
          createdAt: new Date().toISOString(),
        },
        error: error.message,
      };
    }
  }

  /**
   * Generate Q&A pairs for assessment
   * @param {string} topic - Topic for questions
   * @param {number} count - Number of Q&A pairs
   * @returns {Promise<Object>} Generated Q&A pairs
   */
  async generateQAPairs(topic, count = 5) {
    try {
      console.log('❓ Generating Q&A pairs with OpenAI...');

      const prompt = `Create ${count} educational quiz questions about "${topic}".

For each question, provide:
- A clear, specific question
- A comprehensive answer
- Appropriate difficulty level

Format as JSON:
{
  "qa": [
    {
      "question": "Question text here?",
      "answer": "Detailed answer explanation"
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert educator creating quiz questions. Make questions clear, educational, and appropriately challenging.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.6,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse JSON response
      let qaData;
      try {
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) ||
          content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        qaData = JSON.parse(jsonString);
      } catch (parseError) {
        console.warn('Failed to parse Q&A JSON, using fallback');
        qaData = {
          qa: Array.from({ length: count }, (_, i) => ({
            question: `What is an important concept about ${topic}? (Question ${i + 1})`,
            answer: `This is a fundamental concept related to ${topic} that students should understand.`,
          })),
        };
      }

      return {
        success: true,
        data: qaData,
      };
    } catch (error) {
      console.error('OpenAI Q&A generation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create fallback course outline structure
   * @param {Object} courseData - Course information
   * @returns {Object} Fallback course structure
   */
  createFallbackOutline(courseData) {
    const subject = courseData.subject || courseData.title;

    return {
      course_title: courseData.title,
      modules: [
        {
          module_title: `Introduction to ${subject}`,
          description: `Foundational concepts and overview of ${subject}`,
          lessons: [
            {
              lesson_title: `What is ${subject}?`,
              description: 'Understanding the basics and core concepts',
              duration: '15 min',
            },
            {
              lesson_title: `Why Learn ${subject}?`,
              description: 'Benefits and real-world applications',
              duration: '10 min',
            },
            {
              lesson_title: 'Getting Started',
              description: 'Setting up your learning environment',
              duration: '20 min',
            },
          ],
        },
        {
          module_title: `${subject} Fundamentals`,
          description: 'Core principles and essential knowledge',
          lessons: [
            {
              lesson_title: 'Key Concepts',
              description: 'Essential terminology and principles',
              duration: '25 min',
            },
            {
              lesson_title: 'Basic Techniques',
              description: 'Fundamental methods and approaches',
              duration: '30 min',
            },
          ],
        },
        {
          module_title: `Practical ${subject}`,
          description: 'Hands-on experience and real-world applications',
          lessons: [
            {
              lesson_title: 'Hands-on Practice',
              description: 'Apply concepts through practical exercises',
              duration: '45 min',
            },
          ],
        },
        {
          module_title: `Advanced ${subject}`,
          description: 'Expert-level concepts and advanced techniques',
          lessons: [
            {
              lesson_title: 'Advanced Concepts',
              description: 'Complex topics and advanced applications',
              duration: '40 min',
            },
          ],
        },
      ],
    };
  }

  /**
   * Test API connections
   * @returns {Promise<Object>} Test results
   */
  async testAPIs() {
    const results = {
      openai: { available: false, error: null },
      deepai: { available: false, error: null },
    };

    // Test OpenAI
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });

      if (response.choices?.[0]?.message?.content) {
        results.openai.available = true;
      }
    } catch (error) {
      results.openai.error = error.message;
    }

    // Test Deep AI
    try {
      const formData = new FormData();
      formData.append('text', 'test image');

      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: { 'Api-Key': this.deepAIKey },
        body: formData,
      });

      if (response.ok) {
        results.deepai.available = true;
      } else {
        results.deepai.error = `HTTP ${response.status}`;
      }
    } catch (error) {
      results.deepai.error = error.message;
    }

    return results;
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;

// Export individual methods for convenience
export const {
  generateCourseOutline,
  generateLessonContent,
  generateCourseImage,
  generateQAPairs,
  testAPIs,
} = aiService;
