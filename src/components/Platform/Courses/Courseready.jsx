import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Box, Rocket } from 'lucide-react';

const Courseready = () => {
  const features = [
    {
      id: 1,
      title: 'AI landing pages',
      description:
        'Create a professional-looking and sounding sales page in just a few clicks with our AI landing page generator.',
      icon: Sparkles,
    },
    {
      id: 2,
      title: 'AI course outline generator',
      description:
        'Speed up your workflow with our AI-powered tool that turns your ideas into a structured course outline.',
      icon: Wand2,
    },
    {
      id: 3,
      title: 'Easy-to-use course builder',
      description:
        'Create, design, and rearrange lessons and chapters easily to build and edit your courses.',
      icon: Box,
    },
    {
      id: 4,
      title: 'Bulk content importer',
      description:
        'Save time and effort — and launch your course sooner — by importing your existing content.',
      icon: Rocket,
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-20 sm:py-24 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight">
            Ready to experience an elevated
            <br />
            course creation process?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            With AI-powered tools and an easy-to-use interface, Athena LMS helps
            you create and launch your course faster — with no technical skills
            or design experience required.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group"
            >
              <div className="relative pb-8 border-b border-white/20">
                <div className="flex items-start justify-between gap-6 mb-4">
                  {/* Title */}
                  <h3
                    className="text-2xl font-normal text-white leading-tight"
                    style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
                  >
                    {feature.title}
                  </h3>

                  {/* Icon */}
                  <div className="flex-shrink-0 w-14 h-14 bg-gray-700/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/50 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-base text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courseready;
