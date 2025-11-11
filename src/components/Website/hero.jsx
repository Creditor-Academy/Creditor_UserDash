import React from 'react';
import { motion } from 'framer-motion';
import coverImage from '../../assets/Cover-2.webp';
import websiteDevelopment from '../../assets/Webhero.webp';

export function HeroSectionOne() {
  return (
    <div
      className="relative w-full bg-cover bg-center py-20 md:py-40"
      style={{
        backgroundImage: `url(${coverImage})`,
      }}
    >
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Left and Right vertical lines */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-white/20">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-white/20">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>

      {/* Bottom horizontal line */}
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-white/20">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      {/* Content container */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-4">
        <h1
          className="text-center text-white max-w-5xl"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          {'Launch Your Private Dream Website Today'
            .split(' ')
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="mt-4 max-w-3xl text-center text-white/95"
          style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          Elevate your brand with a stunning, high-performance website designed
          for success.
        </motion.p>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-60 transform rounded-lg bg-black/80 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800/90">
            Purchase Now
          </button>
          <button className="w-60 transform rounded-lg border border-gray-300 bg-white/90 px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100/90">
            Contact Support
          </button>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="mt-20 w-full rounded-3xl border border-white/30 bg-white/10 backdrop-blur-md p-4 shadow-md"
        >
          <div className="w-full overflow-hidden rounded-xl border border-white/20">
            <img
              src={websiteDevelopment}
              alt="Landing page preview"
              className="aspect-[16/9] h-auto w-full object-cover"
              height={1000}
              width={1000}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
