import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeadFeatures = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const features = [
    {
      title: 'Landing Pages',
      description:
        'Create high-converting landing pages with built-in A/B testing, SEO optimization, and seamless lead capture forms.',
      image:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=200&fit=crop&crop=edges',
      bottomColor: '#3b82f6', // blue
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Email Campaigns',
      description:
        'Build automated email sequences that nurture leads through personalized content and targeted messaging based on behavior.',
      image:
        'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=200&fit=crop&crop=edges',
      bottomColor: '#ec4899', // pink
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Lead Tracking',
      description:
        "Monitor every interaction and engagement point to understand exactly where your leads are in the buyer's journey.",
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=edges',
      bottomColor: '#3b82f6', // blue
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: 'CRM Integration',
      description:
        'Seamlessly sync leads with your CRM and marketing automation tools for a unified lead management workflow.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=edges',
      bottomColor: '#f59e0b', // orange
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
  ];

  // Slider functions for mobile
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = index => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            <span className="text-gray-900">
              Powerful features for lead generation
            </span>
          </h2>
          <p
            className="text-lg text-gray-600 max-w-3xl mx-auto font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Build, capture, and nurture leads with features designed to maximize
            conversions and grow your pipeline.
          </p>
        </motion.div>

        {/* Desktop Grid Layout - 4 columns */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Card */}
              <div
                className="group relative h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image Section */}
                {feature.image && (
                  <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Icon overlay */}
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 text-blue-600 flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                  {/* Hover Fill Animation */}
                  <div
                    className="absolute inset-0 transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: feature.bottomColor,
                      transform:
                        hoveredIndex === index
                          ? 'translateY(0)'
                          : 'translateY(100%)',
                      opacity: hoveredIndex === index ? 0.2 : 0,
                    }}
                  />

                  {/* Content with higher z-index */}
                  <div className="relative z-10 flex flex-col flex-grow">
                    {/* Title */}
                    <h3
                      className="text-lg font-bold mb-4 text-gray-900 leading-tight"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-gray-600 leading-relaxed text-sm flex-grow mb-6"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Color Line - Static */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <div
                    style={{
                      backgroundColor: feature.bottomColor,
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Slider Layout */}
        <div className="lg:hidden max-w-7xl mx-auto">
          {/* Slider Container */}
          <div className="relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <motion.div
                    className="group relative h-full"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Card */}
                    <div
                      className="group relative h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Image Section */}
                      {feature.image && (
                        <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                          {/* Icon overlay */}
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                              <div className="w-5 h-5 text-purple-600 flex items-center justify-center">
                                {feature.icon}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                        {/* Hover Fill Animation */}
                        <div
                          className="absolute inset-0 transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: feature.bottomColor,
                            transform:
                              hoveredIndex === index
                                ? 'translateY(0)'
                                : 'translateY(100%)',
                            opacity: hoveredIndex === index ? 0.2 : 0,
                          }}
                        />

                        {/* Content with higher z-index */}
                        <div className="relative z-10 flex flex-col flex-grow">
                          {/* Title */}
                          <h3
                            className="text-lg font-bold mb-4 text-gray-900 leading-tight"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                          >
                            {feature.title}
                          </h3>

                          {/* Description */}
                          <p
                            className="text-gray-600 leading-relaxed text-sm flex-grow mb-6"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Color Line - Static */}
                      <div className="absolute bottom-0 left-0 right-0 h-1">
                        <div
                          style={{
                            backgroundColor: feature.bottomColor,
                            height: '100%',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadFeatures;
