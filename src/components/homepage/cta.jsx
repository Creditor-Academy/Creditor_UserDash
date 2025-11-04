"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LearningFutureSection() {
  return (
    <section className="relative text-gray-800 py-20 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)'
    }}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(89,86,233,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>

      {/* Main content */}
      <div className="relative container mx-auto px-6 text-center flex flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-3xl"
        >
          Experience the <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Future of Learning Design</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl"
        >
          Unlock creativity, innovation, and engagement with modern digital learning tools.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:from-sky-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300"
        >
          Join Now
        </motion.button>
      </div>
    </section>
  );
}
