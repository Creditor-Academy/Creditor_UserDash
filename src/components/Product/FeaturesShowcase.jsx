import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Brain, 
  Palette, 
  Volume2, 
  Video, 
  Target, 
  Award, 
  TrendingUp,
  X,
  CheckCircle,
  Zap,
  Sparkles
} from 'lucide-react';

const FeaturesShowcase = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainFeatures = [
    {
      id: 1,
      icon: BarChart3,
      title: "Dashboard Analytics",
      shortDesc: "Real-time insights & progress tracking",
      iconColor: "text-slate-700",
      subFeatures: [
        "Learner progress tracking with detailed timelines",
        "Engagement analytics and behavior patterns",
        "Customizable graphs and visual reports",
        "VAK pathway indicators and learning style analysis"
      ]
    },
    {
      id: 2,
      icon: Brain,
      title: "AI Lesson Studio",
      shortDesc: "Create lessons with AI assistance",
      iconColor: "text-slate-700",
      subFeatures: [
        "13+ interactive lesson templates",
        "Bloom's Taxonomy integration for learning objectives",
        "Auto-assessment creation aligned with outcomes",
        "Instructional strategies and pedagogical guidance"
      ]
    },
    {
      id: 3,
      icon: Palette,
      title: "AI Design Suite",
      shortDesc: "Visual content creation tools",
      iconColor: "text-slate-700",
      subFeatures: [
        "Smart layout generator for instant designs",
        "AI image creator with text-to-image conversion",
        "Brand intelligence for consistent styling",
        "Multi-format conversion and responsive layouts"
      ]
    },
    {
      id: 4,
      icon: Volume2,
      title: "Voice Studio",
      shortDesc: "Text-to-speech technology",
      iconColor: "text-slate-700",
      subFeatures: [
        "Multiple AI voices with natural expressions",
        "140+ languages and accents",
        "Adjustable playback speed (0.5x to 4x)",
        "Offline playback and device sync"
      ]
    },
    {
      id: 5,
      icon: Video,
      title: "Video Creator",
      shortDesc: "AI-powered video generation",
      iconColor: "text-slate-700",
      subFeatures: [
        "200+ AI avatars with realistic expressions",
        "Auto-captioning and subtitle generation",
        "Interactive video elements and hotspots",
        "Professional template library"
      ]
    },
    {
      id: 6,
      icon: Target,
      title: "Adaptive Learning",
      shortDesc: "Personalized learning paths",
      iconColor: "text-slate-700",
      subFeatures: [
        "VAK model integration for learning styles",
        "Custom learning routes based on progress",
        "Dynamic content adaptation",
        "Smart recommendations and next steps"
      ]
    },
    {
      id: 7,
      icon: Award,
      title: "Assessment Engine",
      shortDesc: "Smart testing & evaluation",
      iconColor: "text-slate-700",
      subFeatures: [
        "Bloom's taxonomy alignment for questions",
        "Automated grading and instant feedback",
        "Scenario-based and interactive tests",
        "Detailed performance analytics"
      ]
    },
    {
      id: 8,
      icon: TrendingUp,
      title: "AI Analytics",
      shortDesc: "Advanced insights & reports",
      iconColor: "text-slate-700",
      subFeatures: [
        "Learning gap analysis and intervention points",
        "Cohort performance comparisons",
        "Predictive insights for learner success",
        "Custom reports and data exports"
      ]
    }
  ];

  const openModal = (feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-5 py-2.5 bg-sky-100 border border-sky-200 rounded-full text-sky-700 text-sm font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2 text-sky-600" />
            8 Core Features
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Complete Feature Suite
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Explore our comprehensive tools designed to transform your learning experience
          </p>
        </motion.div>

        {/* Features Grid - Enhanced with Sky Blue */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => openModal(feature)}
              className="cursor-pointer group"
            >
              <div className="relative bg-white border border-sky-100 rounded-xl p-6 hover:bg-sky-100 hover:shadow-xl hover:border-sky-300 shadow-md transition-all duration-300 h-full">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors shadow-sm">
                    <feature.icon className="w-6 h-6 text-sky-600 group-hover:text-sky-700" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {feature.shortDesc}
                  </p>

                  <div className="flex items-center text-sky-600 group-hover:text-sky-700 text-sm font-medium group-hover:translate-x-1 transition-all">
                    View Details →
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Modal - Sky Blue & White Theme */}
      <AnimatePresence>
        {isModalOpen && selectedFeature && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
            />
            
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header - Sky Blue Theme */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-5 border-b border-sky-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white border-2 border-sky-200 rounded-xl flex items-center justify-center shadow-sm">
                        <selectedFeature.icon className="w-6 h-6 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {selectedFeature.title}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">
                          {selectedFeature.shortDesc}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Hidden Scrollbar with Sky Blue Accents */}
                <div 
                  className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-white to-sky-50/30"
                  style={{ 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <style>{`
                    .flex-1.overflow-y-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  
                  <div className="space-y-3">
                    {selectedFeature.subFeatures.map((subFeature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start space-x-3 p-4 bg-white border border-sky-100 rounded-lg hover:border-sky-300 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-md flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="text-slate-700 leading-relaxed">
                          {subFeature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer - Sky Blue Theme */}
                <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-t border-sky-200">
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-white border-2 border-sky-300 text-slate-700 font-semibold rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      className="flex-1 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 shadow-lg transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturesShowcase;
