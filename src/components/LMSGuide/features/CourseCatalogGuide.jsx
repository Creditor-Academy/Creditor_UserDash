import React from 'react';
import { Library } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const CourseCatalogGuide = () => {
  const featureData = {
    id: 'course_catalog',
    icon: Library,
    title: 'Course Catalog',
    introduction: `The Course Catalog is your gateway to discovering new learning opportunities. Browse through our comprehensive collection of courses, filter by categories, and find the perfect courses to enhance your skills. Our catalog is regularly updated with new content to ensure you have access to the latest educational resources.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example6',
        title: 'Exploring the Course Catalog',
        description: 'Learn how to effectively search, filter, and find the perfect courses for your learning journey.',
      },
    ],
    steps: [
      {
        title: 'Access the Catalog',
        description: 'Click on "Course Catalog" in the sidebar to explore all available courses.',
      },
      {
        title: 'Use Search and Filters',
        description: 'Utilize the search bar and filter options to narrow down courses by category, difficulty level, or topic.',
      },
      {
        title: 'View Course Details',
        description: 'Click on any course to view detailed information including syllabus, prerequisites, and instructor details.',
      },
      {
        title: 'Enroll in Courses',
        description: "Once you find a course you're interested in, click the 'Enroll' button to add it to your learning path.",
      },
    ],
  };

  return <BaseFeature feature={featureData} />;
};

export default CourseCatalogGuide;
