import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaPlay, FaSync, FaPalette, FaExpand, FaCrown, FaChevronRight, FaStar, FaBolt, FaShieldAlt } from "react-icons/fa";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 60, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15,
      duration: 0.7
    } 
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 25px 50px rgba(2, 132, 199, 0.15)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

const LearningSection = () => {
  const [activeCard, setActiveCard] = useState(null);

  const features = [
    {
      icon: FaRobot,
      title: "AI at the Core",
      description: "Automate lesson creation, quizzes, and summaries. Build courses in minutes.",
      gradient: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
      bgColor: "rgba(2, 132, 199, 0.06)"
    },
    {
      icon: FaPlay,
      title: "Interactive First",
      description: "Hotspots, flashcards, and gamified assessments that make learning stick.",
      gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
      bgColor: "rgba(3, 105, 161, 0.06)"
    },
    {
      icon: FaSync,
      title: "All-in-One",
      description: "Course authoring, design, media, and analytics in one platform.",
      gradient: "linear-gradient(135deg, #075985 0%, #0369a1 100%)",
      bgColor: "rgba(7, 89, 133, 0.06)"
    },
    {
      icon: FaPalette,
      title: "Beautiful Design",
      description: "AI-powered design tools with stunning visuals that inspire learning.",
      gradient: "linear-gradient(135deg, #0c4a6e 0%, #075985 100%)",
      bgColor: "rgba(12, 74, 110, 0.06)"
    },
    {
      icon: FaExpand,
      title: "Built for Scale",
      description: "From coaches to universities. Unlimited learners and courses.",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
      bgColor: "rgba(30, 58, 138, 0.06)"
    },
    {
      icon: FaCrown,
      title: "Future Ready",
      description: "Transforming how institutions create learning experiences.",
      gradient: "linear-gradient(135deg, #3730a3 0%, #4338ca 100%)",
      bgColor: "rgba(55, 48, 163, 0.06)"
    }
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className="learning-section"
      style={styles.container}
    >
      {/* Light Background with Subtle Patterns */}
      <div style={styles.backgroundOverlay}>
        <div style={styles.lightPattern1}></div>
        <div style={styles.lightPattern2}></div>
        <div style={styles.gradientOverlay}></div>
      </div>

      {/* Floating Elements */}
      <div style={styles.floatingElements}>
            <motion.div
          style={styles.floatingShape1}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 3, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
            <motion.div
          style={styles.floatingShape2}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
              </div>

      {/* Wow Factor Heading */}
      <motion.div variants={itemVariants} style={styles.headingContainer}>
            <motion.div
          style={styles.premiumBadge}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div style={styles.badgeIcon}>🚀</div>
          The Athena Advantage
            </motion.div>

        <motion.h1 
          style={styles.mainHeading}
          initial="hidden"
          whileInView="visible"
          variants={headingVariants}
        >
          <motion.span variants={lineVariants} style={styles.headingLine}>
            Why Traditional LMS Platforms
          </motion.span>
          <motion.span variants={lineVariants} style={styles.headingLine}>
            <span style={styles.highlightText}>Can't Keep Up</span> With Innovation
          </motion.span>
        </motion.h1>

        <motion.p 
          style={styles.subHeading}
          initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          While others are stuck in the past, we're building the future of learning. 
          Experience the difference that <span style={styles.accentText}>next-generation technology</span> makes.
        </motion.p>

        {/* Animated Decorative Line */}
      <motion.div 
          style={styles.decorationLine}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        />
        </motion.div>

      {/* Compact Features Grid */}
      <motion.div variants={itemVariants} style={styles.featuresContainer}>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
          <motion.div
              key={feature.title}
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            whileHover="hover"
              onHoverStart={() => setActiveCard(index)}
              onHoverEnd={() => setActiveCard(null)}
            viewport={{ once: true }}
            style={{
                ...styles.featureCard,
                background: feature.bgColor,
                border: `1px solid ${feature.bgColor.replace('0.06', '0.15')}`,
                transform: activeCard !== null && activeCard !== index ? "scale(0.98)" : "scale(1)",
                opacity: activeCard !== null && activeCard !== index ? 0.9 : 1,
              }}
            >
              {/* Animated Icon */}
          <motion.div
                style={styles.iconContainer}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
          >
            <div style={{
                  ...styles.iconWrapper,
                  background: feature.gradient,
                  boxShadow: `0 6px 20px ${feature.gradient.split(',')[1].trim().replace('0%)', '0.2)')}`
                }}>
                  <feature.icon style={styles.icon} />
            </div>
          </motion.div>
          
              {/* Content */}
              <div style={styles.cardContent}>
                <motion.h3 
                  style={styles.cardTitle}
                  whileHover={{ color: feature.gradient.split(',')[1].trim().replace('0%)', '') }}
                >
                  {feature.title}
                </motion.h3>
                <p style={styles.cardDescription}>{feature.description}</p>
        </div>

              {/* Hover Indicator */}
              <motion.div
                style={styles.hoverIndicator}
                animate={{ 
                  scale: activeCard === index ? 1 : 0,
                  opacity: activeCard === index ? 1 : 0
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 1200px) {
          .learning-section {
            padding: 80px 30px !important;
          }
          
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
          }
          
          .main-heading {
            font-size: 2.8rem !important;
          }
        }
        
          @media (max-width: 768px) {
            .learning-section {
            padding: 60px 20px !important;
              min-height: auto !important;
            }
            
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .feature-card {
            padding: 25px 20px !important;
            min-height: 180px !important;
          }
          
          .main-heading {
            font-size: 2.2rem !important;
          }
          
          .sub-heading {
            font-size: 1.1rem !important;
          }
        }
        
          @media (max-width: 480px) {
            .learning-section {
            padding: 50px 15px !important;
          }
          
          .feature-card {
            padding: 20px 15px !important;
            min-height: 160px !important;
          }
          
          .icon-wrapper {
            width: 45px !important;
            height: 45px !important;
          }
          
          .card-title {
            font-size: 1.1rem !important;
          }
          
          .card-description {
            font-size: 0.85rem !important;
          }
          
          .main-heading {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </motion.section>
  );
};

// Heading Animation Variants
const headingVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const lineVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
      duration: 0.8
    }
  }
};

const styles = {
  container: {
    padding: "100px 40px",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  },
  lightPattern1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230284c7' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    opacity: 0.3
  },
  lightPattern2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.03) 0px, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(2, 132, 199, 0.02) 0px, transparent 50%)`
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      rgba(248, 250, 252, 0.8) 0%, 
      rgba(241, 245, 249, 0.9) 50%,
      rgba(226, 232, 240, 0.7) 100%)`
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2
  },
  floatingShape1: {
    position: "absolute",
    top: "15%",
    left: "10%",
    width: "100px",
    height: "100px",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(15px)"
  },
  floatingShape2: {
    position: "absolute",
    top: "70%",
    right: "15%",
    width: "80px",
    height: "80px",
    background: "radial-gradient(circle, rgba(2, 132, 199, 0.04) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(12px)"
  },
  headingContainer: {
    textAlign: "center",
    marginBottom: "80px",
    position: "relative",
    zIndex: 3,
    maxWidth: "900px"
  },
  premiumBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 28px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(2, 132, 199, 0.15)",
    borderRadius: "25px",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0369a1",
    backdropFilter: "blur(20px)",
    boxShadow: "0 10px 30px rgba(2, 132, 199, 0.1)",
    marginBottom: "40px"
  },
  badgeIcon: {
    fontSize: "1.3rem"
  },
  mainHeading: {
    fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    margin: "0 0 25px 0",
    fontFamily: "'Inter', sans-serif",
    minHeight: "2.4em"
  },
  headingLine: {
    display: "block",
    marginBottom: "10px"
  },
  highlightText: {
    background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subHeading: {
    fontSize: "clamp(1.2rem, 2.5vw, 1.4rem)",
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 400,
    margin: "0 auto",
    maxWidth: "600px"
  },
  accentText: {
    color: "#0284c7",
    fontWeight: 600
  },
  decorationLine: {
    width: "120px",
    height: "3px",
    background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
    margin: "40px auto 0 auto",
    borderRadius: "2px",
    transformOrigin: "center"
  },
  featuresContainer: {
    position: "relative",
    zIndex: 3,
    width: "100%",
    maxWidth: "1100px"
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "25px",
    width: "100%"
  },
  featureCard: {
    padding: "30px 25px",
    borderRadius: "20px",
    backdropFilter: "blur(15px)",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    background: "rgba(255, 255, 255, 0.4)"
  },
  iconContainer: {
    marginBottom: "20px"
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: "15px"
  },
  icon: {
    fontSize: "1.5rem"
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 12px 0",
    lineHeight: 1.3,
    transition: "color 0.3s ease"
  },
  cardDescription: {
    fontSize: "0.95rem",
    color: "#475569",
    lineHeight: 1.5,
    margin: 0,
    fontWeight: 400
  },
  hoverIndicator: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    height: "3px",
    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
    borderRadius: "0 0 20px 20px"
  }
};

export default LearningSection;