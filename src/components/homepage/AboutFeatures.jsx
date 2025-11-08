import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LMS from '../../assets/LMS.png';

const AboutFeatures = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Creation Features - Bullet points only
  const creationFeatures = [
    "Structure & Layout",
    "Media and Design",
    "Interactive Content",
    "Data Visualization",
    "Comparison & Engagement Tools"
  ];

  // AI Features - Bullet points only
  const aiFeatures = [
    "Smart Auto-Generate.",
    "Doc to Module",
    "AI media generation",
    "Content Refinement", 
    "Tone Matching"
  ];

  return (
    <div style={{
      width: '100%',
      padding: '3rem 2rem',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scroll-hide::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.5rem',
          lineHeight: 1.2
        }}>
          Powerful Course Creation
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: '#475569',
          lineHeight: 1.5
        }}>
          Transform knowledge into engaging learning experiences
        </p>
      </motion.div>

      {/* 3-Column Layout */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Block - Create Without Limits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, y: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(2, 132, 199, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(2, 132, 199, 0.3)',
            height: '400px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#6366f1' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Without Limits
            </h3>
          </div>

          <div style={{
            flex: 1,
            overflow: 'hidden'
          }}>
          <div className="scroll-hide" style={{
            display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.5rem',
              height: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingRight: '0.5rem'
          }}>
            {creationFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.5rem',
                    background: 'rgba(2, 132, 199, 0.05)',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                    background: 'rgba(2, 132, 199, 0.1)',
                    transform: 'translateX(4px)'
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#0284c7',
                    borderRadius: '50%',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    fontWeight: 500
                  }}>
                    {feature}
                  </span>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>

        {/* Center Block - Video */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'rgba(2, 132, 199, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: 'none',
            height: '400px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'none',
            aspectRatio: '16/9',
            flex: 1
          }}>
            <AnimatePresence mode="wait">
              {!isVideoPlaying ? (
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <img 
                    src={LMS} 
                    alt="Athena Platform Demo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'right center',
                      display: 'block'
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                  }} />
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '50px',
                      height: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    boxShadow: 'none'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ 
                      height: '20px', 
                      width: '20px', 
                      color: '#0284c7', 
                      marginLeft: '2px' 
                    }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </motion.div>

                  <motion.div 
                    style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '15px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#0f172a',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Watch Demo
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black'
                  }}
                >
                  <iframe
                    src="https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Athena Platform Demo"
                  />
                  
                  <motion.button
                    onClick={() => setIsVideoPlaying(false)}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#0f172a',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Platform Demo
            </h4>
          </div>
        </motion.div>

        {/* Right Block - AI Enhanced Creation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, y: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(2, 132, 199, 0.2)',
            height: '400px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#06b6d4' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI-Enhanced Creation
            </h3>
          </div>

          <div style={{
            flex: 1,
            overflow: 'hidden'
          }}>
          <div className="scroll-hide" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
              gap: '0.5rem',
              height: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingRight: '0.5rem'
          }}>
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.5rem',
                    background: 'rgba(6, 182, 212, 0.05)',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                    background: 'rgba(6, 182, 212, 0.1)',
                    transform: 'translateX(4px)'
                }}
              >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#06b6d4',
                    borderRadius: '50%',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    fontWeight: 500
                  }}>
                    {feature}
                  </span>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AboutFeatures;