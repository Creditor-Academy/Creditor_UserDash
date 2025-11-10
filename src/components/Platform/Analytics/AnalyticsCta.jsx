import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import team from "../../../assets/teamm.jpg";

export default function AnalyticsCta() {
  return (
    <section className="relative overflow-hidden bg-[#1e3a5f] py-20 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white z-10"
          >
            {/* Small Label */}
            <p className="text-xs font-medium text-blue-300 mb-3">
              The platform for experts
            </p>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal mb-5 leading-tight">
            Elevate your
             <span className="block">business with data-</span>
             <span className="block">driven insights on</span>
             <span className="block">LMS Athena Analytics</span>
              
            </h1>


           

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/10 text-white text-sm font-semibold rounded-full border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative shadow-2xl overflow-hidden aspect-square w-full max-w-2xl mx-auto">
              <img 
                src={team} 
                alt="Athena LMS Course Dashboard" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent pointer-events-none"></div>
    </section>
  );
}

