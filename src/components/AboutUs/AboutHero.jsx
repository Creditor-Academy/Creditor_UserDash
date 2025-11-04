import React from "react";
import { ArrowUpRight } from "lucide-react";
import ochiside from "../../assets/dashlogo.webp";

const Hero = () => {
  return (
    <section className="hero-section">
      {/* Internal CSS Styles */}
      <style>
        {`
          .hero-section {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            overflow: hidden;
            margin-top: 0;
            padding-top: 0;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
          }
          
          .hero-aurora {
            position: absolute;
            inset: 0;
            z-index: 1;
            overflow: hidden;
          }

          .hero-aurora::before,
          .hero-aurora::after {
            content: '';
            position: absolute;
            inset: -20% -10% -10% -20%;
            filter: blur(40px);
            opacity: 0.55;
            animation: auroraShift 18s ease-in-out infinite alternate;
            background:
              radial-gradient(40% 50% at 20% 30%, rgba(99, 102, 241, 0.6), transparent 60%),
              radial-gradient(35% 45% at 80% 20%, rgba(59, 130, 246, 0.55), transparent 60%),
              radial-gradient(45% 55% at 60% 80%, rgba(16, 185, 129, 0.45), transparent 60%),
              radial-gradient(35% 45% at 30% 70%, rgba(236, 72, 153, 0.35), transparent 60%);
          }

          .hero-aurora::after {
            inset: -10% -20% -20% -10%;
            opacity: 0.45;
            animation-duration: 22s;
            animation-delay: 1.5s;
            background:
              radial-gradient(45% 55% at 75% 65%, rgba(99, 102, 241, 0.45), transparent 60%),
              radial-gradient(35% 45% at 30% 25%, rgba(6, 182, 212, 0.4), transparent 60%),
              radial-gradient(40% 50% at 55% 35%, rgba(59, 130, 246, 0.35), transparent 60%);
          }

          /* Subtle grid overlay */
          .hero-aurora-grid {
            position: absolute;
            inset: 0;
            z-index: 1;
            background-image:
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
            background-size: 40px 40px, 40px 40px;
            mix-blend-mode: overlay;
            pointer-events: none;
          }

          @keyframes auroraShift {
            0% { transform: translate3d(-2%, -2%, 0) scale(1.05); }
            50% { transform: translate3d(2%, 1%, 0) scale(1.1); }
            100% { transform: translate3d(-1%, 2%, 0) scale(1.06); }
          }
          
          .hero-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 3rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            height: 100vh;
            box-sizing: border-box;
          }
          
          .hero-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
          }
          
          .hero-heading {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 3.5rem;
            font-weight: 400;
            color: #fff;
            line-height: 1.1;
            letter-spacing: -1px;
            margin-bottom: 1.5rem;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          
          .hero-description {
            font-family: 'Arial', sans-serif;
            font-size: 1.1rem;
            color: #fff;
            line-height: 1.6;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            max-width: 500px;
          }
          
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
          }
          
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
          
          .hero-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            position: relative;
          }
          
          /* Large Desktop */
          @media (min-width: 1400px) {
            .hero-container {
              max-width: 1600px;
              padding: 0 4rem;
            }
            .hero-heading {
              font-size: 4rem;
            }
          }
          
          /* Desktop */
          @media (max-width: 1200px) {
            .hero-container {
              padding: 0 2.5rem;
              gap: 3rem;
            }
            .hero-heading {
              font-size: 3rem;
            }
          }
          
          /* Tablet */
          @media (max-width: 900px) {
            .hero-container {
              grid-template-columns: 1fr;
              gap: 2rem;
              padding: 2rem;
              text-align: center;
            }
            .hero-left {
              order: 2;
            }
            .hero-right {
              order: 1;
            }
            .hero-heading {
              font-size: 2.5rem;
            }
          }
          
          /* Mobile */
          @media (max-width: 768px) {
            .hero-container {
              padding: 1.5rem;
              gap: 1.5rem;
            }
            .hero-heading {
              font-size: 2.2rem;
            }
            .hero-description {
              font-size: 1rem;
            }
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
          }
          
          @media (max-width: 480px) {
            .hero-container {
              padding: 1rem;
            }
            .hero-heading {
              font-size: 1.8rem;
            }
            .hero-description {
              font-size: 0.95rem;
            }
          }
        `}
      </style>

      <div className="hero-aurora" />
      <div className="hero-aurora-grid" />
      <div className="hero-container">
        <div className="hero-left">
          <div className="text-sm" style={{ color: '#fff', fontWeight: 600, opacity: 0.9, marginBottom: '0.75rem' }}>
            About | Athena LMS
          </div>
          <h1 className="hero-heading" style={{ marginBottom: '1.5rem' }}>
            Empowering Learning. <span style={{ color: '#fbbf24' }}>Built for Impact.</span>
          </h1>
          <p className="hero-description">
            We combine instructional design thinking with modern technology to craft meaningful learning experiences for organisations and individuals.
          </p>
          <div className="hero-buttons">
            <a href="/about" className="btn-primary">
              Learn More
              <ArrowUpRight size={16} strokeWidth={2} />
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </div>
        <div className="hero-right">
          <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>
            <img
              src={ochiside}
              alt="About Athena"
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)' }}></div>
            {/* <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>ATHENA</span>
                  <div style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                    ABOUT
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      {/* <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
        <a
          href="/contact"
          className="btn-primary"
          style={{
            background: 'linear-gradient(90deg, #fb923c, #f97316)',
            color: '#fff',
            boxShadow: '0 12px 25px rgba(249, 115, 22, 0.35)'
          }}
        >
          Talk to Us
        </a>
      </div> */}
    </section>
  );
};

export default Hero;