import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Type,
  FileText,
  Mic,
  Image as ImageIcon,
  Presentation,
  Settings,
  Sparkles,
  Layers,
} from 'lucide-react';
import communityImage from '../../../assets/Community.png';

const features = [
  {
    id: 1,
    title: 'Performance Checkout',
    description:
      'Cut down on abandoned carts by capturing all necessary customer payment information in just one click.',
    mockupBg: 'bg-[#e8e8e8]',
    bottomColor: '#3b82f6', // blue
    showIcons: true,
  },
  {
    id: 2,
    title: 'Payment options',
    description:
      'Make it easy for customers to buy from you with multiple payment options including Apple Pay, Google Pay, Amazon Pay, Cash App, and Link by Stripe.',
    mockupBg: 'bg-[#e8e8e8]',
    bottomColor: '#f59e0b', // yellow/amber
    showLandingPage: true,
  },
  {
    id: 3,
    title: 'Abandoned cart emails',
    description:
      'Recover lost sales with automated follow-up emails to customers who start but do not complete their checkout.',
    mockupBg: 'bg-[#e8e8e8]',
    bottomColor: '#ea580c', // orange
    showEmail: true,
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

const Digitalunlock = () => {
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
            Remove barriers and
            <span className="block">optimize for conversion</span>
          </h2>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
            Make buying your learning products easy with flexible payment
            options and tools that streamline the checkout experience.
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

                  {/* Image mockup for community (replacing generator) */}
                  {feature.showLandingPage && (
                    <div className="relative w-full max-w-[260px]">
                      <div className="bg-white rounded-lg shadow-xl p-2">
                        <div className="w-full h-40 overflow-hidden flex items-center justify-center bg-gray-50 rounded">
                          <img
                            src={communityImage}
                            alt="Community preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revenue product card overlay mockup */}
                  {feature.showEmail && (
                    <div className="relative w-full max-w-[260px]">
                      <div className="bg-white rounded-xl shadow-2xl p-4">
                        <h4 className="text-xs font-semibold text-gray-900 mb-3">
                          Your Products
                        </h4>
                        <div className="space-y-2 mb-4">
                          {[
                            'Course Bundle',
                            'Templates Pack',
                            'Community Access',
                          ].map((product, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between group py-1"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Drag handle dots */}
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  </div>
                                  <div className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  </div>
                                  <div className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-gray-800 group-hover:text-gray-900">
                                  {product}
                                </span>
                              </div>
                              <button className="text-gray-300 hover:text-gray-500 transition-colors ml-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 bg-[#0f4c81] hover:bg-[#0d3f6b] text-white px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200">
                          <Layers className="w-4 h-4" />
                          Add More
                        </button>
                      </div>
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
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-800">
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

export default Digitalunlock;
