import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const Capabilities = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const items = [
    {
      title: 'Courses',
      description: 'Design, launch, and monetize polished courses with assessments, certificates, and drip schedules.',
      bottomColor: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=600&fit=crop&auto=format'
    },
    {
      title: 'Communities',
      description: 'Build engaged learning communities with discussion spaces, member profiles, and gated content.',
      bottomColor: '#10b981',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&auto=format'
    },
    {
      title: 'Digital Downloads',
      description: 'Offer templates, workbooks, and guides as instant downloads to drive leads and revenue.',
      bottomColor: '#8b5cf6',
      image: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=800&h=600&fit=crop&auto=format'
    },
    {
      title: 'Memberships',
      description: 'Bundle content and perks into tiered plans with recurring billing and member analytics.',
      bottomColor: '#f59e0b',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&auto=format'
    },
    {
      title: 'Coaching',
      description: 'Deliver 1:1 and cohort-based coaching with scheduling, resources, and progress tracking.',
      bottomColor: '#06b6d4',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&auto=format'
    },
    {
      title: 'Webinars',
      description: 'Host live, interactive sessions with Q&A, polls, and replays to scale outreach.',
      bottomColor: '#ef4444',
      image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&h=600&fit=crop&auto=format'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            <span className="text-white">LMS Athena for</span>
          </h2>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {items.map((capability, index) => (
            <motion.div
              key={index}
              className="group relative h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className="group relative h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {capability.image && (
                  <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                    <img 
                      src={capability.image} 
                      alt={capability.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                )}
                <div className="relative p-6 flex flex-col flex-grow overflow-hidden min-h-[180px]">
                  <div 
                    className="absolute inset-0 transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: capability.bottomColor,
                      transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(100%)',
                      opacity: hoveredIndex === index ? 0.15 : 0
                    }}
                  />
                  <div className="relative z-10 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {capability.title}
                    </h3>
                    {capability.description && (
                      <p className="text-gray-600 leading-relaxed text-sm flex-grow" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {capability.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <div 
                    style={{
                      backgroundColor: capability.bottomColor,
                      height: '100%'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:hidden max-w-7xl mx-auto">
          <div className="relative overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {items.map((capability, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <motion.div
                    className="group relative h-full"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div 
                      className="group relative h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {capability.image && (
                        <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                          <img 
                            src={capability.image} 
                            alt={capability.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="relative p-6 flex flex-col flex-grow overflow-hidden min-h-[180px]">
                        <div 
                          className="absolute inset-0 transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: capability.bottomColor,
                            transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(100%)',
                            opacity: hoveredIndex === index ? 0.15 : 0
                          }}
                        />
                        <div className="relative z-10 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                            {capability.title}
                          </h3>
                          {capability.description && (
                            <p className="text-gray-600 leading-relaxed text-sm flex-grow" style={{ fontFamily: 'Arial, sans-serif' }}>
                              {capability.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1">
                        <div 
                          style={{
                            backgroundColor: capability.bottomColor,
                            height: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 z-10"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-200 z-10"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {items.map((_, index) => (
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

export default Capabilities;


