import React from 'react';
import { motion } from "framer-motion";
import { ArrowRight, Lock, Download } from "lucide-react";
import clientImage from '../../../assets/client.jpg';

const Digitalhero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements */}
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
            {/* Breadcrumb/Navigation */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Features
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">
                Digital Downloads
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Get new leads. Drive more revenue. Scale even faster.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              With Digital Downloads on LMS Athena, you can earn new leads, expand your reach, and create new revenue streams — helping you scale with less effort.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Visual Content - Digital Download Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Blue background with radiating lines */}
              <div className="relative w-full max-w-[700px] aspect-[4/3] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Radiating lines effect - emanating from center */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <radialGradient id="rays">
                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {[...Array(40)].map((_, i) => {
                      const angle = (i * 360) / 40;
                      const x1 = 400;
                      const y1 = 300;
                      const length = 1000;
                      const x2 = x1 + Math.cos((angle * Math.PI) / 180) * length;
                      const y2 = y1 + Math.sin((angle * Math.PI) / 180) * length;
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="white"
                          strokeWidth="1.5"
                          opacity="0.15"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Download Card - centered */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative bg-white shadow-2xl w-[360px] mx-auto z-10 overflow-hidden hover:shadow-3xl transition-all duration-500 group"
                >
                  {/* Card Image */}
                  <div className="w-full h-44 overflow-hidden relative">
                    <img 
                      src={clientImage} 
                      alt="Connected Learning Team" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight transition-colors duration-300 group-hover:text-blue-600" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                      Connected Learning: Smarter Training for Smarter Teams
                    </h3>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Lock className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors duration-300 flex-shrink-0" />
                        <span className="font-medium">Sign up to access our mini guide</span>
                      </div>

                      {/* Download Button - aligned with paragraph */}
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0">
                        Download Now
                        <Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Digitalhero;

