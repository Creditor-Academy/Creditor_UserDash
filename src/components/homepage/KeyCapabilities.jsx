import React, { useState } from 'react';
import { motion } from 'framer-motion';

const KeyCapabilities = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const capabilities = [
    {
      title: "AI-Powered Course Creation",
      description: "Generate complete courses in seconds with intelligent AI that understands your content needs and learner goals.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: "from-sky-400 via-blue-500 to-indigo-600",
      bgGradient: "from-sky-50 to-blue-50"
    },
    {
      title: "Smart Lesson Templates",
      description: "Pre-designed, research-backed templates that adapt to any subject, making course design effortless and effective.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      gradient: "from-blue-400 via-sky-500 to-cyan-600",
      bgGradient: "from-blue-50 to-sky-50"
    },
    {
      title: "Adaptive Learner Pathways",
      description: "VAK model integration that personalizes content delivery based on Visual, Auditory, and Kinesthetic learning styles.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: "from-cyan-400 via-blue-500 to-sky-600",
      bgGradient: "from-cyan-50 to-blue-50"
    },
    {
      title: "Multimedia & Interactivity Suite",
      description: "Rich media integration with interactive elements, quizzes, and gamification to boost engagement and retention.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-sky-500 via-blue-600 to-indigo-700",
      bgGradient: "from-sky-50 to-indigo-50"
    },
    {
      title: "AI Voice & Video Presenter",
      description: "Lifelike AI narrators and video presenters that bring your content to life with natural, engaging delivery.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-blue-500 via-indigo-600 to-purple-700",
      bgGradient: "from-blue-50 to-purple-50"
    },
    {
      title: "Analytics & Progress Dashboard",
      description: "Real-time insights into learner progress, engagement metrics, and performance analytics to optimize outcomes.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-indigo-500 via-blue-600 to-sky-700",
      bgGradient: "from-indigo-50 to-sky-50"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-sky-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-sky-200/30 to-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-sky-400" />
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-blue-200/50">
              Capabilities
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="text-gray-800">Built for Modern Learning</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the cutting-edge capabilities that make Athena the future of course creation and learning management
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              className="group relative h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              {/* Card */}
              <div className={`relative h-full min-h-[280px] bg-gradient-to-br ${capability.bgGradient} rounded-2xl p-8 overflow-hidden border border-sky-100/50 shadow-lg shadow-sky-100/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-200/50 group-hover:scale-105 group-hover:border-sky-200`}>
                
                {/* Large Number Overlay */}
                <span className={`absolute -top-4 -right-4 text-[140px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br ${capability.gradient} opacity-10 select-none pointer-events-none leading-none transition-all duration-500 ${hoveredIndex === index ? 'scale-110 opacity-20' : ''}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Radial glow */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${capability.gradient} rounded-full blur-3xl opacity-20 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-40' : ''}`} />
                  
                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${capability.gradient} flex items-center justify-center text-white shadow-xl shadow-blue-300/50 transition-all duration-500 ${hoveredIndex === index ? 'scale-110 shadow-blue-400/70 rotate-6' : ''}`}>
                    {capability.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${capability.gradient} bg-clip-text text-transparent transition-all duration-300`}>
                    {capability.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed text-sm flex-grow">
                    {capability.description}
                  </p>

                  {/* Hover indicator */}
                  <motion.div 
                    className={`mt-6 flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${capability.gradient} bg-clip-text text-transparent`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: hoveredIndex === index ? 1 : 0,
                      x: hoveredIndex === index ? 0 : -10
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>Learn more</span>
                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${capability.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500 pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 mb-6 text-lg">
            Ready to experience the power of Athena?
          </p>
          <button className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-10 rounded-xl shadow-xl shadow-blue-300/50 hover:shadow-blue-400/60 transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <span className="relative z-10">Start Building Courses Today</span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default KeyCapabilities;

