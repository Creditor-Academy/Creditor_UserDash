import React, { useEffect, useRef, useState } from 'react';

// SVG Icons
const ContentAuthoringIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CollaborationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const PersonalizationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const EcosystemIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const AssessmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const AthenaFeatures = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  
  const categories = [
    {
      id: 1,
      name: "Content Creation",
      color: "linear-gradient(to right, #3b82f6, #06b6d4)",
      bgColor: "linear-gradient(to bottom right, #eff6ff, #ecfeff)",
      icon: "📝"
    },
    {
      id: 2,
      name: "Collaboration",
      color: "linear-gradient(to right, #6366f1, #8b5cf6)",
      bgColor: "linear-gradient(to bottom right, #eef2ff, #f5f3ff)",
      icon: "👥"
    },
    {
      id: 3,
      name: "AI & Personalization",
      color: "linear-gradient(to right, #8b5cf6, #ec4899)",
      bgColor: "linear-gradient(to bottom right, #f5f3ff, #fdf2f8)",
      icon: "🤖"
    },
    {
      id: 4,
      name: "Analytics & Insights",
      color: "linear-gradient(to right, #14b8a6, #22c55e)",
      bgColor: "linear-gradient(to bottom right, #f0fdfa, #f0fdf4)",
      icon: "📊"
    }
  ];

  const features = [
    // Content Creation features
    {
      id: 1,
      title: "Content Authoring Studio",
      description: "Create stunning, interactive learning experiences with our intuitive drag-and-drop studio. Support for multiple content types and seamless integration with existing tools.",
      icon: <ContentAuthoringIcon />,
      category: 0,
      color: "linear-gradient(to right, #3b82f6, #06b6d4)",
      bgColor: "linear-gradient(to bottom right, #eff6ff, #ecfeff)",
      details: [
        "Drag-and-drop course builder",
        "Multimedia content support",
        "Interactive elements library",
        "Responsive design templates",
        "SCORM and xAPI compliant",
        "Version control and history"
      ]
    },
    {
      id: 2,
      title: "All-in-One SaaS Ecosystem",
      description: "A fully integrated platform that combines all the tools you need for creating, managing, and delivering exceptional learning experiences at scale.",
      icon: <EcosystemIcon />,
      category: 0,
      color: "linear-gradient(to right, #3b82f6, #06b6d4)",
      bgColor: "linear-gradient(to bottom right, #eff6ff, #ecfeff)",
      details: [
        "Unified learning environment",
        "Seamless integration capabilities",
        "Scalable cloud infrastructure",
        "Multi-tenant architecture",
        "Continuous update pipeline",
        "Enterprise-grade security"
      ]
    },
    // Collaboration features
    {
      id: 3,
      title: "Collaborative Communities",
      description: "Foster engagement with built-in social learning features for discussion, group projects, and knowledge sharing across your organization.",
      icon: <CollaborationIcon />,
      category: 1,
      color: "linear-gradient(to right, #6366f1, #8b5cf6)",
      bgColor: "linear-gradient(to bottom right, #eef2ff, #f5f3ff)",
      details: [
        "Discussion forums & spaces",
        "Real-time collaboration tools",
        "Group project management",
        "Peer review system",
        "Knowledge sharing hubs",
        "Mentorship programs"
      ]
    },
    {
      id: 4,
      title: "Intelligent Communication Hub",
      description: "Enhance interaction with smart notifications, detailed engagement analytics, and automated workflows to keep everyone connected.",
      icon: <CollaborationIcon />,
      category: 1,
      color: "linear-gradient(to right, #6366f1, #8b5cf6)",
      bgColor: "linear-gradient(to bottom right, #eef2ff, #f5f3ff)",
      details: [
        "Smart notifications",
        "Intelligent moderation",
        "Engagement analytics",
        "Discussion analytics",
        "Automated follow-ups",
        "Role-based communication"
      ]
    },
    // AI & Personalization features
    {
      id: 5,
      title: "AI-Powered Personalization",
      description: "Leverage advanced AI to tailor learning experiences, create personalized learning paths, and adapt content based on individual progress and preferences.",
      icon: <PersonalizationIcon />,
      category: 2,
      color: "linear-gradient(to right, #8b5cf6, #ec4899)",
      bgColor: "linear-gradient(to bottom right, #f5f3ff, #fdf2f8)",
      details: [
        "Adaptive learning paths",
        "AI content recommendations",
        "Automated difficulty adjustment",
        "Personalized feedback system",
        "Predictive performance analysis",
        "Learning style adaptation"
      ]
    },
    {
      id: 6,
      title: "Smart Content Co-Creation",
      description: "AI-assisted content creation that helps you develop engaging materials faster with intelligent suggestions and automation tools.",
      icon: <PersonalizationIcon />,
      category: 2,
      color: "linear-gradient(to right, #8b5cf6, #ec4899)",
      bgColor: "linear-gradient(to bottom right, #f5f3ff, #fdf2f8)",
      details: [
        "AI content suggestions",
        "Automated outline generation",
        "Content enhancement tools",
        "Multimedia recommendations",
        "Accessibility improvements",
        "Multilingual support"
      ]
    },
    // Analytics & Insights features
    {
      id: 7,
      title: "Learning Analytics Dashboard",
      description: "Gain deep understanding of learning effectiveness with advanced analytics, customizable reports, and actionable insights for improvement.",
      icon: <AnalyticsIcon />,
      category: 3,
      color: "linear-gradient(to right, #14b8a6, #22c55e)",
      bgColor: "linear-gradient(to bottom right, #f0fdfa, #f0fdf4)",
      details: [
        "Engagement heatmaps",
        "Knowledge retention tracking",
        "Skill gap analysis",
        "ROI measurement tools",
        "Custom report builder",
        "Predictive analytics"
      ]
    },
    {
      id: 8,
      title: "Interactive Assessments Engine",
      description: "Move beyond multiple-choice with our advanced assessment system featuring AI-powered evaluation and detailed feedback mechanisms.",
      icon: <AssessmentIcon />,
      category: 3,
      color: "linear-gradient(to right, #14b8a6, #22c55e)",
      bgColor: "linear-gradient(to bottom right, #f0fdfa, #f0fdf4)",
      details: [
        "Interactive question types",
        "Auto-grading system",
        "Plagiarism detection",
        "Performance analytics",
        "Competency mapping",
        "Real-time feedback"
      ]
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const filteredFeatures = features.filter(feature => feature.category === activeCategory);
  
  const featurePairs = [];
  for (let i = 0; i < filteredFeatures.length; i += 2) {
    featurePairs.push(filteredFeatures.slice(i, i + 2));
  }

  useEffect(() => {
    let interval = null;
    if (isAutoRotating && featurePairs.length > 1) {
      interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % featurePairs.length);
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRotating, activeCategory, featurePairs.length]);

  const handleCategoryChange = (index) => {
    setActiveCategory(index);
    setActiveFeature(0);
    setIsAutoRotating(true);
  };

  const handleFeatureChange = (index) => {
    setActiveFeature(index);
    setIsAutoRotating(false);
  };

  // Animation styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, white, #ecfeff)',
    padding: isMobile ? '3rem 1rem' : '4rem 1.5rem',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const backgroundPattern = {
    position: 'absolute',
    inset: 0,
    opacity: 0.2,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '3rem' : '4rem'
  };

  const headlineStyle = {
    fontSize: isMobile ? '2.25rem' : '3rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1.5rem',
    background: 'linear-gradient(to right, #1d4ed8, #0ea5e9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.2
  };

  const taglineStyle = {
    marginTop: '1.25rem',
    maxWidth: '64rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: isMobile ? '1.125rem' : '1.25rem',
    color: '#475569'
  };

  const categoryButtonStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
    background: isActive ? categories[activeCategory].color : 'white',
    color: isActive ? 'white' : '#374151',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    border: 'none'
  });

  const featureCardStyle = (isActive) => ({
    padding: isMobile ? '1.25rem' : '1.5rem',
    borderRadius: '0.75rem',
    border: `1px solid ${isActive ? '#93c5fd' : '#e5e7eb'}`,
    background: isActive ? 'white' : 'rgba(255, 255, 255, 0.9)',
    boxShadow: isActive 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  });

  const featureVisualizationStyle = {
    background: categories[activeCategory].bgColor,
    borderRadius: '1rem',
    padding: isMobile ? '1.5rem' : '2rem',
    border: '1px solid #dbeafe',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const ctaSectionStyle = {
    textAlign: 'center',
    position: 'relative',
    marginTop: '3rem'
  };

  const ctaContainerStyle = {
    position: 'relative',
    background: 'white',
    borderRadius: '1rem',
    padding: isMobile ? '2rem' : '3rem',
    maxWidth: '56rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e0f2fe'
  };

  const buttonStyle = {
    padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
    background: 'linear-gradient(to right, #1d4ed8, #0ea5e9)',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
    transition: 'all 0.3s'
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#2563eb',
    border: '2px solid #2563eb'
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      {/* Subtle background pattern */}
      <div style={backgroundPattern}></div>

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(191, 219, 254, 0.4)',
              width: Math.random() * 80 + 30,
              height: Math.random() * 80 + 30,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 8 + 8}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div style={{
        maxWidth: '80rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header Section */}
        <div style={headerStyle}>
          {/* <div style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            animation: 'pulse 6s infinite alternate'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
              background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>✨</div>
          </div> */}
          
          <h1 style={headlineStyle}>
            Athena LMS Features
          </h1>
          
          <p style={taglineStyle}>
            The next-generation learning ecosystem designed to transform education through innovation, intelligence, and immersive experiences.
          </p>
        </div>

        {/* Category Selector */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: isMobile ? '2rem' : '3rem'
        }}>
          {categories.map((category, index) => (
            <button
              key={category.id}
              style={categoryButtonStyle(activeCategory === index)}
              onClick={() => handleCategoryChange(index)}
              onMouseEnter={(e) => {
                if (activeCategory !== index) {
                  e.target.style.transform = 'scale(1.05) translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== index) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '2rem' : '3rem',
          marginBottom: isMobile ? '3rem' : '5rem'
        }}>
          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {featurePairs.map((pair, pairIndex) => (
              <div
                key={pairIndex}
                style={{
                  padding: '0.25rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ...(activeFeature === pairIndex ? {
                    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
                    transform: 'scale(1.05)'
                  } : {
                    opacity: 0.8,
                    boxShadow: '0 0 0 0px transparent'
                  })
                }}
                onClick={() => handleFeatureChange(pairIndex)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {pair.map((feature, featureIndex) => (
                    <div
                      key={feature.id}
                      style={featureCardStyle(activeFeature === pairIndex)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          marginRight: '1.25rem',
                          background: activeFeature === pairIndex ? feature.color : '#dbeafe',
                          color: activeFeature === pairIndex ? 'white' : '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {feature.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '0.75rem',
                            color: activeFeature === pairIndex ? '#1e40af' : '#1e293b'
                          }}>
                            {feature.title}
                          </h3>
                          <p style={{
                            color: '#475569',
                            marginBottom: '1rem',
                            lineHeight: 1.6
                          }}>
                            {feature.description}
                          </p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem'
                          }}>
                            {feature.details.slice(0, 4).map((detail, i) => (
                              <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.875rem',
                                color: '#475569'
                              }}>
                                <div style={{
                                  width: '0.5rem',
                                  height: '0.5rem',
                                  borderRadius: '50%',
                                  marginRight: '0.5rem',
                                  background: activeFeature === pairIndex ? feature.color : '#93c5fd'
                                }}></div>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Feature navigation dots */}
            {featurePairs.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '2rem'
              }}>
                {featurePairs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleFeatureChange(index)}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      ...(activeFeature === index ? {
                        background: '#3b82f6',
                        transform: 'scale(1.1)'
                      } : {
                        background: '#d1d5db'
                      })
                    }}
                    aria-label={`Go to feature set ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Feature Visualization */}
          <div style={{ position: 'relative' }}>
            <div style={featureVisualizationStyle}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  marginBottom: '1rem',
                  color: '#3b82f6',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {featurePairs[activeFeature]?.[0]?.icon}
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  {featurePairs[activeFeature]?.[0]?.title} & {featurePairs[activeFeature]?.[1]?.title}
                </h2>
                <div style={{
                  height: '0.25rem',
                  width: '5rem',
                  background: categories[activeCategory].color,
                  borderRadius: '0.125rem',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{
                  color: '#475569',
                  maxWidth: '28rem',
                  margin: '0 auto'
                }}>
                  {featurePairs[activeFeature]?.[0]?.description} {featurePairs[activeFeature]?.[1]?.description}
                </p>
              </div>

              {/* PARALLEL COLUMNS FOR FEATURE POINTS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* First Feature Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {featurePairs[activeFeature]?.[0]?.title}
                  </h3>
                  {featurePairs[activeFeature]?.[0]?.details.slice(0, 4).map((detail, i) => (
                    <div
                      key={`0-${i}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #dbeafe',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            background: featurePairs[activeFeature]?.[0]?.color,
                            animation: `pulse 2s infinite ${i * 0.5}s`
                          }}
                        ></div>
                        <span style={{ color: '#374151', fontSize: '0.875rem' }}>{detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second Feature Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {featurePairs[activeFeature]?.[1]?.title}
                  </h3>
                  {featurePairs[activeFeature]?.[1]?.details.slice(0, 4).map((detail, i) => (
                    <div
                      key={`1-${i}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #dbeafe',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            background: featurePairs[activeFeature]?.[1]?.color,
                            animation: `pulse 2s infinite ${i * 0.5 + 0.15}s`
                          }}
                        ></div>
                        <span style={{ color: '#374151', fontSize: '0.875rem' }}>{detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  style={{
                    ...buttonStyle,
                    background: categories[activeCategory].color,
                    padding: '0.75rem 1.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                  }}
                >
                  Explore These Features
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
     {/* CTA Section */}
<div style={{
  textAlign: 'center',
  position: 'relative'
}}>
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(to right, #bfdbfe, #cffafe)',
    borderRadius: '1rem',
    filter: 'blur(30px)',
    opacity: 0.5
  }}></div>
  <div style={{
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem 3rem',
    maxWidth: '56rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    border: '1px solid #dbeafe'
  }}>
    <h2 style={{
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '1rem'
    }}>
      Ready to revolutionize your learning experience?
    </h2>
    <p style={{
      color: '#475569',
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
      marginBottom: '2rem',
      maxWidth: '42rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      Join forward-thinking educators and organizations using Athena LMS to create transformative learning journeys.
    </p>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '1rem'
    }}>
      <button style={{
        padding: '1rem 2rem',
        backgroundImage: 'linear-gradient(to right, #2563eb, #0891b2)',
        color: 'white',
        fontWeight: 700,
        borderRadius: '0.5rem',
        transition: 'all 0.3s',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        border: 'none',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}
      onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}
      >
        Get Started Free
      </button>
      <button style={{
        padding: '1rem 2rem',
        border: '2px solid #3b82f6',
        color: '#2563eb',
        fontWeight: 700,
        borderRadius: '0.5rem',
        transition: 'all 0.3s',
        backgroundColor: 'transparent',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Schedule a Demo
      </button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

export default AthenaFeatures;  