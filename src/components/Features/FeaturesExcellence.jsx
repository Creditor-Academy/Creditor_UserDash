import React, { useState, useEffect } from 'react';

const AthenaLMSFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    {
      id: 1,
      title: "Intuitive Course Management",
      description: "Create, organize, and deliver courses with our drag-and-drop interface that makes content creation effortless.",
      icon: "📚",
      stats: "85% faster course setup"
    },
    {
      id: 2,
      title: "Advanced Analytics",
      description: "Track learner progress, engagement metrics, and performance data with beautiful, insightful dashboards.",
      icon: "📊",
      stats: "200+ data points tracked"
    },
    {
      id: 3,
      title: "Interactive Assessments",
      description: "Create engaging quizzes, assignments, and interactive evaluations with automatic grading.",
      icon: "✏️",
      stats: "15+ question types"
    },
    {
      id: 4,
      title: "Collaborative Learning",
      description: "Foster interaction with discussion forums, group projects, and peer review capabilities.",
      icon: "👥",
      stats: "92% better engagement"
    },
    {
      id: 5,
      title: "Mobile Learning",
      description: "Access courses anywhere with our responsive design and dedicated mobile app.",
      icon: "📱",
      stats: "24/7 access available"
    },
    {
      id: 6,
      title: "Automated Certifications",
      description: "Generate and issue certificates automatically upon course completion with verification system.",
      icon: "🏆",
      stats: "100% compliant"
    }
  ];

  return (
    <div style={styles.sectionWrapper}>
      <style>{globalKeyframes}</style>
      <div style={styles.backgroundDecor}>
        <div style={{ ...styles.blob, ...styles.blobOne }}></div>
        <div style={{ ...styles.blob, ...styles.blobTwo }}></div>
        <div style={{ ...styles.gridOverlay }}></div>
      </div>

      <div style={{ ...styles.container, ...(isMobile ? { padding: '0 1rem' } : {}) }}>
        <div style={{ ...styles.header, ...(isVisible ? styles.headerVisible : {}) }}>
          <span style={styles.kicker}>Athena LMS</span>
          <h2 style={styles.title}>Features that feel premium</h2>
          <p style={styles.subtitle}>A refined, modern toolkit designed to elevate learning—simple, powerful, and beautifully crafted.</p>
        </div>

        <div style={{
          ...styles.contentArea,
          ...(isMobile ? { gridTemplateColumns: '1fr', gap: '1rem' } : {})
        }}>
          <aside style={{
            ...styles.sidebar,
            ...(isMobile ? { flexDirection: 'row', overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.5rem' } : {})
          }}>
            {features.map((feature, index) => {
              const isActive = activeFeature === index;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  style={{
                    ...styles.sideTab,
                    ...(isActive ? styles.sideTabActive : {}),
                    transform: isActive ? 'translateX(4px) scale(1.01)' : 'translateX(0) scale(1)',
                    ...(isMobile ? { minWidth: '260px', whiteSpace: 'nowrap' } : {})
                  }}
                >
                  <span style={{ ...styles.sideIcon, color: isActive ? '#0ea5e9' : '#64748b' }}>{feature.icon}</span>
                  <div style={styles.sideTextWrap}>
                    <div style={{ ...styles.sideTitle, color: isActive ? '#0ea5e9' : '#0f172a' }}>{feature.title}</div>
                    <div style={styles.sideHint}>Tap to explore</div>
                  </div>
                  <span style={{ ...styles.chevron, opacity: isActive ? 1 : 0.35 }}>→</span>
                </button>
              );
            })}
          </aside>

          <main style={{ ...styles.mainPanel, ...(isMobile ? { marginTop: '0.25rem' } : {}) }}>
            <div style={styles.panelHeader}>
              <div style={styles.badge}>Featured</div>
              <div style={styles.panelTitleWrap}>
                <span style={styles.panelIcon}>{features[activeFeature].icon}</span>
                <h3 style={styles.panelTitle}>{features[activeFeature].title}</h3>
              </div>
            </div>

            <div style={styles.panelBody}>
              <p style={styles.panelDescription}>{features[activeFeature].description}</p>
              <div style={{
                ...styles.metricsRow,
                ...(isMobile ? { gridTemplateColumns: 'repeat(2, 1fr)' } : {})
              }}>
                <div style={styles.metricCard}>
                  <div style={styles.metricNumber}>{features[activeFeature].stats}</div>
                  <div style={styles.metricLabel}>Outcome</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricNumber}>A+</div>
                  <div style={styles.metricLabel}>Quality grade</div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricNumber}>99.9%</div>
                  <div style={styles.metricLabel}>Reliability</div>
                </div>
              </div>

              <div style={styles.visualWrap}>
                <div style={{ ...styles.visualCard, ...(isMobile ? { height: '200px' } : {}) }}>
                  <div style={styles.visualGlow}></div>
                  <div style={styles.visualInner}>
                    {activeFeature === 0 && <CourseManagementGraphic />}
                    {activeFeature === 1 && <AnalyticsGraphic />}
                    {activeFeature === 2 && <AssessmentsGraphic />}
                    {activeFeature === 3 && <CollaborationGraphic />}
                    {activeFeature === 4 && <MobileGraphic />}
                    {activeFeature === 5 && <CertificationGraphic />}
                  </div>
                </div>
              </div>

              <div style={{ ...styles.ctaRow, ...(isMobile ? { flexDirection: 'column' } : {}) }}>
                <button style={{ ...styles.primaryBtn, ...(isMobile ? { width: '100%' } : {}) }}>Get Started</button>
                <button style={{ ...styles.secondaryBtn, ...(isMobile ? { width: '100%' } : {}) }}>Schedule Demo</button>
              </div>
            </div>
          </main>
        </div>

        <div style={{
          ...styles.bottomStrip,
          ...(isMobile ? { gridTemplateColumns: '1fr', rowGap: '0.5rem', textAlign: 'center' } : {})
        }}>
          <div style={styles.statBlock}>
            <div style={styles.statBig}>95%</div>
            <div style={styles.statSmall}>Satisfaction Rate</div>
          </div>
          {!isMobile && <div style={styles.separator}></div>}
          <div style={styles.statBlock}>
            <div style={styles.statBig}>100+</div>
            <div style={styles.statSmall}>Active Users</div>
          </div>
          {!isMobile && <div style={styles.separator}></div>}
          <div style={styles.statBlock}>
            <div style={styles.statBig}>98%</div>
            <div style={styles.statSmall}>Uptime Reliability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Graphic components for each feature
const CourseManagementGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '30%', left: '30%', width: '60px', height: '40px', backgroundColor: '#0ea5e9', borderRadius: '5px'}}></div>
    <div style={{...styles.graphicElement, top: '50%', left: '50%', width: '60px', height: '40px', backgroundColor: '#38bdf8', borderRadius: '5px', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '40%', left: '70%', width: '40px', height: '60px', backgroundColor: '#7dd3fc', borderRadius: '5px', animationDelay: '1s'}}></div>
  </div>
);

const AnalyticsGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '60%', left: '20%', width: '20px', height: '80px', backgroundColor: '#06b6d4', borderRadius: '3px'}}></div>
    <div style={{...styles.graphicElement, top: '40%', left: '40%', width: '20px', height: '120px', backgroundColor: '#0891b2', borderRadius: '3px', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '30%', left: '60%', width: '20px', height: '140px', backgroundColor: '#0ea5e9', borderRadius: '3px', animationDelay: '1s'}}></div>
    <div style={{...styles.graphicElement, top: '50%', left: '80%', width: '20px', height: '100px', backgroundColor: '#38bdf8', borderRadius: '3px', animationDelay: '1.5s'}}></div>
  </div>
);

const AssessmentsGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '40%', left: '40%', width: '80px', height: '60px', backgroundColor: '#0ea5e9', borderRadius: '8px'}}></div>
    <div style={{...styles.graphicElement, top: '50%', left: '50%', width: '40px', height: '40px', backgroundColor: '#38bdf8', borderRadius: '50%', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '60%', left: '60%', width: '30px', height: '30px', backgroundColor: '#7dd3fc', borderRadius: '50%', animationDelay: '1s'}}></div>
  </div>
);

const CollaborationGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '40%', left: '30%', width: '50px', height: '50px', backgroundColor: '#0ea5e9', borderRadius: '50%'}}></div>
    <div style={{...styles.graphicElement, top: '40%', left: '50%', width: '50px', height: '50px', backgroundColor: '#38bdf8', borderRadius: '50%', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '40%', left: '70%', width: '50px', height: '50px', backgroundColor: '#7dd3fc', borderRadius: '50%', animationDelay: '1s'}}></div>
    <div style={{...styles.graphicElement, top: '60%', left: '50%', width: '100px', height: '20px', backgroundColor: '#e0f2fe', borderRadius: '10px', animationDelay: '1.5s'}}></div>
  </div>
);

const MobileGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '40%', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '140px', backgroundColor: '#0f172a', borderRadius: '15px'}}></div>
    <div style={{...styles.graphicElement, top: '45%', left: '50%', transform: 'translateX(-50%)', width: '70px', height: '130px', backgroundColor: '#e0f2fe', borderRadius: '10px', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '70%', left: '30%', width: '10px', height: '10px', backgroundColor: '#0284c7', borderRadius: '50%', animationDelay: '1s'}}></div>
    <div style={{...styles.graphicElement, top: '70%', left: '70%', width: '10px', height: '10px', backgroundColor: '#0284c7', borderRadius: '50%', animationDelay: '1.5s'}}></div>
  </div>
);

const CertificationGraphic = () => (
  <div style={styles.graphic}>
    <div style={{...styles.graphicElement, top: '40%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '80px', backgroundColor: '#7dd3fc', borderRadius: '5px'}}></div>
    <div style={{...styles.graphicElement, top: '45%', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '70px', backgroundColor: '#bae6fd', borderRadius: '3px', animationDelay: '0.5s'}}></div>
    <div style={{...styles.graphicElement, top: '50%', left: '50%', transform: 'translateX(-50%)', width: '30px', height: '30px', backgroundColor: '#38bdf8', borderRadius: '50%', animationDelay: '1s'}}></div>
  </div>
);

// Styles
const styles = {
  sectionWrapper: {
    position: 'relative',
    padding: '5rem 0',
    background: 'linear-gradient(180deg, #ffffff 0%, #e6f6ff 100%)',
    overflow: 'hidden',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'"
  },
  backgroundDecor: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none'
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(14,165,233,0.08) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    maskImage: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0.1))'
  },
  blob: {
    position: 'absolute',
    filter: 'blur(40px)',
    opacity: 0.5,
    transform: 'translateZ(0)'
  },
  blobOne: {
    top: '-10%',
    left: '-10%',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(56,189,248,0.7), rgba(14,165,233,0.5))',
    animation: 'floatY 8s ease-in-out infinite'
  },
  blobTwo: {
    bottom: '-10%',
    right: '-10%',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(186,230,253,0.8), rgba(14,165,233,0.4))',
    animation: 'floatX 10s ease-in-out infinite'
  },
  container: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
  },
  header: {
    textAlign: 'center',
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.8s ease, transform 0.8s ease'
  },
  headerVisible: {
    opacity: 1,
    transform: 'translateY(0)'
  },
  kicker: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    background: 'rgba(14,165,233,0.08)',
    color: '#0ea5e9',
    fontWeight: 600,
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    marginBottom: '0.75rem'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    margin: 0,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  },
  subtitle: {
    marginTop: '0.75rem',
    color: '#0f172a',
    opacity: 0.75,
    fontSize: '1.05rem'
  },
  contentArea: {
    marginTop: '3rem',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1.5rem'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  sideTab: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid rgba(2,132,199,0.08)',
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '14px',
    padding: '0.9rem 1rem',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(2,132,199,0.08)',
    transition: 'all 0.25s ease'
  },
  sideTabActive: {
    border: '1px solid rgba(14,165,233,0.35)',
    background: 'linear-gradient(180deg, rgba(240,249,255,0.95), rgba(224,242,254,0.95))',
    boxShadow: '0 12px 40px rgba(14,165,233,0.18)'
  },
  sideIcon: {
    fontSize: '1.25rem'
  },
  sideTextWrap: {
    display: 'flex',
    flexDirection: 'column'
  },
  sideTitle: {
    fontSize: '0.98rem',
    fontWeight: 700
  },
  sideHint: {
    fontSize: '0.8rem',
    color: '#64748b'
  },
  chevron: {
    color: '#0ea5e9',
    fontWeight: 700
  },
  mainPanel: {
    position: 'relative',
    borderRadius: '16px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.9))',
    border: '1px solid rgba(2,132,199,0.08)',
    boxShadow: '0 24px 70px rgba(2,132,199,0.12)',
    overflow: 'hidden'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(2,132,199,0.08)'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#0369a1',
    background: 'rgba(14,165,233,0.15)',
    borderRadius: '9999px'
  },
  panelTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  panelIcon: {
    fontSize: '1.35rem'
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.15rem',
    color: '#0f172a',
    fontWeight: 800
  },
  panelBody: {
    padding: '1.25rem'
  },
  panelDescription: {
    color: '#0f172a',
    opacity: 0.8,
    lineHeight: 1.6,
    marginBottom: '1rem'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  metricCard: {
    background: 'linear-gradient(180deg, #ffffff, #f0f9ff)',
    border: '1px solid rgba(2,132,199,0.1)',
    borderRadius: '12px',
    padding: '0.9rem',
    boxShadow: '0 10px 24px rgba(2,132,199,0.08)',
    textAlign: 'center'
  },
  metricNumber: {
    fontWeight: 800,
    color: '#0284c7',
    fontSize: '1.05rem'
  },
  metricLabel: {
    fontSize: '0.78rem',
    color: '#64748b'
  },
  visualWrap: {
    marginTop: '0.5rem'
  },
  visualCard: {
    position: 'relative',
    background: 'linear-gradient(180deg, #f0f9ff, #ffffff)',
    border: '1px solid rgba(2,132,199,0.08)',
    borderRadius: '14px',
    height: '260px',
    overflow: 'hidden',
    boxShadow: '0 30px 60px rgba(2,132,199,0.12)'
  },
  visualGlow: {
    position: 'absolute',
    inset: '-20%',
    background: 'radial-gradient(circle at 30% 20%, rgba(14,165,233,0.18), transparent 40%), radial-gradient(circle at 70% 80%, rgba(56,189,248,0.15), transparent 40%)'
  },
  visualInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  primaryBtn: {
    background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.1rem',
    borderRadius: '10px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(2,132,199,0.2)'
  },
  secondaryBtn: {
    background: 'white',
    color: '#0284c7',
    border: '1px solid rgba(2,132,199,0.2)',
    padding: '0.8rem 1.1rem',
    borderRadius: '10px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  bottomStrip: {
    marginTop: '2.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr auto 1fr',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(240,249,255,0.9))',
    border: '1px solid rgba(2,132,199,0.08)',
    borderRadius: '16px',
    padding: '1rem 1.25rem',
    boxShadow: '0 16px 40px rgba(2,132,199,0.12)'
  },
  statBlock: {
    textAlign: 'center'
  },
  statBig: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#0284c7'
  },
  statSmall: {
    fontSize: '0.85rem',
    color: '#0f172a',
    opacity: 0.7
  },
  separator: {
    width: '1px',
    height: '32px',
    background: 'linear-gradient(180deg, transparent, rgba(2,132,199,0.2), transparent)'
  },
  // Graphics base styles
  graphic: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  graphicElement: {
    position: 'absolute',
    opacity: 0.85,
    animation: 'float 3s ease-in-out infinite'
  }
};

export default AthenaLMSFeatures;

// Keyframes for ambient motion and floating elements
const globalKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes floatX {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(20px); }
}
`;