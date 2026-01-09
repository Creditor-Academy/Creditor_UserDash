/**
 * Advanced Lesson Adapter
 * Bridges Advanced Lesson Content Engine with existing structuredLessonGenerator
 * Enables seamless integration without breaking existing code
 */

import advancedLessonContentEngine from './advancedLessonContentEngine.js';
import addie7PhaseIntegration from './addie7PhaseIntegration.js';
import structuredLessonGenerator from './structuredLessonGenerator.js';
import optimizedOpenAIService from './optimizedOpenAIService.js';

class AdvancedLessonAdapter {
  constructor() {
    this.enableAdvancedMode = true; // Toggle between advanced and legacy mode
    this.blockGenerationCache = new Map();
  }

  /**
   * Generate lesson using advanced system (with ADDIE phases)
   * Drop-in replacement for structuredLessonGenerator.generateLesson
   */
  async generateLessonAdvanced(
    lessonId,
    courseData,
    progressCallback,
    options = {}
  ) {
    try {
      console.log('🚀 Advanced Lesson Generation Started:', lessonId);

      // Extract ADDIE phase data if available
      const designPhases = courseData.designPhases || {};
      const phaseData = addie7PhaseIntegration.extractPhaseData(designPhases);

      // Determine difficulty
      const difficulty = courseData.difficulty || 'intermediate';

      // Generate dynamic blocks with ADDIE alignment
      const lessonContext = {
        id: lessonId,
        title: courseData.title,
        topic: courseData.title,
        description: courseData.description,
      };

      const blocks = await advancedLessonContentEngine.generateDynamicBlocks(
        {
          courseId: courseData.courseId || 'default',
          lessonId: lessonId,
          title: courseData.title,
          topic: courseData.title,
          description: courseData.description,
        },
        phaseData,
        difficulty
      );

      console.log(`📊 Generated ${blocks.length} dynamic blocks for lesson`);

      // Generate content for each block
      const enrichedBlocks = [];
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (progressCallback) {
          progressCallback({
            message: `Generating ${block.type} block (${block.variant.name})`,
            current: i + 1,
            total: blocks.length,
          });
        }

        // Generate topic-specific content
        const contentResult =
          await advancedLessonContentEngine.generateTopicSpecificContent(
            block,
            lessonContext,
            courseData
          );

        // Convert to structuredLessonGenerator format
        const convertedBlock = this.convertBlockToStructuredFormat(
          block,
          contentResult,
          phaseData,
          difficulty
        );

        enrichedBlocks.push(convertedBlock);
      }

      // Generate lesson objectives
      const objectivesResult =
        await addie7PhaseIntegration.generateLessonObjectives(
          courseData.title,
          phaseData
        );

      // Validate quality
      const validationResult =
        await addie7PhaseIntegration.validateLessonQuality(
          { blocks: enrichedBlocks },
          phaseData
        );

      console.log('✅ Advanced lesson generation complete');

      return {
        success: true,
        blocks: enrichedBlocks,
        metadata: {
          generationMode: 'ADVANCED',
          blockCount: enrichedBlocks.length,
          difficulty: difficulty,
          phaseAlignment: this.calculatePhaseAlignment(enrichedBlocks),
          bloomCoverage: this.calculateBloomCoverage(enrichedBlocks),
          objectives: objectivesResult.objectives || [],
          qualityValidation: validationResult,
          uniquePatterns: new Set(
            enrichedBlocks.map(b => `${b.type}:${b.variant}`)
          ).size,
        },
      };
    } catch (error) {
      console.error('❌ Advanced lesson generation failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackToLegacy: true,
      };
    }
  }

  /**
   * Convert advanced block format to structuredLessonGenerator format
   */
  convertBlockToStructuredFormat(
    advancedBlock,
    contentResult,
    phaseData,
    difficulty
  ) {
    const baseBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: advancedBlock.type,
      variant: advancedBlock.variant.id,
      order: advancedBlock.order,
      phase: advancedBlock.phase,
      difficulty: difficulty,
      content: contentResult.content || '',
      success: contentResult.success,
    };

    // Add type-specific properties
    switch (advancedBlock.type) {
      case 'text':
        return {
          ...baseBlock,
          textType: advancedBlock.variant.id,
          content: contentResult.content,
        };

      case 'image':
        return {
          ...baseBlock,
          layout: advancedBlock.variant.layout,
          imagePrompt: this.generateImagePrompt(advancedBlock, contentResult),
          caption: contentResult.content,
        };

      case 'statement':
        return {
          ...baseBlock,
          color: advancedBlock.variant.color,
          icon: advancedBlock.variant.icon,
          content: contentResult.content,
        };

      case 'list':
        return {
          ...baseBlock,
          listType: advancedBlock.variant.type,
          items: this.parseListContent(contentResult.content),
        };

      case 'quote':
        return {
          ...baseBlock,
          style: advancedBlock.variant.style,
          content: contentResult.content,
          author: this.extractAuthor(contentResult.content),
        };

      case 'interactive':
        return {
          ...baseBlock,
          interactiveType: advancedBlock.variant.type,
          content: contentResult.content,
          assessmentType:
            advancedBlock.variant.type === 'assessment' ? 'quiz' : 'reflection',
        };

      case 'code':
        return {
          ...baseBlock,
          language: advancedBlock.variant.language || 'javascript',
          content: contentResult.content,
        };

      case 'accordion':
        return {
          ...baseBlock,
          accordionType: advancedBlock.variant.id,
          items: this.parseAccordionContent(contentResult.content),
        };

      case 'card':
        return {
          ...baseBlock,
          cardType: advancedBlock.variant.id,
          content: contentResult.content,
        };

      case 'divider':
        return {
          ...baseBlock,
          style: advancedBlock.variant.style,
        };

      case 'embed':
        return {
          ...baseBlock,
          embedType: advancedBlock.variant.type,
          url: this.extractEmbedUrl(contentResult.content),
        };

      default:
        return baseBlock;
    }
  }

  /**
   * Generate image prompt from block context
   */
  generateImagePrompt(block, contentResult) {
    return `${block.variant.description} for ${contentResult.content?.substring(0, 50)}...`;
  }

  /**
   * Parse list content into items
   */
  parseListContent(content) {
    if (!content) return [];
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map((item, idx) => ({
        id: `item-${idx}`,
        text: item
          .trim()
          .replace(/^[-•*]\s+/, '')
          .replace(/^\d+\.\s+/, ''),
      }));
  }

  /**
   * Parse accordion content
   */
  parseAccordionContent(content) {
    if (!content) return [];
    const items = [];
    const sections = content.split(/\n(?=[A-Z])/);

    sections.forEach((section, idx) => {
      const [title, ...bodyLines] = section.split('\n');
      items.push({
        id: `accordion-${idx}`,
        title: title?.trim() || `Section ${idx + 1}`,
        content: bodyLines.join('\n').trim(),
      });
    });

    return items;
  }

  /**
   * Extract author from quote
   */
  extractAuthor(content) {
    const authorMatch = content.match(/—\s*(.+?)(?:\n|$)/);
    return authorMatch ? authorMatch[1].trim() : 'Unknown';
  }

  /**
   * Extract embed URL
   */
  extractEmbedUrl(content) {
    const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[1] : '';
  }

  /**
   * Calculate phase alignment percentage
   */
  calculatePhaseAlignment(blocks) {
    const phaseDistribution = {};
    const phases = [
      'analysis',
      'objectives',
      'design',
      'experience',
      'development',
      'implementation',
      'quality',
    ];

    phases.forEach(phase => {
      phaseDistribution[phase] = blocks.filter(b => b.phase === phase).length;
    });

    // Calculate coverage (how many phases are represented)
    const representedPhases = Object.values(phaseDistribution).filter(
      count => count > 0
    ).length;
    return Math.round((representedPhases / phases.length) * 100);
  }

  /**
   * Calculate Bloom's taxonomy coverage
   */
  calculateBloomCoverage(blocks) {
    const bloomMap = {
      analysis: 'remember',
      objectives: 'understand',
      design: 'apply',
      experience: 'apply',
      development: 'analyze',
      implementation: 'evaluate',
      quality: 'create',
    };

    const coverage = {
      remember: 0,
      understand: 0,
      apply: 0,
      analyze: 0,
      evaluate: 0,
      create: 0,
    };

    blocks.forEach(block => {
      const bloomLevel = bloomMap[block.phase] || 'apply';
      coverage[bloomLevel]++;
    });

    return coverage;
  }

  /**
   * Hybrid mode: Use advanced system with fallback to legacy
   */
  async generateLessonHybrid(
    lessonId,
    courseData,
    progressCallback,
    options = {}
  ) {
    try {
      // Try advanced generation first
      const advancedResult = await this.generateLessonAdvanced(
        lessonId,
        courseData,
        progressCallback,
        options
      );

      if (advancedResult.success) {
        return advancedResult;
      }

      console.log('⚠️ Advanced generation failed, falling back to legacy mode');

      // Fallback to legacy structuredLessonGenerator
      return await structuredLessonGenerator.generateLesson(
        lessonId,
        courseData,
        progressCallback,
        options
      );
    } catch (error) {
      console.error('❌ Hybrid generation failed:', error);

      // Final fallback
      return await structuredLessonGenerator.generateLesson(
        lessonId,
        courseData,
        progressCallback,
        options
      );
    }
  }

  /**
   * Enable/disable advanced mode
   */
  setAdvancedMode(enabled) {
    this.enableAdvancedMode = enabled;
    console.log(`🔧 Advanced lesson mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.enableAdvancedMode ? 'ADVANCED' : 'LEGACY';
  }

  /**
   * Clear pattern cache for course
   */
  clearPatternCache(courseId) {
    advancedLessonContentEngine.clearPatterns(courseId);
    console.log(`🗑️ Pattern cache cleared for course: ${courseId}`);
  }

  /**
   * Get generation statistics
   */
  getStatistics() {
    return {
      mode: this.getMode(),
      cacheSize: this.blockGenerationCache.size,
      patternsTracked: advancedLessonContentEngine.patternTracker.size,
    };
  }
}

export default new AdvancedLessonAdapter();
