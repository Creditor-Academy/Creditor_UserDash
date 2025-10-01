import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail, ArrowRight, ArrowLeft } from "lucide-react";
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

const SimpleMarquee = ({ title = "" }) => (
  <div style={{
    overflow: "hidden",
    width: "100%",
    padding: "10px 0",
    backgroundColor: "#004687",
    marginBottom: 18,
  }}>
    <motion.div
      style={{ display: "inline-block", whiteSpace: "nowrap", minWidth: "100%" }}
      animate={{ x: [0, -400] }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}>
      <span style={{
        fontFamily: "Arial, sans-serif",
        textTransform: "uppercase",
        color: "#fff",
        fontWeight: 600,
        fontSize: "clamp(19px, 6vw, 35px)",
        letterSpacing: "0.5px",
        paddingRight: "35px",
        display: "inline-block",
      }}>{title}</span>
      <span style={{
        fontFamily: "Arial, sans-serif",
        textTransform: "uppercase",
        color: "#fff",
        fontWeight: 600,
        fontSize: "clamp(19px, 6vw, 35px)",
        letterSpacing: "0.5px",
        paddingRight: "35px",
        display: "inline-block",
      }}>{title}</span>
    </motion.div>
  </div>
);

const teamMembers = [
  {
    id: 1,
    name: "PaulMichael Rowland",
    role: "Co-Founder",
    image: paul,
    bio: "Visionary leader with over 15 years of experience in educational technology. Passionate about creating learning solutions that transform lives.",
    social: {
      linkedin: "https://www.linkedin.com/in/paulmichael-rowland-266343223",
      twitter: "#",
      email: "#"
    }
  },
  {
    id: 2,
    name: "Javed",
    role: "Co-Founder",
    image: paul,
    bio: "Education specialist with 25 years of experience, including 8 years in e-learning and content writing. Expert in designing engaging learning experiences.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "#"
    }
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

  // Styles
  const sectionPad = isMobile ? "8px 0 36px" : "20px 0 56px";
  const cardMaxWidth = isMobile ? 340 : 800;
  const imageSize = isMobile ? 110 : 170;
  const h2Size = isMobile ? "18px" : "clamp(23px, 4vw, 32px)";
  const cardInnerPad = isMobile ? "14px 8px" : "26px 25px";

  return (
    <section style={{
      width: "100%",
      minHeight: 0,
      background: "#003B73",
      padding: sectionPad,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      overflowX: "hidden",
    }}>
      <SimpleMarquee title="Meet Core Team of Athena " />
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: cardMaxWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06))",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "13px",
            boxShadow: "0 3px 17px rgba(0,0,0,0.13)",
            padding: cardInnerPad,
            maxWidth: cardMaxWidth,
            margin: "0 auto",
            boxSizing: "border-box"
          }}>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "10px" : "22px",
            alignItems: isMobile ? "center" : "stretch",
            width: "100%",
          }}>
            {/* Left image + socials */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "7px" : "16px",
              alignItems: "center",
              minWidth: imageSize,
              width: isMobile ? "100%" : imageSize,
            }}>
              <div style={{
                width: imageSize,
                height: imageSize,
                borderRadius: "10px",
                overflow: "hidden",
                background: "#0b4875",
                boxShadow: "0 2px 10px rgba(0,0,0,0.10) inset",
                maxWidth: "100%",
              }}>
                <img
                  src={teamMembers[activeMember].image}
                  alt={teamMembers[activeMember].name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    margin: 0,
                  }}
                />
              </div>
              {/* Socials */}
              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: 3,
                width: "100%",
              }}>
                <motion.a whileHover={{ scale: 1.09 }} href={teamMembers[activeMember].social.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.13)", color: "#fff", textDecoration: "none",
                }}>
                  <Linkedin size={14} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.09 }} href={teamMembers[activeMember].social.twitter} style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.13)", color: "#fff", textDecoration: "none",
                }}>
                  <Twitter size={14} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.09 }} href={`mailto:${teamMembers[activeMember].social.email}`} style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.13)", color: "#fff", textDecoration: "none",
                }}>
                  <Mail size={14} />
                </motion.a>
              </div>
            </div>

            {/* Right content */}
            <div style={{
              flex: 1,
              color: '#E6F4FF',
              marginTop: isMobile ? "9px" : "0",
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
              minWidth: 0,
              width: "100%",
            }}>
              <div style={{
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "rgba(103, 232, 249, 0.22)",
                color: "#67e8f9",
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                marginBottom: "4px",
                textAlign: "center"
              }}>
                {teamMembers[activeMember].role}
              </div>
              <h2 style={{
                fontSize: h2Size,
                fontWeight: 800,
                letterSpacing: ".5px",
                color: "#fff",
                margin: isMobile ? "4px 0 7px" : "6px 0 14px",
                textTransform: "uppercase",
                textAlign: "center"
              }}>
                {teamMembers[activeMember].name}
              </h2>
              <p style={{
                fontSize: isMobile ? "13px" : "15px",
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.91)',
                marginBottom: isMobile ? "9px" : "15px",
                maxWidth: 400,
                textAlign: "center",
                wordBreak: "break-word"
              }}>
                {teamMembers[activeMember].bio}
              </p>
              {/* Pager controls */}
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <motion.button whileHover={{ scale: 1.09 }} whileTap={{ scale: 0.96 }} onClick={prevMember} style={{
                  width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.14)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                  <ArrowLeft size={12} />
                </motion.button>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: isMobile ? "12px" : "14px" }}>{activeMember + 1} / {teamMembers.length}</span>
                <motion.button whileHover={{ scale: 1.09 }} whileTap={{ scale: 0.96 }} onClick={nextMember} style={{
                  width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.14)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                  <ArrowRight size={12} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Dot indicators */}
        {teamMembers.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", gap: "7px" }}>
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveMember(index)}
                style={{
                  width: index === activeMember ? '15px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: index === activeMember ? '#67e8f9' : 'rgba(255,255,255,0.33)',
                  transition: 'all 0.22s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
