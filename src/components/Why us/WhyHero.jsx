import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const WhyUsHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300 });
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  const colors = {
    primary: "#2563EB",
    primaryLight: "#3B82F6",
    primaryDark: "#1D4ED8",
    secondary: "#1E40AF",
    accent: "#0369A1",
    success: "#059669",
    warning: "#D97706",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1E40AF 50%, #0369A1 100%)",
    gradientLight: "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)",
    white: "#FFFFFF",
    light: "#F8FAFC",
    dark: "#0F172A",
    textDark: "#1E293B",
    textLight: "#64748B"
  };

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L20 9.27L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9.27L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      ),
      title: "AI-Powered Learning",
      description: "Smart algorithms adapt to each learner's pace",
      stat: "3.5x faster learning"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 12C21 13.78 20.472 15.52 19.483 17.016C18.494 18.512 17.088 19.699 15.444 20.438C13.8 21.177 11.984 21.439 10.22 21.197C8.456 20.955 6.812 20.219 5.472 19.071C4.132 17.923 3.152 16.412 2.652 14.718C2.152 13.024 2.152 11.216 2.652 9.522C3.152 7.828 4.132 6.317 5.472 5.169C6.812 4.021 8.456 3.285 10.22 3.043C11.984 2.801 13.8 3.063 15.444 3.802C17.088 4.541 18.494 5.728 19.483 7.224C20.472 8.72 21 10.46 21 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
        </svg>
      ),
      title: "Personalized Paths",
      description: "Custom learning journeys based on your goals",
      stat: "98% satisfaction rate"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 14L10 10L13 13L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 17L10 14L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Real-Time Analytics",
      description: "Track progress with detailed insights",
      stat: "95% improvement rate"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "Expert Community",
      description: "Learn from industry leaders and peers",
      stat: "400+ active mentors"
    }
  ];

  // Updated stats as requested
  const stats = [
    { number: 450, suffix: "+", label: "Members", color: colors.primary },
    { number: 24, suffix: "/7", label: "Support", color: colors.accent },
    { number: 98, suffix: "%", label: "Accuracy", color: colors.success },
    { number: 10, suffix: "+", label: "Content Parts", color: colors.secondary }
  ];
  
  // Interactive background gradient that follows mouse
  const InteractiveBackground = () => (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `radial-gradient(600px at ${smoothX}px ${smoothY}px, ${colors.primary}10, transparent 80%)`,
        zIndex: 1
      }}
    />
  );

  // Floating holographic cards
  const FloatingCards = () => {
    const cards = [
      { top: "20%", left: "10%", delay: 0, rotation: -5 },
      { top: "60%", left: "85%", delay: 1, rotation: 8 },
      { top: "30%", left: "75%", delay: 2, rotation: -8 },
      { top: "70%", left: "15%", delay: 3, rotation: 5 }
    ];

    return (
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            style={{
              position: "absolute",
              top: card.top,
              left: card.left,
              width: "90px",
              height: "120px",
              background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              transform: `rotate(${card.rotation}deg)`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [card.rotation, card.rotation + 2, card.rotation]
            }}
            transition={{
              duration: 4,
              delay: card.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Animated gradient orbs
  const GradientOrbs = () => (
      <>
        <motion.div 
          style={{
            position: "absolute",
            top: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
            borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}20, transparent 70%)`,
          filter: "blur(60px)",
            zIndex: 1
          }}
          animate={{
            scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          style={{
            position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
            borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}15, transparent 70%)`,
          filter: "blur(50px)",
            zIndex: 1
          }}
          animate={{
            scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
    </>
  );

  // Compact Feature Showcase
  const FeatureShowcase = () => (
        <motion.div 
          style={{
        position: "relative",
        width: "500px",
        height: "180px",
        background: "rgba(243, 250, 255, 0.85)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 15px 40px rgba(15, 23, 42, 0.12)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        overflow: "hidden"
      }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Animated background pattern */}
      <div style={{
            position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(45deg, ${colors.primary}02 25%, transparent 25%), 
                    linear-gradient(-45deg, ${colors.secondary}02 25%, transparent 25%)`,
        backgroundSize: "50px 50px", // Smaller pattern
            zIndex: 1
      }} />
      
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Feature content */}
        <motion.div 
          key={activeFeature}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ flex: 1 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "26px",
              height: "26px",
              background: colors.gradient,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}>
              <div style={{ width: "16px", height: "16px" }}>
                {features[activeFeature].icon}
              </div>
            </div>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: colors.dark,
              margin: 0
            }}>
              {features[activeFeature].title}
            </h3>
          </div>
          
          <p style={{
            fontSize: "13px",
            lineHeight: "1.45",
            color: colors.textLight,
            marginBottom: "14px"
          }}>
            {features[activeFeature].description}
          </p>
          
          <div style={{
            padding: "12px",
            background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)`,
            borderRadius: "12px",
            border: `1px solid ${colors.primary}15`
          }}>
            <div style={{
              fontSize: "16px",
              fontWeight: "700",
              color: colors.primary,
              textAlign: "center"
            }}>
              {features[activeFeature].stat}
            </div>
          </div>
        </motion.div>

        {/* Feature indicators */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
          style={{
                width: "6px",
                height: "6px",
            borderRadius: "50%",
                border: "none",
                background: index === activeFeature ? colors.primary : colors.textLight + "40",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Removed AnimatedCounter (static stats now)

  return (
    <div 
      ref={ref}
      style={{
      width: "100%",
        background: `linear-gradient(135deg, ${colors.light} 0%, #FFFFFF 50%, ${colors.light} 100%)`,
        padding: "100px 0 60px 0", // Reduced padding
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', 'Poppins', 'Segoe UI', sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
      }}
    >
      {/* Interactive Background */}
      <InteractiveBackground />
      
      {/* Gradient Orbs */}
      <GradientOrbs />
      
      {/* Floating Cards */}
      <FloatingCards />

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 40px",
        position: "relative",
        zIndex: 3
      }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
            alignItems: "center",
        background: `linear-gradient(135deg, ${colors.primary}03, ${colors.secondary}03)`,
        borderRadius: "18px",
        padding: "20px"
      }}>
          {/* LEFT COLUMN - Content */}
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          >
            {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.9)",
                padding: "10px 20px", // Smaller padding
              borderRadius: "50px",
                marginBottom: "25px",
              backdropFilter: "blur(10px)",
                boxShadow: "0 6px 25px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
                <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ width: "14px", height: "14px" }} // Smaller icon
              >
                <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={colors.primary} />
            </svg>
                  </motion.div>
            <span style={{ 
                fontSize: "13px", // Smaller font
              fontWeight: "600", 
                background: colors.gradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
            }}>
                TRUSTED BY ORGANIZATIONS
            </span>
          </motion.div>

            {/* Main Heading */}
          <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            style={{
                fontSize: "clamp(2.5rem, 5vw, 3.8rem)", // Smaller heading
              fontWeight: "800",
                lineHeight: "1.1",
                color: colors.dark,
                marginBottom: "25px",
                background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
            }}
          >
              Why Choose <span style={{ color: colors.primary }}>Athena?</span>
          </motion.h1>

            {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            style={{
                fontSize: "clamp(1.1rem, 2.5vw, 1.2rem)", // Smaller font
                lineHeight: "1.5",
              color: colors.textLight,
                marginBottom: "35px",
                maxWidth: "500px"
            }}
          >
              Experience the future of learning with our cutting-edge platform designed to 
              deliver <strong>exceptional results</strong> through innovation and excellence.
          </motion.p>

            {/* Stats Grid (static) */}
        <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "25px",
                marginBottom: "40px"
              }}
            >
              {stats.map((stat, index) => (
                <div key={index} style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{
                      fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
                      fontWeight: 800,
                      color: stat.color,
                      marginBottom: 4
                    }}>
                      {stat.number}{stat.suffix}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: colors.textLight,
                      fontWeight: 600
                    }}>
                      {stat.label}
                    </div>
                  </div>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      background: stat.color,
                      borderRadius: "50%"
                    }} />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
              style={{ 
                display: "flex", 
                gap: "15px", // Reduced gap
                flexWrap: "wrap" 
              }}
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: `0 15px 30px ${colors.primary}30` 
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: colors.gradient,
                  color: colors.white,
                  padding: "15px 30px", // Smaller padding
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "15px", // Smaller font
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: `0 8px 25px ${colors.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                Start Free Trial
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(37, 99, 235, 0.1)" 
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "transparent",
                  color: colors.textDark,
                  padding: "15px 30px", // Smaller padding
                  borderRadius: "10px",
                  border: `2px solid ${colors.primary}30`,
                  fontSize: "15px", // Smaller font
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                Watch Demo
                <span style={{ fontSize: "16px" }}>▶</span> {/* Smaller icon */}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - Compact Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <FeatureShowcase />
                    </motion.div>
              </div>

        {/* Trust Badges Section Removed */}
      </div>

      {/* Animated curved divider */}
      <div style={{ 
        width: "100%", 
        marginTop: "auto",
        position: "relative",
        zIndex: 3
      }}>
        <svg style={{ display: "block", width: "100%", height: "100px" }} viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0V50C120 70 240 90 360 90C480 90 600 70 720 50C840 30 960 10 1080 10C1200 10 1320 30 1440 50V0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default WhyUsHero;