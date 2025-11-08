import React from 'react';
import formbg from '../../assets/formbg.mp4';

export const Form = () => {
  return (
    <section className="contact-form-section" style={styles.container}>
      <style>{`
        /* Responsive tweaks scoped to the contact form section */
        .contact-form-section { 
          padding: 8vh 2vw 8vh 2vw;
          background: linear-gradient(to bottom, #ffffff, #f9fbff 70%, #e6f2ff 100%);
        }
        
        .contact-form-iframe { 
          height: 1328px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.01), 0 1.5px 12px rgba(10, 41, 49, 0.1);
        }
        
        .contact-form-video { 
          display: block;
          filter: brightness(0.9);
        }

        @media (max-width: 1200px) {
          .contact-form-section { padding: 6vh 2vw 6vh 2vw; }
          .contact-form-iframe { height: 1250px; }
        }

        @media (max-width: 1024px) {
          .contact-form-section { padding: 5vh 2vw 5vh 2vw; }
          .contact-form-iframe { height: 1100px; }
        }

        @media (max-width: 900px) {
          .contact-form-section { padding: 4vh 2vw 4vh 2vw; }
          .contact-form-iframe { height: 1200px; }
        }

        @media (max-width: 768px) {
          .contact-form-section { padding: 4vh 3vw 4vh 3vw; }
          .contact-form-iframe { height: 1250px; }
        }

        @media (max-width: 600px) {
          .contact-form-section { 
            padding: 3vh 4vw 3vh 4vw;
            background: linear-gradient(to bottom, #ffffff, #f9fbff 90%, #e6f2ff 100%);
          }
          .contact-form-iframe { 
            height: 1400px;
            border-radius: 12px;
          }
          /* Keep video but make it more subtle */
          .contact-form-video { 
            display: block;
            filter: brightness(0.8);
          }
        }
        
        @media (max-width: 480px) {
          .contact-form-section { padding: 2vh 5vw 2vh 5vw; }
          .contact-form-iframe { 
            height: 1450px;
            border-radius: 10px;
          }
        }
      `}</style>
      
      {/* Background video */}
      <video
        className="contact-form-video"
        autoPlay
        loop
        muted
        playsInline
        style={styles.videoBackground}
      >
        <source src={formbg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle blue overlay */}
      <div style={styles.blueOverlay}></div>

      {/* Form content with Hero-like container width */}
      <div style={styles.formWrapper}>
        <iframe
          src="https://api.wonderengine.ai/widget/form/dCgUnKpQ6hAXUgj5doxe"
          className="contact-form-iframe"
          style={styles.formIframe}
          title="Athena Contact"
        ></iframe>
      </div>
    </section>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '80vh',
    padding: '8vh 2vw 8vh 2vw',
    background: 'linear-gradient(to bottom, #ffffff, #f9fbff 70%, #e6f2ff 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBackground: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    pointerEvents: 'none',
  },
  blueOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: '#b3d9ff',
    opacity: 0.15,
    zIndex: 5,
    pointerEvents: 'none',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
  },
  formIframe: {
    width: '100%',
    height: '1328px',
    border: 'none',
    borderRadius: '16px',
    background: 'transparent',
  },
};

export default Form;