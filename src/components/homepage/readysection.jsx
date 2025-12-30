import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Ready() {
  const navigate = useNavigate();
  const sectionRef = useRef();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowContent(true);
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="ready-hero">
      <style>{`
        .ready-hero {
          min-height: 60vh;
          background: linear-gradient(
            135deg,
            #020617 0%,
            #0f172a 50%,
            #1e293b 100%
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 3rem 2rem;
        }

        .ready-content {
          max-width: 900px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          z-index: 1;
        }

        .ready-content.show {
          opacity: 1;
          transform: translateY(0);
        }

        .ready-heading {
          font-family: 'Georgia', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 400;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -2px;
          margin-bottom: 1.2rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .ready-subheading {
          font-family: 'Arial', sans-serif;
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .ready-highlight {
          background: linear-gradient(135deg, #38bdf8, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
        }

        .ready-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1e40af, #2563eb);
          border: 1px solid rgba(96, 165, 250, 0.5);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 14px 36px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
        }

        .ready-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.6);
        }

        .ready-cta-icon {
          transition: transform 0.3s ease;
        }

        .ready-cta:hover .ready-cta-icon {
          transform: translateX(6px);
        }

        .decorative-circles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.15),
            transparent 70%
          );
          animation: float 20s infinite ease-in-out;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          top: -10%;
          left: -5%;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          bottom: -5%;
          right: -5%;
          animation-delay: 3s;
        }

        .circle-3 {
          width: 250px;
          height: 250px;
          top: 50%;
          right: 10%;
          animation-delay: 6s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-30px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }

        @media (max-width: 768px) {
          .circle { display: none; }
          .ready-hero { min-height: 50vh; }
        }
      `}</style>

      <div className="decorative-circles">
        <div className="circle circle-1" />
        <div className="circle circle-2" />
        <div className="circle circle-3" />
      </div>

      <div className={`ready-content${showContent ? ' show' : ''}`}>
        <h2 className="ready-heading">Ready to Start Your Journey?</h2>

        <p className="ready-subheading">
          Join thousands of educators transforming learning with{' '}
          <span className="ready-highlight">AI-powered</span> course creation
        </p>

        <button className="ready-cta" onClick={() => navigate('/contact')}>
          Join Now
          <ArrowRight size={20} className="ready-cta-icon" />
        </button>
      </div>
    </section>
  );
}
