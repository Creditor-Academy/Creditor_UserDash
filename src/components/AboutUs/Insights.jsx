import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

// Icon components
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
  </svg>
);

const Globe2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
    <path d="M2 12h20"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"></path>
    <path d="M20 3v4"></path>
    <path d="M22 5h-4"></path>
    <path d="M4 17v2"></path>
    <path d="M5 18h-2"></path>
  </svg>
);

const values = [
  {
    title: "Excellence in Learning",
    description: "We deliver structured, adaptive, and accessible learning experiences that empower every student to reach their full potential.",
    icon: BookOpenIcon,
    color: ["#2563EB", "#06B6D4"],
    bgColor: ["#2563EB", "#06B6D4"],
  },
  {
    title: "Community & Support",
    description: "We foster a supportive community of learners, educators, and innovators who collaborate to create meaningful educational experiences.",
    icon: UsersIcon,
    color: ["#7C3AED", "#EC4899"],
    bgColor: ["#7C3AED", "#EC4899"],
  },
  {
    title: "Innovation & Growth",
    description: "We embrace creativity and cutting-edge technology to unlock better education outcomes and drive continuous improvement.",
    icon: LightbulbIcon,
    color: ["#F59E0B", "#F97316"],
    bgColor: ["#F59E0B", "#F97316"],
  },
  {
    title: "Global Reach",
    description: "We empower learners across borders with scalable digital solutions that break down barriers to quality education.",
    icon: Globe2Icon,
    color: ["#10B981", "#14B8A6"],
    bgColor: ["#10B981", "#14B8A6"],
  },
];

const ValuesSection = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [cols, setCols] = useState("1fr");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setCols("1fr 1fr 1fr 1fr");
      else if (window.innerWidth >= 768) setCols("1fr 1fr");
      else setCols("1fr");
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const containerVariants = { 
    hidden: {}, 
    visible: { 
      transition: { 
        staggerChildren: 0.15 
      } 
    } 
  };
  
  const itemVariants = { 
    hidden: { 
      opacity: 0, 
      y: 40 
    }, 
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    } 
  };

  return (
    <section style={{
      position: "relative",
      padding: "70px 20px",
      background: "linear-gradient(to bottom, #F8FAFC, rgba(59, 130, 246, 0.05))",
      overflow: "hidden",
    }}>
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.08)",
              width: `${Math.random() * 80 + 30}px`,
              height: `${Math.random() * 80 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 15 - 7.5],
              x: [0, Math.random() * 15 - 7.5],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <motion.div 
          ref={ref} 
          initial="hidden" 
          animate={controls} 
          variants={containerVariants} 
          style={{
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          <motion.div variants={itemVariants} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            color: "#1D4ED8",
            marginBottom: "16px",
            fontSize: "13px",
            fontWeight: 500,
          }}>
            <SparklesIcon />
            <span>Our Principles</span>
          </motion.div>
          
          <motion.h3 variants={itemVariants} style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}>
            Guiding <span style={{
              background: "linear-gradient(90deg, #2563EB, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Principles</span>
          </motion.h3>
          
          <motion.p variants={itemVariants} style={{
            fontSize: "16px",
            color: "#64748B",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            At Athena LMS, our core values shape every aspect of our platform, creating transformative learning experiences for everyone.
          </motion.p>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: "20px",
        }}>
          {values.map((value, idx) => {
            const Icon = value.icon;
            const isActive = activeCard === idx;
            
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                initial="hidden"
                animate={controls}
                whileHover={{ y: -6, scale: 1.02 }}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => setActiveCard(null)}
                style={{ 
                  cursor: "pointer", 
                  position: "relative",
                }}
              >
                <div style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: isActive 
                    ? "0 12px 30px rgba(30, 41, 59, 0.16)" 
                    : "0 6px 20px rgba(30, 41, 59, 0.08)",
                  transition: "all 0.3s ease",
                  background: "#ffffff",
                  height: "100%",
                }}>
                  {/* Gradient border effect */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${value.color[0]}, ${value.color[1]})`,
                    opacity: isActive ? 0.1 : 0,
                    transition: "opacity 0.3s ease",
                  }} />
                  
                  <div style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {/* Icon container */}
                    <div style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      marginBottom: "16px",
                      color: "#ffffff",
                      background: `linear-gradient(135deg, ${value.bgColor[0]}, ${value.bgColor[1]})`,
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <Icon />
                      
                      {/* Sparkle effect */}
                      <motion.div 
                        style={{
                          position: "absolute",
                          inset: 0,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            style={{
                              position: "absolute",
                              color: "#ffffff",
                              top: `${Math.random() * 60 + 20}%`,
                              left: `${Math.random() * 60 + 20}%`,
                            }}
                            animate={{
                              scale: [0, 1, 0],
                              rotate: [0, 180, 360],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                          >
                            <SparklesIcon />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    
                    <h3 style={{
                      fontSize: "17px",
                      fontWeight: 500,
                      color: "#0F172A",
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}>
                      {value.title}
                    </h3>
                    
                    <p style={{
                      color: "#64748B",
                      marginBottom: "16px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      flexGrow: 1,
                    }}>
                      {value.description}
                    </p>
                    
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      fontWeight: 300,
                      color: isActive ? "#2563EB" : "#94A3B8",
                      transition: "color 0.2s ease",
                    }}>
                      <span>Learn more</span>
                      <motion.div 
                        animate={{ x: isActive ? 4 : 0 }} 
                        transition={{ duration: 0.2 }}
                        style={{ marginLeft: "6px" }}
                      >
                        <ArrowRightIcon />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Connecting line animation between cards */}
                {isActive && idx < values.length - 1 && window.innerWidth >= 1024 && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "-10px",
                      width: "20px",
                      height: "3px",
                      background: `linear-gradient(90deg, ${value.color[0]}, ${value.color[1]})`,
                      borderRadius: "2px",
                      zIndex: 20,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: 20 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6, duration: 0.4 }} 
          style={{
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: "14px",
              color: "#ffffff",
              background: "linear-gradient(90deg, #2563EB, #06B6D4)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.3)";
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>
              Explore Our Platform
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesSection;
