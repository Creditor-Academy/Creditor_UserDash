import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import TeamImage from "../../../assets/teamm.jpg";
import AnalyticsImage from "../../../assets/analytics.webp";

export default function CompanyHero() {
  return (
    <section className="relative overflow-hidden bg-[#f5f1eb] py-20 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            {/* Small Label */}
            <p className="text-xs font-medium text-gray-600 mb-4">
              Solutions | Companies
            </p>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-6 leading-tight">
              Surpass revenue targets and reduce churn
            </h1>

            {/* Description */}
            <p className="text-base lg:text-lg text-gray-700 mb-8 leading-relaxed">
              Built for scale, designed to remove complexity. Athena's learning commerce platform is your path to continued revenue growth and the end of operational bottlenecks.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg">
                Talk to sales
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-gray-100 text-gray-900 font-semibold rounded-full border-2 border-gray-900 hover:border-gray-700 transition-all duration-300">
                Watch a demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Right Image with Revenue Overlay */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Background Team Image */}
              <div className="relative">
                <img 
                  src={TeamImage} 
                  alt="Team collaboration" 
                  className="w-full h-auto object-cover rounded-2xl"
                />
                
                {/* Revenue Chart Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
                    {/* Chart Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Revenue Over Time</h3>
                        <p className="text-xs text-gray-600">Last 6 weeks</p>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Simple Line Chart */}
                    <div className="mb-4">
                      <svg className="w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="400" y2="20" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                        
                        {/* Revenue line */}
                        <path
                          d="M 0,90 L 80,75 L 160,70 L 240,50 L 320,35 L 400,20"
                          fill="none"
                          stroke="#111827"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Area under curve */}
                        <path
                          d="M 0,90 L 80,75 L 160,70 L 240,50 L 320,35 L 400,20 L 400,100 L 0,100 Z"
                          fill="url(#gradient)"
                          opacity="0.1"
                        />
                        
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#111827" />
                            <stop offset="100%" stopColor="#ffffff" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* X-axis labels */}
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Oct. 13</span>
                        <span>Oct. 23</span>
                        <span>Oct. 25</span>
                      </div>
                    </div>

                    {/* Total Revenue Badge */}
                    <div className="bg-orange-600 text-white rounded-lg p-4 inline-block">
                      <div className="text-2xl font-bold mb-1">$246,301</div>
                      <div className="text-xs opacity-90">Total Revenue</div>
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
}

