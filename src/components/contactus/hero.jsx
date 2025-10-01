import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import contacthero from "../../assets/contacthhero.jpg";

export default function Hero() {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowImage(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const mainRowStyle = {
    marginBottom: showImage ? "0px" : "0px",
    transition: "margin-bottom 0.5s ease",
  };

  return (
    <section className="hero-section">
      <style>{`
        .hero-section {
          width: 100%;
          min-height: 80vh;
          padding: 8vh 4vw 8vh 2vw;
          background: linear-gradient(to bottom, #e6f2ff, #f9fbff 70%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-row {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-main-row {
          display: flex;
          align-items: baseline;
          gap: 16px;
          position: relative;
          margin-bottom: 0;
        }

        .hero-img-container {
          width: 160px;
          height: 120px;
          position: relative;
          flex-shrink: 0;
        }

        .hero-img {
          border-radius: 16px;
          box-shadow: 0 2px 12px #0001, 0 1.5px 12px #0a29311a;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #155944;
          display: block;
        }

        .hero-heading {
          font-family: 'Oswald', 'Impact', 'Arial Black', Arial, sans-serif;
          font-size: clamp(56px, 7.2vw, 132px);
          font-weight: 700;
          color: #141d28;
          text-transform: uppercase;
          letter-spacing: -1.3px;
          line-height: 1.04;
          margin: 0;
          white-space: nowrap;
        }

        .hero-subheading {
          font-family: 'Oswald', 'Impact', 'Arial Black', Arial, sans-serif;
          font-size: clamp(56px, 7.2vw, 132px);
          font-weight: 700;
          color: #141d28;
          text-transform: uppercase;
          letter-spacing: -1.3px;
          line-height: 1.04;
          margin: 4px 0 0 0;
          max-width: 1000px;
          white-space: nowrap;
        }

        .hero-form-label {
          font-family: 'Montserrat', 'Arial', sans-serif;
          font-size: 1.25rem;
          color: #334155;
          margin-top: 3vw;
          margin-bottom: 0.1vw;
          font-weight: 500;
        }

        @media (max-width: 1200px) {
          .hero-img-container {
            width: 150px;
            height: 112px;
          }
        }

        @media (max-width: 900px) {
          .hero-img-container {
            width: 120px;
            height: 90px;
          }
        }

        @media (max-width: 600px) {
          .hero-main-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .hero-heading, .hero-subheading {
            white-space: normal;
          }
          .hero-img-container {
            width: 100px;
            height: 80px;
            margin-bottom: 6px;
          }
          .hero-form-label {
            font-size: 1.05rem;
          }
        }
      `}</style>

      <div className="hero-row">
        <div className="hero-main-row" style={mainRowStyle}>
          <motion.div
            className="hero-img-container"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: showImage ? 1 : 0, y: showImage ? 0 : 8 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img src={contacthero} alt="start" className="hero-img" />
          </motion.div>

          <h1 className="hero-heading">LET'S BUILD</h1>
        </div>

        <h1 className="hero-subheading">
          SMARTER LEARNING EXPERIENCES
          <br />
          TOGETHER
        </h1>

        <div>
          <div className="hero-form-label">Fill the form below:</div>
        </div>
      </div>
    </section>
  );
}
