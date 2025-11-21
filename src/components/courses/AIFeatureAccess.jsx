import React, { createContext, useContext, useState } from 'react';

// AI Features Access Context
const AIFeatureAccessContext = createContext();

// AI Feature permissions configuration
const AI_FEATURES = {
  IMAGE_GENERATION: {
    id: 'image_generation',
    name: 'AI Image Generation',
    description: 'Generate custom images using AI models',
    enabled: true,
    models: [
      'dreamlike-art/dreamlike-photoreal-2.0',
      'prompthero/openjourney-v4',
    ],
    maxGenerationsPerDay: 50,
    styles: ['realistic', 'artistic', 'cartoon', 'abstract', 'minimal'],
  },
  CONTENT_SUMMARIZATION: {
    id: 'content_summarization',
    name: 'Content Summarization',
    description: 'Summarize text, URLs, and documents',
    enabled: true,
    models: ['ainize/bart-base-cnn', 'Qwen/Qwen2-7B-Instruct'],
    maxSummarizationsPerDay: 100,
    inputTypes: ['text', 'url', 'file'],
  },
  CONTENT_QA: {
    id: 'content_qa',
    name: 'Content Q&A Search',
    description: 'Ask questions and get AI-powered answers',
    enabled: true,
    models: ['Qwen/Qwen2-7B-Instruct'],
    maxQueriesPerDay: 200,
    features: ['search_history', 'quick_prompts', 'structured_answers'],
  },
  QUESTION_ANSWERING: {
    id: 'question_answering',
    name: 'AI Question Answering',
    description: 'Ask questions and get AI-powered answers using FLAN-T5',
    enabled: true,
    models: ['google/flan-t5-base'],
    maxQueriesPerDay: 200,
    features: ['context_support', 'sample_questions', 'answer_history'],
  },
  COURSE_OUTLINE: {
    id: 'course_outline',
    name: 'Course Outline Generator',
    description: 'Generate structured course outlines',
    enabled: true,
    models: ['Qwen/Qwen2-7B-Instruct'],
    maxOutlinesPerDay: 20,
    features: ['module_generation', 'lesson_planning', 'learning_objectives'],
  },
  TEXT_GENERATION: {
    id: 'text_generation',
    name: 'AI Text Generation',
    description: 'Generate course content and descriptions',
    enabled: true,
    models: ['Qwen/Qwen2-7B-Instruct'],
    maxGenerationsPerDay: 100,
    features: ['course_descriptions', 'lesson_content', 'quiz_questions'],
  },
};

// AI Feature Access Provider
export const AIFeatureAccessProvider = ({ children }) => {
  const [featureAccess, setFeatureAccess] = useState(AI_FEATURES);
  const [usageStats, setUsageStats] = useState({});
  const [userPlan, setUserPlan] = useState('premium'); // premium, basic, free

  // Check if feature is accessible
  const hasAccess = featureId => {
    const feature = featureAccess[featureId];
    if (!feature) return false;

    // Check if feature is enabled
    if (!feature.enabled) return false;

    // Check usage limits (simplified - in real app would check against API/database)
    const today = new Date().toDateString();
    const todayUsage = usageStats[featureId]?.[today] || 0;

    switch (userPlan) {
      case 'premium':
        return true; // Unlimited access
      case 'basic':
        return (
          todayUsage <
          (feature.maxGenerationsPerDay ||
            feature.maxSummarizationsPerDay ||
            feature.maxQueriesPerDay ||
            feature.maxOutlinesPerDay) /
            2
        );
      case 'free':
        return todayUsage < 5; // 5 per day for free users
      default:
        return false;
    }
  };

  // Track feature usage
  const trackUsage = featureId => {
    const today = new Date().toDateString();
    setUsageStats(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [today]: (prev[featureId]?.[today] || 0) + 1,
      },
    }));
  };

  // Get usage count for today
  const getTodayUsage = featureId => {
    const today = new Date().toDateString();
    return usageStats[featureId]?.[today] || 0;
  };

  // Get usage limit for feature
  const getUsageLimit = featureId => {
    const feature = featureAccess[featureId];
    if (!feature) return 0;

    const baseLimit =
      feature.maxGenerationsPerDay ||
      feature.maxSummarizationsPerDay ||
      feature.maxQueriesPerDay ||
      feature.maxOutlinesPerDay ||
      100;

    switch (userPlan) {
      case 'premium':
        return baseLimit;
      case 'basic':
        return Math.floor(baseLimit / 2);
      case 'free':
        return 5;
      default:
        return 0;
    }
  };

  // Enable/disable feature
  const toggleFeature = (featureId, enabled) => {
    setFeatureAccess(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        enabled,
      },
    }));
  };

  // Upgrade user plan
  const upgradePlan = newPlan => {
    setUserPlan(newPlan);
  };

  const value = {
    features: featureAccess,
    hasAccess,
    trackUsage,
    getTodayUsage,
    getUsageLimit,
    toggleFeature,
    upgradePlan,
    userPlan,
    usageStats,
  };

  return (
    <AIFeatureAccessContext.Provider value={value}>
      {children}
    </AIFeatureAccessContext.Provider>
  );
};

// Hook to use AI Feature Access
export const useAIFeatureAccess = () => {
  const context = useContext(AIFeatureAccessContext);
  if (!context) {
    throw new Error(
      'useAIFeatureAccess must be used within AIFeatureAccessProvider'
    );
  }
  return context;
};

// HOC to protect AI features
export const withAIFeatureAccess = (WrappedComponent, requiredFeature) => {
  return function AIFeatureProtectedComponent(props) {
    const { hasAccess, trackUsage, getTodayUsage, getUsageLimit } =
      useAIFeatureAccess();

    const canAccess = hasAccess(requiredFeature);
    const todayUsage = getTodayUsage(requiredFeature);
    const usageLimit = getUsageLimit(requiredFeature);

    if (!canAccess) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Feature Access Limited
          </h3>
          <p className="text-yellow-700 mb-4">
            You've reached your daily limit for this AI feature ({todayUsage}/
            {usageLimit}).
          </p>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
            Upgrade Plan for More Access
          </button>
        </div>
      );
    }

    return (
      <WrappedComponent
        {...props}
        onFeatureUse={() => trackUsage(requiredFeature)}
        usageInfo={{ todayUsage, usageLimit }}
      />
    );
  };
};

export default AIFeatureAccessProvider;
