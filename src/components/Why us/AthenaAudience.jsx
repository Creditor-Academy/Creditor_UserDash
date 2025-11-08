import React, { useState } from "react";
import school from "../../assets/school.webp";
import trainer from "../../assets/trainer.webp";
import  business from "../../assets/business.webp";
import { motion } from "framer-motion";

const AthenaAudience = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const palette = {
    bgStart: "#F0F7FF",
    bgEnd: "#E6F0FE",
    ink: "#0F172A",
    mut: "#475569",
    blueMain: "#014f86", // Updated to your requested color
  };

  const Icons = {
    Educators: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 7l10-4 10 4-10 4L2 7Z"
          stroke={palette.blueMain}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 10v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4"
          stroke={palette.blueMain}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    Coaches: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="3"
          stroke={palette.blueMain}
          strokeWidth="1.8"
        />
        <path
          d="M7 10h10M7 14h6"
          stroke={palette.blueMain}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    Enterprise: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="7"
          height="18"
          rx="1.5"
          stroke={palette.blueMain}
          strokeWidth="1.8"
        />
        <rect
          x="14"
          y="7"
          width="7"
          height="14"
          rx="1.5"
          stroke={palette.blueMain}
          strokeWidth="1.8"
        />
        <path
          d="M6.5 7.5v.01M6.5 11v.01M6.5 14.5v.01M17.5 10.5v.01M17.5 14v.01"
          stroke={palette.blueMain}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  const audienceData = [
    {
      key: "Educators",
      title: "For Educators & Schools",
      features: [
        "Simplify online learning with ready-to-use lesson templates",
        "Engage students with interactive activities that go beyond slides",
        "Automate grading and progress tracking",
      ],
      image: school,
    },
    {
      key: "Coaches",
      title: "For Trainers & Coaches",
      features: [
        "Turn expertise into polished, professional courses",
        "Sell and scale your programs with built-in learner management",
        "Save time with AI-driven content creation",
      ],
      image: trainer,
    },
    {
      key: "Enterprise",
      title: "For Businesses & Enterprises",
      features: [
        "Deliver compliance, onboarding, and upskilling at scale",
        "Monitor workforce progress with detailed analytics",
        "Customize courses to match your brand and culture",
      ],
        image: business,
    },
  ];

  const active = audienceData[activeCategory];

  return (
    <div
      style={{
        width: "100%",
        background: `linear-gradient(135deg, ${palette.bgStart} 0%, ${palette.bgEnd} 100%)`,
        padding: "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Accent */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            filter: "blur(70px)",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.15), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-12%",
            left: "-6%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            filter: "blur(70px)",
            background:
              "radial-gradient(circle, rgba(30,58,138,0.12), transparent 60%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: 50 }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: palette.ink,
              margin: 0,
            }}
          >
            How Athena Helps You
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: palette.mut,
              margin: "12px auto 0 auto",
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            Tailored solutions for educators, coaches, and enterprise learning —
            designed to fit your workflow.
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            marginBottom: 36,
            flexWrap: "wrap",
          }}
        >
          {audienceData.map((category, index) => {
            const isActive = activeCategory === index;
            return (
              <motion.button
                key={category.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(index)}
                style={{
                  padding: "12px 22px",
                  borderRadius: 9999,
                  border: "1px solid rgba(15,23,42,0.06)",
                  background: isActive ? "white" : "rgba(255,255,255,0.7)",
                  color: isActive ? palette.ink : palette.mut,
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  boxShadow: isActive
                    ? `0 10px 28px ${category.color}22`
                    : "0 6px 18px rgba(15,23,42,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {Icons[category.key]}
                <span>{category.title.split("&")[0].trim()}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Content Display */}
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: 22,
            padding: 32,
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: `1px solid ${palette.blueMain}22`,
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 26,
              alignItems: "stretch",
            }}
          >
            {/* Feature List */}
            <div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: palette.blueMain,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {Icons[active.key]} {active.title}
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginTop: 18,
                }}
              >
                {active.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px 14px",
                      borderRadius: 12,
                      background: `${palette.blueMain}0D`,
                      borderLeft: `4px solid ${palette.blueMain}`,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: palette.blueMain,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span
                      style={{
                        color: "#334155",
                        lineHeight: 1.6,
                        fontSize: "1.02rem",
                      }}
                    >
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Visual Panel with Image + Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "relative",
                borderRadius: 18,
                minHeight: 280,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Background Image */}
              <img
                src={active.image}
                alt={active.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
              />
              {/* Blue Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(1,79,134,0.35)",
                }}
              />
              {/* Content */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  textAlign: "center",
                  color: "white",
                  padding: 20,
                  transform: "translateY(10px)",
                }}
              >
                
                <h4
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    margin: "0 0 10px 0",
                  }}
                >
                  Transform Your Approach
                </h4>
                <p style={{ margin: 0, marginTop: 6, opacity: 0.92, lineHeight: 1.6 }}>
                  Join thousands of professionals modernizing their learning
                  programs with Athena.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AthenaAudience;
