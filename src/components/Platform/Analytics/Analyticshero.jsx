import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Analyticshero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 sm:py-12 lg:py-16 min-h-screen flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/30 to-blue-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-200/15 via-indigo-200/15 to-purple-200/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">Features</span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Analytics</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal leading-tight text-gray-900 mb-4">
              Know more, convert more,
              <span className="block">and grow more</span>
              <span className="block">with analytics</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mb-6">
              Get actionable data to help you understand your audience, optimize your courses, and drive lasting growth. Equipped with powerful analytics, you have what you need to transform your growing online learning business.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-gray-900 text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300">
                Talk to sales
              </button>
            </div>
          </motion.div>

          {/* Right Visual: Analytics dashboards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Dark blue panel with starburst */}
              <div className="relative w-full max-w-[580px] aspect-[4/3] bg-[#0f4c81] flex items-center justify-center overflow-hidden shadow-2xl rounded-2xl">
                {/* Starburst effect */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.12) 0deg 1deg, transparent 1deg 8deg)'
                  }}
                />

                {/* Customer Engagement Card - Top, partially visible */}
                <motion.div
                  initial={{ opacity: 0, y: -20, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: -3 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute top-6 left-6 w-[320px] bg-white rounded-lg shadow-2xl p-4 z-20"
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3">Customer Engagement</h3>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="grid grid-cols-4 gap-1.5 font-semibold text-gray-700 pb-1.5 border-b text-[9px]">
                      <div>NAME</div>
                      <div>COURSE</div>
                      <div>COMP RATE</div>
                      <div>TOTAL REV</div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 items-center">
                      <div className="text-gray-600">14</div>
                      <div className="text-gray-600 text-[9px]">How To Win at Online...</div>
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-gray-600 h-1 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                      <div className="text-gray-900 font-semibold text-[9px]">$8,443.81</div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 items-center">
                      <div className="text-gray-600">31.65</div>
                      <div className="text-gray-600 text-[9px]">Course Title</div>
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-gray-600 h-1 rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                      <div className="text-gray-900 font-semibold text-[9px]">$109</div>
                    </div>
                  </div>
                </motion.div>

                {/* New vs Churned MRR Card - Bottom, fully visible */}
                <motion.div
                  initial={{ opacity: 0, y: 20, rotate: 2 }}
                  animate={{ opacity: 1, y: 0, rotate: 2 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute bottom-6 right-6 w-[360px] bg-white rounded-lg shadow-2xl p-4 z-10"
                >
                  <h3 className="text-xs font-bold text-gray-900 mb-3">New vs Churned MRR</h3>
                  {/* Chart container with Y-axis */}
                  <div className="relative h-[160px] mb-2">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-500 pr-2 w-8">
                      <span>$100</span>
                      <span>$50</span>
                      <span className="text-gray-700 font-medium">0</span>
                      <span>-$50</span>
                      <span>-$100</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-8 h-full relative">
                      {/* Zero line */}
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300" />
                      {/* Chart bars */}
                      <div className="flex items-center justify-between gap-1 h-full">
                        {[
                          { new: 45, churned: 25 },
                          { new: 60, churned: 30 },
                          { new: 55, churned: 35 },
                          { new: 70, churned: 20 },
                          { new: 65, churned: 40 },
                          { new: 75, churned: 15 },
                        ].map((bar, i) => (
                          <div key={i} className="flex-1 h-full relative flex flex-col justify-center">
                            {/* Stacked bar from zero line */}
                            <div className="absolute left-0 right-0 top-1/2 flex flex-col" style={{ transform: 'translateY(-50%)' }}>
                              {/* Positive (New MRR) - above zero */}
                              <div className="w-full bg-orange-500 rounded-t-sm mb-0.5" style={{ height: `${bar.new}px` }} />
                              {/* Negative (Churned MRR) - below zero */}
                              <div className="w-full bg-gray-200 rounded-b-sm" style={{ height: `${bar.churned}px` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex items-center justify-between mt-2 text-[9px] text-gray-500 ml-8">
                    <span>January</span>
                    <span>April</span>
                    <span>July</span>
                    <span>October</span>
                    <span>January '23</span>
                    <span>April</span>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-3 text-[9px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                      <span className="text-gray-600">New MRR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-sm" />
                      <span className="text-gray-600">Churned MRR</span>
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

export default Analyticshero;

