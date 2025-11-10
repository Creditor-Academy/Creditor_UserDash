import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CourseFinger = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-20 sm:py-24 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/30 to-blue-300/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-6 leading-tight">
              Courses at their fingertips — at any time
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
              Connect anytime, anywhere with Branded Mobile by LMS Athena. Our team of experts will take care of creating and managing a custom mobile app for your online courses and communities — complete with your own unique branding.
            </p>

            {/* CTA Button */}
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              Talk to sales
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Right Side - Mobile App Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Pink background container */}
            <div className="relative bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 p-8 shadow-2xl max-w-sm mx-auto">
              {/* Decorative rays */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                        transformOrigin: 'center',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="relative z-10 max-w-[200px] mx-auto">
                {/* Phone Frame/Bezel - Black shade */}
                <div className="bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
                  {/* Phone Screen */}
                  <div className="bg-white rounded-[2rem] overflow-hidden h-full flex flex-col">
                    {/* Status Bar with Notch */}
                    <div className="bg-white px-2 py-1.5 flex items-center justify-between relative flex-shrink-0">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-800 rounded-b-xl flex items-center justify-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <div className="w-6 h-0.5 rounded-full bg-gray-600"></div>
                      </div>
                      {/* Status Icons */}
                      <div className="text-[7px] font-semibold text-gray-900 mt-3">9:41</div>
                      <div className="flex items-center gap-0.5 mt-3">
                        <div className="text-[7px]">📶</div>
                        <div className="text-[7px]">🔋</div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-2 bg-gray-50 flex-1 overflow-y-auto">
                      {/* Course Header with Image */}
                      <div className="bg-white rounded-md overflow-hidden shadow-sm mb-1.5">
                        <div className="h-12 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 text-[9px] mb-0.5">Strategic Planning</h3>
                          <p className="text-[8px] text-gray-600 mb-1">50% completed • 16 lessons</p>
                          <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                          <button className="w-full py-1 bg-green-500 text-white text-[8px] font-semibold rounded-sm mb-1 hover:bg-green-600 transition-colors">
                            ▶ RESUME
                          </button>
                          <button className="w-full py-1 bg-purple-200 border border-purple-300 text-purple-700 text-[8px] font-semibold rounded-sm hover:bg-purple-300 transition-colors">
                            DISCUSSION SPACE →
                          </button>
                        </div>
                      </div>

                      {/* Chapter Section */}
                      <div className="bg-white rounded-md p-1.5 shadow-sm">
                        <h4 className="text-[8px] font-semibold text-gray-700 mb-1">Chapter 1: Introduction to Planning</h4>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 py-0.5">
                            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              <span className="text-[7px]">📄</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-[8px] font-medium text-gray-800 leading-tight">Course overview</p>
                              <p className="text-[7px] text-gray-500">Text</p>
                            </div>
                            <div className="text-gray-400 text-[8px]">›</div>
                          </div>
                          <div className="flex items-center gap-1.5 py-0.5">
                            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              <span className="text-[7px]">▶️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-[8px] font-medium text-gray-800 leading-tight">Course overview</p>
                              <p className="text-[7px] text-gray-500">Video</p>
                            </div>
                            <div className="text-gray-400 text-[8px]">›</div>
                          </div>
                          <div className="flex items-center gap-1.5 py-0.5">
                            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              <span className="text-[7px]">📊</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-[8px] font-medium text-gray-800 leading-tight">Examples of great gesture</p>
                              <p className="text-[7px] text-gray-500">drawing</p>
                            </div>
                            <div className="text-gray-400 text-[8px]">›</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Phone Bottom Bar */}
                    <div className="h-4 bg-white flex items-center justify-center flex-shrink-0">
                      <div className="w-20 h-1 bg-gray-800 rounded-full"></div>
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

export default CourseFinger;
