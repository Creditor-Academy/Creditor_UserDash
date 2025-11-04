import React, { useState } from 'react';

const Testimonials = () => {
  const [activeDot, setActiveDot] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "We switched to Athena after struggling with a legacy LMS. The difference was night and day—our courses are now engaging, beautiful, and easy to manage.",
      stars: "⭐️⭐️⭐️⭐️⭐️",
      name: "HR Director",
      company: "Fortune 500 Company",
      initial: "HR"
    },
    {
      id: 2,
      text: "Athena's AI tools cut my course development time by 60%. I can now focus more on teaching instead of formatting.",
      stars: "⭐️⭐️⭐️⭐️⭐️",
      name: "Online Coach",
      company: "Education Professional",
      initial: "OC"
    },
    {
      id: 3,
      text: "Our students love the interactive activities. Learning feels like an experience, not a chore.",
      stars: "⭐️⭐️⭐️⭐️⭐️",
      name: "University Lecturer",
      company: "Higher Education",
      initial: "UL"
    }
  ];

  const athenaBlue = '#2073c8';

  // Simplified and enhanced styles
  const styles = {
    mainBox: {
      width: '100%',
      background: '#f2f8ff',
      padding: '60px 0 0 0',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    contentContainer: {
      width: '100%',
      maxWidth: '1400px',
      padding: '0 clamp(20px, 5vw, 40px) 60px',
      margin: '0 auto'
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    smallHeading: {
      fontSize: '1rem',
      color: athenaBlue,
      fontWeight: '600',
      letterSpacing: '1.2px',
      marginBottom: '10px'
    },
    mainHeading: {
      fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
      color: athenaBlue,
      fontWeight: '700',
      marginBottom: '10px'
    },
    subHeading: {
      fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
      color: '#545975',
      marginBottom: '24px'
    },
    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))',
      gap: '20px',
      width: '100%',
      marginBottom: '30px',
      maxWidth: '1200px'
    },
    testimonialCard: {
      background: '#f7fbff',
      borderRadius: '10px',
      padding: '20px 18px',
      boxShadow: '0 3px 14px 0 rgba(32,115,200,0.05)',
      border: `1px solid #e3edfd`,
      minHeight: '180px',
      position: 'relative',
      transition: 'all 0.22s cubic-bezier(.4,2,.27,.79)'
    },
    stars: {
      color: athenaBlue,
      fontSize: '1.1rem',
      letterSpacing: '2px',
      marginBottom: '12px',
      textAlign: 'center'
    },
    testimonialText: {
      color: '#324057',
      fontSize: 'clamp(0.9rem, 2vw, 1.065rem)',
      lineHeight: '1.5',
      marginBottom: '15px',
      fontStyle: 'italic'
    },
    customerInfo: {
      display: 'flex',
      alignItems: 'center',
      borderTop: '1px solid #e9f1fa',
      paddingTop: '16px'
    },
    customerAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: athenaBlue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '700',
      marginRight: '10px',
      fontSize: '0.9rem',
      boxShadow: '0 2px 8px rgba(32,115,200,.13)'
    },
    customerName: {
      fontSize: '0.95rem',
      color: athenaBlue,
      fontWeight: '600',
      marginBottom: '2px'
    },
    customerCompany: {
      fontSize: '0.8rem',
      color: '#868dac',
      fontStyle: 'italic'
    },
    navigation: {
      display: 'flex',
      justifyContent: 'center',
      gap: '11px',
      marginTop: '18px',
      marginBottom: '0'
    },
    navDot: {
      width: '13px',
      height: '13px',
      borderRadius: '50%',
      background: '#dceafd',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '2px solid transparent'
    },
    navDotActive: {
      background: athenaBlue,
      borderColor: athenaBlue,
      transform: 'scale(1.18)'
    }
  };

  const handleDotHover = (index) => {
    setActiveDot(index);
  };

  return (
    <div style={styles.mainBox}>
      <div style={styles.contentContainer}>
        <div style={styles.headerSection}>
          <div style={styles.smallHeading}>Testimonials</div>
          <div style={styles.mainHeading}>What Our Clients Say</div>
          <div style={styles.subHeading}>
            Discover why educators and organizations trust Athena for learning management
          </div>
        </div>

        <div style={styles.testimonialsGrid}>
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            style={{
              ...styles.testimonialCard,
              boxShadow:
                activeDot === index
                  ? '0 6px 18px rgba(32,115,200,0.13)'
                  : styles.testimonialCard.boxShadow,
              border:
                activeDot === index
                  ? `2px solid ${athenaBlue}`
                  : styles.testimonialCard.border,
              background:
                activeDot === index
                  ? '#fff'
                  : styles.testimonialCard.background
            }}
            onMouseEnter={() => handleDotHover(index)}
          >
            <div style={styles.stars}>{testimonial.stars}</div>
            <div style={styles.testimonialText}>{testimonial.text}</div>
            <div style={styles.customerInfo}>
              <div style={styles.customerAvatar}>{testimonial.initial}</div>
              <div>
                <div style={styles.customerName}>{testimonial.name}</div>
                <div style={styles.customerCompany}>{testimonial.company}</div>
              </div>
            </div>
          </div>
        ))}
        </div>

        <div style={styles.navigation}>
          {testimonials.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.navDot,
                ...(activeDot === index ? styles.navDotActive : {})
              }}
              onMouseEnter={() => handleDotHover(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
