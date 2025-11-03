import React from 'react';
import { motion } from 'framer-motion';

const RevenueCTASurpass = () => {
  return (
    <section
      className="relative py-12 px-4 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      }}
    >
      {/* Decorative background lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-white/30"
            style={{
              top: `${i * 7}%`,
              transform: `translateY(${i * 5}px)`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              Ready to accelerate your revenue growth?
            </h2>

            <p
              className="text-lg sm:text-xl text-white/95 max-w-xl font-normal leading-relaxed"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Boost profits while saving time—all on a platform built
              exclusively for growth.
            </p>

            <div>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Join Now
              </button>
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-end"
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop&crop=faces"
                alt="Business professionals"
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RevenueCTASurpass;
