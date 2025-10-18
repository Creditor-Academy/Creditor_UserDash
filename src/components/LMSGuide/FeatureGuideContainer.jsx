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
import StudyGroupsGuide from './features/StudyGroupsGuide';
import GroupManagementGuide from './features/instructor/GroupManagementGuide';
import EventManagementGuide from './features/instructor/EventManagementGuide';
import AssetsManagementGuide from './features/instructor/AssetsManagementGuide';
import CourseAnalyticsGuide from './features/instructor/CourseAnalyticsGuide';
import CourseManagementGuide from './features/instructor/CourseManagementGuide';
import UserManagementGuide from './features/instructor/UserManagementGuide';
import CourseCatalogManagementGuide from './features/instructor/CourseCatalogGuide';

const FEATURE_COMPONENTS = {
  'study_groups': StudyGroupsGuide,
  'private_user_group': PrivateGroupGuide,
  'private_1_on_1_chat': PrivateChatGuide,
  'my_courses': MyCoursesGuide,
  'course_catalog': CourseCatalogGuide,
  'creditor_card': CreditorCardGuide,
  'credit_chatbot': CreditChatbotGuide,
  'support_tickets': SupportTicketsGuide,
  'progress_tracking': ProgressTrackingGuide,
  'edit_profile': EditProfileGuide,
  'instructor_group_management': GroupManagementGuide,
  'instructor_event_management': EventManagementGuide,
  'instructor_assets_management': AssetsManagementGuide,
  'instructor_course_analytics': CourseAnalyticsGuide,
  'instructor_course_management': CourseManagementGuide,
  'instructor_user_management': UserManagementGuide,
  'instructor_course_catalog_management': CourseCatalogManagementGuide
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