import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Headphones, Activity } from 'lucide-react';

const LearningPathways = () => {
  const learningStyles = [
    {
      icon: Eye,
      title: "Visual Learners",
      description: "Diagrams, charts, and visual content optimized for those who learn by seeing",
      color: "#5956e9",
      bgColor: "rgba(89, 86, 233, 0.1)"
    },
    {
      icon: Headphones,
      title: "Auditory Learners", 
      description: "Audio content, voice narration, and discussions for those who learn by hearing",
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.1)"
    },
    {
      icon: Activity,
      title: "Kinesthetic Learners",
      description: "Interactive activities, hands-on exercises, and practical experiences",
      color: "#0284c7",
      bgColor: "rgba(2, 132, 199, 0.1)"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section style={{
      width: '100%',
      padding: '70px 20px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(at 20% 30%, rgba(89, 86, 233, 0.05) 0px, transparent 50%),
          radial-gradient(at 80% 70%, rgba(6, 182, 212, 0.05) 0px, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            textAlign: 'center', 
            marginBottom: '50px' 
          }}
        >
          <span style={{
            display: 'inline-block',
            padding: '6px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#5956e9',
            background: 'rgba(89, 86, 233, 0.1)',
            borderRadius: '20px',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            ADAPTIVE LEARNING
          </span>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: '#17183a',
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            Intelligent Learning <span style={{ color: '#5956e9' }}>Pathways</span>
          </h2>

          <div style={{
            width: '80px',
            height: '5px',
            background: '#5956e9',
            margin: '0 auto 20px',
            borderRadius: '10px'
          }} />

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: '#565779',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Athena automatically creates a customized learning journey based on each learner's <strong>Visual, Auditory, and Kinesthetic</strong> preferences — ensuring every individual learns their way.
          </p>
        </motion.div>

        {/* Learning Styles Cards */}
        <motion.div 
          variants={containerVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {learningStyles.map((style, index) => {
            const IconComponent = style.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)' 
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  border: `2px solid ${style.bgColor}`,
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${style.color}, transparent)`,
                  opacity: 0.7
                }} />

                {/* Icon Container */}
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <IconComponent 
                    size={36}
                    strokeWidth={2}
                    style={{ color: style.color }}
                  />
                </div>
                
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: style.color,
                  marginBottom: '12px',
                  letterSpacing: '-0.3px'
                }}>
                  {style.title}
                </h3>
                
                <p style={{
                  fontSize: '0.95rem',
                  color: '#565779',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {style.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Box */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'linear-gradient(135deg, rgba(89, 86, 233, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            textAlign: 'center',
            border: '1px solid rgba(89, 86, 233, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#17183a'
            }}>
              🎯 Personalized learning for every student
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#17183a'
            }}>
              •
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#17183a'
            }}>
              🚀 Better engagement and retention
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#17183a'
            }}>
              •
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#17183a'
            }}>
              ✨ Powered by AI
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LearningPathways;

