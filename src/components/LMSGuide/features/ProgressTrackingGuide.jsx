import React from 'react';
import { BarChart } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const ProgressTrackingGuide = () => {
  const featureData = {
    id: 'progress_tracking',
    icon: BarChart,
    title: 'Progress Tracking',
    introduction: `The Progress Tracking feature provides detailed insights into your learning journey. Monitor your course completion rates, assessment scores, and time spent on various learning activities. This data-driven approach helps you understand your performance and identify areas for improvement.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example10',
        title: 'Understanding Your Progress Analytics',
        description: 'Learn how to interpret your progress metrics and use them to enhance your learning experience.'
      }
    ],
    steps: [
      {
        title: 'Access Progress Dashboard',
        description: 'Navigate to the Progress section to view your comprehensive learning analytics.'
      },
      {
        title: 'Review Course Progress',
        description: 'Check individual course completion rates, time spent, and achievement milestones.'
      },
      {
        title: 'Analyze Performance',
        description: 'View detailed breakdowns of your assessment scores and learning activities.'
      },
      {
        title: 'Set Learning Goals',
        description: 'Use the insights to set achievable goals and track your progress towards them.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default ProgressTrackingGuide;
