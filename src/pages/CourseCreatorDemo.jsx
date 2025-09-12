import React from 'react';
import CourseCreator from '../components/courses/CourseCreator';

const CourseCreatorDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Course Creator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create comprehensive courses with AI-generated modules and lessons. 
              Each lesson includes structured content with headings, introductions, key points, and summaries.
            </p>
          </div>
          
          <CourseCreator />
        </div>
      </div>
    </div>
  );
};

export default CourseCreatorDemo;
