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
            Principles & Values
          </h4>
          <h1 className="principles-title">
            The foundation of Athena LMS
          </h1>
          <p className="principles-description">
            Two timeless principles that guide our learning philosophy —
            making education transformative and deeply insightful.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="principles-grid">
          {[{
            img: principles1,
            title: "Learning with a purpose",
            desc: "Learning should spark transformation — shifting perception, building clarity, and empowering learners with practical knowledge.",
            link: "Discover our journey",
          },
          {
            img: principles2,
            title: "Revealing the unseen",
            desc: "Great learning uncovers what's hidden — guiding focus, sparking curiosity, and delivering lasting understanding.",
            link: "Explore our approach",
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

              {/* Slide-up Overlay Content - TEXT WILL BE WHITE */}
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