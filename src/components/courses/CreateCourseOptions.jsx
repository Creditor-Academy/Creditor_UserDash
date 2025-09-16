import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  PenTool, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateCourseOptions = ({ isOpen, onClose, onSelectOption }) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const courseOptions = [
    {
      id: 'ai',
      title: 'AI Course',
      icon: Sparkles,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'blank',
      title: 'Manual Course',
      icon: PenTool,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
        onClick={(e) => {
          // Only close if clicking the backdrop itself
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Course
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 h-8 w-8"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {courseOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${option.color} rounded-lg p-4 cursor-pointer transition-all duration-200 text-white text-center group`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectOption(option.id);
                    // Don't call onClose here - let the parent handle it
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <option.icon className="w-8 h-8" />
                    <span className="text-sm font-medium">{option.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateCourseOptions;
