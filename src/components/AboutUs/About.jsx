import React from "react";
import { motion } from "framer-motion";
import backgroundAbout from "../../assets/teamm.jpg";

// BackgroundImg component with scrolling functionality
const BackgroundImg = ({ src, alt = "Background", scrollSpeed = "-0.2" }) => {
  return (
    <div style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div
        style={{ width: '100%' }}
        data-scroll
        data-scroll-speed={scrollSpeed}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
};
const About = () => {
  return (
    <section style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa',
      padding: '80px 0',
    }}>
      {/* Background with reduced opacity and scroll effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        height: '100%'
      }}>
        <BackgroundImg 
          src={backgroundAbout} 
          alt="Background" 
          scrollSpeed="-0.3" 
        />
      </div>

      {/* Container */}
      <div className="container" style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '80px',
        padding: '0 24px',
      }}>
        {/* About Intro */}
        <motion.div
          className="intro-container"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '60px',
          }}
        >
          {/* Left text with scroll effect */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            data-scroll
            data-scroll-speed="-0.1"
          >
            <h3 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
              fontFamily: '"NeueMontreal", sans-serif',
            }}>
              We are <span style={{color: '#6495ED'}}>Athena LMS</span>
            </h3>
            <p style={{
              fontSize: '1.125rem',
              color: '#333',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: '"NeueMontreal", sans-serif',
            }}>
              Athena LMS transforms the way teams learn, share, and grow.  
              We combine design, interactivity, and deep insights to empower 
              businesses with impactful learning journeys that win hearts and minds.
            </p>
            <p style={{
              fontSize: '1.125rem',
              color: '#333',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: '"NeueMontreal", sans-serif',
            }}>
              Our philosophy is simple: knowledge should be immersive, intuitive, 
              and inspiring. That's why we built Athena — to help businesses 
              educate with elegance and scale with confidence.
            </p>
          </div>

          {/* Right visual block with scroll effect */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{
              flex: 1,
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              width: '100%',
            }}
            data-scroll
            data-scroll-speed="0.1"
          >
            <BackgroundImg 
              src={backgroundAbout} 
              alt="About Athena LMS" 
              scrollSpeed="-0.2" 
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Responsive Styles and Scroll Effects */}
      <style>{`
        /* Scroll effect styles */
        [data-scroll] {
          will-change: transform;
        }
        
        /* Smooth scrolling for better performance */
        html {
          scroll-behavior: smooth;
        }
        
        /* Mobile - Stack vertically */
        @media (max-width: 767px) {
          .intro-container {
            flex-direction: column !important;
            gap: 40px !important;
          }
          
          h3 {
            font-size: 2rem !important;
            text-align: center !important;
          }
          
          p {
            text-align: center !important;
          }
          
          /* Disable scroll effects on mobile for better performance */
          [data-scroll] {
            transform: none !important;
          }
        }
        
        /* Tablet and Desktop - Side by side */
        @media (min-width: 768px) {
          section {
            padding: 100px 0 !important;
          }
          
          .intro-container {
            flex-direction: row !important;
            gap: 60px !important;
          }
          
          h3 {
            font-size: 2.5rem !important;
          }
        }
        
        @media (min-width: 1024px) {
          h3 {
            font-size: 3rem !important;
          }
          
          .container {
            gap: 100px !important;
          }
          
          .intro-container {
            gap: 80px !important;
          }
        }

        @font-face {
          font-family: 'NeueMontreal';
          src: local('NeueMontreal'), url(./path/to/NeueMontreal.woff2) format('woff2');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
    </section>
  );
};

export default About;