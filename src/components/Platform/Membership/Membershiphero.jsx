import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import membershipCardImage from '../../../assets/Membership.png';

const Membership = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-16 sm:py-20 lg:py-24">
      {/* Background decorative elements */}
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
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Features
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Memberships</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Drive loyalty and recurring revenue with Memberships
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Design a membership program that rewards your audience with
              premium experiences and members-only content — all while
              generating reliable monthly income for your business.
            </p>

            {/* CTA Buttons */}
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

          {/* Right Visual Content - Membership Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Orange background with radiating lines to match image */}
              <div className="relative w-full max-w-[720px] aspect-[4/3] bg-[#c24f0a] flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Radiating lines */}
                <div className="absolute inset-0">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 600"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {[...Array(48)].map((_, i) => {
                      const angle = (i * 360) / 48;
                      const x1 = 400;
                      const y1 = 300;
                      const length = 1000;
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
                          stroke="#ffedd5"
                          strokeWidth="1.2"
                          opacity="0.5"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Three-card carousel style layout inside the orange square */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Left preview (half visible) */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[-120px] scale-90 opacity-95">
                    <div className="bg-white shadow-2xl w-[240px]">
                      <div className="w-full h-44 overflow-hidden">
                        <img
                          src={membershipCardImage}
                          alt="Membership Alt Left"
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                      <div className="px-5 py-3">
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                          Starter Membership
                        </h3>
                      </div>
                      <div className="px-5 py-4 bg-[#f3a6b6] flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Basic
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          $20 / month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center card (fully visible) */}
                  <div className="relative z-10">
                    {/* Outer card with thick white frame */}
                    <div className="bg-white shadow-2xl  w-[320px]">
                      <div className="m-3 rounded-xl overflow-hidden bg-white">
                        {/* Image */}
                        <div className="w-full h-60 overflow-hidden">
                          <img
                            src={membershipCardImage}
                            alt="Membership Center"
                            className="w-full h-full object-contain bg-white"
                          />
                        </div>
                        {/* Title */}
                        <div className="px-5 py-3 bg-white">
                          <h3 className="text-xl font-semibold text-gray-900 tracking-tight text-center">
                            Modern Systems Membership
                          </h3>
                        </div>
                      </div>
                      {/* Full-width CTA bar as button (no border radius) */}
                      <button className="w-full px-5 py-4 bg-[#f3a6b6] flex items-center justify-between rounded-none">
                        <span className="text-lg font-semibold text-gray-900">
                          Gold Package
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          $40.00 <span className="font-semibold">/ month</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right preview (half visible) */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-[-120px] scale-90 opacity-95">
                    <div className="bg-white shadow-2xl w-[240px]">
                      <div className="w-full h-44 overflow-hidden">
                        <img
                          src={membershipCardImage}
                          alt="Membership Alt Right"
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                      <div className="px-5 py-3">
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                          Platinum Membership
                        </h3>
                      </div>
                      <div className="px-5 py-4 bg-[#f3a6b6] flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Platinum
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          $80 / month
                        </span>
                      </div>
                    </div>
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

export default Membership;
