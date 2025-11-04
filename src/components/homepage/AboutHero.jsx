import React from 'react';
import { motion } from 'framer-motion';
import './AboutHero.css';

const AboutHero = () => {
  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="about-hero-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <motion.h2
          initial="hidden"
          animate="visible"
          className="about-hero-heading"
        >
          {[
            "Athena – The Next Generation Learning Platform",
            "Learn. Create. Transform.",
            "Teach Smarter, Engage Deeper, Scale Faster"
          ].map((line, i) => (
            <motion.span
              key={i}
              className={`heading-line ${i === 1 ? 'highlighted-line' : 'normal-line'}`}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5, delay: 0.2 + i * 0.1 }
                }
              }}
            >
              {line}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="about-hero-description"
        >
          Athena is an AI-powered course creation platform that combines simplicity, flexibility, and intelligence to transform learning.
        </motion.p>

        {/* Animated CTA buttons */}
        <motion.div 
          className="cta-buttons-container"
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
            className="cta-button primary"
          >
            <span className="button-text">Start For Free</span>
            <motion.div 
              className="button-gradient"
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
            className="cta-button secondary"
          >
            Book a Demo
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutHero;
