import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail, Users, Award, Lightbulb } from "lucide-react";
import paul from "../../assets/Paul.jpeg";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const AnimatedMarquee = ({ title = "" }) => (
  <div style={{
    overflow: "hidden",
    width: "100%",
    padding: "15px 0",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    marginBottom: "3rem",
    position: "relative",
  }}>
    <motion.div
      style={{ display: "inline-block", whiteSpace: "nowrap", minWidth: "100%" }}
      animate={{ x: [0, -400] }}
      transition={{ repeat: Infinity, duration: 15, ease: "linear" }}>
      <span style={{
        fontFamily: "Inter, sans-serif",
        textTransform: "uppercase",
        color: "#fff",
        fontWeight: 700,
        fontSize: "clamp(24px, 5vw, 42px)",
        letterSpacing: "2px",
        paddingRight: "50px",
        display: "inline-block",
        textShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}>{title}</span>
      <span style={{
        fontFamily: "Inter, sans-serif",
        textTransform: "uppercase",
        color: "#fff",
        fontWeight: 700,
        fontSize: "clamp(24px, 5vw, 42px)",
        letterSpacing: "2px",
        paddingRight: "50px",
        display: "inline-block",
        textShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}>{title}</span>
    </motion.div>
  </div>
);

const teamMembers = [
  {
    id: 1,
    name: " Mr. PaulMichael Rowland",
    role: "Co-Founder & CEO",
    image: paul,
    bio: "Visionary leader with over 15 years of experience in educational technology. Passionate about creating learning solutions that transform lives and bridge the gap between traditional and digital education.",
    expertise: ["Educational Technology", "Strategic Planning", "Team Leadership"],
    social: {
      linkedin: "https://www.linkedin.com/in/paulmichael-rowland-266343223",
      twitter: "#",
      email: "#"
    },
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "Mr. Javed",
    role: "Co-Founder & CTO",
    image: paul,
    bio: "Education specialist with 25 years of experience, including 8 years in e-learning and content writing. Expert in designing engaging learning experiences that captivate and educate.",
    expertise: ["E-Learning Design", "Content Strategy", "Educational Psychology"],
    social: {
      linkedin: "#",
      twitter: "#",
      email: "#"
    },
    gradient: "from-emerald-500 to-teal-500"
  },
];

const Team = () => {
  const [activeMember, setActiveMember] = useState(0);
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  const nextMember = () => setActiveMember((prev) => (prev + 1) % teamMembers.length);
  const prevMember = () => setActiveMember((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);

  return (
    <section style={{
      width: "100%",
      minHeight: "80vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      padding: isMobile ? "2rem 1rem" : "3rem 2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      overflowX: "hidden",
      position: "relative",
    }}>
      <AnimatedMarquee title="Meet Our Visionary Leaders" />
      
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}>
        

        {/* Enhanced Team Card Slider */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            width: "100%",
            maxWidth: "800px",
            position: "relative",
          }}>
          
          {/* Main Team Card */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1.5rem",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease",
          }}>
            
            {/* Gradient Overlay */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${teamMembers[activeMember].gradient === "from-blue-500 to-cyan-500" ? "#3b82f6, #06b6d4" : "#10b981, #14b8a6"})`,
              borderRadius: "1.5rem 1.5rem 0 0",
            }} />
            
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
              gap: "2rem",
              alignItems: isMobile ? "center" : "flex-start",
          }}>
              
              {/* Profile Image */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
                flexShrink: 0,
                gap: "1rem",
            }}>
              <div style={{
                  width: isMobile ? "100px" : "120px",
                  height: isMobile ? "100px" : "120px",
                  borderRadius: "50%",
                overflow: "hidden",
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
              }}>
                <img
                  src={teamMembers[activeMember].image}
                  alt={teamMembers[activeMember].name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
                
                {/* Role Badge */}
              <div style={{
                  background: `linear-gradient(135deg, ${teamMembers[activeMember].gradient === "from-blue-500 to-cyan-500" ? "#3b82f6, #06b6d4" : "#10b981, #14b8a6"})`,
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "1rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                  textAlign: "center",
                }}>
                  {teamMembers[activeMember].role}
              </div>
            </div>

              {/* Content */}
            <div style={{
              flex: 1,
                textAlign: isMobile ? "center" : "left",
              }}>
                <h3 style={{
                  fontSize: isMobile ? "1.5rem" : "1.75rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.025em",
              }}>
                {teamMembers[activeMember].name}
                </h3>
                
              <p style={{
                  fontSize: "0.95rem",
                  color: "#cbd5e1",
                  lineHeight: "1.6",
                  marginBottom: "1.25rem",
              }}>
                {teamMembers[activeMember].bio}
              </p>

                {/* Expertise Tags */}
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}>
                  {teamMembers[activeMember].expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#e2e8f0",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
              <div style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}>
                  {[
                    { icon: Linkedin, href: teamMembers[activeMember].social.linkedin, color: "#0077b5" },
                    { icon: Twitter, href: teamMembers[activeMember].social.twitter, color: "#1da1f2" },
                    { icon: Mail, href: teamMembers[activeMember].social.email, color: "#ea4335" }
                  ].map((social, socialIndex) => (
                    <a
                      key={socialIndex}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        color: social.color,
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "scale(1)";
                      }}>
                      <social.icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "2rem",
            padding: "0 1rem",
          }}>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={prevMember}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </motion.button>

            {/* Member Indicators */}
            <div style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}>
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveMember(index)}
                style={{
                    width: index === activeMember ? '12px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                    backgroundColor: index === activeMember ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={nextMember}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
