import React from "react";

export default function Hero() {
  return (
    <section className="thinkific-hero">
      {/* Decorative blurred circles for background */}
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
        .form-card {
          background: linear-gradient(135deg, #f5f7fe 60%, #e6ecf9 100%);
          border-radius: 0;
          padding: 22px 18px 18px 18px;
          border: 1.5px solid #d0daef;
          box-shadow: 0 2px 20px 0 rgba(130,170,215,.06);
          margin-top: -21px;
        }
        .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .f-col { display: grid; gap: 5px; }
        .label { color: #3f4661; font-size: 13.5px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif; }
        .input, .select {
          width: 100%;
          height: 44px;
          border-radius: 9999px;
          border: 1.2px solid #e6ebf9;
          outline: none;
          background: #fafbff;
          padding: 0 16px;
          font-size: 14.2px;
          color: #28294d;
        }
        .input:focus, .select:focus {
          border: 1.2px solid #a87afa;
          background: #fff;
        }
        .helper { color: #7b80a2; font-size: 11.3px; margin-top: -2px; }
        .phone-wrap {
          display: grid; grid-template-columns: 84px 1fr; gap: 6px;
        }
        .cc {
          height: 44px; border-radius: 9999px; background: #fafbff; border: 1.2px solid #e6ebf9; padding: 0 10px;
          color: #54406b;
          font-size: 14.2px;
        }
        .select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #c6b1f7 50%), linear-gradient(135deg, #c6b1f7 50%, transparent 50%); background-position: calc(100% - 22px) calc(1em + 2px), calc(100% - 16px) calc(1em + 2px); background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
        .cta {
          width: 100%;
          height: 44px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #ffe980 0%, #ffd21f 100%);
          color: #23272f;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 14px;
          font-size: 15px;
          font-family: 'Inter', system-ui, sans-serif;
          box-shadow: 0 1px 10px 0 rgba(25,30,60,0.07);
        }
        @media (max-width: 980px){
          .thinkific-wrap { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="thinkific-wrap">
        <div className="left-copy">
          <h1 className="headline">Scale your education 
            <span className="block">programs with 
              <span className="block">Athena LMS </span></span>
            </h1>
          <p className="copy">Get answers to all of your questions on a brief discovery call with one of our 
            <span className="block">solutions experts and cover topics including:</span></p>
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

        <div className="form-card">
          <div className="f-row">
            <div className="f-col">
              <label className="label">First name *</label>
              <input className="input" placeholder="First name" />
            </div>
            <div className="f-col">
              <label className="label">Last name *</label>
              <input className="input" placeholder="Last name" />
            </div>
          </div>

          <div className="f-col" style={{ marginTop: 12
            
           }}>
            <label className="label">Work email *</label>
            <div className="helper">Personal addresses (e.g., Gmail) will show an error.</div>
            <input className="input" placeholder="name@company.com" />
          </div>

          <div className="f-col" style={{ marginTop: 12 }}>
            <label className="label">Phone number *</label>
            <div className="phone-wrap">
              <select className="cc" defaultValue="US">
                <option value="US">+1 US</option>
                <option value="CA">+1 CA</option>
                <option value="GB">+44 UK</option>
                <option value="AU">+61 AU</option>
              </select>
              <input className="input" placeholder="Phone Number" />
            </div>
          </div>

          <div className="f-col" style={{ marginTop: 12 }}>
            <label className="label">Company size *</label>
            <select className="select">
              <option>Number of employees</option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>201-1,000</option>
              <option>1,001+</option>
            </select>
          </div>

          <div className="f-col" style={{ marginTop: 12 }}>
            <label className="label">Your goal with Athena LMS *</label>
            <select className="select">
              <option>Primary use case</option>
              <option>Customer education</option>
              <option>Employee training</option>
              <option>Monetize courses</option>
              <option>Other</option>
            </select>
          </div>

          <button className="cta">Talk to us  </button>
        </div>
      </div>
    </section>
  );
}
