import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PenTool, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateCourseOptions = ({ isOpen, onClose, onSelectOption }) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const courseOptions = [
    {
      id: 'ai',
      title: 'AI Course',
      description: 'AI Course',
      icon: Sparkles,
      color:
        'bg-gradient-to-br from-cyan-400/90 via-sky-500/90 to-blue-600/90 hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 border border-cyan-200/70 shadow-lg shadow-cyan-200/60 backdrop-blur-md',
    },
    {
      id: 'blank',
      title: 'Manual Course',
      description: 'Create from scratch',
      icon: PenTool,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 10,
      transition: {
        duration: 0.15,
      },
    },
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    }),
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={e => {
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
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/30 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-md">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Create Course
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose your course creation method
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 h-9 w-9 transition-colors"
              aria-label="Close dialog"
              title="Close course creation options"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              {courseOptions.map(option => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${option.color} rounded-2xl p-4 cursor-pointer transition-all duration-200 text-white text-center group relative overflow-hidden`}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectOption(option.id);
                  }}
                  onMouseEnter={() =>
                    !option.disabled && setHoveredOption(option.id)
                  }
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  {/* Shine effect on hover */}
                  {!option.disabled && hoveredOption === option.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  <div className="flex flex-col items-center space-y-3 relative z-10">
                    <motion.div
                      animate={
                        option.disabled
                          ? {}
                          : {
                              rotate:
                                hoveredOption === option.id
                                  ? [0, -10, 10, -10, 0]
                                  : 0,
                              scale: hoveredOption === option.id ? 1.1 : 1,
                            }
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <option.icon className="w-10 h-10" strokeWidth={2} />
                    </motion.div>
                    <div className="text-center">
                      <span className="text-sm font-semibold block">
                        {option.title}
                      </span>
                      <span className="text-xs opacity-90 mt-1 block">
                        {option.description}
                      </span>
                    </div>
                  </div>

                  {option.disabled && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-[1px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* <motion.span 
                        className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Coming Soon
                      </motion.span> */}
                    </motion.div>
                  )}
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
