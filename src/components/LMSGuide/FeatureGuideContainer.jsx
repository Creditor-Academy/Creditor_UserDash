import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PrivateGroupGuide from './features/PrivateGroupGuide';
import PrivateChatGuide from './features/PrivateChatGuide';
import MyCoursesGuide from './features/MyCoursesGuide';
import CourseCatalogGuide from './features/CourseCatalogGuide';
import CreditorCardGuide from './features/CreditorCardGuide';
import CreditChatbotGuide from './features/CreditChatbotGuide';
import SupportTicketsGuide from './features/SupportTicketsGuide';
import ProgressTrackingGuide from './features/ProgressTrackingGuide';
import EditProfileGuide from './features/EditProfileGuide';

const FEATURE_COMPONENTS = {
  'private_user_group': PrivateGroupGuide,
  'private_1_on_1_chat': PrivateChatGuide,
  'my_courses': MyCoursesGuide,
  'course_catalog': CourseCatalogGuide,
  'creditor_card': CreditorCardGuide,
  'credit_chatbot': CreditChatbotGuide,
  'support_tickets': SupportTicketsGuide,
  'progress_tracking': ProgressTrackingGuide,
  'edit_profile': EditProfileGuide
};

const FeatureGuideContainer = () => {
  const { featureId } = useParams();
  const FeatureComponent = FEATURE_COMPONENTS[featureId];
  
  console.log('Current featureId:', featureId);
  console.log('Available features:', Object.keys(FEATURE_COMPONENTS));

  if (!FeatureComponent) {
    return <Navigate to="/dashboard/guide" replace />;
  }

  return <FeatureComponent />;
};

export default FeatureGuideContainer;