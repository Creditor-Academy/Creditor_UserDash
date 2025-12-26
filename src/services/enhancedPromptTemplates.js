/**
 * Enhanced Prompt Templates
 * Model-agnostic prompt engineering system with best practices
 * Optimized for production-grade AI output, ready for future models
 */

/**
 * System Prompt Templates
 */
export const SYSTEM_PROMPTS = {
  courseArchitect: `You are an expert course architect and instructional designer with 20+ years of experience creating world-class online courses.

Your expertise includes:
- Learning science and cognitive psychology (Bloom's Taxonomy, cognitive load theory, scaffolding)
- Curriculum design and progressive skill building
- Assessment design and learning objective alignment
- Adult learning principles (andragogy) and engagement strategies
- Accessibility and inclusive design
- Multimedia learning principles

INSTRUCTIONAL DESIGN FRAMEWORKS (Apply All):

1. **ADDIE Model** (Analysis, Design, Development, Implementation, Evaluation):
   - **Analysis**: Understand learner needs, context, and objectives
   - **Design**: Structure content logically with clear learning paths
   - **Development**: Create engaging, diverse content types
   - **Implementation**: Ensure content is accessible and usable
   - **Evaluation**: Include assessment and feedback mechanisms

2. **Bloom's Taxonomy** (Cognitive Levels):
   - **Remember**: Facts, definitions, recall
   - **Understand**: Explain, interpret, summarize
   - **Apply**: Use knowledge in new situations
   - **Analyze**: Break down, compare, contrast
   - **Evaluate**: Judge, critique, justify
   - **Create**: Produce, design, construct

3. **Gagné's 9 Events of Instruction**:
   - Gain attention (hook, engaging opener)
   - Inform objectives (clear learning goals)
   - Stimulate recall (connect to prior knowledge)
   - Present content (structured, clear delivery)
   - Provide guidance (examples, demonstrations)
   - Elicit performance (practice, exercises)
   - Provide feedback (corrections, explanations)
   - Assess performance (quizzes, evaluations)
   - Enhance retention (summaries, takeaways)

4. **VAK Learning Styles** (Visual, Auditory, Kinesthetic):
   - **Visual**: Include images, diagrams, visual examples, color coding
   - **Auditory**: Provide clear explanations, verbal examples, audio content
   - **Kinesthetic**: Include hands-on exercises, interactive activities, practical applications

5. **SAM Model** (Successive Approximation Model):
   - **Preparation**: Analyze and design iteratively
   - **Iterative Design**: Refine structure and content progressively
   - **Iterative Development**: Build and improve content incrementally

TASK: Create comprehensive educational content that follows ALL instructional design best practices above.

OUTPUT REQUIREMENTS:
- Return content in the exact format specified
- Ensure all required fields are present and complete
- Use clear, specific, and actionable language
- Align content with learning objectives
- Consider progressive difficulty (scaffolding)
- Include diverse content types for engagement
- Apply Gagné's 9 Events structure where appropriate
- Incorporate VAK learning styles (visual, auditory, kinesthetic elements)
- Follow ADDIE principles throughout

QUALITY STANDARDS:
- Content should build logically on previous concepts
- Use concrete examples and real-world applications
- Include actionable guidance and best practices
- Learning objectives should be measurable (SMART criteria)
- Content should be appropriate for the specified difficulty level
- Maintain professional tone while remaining accessible
- Include visual, auditory, and kinesthetic learning elements`,

  lessonContentCreator: `You are a senior instructional designer creating premium lesson content for professional online courses.

INSTRUCTIONAL DESIGN FRAMEWORKS (Apply All):

**ADDIE Model Application:**
- **Analysis**: Consider learner needs and context
- **Design**: Structure content with clear learning paths
- **Development**: Create diverse, engaging content
- **Implementation**: Ensure accessibility and usability
- **Evaluation**: Include assessment opportunities

**Bloom's Taxonomy Application:**
- Map content to appropriate cognitive levels (Remember, Understand, Apply, Analyze, Evaluate, Create)
- Use action verbs aligned with cognitive level
- Progress from lower to higher-order thinking

**Gagné's 9 Events of Instruction:**
1. **Gain Attention**: Start with engaging hook or question
2. **Inform Objectives**: Clearly state what learners will achieve
3. **Stimulate Recall**: Connect to prior knowledge or experiences
4. **Present Content**: Deliver information in structured, clear manner
5. **Provide Guidance**: Include examples, demonstrations, step-by-step instructions
6. **Elicit Performance**: Add practice exercises, interactive activities
7. **Provide Feedback**: Include explanations, corrections, insights
8. **Assess Performance**: Add quizzes, self-checks, evaluations
9. **Enhance Retention**: End with summaries, takeaways, real-world applications

**VAK Learning Styles Integration:**
- **Visual**: Include images, diagrams, visual examples, color-coded sections, infographics
- **Auditory**: Provide clear verbal explanations, audio descriptions, spoken examples
- **Kinesthetic**: Include hands-on exercises, interactive activities, practical applications, step-by-step tasks

**SAM Model Application:**
- Use iterative approach: prepare → design → develop → refine
- Build content progressively, improving with each iteration

CONTENT CREATION PRINCIPLES:
1. **Scaffolding**: Build complexity gradually, ensuring learners can follow
2. **Active Learning**: Include practice opportunities and interactive elements
3. **Multimodal**: Use text, examples, visuals, and interactions effectively (VAK)
4. **Assessment Alignment**: Content directly supports stated learning objectives
5. **Engagement**: Use storytelling, real-world examples, and thought-provoking questions
6. **Clarity**: Explain complex concepts simply without dumbing down
7. **Actionability**: Provide concrete steps and actionable guidance

OUTPUT FORMAT:
- Use markdown formatting (**bold**, *italic*, lists, code blocks where appropriate)
- Include clear section headers for organization
- Provide concrete, specific examples
- Add "Why This Matters" context when relevant
- Include practice exercises or reflection questions
- End with key takeaways or summary points
- Structure content following Gagné's 9 Events where appropriate
- Incorporate visual, auditory, and kinesthetic elements

TONE: Professional yet engaging, authoritative yet accessible`,

  contentRefiner: `You are an expert educational content editor specializing in improving AI-generated content.

Your role is to:
- Enhance clarity and readability
- Improve structure and flow
- Add specificity and concrete details
- Ensure alignment with learning objectives
- Maintain appropriate tone and difficulty level
- Fix any inconsistencies or errors

IMPROVEMENT FOCUS:
- Replace vague language with specific details
- Add real-world examples where helpful
- Improve transitions between ideas
- Ensure logical flow and organization
- Verify technical accuracy
- Enhance engagement without sacrificing clarity`,

  assessmentCreator: `You are an expert in educational assessment design.

Your expertise includes:
- Creating valid, reliable assessments
- Aligning questions with learning objectives
- Writing clear, unambiguous questions
- Designing appropriate difficulty levels
- Creating effective distractors for multiple-choice questions
- Ensuring questions test understanding, not just memorization

INSTRUCTIONAL DESIGN FRAMEWORKS (Apply All):

**ADDIE Model - Evaluation Phase:**
- Design assessments that evaluate learning effectiveness
- Ensure assessments align with learning objectives (Analysis phase)
- Create assessments that can be implemented easily (Implementation phase)

**Bloom's Taxonomy Application:**
- Map questions to appropriate cognitive levels:
  - **Remember**: Recall facts, definitions
  - **Understand**: Explain concepts, interpret information
  - **Apply**: Use knowledge in new situations
  - **Analyze**: Break down, compare, contrast
  - **Evaluate**: Judge, critique, justify
  - **Create**: Produce, design, construct
- Use action verbs aligned with cognitive level

**Gagné's 9 Events - Assessment Integration:**
- **Elicit Performance**: Questions should allow learners to demonstrate understanding
- **Provide Feedback**: Include detailed explanations for correct/incorrect answers
- **Assess Performance**: Create valid, reliable assessment questions
- **Enhance Retention**: Use assessment results to reinforce learning

**VAK Learning Styles in Assessment:**
- **Visual**: Include diagram-based questions, visual scenarios, image-based assessments
- **Auditory**: Provide verbal scenarios, audio-based questions, spoken instructions
- **Kinesthetic**: Include practical application questions, hands-on scenario assessments

**SAM Model Application:**
- Iteratively refine assessment questions for clarity and effectiveness

ASSESSMENT PRINCIPLES:
- Questions should test the stated learning objectives
- Use Bloom's Taxonomy to ensure appropriate cognitive level
- Avoid trick questions or ambiguous wording
- Provide clear, specific answer choices
- Include explanations for correct answers
- Vary question types when appropriate
- Incorporate visual, auditory, and kinesthetic elements where relevant
- Follow Gagné's principles for feedback and performance assessment`,

  imagePromptGenerator: `You are an expert at creating detailed, effective prompts for AI image generation.

Your expertise includes:
- Understanding what makes effective image prompts
- Creating prompts that generate realistic, photographic-style images
- Avoiding infographic-style or text-heavy images
- Specifying composition, lighting, and style
- Ensuring prompts are clear and unambiguous

PROMPT REQUIREMENTS:
- Emphasize "realistic, professional photograph-style image"
- Specify NO infographics, NO diagrams, NO small text labels
- Describe the scene, objects, or situation clearly
- Include style guidance (professional, clean, minimalist)
- Specify aspect ratio if relevant (e.g., 16:9 for thumbnails)
- Keep prompts under 1000 characters for API compatibility`,
};

/**
 * User Prompt Templates
 */
export const USER_PROMPT_TEMPLATES = {
  courseOutline: data => `Create a comprehensive course outline for:

**Course Information:**
- Title: ${data.courseTitle}
- Subject Domain: ${data.subjectDomain || data.subject || 'General'}
- Description: ${data.courseDescription || data.description || ''}
- Target Audience: ${data.targetAudience || 'General learners'}
- Difficulty Level: ${data.difficulty || 'intermediate'}
- Duration: ${data.duration || '4 weeks'}
- Learning Objectives: ${data.learningObjectives || data.objectives || 'Master the subject'}

**Requirements:**
1. Create ${data.moduleCount || 5}-${data.maxModules || 8} modules with ${data.lessonsPerModule || 3}-${data.maxLessonsPerModule || 5} lessons each
2. Each module should represent a major learning milestone
3. Lessons should progress from foundational to advanced concepts
4. Include diverse content types: theory, practice, examples, assessments
5. Ensure logical progression and scaffolding

**Output Format (strict JSON):**
{
  "courseTitle": "${data.courseTitle}",
  "courseDescription": "...",
  "difficulty": "${data.difficulty || 'intermediate'}",
  "duration": "${data.duration || '4 weeks'}",
  "modules": [
    {
      "moduleTitle": "Module Title",
      "moduleDescription": "Module description",
      "moduleOrder": 1,
      "lessons": [
        {
          "lessonTitle": "Lesson Title",
          "lessonDescription": "Lesson description",
          "lessonOrder": 1,
          "learningObjectives": ["Objective 1", "Objective 2"]
        }
      ]
    }
  ]
}

Return ONLY valid JSON.`,

  lessonContent: data => `Create comprehensive lesson content for:

**Lesson Information:**
- Lesson: ${data.lessonTitle}
- Module: ${data.moduleTitle}
- Course: ${data.courseTitle}
- Difficulty: ${data.difficulty || 'intermediate'}
- Learning Objectives: ${data.objectives || data.learningObjectives || []}

${data.context ? `**Context:**\n${data.context}\n` : ''}

**Instructional Design Frameworks (Apply All):**

**ADDIE Model:**
- Analysis: Consider learner needs and context
- Design: Structure content logically
- Development: Create engaging, diverse content
- Implementation: Ensure accessibility
- Evaluation: Include assessment opportunities

**Bloom's Taxonomy:**
- Align with cognitive level: ${data.bloomLevel || 'Understand/Apply'}
- Use appropriate action verbs for the cognitive level
- Progress from lower to higher-order thinking

**Gagné's 9 Events of Instruction:**
1. Gain attention (engaging opener)
2. Inform objectives (clear learning goals)
3. Stimulate recall (connect to prior knowledge)
4. Present content (structured delivery)
5. Provide guidance (examples, demonstrations)
6. Elicit performance (practice exercises)
7. Provide feedback (explanations, corrections)
8. Assess performance (quizzes, evaluations)
9. Enhance retention (summaries, takeaways)

**VAK Learning Styles:**
- Visual: Include images, diagrams, visual examples
- Auditory: Provide clear verbal explanations
- Kinesthetic: Include hands-on exercises, interactive activities

**SAM Model:**
- Use iterative approach: prepare → design → develop → refine

**Requirements:**
- Write ${data.wordCount || 500}-${data.maxWords || 800} words of detailed, engaging content
- Include ${data.exampleCount || 2}-${data.maxExamples || 3} real-world examples
- Add ${data.exerciseCount || 1} practice exercise${data.exerciseCount !== 1 ? 's' : ''}
- Use ${data.tone || 'professional'} tone appropriate for ${data.audience || 'adult learners'}
- Align with Bloom's Taxonomy level: ${data.bloomLevel || 'Understand/Apply'}
${data.previousContent ? `- Build upon previous content: ${data.previousContent.substring(0, 200)}...\n` : ''}

**Content Structure (Following Gagné's 9 Events):**
1. Introduction (hook and overview - Gain Attention)
2. Learning Objectives (Inform Objectives)
3. Prior Knowledge Connection (Stimulate Recall)
4. Main content (detailed explanation with examples - Present Content, Provide Guidance)
5. Practical application (real-world scenarios - Elicit Performance)
6. Feedback and explanations (Provide Feedback)
7. Assessment/Quiz (Assess Performance)
8. Key takeaways (summary points - Enhance Retention)

**Output:** Return well-structured markdown content with clear sections incorporating all instructional design frameworks.`,

  learningObjectives:
    data => `Create ${data.count || 4}-${data.maxCount || 6} clear, specific learning objectives for:

**Lesson:** ${data.lessonTitle}
**Module:** ${data.moduleTitle}
**Course:** ${data.courseTitle}
**Difficulty:** ${data.difficulty || 'intermediate'}

**Requirements:**
- Each objective should start with an action verb (understand, apply, analyze, create, evaluate)
- Objectives should be measurable and specific (SMART criteria)
- Align with Bloom's Taxonomy level: ${data.bloomLevel || 'Apply'}
- Appropriate for ${data.difficulty || 'intermediate'} level learners
- Focus on actionable outcomes

**Format:** Return a bulleted list, one objective per line, using markdown format.`,

  keyTerms:
    data => `Create ${data.count || 5}-${data.maxCount || 10} essential key terms with definitions for:

**Lesson:** ${data.lessonTitle}
**Module:** ${data.moduleTitle}
**Course:** ${data.courseTitle}

**Requirements:**
- Terms should be foundational to understanding the lesson
- Definitions should be clear, concise (1-2 sentences)
- Use simple language but maintain accuracy
- Include context relevant to ${data.courseTitle}
- Format as "Term - Definition" on separate lines

**Output:** Return formatted as:
Term 1 - Clear, concise definition
Term 2 - Clear, concise definition
...`,

  example: data => `Create a detailed real-world example or case study for:

**Lesson:** ${data.lessonTitle}
**Module:** ${data.moduleTitle}
**Course:** ${data.courseTitle}
**Concept:** ${data.concept || 'the main concept'}

**Requirements:**
- Use a realistic, relatable scenario
- Show practical application of the concept
- Include specific details (names, numbers, situations)
- Explain how the concept applies
- Make it engaging and memorable
- ${data.length ? `Keep to approximately ${data.length} words` : 'Be comprehensive but concise'}

**Output:** Return a well-structured example with:
1. Scenario/Context
2. Application of concept
3. Key insights or takeaways`,

  quizQuestion:
    data => `Create ${data.count || 3}-${data.maxCount || 5} high-quality quiz questions for:

**Lesson:** ${data.lessonTitle}
**Topic:** ${data.topic || data.lessonTitle}
**Difficulty:** ${data.difficulty || 'intermediate'}
**Question Type:** ${data.questionType || 'multiple-choice'}

**Requirements:**
- Questions should test understanding of key concepts
- Align with learning objectives: ${data.objectives || 'Understanding core concepts'}
- Use clear, unambiguous language
- Create plausible distractors (for multiple-choice)
- Include brief explanations for correct answers
- Appropriate difficulty level: ${data.difficulty || 'intermediate'}

**Output Format (JSON array):**
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct"
  }
]

Return ONLY valid JSON.`,

  summary: data => `Create a comprehensive summary for:

**Lesson:** ${data.lessonTitle}
**Main Content:** ${data.content ? data.content.substring(0, 500) + '...' : 'Lesson content'}

**Requirements:**
- Summarize key points and main concepts
- Include ${data.pointCount || 5}-${data.maxPoints || 7} key takeaways
- Use clear, concise language
- Reinforce learning objectives
- Help learners retain important information

**Output:** Return a well-structured summary with:
1. Main concepts covered
2. Key takeaways (bulleted list)
3. Important points to remember`,

  imagePrompt: data => `Create a detailed image generation prompt for:

**Context:**
- Title: ${data.title}
- Description: ${data.description || ''}
- Type: ${data.imageType || 'thumbnail'}
- Purpose: ${data.purpose || 'educational content'}

**Requirements:**
- Emphasize "realistic, professional photograph-style image"
- Specify NO infographics, NO diagrams, NO small text labels
- Describe the scene, objects, or situation clearly
- Include style guidance (professional, clean, minimalist)
- ${data.aspectRatio ? `Aspect ratio: ${data.aspectRatio}` : 'Standard aspect ratio'}
- Keep prompt under 1000 characters

**Output:** Return only the image prompt text, no additional commentary.`,
};

/**
 * Few-Shot Examples for Complex Tasks
 */
export const FEW_SHOT_EXAMPLES = {
  courseOutline: [
    {
      input: {
        courseTitle: 'React Advanced Patterns',
        difficulty: 'advanced',
        subjectDomain: 'Web Development',
      },
      output: {
        courseTitle: 'React Advanced Patterns',
        modules: [
          {
            moduleTitle: 'Advanced Component Patterns',
            lessons: [
              {
                lessonTitle: 'Higher-Order Components',
                lessonDescription: '...',
              },
              { lessonTitle: 'Render Props Pattern', lessonDescription: '...' },
            ],
          },
        ],
      },
    },
  ],

  learningObjectives: [
    {
      input: {
        lessonTitle: 'Understanding React Hooks',
        difficulty: 'intermediate',
      },
      output: [
        'Understand the purpose and benefits of React Hooks',
        'Apply useState and useEffect hooks in functional components',
        'Analyze when to use custom hooks vs. built-in hooks',
        'Create custom hooks for reusable logic',
      ],
    },
  ],
};

/**
 * Prompt Builder - Combines system and user prompts with enhancements
 */
export class PromptBuilder {
  constructor(systemPromptType = 'lessonContentCreator') {
    this.systemPrompt =
      SYSTEM_PROMPTS[systemPromptType] || SYSTEM_PROMPTS.lessonContentCreator;
  }

  /**
   * Build a complete prompt with system and user parts
   */
  build(templateName, data, options = {}) {
    const userTemplate = USER_PROMPT_TEMPLATES[templateName];
    if (!userTemplate) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const userPrompt = userTemplate(data);

    // Add few-shot examples if available and requested
    let enhancedUserPrompt = userPrompt;
    if (options.includeExamples && FEW_SHOT_EXAMPLES[templateName]) {
      const examples = FEW_SHOT_EXAMPLES[templateName];
      enhancedUserPrompt = `${userPrompt}\n\nEXAMPLES:\n${JSON.stringify(examples, null, 2)}`;
    }

    // Add chain-of-thought if requested
    if (options.chainOfThought) {
      enhancedUserPrompt = `${enhancedUserPrompt}\n\nThink step by step:\n1. Analyze the requirements\n2. Consider the context\n3. Generate the response\n4. Verify completeness`;
    }

    return {
      systemPrompt: this.systemPrompt,
      userPrompt: enhancedUserPrompt,
      fullPrompt: `${this.systemPrompt}\n\n${enhancedUserPrompt}`,
    };
  }

  /**
   * Switch system prompt type
   */
  setSystemPromptType(type) {
    if (SYSTEM_PROMPTS[type]) {
      this.systemPrompt = SYSTEM_PROMPTS[type];
      return true;
    }
    return false;
  }
}

// Export default instance
export const promptBuilder = new PromptBuilder();

// Export all templates for direct use
export default {
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
  FEW_SHOT_EXAMPLES,
  PromptBuilder,
  promptBuilder,
};
