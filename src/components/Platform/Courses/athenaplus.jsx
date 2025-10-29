import React from 'react';
import { motion } from 'framer-motion';
import courseImage from '../../../assets/Course.png';

const Athenaplus = () => {
  const features = [
    {
      id: 1,
      title: "Boost success with Learning Recommendations",
      description: "Guide learners with structured paths and relevant recommendations that keep them motivated and on track."
    },
    {
      id: 2,
      title: "Increase engagement with gamification",
      description: "Boost engagement with badges, interactive games, and apps that make learning fun and rewarding."
    },
    {
      id: 3,
      title: "Harness the power of SCORM",
      description: "Easily migrate your LMS content and enhance it with interactive features that drive learner engagement."
    },
    {
      id: 4,
      title: "Tap into Advanced Analytics",
      description: "Use course analytics to make smarter decisions and build customizable dashboards that spotlight your most important course data."
    },
    {
      id: 5,
      title: "Do even more with apps",
      description: "Improve engagement, boost sales, and customize your learning environment with apps from the Athena App Store."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-20 sm:py-24 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className="text-white font-semibold text-base">ATHENA</span>
            <span className="px-4 py-1.5 bg-white text-slate-800 text-sm font-bold rounded-full">
              PLUS
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-normal text-white mb-8 leading-tight px-4">
            Scale your course to the next level with Athena Plus
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            You're serious about creating and selling more courses. Athena Plus is serious about helping you do it right.
          </p>
        </motion.div>

        {/* Course Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          {/* Outer blur box */}
          <div className="relative w-full max-w-5xl mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
            <div className="relative w-full overflow-hidden shadow-xl">
              <img 
                src={courseImage} 
                alt="Athena LMS Course Management Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-0 w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="border-b border-white/30 py-8 hover:bg-white/5 transition-all duration-300 px-0 rounded-lg"
            >
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-normal text-white leading-relaxed" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Athenaplus;

