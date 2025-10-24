import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import trainer from "../../../assets/trainer.webp";

export default function ExpertHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/40 to-indigo-300/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/40 to-blue-300/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-200/20 via-indigo-200/20 to-purple-200/20 blur-3xl" />
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
              <span className="font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition">
                Solutions
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-medium text-gray-900 hover:text-gray-900 cursor-pointer transition">
                Subject Matter Experts
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Level up your expertise-based business
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Athena's all-in-one platform empowers subject matter experts to turn knowledge into new revenue streams with the tools you need to build, sell, and scale learning experiences.
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

          {/* Right Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10 hidden lg:block"
          >
            <div className="relative h-[420px] w-full">
              {/* Professional Person Image - Main Background on Right */}
              <div className="absolute right-0 top-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl z-10">
                <img 
                  src={trainer} 
                  alt="Subject matter expert" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/5" />
              </div>

              {/* Customer Engagement Card - Overlapping from left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute left-0 top-44 w-[340px] bg-white rounded-xl shadow-xl p-4 border border-blue-200 z-20"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Customer Engagement
                </h3>
                
                {/* Table Headers */}
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 mb-3 border-b border-gray-300 pb-2">
                  <div>NAME</div>
                  <div>COURSE</div>
                  <div>COMP RATE</div>
                  <div>TOTAL REV</div>
                </div>
                
                {/* Table Rows */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-700">
                    <div>14</div>
                    <div>How To Win at Online...</div>
                    <div>85%</div>
                    <div>$8,443.81</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-700">
                    <div>22</div>
                    <div>Framing Masterclass</div>
                    <div>92%</div>
                    <div>$15,231.65</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-700">
                    <div>6</div>
                    <div>Value & Shade, Part O...</div>
                    <div>78%</div>
                    <div>$12,456.00</div>
                  </div>
                </div>
              </motion.div>

              {/* Total Revenue Badge - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute bottom-0 right-0 w-48 bg-pink-500 rounded-lg shadow-xl p-4 text-white z-30"
              >
                <div className="text-3xl font-bold mb-1">$246,301</div>
                <div className="text-sm font-medium opacity-90">Total Revenue</div>
                <TrendingUp className="absolute top-3 right-3 w-5 h-5 opacity-50" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Athena Branding - subtle watermark */}
      <div className="absolute bottom-8 right-8 text-xs text-gray-400 opacity-50 font-medium">
        Powered by Athena
      </div>
    </section>
  );
}
