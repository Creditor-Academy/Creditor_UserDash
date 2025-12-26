/**
 * ADDIE 7-Phase Integration Service
 * Bridges Advanced Lesson Content Engine with existing course creation flow
 *
 * Maps to your 7 ADDIE phases:
 * 1. Analysis - Learner needs, context, constraints
 * 2. Objectives - Learning goals, Bloom's taxonomy
 * 3. Design - Instructional strategies, Gagné's 9 events
 * 4. Experience - Learner experience, VAK modalities, delivery mode
 * 5. Development - Content creation, storyboarding, media
 * 6. Implementation - Deployment, analytics, feedback loops
 * 7. Quality - Accuracy, compliance, validation
 */

import advancedLessonContentEngine from './advancedLessonContentEngine.js';
import optimizedOpenAIService from './optimizedOpenAIService.js';

class ADDIE7PhaseIntegration {
  constructor() {
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
   * Extract ADDIE phase data from designPhases object
   */
  extractPhaseData(designPhases) {
    return {
      analysis: {
        mainGoal: designPhases?.analysis?.mainGoal,
        targetLearner: designPhases?.analysis?.targetLearner,
        problemToSolve: designPhases?.analysis?.problemToSolve,
        businessOutcome: designPhases?.analysis?.businessOutcome,
        learningConstraints: designPhases?.analysis?.learningConstraints,
        complianceNeeds: designPhases?.analysis?.complianceNeeds,
        prerequisites: designPhases?.analysis?.prerequisites,
        courseLength: designPhases?.analysis?.courseLength,
        successMeasures: designPhases?.analysis?.successMeasures,
        requiredResources: designPhases?.analysis?.requiredResources,
        moduleCount: designPhases?.analysis?.moduleCount || 4,
        lessonsPerModule: designPhases?.analysis?.lessonsPerModule || 3,
        flowPreference: designPhases?.analysis?.flowPreference || 'linear',
      },
      objectives: {
        overallObjectives: designPhases?.objectives?.overallObjectives || [],
        optionalObjectives: designPhases?.objectives?.optionalObjectives || [],
        bloomTargets: designPhases?.objectives?.bloomTargets || {
          course: 'apply',
        },
        evidencePlan: designPhases?.objectives?.evidencePlan || [],
        autoGenerateLessonObjectives:
          designPhases?.objectives?.autoGenerateLessonObjectives !== false,
      },
      design: {
        attentionStrategy: designPhases?.design?.attentionStrategy,
        objectivesAnnouncement: designPhases?.design?.objectivesAnnouncement,
        priorKnowledgeActivation:
          designPhases?.design?.priorKnowledgeActivation,
        contentPresentation: designPhases?.design?.contentPresentation,
        guidancePlan: designPhases?.design?.guidancePlan,
        practicePlan: designPhases?.design?.practicePlan,
        feedbackPlan: designPhases?.design?.feedbackPlan,
        assessmentPlan: designPhases?.design?.assessmentPlan,
        retentionPlan: designPhases?.design?.retentionPlan,
      },
      experience: {
        deliveryMode: designPhases?.experience?.deliveryMode || 'self_paced',
        visualApproach: designPhases?.experience?.visualApproach,
        auditoryApproach: designPhases?.experience?.auditoryApproach,
        kinestheticApproach: designPhases?.experience?.kinestheticApproach,
        storytellingPlan: designPhases?.experience?.storytellingPlan,
        practiceCadence:
          designPhases?.experience?.practiceCadence || 'per_lesson',
        feedbackChannels: designPhases?.experience?.feedbackChannels || [],
        adaptivePaths: designPhases?.experience?.adaptivePaths || false,
        brandStyle: designPhases?.experience?.brandStyle,
        learningFormats: designPhases?.experience?.learningFormats || [],
        autoBalanceModalities:
          designPhases?.experience?.autoBalanceModalities !== false,
      },
      development: {
        inputsProvided: designPhases?.development?.inputsProvided,
        moduleStructureNotes: designPhases?.development?.moduleStructureNotes,
        storyboardFormat:
          designPhases?.development?.storyboardFormat || 'slide-by-slide',
        reviewCycle: designPhases?.development?.reviewCycle,
        localizationNeeds: designPhases?.development?.localizationNeeds,
        interactiveElements: designPhases?.development?.interactiveElements,
        autoAssessments: designPhases?.development?.autoAssessments !== false,
        mediaHandling: designPhases?.development?.mediaHandling,
      },
      implementation: {
        deliveryChannels: designPhases?.implementation?.deliveryChannels || [],
        analyticsNeeds: designPhases?.implementation?.analyticsNeeds || [],
        evaluationCriteria:
          designPhases?.implementation?.evaluationCriteria || [],
        optimizationCadence:
          designPhases?.implementation?.optimizationCadence || 'quarterly',
        learnerInsights: designPhases?.implementation?.learnerInsights,
        feedbackLoops: designPhases?.implementation?.feedbackLoops,
        assessmentDataNeeds:
          designPhases?.implementation?.assessmentDataNeeds || [],
      },
      quality: {
        accuracyBenchmark: designPhases?.quality?.accuracyBenchmark || '99%',
        referenceCheck: designPhases?.quality?.referenceCheck !== false,
        humanValidation: designPhases?.quality?.humanValidation !== false,
        ambiguityHandling: designPhases?.quality?.ambiguityHandling || 'ask',
        autoTagging: designPhases?.quality?.autoTagging !== false,
        qualityChecklist: designPhases?.quality?.qualityChecklist || [],
        complianceNotes: designPhases?.quality?.complianceNotes,
      },
    };
  }

  /**
   * Generate lesson with ADDIE phase awareness
   */
  async generateLessonWithADDIE(lessonContext, courseData, designPhases) {
    const phaseData = this.extractPhaseData(designPhases);

    // Determine difficulty based on Bloom's level
    const difficulty = this.mapBloomToDifficulty(
      phaseData.objectives.bloomTargets.course
    );

    // Generate dynamic blocks aligned with ADDIE phases
    const blocks = await advancedLessonContentEngine.generateDynamicBlocks(
      {
        courseId: courseData.id,
        lessonId: lessonContext.id,
        title: lessonContext.title,
        topic: lessonContext.topic || lessonContext.title,
        description: lessonContext.description,
      },
      phaseData,
      difficulty
    );

    // Generate content for each block with phase context
    const enrichedBlocks = await Promise.all(
      blocks.map(async block => {
        const content =
          await advancedLessonContentEngine.generateTopicSpecificContent(
            block,
            lessonContext,
            courseData
          );

        return {
          ...block,
          content: content.content,
          contentSuccess: content.success,
          phaseAlignment: this.calculatePhaseAlignment(block, phaseData),
          bloomLevel: this.getBloomLevelForPhase(block.phase, phaseData),
        };
      })
    );

    return {
      success: true,
      lessonId: lessonContext.id,
      lessonTitle: lessonContext.title,
      difficulty: difficulty,
      blockCount: enrichedBlocks.length,
      blocks: enrichedBlocks,
      phaseAlignment: this.calculateOverallPhaseAlignment(
        enrichedBlocks,
        phaseData
      ),
      metrics: {
        uniquePatterns: this.countUniquePatterns(enrichedBlocks),
        phaseDistribution: this.calculatePhaseDistribution(enrichedBlocks),
        bloomCoverage: this.calculateBloomCoverage(enrichedBlocks, phaseData),
      },
    };
  }

  /**
   * Map Bloom's taxonomy level to difficulty
   */
  mapBloomToDifficulty(bloomLevel) {
    const mapping = {
      remember: 'beginner',
      understand: 'beginner',
      apply: 'intermediate',
      analyze: 'intermediate',
      evaluate: 'advanced',
      create: 'advanced',
    };
    return mapping[bloomLevel] || 'intermediate';
  }

  /**
   * Get Bloom level for specific phase
   */
  getBloomLevelForPhase(phase, phaseData) {
    const phaseBloomMapping = {
      analysis: 'remember',
      objectives: 'understand',
      design: 'apply',
      experience: 'apply',
      development: 'analyze',
      implementation: 'evaluate',
      quality: 'create',
    };
    return phaseBloomMapping[phase] || 'apply';
  }

  /**
   * Calculate phase alignment score for a block
   */
  calculatePhaseAlignment(block, phaseData) {
    const phaseKey = block.phase;
    const phaseInfo = phaseData[phaseKey];

    if (!phaseInfo) return 0;

    // Score based on how well block aligns with phase data
    let score = 0;
    const values = Object.values(phaseInfo).filter(v => v && v.length > 0);
    score = Math.min(
      100,
      (values.length / Object.keys(phaseInfo).length) * 100
    );

    return Math.round(score);
  }

  /**
   * Calculate overall phase alignment for lesson
   */
  calculateOverallPhaseAlignment(blocks, phaseData) {
    const alignments = blocks.map(b =>
      this.calculatePhaseAlignment(b, phaseData)
    );
    const average = alignments.reduce((a, b) => a + b, 0) / alignments.length;
    return Math.round(average);
  }

  /**
   * Count unique patterns in blocks
   */
  countUniquePatterns(blocks) {
    const patterns = new Set(blocks.map(b => `${b.type}:${b.variant.id}`));
    return patterns.size;
  }

  /**
   * Calculate phase distribution
   */
  calculatePhaseDistribution(blocks) {
    const distribution = {};
    this.phaseSequence.forEach(phase => {
      distribution[phase] = blocks.filter(b => b.phase === phase).length;
    });
    return distribution;
  }

  /**
   * Calculate Bloom's taxonomy coverage
   */
  calculateBloomCoverage(blocks, phaseData) {
    const bloomLevels = [
      'remember',
      'understand',
      'apply',
      'analyze',
      'evaluate',
      'create',
    ];
    const coverage = {};

    bloomLevels.forEach(level => {
      const blocksAtLevel = blocks.filter(b => {
        const bloomForPhase = this.getBloomLevelForPhase(b.phase, phaseData);
        return bloomForPhase === level;
      });
      coverage[level] = blocksAtLevel.length;
    });

    return coverage;
  }

  /**
   * Generate lesson objectives based on ADDIE phase data
   */
  async generateLessonObjectives(lessonTitle, phaseData) {
    const systemPrompt = `You are an expert instructional designer creating learning objectives aligned with Bloom's taxonomy.
Generate 3-5 measurable learning objectives for the lesson.
Format: "Students will be able to [verb] [content] [condition]"
Use Bloom's verbs: remember, understand, apply, analyze, evaluate, create`;

    const userPrompt = `Lesson: ${lessonTitle}
Course objectives: ${(phaseData.objectives.overallObjectives || []).join(', ')}
Bloom target: ${phaseData.objectives.bloomTargets.course}
Auto-generate: ${phaseData.objectives.autoGenerateLessonObjectives}

Create specific, measurable objectives for this lesson.`;

    try {
      const response = await optimizedOpenAIService.generateText(userPrompt, {
        maxTokens: 300,
        temperature: 0.6,
        systemPrompt: systemPrompt,
      });

      return {
        success: true,
        objectives: response.split('\n').filter(o => o.trim().length > 0),
      };
    } catch (error) {
      console.error('Error generating lesson objectives:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate lesson against quality phase requirements
   */
  async validateLessonQuality(lesson, phaseData) {
    const qualityPhase = phaseData.quality;
    const validationResults = {
      accuracyCheck: qualityPhase.referenceCheck,
      humanValidation: qualityPhase.humanValidation,
      complianceCheck: !!qualityPhase.complianceNotes,
      bloomAlignment: this.validateBloomAlignment(lesson, phaseData),
      phaseAlignment: this.validatePhaseAlignment(lesson, phaseData),
      contentQuality: await this.validateContentQuality(lesson, qualityPhase),
    };

    return {
      passed: Object.values(validationResults).every(v => v),
      results: validationResults,
      recommendations: this.generateQualityRecommendations(validationResults),
    };
  }

  /**
   * Validate Bloom alignment
   */
  validateBloomAlignment(lesson, phaseData) {
    const targetBloom = phaseData.objectives.bloomTargets.course;
    const bloomLevels = [
      'remember',
      'understand',
      'apply',
      'analyze',
      'evaluate',
      'create',
    ];
    const targetIndex = bloomLevels.indexOf(targetBloom);

    // Check if lesson covers target level and below
    const covered = lesson.blocks.some(b => {
      const blockBloom = this.getBloomLevelForPhase(b.phase, phaseData);
      return bloomLevels.indexOf(blockBloom) >= targetIndex;
    });

    return covered;
  }

  /**
   * Validate phase alignment
   */
  validatePhaseAlignment(lesson, phaseData) {
    // Check if all major phases are represented
    const representedPhases = new Set(lesson.blocks.map(b => b.phase));
    const majorPhases = [
      'analysis',
      'objectives',
      'design',
      'experience',
      'implementation',
    ];
    return majorPhases.every(phase => representedPhases.has(phase));
  }

  /**
   * Validate content quality
   */
  async validateContentQuality(lesson, qualityPhase) {
    // Check for minimum content length and diversity
    const avgContentLength =
      lesson.blocks.reduce((sum, b) => sum + (b.content?.length || 0), 0) /
      lesson.blocks.length;
    const uniqueBlockTypes = new Set(lesson.blocks.map(b => b.type)).size;

    return avgContentLength > 100 && uniqueBlockTypes >= 3;
  }

  /**
   * Generate quality recommendations
   */
  generateQualityRecommendations(validationResults) {
    const recommendations = [];

    if (!validationResults.accuracyCheck) {
      recommendations.push('Enable reference checking for content accuracy');
    }
    if (!validationResults.humanValidation) {
      recommendations.push('Add human review step for quality assurance');
    }
    if (!validationResults.bloomAlignment) {
      recommendations.push('Ensure lesson covers target Bloom level');
    }
    if (!validationResults.phaseAlignment) {
      recommendations.push('Include content from all major ADDIE phases');
    }
    if (!validationResults.contentQuality) {
      recommendations.push('Increase content depth and block type variety');
    }

    return recommendations;
  }

  /**
   * Generate implementation strategy based on phase data
   */
  generateImplementationStrategy(phaseData) {
    return {
      deliveryChannels: phaseData.implementation.deliveryChannels,
      analyticsTracking: phaseData.implementation.analyticsNeeds,
      feedbackMechanism: phaseData.implementation.feedbackLoops,
      optimizationCadence: phaseData.implementation.optimizationCadence,
      evaluationApproach: phaseData.implementation.evaluationCriteria,
      adaptivePathsEnabled: phaseData.experience.adaptivePaths,
      assessmentStrategy: phaseData.design.assessmentPlan,
    };
  }

  /**
   * Map phase data to content generation config
   */
  mapPhaseDataToConfig(phaseData) {
    return {
      contentStrategy: {
        visual: phaseData.experience.visualApproach,
        auditory: phaseData.experience.auditoryApproach,
        kinesthetic: phaseData.experience.kinestheticApproach,
        storytelling: phaseData.experience.storytellingPlan,
      },
      assessmentStrategy: {
        type: Array.isArray(phaseData.design.assessmentPlan)
          ? phaseData.design.assessmentPlan[0]
          : 'mixed',
        frequency: phaseData.experience.practiceCadence,
        autoGenerate: phaseData.development.autoAssessments,
      },
      interactivityLevel: {
        interactive: phaseData.development.interactiveElements
          ? 'high'
          : 'medium',
        adaptive: phaseData.experience.adaptivePaths ? 'yes' : 'no',
        branching: phaseData.experience.learningFormats?.includes(
          'interactive_scenario'
        )
          ? 'yes'
          : 'no',
      },
      qualityStandards: {
        accuracy: phaseData.quality.accuracyBenchmark,
        compliance: phaseData.quality.complianceNotes,
        validation: phaseData.quality.humanValidation ? 'required' : 'optional',
      },
    };
  }
}

export default new ADDIE7PhaseIntegration();
