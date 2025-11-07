import React, { useEffect } from "react";

export default function Hero() {
  useEffect(() => {
    // Dynamically load WonderEngine script
    const script = document.createElement("script");
    script.src = "https://api.wonderengine.ai/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="thinkific-hero">
      {/* Decorative blurred circles */}
      <div className="hero-bg-glows">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
      </div>

      <style>{`
        .thinkific-hero {
          width: 100%;
          background: linear-gradient(135deg, #e8f0fd 0%, #edeafe 50%, #efeafd 100%);
          min-height: 600px;
          padding: 96px 24px 56px 24px;
          position: relative;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }
        .hero-bg-glows {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(64px);
          opacity: 0.26;
        }
        .glow-1 {
          top: 55px; right: 60px;
          width: 340px; height: 340px;
          background: radial-gradient(circle, #7fb2ffcc 0%, #7e60facc 100%);
          animation: pulse 18s infinite ease-in-out;
        }
        .glow-2 {
          left: -110px; bottom: 60px;
          width: 190px; height: 190px;
          background: radial-gradient(circle, #d6c4ffcc 0%, #74ffdacc 90%);
          animation: pulse 17s infinite reverse;
        }
        .glow-3 {
          left: 50%; top: 50%;
          width: 180px; height: 180px;
          background: radial-gradient(circle, #96acef55 0%, #d0e1fc11 100%);
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.09); }
        }
        .thinkific-wrap {
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 36px;
          position: relative;
          z-index: 1;
          align-items: center;
        }
        .left-copy {
          color: #23272f;
        }
        .headline {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-weight: 500;
          line-height: 1.12;
          font-size: clamp(28px, 5vw, 46px);
          letter-spacing: -0.4px;
          color: #23272f;
          margin-bottom: 12px;
        }
        .copy {
          margin-top: 16px;
          color: #485067;
          font-size: 15.5px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .bullets { margin-top: 16px; }
        .bullets li {
          color: #424c5b;
          margin: 7px 0;
          display: flex;
          gap: 8px;
          font-size: 14.7px;
        }
        .dot {
          width: 6px; height: 6px; margin-top: 10px; border-radius: 9999px; background: #787add;
          flex-shrink: 0;
        }
        .highlights-row {
          display: flex;
          gap: 18px;
          margin-top: 30px;
          flex-wrap: wrap;
        }
        .highlight-box {
          background: #fff;
          border: 1.5px solid #d4d6ed;
          border-radius: 11px;
          box-shadow: 0 2px 18px 0 rgba(140, 180, 240, 0.08);
          padding: 14px 18px 10px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 96px;
        }
        .highlight-big {
          color: #563dcd;
          font-size: 1.32rem;
          font-weight: 700;
          letter-spacing: -1px;
        }
        .highlight-label {
          font-size: 12px;
          color: #2b325b;
          margin-top: 3px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        /* WonderEngine iframe */
        .form-embed {
          width: 100%;
          height: 480px;
          border: none;
          border-radius: 0;
        }

        @media (max-width: 980px){
          .thinkific-wrap { grid-template-columns: 1fr; }
          .form-embed { height: 520px; }
        }
      `}</style>

      <div className="thinkific-wrap">
        <div className="left-copy">
          <h1 className="headline">
            Scale your education
            <span className="block">programs with <span className="block">Athena LMS</span></span>
          </h1>
          <p className="copy">
            Get answers to all of your questions on a brief discovery call with one of our
            <span className="block">solutions experts and cover topics including:</span>
          </p>
          <ul className="bullets">
            <li><span className="dot" />Find out if Athena LMS meets your needs. If not, we’ll point you in the right direction.</li>
            <li><span className="dot" />Share your short and long–term goals and discuss what’s getting in the way.</li>
            <li><span className="dot" />Learn how companies like yours are using Athena LMS to launch, scale, and streamline education programs that drive revenue and engagement.</li>
          </ul>

          <div className="highlights-row">
            <div className="highlight-box"><div className="highlight-big">1500+</div><div className="highlight-label">Courses</div></div>
            <div className="highlight-box"><div className="highlight-big">450+</div><div className="highlight-label">Learners</div></div>
            <div className="highlight-box"><div className="highlight-big">98%</div><div className="highlight-label">Success Rate</div></div>
            <div className="highlight-box"><div className="highlight-big">24/7</div><div className="highlight-label">Support</div></div>
          </div>
        </div>

        {/* WonderEngine Embed Directly */}
        <iframe
          className="form-embed"
          src="https://api.wonderengine.ai/widget/form/tHMfncbmbEpAOXwKxNxj"
          id="inline-tHMfncbmbEpAOXwKxNxj"
          title="Athena Contact Form"
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Athena Contact Form"
          data-height="477"
          data-layout-iframe-id="inline-tHMfncbmbEpAOXwKxNxj"
          data-form-id="tHMfncbmbEpAOXwKxNxj"
        ></iframe>
      </div>
    </section>
  );
}
