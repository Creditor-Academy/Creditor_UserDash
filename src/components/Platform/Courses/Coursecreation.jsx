import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Type,
  FileText,
  Mic,
  Image as ImageIcon,
  Presentation,
} from 'lucide-react';
import quizImage from '../../../assets/quiz.png';

const features = [
  {
    id: 1,
    title: 'Your course, your way',
    description:
      'Let your content shine by choosing the best medium for your message: text, images, videos, downloads, PDFs, audio, and presentations.',
    mockupBg: 'bg-[#e8e8e8]', // light gray like image
    bottomColor: '#3b82f6', // blue
    showIcons: true,
  },
  {
    id: 2,
    title: 'Motivate learners',
    description:
      'Measure and rate learner progress with assignments, AI-generated quizzes, surveys, and exams to keep them engaged and on track.',
    mockupBg: 'bg-[#e8e8e8]', // light gray same as other cards
    bottomColor: '#f59e0b', // yellow/amber for hover effect
    showQuiz: true,
  },
  {
    id: 3,
    title: 'Make data-driven decisions',
    description:
      'Track engagement, revenue, and performance metrics with Athena Analytics to drive data-informed decisions that maximize your impact.',
    mockupBg: 'bg-[#e8e8e8]', // light gray like image
    bottomColor: '#b91c1c', // red
    showChart: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Coursecreation = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight">
            Top-tier course creation tools for education businesses
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Your knowledge is unique. Athena LMS gives you the power and
            flexibility to offer a course experience your audience won't find
            anywhere else — plus the tools to help you track your results.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map(feature => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group"
            >
              <div
                className="relative h-full bg-white overflow-hidden shadow-2xl hover:shadow-3xl border border-gray-200 transition-all duration-300 flex flex-col"
                onMouseEnter={() => setHoveredIndex(feature.id - 1)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Mockup Area */}
                <div
                  className={`${feature.mockupBg} h-48 flex items-center justify-center p-4 relative flex-shrink-0 overflow-hidden`}
                >
                  {/* Icons Grid Mockup */}
                  {feature.showIcons && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center shadow-md">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                        <Type className="w-6 h-6 text-gray-800" />
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                        <FileText className="w-6 h-6 text-gray-800" />
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                        <Mic className="w-6 h-6 text-gray-800" />
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                        <ImageIcon className="w-6 h-6 text-gray-800" />
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm">
                        <Presentation className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  )}

                  {/* Quiz Generator Mockup */}
                  {feature.showQuiz && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={quizImage}
                        alt="Quiz Interface"
                        className="w-full h-full object-contain scale-110"
                      />
                    </div>
                  )}

                  {/* Chart Mockup */}
                  {feature.showChart && (
                    <div className="bg-white rounded-lg shadow-xl p-3 w-full max-w-[200px]">
                      <div className="text-[10px] font-medium text-gray-600 mb-2">
                        Revenue Over Time
                      </div>
                      <div className="bg-pink-200 rounded-lg p-2 mb-2 inline-block">
                        <div className="text-lg font-bold text-gray-900">
                          $246,301
                        </div>
                        <div className="text-[9px] text-gray-700">
                          Total Revenue
                        </div>
                      </div>
                      <svg
                        className="w-full h-12"
                        viewBox="0 0 300 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 0,80 L 30,75 L 60,70 L 90,65 L 120,60 L 150,55 L 180,45 L 210,35 L 240,25 L 270,15 L 300,10"
                          fill="none"
                          stroke="#1f2937"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                  {/* Hover Fill Animation */}
                  {feature.bottomColor && (
                    <div
                      className="absolute inset-0 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: feature.bottomColor,
                        transform:
                          hoveredIndex === feature.id - 1
                            ? 'translateY(0)'
                            : 'translateY(100%)',
                        opacity: hoveredIndex === feature.id - 1 ? 0.2 : 0,
                      }}
                    />
                  )}

                  {/* Content with higher z-index */}
                  <div className="relative z-10 flex flex-col flex-grow">
                    <h3
                      className={`text-xl font-bold mb-3 ${feature.id === 2 ? 'text-gray-900' : 'text-gray-900'}`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${feature.id === 2 ? 'text-gray-800' : 'text-gray-600'}`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Color Line - Static */}
                {feature.bottomColor && (
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div
                      style={{
                        backgroundColor: feature.bottomColor,
                        height: '100%',
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Coursecreation;
