import React from 'react';
import { BookOpen } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const MyCoursesGuide = () => {
  const featureData = {
    id: 'my_courses',
    icon: BookOpen,
    title: 'My Courses',
    introduction: `The My Courses section is your personal learning hub where you can access all your enrolled courses, track your progress, and continue your learning journey. This centralized dashboard provides easy access to your course materials, assignments, and assessments, helping you stay organized and focused on your educational goals.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example5',
        title: 'Navigating Your Course Dashboard',
        description: 'Learn how to efficiently navigate through your enrolled courses, access course materials, and track your progress.'
      }
    ],
    steps: [
      {
        title: 'Access Your Course Dashboard',
        description: 'Click on "My Courses" in the sidebar to view all your enrolled courses in one place.'
      },
      {
        title: 'Select a Course',
        description: 'Click on any course card to access its content. Recently accessed courses appear at the top.'
      },
      {
        title: 'Navigate Course Content',
        description: 'Use the course menu to access different sections: modules, assignments, quizzes, and resources.'
      },
      {
        title: 'Track Your Progress',
        description: 'View your completion status, grades, and upcoming deadlines through the progress indicators on each course.'
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default MyCoursesGuide;
