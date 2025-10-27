import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AboutHero from './AboutHero';
import AboutFeatures from './AboutFeatures';

const About = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <section 
      ref={containerRef}
      style={{
        width: '100%',
        padding: '5rem 0',
        background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe, #f0f9ff)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Cloud background elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.6
      }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50px',
              width: `${100 + Math.random() * 200}px`,
              height: `${60 + Math.random() * 80}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(2, 132, 199, 0.1)'
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Floating bubbles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, -200, -300],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      {/* Geometric elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.1
      }}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${40 + Math.random() * 100}px`,
              height: `${40 + Math.random() * 100}px`,
              background: 'linear-gradient(45deg, #0ea5e9, #38bdf8)',
              borderRadius: Math.random() > 0.5 ? '50%' : '8px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              rotate: `${Math.random() * 360}deg`
            }}
            animate={{
              y: [0, Math.random() * 40 - 20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, Math.random() * 90 - 45, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <AboutHero />
      <AboutFeatures />

      {/* ... Rest of the component (Dashboard Showcase and Final CTA sections) ... */}
      {/* You might want to extract these into separate components as well */}
    </section>
  );
};

export default About;