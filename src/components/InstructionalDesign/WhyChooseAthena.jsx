import React, { useState } from 'react';
import { 
  Brain, 
  Target, 
  Wrench, 
  Users, 
  Zap,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const WhyChooseAthena = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      title: "Deep Domain Expertise",
      icon: Brain,
      color: {
        bg: 'bg-[#3b82f6]', // Blue - matching AI-Powered Course Creation
        text: 'text-[#3b82f6]',
        hover: 'hover:bg-blue-50',
        lightBg: 'bg-blue-50',
        iconActive: 'text-[#3b82f6]',
        iconInactive: 'text-blue-400'
      },
      content: {
        title: "Extensive experience across non-profit & corporate learning ecosystems",
        description: "Our team brings decades of combined experience in diverse learning environments, from Fortune 500 corporations to mission-driven non-profits. We understand the unique challenges and opportunities in each sector.",
        highlights: [
          "15+ years average team experience",
          "Expertise in 20+ industries",
          "Proven track record in both B2B and B2C learning",
          "Deep understanding of regulatory compliance requirements"
        ]
      }
    },
    {
      id: 1,
      title: "End-to-End Delivery",
      icon: Target,
      color: {
        bg: 'bg-[#f59e0b]', // Orange - matching Smart Lesson Templates
        text: 'text-[#f59e0b]',
        hover: 'hover:bg-orange-50',
        lightBg: 'bg-orange-50',
        iconActive: 'text-[#f59e0b]',
        iconInactive: 'text-orange-400'
      },
      content: {
        title: "From strategy to content design, deployment & measurement",
        description: "We don't just design courses—we architect complete learning ecosystems. From initial strategy and needs analysis to final deployment and ROI measurement, we're your single point of accountability.",
        highlights: [
          "Comprehensive learning strategy development",
          "Full-stack content creation and curation",
          "Seamless LMS integration and deployment",
          "Advanced analytics and performance tracking"
        ]
      }
    },
    {
      id: 2,
      title: "Cutting-edge Tools & Techniques",
      icon: Wrench,
      color: {
        bg: 'bg-[#10b981]', // Green - matching Adaptive Learner Pathways
        text: 'text-[#10b981]',
        hover: 'hover:bg-emerald-50',
        lightBg: 'bg-emerald-50',
        iconActive: 'text-[#10b981]',
        iconInactive: 'text-emerald-400'
      },
      content: {
        title: "AI-enabled workflows, VR/AR readiness, and data-driven learning paths",
        description: "We leverage the latest technologies to create immersive, personalized learning experiences. Our AI-powered approach ensures content adapts to individual learner needs while maintaining engagement.",
        highlights: [
          "AI-powered content personalization",
          "VR/AR learning environment design",
          "Adaptive learning algorithms",
          "Real-time performance analytics"
        ]
      }
    },
    {
      id: 3,
      title: "Learner-Centric Design",
      icon: Users,
      color: {
        bg: 'bg-[#8b5cf6]', // Purple - matching Multimedia & Interactivity Suite
        text: 'text-[#8b5cf6]',
        hover: 'hover:bg-purple-50',
        lightBg: 'bg-purple-50',
        iconActive: 'text-[#8b5cf6]',
        iconInactive: 'text-purple-400'
      },
      content: {
        title: "Grounded in neuroscience, behavioural science, and human-centered UX",
        description: "Every design decision is backed by scientific research and user testing. We create learning experiences that work with how the brain naturally processes and retains information.",
        highlights: [
          "Evidence-based learning methodologies",
          "Cognitive load optimization",
          "Accessibility-first design principles",
          "Continuous user feedback integration"
        ]
      }
    },
    {
      id: 4,
      title: "Transparent & Agile Delivery",
      icon: Zap,
      color: {
        bg: 'bg-[#06b6d4]', // Cyan - matching AI Voice & Video Presenter
        text: 'text-[#06b6d4]',
        hover: 'hover:bg-cyan-50',
        lightBg: 'bg-cyan-50',
        iconActive: 'text-[#06b6d4]',
        iconInactive: 'text-cyan-400'
      },
      content: {
        title: "Open pricing models, rapid iterations, and measurable outcomes",
        description: "No hidden costs, no surprise fees. We work in transparent sprints with regular check-ins, ensuring you always know exactly what you're getting and when.",
        highlights: [
          "Fixed-price project models available",
          "Weekly progress reports and demos",
          "Clear milestone-based deliverables",
          "Performance guarantees and SLAs"
        ]
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-normal text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            Why Choose Athena Instructional Designers?
          </h2>
          <p className="text-lg font-normal text-gray-600 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
            Discover what sets our instructional design approach apart in creating transformative learning experiences
          </p>
        </div>

        {/* Tab Interface */}
        <div className="relative">
          {/* Tab Strip */}
          <div className="relative z-0 flex gap-2 px-4">
            {tabs.map((tab, index) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex-1 flex flex-col items-center gap-2 px-3 py-4 font-medium transition-all duration-300 rounded-t-xl ${tab.color.bg} text-white
                  `}
                  style={isActive ? {
                    boxShadow: '-2px -2px 4px rgba(0,0,0,0.08), 2px -2px 4px rgba(0,0,0,0.08)'
                  } : {}}
                >
                  <IconComponent 
                    className="w-6 h-6 transition-colors duration-300 text-white"
                  />
                  <span className="text-xs md:text-sm text-center leading-tight">
                    {tab.title}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Panel - Connects with active tab */}
          <div className={`relative z-10 -mt-[1px] shadow-xl rounded-2xl p-8 md:p-12 ${tabs[activeTab].color.bg}`}>
            <div className="transition-all duration-500 ease-in-out">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`transition-all duration-500 ${
                    activeTab === tab.id
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 absolute pointer-events-none'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      {/* Content */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <tab.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white">
                            {tab.content.title}
                          </h3>
                        </div>
                        
                        <p className="text-lg text-white/90 leading-relaxed">
                          {tab.content.description}
                        </p>

                        <div className="space-y-3">
                          {tab.content.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                              <span className="text-white/95">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Visual Element */}
                      <div className="relative">
                        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border-2 border-white/30 overflow-hidden">
                          {/* Background Image with color overlay */}
                          <div className="absolute inset-0 z-0">
                            <img 
                              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
                              alt="Background"
                              className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-black opacity-10"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="relative z-10">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <tab.icon className={`w-12 h-12 ${tab.color.iconActive}`} />
                            </div>
                            <h4 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">
                              {tab.title}
                            </h4>
                            <p className="text-white/90 drop-shadow-md">
                              {tab.content.title}
                            </p>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full opacity-20"></div>
                        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white rounded-full opacity-30"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer">
            <span>Ready to transform your learning strategy?</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseAthena;
