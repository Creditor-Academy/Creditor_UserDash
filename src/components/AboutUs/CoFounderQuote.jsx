import React, { useEffect, useRef, useState } from 'react';
import PaulImage from '../../assets/Paul.jpeg';
import Logo from '../../assets/logo.webp';

const CoFounderQuote = () => {
  // Slides: Paul and placeholder for Mr. Javed Irshad
  const slides = [
    {
      quote:
        'Visionary leader with over 15 years of experience in educational technology. Passionate about creating learning solutions that transform lives and bridge the gap between traditional and digital education.',
      name: 'Mr. PaulMichael Rowland',
      role: 'Co-Founder',
      image: PaulImage,
    },
    {
      quote:
        'Education specialist with 25 years of experience, including 8 years in e-learning and content writing. Expert in designing engaging learning experiences that captivate and educate.',
      name: 'Mr. Javed Irshad',
      role: 'Co-Founder',
      // Placeholder visual for now (replace with headshot when ready)
      image: Logo,
    },
  ];

  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Autoplay slider
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)' }}>
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
          WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          animation: 'gridPulse 4s ease-in-out infinite'
        }}
      />
      
      {/* Background Logo - Visible on the left */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-10 pointer-events-none"
        style={{ width: '700px', height: '700px' }}
      >
        <img 
          src={Logo} 
          alt="" 
          className="w-full h-full object-contain"
        />
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Slider wrapper */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {slides.map((s, idx) => (
              <div key={idx} className="min-w-full">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Text Section */}
                  <div className="space-y-6">
                    <blockquote className="text-2xl md:text-3xl font-normal text-white leading-relaxed" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                      {s.quote}
                    </blockquote>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                        {s.name}
                      </p>
                      <p className="text-base text-gray-200" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {s.role}
                      </p>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="flex justify-center md:justify-end">
                    <div className="relative">
                      <div className="w-52 h-52">
                        <img
                          src={s.image}
                          alt={`${s.name} - ${s.role}`}
                          className={`w-full h-full ${s.image === Logo ? 'object-contain p-6 bg-white/5 rounded-full' : 'object-cover'} rounded-full`}
                        />
                      </div>
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
                      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-indigo-400 rounded-full opacity-30"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slider controls */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-opacity ${
                active === i ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoFounderQuote;


