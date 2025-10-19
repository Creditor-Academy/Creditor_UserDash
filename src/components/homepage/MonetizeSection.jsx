import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowUpRight } from 'lucide-react';
import DashLogo from '../../assets/dashlogo.webp';

const MonetizeSection = () => {
  const features = [
    "No developer experience needed",
    "Drag-and-drop course builder",
    "AI-powered course outline generator",
    "Built-in selling and payment solutions",
    "Advanced analytics"
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Section - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Headline */}
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Monetize your<br />
                <span className="text-white">knowledge</span>
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-white leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                Transform your expertise into courses, communities, and other high-quality learning experiences.
              </p>
              <p className="text-lg text-white leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                Our platform is designed to drive revenue growth for businesses like yours.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-white font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="/contact" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                Start Creating
                <ArrowUpRight size={16} strokeWidth={2} />
              </a>
              <a href="/trial" className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 border border-white rounded-lg transition-all duration-300 flex items-center justify-center" style={{ fontFamily: 'Arial, sans-serif' }}>
                Book a Demo
              </a>
            </motion.div>
          </motion.div>

          {/* Right Section - Image and Testimonial */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Logo */}
            <div className="relative">
              <img
                src={DashLogo}
                alt="Athena LMS Dashboard"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl"
              />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MonetizeSection;
