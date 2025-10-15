import React from 'react';
import { Bot } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const AIAssistantGuide = () => {
  const featureData = {
    id: 'ai_assistant',
    icon: Bot,
    title: 'AI Assistant',
    introduction: `The AI Assistant is your 24/7 learning companion, designed to provide instant help and support throughout your educational journey. Whether you need clarification on course content, technical assistance, or general guidance, our AI Assistant is here to help with accurate and contextual responses to your queries.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example8',
        title: 'Using the AI Assistant',
        description: 'Discover how to effectively interact with the AI Assistant to get the most out of your learning experience.'
      }
    ],
    steps: [
      {
        title: 'Access the AI Assistant',
        description: 'Click on the AI Assistant icon in the navigation bar to start a conversation.'
      },
      {
        title: 'Ask Questions',
        description: 'Type your question in the chat box. The AI understands natural language and can help with various topics.'
      },
      {
        title: 'Use Advanced Features',
        description: 'Utilize features like code explanation, concept clarification, and step-by-step problem solving.'
      },
      {
        title: 'Review Chat History',
        description: 'Access your previous conversations and saved responses for quick reference.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default AIAssistantGuide;
