import React from 'react';
import { CreditCard } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const CreditorCardGuide = () => {
  const featureData = {
    id: 'creditor_card',
    icon: CreditCard,
    title: 'Creditor Card',
    introduction: `The Creditor Card feature provides a convenient way to manage your subscription and payment details. Keep track of your transactions, update payment methods, and view your billing history all in one secure location. This tool ensures smooth and transparent financial management of your learning journey.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example7',
        title: 'Managing Your Creditor Card',
        description: 'Learn how to manage your payment methods, view transaction history, and handle billing preferences.'
      }
    ],
    steps: [
      {
        title: 'Access Creditor Card',
        description: 'Click on the "Creditor Card" option in the sidebar to view your payment dashboard.'
      },
      {
        title: 'View Transaction History',
        description: 'Access a detailed list of all your transactions, including course purchases and subscription payments.'
      },
      {
        title: 'Update Payment Methods',
        description: 'Add, remove, or update your payment methods securely through the payment settings section.'
      },
      {
        title: 'Manage Subscriptions',
        description: 'View and manage your current subscription plan, billing cycle, and payment preferences.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default CreditorCardGuide;
