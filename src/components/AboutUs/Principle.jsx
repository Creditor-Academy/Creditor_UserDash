import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import principles1 from "../../assets/education.jpg"; 
import principles2 from "../../assets/Uncover.jpg"; 
import "./Principles.css";

const Principles = () => {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <section className="principles-section">
      <div className="principles-container">
        {/* Section Heading */}
        <div className="principles-heading animate-fadeInUp">
          <h4 className="principles-subtitle">
            Our Foundation
          </h4>
          <h1 className="principles-title">
            Mission & Vision
          </h1>
          <p className="principles-description">
            Guided by a clear vision and mission, we're building the future of intelligent learning — 
            where AI, design, and learning science converge to create transformative educational experiences.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="principles-grid">
          {[{
            img: principles1,
            title: "Our Vision",
            desc: "Empowering the world to create intelligent learning ecosystems.",
            link: "Explore our vision",
          },
          {
            img: principles2,
            title: "Our Mission", 
            desc: "To combine AI, design, and learning science into one intuitive platform.",
            link: "Discover our mission",
          }].map((p, i) => (
            <div
              key={i}
              className="principle-card animate-cardIn"
              style={{ animationDelay: `${i * 0.2}s` }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Image */}
              <div className="card-image-container">
                <img
                  src={p.img}
                  alt={p.title}
                  className="card-image"
                />
                <div className={`shine-effect ${hoverIndex === i ? 'shine-active' : ''}`} />
              </div>

              {/* Slide-up Overlay Content */}
              <div className={`card-overlay ${hoverIndex === i ? 'overlay-active' : ''}`}>
                <h2 className="overlay-title">
                  {p.title}
                </h2>
                <p className="overlay-description">
                  {p.desc}
                </p>
                <a href="#" className="overlay-link">
                  {p.link} <FaArrowRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Principles;