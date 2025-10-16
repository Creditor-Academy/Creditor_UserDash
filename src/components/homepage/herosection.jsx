import { ArrowUpRight } from "lucide-react";
// import interactive from "../../assets/interactive.mp4";
import Elearning from "../../assets/Elearning.mp4";

export default function Hero() {
  return (
    <section className="hero-section">
      {/* Internal CSS Styles */}
      <style>
        {`
          .hero-section {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            box-sizing: border-box;
            overflow: hidden;
            margin-top: 0;
            padding-top: 0;
          }
          .hero-bg-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            z-index: 0;
          }
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.75) 0%,
              rgba(30, 41, 59, 0.65) 50%,
              rgba(51, 65, 85, 0.75) 100%
            );
            z-index: 1;
          }
          .hero-content {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 120px 3rem 0 3rem; /* Increased top padding (was 80px) */
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100vh;
            box-sizing: border-box;
          }
          .hero-heading {
            font-family: 'Founders Grotesk', Arial, sans-serif;
            font-size: 6.5vw;
            font-weight: 700;
            text-transform: uppercase;
            color: #fff;
            line-height: 1.05;
            letter-spacing: -3px;
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3);
            margin-bottom: 0.3em;
          }
          .hero-sub-links {
            margin-top: 2.2em;
            padding-top: 32px;
            border-top: 1.5px solid rgba(255,255,255,0.35);
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px 18px;
            align-items: center;
            color: #fff;
            font-family: 'Neue Montreal', Arial, sans-serif;
            font-size: 1.05em;
            line-height: 1.5;
            opacity: 0.92;
            width: 100%;
          }
          .hero-desc {
            font-size: 1.02em;
            opacity: 0.91;
            flex: 1 1 320px;
          }
          .hero-action {
            margin-left: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            justify-content: flex-end;
            flex: 1 1 320px;
          }
          .start-btn {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            border: 1.3px solid rgba(59, 130, 246, 0.5);
            color: #fff;
            padding: 7px 26px;
            border-radius: 40px;
            font-size: 1.09em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-family: 'Neue Montreal', Arial, sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px rgba(30, 58, 138, 0.4);
          }
          .start-btn:hover {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            border-color: rgba(59, 130, 246, 0.8);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
          }
          .arrow-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 6px;
            border: 1.3px solid rgba(59, 130, 246, 0.5);
            border-radius: 100%;
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            box-shadow: 0 4px 14px rgba(30, 58, 138, 0.4);
            transition: all 0.3s ease;
          }
          .arrow-icon svg {
            color: #fff;
            transition: all 0.3s ease;
          }
          .start-btn:hover + .arrow-icon {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            border-color: rgba(59, 130, 246, 0.8);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
          }

          /* Large Desktop */
          @media (min-width: 1400px) {
            .hero-content {
              max-width: 1400px;
              padding: 0 4rem;
              padding-top: 120px; /* Ensures larger top padding */
            }
            .hero-heading {
              font-size: 5.8vw;
              letter-spacing: -4px;
            }
          }
          
          /* Desktop */
          @media (max-width: 1200px) {
            .hero-content {
              max-width: 100%;
              padding: 100px 2.5rem 0 2.5rem; /* Was 70px, now 100px */
            }
            .hero-heading {
              font-size: 6vw;
              letter-spacing: -3px;
            }
          }
          
          /* Tablet */
          @media (max-width: 900px) {
            .hero-content {
              margin: 0 auto;
              max-width: 100%;
              padding: 100px 2rem 0 2rem; /* Was 60px, now 100px */
            }
            .hero-heading {
              font-size: 7.5vw;
              letter-spacing: -2.5px;
            }
            .hero-sub-links {
              font-size: 0.98em;
            }
            .hero-desc {
              font-size: 0.98em;
            }
          }
          /* Mobile */
          @media (max-width: 768px) {
            .hero-content {
              margin: 0 auto;
              padding: 120px 1.5rem 0 1.5rem; /* Was 80px, now 120px */
            }
            .hero-heading {
              font-size: 9.5vw;
              letter-spacing: -2px;
              line-height: 1.08;
            }
            .hero-sub-links {
              font-size: 0.95em;
            }
          }
          @media (max-width: 600px) {
            .hero-content {
              margin: 0 auto;
              padding: 120px 1rem 0 1rem; /* Was 80px, now 120px */
            }
            .hero-heading {
              font-size: 11.5vw;
              letter-spacing: -1.8px;
              line-height: 1.1;
            }
            .hero-sub-links {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
              font-size: 0.9em;
            }
            .hero-action {
              margin-left: 0;
              margin-top: 16px;
              width: 100%;
              justify-content: flex-start;
            }
          }
          @media (max-width: 480px) {
            .hero-content {
              padding: 110px 0.8rem 0 0.8rem; /* Was 80px, now 110px */
            }
            .hero-heading {
              font-size: 13vw;
              letter-spacing: -1.5px;
              line-height: 1.12;
            }
            .hero-sub-links {
              font-size: 0.85em;
              gap: 10px;
            }
            .start-btn {
              padding: 6px 20px;
              font-size: 0.9em;
            }
            .arrow-icon {
              width: 30px;
              height: 30px;
            }
          }
          @media (max-width: 360px) {
            .hero-content {
              padding: 100px 0.6rem 0 0.6rem; /* Was 80px, now 100px */
            }
            .hero-heading {
              font-size: 14.5vw;
              letter-spacing: -1.2px;
              line-height: 1.15;
            }
            .hero-sub-links {
              font-size: 0.8em;
            }
            .start-btn {
              padding: 5px 16px;
              font-size: 0.85em;
            }
          }
        `}
      </style>

      <video className="hero-bg-video" autoPlay muted loop playsInline src={Elearning} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-heading">
          Reimagine Learning
          <br/>
          Build, Design, and 
          <br/>
          Deliver With AI
        </h1>
        <div className="hero-sub-links">
          <span className="hero-desc">Athena LMS: Where Instructional Design Meets Artificial Intelligence</span>
          <div className="hero-action">
            <span className="hero-desc">Create Smart Courses In Minutes.</span>
            <a href="/contact" className="start-btn">
              Start Creating
            </a>
            <span className="arrow-icon">
              <ArrowUpRight size={22} strokeWidth={1.35} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}