import React from 'react';
import { MessageSquare } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const PrivateChatGuide = () => {
  const featureData = {
    id: 'private_chat',
    icon: MessageSquare,
    title: 'Private 1 on 1 Chat',
    introduction: `The Private 1 on 1 Chat feature enables direct, secure communication between users. Whether you need to discuss course materials, seek clarification, or collaborate on projects, this feature ensures your conversations remain private and organized.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example3',
        title: 'Using Private Chat Features',
        description: 'Learn how to start conversations, use chat features, and manage your private messages securely.'
      }
    ],
    steps: [
      {
        title: 'Access Chat Feature',
        description: 'Click on the "Messages" icon in the sidebar to access your chat dashboard.'
      },
      {
        title: 'Start New Chat',
        description: 'Click the "New Message" button and select a user from the directory to start a private conversation.'
      },
      {
        title: 'Send Messages',
        description: 'Type your message in the chat box and use the additional features like file sharing or emojis as needed.'
      },
      {
        title: 'Manage Conversations',
        description: 'Use the conversation settings to mute notifications, search message history, or manage shared files.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default PrivateChatGuide;