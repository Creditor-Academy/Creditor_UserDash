import React from 'react';
import { motion } from 'framer-motion';

export const HeroSectionOne = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-gradient-to-tl from-pink-400 to-orange-400 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Build Your Dream
            </span>
            <br />
            <span className="text-neutral-900 dark:text-white">
              Website Today
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-10">
            Create stunning, professional websites with our expert team. Fast,
            secure, and optimized for success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Get Started
            </button>
            <button className="px-8 py-4 text-lg font-semibold text-neutral-700 dark:text-neutral-200 border-2 border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
