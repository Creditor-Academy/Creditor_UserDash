import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LMS from '../../assets/LMS.png';

const AboutFeatures = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      {/* Stats Section */}
      <motion.div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          margin: '4rem auto',
          maxWidth: '1000px',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {[
          { value: '95%', label: 'User Satisfaction' },
          { value: '100+', label: 'Active Users' },
          { value: '50%', label: 'Faster Learning' },
          { value: '24/7', label: 'Support' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(2, 132, 199, 0.1)',
              backdropFilter: 'blur(10px)',
              minWidth: '160px',
              boxShadow: '0 8px 32px rgba(2, 132, 199, 0.1)'
            }}
            whileHover={{ 
              y: -5,
              background: 'rgba(255, 255, 255, 0.9)',
              transition: { duration: 0.2 }
            }}
          >
            <motion.div 
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                background: 'linear-gradient(to right, #0284c7, #0ea5e9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                marginBottom: '0.5rem'
              }}
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {stat.value}
            </motion.div>
            <div style={{ color: '#475569', fontSize: '0.9rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Video + Text Section */}
      <div style={{
        width: '100%',
        padding: '6rem 2rem',
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Video Holder - Left Side */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
            }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            style={{
              flex: '1 1 400px',
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              aspectRatio: '16/9',
              border: '1px solid rgba(2, 132, 199, 0.2)'
            }}
          >
            <AnimatePresence mode="wait">
              {!isVideoPlaying ? (
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsVideoPlaying(true)}
                >
                  {/* Thumbnail image */}
                  <img 
                    src={LMS} 
                    alt="Athena LMS Thumbnail"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {/* Subtle overlay for contrast */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)'
                    }}
                  />
                  
                  {/* Play Button with enhanced animation */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05)'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                    }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      style={{ height: '32px', width: '32px', color: '#0284c7', marginLeft: '4px' }} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                    </svg>
                    
                    {/* Pulsing ring */}
                    <motion.div 
                      style={{
                        position: 'absolute',
                        inset: -10,
                        border: '2px solid rgba(2, 132, 199, 0.3)',
                        borderRadius: '50%'
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  </motion.div>
                  
                  {/* Subtle Glow Effect */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.12), transparent 70%)',
                    pointerEvents: 'none'
                  }} />
                  
                  {/* Hover instruction */}
                  <motion.div 
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#0f172a',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backdropFilter: 'blur(10px)'
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Watch platform overview
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'black'
                  }}
                >
                  <iframe
                    src="https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview"
                    style={{ width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Athena Platform Demo"
                  />
                  
                  {/* Close Button */}
                  <motion.button
                    onClick={() => setIsVideoPlaying(false)}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#0f172a',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                      zIndex: 20,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      style={{ height: '20px', width: '20px' }} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Text Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
            }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ flex: '1 1 400px' }}
          >
            <motion.h3
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '1.5rem',
                position: 'relative',
                display: 'inline-block'
              }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
              }}
              transition={{ delay: 0.2 }}
            >
              Why Choose Athena LMS?
              <motion.div 
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: 0,
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(to right, #0284c7, #38bdf8)',
                  borderRadius: '2px'
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ 
                  scaleX: 1,
                }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </motion.h3>
            
            <motion.div 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {[
                {
                  title: "Intuitive Course Creation",
                  description: "Build engaging courses with our drag-and-drop interface and pre-designed templates"
                },
                {
                  title: "Seamless Collaboration",
                  description: "Enable real-time interaction between instructors and learners with built-in communication tools"
                },
                {
                  title: "Advanced Analytics",
                  description: "Gain insights into learner progress and engagement with detailed reporting dashboards"
                },
                {
                  title: "Mobile Accessibility",
                  description: "Access courses and materials from any device, anywhere with our responsive design"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  style={{
                    position: 'relative',
                    padding: '1px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(2,132,199,0.35), rgba(56,189,248,0.25))',
                  }}
                >
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem 1.1rem',
                      background: 'rgba(255, 255, 255, 0.78)',
                      borderRadius: 13,
                      border: '1px solid rgba(2, 132, 199, 0.12)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 6px 14px rgba(2, 132, 199, 0.08)'
                    }}
                    whileHover={{ y: -4, rotate: 0.2, boxShadow: '0 14px 26px rgba(2, 132, 199, 0.16)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <motion.div 
                      style={{
                        padding: '8px',
                        background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                        color: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        marginTop: '2px',
                        flexShrink: 0,
                        boxShadow: '0 6px 14px rgba(2,132,199,0.25)'
                      }}
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '18px', width: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '1.06rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{item.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#0369a1', background: 'rgba(2,132,199,0.12)', border: '1px solid rgba(2,132,199,0.25)', padding: '4px 8px', borderRadius: 999 }}>{index + 1}</span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.55, margin: 0 }}>{item.description}</p>
                      <div style={{ marginTop: 10, height: 3, width: '40%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 6, opacity: 0.55 }} />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              style={{ marginTop: '2.5rem' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 10px 25px rgba(2, 132, 199, 0.3)" 
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(to right, #0284c7, #0ea5e9)',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Explore All Features
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '18px', width: '18px', display: 'inline', marginLeft: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AboutFeatures;