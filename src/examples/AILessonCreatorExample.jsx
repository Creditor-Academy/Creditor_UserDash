import React, { useState } from 'react';
import AILessonCreator from '../components/courses/AILessonCreator';

const AILessonCreatorExample = () => {
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');

  const handleLessonsCreated = (lessonData) => {
    console.log('Lessons created:', lessonData);
    alert(`Successfully created ${lessonData.lessons.length} lessons for "${lessonData.courseTitle}"!`);
    // In a real application, you would save this data to your database
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Lesson Creator Example</h1>
        <p className="text-gray-600 mb-6">
          This example demonstrates how to use the AI Lesson Creator component to generate and edit lessons for a course.
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-800 mb-2">How it works</h2>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Enter a course title</li>
              <li>AI automatically generates 6 comprehensive lessons</li>
              <li>Edit lesson content manually as needed</li>
              <li>Preview the complete course structure</li>
              <li>Save lessons to your database</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Enter course title (e.g., Introduction to React)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <button
              onClick={() => {
                if (courseTitle.trim()) {
                  setShowLessonCreator(true);
                } else {
                  alert('Please enter a course title');
                }
              }}
              disabled={!courseTitle.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Create AI Lessons
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Lesson Creator Component */}
      <AILessonCreator
        isOpen={showLessonCreator}
        onClose={() => setShowLessonCreator(false)}
        courseTitle={courseTitle}
        onLessonsCreated={handleLessonsCreated}
      />
    </div>
  );
};

export default AILessonCreatorExample;