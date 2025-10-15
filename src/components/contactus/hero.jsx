import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import contacthero from "../../assets/contacthhero.jpg";

export default function Hero() {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowImage(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="hero-section">
      <style>{`
        .hero-section {
          width: 100%;
          min-height: 90vh;
          padding: 12vh 4vw 8vh 4vw;
          background: linear-gradient(to bottom, #e6f2ff 0%, #f0f7ff 50%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Decorative background elements */
        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -15%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 25s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.1); }
        }

        .hero-row {
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .hero-main-row {
          display: flex;
          align-items: baseline;
          gap: 20px;
          position: relative;
          margin-bottom: 8px;
        }

        .hero-img-container {
          width: 180px;
          height: 140px;
          position: relative;
          flex-shrink: 0;
          transition: transform 0.4s ease;
        }

        .hero-img-container:hover {
          transform: translateY(-5px) rotate(2deg);
        }

        .hero-img {
          border-radius: 12px;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: block;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        /* Glow effect on image */
        .hero-img-container::after {
          content: '';
          position: absolute;
          inset: -10px;
          background: linear-gradient(45deg, #38bdf8, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 12px;
          z-index: -1;
          opacity: 0;
          filter: blur(20px);
          transition: opacity 0.4s ease;
        }

        .hero-img-container:hover::after {
          opacity: 0.5;
        }

        .hero-heading {
          font-family: 'Founders Grotesk', Arial, sans-serif;
          font-size: clamp(60px, 7.5vw, 140px);
          font-weight: 600;
          color: #0c4a6e;
          text-transform: uppercase;
          letter-spacing: -2px;
          line-height: 1;
          margin: 0;
          white-space: nowrap;
          background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.8s ease-out 0.1s both;
        }

        .hero-subheading {
          font-family: 'Founders Grotesk', Arial, sans-serif;
          font-size: clamp(60px, 7.5vw, 140px);
          font-weight: 600;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: -2px;
          line-height: 1.08;
          margin: 0;
          max-width: 1200px;
          white-space: nowrap;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-decorative-line {
          width: 120px;
          height: 5px;
          background: linear-gradient(90deg, #38bdf8, #3b82f6);
          border-radius: 10px;
          margin: 2rem 0 2.5rem 0;
          animation: expandWidth 1s ease-out 0.6s both;
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.4);
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 120px;
          }
        }

        .hero-form-label {
          font-family: 'Neue Montreal', Arial, sans-serif;
          font-size: 1.1rem;
          color: #475569;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.9;
          animation: fadeIn 1s ease-out 0.7s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.9;
          }
        }

        .hero-arrow-icon {
          display: inline-block;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 1200px) {
          .hero-section {
            padding: 11vh 3vw 7vh 3vw;
          }
          .hero-img-container {
            width: 160px;
            height: 120px;
          }
          .hero-decorative-line {
            width: 100px;
          }
        }

        @media (max-width: 900px) {
          .hero-section {
            padding: 10vh 3vw 6vh 3vw;
          }
          .hero-img-container {
            width: 140px;
            height: 105px;
          }
          .hero-main-row {
            gap: 15px;
          }
          .hero-decorative-line {
            width: 80px;
            height: 4px;
            margin: 1.5rem 0 2rem 0;
          }
        }

        @media (max-width: 600px) {
          .hero-section {
            min-height: 85vh;
            padding: 10vh 5vw 5vh 5vw;
          }
          .hero-main-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .hero-heading, .hero-subheading {
            white-space: normal;
            line-height: 1.05;
          }
          .hero-img-container {
            width: 120px;
            height: 95px;
            margin-bottom: 8px;
          }
          .hero-form-label {
            font-size: 1rem;
          }
          .hero-decorative-line {
            width: 60px;
            height: 3px;
            margin: 1.25rem 0 1.75rem 0;
          }
          .hero-badge {
            font-size: 0.8rem;
            padding: 6px 16px;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="hero-row">
        {/* Main Row */}
        <div className="hero-main-row">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ ease: [0.86, 0, 0.07, 0.995], duration: 1, delay: 0.5 }}
            style={{ display: 'inline-block', overflow: 'hidden' }}
          >
            <motion.div
              className="hero-img-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: showImage ? 1 : 0, 
                scale: showImage ? 1 : 0.9
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            >
              <img src={contacthero} alt="Contact Athena" className="hero-img" />
            </motion.div>
          </motion.span>

          <h1 className="hero-heading">LET'S BUILD</h1>
        </div>

        {/* Subheading */}
        <h1 className="hero-subheading">
          SMARTER LEARNING
          <br />
          EXPERIENCES TOGETHER
        </h1>

        {/* Decorative Line */}
        <div className="hero-decorative-line"></div>

        {/* Form Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="hero-form-label">
            <span className="hero-arrow-icon">
              <ArrowDown className="w-5 h-5 text-sky-600" />
            </span>
            Fill the form below or choose your preferred contact method
          </div>
        </motion.div>
      </div>
    </section>
  );
}
