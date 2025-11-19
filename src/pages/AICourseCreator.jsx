import React from 'react';
import { useNavigate } from 'react-router-dom';
import DedicatedAICourseCreator from '@/components/courses/DedicatedAICourseCreator';

const AICourseCreator = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <DedicatedAICourseCreator />
    </div>
  );
};

export default AICourseCreator;
