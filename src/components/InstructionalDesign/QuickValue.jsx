import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, TrendingDown, Globe, Award } from 'lucide-react';

const QuickValue = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          .quick-value-section {
            background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
            padding: 5rem 1rem;
            position: relative;
          }

          .quick-value-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .quick-value-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
            margin-top: 3rem;
          }

          .value-card {
            background: white;
            padding: 2.5rem 1.5rem;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
            position: relative;
            overflow: hidden;
          }

          .value-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
          }

          .value-card:hover {
            transform: translateY(-8px);
          }

          .value-card:hover::before {
            transform: scaleX(1);
          }

          .icon-wrapper {
            width: 64px;
            height: 64px;
            margin: 0 auto 1.5rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .value-card:hover .icon-wrapper {
            transform: scale(1.1) rotate(5deg);
          }

          .icon-wrapper svg {
            color: white;
            width: 32px;
            height: 32px;
          }

          .counter {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 3rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.75rem;
            letter-spacing: -1px;
          }
          
          .bottom-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
          }

          .value-label {
            font-family: 'Arial', sans-serif;
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.5;
            font-weight: 500;
          }

          .section-title {
            text-align: center;
            font-family: 'Georgia, Times New Roman, serif';
            font-size: 3rem;
            font-weight: 400;
            color: #111827;
            margin-bottom: 1rem;
            line-height: 1.2;
          }

          .section-subtitle {
            text-align: center;
            font-family: 'Arial, sans-serif';
            font-size: 1.125rem;
            font-weight: 400;
            color: #4b5563;
            max-width: 48rem;
            margin: 0 auto;
          }

          /* Responsive Design */
          @media (min-width: 1400px) {
            .section-title {
              font-size: 3.75rem;
            }
          }

          @media (max-width: 1024px) {
            .quick-value-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 1.5rem;
            }
            
            .section-title {
              font-size: 2.5rem;
            }
          }

          @media (max-width: 768px) {
            .quick-value-section {
              padding: 3rem 1rem;
            }

            .quick-value-grid {
              grid-template-columns: 1fr;
              gap: 1.25rem;
            }

            .section-title {
              font-size: 2.25rem;
            }

            .section-subtitle {
              font-size: 1rem;
            }

            .counter {
              font-size: 2.5rem;
            }

            .value-card {
              padding: 2rem 1.25rem;
            }
          }

          @media (max-width: 480px) {
            .section-title {
              font-size: 1.875rem;
            }

            .counter {
              font-size: 2rem;
            }

            .icon-wrapper {
              width: 56px;
              height: 56px;
            }

            .icon-wrapper svg {
              width: 28px;
              height: 28px;
            }
          }
        `}
      </style>

      <section className="quick-value-section" ref={sectionRef}>
        <div className="quick-value-container">
          <h2 className="section-title">Trusted Results, Proven Impact</h2>
          <p className="section-subtitle">
            We partner with organizations worldwide to create learning experiences that drive real outcomes.
          </p>

          <div className="quick-value-grid">
            <ValueCard
              icon={<BookOpen />}
              targetNumber={150}
              suffix="+"
              label="Courses Built"
              isVisible={isVisible}
              delay={0}
              color="#3b82f6"
            />
            <ValueCard
              icon={<TrendingDown />}
              targetNumber={30}
              suffix="%"
              label="Reduction in Training Time"
              isVisible={isVisible}
              delay={200}
              color="#f59e0b"
            />
            <ValueCard
              icon={<Globe />}
              targetNumber={50}
              suffix="+"
              label="Global Enterprise Clients"
              isVisible={isVisible}
              delay={400}
              color="#10b981"
            />
            <ValueCard
              icon={<Award />}
              targetNumber={98}
              suffix="%"
              label="Client Satisfaction Rate"
              isVisible={isVisible}
              delay={600}
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>
    </>
  );
};

const ValueCard = ({ icon, targetNumber, suffix, label, isVisible, delay, color }) => {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = targetNumber / steps;
      let currentStep = 0;

      const counter = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setCount(Math.min(Math.round(increment * currentStep), targetNumber));
        } else {
          setCount(targetNumber);
          clearInterval(counter);
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, targetNumber, delay]);

  // Convert hex to rgba for shadow
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      className="value-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 12px 30px ${hexToRgba(color, 0.25)}` 
          : '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div 
        className="icon-wrapper"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div 
        className="counter"
        style={{ color: color }}
      >
        {count}{suffix}
      </div>
      <div className="value-label">
        {label}
      </div>
      
      {/* Top bar that appears on hover */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: color,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.3s ease'
        }}
      />
      
      {/* Bottom color bar - always visible */}
      <div className="bottom-bar">
        <div style={{ backgroundColor: color, height: '100%' }} />
      </div>
    </div>
  );
};

export default QuickValue;

