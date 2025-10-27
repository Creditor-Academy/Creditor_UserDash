import React from 'react';
import { ArrowRight, Users } from 'lucide-react';

const CustomerHero = () => {
  const trainingModules = [
    "Product Onboarding Course",
    "Advanced Features Workshop",
    "Best Practices Training",
    "Customer Success Webinar"
  ];

  return (
    <section className="relative overflow-visible" style={{ 
      paddingTop: '100px', 
      paddingBottom: '140px',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
    }}>
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circles Pattern */}
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full border-4 border-white/40 opacity-60"></div>
        <div className="absolute top-32 right-32 w-40 h-40 rounded-full border-3 border-white/35 opacity-50"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full border-4 border-white/45 opacity-65"></div>
        <div className="absolute bottom-40 left-40 w-32 h-32 rounded-full border-3 border-white/30 opacity-50"></div>
        
        {/* Additional smaller circles for more depth */}
        <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full border-2 border-white/40 opacity-40"></div>
        <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full border-3 border-white/35 opacity-45"></div>
        
        {/* Dots Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-customer" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="rgba(255,255,255,0.5)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots-customer)" />
        </svg>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl opacity-70"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-white/8 blur-2xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 lg:pr-8">
            {/* Breadcrumb */}
            <div className="text-blue-100 text-sm font-medium">
              <span className="text-blue-200">Solutions</span>
              <span className="mx-2">|</span>
              <span className="text-white">Customer training</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-tight">
              Maximize customer success
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-blue-50 max-w-xl">
              Train customers to get the most value from your product — and drive revenue growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="inline-flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 px-6 py-3.5 rounded-full font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white px-6 py-3.5 rounded-full font-semibold text-base border-2 border-white transition-all duration-200">
                Talk to sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Image with Product Card */}
          <div className="relative lg:h-[520px] h-[450px] lg:pr-0">
            {/* Background Images */}
            <div className="absolute inset-0 flex flex-col rounded-lg overflow-hidden">
              {/* Top Image */}
              <div className="flex-1 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop&crop=faces"
                  alt="Customer training session"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Bottom Image */}
              <div className="flex-1 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop&crop=faces"
                  alt="Happy customer learning"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Card Overlay - Positioned at bottom-left, extending outside image */}
            <div className="absolute -bottom-12 lg:-bottom-16 left-0 lg:-left-16 lg:w-[360px] w-[90%] bg-white rounded-xl shadow-2xl p-6 z-10">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Your Training Modules</h3>
              
              {/* Product List */}
              <div className="space-y-3 mb-5">
                {trainingModules.map((module, index) => (
                  <div key={index} className="flex items-center justify-between group py-1">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Drag handle icon */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        </div>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        </div>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-800 group-hover:text-gray-900 font-normal">
                        {module}
                      </span>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors ml-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <button className="w-full flex items-center justify-center gap-2 bg-[#0f4c81] hover:bg-[#0d3f6b] text-white px-4 py-3 rounded-md font-semibold text-sm transition-all duration-200">
                <Users className="w-4 h-4" />
                Add More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerHero;

