import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  CircleDot,
  Loader2,
} from 'lucide-react';
import {
  fetchUserAllModules,
  trackModuleAccess,
  trackLessonAccess,
  updateProgressAfterTracking,
} from '@/services/progressService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeader } from '@/services/authHeader';

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

function ModuleCard({ module, onModuleClick }) {
  const color = module.completed
    ? 'bg-emerald-500'
    : module.progress > 0
      ? 'bg-amber-400'
      : 'bg-rose-400';

  const Icon = module.completed
    ? CheckCircle2
    : module.progress > 0
      ? CircleDot
      : Lock;

  const handleClick = () => {
    if (onModuleClick) {
      onModuleClick(module);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {module.module_thumbnail ? (
            <img
              src={module.module_thumbnail}
              alt={module.module_title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {module.module_title}
            </h3>
          </div>

          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
            {module.module_description || 'No description available'}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{module.estimated_duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span className="truncate">{module.course_title}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Progress
              </span>
              <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                {clamp(module.progress || 0, 0, 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className={`h-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${clamp(module.progress || 0, 0, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ModulesModal({ isOpen, onClose }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchModules();
    }
  }, [isOpen]);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchUserAllModules();
      setModules(response.modules || []);
    } catch (err) {
      setError(err.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = async module => {
    try {
      console.log('Tracking module access for:', module.module_id);

      // Track module access
      await trackModuleAccess(module.module_id);

      let lessonId = null;

      // Try to get the first lesson for this module to track lesson access
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/course/${module.course_id}/modules/${module.module_id}/lesson/all-lessons`,
          {
            headers: {
              ...getAuthHeader(),
              'Content-Type': 'application/json',
            },
          }
        );

        const lessons = response.data?.data || [];
        if (lessons.length > 0) {
          const firstLesson = lessons[0];
          lessonId = firstLesson.id;
          console.log('Tracking lesson access for:', firstLesson.id);
          await trackLessonAccess(firstLesson.id);
        }
      } catch (lessonError) {
        console.warn('Failed to fetch lessons for tracking:', lessonError);
        // Continue even if lesson tracking fails
      }

      // Update progress after tracking
      try {
        console.log('Updating progress after tracking...');
        await updateProgressAfterTracking(module.module_id, lessonId);
        console.log('Progress update completed');
      } catch (progressError) {
        console.warn('Failed to update progress:', progressError);
        // Continue even if progress update fails
      }

      // Navigate to the module's course page
      if (module.course_id) {
        navigate(
          `/dashboard/courses/${module.course_id}/modules/${module.module_id}/lessons`
        );
      } else {
        // Fallback: try to navigate by module ID only
        navigate(`/dashboard/modules/${module.module_id}/lessons`);
      }

      // Close modal after navigation
      onClose();
    } catch (error) {
      console.error('Error tracking module access:', error);
      // Still navigate even if tracking fails
      if (module.course_id) {
        navigate(
          `/dashboard/courses/${module.course_id}/modules/${module.module_id}/lessons`
        );
      } else {
        navigate(`/dashboard/modules/${module.module_id}/lessons`);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[75vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Modules</h2>
                <p className="text-sm text-gray-600">
                  {modules.length} module{modules.length !== 1 ? 's' : ''}{' '}
                  available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading modules...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-600 mb-3 font-medium">{error}</div>
                <button
                  onClick={fetchModules}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No modules available
                </h3>
                <p className="text-sm text-gray-500">
                  Start by enrolling in a course to unlock modules
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {modules.map(module => (
                    <ModuleCard
                      key={module.module_id}
                      module={module}
                      onModuleClick={handleModuleClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
