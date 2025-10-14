import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ochiside from "../../assets/AthenaDash.png";
import eyesImage from "../../assets/eyes.svg";

const Hero = () => {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #f0f7ff, #e6f2ff, #d9ecff)',
      }}
    >
      {/* Floating Particles Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          filter: 'blur(2px)',
        }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              backgroundColor: 'rgba(173, 216, 230, 0.4)',
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 15 + 10,
              height: Math.random() * 15 + 10,
              opacity: 0.8,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              transition: {
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>

      {/* Top Heading */}
      <div
        style={{
          padding: '0 24px',
          paddingTop: '96px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.86, 0, 0.07, 0.995] }}
          style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            letterSpacing: '-2px',
            color: '#0f172a',
            fontWeight: 'bold',
            fontFamily: '"FoundersGrotesk", sans-serif',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          We are
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '12px',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.8,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
              style={{
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                transition: 'box-shadow 0.3s',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <img
                width={150}
                height={110}
                src={ochiside}
                alt="Athena Logo"
                style={{
                  height: '110px',
                  width: 'auto',
                  objectFit: 'cover',
                  borderRadius: '12px',
                }}
              />
            </motion.div>
            <motion.span
              style={{
                fontSize: 'clamp(3rem, 10vw, 6rem)',
                fontFamily: '"FoundersGrotesk", sans-serif',
                color: '#0f172a',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Athena LMS
            </motion.span>
          </div>
        </motion.h1>
      </div>

      {/* Content Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '80px',
          marginTop: '64px',
          position: 'relative',
          width: '100%',
          minHeight: '400px',
        }}
      >
        {/* Left - CTA Buttons and Transform Text */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* CTA Buttons */}
          <motion.div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <a
              href="/product"
              style={{
                padding: '14px 28px',
                borderRadius: '9999px',
                backgroundColor: '#0f172a',
                color: 'white',
                fontFamily: '"NeueMontreal", sans-serif',
                textTransform: 'uppercase',
                fontSize: '15px',
                letterSpacing: '1px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1e293b';
                e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.25)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#0f172a';
                e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
            >
              Explore
            </a>
            <a
              href="/contact"
              style={{
                padding: '14px',
                border: '2px solid #0f172a',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transition: 'transform 0.3s, stroke 0.3s',
                  color: 'inherit',
                }}
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
              <span style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                border: '2px solid rgba(15, 23, 42, 0.1)',
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                opacity: 0,
                transition: 'all 0.3s',
              }}></span>
            </a>
          </motion.div>
          {/* Transform Text below Explore button */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 500,
              fontFamily: '"NeueMontreal", sans-serif',
              color: '#0f172a',
              margin: 0,
              lineHeight: 1.4,
              maxWidth: '600px',
            }}
          >
            We transform complex ideas into engaging and effective learning experiences.
          </motion.h2>
        </motion.div>

        {/* Right - Eyes component with simpler design */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Eyes />
        </motion.div>
      </div>

      {/* Floating CTA at bottom */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <a
          href="/demo"
          style={{
            padding: '14px 28px',
            borderRadius: '9999px',
            background: 'linear-gradient(to right, #2563eb, #9333ea)',
            color: 'white',
            fontWeight: 500,
            boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
          onMouseOver={(e) => {
            e.target.style.boxShadow = '0 18px 40px rgba(37, 99, 235, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.3)';
          }}
        >
          Get Demo
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transition: 'transform 0.3s',
            }}
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </motion.div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
          }
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .content-row {
            flex-direction: column !important;
            gap: 40px !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </section>
  );
};

// Eyes Component (Simplified)
const Eyes = () => {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      let mouseX = e.clientX;
      let mouseY = e.clientY;

      let deltaX = mouseX - window.innerWidth / 2;
      let deltaY = mouseY - window.innerHeight / 2;

      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      setRotate(angle - 280);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const eyeContainerStyle = {
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    border: "6px solid rgba(15, 23, 42, 0.8)",
    backgroundColor: "#F7F7F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 16px rgba(59, 130, 246, 0.08)",
  };

  const innerImageStyle = {
    transform: `rotate(${rotate}deg)`,
    width: "240px",
    height: "240px",
    objectFit: "cover",
    transition: 'transform 0.1s ease-out, scale 0.2s',
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "60px",
        position: "relative",
      }}
    >
      {/* Eye with subtle glow */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div style={{ ...eyeContainerStyle }}>
          <motion.img
            style={innerImageStyle}
            src={eyesImage}
            alt="Eye"
            whileHover={{ scale: 1.05 }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            animation: 'glow 3s infinite ease-in-out',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        ></div>
      </div>

      {/* Second Eye with subtle glow */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div style={{ ...eyeContainerStyle }}>
          <motion.img
            style={innerImageStyle}
            src={eyesImage}
            alt="Eye"
            whileHover={{ scale: 1.05 }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            animation: 'glow 3s infinite ease-in-out',
            animationDelay: '1.5s',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;