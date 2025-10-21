import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Ready() {
  const navigate = useNavigate();
  const sectionRef = useRef();
  const [showContent, setShowContent] = useState(false);

  // Intersection Observer for scroll-based reveal
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowContent(true);
        }
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
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
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
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ready-content.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .ready-heading {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 400;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -2px;
          margin-bottom: 1.2rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .ready-subheading {
          font-family: 'Arial', sans-serif;
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 400;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .ready-highlight {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }
        
        .ready-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border: 1.5px solid rgba(59, 130, 246, 0.5);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 14px 36px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 25px rgba(30, 58, 138, 0.4);
          text-decoration: none;
        }
        
        .ready-cta:hover {
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          border-color: rgba(59, 130, 246, 0.8);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(37, 99, 235, 0.6);
        }
        
        .ready-cta-icon {
          transition: transform 0.3s ease;
        }
        
        .ready-cta:hover .ready-cta-icon {
          transform: translateX(5px);
        }
        
        .decorative-circles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        .circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          animation: float 20s infinite ease-in-out;
        }
        
        .circle-1 {
          width: 400px;
          height: 400px;
          top: -10%;
          left: -5%;
          animation-delay: 0s;
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
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @media (max-width: 768px) {
          .ready-hero {
            padding: 2.5rem 1.5rem;
            min-height: 50vh;
          }
          
          .ready-heading {
            font-size: clamp(1.75rem, 8vw, 2.5rem);
            letter-spacing: -1.5px;
            margin-bottom: 1rem;
          }
          
          .ready-subheading {
            font-size: clamp(0.9rem, 3vw, 1.1rem);
            margin-bottom: 1.8rem;
          }
          
          .ready-cta {
            font-size: 0.9rem;
            padding: 12px 28px;
          }
          
          .circle {
            display: none;
          }
        }
      `}</style>

      <div className="decorative-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className={`ready-content${showContent ? " show" : ""}`}>
        <h2 className="ready-heading">
          Ready to Start Your Journey?
        </h2>
        
        <p className="ready-subheading">
          Join thousands of educators transforming learning with <span className="ready-highlight">AI-powered</span> course creation
        </p>
        
        <button className="ready-cta" onClick={() => navigate('/contact')}>
          Start Free Trial
          <ArrowRight size={20} className="ready-cta-icon" />
        </button>
      </div>
    </section>
  );
}
