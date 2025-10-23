import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Scorm from "../../../assets/Scorm.png";

export default function CompanyScale() {
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
              The platform for Companies
            </p>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal mb-5 leading-tight">
              A pathway to more revenue and less churn
            </h1>

            {/* Description */}
            <p className="text-sm lg:text-base text-gray-300 mb-6 leading-relaxed">
              Athena was built to help companies like yours to scale revenue and increase your impact.
            </p>

            {/* Bullet Points */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-300">Streamline your tech stack</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-300">Automate payments and taxes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-300">Offer engaging learning experiences</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-300">Build a loyal community of customers</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/10 text-white text-sm font-semibold rounded-full border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300">
                Watch a demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative shadow-2xl overflow-hidden aspect-square w-full max-w-2xl mx-auto">
              <img 
                src={Scorm} 
                alt="Athena Dashboard Analytics" 
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
