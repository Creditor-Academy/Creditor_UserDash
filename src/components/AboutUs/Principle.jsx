import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import principles1 from '../../assets/education.jpg';
import principles2 from '../../assets/Uncover.jpg';
import './Principles.css';
import { motion } from 'framer-motion';

const Principles = () => {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <section
      className="principles-section"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
      }}
    >
      <div className="principles-container">
        {/* Section Heading */}
        <div className="principles-heading animate-fadeInUp">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-normal leading-tight"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              <span className="text-black">Mission & Vision</span>
            </h2>
          </motion.div>
          <p
            className="principles-description text-lg text-gray-600 font-normal"
            style={{ fontFamily: 'Arial, sans-serif', marginTop: '8px' }}
          >
            Guided by a clear vision and mission, we're building the future of
            intelligent learning — where AI, design, and learning science
            converge to create transformative educational experiences.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="principles-grid">
          {[
            {
              img: principles1,
              title: 'Our Vision',
              desc: 'Empowering the world to create intelligent learning ecosystems.',
              //link: "Explore our vision",
            },
            {
              img: principles2,
              title: 'Our Mission',
              desc: 'To combine AI, design, and learning science into one intuitive platform.',
              //link: "Discover our mission",
            },
          ].map((p, i) => (
            <div
              key={i}
              className="principle-card animate-cardIn"
              style={{ animationDelay: `${i * 0.2}s` }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Image */}
              <div className="card-image-container">
                <img src={p.img} alt={p.title} className="card-image" />
                <div
                  className={`shine-effect ${hoverIndex === i ? 'shine-active' : ''}`}
                />
              </div>

              {/* Slide-up Overlay Content (always visible) */}
              <div className="card-overlay overlay-active">
                <h2
                  className="overlay-title text-lg font-bold text-gray-900"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {p.title}
                </h2>
                <p
                  className="overlay-description text-sm text-gray-600 leading-relaxed"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {p.desc}
                </p>
                {/* <a href="#" className="overlay-link text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {p.link} <FaArrowRight />
                </a> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Principles;
