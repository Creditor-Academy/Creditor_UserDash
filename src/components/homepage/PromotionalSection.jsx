import React from 'react';
import { motion } from 'framer-motion';

const PromotionalSection = () => {
  return (
    <section className="py-10 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Main Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-800 mb-6 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
          Our customers have earned $3.7<br />
          <span className="text-5xl md:text-6xl lg:text-7xl">billion</span> with Athena LMS
        </h2>
        
        {/* Sub-headline */}
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
          Talk to one of our team members to discover how Athena LMS's award-winning platform can help you drive<br />
          revenue and retention.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1" style={{ fontFamily: 'Arial, sans-serif' }}>
            Talk to sales →
          </button>
          
          <button className="bg-transparent border-2 border-yellow-400 hover:bg-yellow-400 hover:text-gray-900 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            Start free trial
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default PromotionalSection;
