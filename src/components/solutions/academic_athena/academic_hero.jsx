import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import trainer from "../../../assets/trainer.webp";

export default function AcademicHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20 lg:py-24">
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
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Solutions
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Academies
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Transform your professional training programs
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Deliver effective training at scale with the tools you need to create, 
              manage, monetize, and measure your programs with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Join Now
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
                  alt="Professional trainer" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/5" />
              </div>

              {/* MRR Chart Card - Overlapping from left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute left-0 top-44 w-[340px] bg-white rounded-xl shadow-xl p-4 border border-gray-100 z-20"
              >
                <h3 className="text-xs font-semibold text-gray-700 mb-3">
                  New vs Churned MRR
                </h3>
                <div className="flex items-end justify-between gap-0.5 h-24">
                  {/* Chart Bars */}
                  {[45, 60, 55, 70, 65, 75, 80, 90, 85, 80, 75, 70, 65].map((height, i) => (
                    <div key={i} className="flex flex-col justify-end gap-0.5 flex-1 h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-sm transition-all duration-300 hover:from-blue-700 hover:to-blue-600"
                        style={{ height: `${height}%` }}
                      />
                      <div
                        className="w-full bg-gray-200 rounded-b-sm"
                        style={{ height: `${100 - height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500">
                  <span>January</span>
                  <span>April</span>
                  <span>July</span>
                  <span>October</span>
                  <span>January '24</span>
                </div>
              </motion.div>

              {/* Students Count Card - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute bottom-0 right-0 w-44 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-5 text-white z-30"
              >
                <div className="text-4xl font-bold mb-1">1,500</div>
                <div className="text-base font-medium opacity-90">Students</div>
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

