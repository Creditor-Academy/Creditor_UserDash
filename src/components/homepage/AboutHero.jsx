import React from 'react';
import { motion } from 'framer-motion';

const AboutHero = () => {
  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div style={{ padding: '0 2rem', paddingTop: '3rem', position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <motion.h2 
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.2,
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          {[
            "Athena: The Future of Learning",
            "Empowering Educators & Learners with",
            "Advanced Tech & Progressive Education"
          ].map((line, i) => (
            <motion.span
              key={i}
              style={{ display: 'block' }}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5, delay: 0.2 + i * 0.1 }
                }
              }}
            >
              {i === 1 ? (
                <span style={{
                  color: '#0284c7',
                  fontWeight: 700,
                  background: 'linear-gradient(to right, rgba(2, 132, 199, 0.1), transparent)',
                  padding: '0.3rem 1rem',
                  borderRadius: '12px',
                  display: 'inline-block',
                  margin: '0.5rem 0'
                }}>
                  {line}
                </span>
              ) : (
                line
              )}
            </motion.span>
          ))}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#475569',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          Athena LMS transforms how educational institutions and businesses create, deliver, 
          and manage learning experiences with cutting-edge technology and intuitive design.
        </motion.p>

        {/* Animated CTA buttons */}
        <motion.div 
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2.5rem',
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.3)" 
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#0284c7',
              color: 'white',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>Get Started Free</span>
            <motion.div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, #0284c7, #0ea5e9)',
                zIndex: 1
              }}
              whileHover={{
                opacity: [1, 0.9, 1],
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(2, 132, 199, 0.1)'
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#0284c7',
              fontWeight: 600,
              borderRadius: '12px',
              border: '2px solid #0284c7',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Watch Demo
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutHero;