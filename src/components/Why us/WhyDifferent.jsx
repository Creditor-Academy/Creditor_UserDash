import React, { useState } from "react";
import { motion } from "framer-motion";

const CoreDifferentiators = () => {
  const [activeCard, setActiveCard] = useState(null);
  const colors = {
    skyLight: "#E8F6FF",
    skyMedium: "#BEE8FF",
    skyDark: "#70C8FF",
    primary: "#1EA7FF",
    accent: "#FF7A59",
    white: "#FFFFFF",
    textDark: "#083044",
    textLight: "#5D6A75",
  };

  const pillars = [
    {
      title: "AI-Powered Content",
      shortDesc: "Generate lessons & quizzes in seconds",
      longDesc: "Our advanced AI creates engaging lessons, assessments, and summaries while maintaining educational quality.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke={colors.primary} strokeWidth="2"/>
          <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke={colors.primary} strokeWidth="2"/>
          <path d="M12 12L14.5 9.5" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 12L9.5 14.5" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: colors.primary,
      cardColor: "#F0F9FF", // Light blue
      features: ["Lesson generation", "Quiz creation", "Content summarization"]
    },
    {
      title: "Seamless Experience",
      shortDesc: "Intuitive for students & educators",
      longDesc: "Designed with both educators and learners in mind, our platform offers workflows that simplify complex tasks.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M2 12H22" stroke={colors.accent} strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 16H18" stroke={colors.accent} strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 8H20" stroke={colors.accent} strokeWidth="2" strokeLinecap="round"/>
          <rect x="2" y="2" width="20" height="20" rx="2" stroke={colors.accent} strokeWidth="2"/>
        </svg>
      ),
      color: colors.accent,
      cardColor: "#FFF0ED", // Light coral
      features: ["Intuitive navigation", "Role-based dashboards", "Mobile optimization"]
    },
    {
      title: "Scalable & Secure",
      shortDesc: "Cloud-ready, enterprise reliability",
      longDesc: "Built on robust cloud infrastructure that scales with your needs with enterprise-grade security and encryption.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={colors.textDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22V16" stroke={colors.textDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke={colors.textDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: colors.textDark,
      cardColor: "#E8EEF2", // Light gray-blue
      features: ["Cloud infrastructure", "Enterprise security", "Data encryption"]
    },
    {
      title: "Engagement Focused",
      shortDesc: "Gamified learning & progress tracking",
      longDesc: "Boost learner motivation with gamification elements, achievement badges, and interactive learning experiences.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#16A85C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.94 11C19.74 8.57 18.78 6.43 17.23 4.86C15.68 3.29 13.64 2.35 11.5 2.14" stroke="#16A85C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.06 11C12.26 13.43 13.22 15.57 14.77 17.14C16.32 18.71 18.36 19.65 20.5 19.86" stroke="#16A85C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.06 11C4.26 8.57 5.22 6.43 6.77 4.86C8.32 3.29 10.36 2.35 12.5 2.14" stroke="#16A85C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.94 11C11.74 13.43 10.78 15.57 9.23 17.14C7.68 18.71 5.64 19.65 3.5 19.86" stroke="#16A85C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#16A85C",
      cardColor: "#E8F6EF", // Light green
      features: ["Gamification", "Progress tracking", "Achievement badges"]
    }
  ];

  // Background shapes component
  const BackgroundShapes = () => {
    return (
      <>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.skyMedium}30, transparent 70%)`,
            filter: "blur(20px)",
            zIndex: 0
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            position: "absolute",
            bottom: "15%",
            left: "5%",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.skyDark}20, transparent 70%)`,
            filter: "blur(15px)",
            zIndex: 0
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            position: "absolute",
            top: "40%",
            left: "15%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primary}15, transparent 70%)`,
            filter: "blur(10px)",
            zIndex: 0
          }}
        />
      </>
    );
  };

  return (
    <div style={{
      width: "100%",
      background: `linear-gradient(135deg, ${colors.skyLight} 0%, ${colors.white} 100%)`,
      padding: "80px 0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background shapes */}
      <BackgroundShapes />
      
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 40px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: "center",
            marginBottom: "60px"
          }}
        >
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: "700",
            color: colors.textDark,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #083044 0%, #1EA7FF 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            What Makes Athena Different
          </h2>
          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: colors.textLight,
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6"
          }}>
            Discover why educators worldwide choose Athena for modern learning experiences
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "60px"
        }}>
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setActiveCard(index)}
              onHoverEnd={() => setActiveCard(null)}
              style={{
                background: pillar.cardColor,
                borderRadius: "16px",
                padding: "28px",
                boxShadow: activeCard === index 
                  ? `0 10px 30px ${pillar.color}20` 
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: `1px solid ${pillar.color}20`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Hover background effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${pillar.color}15, transparent 70%)`,
                opacity: activeCard === index ? 1 : 0,
                transition: "opacity 0.3s ease",
                zIndex: 0
              }} />
              
              {/* Content container */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Icon */}
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "14px",
                    background: `${pillar.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    border: `1px solid ${pillar.color}20`
                  }}
                >
                  {pillar.icon}
                </motion.div>
                
                {/* Title */}
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: "12px"
                }}>
                  {pillar.title}
                </h3>
                
                {/* Short Description */}
                <p style={{
                  fontSize: "0.95rem",
                  color: colors.textLight,
                  lineHeight: "1.5",
                  marginBottom: "20px"
                }}>
                  {pillar.shortDesc}
                </p>
                
                {/* Expanded Content on Hover */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: activeCard === index ? "auto" : 0,
                    opacity: activeCard === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: "hidden"
                  }}
                >
                  <p style={{
                    fontSize: "0.9rem",
                    color: colors.textLight,
                    lineHeight: "1.6",
                    marginBottom: "20px"
                  }}>
                    {pillar.longDesc}
                  </p>
                  
                  {/* Feature List */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "20px"
                  }}>
                    {pillar.features.map((feature, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: activeCard === index ? 1 : 0,
                          x: activeCard === index ? 0 : -10
                        }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.85rem",
                          color: colors.textDark
                        }}
                      >
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: `${pillar.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                          flexShrink: 0
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke={pillar.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Learn More Link */}
                  <motion.div 
                    whileHover={{ x: 5 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: pillar.color,
                      fontWeight: "500",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    Learn more
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "8px" }}>
                      <path d="M5 12H19" stroke={pillar.color} strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 5L19 12L12 19" stroke={pillar.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </motion.div>
                
                {/* Hover Indicator */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "3px",
                  background: `linear-gradient(90deg, ${pillar.color}, ${colors.skyDark})`,
                  transform: activeCard === index ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.3s ease"
                }} />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            textAlign: "center",
            padding: "40px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            border: `1px solid ${colors.skyLight}`,
            boxShadow: "0 8px 24px rgba(8, 48, 68, 0.1)"
          }}
        >
          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: colors.textDark,
            marginBottom: "16px"
          }}>
            Ready to Transform Your Learning Experience?
          </h3>
          <p style={{
            fontSize: "1rem",
            color: colors.textLight,
            marginBottom: "24px",
            maxWidth: "600px",
            margin: "0 auto 24px auto",
            lineHeight: "1.6"
          }}>
            Join thousands of educators already using Athena LMS to create engaging learning experiences.
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: `0 6px 20px ${colors.primary}40`
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, #0E8DE3 100%)`,
                color: colors.white,
                padding: "14px 28px",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: `0 4px 12px ${colors.primary}40`
              }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(30, 167, 255, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "transparent",
                color: colors.primary,
                padding: "14px 28px",
                borderRadius: "8px",
                border: `1px solid ${colors.primary}40`,
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
            >
              Schedule a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Global styles for hover effects */}
      <style>
        {`
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr))"] {
              grid-template-columns: 1fr;
            }
            
            div[style*="display: flex; justify-content: center; gap: 16px;"] {
              flex-direction: column;
              align-items: center;
            }
            
            button {
              width: 100%;
              max-width: 280px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CoreDifferentiators;