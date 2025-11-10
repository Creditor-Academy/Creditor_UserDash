import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const Emailhero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements (match Coachinghero.jsx style) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/30 to-blue-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-200/15 via-indigo-200/15 to-purple-200/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">Features</span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Email Automation</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Scale your business
              <span className="block">with emails that</span>
              <span className="block">always deliver</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">
              Convert prospects into paying customers by capturing and nurturing leads directly in Athena LMS
              with targeted email tools that keep your content top‑of‑mind.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Join Now
                <Star className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Visual: Email mock with orange burst panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Orange burst background panel */}
              <div className="relative w-full max-w-[680px] aspect-[16/11] rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[#bf4a07]" />
                {/* Burst lines using repeating conic gradient overlay */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.15) 0deg 1deg, transparent 1deg 6deg)'
                  }}
                />

                {/* Email card mock */}
                <div className="relative z-10 h-full w-full flex items-center justify-center p-6">
                  <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-gray-800">You are now enrolled!</div>
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">Inbox</div>
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                    <div className="h-3 w-40 bg-gray-200 rounded mb-6" />
                    <div className="text-gray-800 font-semibold mb-2">Career Wayfinder</div>
                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                      <div className="text-gray-900 font-medium mb-2">Welcome Alice!</div>
                      <div className="space-y-2 mb-4">
                        <div className="h-2 bg-gray-300 rounded w-5/6" />
                        <div className="h-2 bg-gray-300 rounded w-4/6" />
                        <div className="h-2 bg-gray-300 rounded w-3/5" />
                      </div>
                      <div className="text-xs text-gray-600">Sincerely,</div>
                      <div className="text-sm text-gray-700 font-medium">Sara Doole</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Emailhero;


