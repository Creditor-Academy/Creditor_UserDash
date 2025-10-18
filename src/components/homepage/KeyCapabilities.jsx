import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Voice from '../../assets/Voice.webp';
import AI from '../../assets/AI.webp';
import Multi  from '../../assets/Multi.webp';
import Pathway from '../../assets/Pathway.webp';
import Progress from '../../assets/progres.webp';
import Template from '../../assets/Template.webp';


const KeyCapabilities = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  const capabilities = [
    {
      title: "AI-Powered Course Creation",
      description: "Generate complete courses in seconds with intelligent AI that understands your content needs and learner goals.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      image: AI, // Add your image path here
      gradient: "from-sky-400 via-blue-500 to-indigo-600",
      bgGradient: "from-sky-50 to-blue-50"
    },
    {
      title: "Smart Lesson Templates",
      description: "Pre-designed, research-backed templates that adapt to any subject, making course design effortless and effective.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      image: Template, // Add your image path here
      gradient: "from-blue-400 via-sky-500 to-cyan-600",
      bgGradient: "from-blue-50 to-sky-50"
    },
    {
      title: "Adaptive Learner Pathways",
      description: "VAK model integration that personalizes content delivery based on Visual, Auditory, and Kinesthetic learning styles.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      image: Pathway, // Add your image path here
      gradient: "from-cyan-400 via-blue-500 to-sky-600",
      bgGradient: "from-cyan-50 to-blue-50"
    },
    {
      title: "Multimedia & Interactivity Suite",
      description: "Rich media integration with interactive elements, quizzes, and gamification to boost engagement and retention.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: Multi, // Add your image path here
      gradient: "from-sky-500 via-blue-600 to-indigo-700",
      bgGradient: "from-sky-50 to-indigo-50"
    },
    {
      title: "AI Voice & Video Presenter",
      description: "Lifelike AI narrators and video presenters that bring your content to life with natural, engaging delivery.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      image: Voice, // Add your image path here
      gradient: "from-blue-500 via-indigo-600 to-purple-700",
      bgGradient: "from-blue-50 to-purple-50"
    },
    {
      title: "Analytics & Progress Dashboard",
      description: "Real-time insights into learner progress, engagement metrics, and performance analytics to optimize outcomes.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      image: Progress, // Add your image path here
      gradient: "from-indigo-500 via-blue-600 to-sky-700",
      bgGradient: "from-indigo-50 to-sky-50"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)"
    }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
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
            className="inline-flex items-center gap-2 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <span className="bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-200">
              CAPABILITIES
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Revolutionary Features
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-medium">
            Experience the next generation of learning technology
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
              <div className="group relative h-full">
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${capability.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`}></div>
                
                <div className={`relative h-full bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/20 group-hover:border-transparent group-hover:-translate-y-2 flex flex-col`}>
                  
                  {/* Image Section */}
                  {capability.image && (
                    <div className="relative w-full h-52 flex-shrink-0 overflow-hidden">
                      <img 
                        src={capability.image} 
                        alt={capability.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className={`absolute inset-0 bg-gradient-to-br ${capability.gradient} opacity-20 mix-blend-overlay`} />
                      
                      {/* Number Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${capability.gradient} flex items-center justify-center shadow-2xl transform transition-all duration-300 ${hoveredIndex === index ? 'scale-110 rotate-12' : ''}`}>
                          <span className="text-xl font-black text-white">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Floating icon badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xl transform transition-all duration-300 ${hoveredIndex === index ? 'scale-110 -rotate-6' : ''}`}>
                          <div className={`w-6 h-6 text-blue-600`}>
                            {capability.icon}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col flex-grow p-6 bg-gradient-to-b from-white to-gray-50/50">
                    {/* Title */}
                    <h3 className="text-xl font-black mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {capability.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm flex-grow mb-4">
                      {capability.description}
                    </p>

                    {/* CTA Button */}
                    <motion.button
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${capability.gradient} text-white font-semibold text-sm shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: hoveredIndex === index ? 1 : 0,
                        y: hoveredIndex === index ? 0 : 10
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      Learn More
                    </motion.button>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                      <div className={`h-full bg-gradient-to-r ${capability.gradient} transform origin-left transition-all duration-700 ${hoveredIndex === index ? 'scale-x-100' : 'scale-x-0'}`}></div>
                    </div>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            
            <button 
              onClick={() => navigate('/plans')}
              className="relative bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-600/60 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10 text-lg flex items-center gap-3">
                Start Your Journey
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
          <p className="text-gray-500 mt-5 text-sm font-medium">
            Join thousands of educators worldwide • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default KeyCapabilities;

