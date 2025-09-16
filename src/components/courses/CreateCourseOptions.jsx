import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Sparkles, 
  PenTool, 
  ChevronRight, 
  Bot, 
  User,
  Zap,
  BookOpen,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateCourseOptions = ({ isOpen, onClose, onSelectOption }) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const courseOptions = [
    {
      id: 'ai',
      title: 'Create Course with AI',
      description: 'Let AI help you generate course structure, lessons, and content automatically',
      icon: Sparkles,
      gradient: 'from-purple-500 via-blue-500 to-indigo-600',
      features: [
        'AI-generated course outline',
        'Automated content creation',
        'Smart lesson planning',
        'Instant quiz generation'
      ],
      badge: 'Smart',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'manual',
      title: 'Create Course Manually',
      description: 'Build your course from scratch with complete control over every detail',
      icon: PenTool,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      features: [
        'Full creative control',
        'Custom content structure',
        'Personalized lessons',
        'Flexible organization'
      ],
      badge: 'Traditional',
      badgeColor: 'bg-emerald-100 text-emerald-700'
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    })
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Course Creation Method
                </h2>
                <p className="text-gray-600">
                  Select how you'd like to create your new course
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`h-full cursor-pointer transition-all duration-300 border-2 hover:shadow-xl ${
                      hoveredOption === option.id 
                        ? 'border-blue-300 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    onClick={() => onSelectOption(option.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${option.gradient} shadow-lg`}>
                          <option.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.badgeColor}`}>
                          {option.badge}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        <h4 className="font-medium text-gray-900 text-sm">Key Features:</h4>
                        <ul className="space-y-2">
                          {option.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white font-medium py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOption(option.id);
                        }}
                      >
                        {option.id === 'ai' ? (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            Start with AI
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Create Manually
                          </>
                        )}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Need Help Deciding?</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Choose AI-assisted creation for quick setup and content suggestions, or manual creation 
                    for complete control over your course structure and content.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateCourseOptions;
