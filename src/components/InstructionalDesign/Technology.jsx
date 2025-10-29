import React from 'react';
import { 
  Code, 
  Smartphone, 
  BookOpen, 
  Palette, 
  Headphones, 
  Video, 
  Cpu, 
  Cloud,
  Layers,
  Monitor,
  Zap,
  Brain
} from 'lucide-react';

const Technology = () => {
  const tools = [
    { 
      name: 'Articulate 360', 
      icon: BookOpen, 
      color: 'from-orange-500 to-red-500',
      category: 'Authoring'
    },
    { 
      name: 'Storyline', 
      icon: Layers, 
      color: 'from-red-500 to-pink-500',
      category: 'Authoring'
    },
    { 
      name: 'Athena LMS', 
      icon: Cloud, 
      color: 'from-blue-500 to-indigo-500',
      category: 'LMS'
    },
    { 
      name: 'Canvas LMS', 
      icon: Monitor, 
      color: 'from-blue-600 to-blue-700',
      category: 'LMS'
    },
    { 
      name: 'Adobe Suite', 
      icon: Palette, 
      color: 'from-red-600 to-red-700',
      category: 'Design'
    },
    { 
      name: 'VR Platforms', 
      icon: Headphones, 
      color: 'from-purple-500 to-indigo-600',
      category: 'Immersive'
    },
    { 
      name: 'AI Avatars', 
      icon: Brain, 
      color: 'from-cyan-500 to-blue-500',
      category: 'AI'
    },
    { 
      name: 'Python', 
      icon: Code, 
      color: 'from-yellow-500 to-green-600',
      category: 'Development'
    },
    { 
      name: 'Video Production', 
      icon: Video, 
      color: 'from-pink-500 to-rose-500',
      category: 'Media'
    },
    { 
      name: 'Mobile Learning', 
      icon: Smartphone, 
      color: 'from-green-500 to-teal-500',
      category: 'Mobile'
    },
    { 
      name: 'API Integration', 
      icon: Zap, 
      color: 'from-yellow-400 to-orange-500',
      category: 'Integration'
    },
    { 
      name: 'Cloud Services', 
      icon: Cpu, 
      color: 'from-indigo-500 to-purple-600',
      category: 'Infrastructure'
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              rgba(255, 255, 255, 0.05) 50px,
              rgba(255, 255, 255, 0.05) 51px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(255, 255, 255, 0.05) 50px,
              rgba(255, 255, 255, 0.05) 51px
            )
          `,
          animation: 'gridPulse 4s ease-in-out infinite'
        }}
      />

      {/* Keyframe Animation */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-normal text-white mb-4" 
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Tools & Platforms We Use
          </h2>
          <p 
            className="text-xl text-gray-300 max-w-3xl mx-auto font-normal" 
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            We leverage best-in-class tools so your learning is future-ready.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Tool Name */}
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-2" 
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {tool.name}
                  </h3>
                  
                  {/* Category Badge */}
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {tool.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Zap className="w-5 h-5 text-yellow-400" />
            <p className="text-sm font-medium text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              Plus many more cutting-edge technologies tailored to your needs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;

