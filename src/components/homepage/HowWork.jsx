import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LMSThumbnail from '../../assets/LMS.png';

const HowAthenaWorks = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  const steps = [
    {
      number: "01",
      title: "Create",
      description: "Generate your course using AI in seconds.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      ),
      gradient: "from-sky-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-50"
    },
    {
      number: "02",
      title: "Design",
      description: "Customize layouts, visuals, and narration effortlessly.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v.01"/>
        </svg>
      ),
      gradient: "from-blue-400 to-sky-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-sky-50"
    },
    {
      number: "03",
      title: "Deliver",
      description: "Host, track, and personalize every learner's journey.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      ),
      gradient: "from-sky-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-100"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-left mb-12 max-w-3xl relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-6 bg-gradient-to-r from-transparent to-blue-400" />
            <span className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
              How It Works
            </span>
          </div>
          
          {/* Clean White Headline */}
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-3 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Transform Your Vision Into Engaging Learning Experiences
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            className="text-base text-gray-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Create, customize, and deliver professional courses in three simple steps
          </motion.p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left Column - Steps */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-8 left-6 w-0.5 h-72 bg-gradient-to-b from-blue-400/30 via-sky-400/30 to-blue-400/30 rounded-full z-0" />
            
            {/* Steps Container */}
            <div className="relative z-10 space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Step Card */}
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-5 overflow-hidden transition-all duration-300 group-hover:bg-white/8 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-500/20 border border-white/10 group-hover:border-blue-400/40">
                    
                    {/* Number Badge */}
                    <div className="absolute -top-2 -left-2">
                      <div className={`w-10 h-10 bg-gradient-to-br ${step.gradient} rounded-lg flex items-center justify-center text-white font-bold text-base shadow-lg transition-transform duration-300 ${hoveredStep === index ? 'scale-110' : ''}`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-4 mt-1">
                      {/* Icon Container */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                        <div className="w-5 h-5">
                          {step.icon}
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${step.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Demo Video */}
          <motion.div 
            className="relative flex items-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-xl shadow-blue-500/20 w-full border border-white/10 group">
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                {/* Video Thumbnail Overlay */}
                {!isVideoPlaying && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full cursor-pointer group z-10"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    {/* Thumbnail Image */}
                    <img 
                      src={LMSThumbnail}
                      alt="Athena LMS Demo"
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-black/40 transition-all duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-blue-500/40">
                      <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    
                    {/* Watch Demo Badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                      <p className="text-white font-semibold text-xs flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Watch Demo
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Iframe Video */}
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={isVideoPlaying ? "https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview" : ""}
                  title="Athena Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        {/* <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-300/50 hover:shadow-blue-400/50 transform hover:-translate-y-1 transition-all duration-300">
            Start Creating Today
          </button>
          <p className="text-sky-500 text-sm mt-4">
            No credit card required • Free 14-day trial
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default HowAthenaWorks;