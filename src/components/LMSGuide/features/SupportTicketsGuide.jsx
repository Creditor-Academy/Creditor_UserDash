import React from 'react';
import { FileQuestion } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const SupportTicketsGuide = () => {
  const featureData = {
    id: 'support_tickets',
    icon: FileQuestion,
    title: 'Support Tickets',
    introduction: `The Support Tickets system provides a structured way to get help with any issues or questions you may have. Create detailed tickets, track their status, and communicate directly with our support team. This ensures that your concerns are addressed efficiently and professionally.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example9',
        title: 'Creating and Managing Support Tickets',
        description: 'Learn how to effectively create, track, and manage your support tickets for the best assistance.'
      }
    ],
    steps: [
      {
        title: 'Create a New Ticket',
        description: 'Click on "Support Tickets" and select "New Ticket" to report an issue or ask a question.'
      },
      {
        title: 'Provide Details',
        description: 'Fill in the ticket form with a clear description, category, and any relevant attachments.'
      },
      {
        title: 'Track Progress',
        description: 'Monitor your ticket status and view responses from the support team in real-time.'
      },
      {
        title: 'Respond and Resolve',
        description: 'Engage with support staff through ticket comments and mark issues as resolved when completed.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default SupportTicketsGuide;
