import React from 'react';
import { Sparkles, BookOpen, Users, Heart } from 'lucide-react';

const GuidingStars = () => {
  const values = [
    {
      name: 'Innovation',
      description: 'Ahead of the curve.',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'Pedagogy',
      description: 'Understandable and actionable.',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'Accessibility',
      description: 'We build for everyone.',
      icon: Users,
      color: 'from-green-500 to-teal-500',
    },
    {
      name: 'Humancentric',
      description: 'Empathy is our starting point.',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
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
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />

      {/* Keyframe Animation */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-normal text-white mb-4"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Our Guiding Stars
          </h2>
          <p
            className="text-xl text-gray-300 max-w-3xl mx-auto font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            These four core values illuminate our path forward, shaping every
            decision we make and every solution we create.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Value Name */}
                  <h3
                    className="text-lg font-semibold text-gray-900 mb-2"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {value.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GuidingStars;
