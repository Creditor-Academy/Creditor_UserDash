import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import athenadash from "../../assets/AthenaDash.png";
import interactive from "../../assets/interactive.mp4";

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
    to bottom,
    rgba(30, 58, 138, 0.4),  /* from-blue-900/40 */
    rgba(30, 64, 175, 0.3),  /* via-blue-800/30 */
    rgba(30, 58, 138, 0.4)   /* to-blue-900/40 */
  );
  z-index: 1;
}

          .hero-content {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 3rem 0 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100vh;
            box-sizing: border-box;
          }
          .hero-heading {
            font-family: 'Founders Grotesk', Arial, sans-serif;
            font-size: 4.7vw;
            font-weight: 600;
            text-transform: uppercase;
            color: #fff;
            line-height: 0.95;
            letter-spacing: -2px;
          }
          .hero-heading .inline-img {
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            margin: 0 8px;
          }
          .hero-heading img {
            height: 90px;
            object-fit: cover;
            border-radius: 6px;
            margin-top: 0.5rem;
            margin-right: 12px;
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
            background: rgba(255,255,255,0.13);
            border: 1.3px solid rgba(255,255,255,0.63);
            color: #fff;
            padding: 7px 26px;
            border-radius: 40px;
            font-size: 1.09em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-family: 'Neue Montreal', Arial, sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
          }
          .start-btn:hover {
            background: #fff;
            color: #18326b;
          }
          .arrow-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 6px;
            border: 1.3px solid rgba(255,255,255,0.63);
            border-radius: 100%;
            width: 35px;
            height: 35px;
            background: rgba(255,255,255,0.11);
          }
          .arrow-icon svg {
            color: #fff;
            transition: color 0.2s;
          }
          .start-btn:hover + .arrow-icon svg {
            color: #18326b;
          }
          /* Large Desktop */
          @media (min-width: 1400px) {
            .hero-content {
              max-width: 1400px;
              padding: 0 4rem;
            }
          }
          
          /* Desktop */
          @media (max-width: 1200px) {
            .hero-content {
              max-width: 100%;
              padding: 70px 2.5rem 0 2.5rem;
            }
            .hero-heading {
              font-size: 4.2vw;
            }
          }
          
          /* Tablet */
          @media (max-width: 900px) {
            .hero-content {
              margin: 0 auto;
              max-width: 100%;
              padding: 60px 2rem 0 2rem;
            }
            .hero-heading {
              font-size: 6.5vw;
            }
            .hero-heading img {
              height: 60px;
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
              padding: 80px 1.5rem 0 1.5rem;
            }
            .hero-heading {
              font-size: 8vw;
            }
            .hero-heading img {
              height: 45px;
            }
            .hero-sub-links {
              font-size: 0.95em;
            }
          }
          
          @media (max-width: 600px) {
            .hero-content {
              margin: 0 auto;
              padding: 80px 1rem 0 1rem;
            }
            .hero-heading {
              font-size: 10vw;
            }
            .hero-heading img {
              height: 35px;
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
          
          /* Small Mobile */
          @media (max-width: 480px) {
            .hero-content {
              padding: 80px 0.8rem 0 0.8rem;
            }
            .hero-heading {
              font-size: 12vw;
            }
            .hero-heading img {
              height: 28px;
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
          
          /* Extra Small Mobile */
          @media (max-width: 360px) {
            .hero-content {
              padding: 80px 0.6rem 0 0.6rem;
            }
            .hero-heading {
              font-size: 13vw;
            }
            .hero-heading img {
              height: 24px;
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

      <video className="hero-bg-video" autoPlay muted loop playsInline src={interactive} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-heading">
          Transform Your Learning
          <br/>
          <span className="inline-img" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              transition={{ ease: [0.86, 0, 0.07, 0.995], duration: 1, delay: 1.5 }}
              style={{ display: 'inline-block', overflow: 'hidden' }}
            >
              <img src={athenadash} alt="Athena Logo" />
            </motion.span>
          </span>
          Skill Enhancing
          <br/>
          Experience
        </h1>
        <div className="hero-sub-links">
          <span className="hero-desc">For students, educators, and lifelong learners</span>
          <div className="hero-action">
            <span className="hero-desc">From first lesson to mastery</span>
            <a href="/contact" className="start-btn">
              Start Learning
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
