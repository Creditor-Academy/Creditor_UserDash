import React from 'react';
import PaulImage from '../../assets/Paul.jpeg';
import Logo from '../../assets/logo.webp';

const FounderQuote = () => {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      }}
    >
      {/* Animated Grid Background - Right Side */}
      <div
        className="absolute right-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: '60%',
          background: `
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 100%),
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
          maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to left, black 30%, transparent 100%)',
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />

      {/* Background Logo - Visible on the left */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-10 pointer-events-none"
        style={{ width: '700px', height: '700px' }}
      >
        <img src={Logo} alt="" className="w-full h-full object-contain" />
      </div>

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Quote Section */}
          <div className="space-y-6">
            {/* Quote */}
            <blockquote
              className="text-2xl md:text-3xl font-normal text-white leading-relaxed"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              "We don't just create courses—we architect learning experiences
              that inspire, engage, and transform. Every interaction is an
              opportunity to unlock human potential and drive meaningful
              change."
            </blockquote>

            {/* Attribution */}
            <div className="space-y-1">
              <p
                className="text-lg font-semibold text-white"
                style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
              >
                PaulMichael Rowland
              </p>
              <p
                className="text-base text-gray-300"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Founder
              </p>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-64 h-64">
                <img
                  src={PaulImage}
                  alt="PaulMichael Rowland - Founder"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-indigo-400 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderQuote;
