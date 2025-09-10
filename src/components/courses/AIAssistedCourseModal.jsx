import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import AICourseWorkspace from './AICourseWorkspace';

const AIAssistedCourseModal = ({ isOpen, onClose, onCourseCreated }) => {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    duration: '',
    objectives: '',
    difficulty: 'beginner'
  });

  const handleOpenWorkspace = () => {
    setShowWorkspace(true);
  };

  const handleCloseWorkspace = () => {
    setShowWorkspace(false);
  };

  const handleSaveCourse = async (courseData) => {
    console.log('AIAssistedCourseModal - handleSaveCourse called with:', courseData);
    
    try {
      // Use regular createCourse function and createAIModulesAndLessons
      const { createCourse, createAIModulesAndLessons } = await import('../../services/courseService');
      
      // Prepare data in exact format as CreateCourseModal
      const coursePayload = {
        title: courseData.title || '',
        description: courseData.description || '',
        learning_objectives: courseData.objectives ? courseData.objectives.split('\n').map(s => s.trim()).filter(Boolean) : [],
        isHidden: false,
        course_status: courseData.course_status || 'PUBLISHED',
        estimated_duration: courseData.duration || '4 weeks',
        max_students: Number(courseData.max_students) || 100,
        course_level: 'BEGINNER',
        courseType: 'OPEN',
        lockModules: 'UNLOCKED',
        price: courseData.price || '0',
        requireFinalQuiz: true,
        thumbnail: courseData.thumbnail || null
      };
      
      console.log('Creating course with payload:', coursePayload);
      
      // Create the course using regular function
      const response = await createCourse(coursePayload);
      
      console.log('Course created successfully:', response);
      
      // Now create the AI-generated modules and lessons
      if (response.success && courseData.outlines && courseData.outlines.length > 0) {
        console.log('Creating AI modules and lessons for course ID:', response.data.id || response.data._id);
        
        try {
          const moduleResult = await createAIModulesAndLessons(
            response.data.id || response.data._id, 
            courseData.outlines
          );
          console.log('AI modules and lessons created:', moduleResult);
        } catch (moduleError) {
          console.error('Failed to create AI modules and lessons:', moduleError);
          // Don't fail the entire process, just log the error
          alert('Course created but failed to add AI-generated modules: ' + moduleError.message);
        }
      }
      
      if (response.success && onCourseCreated) {
        // Add AI metadata to the created course data
        const courseWithAI = {
          ...response.data,
          isAIGenerated: true,
          aiMetadata: {
            generatedOutlines: courseData.outlines || [],
            generatedImages: courseData.images || [],
            generatedSummaries: courseData.summaries || [],
            aiSearchResults: courseData.searchResults || [],
            createdAt: new Date().toISOString()
          }
        };
        onCourseCreated(courseWithAI);
      }
      
      setShowWorkspace(false);
      onClose();
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course: ' + error.message);
    }
  };

  if (!isOpen) return null;

  if (showWorkspace) {
    return (
      <AICourseWorkspace
        isOpen={showWorkspace}
        onClose={handleCloseWorkspace}
        courseData={formData}
        onSave={handleSaveCourse}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-bold">AI Course Creation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Tell us about your course</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Introduction to React Development"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Beginner developers"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="4"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="What will students be able to do after completing this course?"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleOpenWorkspace}
              disabled={!formData.title || !formData.description}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Open AI Workspace
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistedCourseModal;
