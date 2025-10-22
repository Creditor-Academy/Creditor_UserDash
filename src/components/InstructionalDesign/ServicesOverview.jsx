import React, { useState, useRef } from 'react';
import { 
  Lightbulb, 
  BookOpen, 
  Server, 
  Video, 
  Award,
  X,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ServicesOverview = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const sliderRef = useRef(null);

  const services = [
    {
      id: 1,
      icon: <Lightbulb />,
      title: "Instructional Design Strategy & Needs Analysis",
      shortDescription: "Align learning objectives with business goals through research-backed design frameworks.",
      color: "#3b82f6", // blue
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      benefits: [
        "Comprehensive needs analysis and gap assessment",
        "Learning objectives aligned with business KPIs",
        "Audience analysis and persona development",
        "Curriculum architecture and learning pathway design",
        "Cognitive load optimization strategies",
        "Evidence-based instructional frameworks (ADDIE, SAM, Bloom's Taxonomy)"
      ]
    },
    {
      id: 2,
      icon: <BookOpen />,
      title: "Custom E-Learning & Course Development",
      shortDescription: "Engaging, interactive courses tailored to your learners and delivered on any platform.",
      color: "#f59e0b", // orange
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      benefits: [
        "Scenario-based learning and branching simulations",
        "Mobile-first responsive course design",
        "Rich multimedia integration (video, audio, interactive elements)",
        "Accessibility compliance (WCAG 2.1, Section 508)",
        "SCORM/xAPI/LTI-compliant packages",
        "Custom graphics, animations, and visual design"
      ]
    },
    {
      id: 3,
      icon: <Server />,
      title: "LMS Integration & Platform Support",
      shortDescription: "Seamless deployment and ongoing technical support for your learning ecosystem.",
      color: "#10b981", // green
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
      benefits: [
        "LMS selection and implementation consulting",
        "Content migration and system integration",
        "Single Sign-On (SSO) and API integration",
        "Custom reporting and analytics dashboards",
        "User onboarding and admin training",
        "Ongoing maintenance and technical support"
      ]
    },
    {
      id: 4,
      icon: <Video />,
      title: "Live & Virtual Instructor-Led Training Solutions",
      shortDescription: "Hybrid training experiences that combine the best of live instruction and digital delivery.",
      color: "#8b5cf6", // purple
      image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=600&fit=crop",
      benefits: [
        "Virtual classroom design and facilitation",
        "Blended learning program development",
        "Interactive webinar and workshop design",
        "Facilitator guides and participant materials",
        "Breakout room activities and collaboration tools",
        "Post-session reinforcement and follow-up"
      ]
    },
    {
      id: 5,
      icon: <Award />,
      title: "Assessment, Gamification & Micro-Learning",
      shortDescription: "Boost engagement and retention with game mechanics, bite-sized content, and validated assessments.",
      color: "#06b6d4", // cyan
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      benefits: [
        "Engagement design with points, badges, and leaderboards",
        "Scenario-based branching narratives",
        "Mobile-first micro-modules (2-5 minute lessons)",
        "Knowledge checks and formative assessments",
        "Performance-based simulations and evaluations",
        "Spaced repetition and reinforcement strategies"
      ]
    }
  ];

  // Handle responsive slides per view
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSlidesPerView(1);
      } else if (window.innerWidth <= 1200) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset slide position when slidesPerView changes
  React.useEffect(() => {
    const maxSlide = Math.max(0, services.length - slidesPerView);
    if (currentSlide > maxSlide) {
      setCurrentSlide(maxSlide);
    }
  }, [slidesPerView, currentSlide, services.length]);

  const openModal = (service) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  // Slider functions
  const maxSlide = Math.max(0, services.length - slidesPerView);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const goToSlide = (index) => {
    if (index <= maxSlide) {
      setCurrentSlide(index);
    }
  };

  return (
    <>
      <style>
        {`
          .services-section {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            padding: 5rem 1rem;
            position: relative;
            overflow: hidden;
          }

          .services-container {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 2;
          }

          .services-title {
            text-align: center;
            font-family: 'Georgia, Times New Roman, serif';
            font-size: 3rem;
            font-weight: 400;
            color: #ffffff;
            margin-bottom: 1rem;
            line-height: 1.2;
          }

          .services-subtitle {
            text-align: center;
            font-size: 1.125rem;
            font-weight: 400;
            color: #ffffff;
            max-width: 48rem;
            margin: 0 auto;
            line-height: 1.75;
          }

          .services-slider-container {
            position: relative;
            margin-top: 3rem;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 2rem;
            padding: 0 2rem;
          }

          .services-slider-wrapper {
            flex: 1;
            overflow: hidden;
            position: relative;
          }

          .services-slider {
            display: flex;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            gap: 1.5rem;
          }

          .service-slide {
            flex: 0 0 calc(33.333% - 1rem);
            min-width: 0;
          }

          .service-card {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .service-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }

          .service-image-wrapper {
            position: relative;
            width: 100%;
            height: 12rem;
            flex-shrink: 0;
            overflow: hidden;
          }

          .service-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.7s ease;
          }

          .service-card:hover .service-image {
            transform: scale(1.1);
          }

          .service-image-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent, transparent);
          }

          .service-icon-wrapper {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .service-icon-wrapper svg {
            width: 1.25rem;
            height: 1.25rem;
          }

          .service-content {
            position: relative;
            padding: 1.5rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .service-hover-fill {
            position: absolute;
            inset: 0;
            transition: all 0.5s ease-out;
            transform: translateY(100%);
            opacity: 0;
          }

          .service-card:hover .service-hover-fill {
            transform: translateY(0);
            opacity: 0.2;
          }

          .service-content-inner {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }

          .service-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1rem;
            line-height: 1.25;
          }

          .service-description {
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.625;
            flex-grow: 1;
            margin-bottom: 1.5rem;
          }

          .service-bottom-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 0.25rem;
          }

          /* Slider Navigation */
          .slider-nav-btn {
            width: 3rem;
            height: 3rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            flex-shrink: 0;
          }

          .slider-nav-btn:hover {
            background: white;
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          }

          .slider-nav-btn svg {
            width: 1.5rem;
            height: 1.5rem;
            color: #1e293b;
          }

          /* Dots Indicator */
          .slider-dots {
            display: none;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2.5rem;
          }

          .slider-dot {
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
          }

          .slider-dot:hover {
            background: rgba(255, 255, 255, 0.6);
          }

          .slider-dot.active {
            background: white;
            transform: scale(1.3);
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
            backdrop-filter: blur(4px);
          }

          .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            padding: 2rem 2rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
            border-radius: 20px 20px 0 0;
          }

          .modal-header-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
          }

          .modal-icon-wrapper {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .modal-icon-wrapper svg {
            color: white;
            width: 32px;
            height: 32px;
          }

          .modal-title-wrapper {
            flex-grow: 1;
          }

          .modal-title {
            font-family: 'Georgia, Times New Roman, serif';
            font-size: 1.75rem;
            font-weight: 400;
            color: #111827;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .modal-description {
            font-family: 'Arial, sans-serif';
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.5;
          }

          .modal-close-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: #f3f4f6;
            border: none;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .modal-close-btn:hover {
            background: #e5e7eb;
            transform: scale(1.1);
          }

          .modal-close-btn svg {
            width: 20px;
            height: 20px;
            color: #6b7280;
          }

          .modal-body {
            padding: 2rem;
          }

          .benefits-title {
            font-family: 'Arial, sans-serif';
            font-size: 1.125rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1.5rem;
          }

          .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .benefit-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1rem;
            font-family: 'Arial, sans-serif';
            font-size: 0.95rem;
            color: #374151;
            line-height: 1.6;
          }

          .benefit-item svg {
            flex-shrink: 0;
            margin-top: 0.15rem;
            width: 20px;
            height: 20px;
          }

          /* Background decoration */
          .services-bg-decoration {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
          }

          .services-bg-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.1;
          }

          /* Responsive Design */
          @media (min-width: 1400px) {
            .services-title {
              font-size: 3.75rem;
            }
          }

          @media (max-width: 1200px) {
            .services-slider-container {
              gap: 1.5rem;
              padding: 0 1.5rem;
            }

            .service-slide {
              flex: 0 0 calc(50% - 0.75rem);
            }
          }

          @media (max-width: 1024px) {
            .services-title {
              font-size: 2.5rem;
            }

            .services-slider-container {
              gap: 1rem;
              padding: 0 1rem;
            }

            .slider-nav-btn {
              width: 2.5rem;
              height: 2.5rem;
            }

            .slider-nav-btn svg {
              width: 1.25rem;
              height: 1.25rem;
            }
          }

          @media (min-width: 768px) and (max-width: 1024px) {
            .services-title {
              font-size: 3.125rem;
            }
          }

          @media (max-width: 768px) {
            .services-section {
              padding: 3rem 1rem;
            }

            .services-title {
              font-size: 2.5rem;
            }

            .services-subtitle {
              font-size: 1.125rem;
            }

            .service-slide {
              flex: 0 0 100%;
            }

            .services-slider-container {
              gap: 0.75rem;
              padding: 0 0.75rem;
            }

            .slider-nav-btn {
              width: 2.5rem;
              height: 2.5rem;
            }

            .slider-nav-btn svg {
              width: 1.25rem;
              height: 1.25rem;
            }

            .slider-dots {
              display: flex;
            }

            .modal-content {
              max-height: 85vh;
            }

            .modal-header {
              padding: 1.5rem;
            }

            .modal-body {
              padding: 1.5rem;
            }

            .modal-title {
              font-size: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .services-title {
              font-size: 2rem;
            }

            .service-card {
              padding: 1.5rem;
            }

            .services-slider-container {
              gap: 0.5rem;
              padding: 0 0.5rem;
            }

            .slider-nav-btn {
              width: 2rem;
              height: 2rem;
            }

            .slider-nav-btn svg {
              width: 1rem;
              height: 1rem;
            }

            .modal-header-content {
              flex-direction: column;
            }

            .modal-icon-wrapper {
              width: 56px;
              height: 56px;
            }

            .modal-icon-wrapper svg {
              width: 28px;
              height: 28px;
            }

            .modal-title {
              font-size: 1.25rem;
            }
          }
        `}
      </style>

      <section className="services-section">
        {/* Background decorations */}
        <div className="services-bg-decoration">
          <div className="services-bg-blob" style={{
            top: '10%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: '#3b82f6'
          }} />
          <div className="services-bg-blob" style={{
            bottom: '10%',
            right: '10%',
            width: '500px',
            height: '500px',
            background: '#8b5cf6'
          }} />
        </div>

        <div className="services-container">
          <h2 className="services-title">Our Services</h2>
          <p className="services-subtitle" style={{ fontFamily: 'Arial, sans-serif' }}>
            Comprehensive instructional design and e-learning solutions tailored to your organization's needs
          </p>

          {/* Slider Container */}
          <div className="services-slider-container">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="slider-nav-btn"
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>

            {/* Cards Container */}
            <div className="services-slider-wrapper">
              <div 
                ref={sliderRef}
                className="services-slider"
                style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
              >
                {services.map((service) => (
                  <div key={service.id} className="service-slide">
                    <div
                      className="service-card"
                      onClick={() => openModal(service)}
                    >
                      {/* Image Section */}
                      <div className="service-image-wrapper">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="service-image"
                        />
                        <div className="service-image-overlay" />
                        
                        {/* Icon overlay */}
                        <div className="service-icon-wrapper">
                          <div style={{ color: service.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {service.icon}
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="service-content">
                        {/* Hover Fill Animation */}
                        <div
                          className="service-hover-fill"
                          style={{ backgroundColor: service.color }}
                        />
                        
                        {/* Content with higher z-index */}
                        <div className="service-content-inner">
                          <h3 className="service-title" style={{ fontFamily: 'Arial, sans-serif' }}>{service.title}</h3>
                          <p className="service-description" style={{ fontFamily: 'Arial, sans-serif' }}>{service.shortDescription}</p>
                        </div>
                      </div>

                      {/* Bottom Color Line */}
                      <div className="service-bottom-bar">
                        <div style={{ backgroundColor: service.color, height: '100%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="slider-nav-btn"
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="slider-dots">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedService && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-content">
                  <div
                    className="modal-icon-wrapper"
                    style={{ background: selectedService.color }}
                  >
                    {selectedService.icon}
                  </div>
                  <div className="modal-title-wrapper">
                    <h3 className="modal-title">{selectedService.title}</h3>
                    <p className="modal-description">{selectedService.shortDescription}</p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={closeModal}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <h4 className="benefits-title">Key Benefits & Features</h4>
                <ul className="benefits-list">
                  {selectedService.benefits.map((benefit, index) => (
                    <li key={index} className="benefit-item">
                      <CheckCircle style={{ color: selectedService.color }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ServicesOverview;

