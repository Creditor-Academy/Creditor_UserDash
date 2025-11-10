import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Type, FileText, Mic, Image as ImageIcon, Presentation, Settings, Sparkles } from 'lucide-react';

const features = [
  {
    id: 1,
    title: "Multiple content types",
    description: "Offer eBooks, guides, templates, audio, and more, catering your lead generating content to your target audience.",
    mockupBg: "bg-[#e8e8e8]",
    bottomColor: "#3b82f6", // blue
    showIcons: true,
  },
  {
    id: 2,
    title: "Save time with AI",
    description: "Use the power of AI to create customizable landing pages that highlight your unique expertise and naturally sell your digital downloads",
    mockupBg: "bg-[#e8e8e8]",
    bottomColor: "#f59e0b", // yellow/amber
    showLandingPage: true,
  },
  {
    id: 3,
    title: "Upsell your leads",
    description: "Once you collect a lead in Athena LMS, you can easily upsell them to paid products via email funnels or even a community.",
    mockupBg: "bg-[#e8e8e8]",
    bottomColor: "#ea580c", // orange
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
            Unlock a new way to get real results, real fast
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Offer eBooks, guides, templates, and more to attract new leads and quickly boost your business.
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
          {features.map((feature) => (
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
                <div className={`${feature.mockupBg} h-48 flex items-center justify-center p-4 relative flex-shrink-0 overflow-hidden`}>
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

                  {/* Landing Page Generator Mockup */}
                  {feature.showLandingPage && (
                    <div className="relative w-full max-w-[240px]">
                      <div className="bg-white rounded-lg shadow-xl p-4">
                        {/* Header with Settings Icon */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-gray-900">Create your landing page</h4>
                          <div className="bg-pink-300 rounded-full p-2">
                            <Settings className="w-3 h-3 text-gray-800" />
                          </div>
                        </div>
                        
                        {/* Generating Status */}
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-700">Generating headlines...</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                          <div className="bg-gray-400 h-1.5 rounded-full w-2/3"></div>
                        </div>
                        
                        {/* Stop Button */}
                        <button className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
                          Stop generating
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Email Upsell Mockup */}
                  {feature.showEmail && (
                    <div className="relative w-full max-w-[220px]">
                      <div className="bg-white rounded-lg shadow-xl p-3">
                        {/* Email Fields */}
                        <div className="space-y-1.5 mb-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600">Subject</span>
                            <div className="bg-gray-200 h-1.5 w-28 rounded"></div>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600">To</span>
                            <div className="bg-gray-200 h-1.5 w-28 rounded"></div>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600">From</span>
                            <div className="bg-gray-200 h-1.5 w-28 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Email Body */}
                        <div className="bg-gray-100 rounded p-2 mb-2 h-12"></div>
                        
                        {/* Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button className="text-[10px] px-2.5 py-1 bg-yellow-400 text-gray-900 rounded font-semibold">
                            Buy Now
                          </button>
                          <button className="text-[10px] px-2.5 py-1 bg-pink-300 text-gray-900 rounded font-semibold flex items-center gap-1">
                            <span className="text-sm leading-none">🛒</span>
                            Add Product
                          </button>
                        </div>
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
                        transform: hoveredIndex === feature.id - 1 ? 'translateY(0)' : 'translateY(100%)',
                        opacity: hoveredIndex === feature.id - 1 ? 0.2 : 0
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
                        height: '100%'
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

