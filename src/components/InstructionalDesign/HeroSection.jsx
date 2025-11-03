import React from 'react';

const HeroSection = () => {
  return (
    <>
      <style>
        {`
          .hero-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
            border: none;
            cursor: pointer;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }
          
          .btn-secondary {
            background: transparent;
            color: #fff;
            padding: 12px 24px;
            border: 1px solid #fff;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
          
          /* Large Desktop */
          @media (min-width: 1400px) {
            .hero-heading {
              font-size: 4rem;
            }
          }
          
          /* Desktop */
          @media (max-width: 1200px) {
            .hero-heading {
              font-size: 3rem;
            }
          }
          
          /* Tablet */
          @media (max-width: 900px) {
            .hero-buttons {
              flex-direction: column;
              align-items: center;
              gap: 0.8rem;
            }
            .btn-primary,
            .btn-secondary {
              width: 100%;
              max-width: 250px;
              justify-content: center;
            }
            .hero-heading {
              font-size: 2.5rem;
            }
          }
          
          /* Mobile */
          @media (max-width: 768px) {
            .hero-heading {
              font-size: 2.2rem;
            }
            .hero-description {
              font-size: 1rem;
            }
          }
          
          @media (max-width: 480px) {
            .hero-heading {
              font-size: 1.8rem;
            }
            .hero-description {
              font-size: 0.95rem;
            }
          }
        `}
      </style>
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
        }}
      >
        {/* Background Elements */}
        <div
          className="hero-pattern"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.06) 0%, transparent 50%),
          linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 25%, transparent 50%, rgba(255,255,255,0.05) 75%, transparent 100%)
        `,
            backgroundSize: '600px 600px, 800px 800px, 400px 400px, 100% 100%',
            backgroundPosition: '0 0, 200px 200px, 100px 100px, 0 0',
            zIndex: 1,
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Context/Navigation */}
              <div className="text-sm text-white font-medium opacity-90">
                Solutions | Instructional Design
              </div>

              {/* Headline */}
              <h1
                className="hero-heading text-white"
                style={{
                  fontFamily: 'Georgia, Times New Roman, serif',
                  fontSize: '3.5rem',
                  fontWeight: '400',
                  lineHeight: '1.1',
                  letterSpacing: '-1px',
                  marginBottom: '1.5rem',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                Transform Learning.{' '}
                <span style={{ color: '#fbbf24' }}>Drive Performance.</span>
              </h1>

              {/* Sub-headline */}
              <p
                className="hero-description text-white max-w-2xl"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  marginBottom: '2.5rem',
                  opacity: '0.95',
                }}
              >
                Custom instructional design & e-learning development for
                organisations that want results.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="hero-buttons">
                <button className="btn-primary">
                  Book a Consultation
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
                <button className="btn-secondary">Watch a Demo</button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=faces"
                  alt="Professional learning and development"
                  className="w-full h-[600px] object-cover"
                />

                {/* Overlay with Brand Logo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                {/* Brand Overlay */}
                <div className="absolute bottom-8 right-8">
                  <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ATHENA
                      </span>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg">
                        <span className="text-sm font-bold">
                          INSTRUCTIONAL DESIGN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/20 rounded-full animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sticky CTA Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 animate-pulse">
            Book a Consultation
          </button>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
