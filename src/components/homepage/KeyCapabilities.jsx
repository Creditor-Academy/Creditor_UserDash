import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Voice from '../../assets/Voice.webp';
import AI from '../../assets/aicourse.webp';
import Multi from '../../assets/multimedia.webp';
import Pathway from '../../assets/Pathway.webp';
import Progress from '../../assets/analytics.webp';
import Template from '../../assets/Template.webp';

const KeyCapabilities = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const capabilities = [
    {
      title: 'AI-Powered Course Creation',
      description:
        'Generate complete courses in seconds with intelligent AI that understands your content needs and learner goals.',
      image: AI,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      title: 'Smart Lesson Templates',
      description:
        'Pre-designed, research-backed templates that adapt to any subject, making course design effortless and effective.',
      image: Template,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
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
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
    },
    {
      title: 'Adaptive Learner Pathways',
      description:
        'VAK model integration that personalizes content delivery based on Visual, Auditory, and Kinesthetic learning styles.',
      image: Pathway,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
      bottomColor: '#10b981', // green
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Multimedia & Interactivity Suite',
      description:
        'Rich media integration with interactive elements, quizzes, and gamification to boost engagement and retention.',
      image: Multi,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
      bottomColor: '#8b5cf6', // purple
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
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'AI Voice & Video Presenter',
      description:
        'Lifelike AI narrators and video presenters that bring your content to life with natural, engaging delivery.',
      image: Voice,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
      bottomColor: '#06b6d4', // cyan
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Analytics & Progress Dashboard',
      description:
        'Real-time insights into learner progress, engagement metrics, and performance analytics to optimize outcomes.',
      image: Progress,
      buttonText: 'Learn More',
      buttonStyle: 'blue', // blue button
      bottomColor: '#ef4444', // red
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
  ];

  // Slider functions for mobile
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % capabilities.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      prev => (prev - 1 + capabilities.length) % capabilities.length
    );
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
            <span className="text-gray-900">Revolutionary Features</span>
          </h2>
          <p
            className="text-lg text-gray-600 max-w-3xl mx-auto font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Experience the next generation of learning technology
          </p>
        </motion.div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {capabilities.map((capability, index) => (
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
                {capability.image && (
                  <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                    <img
                      src={capability.image}
                      alt={capability.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Icon overlay */}
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 text-blue-600 flex items-center justify-center">
                          {capability.icon}
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
                      backgroundColor: capability.bottomColor,
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
                      {capability.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-gray-600 leading-relaxed text-sm flex-grow mb-6"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {capability.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Color Line - Static */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <div
                    style={{
                      backgroundColor: capability.bottomColor,
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
              {capabilities.map((capability, index) => (
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
                      {capability.image && (
                        <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={capability.image}
                            alt={capability.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                          {/* Icon overlay */}
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                              <div className="w-5 h-5 text-blue-600 flex items-center justify-center">
                                {capability.icon}
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
                            backgroundColor: capability.bottomColor,
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
                            {capability.title}
                          </h3>

                          {/* Description */}
                          <p
                            className="text-gray-600 leading-relaxed text-sm flex-grow mb-6"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                          >
                            {capability.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Color Line - Static */}
                      <div className="absolute bottom-0 left-0 right-0 h-1">
                        <div
                          style={{
                            backgroundColor: capability.bottomColor,
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
            {capabilities.map((_, index) => (
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

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="max-w-2xl mx-auto">
            <h3
              className="text-2xl font-normal mb-4 text-gray-900"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              Ready to transform your learning experience?
            </h3>
            <p
              className="text-gray-600 mb-8 text-base"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Join thousands of educators worldwide who are already creating
              amazing courses with Athena LMS
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/plans')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Start Your Journey
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => navigate('/trial')}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Try Free Trial
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* <p className="text-gray-500 mt-6 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
              No credit card required • 14-day free trial • Cancel anytime
            </p> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default KeyCapabilities;
