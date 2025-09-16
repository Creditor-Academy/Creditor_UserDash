import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, BookOpen, Image, FileText, Search, X, ArrowRight } from 'lucide-react';

const AICourseSuccessModal = ({ isOpen, onClose, courseData, onViewCourse }) => {
  if (!isOpen || !courseData) return null;

  const aiFeatures = [];
  
  if (courseData.aiMetadata?.generatedOutlines?.length > 0) {
    aiFeatures.push({ 
      icon: BookOpen, 
      label: 'Course Outlines', 
      count: courseData.aiMetadata.generatedOutlines.length,
      color: 'text-blue-600'
    });
  }
  
  if (courseData.aiMetadata?.generatedImages?.length > 0) {
    aiFeatures.push({ 
      icon: Image, 
      label: 'AI Images', 
      count: courseData.aiMetadata.generatedImages.length,
      color: 'text-purple-600'
    });
  }
  
  if (courseData.aiMetadata?.generatedSummaries?.length > 0) {
    aiFeatures.push({ 
      icon: FileText, 
      label: 'Summaries', 
      count: courseData.aiMetadata.generatedSummaries.length,
      color: 'text-green-600'
    });
  }
  
  if (courseData.aiMetadata?.aiSearchResults?.length > 0) {
    aiFeatures.push({ 
      icon: Search, 
      label: 'Research Results', 
      count: courseData.aiMetadata.aiSearchResults.length,
      color: 'text-orange-600'
    });
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Course Created Successfully!</h2>
                <p className="text-green-100 text-sm">Your AI-powered course is ready</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">{courseData.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{courseData.description}</p>
            </div>

            {/* AI Features Generated */}
            {aiFeatures.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">AI Content Generated</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {aiFeatures.map((feature, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                      <feature.icon className={`w-5 h-5 mx-auto mb-1 ${feature.color}`} />
                      <div className="text-lg font-semibold text-gray-900">{feature.count}</div>
                      <div className="text-xs text-gray-600">{feature.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Course Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Difficulty:</span>
                  <div className="font-medium text-gray-900 capitalize">{courseData.difficulty || 'Intermediate'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <div className="font-medium text-gray-900">{courseData.duration || '4'} weeks</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onViewCourse && onViewCourse(courseData);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                View Course
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICourseSuccessModal;
