import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  X,
  Play,
  ArrowUpRight,
  FileText,
  Video,
} from 'lucide-react';
import teamImage from '../../../assets/teamm.jpg';

const Brandhero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-300/30 to-amber-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-300/30 to-orange-300/20 blur-3xl" />
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
                Branded Mobile
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Your app. Your brand.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Make it easy for customers to access your content anywhere,
              anytime, with a branded mobile app on Athena. Better outcomes,
              more engaged learners — all powered by a brand they know and
              trust: yours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300">
                Talk to sales
              </button>
            </div>
          </motion.div>

          {/* Right Visual Content - Mobile App Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Dark orange background with radiating lines */}
              <div className="relative w-full max-w-[600px] aspect-[4/3] bg-[#c24f0a] flex items-center justify-center overflow-hidden shadow-2xl rounded-lg">
                {/* Radiating lines from top-left */}
                <div className="absolute inset-0">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 600"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {[...Array(48)].map((_, i) => {
                      const angle = (i * 360) / 48 - 45; // Start from top-left
                      const x1 = 0;
                      const y1 = 0;
                      const length = 1200;
                      const x2 =
                        x1 + Math.cos((angle * Math.PI) / 180) * length;
                      const y2 =
                        y1 + Math.sin((angle * Math.PI) / 180) * length;
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#ffedd5"
                          strokeWidth="1.2"
                          opacity="0.5"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Course Card - White rounded rectangle */}
                <div className="relative z-10 bg-white rounded-lg shadow-2xl w-[220px] max-w-[60%] overflow-hidden">
                  {/* Top Bar with X */}
                  <div className="flex items-center justify-start p-2 border-b border-gray-200">
                    <X className="w-3.5 h-3.5 text-gray-600" />
                  </div>

                  {/* Header Image */}
                  <div className="w-full h-32 bg-gray-200 overflow-hidden">
                    <img
                      src={teamImage}
                      alt="Team collaboration"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Course Details */}
                  <div className="px-3 py-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      Strategic Planning
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-2">
                      50% completed • 16 lessons
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                      <div
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: '50%' }}
                      ></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-1.5 mb-2">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs">
                        <Play className="w-3 h-3" />
                        RESUME
                      </button>
                      <button className="w-full bg-white border-2 border-gray-300 text-gray-900 font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors text-xs">
                        DISCUSSION SPACE
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Course Content List */}
                    <div className="border-t border-gray-200 pt-2">
                      <h4 className="text-[10px] font-semibold text-gray-900 mb-2">
                        Chapter 1: Introduction to Planning
                      </h4>
                      <div className="space-y-1.5">
                        {/* List Item 1 */}
                        <div className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg px-1.5 -mx-1.5 bg-white border border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-shrink-0">
                              <div className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center">
                                <span className="text-white text-[7px]">✓</span>
                              </div>
                            </div>
                            <FileText className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-medium text-gray-900">
                              Course overview
                            </div>
                            <div className="text-[9px] text-gray-500">Text</div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </div>

                        {/* List Item 2 */}
                        <div className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg px-1.5 -mx-1.5 bg-white border border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-shrink-0">
                              <div className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center">
                                <span className="text-white text-[7px]">✓</span>
                              </div>
                            </div>
                            <Video className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-medium text-gray-900">
                              Course overview
                            </div>
                            <div className="text-[9px] text-gray-500">
                              Video
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </div>

                        {/* List Item 3 */}
                        <div className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg px-1.5 -mx-1.5 bg-white border border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-shrink-0">
                              <div className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center">
                                <span className="text-white text-[7px]">✓</span>
                              </div>
                            </div>
                            <FileText className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-medium text-gray-900">
                              Examples of great gesture
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
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

export default Brandhero;
