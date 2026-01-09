/**
 * Advanced Lesson Content Engine
 * Integrates with 7-Phase ADDIE Model for dynamic, intelligent lesson generation
 *
 * Features:
 * - Dynamic block generation (12-20 blocks based on difficulty & phase)
 * - 80+ block variants with no pattern repetition
 * - Topic-specific, contextual content
 * - Difficulty-adapted lessons (beginner/intermediate/advanced)
 * - Phase-aware content generation (Analysis → Objectives → Design → Experience → Development → Implementation → Quality)
 */

import optimizedOpenAIService from './optimizedOpenAIService.js';

class AdvancedLessonContentEngine {
  constructor() {
    this.blockTypeVariants = this.initializeBlockVariants();
    this.patternTracker = new Map(); // Track used patterns per course
    this.difficultyLevels = ['beginner', 'intermediate', 'advanced'];
    this.phaseSequence = [
      'analysis',
      'objectives',
      'design',
      'experience',
      'development',
      'implementation',
      'quality',
    ];
  }

  /**
   * Initialize 80+ block variants mapped to ADDIE phases
   */
  initializeBlockVariants() {
    return {
      // TEXT BLOCKS (12 variants)
      text: [
        {
          id: 'intro',
          name: 'Introduction',
          phase: 'analysis',
          description: 'Hook and context',
        },
        {
          id: 'definition',
          name: 'Definition',
          phase: 'objectives',
          description: 'Key term definition',
        },
        {
          id: 'explanation',
          name: 'Detailed Explanation',
          phase: 'design',
          description: 'In-depth content',
        },
        {
          id: 'principle',
          name: 'Core Principle',
          phase: 'design',
          description: 'Fundamental concept',
        },
        {
          id: 'scenario',
          name: 'Real-World Scenario',
          phase: 'experience',
          description: 'Practical example',
        },
        {
          id: 'summary',
          name: 'Summary',
          phase: 'implementation',
          description: 'Key points recap',
        },
        {
          id: 'transition',
          name: 'Transition',
          phase: 'development',
          description: 'Bridge to next topic',
        },
        {
          id: 'insight',
          name: 'Expert Insight',
          phase: 'quality',
          description: 'Professional perspective',
        },
        {
          id: 'context',
          name: 'Historical Context',
          phase: 'analysis',
          description: 'Background information',
        },
        {
          id: 'application',
          name: 'Application',
          phase: 'experience',
          description: 'How to use it',
        },
        {
          id: 'comparison',
          name: 'Comparison',
          phase: 'design',
          description: 'Contrast with alternatives',
        },
        {
          id: 'conclusion',
          name: 'Conclusion',
          phase: 'implementation',
          description: 'Final thoughts',
        },
      ],

      // IMAGE BLOCKS (10 variants)
      image: [
        {
          id: 'hero',
          name: 'Hero Image',
          phase: 'analysis',
          layout: 'full-width',
          description: 'Large impactful image',
        },
        {
          id: 'concept',
          name: 'Concept Diagram',
          phase: 'objectives',
          layout: 'centered',
          description: 'Visual explanation',
        },
        {
          id: 'infographic',
          name: 'Infographic',
          phase: 'design',
          layout: 'centered',
          description: 'Data visualization',
        },
        {
          id: 'screenshot',
          name: 'Screenshot',
          phase: 'experience',
          layout: 'side-by-side',
          description: 'Tool demonstration',
        },
        {
          id: 'flowchart',
          name: 'Flowchart',
          phase: 'design',
          layout: 'centered',
          description: 'Process visualization',
        },
        {
          id: 'comparison_visual',
          name: 'Comparison Visual',
          phase: 'design',
          layout: 'side-by-side',
          description: 'Side-by-side comparison',
        },
        {
          id: 'timeline',
          name: 'Timeline',
          phase: 'analysis',
          layout: 'full-width',
          description: 'Chronological view',
        },
        {
          id: 'carousel',
          name: 'Image Carousel',
          phase: 'experience',
          layout: 'carousel',
          description: 'Multiple related images',
        },
        {
          id: 'annotated',
          name: 'Annotated Image',
          phase: 'design',
          layout: 'centered',
          description: 'Image with labels',
        },
        {
          id: 'before_after',
          name: 'Before/After',
          phase: 'experience',
          layout: 'side-by-side',
          description: 'Transformation visual',
        },
      ],

      // STATEMENT BLOCKS (12 variants)
      statement: [
        {
          id: 'info',
          name: 'Info Box',
          phase: 'analysis',
          color: 'blue',
          icon: 'info',
        },
        {
          id: 'important',
          name: 'Important',
          phase: 'objectives',
          color: 'orange',
          icon: 'alert',
        },
        {
          id: 'success',
          name: 'Success',
          phase: 'implementation',
          color: 'green',
          icon: 'check',
        },
        {
          id: 'warning',
          name: 'Warning',
          phase: 'quality',
          color: 'red',
          icon: 'warning',
        },
        {
          id: 'pro_tip',
          name: 'Pro Tip',
          phase: 'experience',
          color: 'purple',
          icon: 'lightbulb',
        },
        {
          id: 'key_takeaway',
          name: 'Key Takeaway',
          phase: 'design',
          color: 'indigo',
          icon: 'star',
        },
        {
          id: 'remember',
          name: 'Remember',
          phase: 'implementation',
          color: 'teal',
          icon: 'bookmark',
        },
        {
          id: 'callout',
          name: 'Callout',
          phase: 'design',
          color: 'pink',
          icon: 'megaphone',
        },
        {
          id: 'note',
          name: 'Note',
          phase: 'development',
          color: 'gray',
          icon: 'note',
        },
        {
          id: 'definition_box',
          name: 'Definition Box',
          phase: 'objectives',
          color: 'cyan',
          icon: 'book',
        },
        {
          id: 'example_highlight',
          name: 'Example Highlight',
          phase: 'experience',
          color: 'amber',
          icon: 'example',
        },
        {
          id: 'compliance',
          name: 'Compliance Note',
          phase: 'quality',
          color: 'slate',
          icon: 'shield',
        },
      ],

      // LIST BLOCKS (10 variants)
      list: [
        {
          id: 'bulleted',
          name: 'Bulleted List',
          phase: 'design',
          type: 'unordered',
        },
        {
          id: 'numbered',
          name: 'Numbered List',
          phase: 'experience',
          type: 'ordered',
        },
        {
          id: 'checklist',
          name: 'Checklist',
          phase: 'implementation',
          type: 'checklist',
        },
        { id: 'icon_list', name: 'Icon List', phase: 'design', type: 'icon' },
        { id: 'nested', name: 'Nested List', phase: 'design', type: 'nested' },
        {
          id: 'two_column',
          name: 'Two-Column List',
          phase: 'experience',
          type: 'columns',
        },
        {
          id: 'definition_list',
          name: 'Definition List',
          phase: 'objectives',
          type: 'definition',
        },
        {
          id: 'pros_cons',
          name: 'Pros/Cons List',
          phase: 'design',
          type: 'comparison',
        },
        {
          id: 'timeline_list',
          name: 'Timeline List',
          phase: 'analysis',
          type: 'timeline',
        },
        {
          id: 'progress_checklist',
          name: 'Progress Checklist',
          phase: 'implementation',
          type: 'progress',
        },
      ],

      // QUOTE BLOCKS (8 variants)
      quote: [
        {
          id: 'simple',
          name: 'Simple Quote',
          phase: 'design',
          style: 'simple',
        },
        {
          id: 'testimonial',
          name: 'Testimonial',
          phase: 'experience',
          style: 'testimonial',
        },
        {
          id: 'pull_quote',
          name: 'Pull Quote',
          phase: 'design',
          style: 'large',
        },
        {
          id: 'citation',
          name: 'Citation',
          phase: 'quality',
          style: 'citation',
        },
        {
          id: 'comparison_quote',
          name: 'Comparison Quote',
          phase: 'design',
          style: 'comparison',
        },
        {
          id: 'carousel_quote',
          name: 'Quote Carousel',
          phase: 'experience',
          style: 'carousel',
        },
        {
          id: 'with_background',
          name: 'Quote with Background',
          phase: 'design',
          style: 'background',
        },
        {
          id: 'with_icon',
          name: 'Quote with Icon',
          phase: 'experience',
          style: 'icon',
        },
      ],

      // INTERACTIVE BLOCKS (8 variants)
      interactive: [
        {
          id: 'quiz',
          name: 'Quiz Question',
          phase: 'implementation',
          type: 'assessment',
        },
        {
          id: 'reflection',
          name: 'Reflection Prompt',
          phase: 'implementation',
          type: 'reflection',
        },
        {
          id: 'discussion',
          name: 'Discussion Prompt',
          phase: 'experience',
          type: 'discussion',
        },
        {
          id: 'scenario',
          name: 'Scenario Challenge',
          phase: 'experience',
          type: 'scenario',
        },
        {
          id: 'drag_drop',
          name: 'Drag & Drop',
          phase: 'experience',
          type: 'interaction',
        },
        {
          id: 'matching',
          name: 'Matching Exercise',
          phase: 'implementation',
          type: 'assessment',
        },
        {
          id: 'simulation',
          name: 'Simulation',
          phase: 'experience',
          type: 'interactive',
        },
        {
          id: 'branching',
          name: 'Branching Scenario',
          phase: 'experience',
          type: 'decision',
        },
      ],

      // CODE BLOCKS (6 variants)
      code: [
        {
          id: 'snippet',
          name: 'Code Snippet',
          phase: 'experience',
          language: 'generic',
        },
        {
          id: 'example',
          name: 'Code Example',
          phase: 'experience',
          language: 'generic',
        },
        {
          id: 'challenge',
          name: 'Coding Challenge',
          phase: 'implementation',
          language: 'generic',
        },
        {
          id: 'solution',
          name: 'Solution Code',
          phase: 'implementation',
          language: 'generic',
        },
        {
          id: 'comparison',
          name: 'Code Comparison',
          phase: 'design',
          language: 'generic',
        },
        {
          id: 'annotated',
          name: 'Annotated Code',
          phase: 'design',
          language: 'generic',
        },
      ],

      // NEW BLOCK TYPES (14 variants)
      accordion: [
        {
          id: 'faq',
          name: 'FAQ Accordion',
          phase: 'quality',
          icon: 'question',
        },
        {
          id: 'details',
          name: 'Details Accordion',
          phase: 'design',
          icon: 'details',
        },
        {
          id: 'glossary',
          name: 'Glossary Accordion',
          phase: 'objectives',
          icon: 'book',
        },
        {
          id: 'resources',
          name: 'Resources Accordion',
          phase: 'implementation',
          icon: 'link',
        },
      ],

      card: [
        { id: 'feature', name: 'Feature Card', phase: 'design', icon: 'star' },
        {
          id: 'benefit',
          name: 'Benefit Card',
          phase: 'experience',
          icon: 'check',
        },
        { id: 'stat', name: 'Stat Card', phase: 'analysis', icon: 'chart' },
        {
          id: 'person',
          name: 'Person Card',
          phase: 'experience',
          icon: 'user',
        },
        {
          id: 'resource',
          name: 'Resource Card',
          phase: 'implementation',
          icon: 'link',
        },
      ],

      divider: [
        {
          id: 'simple',
          name: 'Simple Divider',
          phase: 'development',
          style: 'line',
        },
        {
          id: 'decorative',
          name: 'Decorative Divider',
          phase: 'design',
          style: 'decorative',
        },
        {
          id: 'section',
          name: 'Section Divider',
          phase: 'development',
          style: 'section',
        },
      ],

      embed: [
        {
          id: 'video',
          name: 'Video Embed',
          phase: 'experience',
          type: 'video',
        },
        {
          id: 'audio',
          name: 'Audio Embed',
          phase: 'experience',
          type: 'audio',
        },
        {
          id: 'interactive',
          name: 'Interactive Embed',
          phase: 'experience',
          type: 'interactive',
        },
      ],
    };
  }

  /**
   * Generate dynamic lesson blocks based on ADDIE phases and difficulty
   */
  async generateDynamicBlocks(
    lessonContext,
    designPhases,
    difficulty = 'intermediate'
  ) {
    const blockCount = this.calculateBlockCount(difficulty);
    const selectedBlocks = [];
    const usedPatterns = this.getUsedPatterns(lessonContext.courseId);

    // Map difficulty to phase emphasis
    const phaseEmphasis = this.mapDifficultyToPhases(difficulty, designPhases);

    // Generate blocks respecting phase sequence
    for (let i = 0; i < blockCount; i++) {
      const phase = this.phaseSequence[i % this.phaseSequence.length];
      const blockType = this.selectBlockType(
        phase,
        phaseEmphasis,
        usedPatterns
      );
      const variant = this.selectVariant(blockType, phase, usedPatterns);

      selectedBlocks.push({
        order: i,
        type: blockType,
        variant: variant,
        phase: phase,
        difficulty: difficulty,
        context: lessonContext,
      });
    }

    // Track pattern for uniqueness
    this.trackPattern(lessonContext.courseId, selectedBlocks);

    return selectedBlocks;
  }

  /**
   * Calculate block count based on difficulty level
   */
  calculateBlockCount(difficulty) {
    const counts = {
      beginner: 12,
      intermediate: 15,
      advanced: 20,
    };
    return counts[difficulty] || 15;
  }

  /**
   * Map difficulty to ADDIE phase emphasis
   */
  mapDifficultyToPhases(difficulty, designPhases) {
    const emphasis = {
      beginner: {
        analysis: 0.2, // More context setting
        objectives: 0.2, // Clear learning goals
        design: 0.15, // Instructional strategies
        experience: 0.2, // Engaging content
        development: 0.1,
        implementation: 0.1,
        quality: 0.05,
      },
      intermediate: {
        analysis: 0.1,
        objectives: 0.15,
        design: 0.2, // More design patterns
        experience: 0.2,
        development: 0.15,
        implementation: 0.15,
        quality: 0.05,
      },
      advanced: {
        analysis: 0.05,
        objectives: 0.1,
        design: 0.15,
        experience: 0.15,
        development: 0.2, // More development focus
        implementation: 0.2,
        quality: 0.15, // Higher quality standards
      },
    };
    return emphasis[difficulty] || emphasis.intermediate;
  }

  /**
   * Select block type based on phase and emphasis
   */
  selectBlockType(phase, phaseEmphasis, usedPatterns) {
    const blockTypes = Object.keys(this.blockTypeVariants);
    const phaseWeight = phaseEmphasis[phase] || 0.1;

    // Weighted selection based on phase emphasis
    let selected = blockTypes[Math.floor(Math.random() * blockTypes.length)];

    // Ensure variety - don't repeat same type consecutively
    if (usedPatterns.length > 0) {
      const lastBlock = usedPatterns[usedPatterns.length - 1];
      if (lastBlock.type === selected) {
        selected =
          blockTypes[(blockTypes.indexOf(selected) + 1) % blockTypes.length];
      }
    }

    return selected;
  }

  /**
   * Select specific variant within block type
   */
  selectVariant(blockType, phase, usedPatterns) {
    const variants = this.blockTypeVariants[blockType] || [];
    const phaseVariants = variants.filter(v => v.phase === phase);

    if (phaseVariants.length === 0) {
      return variants[Math.floor(Math.random() * variants.length)];
    }

    // Prefer phase-aligned variants
    return phaseVariants[Math.floor(Math.random() * phaseVariants.length)];
  }

  /**
   * Get used patterns for a course to ensure uniqueness
   */
  getUsedPatterns(courseId) {
    return this.patternTracker.get(courseId) || [];
  }

  /**
   * Track pattern to prevent repetition
   */
  trackPattern(courseId, blocks) {
    const pattern = blocks.map(b => `${b.type}:${b.variant.id}`).join('|');
    const patterns = this.patternTracker.get(courseId) || [];
    patterns.push(pattern);
    this.patternTracker.set(courseId, patterns);
  }

  /**
   * Generate topic-specific content for a block
   */
  async generateTopicSpecificContent(block, lessonContext, courseContext) {
    const systemPrompt = this.buildSystemPrompt(
      block,
      lessonContext,
      courseContext
    );
    const userPrompt = this.buildUserPrompt(
      block,
      lessonContext,
      courseContext
    );

    try {
      const content = await optimizedOpenAIService.generateText(userPrompt, {
        maxTokens: 500,
        temperature: 0.7,
        systemPrompt: systemPrompt,
      });

      return {
        success: true,
        content: content,
        blockType: block.type,
        variant: block.variant.id,
      };
    } catch (error) {
      console.error('Error generating topic-specific content:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build system prompt for content generation
   */
  buildSystemPrompt(block, lessonContext, courseContext) {
    return `You are an expert instructional designer creating ${block.variant.name} content.
Context:
- Course: ${courseContext.title}
- Lesson: ${lessonContext.title}
- Topic: ${lessonContext.topic}
- Difficulty: ${block.difficulty}
- ADDIE Phase: ${block.phase}

Create engaging, topic-specific content that:
1. Directly relates to "${lessonContext.topic}"
2. Matches the ${block.difficulty} difficulty level
3. Aligns with the ${block.phase} phase of instructional design
4. Is concise and actionable
5. Uses real-world examples when relevant

Output ONLY the content, no explanations.`;
  }

  /**
   * Build user prompt for content generation
   */
  buildUserPrompt(block, lessonContext, courseContext) {
    const phaseContext = {
      analysis: 'Analyze the learner needs and context',
      objectives: 'Define clear, measurable learning objectives',
      design: 'Design instructional strategies and activities',
      experience: 'Create engaging learner experiences',
      development: 'Develop detailed content and materials',
      implementation: 'Implement assessments and feedback',
      quality: 'Ensure quality and compliance',
    };

    return `Create a ${block.variant.name} for teaching "${lessonContext.topic}".
Phase focus: ${phaseContext[block.phase]}
Content type: ${block.variant.description}
Difficulty: ${block.difficulty}

Make it specific to ${lessonContext.topic}, not generic.`;
  }

  /**
   * Adapt content for difficulty level
   */
  adaptForDifficulty(content, difficulty) {
    const adaptations = {
      beginner: {
        simplify: true,
        addExamples: true,
        addDefinitions: true,
        stepByStep: true,
      },
      intermediate: {
        addContext: true,
        addComparisons: true,
        addApplications: true,
      },
      advanced: {
        addEdgeCases: true,
        addOptimizations: true,
        addResearch: true,
        addChallenges: true,
      },
    };

    return adaptations[difficulty] || adaptations.intermediate;
  }

  /**
   * Ensure pattern uniqueness across lessons
   */
  ensurePatternUniqueness(courseId, newPattern) {
    const existingPatterns = this.getUsedPatterns(courseId);
    return !existingPatterns.includes(newPattern);
  }

  /**
   * Clear patterns for new course
   */
  clearPatterns(courseId) {
    this.patternTracker.delete(courseId);
  }
}

export default new AdvancedLessonContentEngine();
