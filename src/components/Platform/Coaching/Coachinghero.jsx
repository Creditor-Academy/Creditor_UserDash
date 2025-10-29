import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import clientImage from '../../../assets/client.jpg';

const Coachinghero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/30 to-blue-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-200/15 via-indigo-200/15 to-purple-200/15 blur-3xl" />
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
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">Features</span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Coaching and Webinars</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Engage in real‑time with Coaching and Webinars
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Build real relationships with your audience — and ultimately drive business growth. Connect
              interactively and authentically to increase engagement, expand reach, and turn more leads into
              paying customers.
            </p>

            {/* CTAs */}
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

          {/* Right Visual: Video mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Dark blue panel */}
              <div className="relative w-full max-w-[620px] aspect-[4/3] bg-[#0f4c81] flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Embedded video frame */}
                <div className="relative w-[88%] h-[76%] bg-black/5 overflow-hidden">
                  <img src={clientImage} alt="Live coaching" className="w-full h-full object-cover" />

                  {/* LIVE badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-md px-3 py-1 text-xs font-semibold text-gray-900 flex items-center gap-2 shadow">
                    <span className="inline-block w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    LIVE
                  </div>

                  {/* Floating reactions */}
                  <div className="absolute right-3 top-6 flex flex-col gap-4">
                    <span className="text-3xl">👍</span>
                    <span className="text-3xl">💙</span>
                    <span className="text-3xl">👏</span>
                  </div>

                  {/* Viewers pill */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-pink-300 text-gray-900 px-5 py-3 text-sm font-semibold shadow rounded-md">
                    <span className="mr-2">👤</span>241 current viewers
                  </div>

                  {/* Controls bar */}
                  <div className="absolute bottom-6 left-6 right-6 h-1.5 bg-white/40 rounded">
                    <div className="h-full bg-white rounded" style={{ width: '78%' }} />
                    <div className="absolute -bottom-2 left-0 text-white">﹁</div>
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

export default Coachinghero;

