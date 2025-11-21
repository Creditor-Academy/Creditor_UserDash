import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Sellinghero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 sm:py-16 lg:py-20 min-h-screen flex items-center">
      {/* Background decorative elements (match Membershiphero.jsx) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-300/30 to-amber-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-300/30 to-orange-300/20 blur-3xl" />
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
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 mb-5">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Features
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Selling Tools</span>
            </div>

            {/* Main Heading (large, multi-line) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal leading-tight text-gray-900 mb-4">
              Maximize your revenue with powerful selling tools
            </h1>

            {/* Description with emphasized line */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mb-4">
              TCommerce is our suite of proven selling and payments features,
              specifically designed for learning businesses like yours.{' '}
              <span className="font-semibold text-gray-900">
                Customers using TCommerce sell more, seeing up to 31% larger
                average transaction sizes.
              </span>
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mb-6">
              Explore powerful, friction-free selling features to see just how
              far your business can grow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm">
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Visual Content - Chart with revenue card over deep blue panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Deep blue background with radiating lines */}
              <div className="relative w-full max-w-[660px] aspect-[4/3] bg-[#0b3a5a] flex items-center justify-center overflow-hidden shadow-2xl rounded-none">
                {/* Radiating lines */}
                <div className="absolute inset-0">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 600"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {[...Array(64)].map((_, i) => {
                      const angle = (i * 360) / 64;
                      const x1 = 400;
                      const y1 = 300;
                      const length = 1200;
                      const x2 =
                        x1 + Math.cos((angle * Math.PI) / 180) * length;
                      const y2 =
                        y1 + Math.sin((angle * Math.PI) / 180) * length;
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#133b5f"
                          strokeWidth="1.2"
                          opacity="0.35"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* White Chart Card */}
                <div className="relative z-10 bg-white rounded-sm shadow-2xl w-[86%] ml-auto mr-6 p-5">
                  <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                    Subscription Count
                  </div>
                  {/* Simple bar chart */}
                  <svg viewBox="0 0 800 240" className="w-full h-48">
                    {/* axes lines placeholder (light) */}
                    <rect x="0" y="0" width="800" height="260" fill="#ffffff" />
                    {/* Bars (increasing, orange shades) */}
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const height = 20 + idx * 20;
                      const x = 80 + idx * 55;
                      const y = 220 - height;
                      const color =
                        idx === 9
                          ? '#c24f0a'
                          : `hsl(24, 80%, ${80 - idx * 4}%)`;
                      return (
                        <rect
                          key={idx}
                          x={x}
                          y={y}
                          width="40"
                          height={height}
                          rx="4"
                          fill={color}
                        />
                      );
                    })}
                    {/* x-axis labels (approx) */}
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                    ].map((m, i) => (
                      <text
                        key={m}
                        x={95 + i * 165}
                        y={225}
                        fontSize="11"
                        fill="#777"
                      >
                        {m}
                      </text>
                    ))}
                  </svg>
                </div>

                {/* Pink Revenue Card overlay */}
                <div
                  className="absolute left-6 bottom-6 bg-[#e9a9b9] shadow-2xl px-6 py-5 sm:px-8 sm:py-6 z-20"
                  style={{ transform: 'translateY(12%)' }}
                >
                  <div className="text-3xl sm:text-4xl font-serif text-gray-900 mb-1">
                    $246,301
                  </div>
                  <div className="text-base sm:text-lg font-medium text-gray-900">
                    Total Revenue
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Sellinghero;
