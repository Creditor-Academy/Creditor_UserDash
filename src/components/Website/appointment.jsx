import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Appointment() {
  return (
    <section
      id="hero"
      className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden py-16"
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 max-w-3xl mx-auto px-6 w-full h-full flex flex-col items-center justify-center"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 leading-tight"
          style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
        >
          Let's Create Your Online Presence!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="italic text-lg text-white mb-3 font-normal"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          "Because Your Business Deserves to Be Seen."
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-lg text-white mb-8 font-normal"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          From the first impression to the final click, we design websites that
          connect with your audience and help your business thrive online
        </motion.p>

        {/* CTA Button */}
        <motion.a
          href="/contact"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg transition-transform duration-300 hover:shadow-xl"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          Book an Appointment <FaArrowRight />
        </motion.a>
      </motion.div>
    </section>
  );
}
