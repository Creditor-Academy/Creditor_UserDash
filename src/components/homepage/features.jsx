import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import AthenaDash from "../../assets/AthenaDash.png";
import capybilities1 from "../../assets/capybilities1.jpeg";
import capybilities2 from "../../assets/capybilities2.jpeg";
import capybilities3 from "../../assets/capybilities3.jpeg";
import capybilities4 from "../../assets/capybilities4.jpeg";
import capybilities5 from "../../assets/capybilities5.jpeg";
import chelengeBg from "../../assets/chelengeBg.jpeg";
import latest2 from "../../assets/latest2.jpeg";


// FEATURES DATA
const features = [
  {
    title: "Content Authoring & Learning Design Studio",
    desc: "Create, edit, and organize course content with advanced tools that empower educators to build engaging learning journeys.",
    image: capybilities1,
  },
  {
    title: "Collaborative Communities & Intelligent Communication Hub",
    desc: "Connect learners and instructors seamlessly with messaging, discussion forums, and collaborative study tools.",
    image: AthenaDash,
  },
  {
    title: "AI-Powered Content Personalization & Co-Creation",
    desc: "Leverage AI to tailor learning materials for each student and enable collaborative content creation.",
    image: capybilities2,
  },
  {
    title: "Comprehensive Learning Analytics & Actionable Insights",
    desc: "Gain deep understanding of learner progress and engagement with insightful dashboards and reports.",
    image: capybilities3,
  },
  {
    title: "All-in-One SaaS Ecosystem for Learning & Growth",
    desc: "Manage courses, users, payments, and more from a unified cloud-based platform.",
    image: capybilities4,
  },
  {
    title: "Interactive Assessments & Smart Evaluation Engine",
    desc: "Create dynamic quizzes and assignments with automated grading to boost learner success.",
    image: capybilities5,
  },
  {
    title: "Mobile Learning Support",
    desc: "Seamless learning across devices with offline access and responsive design.",
    image: chelengeBg,
  },
  {
    title: "Third-Party Integration",
    desc: "Connect your LMS to Zoom, Google Drive, and more, automating workflows for teachers and students.",
    image: latest2,
  },
];

export default function Features() {
  const [activeIdx, setActiveIdx] = useState(4);
  const ref = useRef(null);
  useInView(ref, { once: true, margin: "-20%" });

  // Card size variables
  const cardWidth = 120;
  const cardHeight = 140;
  const selectedScale = 1.14;
  const hoverScale = 1.09;

  const thumbVariants = {
    rest: { scale: 1 },
    hover: { scale: hoverScale },
    selected: { scale: selectedScale },
  };

  // Main styles
  const sectionStyle = {
    position: "relative",
    width: "100%",
    minHeight: "520px",
    boxShadow: "0 6px 32px rgba(80,120,210,0.07)",
    padding: "60px 20px 40px 20px",
    background: "linear-gradient(135deg,#8fd6ff 0%,#f7faff 75%)",
    overflow: "hidden",
    boxSizing: "border-box"
  };
  const svgStyle = {
    pointerEvents: "none",
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    opacity: 0.10, zIndex: 1
  };
  const headerStyle = {
    position: "relative",
    zIndex: 5,
    textAlign: "center",
    marginBottom: 14,
    marginTop: 16,
  };
  const badgeStyle = {
    display: "inline-block",
    padding: "3px 14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#4833d4",
    background: "#ebebff",
    borderRadius: "16px",
    letterSpacing: "0.04em"
  };
  const titleStyle = {
    fontSize: "2.13rem",
    fontWeight: 700,
    color: "#17183a",
    margin: "8px 0 0 0",
    letterSpacing: "-1px",
    lineHeight: 1.13,
    display: "block"
  };
  const underlineStyle = {
    width: "82px",
    height: "6px",
    background: "#5956e9",
    margin: "12px auto 0 auto",
    borderRadius: "8px",
  };
  const subtitleStyle = {
    fontSize: "1.19rem",
    fontWeight: 600,
    color: "#363d51",
    margin: "19px 0 7px 0"
  };
  const descStyle = {
    color: "#565779",
    fontSize: "1.05rem",
    lineHeight: 1.52
  };
  const flexWrapStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "26px",
    justifyContent: "center",
    alignItems: "flex-start"
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(4, ${cardWidth}px)`,
    gap: "12px",
    marginBottom: "30px",
  };
  const thumbButton = (selected) => ({
    width: cardWidth,
    height: cardHeight,
    borderRadius: "22px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.18s cubic-bezier(.29,1.13,.8,1)",
    border: selected ? "2.7px solid #4F46E5" : "none",
    boxShadow: selected
      ? "0 8px 28px rgba(88,115,255,0.16)"
      : "0 2px 12px rgba(70,110,185,0.06)",
    filter: selected ? "brightness(1.02)" : "none",
    background: "transparent",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  });
  const thumbImageStyle = {
    width: "96px",
    height: "106px",
    objectFit: "cover",
    borderRadius: "14px",
    display: "block",
  };
  const featuresButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 700,
    fontSize: "1.25rem",
    background: "#574ff2",
    color: "#fff",
    borderRadius: "14px",
    padding: "17px 42px",
    textDecoration: "none",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 24px rgba(87,77,242,0.09)"
  };
  const rightPanelStyle = {
    flex: 1,
    minWidth: 420,
    borderRadius: "28px",
    background: "linear-gradient(135deg,rgba(127,177,255,0.13) 0%,rgba(255,255,255,0.82) 80%)",
    boxShadow: "0 8px 36px rgba(58,82,180,0.06)",
    padding: "44px 40px",
    display: "flex",
    alignItems: "center",
    gap: "40px",
    marginLeft: 24,
    marginTop: 3,
    maxWidth: "680px"
  };
  const squareImageWrap = {
    minWidth: 180,
    maxWidth: 200,
    aspectRatio: "1 / 1",
    borderRadius: "19px",
    overflow: "hidden",
    marginRight: 36,
    background: "linear-gradient(135deg,#f7fcff 0 63%,rgba(139,214,255,0.08) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
  const mainImage = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "16px"
  };
  const rightTitle = {
    fontWeight: 700,
    fontSize: "1.6rem",
    color: "#11153c",
    marginBottom: 14
  };
  const rightDesc = {
    fontSize: "1.15rem",
    color: "#222855",
    marginBottom: 26,
    lineHeight: 1.55
  };
  const dotRow = {
    display: "flex",
    alignItems: "center",
    marginTop: 4
  };
  const dot = (selected) => ({
    width: 16,
    height: 16,
    marginRight: 7,
    borderRadius: "50%",
    background: selected ? "#574ff2" : "#c9cedd",
    opacity: selected ? 1 : 0.41,
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s"
  });
  const indexLabel = {
    fontSize: "1.05rem",
    marginLeft: 13,
    color: "#6c7287"
  };

  return (
    <section ref={ref} style={sectionStyle}>
      {/* SVG Wave */}
      <svg style={svgStyle} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path fill="#b6d4fe" fillOpacity="0.28"
          d="M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,117.3C672,139,768,149,864,138.7C960,128,1056,96,1152,80C1248,64,1344,64,1392,64L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>

      {/* Header */}
      <div style={headerStyle}>
        <span style={badgeStyle}>POWERFUL CAPABILITIES</span>
        <h2 style={titleStyle}>
          Transformative Learning <span style={{ color: "#5956e9" }}>Experiences</span>
        </h2>
        <div style={underlineStyle}></div>
        <div style={subtitleStyle}>All-in-One SaaS Ecosystem for Learning & Growth</div>
        <div style={descStyle}>
          Next-generation LMS capabilities designed to <span style={{ color: "#5956e9", fontWeight: 600 }}>engage</span> learners,&nbsp;
          <span style={{ color: "#5956e9", fontWeight: 600 }}>empower</span> educators, and&nbsp;
          <span style={{ color: "#5956e9", fontWeight: 600 }}>analyze</span> outcomes.
        </div>
      </div>

      {/* Layout */}
      <div style={flexWrapStyle}>
        {/* Thumbnails */}
        <div style={{ flex: "0 0 auto", maxWidth: "600px", minWidth: "450px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={gridStyle}>
            {features.map((feature, idx) => (
              <motion.button
                key={feature.title}
                style={thumbButton(idx === activeIdx)}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                aria-label={`View ${feature.title}`}
                whileHover={idx === activeIdx ? "selected" : "hover"}
                animate={idx === activeIdx ? "selected" : "rest"}
                variants={thumbVariants}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                <img src={feature.image} alt={feature.title} style={thumbImageStyle} />
              </motion.button>
            ))}
          </div>
          <a href="#" style={featuresButtonStyle}>
            Explore All Features
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" style={{ marginLeft: 8 }}>
              <path fill="#fff" fillRule="evenodd" d="M8.58 13.087a.83.83 0 0 1-1.174-1.174l3.455-3.456H6.332a.83.83 0 0 1 0-1.66h7.222a.83.83 0 0 1 .83.83v7.222a.83.83 0 1 1-1.66 0v-4.53l-3.454 3.456Z" clipRule="evenodd"/></svg>
          </a>
        </div>
        {/* Right feature "card" */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            style={rightPanelStyle}
            initial={{ opacity: 0, x: 32, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.985 }}
            transition={{ duration: 0.37, type: "spring" }}
          >
            <motion.div
              style={squareImageWrap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.43 }}
            >
              <img
                src={features[activeIdx].image}
                alt={features[activeIdx].title}
                style={mainImage}
              />
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={rightTitle}>{features[activeIdx].title}</div>
              <div style={rightDesc}>{features[activeIdx].desc}</div>
              <div style={dotRow}>
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    style={dot(idx === activeIdx)}
                    aria-label={`View feature ${idx + 1}`}
                    onClick={() => setActiveIdx(idx)}
                  ></button>
                ))}
                <span style={indexLabel}>{activeIdx + 1} of {features.length}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
