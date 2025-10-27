import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Globe,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import Community from "../../../assets/Community.png";
import Landing from "../../../assets/Landing.png";

const features = [
  {
    id: 1,
    title: "Courses",
    description:
      "From digital badges to clear learning paths, our courses have everything you need to create programs without obstacles and encourage learner engagement.",
    icon: BookOpen,
    mockupBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    accentColor: "blue",
    bottomColor: "#3b82f6", // blue
    showCourseCreation: true,
  },
  {
    id: 2,
    title: "Communities",
    description:
      "Athena Communities help you create interactive, shared learning spaces that drive retention, peer engagement, and long-term value for your business.",
    icon: Users,
    mockupBg: "bg-gradient-to-br from-amber-100 to-orange-50",
    accentColor: "yellow",
    bottomColor: "#f59e0b", // yellow
    showCommunity: true,
  },
  {
    id: 3,
    title: "Landing pages",
    description:
      "Create aesthetically-pleasing, high-converting landing pages in minutes, thanks to built-in AI optimization, and seamless integrations.",
    icon: Globe,
    mockupBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    accentColor: "orange",
    bottomColor: "#f97316", // orange
    showLandingPage: true,
  },
  {
    id: 4,
    title: "SCORM compliance",
    description:
      "Athena is SCORM compliant, allowing for more interactive learning and gamification. For more, lean into advanced customizations with the Plus Expansion Pack.",
    icon: FileCheck,
    mockupBg: "bg-gradient-to-br from-gray-100 to-gray-50",
    accentColor: "blue",
    bottomColor: "#1e40af", // dark blue
    showSCORM: true,
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

export default function CompanyFeature() {
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
            Popular features for companies
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Build, sell, and scale your learning business with features and tools designed to save you time, engage your audience, and grow your revenue.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="group"
              >
                <div 
                  className="relative h-full bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl border border-gray-200 transition-all duration-300 flex flex-col"
                  onMouseEnter={() => setHoveredIndex(feature.id - 1)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Mockup Area */}
                  <div className={`${feature.mockupBg} h-48 flex items-center justify-center p-0 relative flex-shrink-0 overflow-hidden`}>
                    {/* Course Creation Mockup */}
                    {feature.showCourseCreation && (
                      <div className="w-full h-full flex items-center justify-center scale-110">
                        <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-xs">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">Create your course</h3>
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✨</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">Generating course outline...</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                          </div>
                          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium transition-colors">
                            Stop generating
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Community Mockup */}
                    {feature.showCommunity && (
                      <img 
                        src={Community} 
                        alt="Community Interface" 
                        className="w-full h-full object-cover object-left"
                      />
                    )}

                    {/* Landing Page Mockup */}
                    {feature.showLandingPage && (
                      <img 
                        src={Landing} 
                        alt="Landing Page Interface" 
                        className="w-full h-full object-cover object-left"
                      />
                    )}

                    {/* SCORM Compliance Mockup */}
                    {feature.showSCORM && (
                      <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-xs">
                        <div className="text-center mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">Uploading SCORM Course</h3>
                          <div className="text-lg font-bold text-gray-900">84%</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                        </div>
                        <div className="bg-pink-500 text-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold">360</div>
                          <div className="text-xs">↑ 10%</div>
                          <div className="text-xs">Total Enrollments</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                    {/* Hover Fill Animation */}
                    <div 
                      className="absolute inset-0 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: feature.bottomColor,
                        transform: hoveredIndex === feature.id - 1 ? 'translateY(0)' : 'translateY(100%)',
                        opacity: hoveredIndex === feature.id - 1 ? 0.2 : 0
                      }}
                    />
                    
                    {/* Content with higher z-index */}
                    <div className="relative z-10 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Color Line - Static */}
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div 
                      style={{
                        backgroundColor: feature.bottomColor,
                        height: '100%'
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
