import React, { useState, useEffect } from 'react';
import featuresVideo from '../../assets/features.mp4';

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const featureItems = [
    { title: "Personalized Learning" },
    { title: "Seamless Management" },
    { title: "Anytime, Anywhere" }
  ];

  return (
    <div style={styles.section}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      >
        <source src={featuresVideo} type="video/mp4" />
      </video>
      
      {/* Blue overlay with gradient */}
      <div style={styles.overlay}></div>
      
      {/* Content */}
      <div style={styles.content}>
        {/* Headline */}
        <h1 style={styles.headline}>
          Smarter Learning, <br /> Seamless Management
        </h1>

        {/* Tagline */}
        <p style={styles.tagline}>
          Athens LMS transforms education with modern tools that make learning
          more engaging, accessible, and impactful — for institutions, teachers,
          and learners alike.
        </p>

        {/* Feature Pills */}
        <div style={styles.featuresContainer}>
          {featureItems.map((feat, i) => (
            <div
              key={i}
              style={{
                ...styles.featurePill,
                transform: 'scale(1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
              }}
            >
              <p style={styles.featureText}>{feat.title}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <a
          href="#features"
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #6366f1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          Explore Features →
        </a>
      </div>
    </div>
  );
};

const styles = {
  section: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.4), rgba(30, 64, 175, 0.3), rgba(30, 58, 138, 0.4))',
    zIndex: 0
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  headline: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: 'white',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lineHeight: 1.2,
    margin: '0 0 1.5rem 0'
  },
  tagline: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#f9fafb',
    maxWidth: '600px',
    lineHeight: 1.6,
    margin: '0 0 2.5rem 0'
  },
  featuresContainer: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    margin: '0 0 3rem 0'
  },
  featurePill: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '1rem 1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
  },
  featureText: {
    fontWeight: 600,
    color: 'white',
    letterSpacing: '0.025em',
    margin: 0,
    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
  },
  ctaButton: {
    display: 'inline-block',
    background: 'linear-gradient(to right, #3b82f6, #6366f1)',
    transition: 'all 0.3s ease',
    padding: '1rem 2.5rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '1.125rem',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
    textDecoration: 'none',
    cursor: 'pointer'
  }
};

export default HeroSection;