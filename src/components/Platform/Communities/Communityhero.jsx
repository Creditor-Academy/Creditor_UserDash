import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Megaphone, Heart, MessageSquare } from 'lucide-react';

const Communityhero = () => {
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
            {/* Breadcrumb/Navigation */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8">
              <span className="font-medium hover:text-gray-900 cursor-pointer transition">
                Features
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Communities</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              Deepen customer connections with a high-impact community
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Scale your business by building an online learning space that
              improves customer success rates and retention. Create an exclusive
              space — hosted directly on the same platform as your learning
              business— to share content, foster connection, and encourage
              collaboration.
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

          {/* Right Visual Content - Community Post Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10"
          >
            {/* Pink background container with rays */}
            <div className="relative bg-gradient-to-br from-blue-200 via-indigo-200 to-blue-300 p-6 shadow-2xl max-w-md mx-auto">
              {/* Decorative rays */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-full bg-white"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                        transformOrigin: 'center',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Community Cards - Overlapping */}
              <div className="relative z-10 max-w-xl mx-auto min-h-[280px]">
                {/* Announcements Card (Back) - Extended */}
                <div className="absolute top-1 right-16 w-[280px] bg-gray-700 shadow-2xl overflow-hidden">
                  <div className="bg-gray-800 text-white px-3 py-2.5 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    <span className="font-semibold text-sm">Announcements</span>
                  </div>
                  {/* Empty space to extend card */}
                  <div className="h-36 bg-gray-700"></div>
                </div>

                {/* Lily Lee Post Card (Front/Overlapping) */}
                <div className="absolute top-12 left-0 bg-white shadow-2xl p-3 w-[310px] z-10">
                  {/* User Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        LL
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 text-sm">
                            Lily Lee
                          </span>
                          <span className="px-1.5 py-0.5 bg-gray-600 text-white text-[10px] font-semibold rounded">
                            ★ Moderator
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">@lee_lily</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">22 mins ago</span>
                  </div>

                  {/* Post Message */}
                  <div className="bg-gray-50 p-3 shadow-sm mb-3">
                    <p className="text-gray-900 leading-relaxed text-sm">
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        ⏰ 1 hour to go!
                      </span>{' '}
                      Join us live for a deep dive into Strategic Planning—you
                      won't want to miss it.
                    </p>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span className="font-semibold text-sm">12</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-semibold text-sm">7</span>
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

export default Communityhero;
