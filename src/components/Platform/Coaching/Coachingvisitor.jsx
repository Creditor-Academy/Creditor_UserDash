import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sparkles } from 'lucide-react';

const features = [
  {
    id: 1,
    title: "Get paid for your time",
    description:
      "Monetize your time by pricing your virtual events. Create a new way to earn by selling personal or group coaching, webinars, consulting calls, tutoring, workshops, and more.",
    mockupBg: "bg-[#efefe9]",
    bottomColor: "#2563eb", // blue
    showPricing: true,
  },
  {
    id: 2,
    title: "Foster a personal connection",
    description:
      "Build trust while keeping customers invested with interactive experiences like personalized coaching, group workshops, and 1:1’s.",
    mockupBg: "bg-[#efefe9]",
    bottomColor: "#f59e0b", // amber
    showPeople: true,
  },
  {
    id: 3,
    title: "Earn leads with webinars",
    description:
      "Attract potential clients with live events. Gather contact information through registrations and build out a list of prospects you’ll reach out to — and nurture — at a later time. ",
    mockupBg: "bg-[#efefe9]",
    bottomColor: "#b45309", // brown/orange
    showEventCard: true,
  },
  {
    id: 4,
    title: "Boost registration with high-converting landing pages",
    description:
      "You bring the ideas, we generate the landing page with the power of AI. Our landing pages are optimized to convert, helping you expand your audience and turn more leads into paying customers.",
    mockupBg: "bg-[#efefe9]",
    bottomColor: "#0f4c81", // deep blue
    showSpinner: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Digitalunlock = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight">
          Turn one-time visitors into
          <span className="block">lifelong customers</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Host live coaching and webinars that build trust, grow your audience and drive revenue — all in one digital learning product. Set up and promote events that turn your expertise into real relationships and business growth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group"
            >
              <div 
                className="relative h-full bg-white overflow-hidden shadow-2xl hover:shadow-3xl border border-gray-200 transition-all duration-300 flex flex-col"
                onMouseEnter={() => setHoveredIndex(feature.id - 1)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Mockup Area */}
                <div className={`${feature.mockupBg} h-48 flex items-center justify-center p-4 relative flex-shrink-0 overflow-hidden`}>
                  {/* Pricing options widget */}
                  {feature.showPricing && (
                    <div className="bg-white shadow-md w-[200px] p-3">
                      <div className="text-[11px] font-semibold text-gray-900 mb-2">Choose a pricing option for your live event</div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] text-gray-800"><span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-400" /> Free lead magnet</label>
                        <label className="flex items-center gap-2 text-[11px] text-gray-800"><span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-400" /> One time payment</label>
                        <label className="flex items-center gap-2 text-[11px] text-gray-800"><span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-400" /> Monthly payment</label>
                      </div>
                    </div>
                  )}

                  {/* People photos collage */}
                  {feature.showPeople && (
                    <div className="bg-white shadow-md w-[240px] p-2">
                      <div className="relative h-28 bg-gray-200">
                        <div className="absolute left-3 top-3 w-12 h-12 rounded-full bg-gray-300"></div>
                        <div className="absolute left-20 top-2 w-40 h-24 bg-gray-400"></div>
                        <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                  )}

                  {/* Event registration card with Join now */}
                  {feature.showEventCard && (
                    <div className="bg-white shadow-md w-[250px] p-3">
                      <div className="text-[11px] font-semibold text-gray-900 mb-2">Live Event: Monthly Meet & Greet</div>
                      <div className="bg-gray-200 h-1.5 mb-3 w-full"><div className="bg-gray-500 h-1.5" style={{ width: '60%' }} /></div>
                      <button className="ml-auto block bg-[#0f4c81] hover:bg-[#0d3f6b] text-white text-[11px] px-3 py-1 rounded-sm">Join now →</button>
                    </div>
                  )}

                  {/* Generating Page spinner */}
                  {feature.showSpinner && (
                    <div className="bg-white shadow-md w-[200px] h-[120px] flex items-center justify-center">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3"></circle>
                          <path d="M18 18 m 0 -15.915 a 15.915 15.915 0 1 1 0 31.83" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 80" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-800">Generating Page</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                  {/* Hover Fill Animation */}
                  {feature.bottomColor && (
                    <div 
                      className="absolute inset-0 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: feature.bottomColor,
                        transform: hoveredIndex === feature.id - 1 ? 'translateY(0)' : 'translateY(100%)',
                        opacity: hoveredIndex === feature.id - 1 ? 0.2 : 0
                      }}
                    />
                  )}
                  
                  {/* Content with higher z-index */}
                  <div className="relative z-10 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Color Line - Static */}
                {feature.bottomColor && (
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div 
                      style={{
                        backgroundColor: feature.bottomColor,
                        height: '100%'
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Digitalunlock;

