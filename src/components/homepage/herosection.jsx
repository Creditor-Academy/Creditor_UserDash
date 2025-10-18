import { ArrowUpRight } from "lucide-react";

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
            justify-content: center;
            box-sizing: border-box;
            overflow: hidden;
            margin-top: 0;
            padding-top: 0;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
          }
          
          .hero-diagonal-lines {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: 
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 30.5%, rgba(255,255,255,0.1) 31%, transparent 31.5%),
              linear-gradient(50deg, transparent 35%, rgba(255,255,255,0.08) 35.5%, rgba(255,255,255,0.08) 36%, transparent 36.5%),
              linear-gradient(55deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.06) 41%, transparent 41.5%);
            background-size: 200px 200px, 250px 250px, 300px 300px;
            background-position: 0 0, 50px 50px, 100px 100px;
            z-index: 1;
          }
          
          .hero-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 3rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            height: 100vh;
            box-sizing: border-box;
          }
          
          .hero-left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
          }
          
          .hero-heading {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 3.5rem;
            font-weight: 400;
            color: #fff;
            line-height: 1.1;
            letter-spacing: -1px;
            margin-bottom: 1.5rem;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          
          .hero-description {
            font-family: 'Arial', sans-serif;
            font-size: 1.1rem;
            color: #fff;
            line-height: 1.6;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            max-width: 500px;
          }
          
          .hero-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }
          
          .btn-secondary {
            background: transparent;
            color: #fff;
            padding: 12px 24px;
            border: 1px solid #fff;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
          
          .hero-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            position: relative;
          }
          
          .portrait-container {
            position: relative;
            width: 300px;
            height: 400px;
            margin-bottom: 2rem;
          }
          
          .portrait-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          
          .portrait-placeholder::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%),
              linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          }
          
          .portrait-icon {
            font-size: 4rem;
            color: rgba(255, 255, 255, 0.8);
            z-index: 1;
          }
          
          .testimonial-text {
            text-align: left;
            color: #fff;
            max-width: 300px;
          }
          
          .testimonial-name {
            font-family: 'Arial', sans-serif;
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          
          .testimonial-title {
            font-family: 'Arial', sans-serif;
            font-size: 1rem;
            margin-bottom: 0.5rem;
            opacity: 0.9;
          }
          
          .testimonial-description {
            font-family: 'Arial', sans-serif;
            font-size: 0.9rem;
            opacity: 0.8;
            line-height: 1.4;
          }

          /* Large Desktop */
          @media (min-width: 1400px) {
            .hero-container {
              max-width: 1600px;
              padding: 0 4rem;
            }
            .hero-heading {
              font-size: 4rem;
            }
            .portrait-container {
              width: 350px;
              height: 450px;
            }
          }
          
          /* Desktop */
          @media (max-width: 1200px) {
            .hero-container {
              padding: 0 2.5rem;
              gap: 3rem;
            }
            .hero-heading {
              font-size: 3rem;
            }
            .portrait-container {
              width: 280px;
              height: 380px;
            }
          }
          
          /* Tablet */
          @media (max-width: 900px) {
            .hero-container {
              grid-template-columns: 1fr;
              gap: 2rem;
              padding: 2rem;
              text-align: center;
            }
            .hero-left {
              order: 2;
            }
            .hero-right {
              order: 1;
            }
            .hero-heading {
              font-size: 2.5rem;
            }
            .portrait-container {
              width: 250px;
              height: 320px;
            }
            .testimonial-text {
              text-align: center;
            }
          }
          
          /* Mobile */
          @media (max-width: 768px) {
            .hero-container {
              padding: 1.5rem;
              gap: 1.5rem;
            }
            .hero-heading {
              font-size: 2.2rem;
            }
            .hero-description {
              font-size: 1rem;
            }
            .hero-buttons {
              flex-direction: column;
              align-items: center;
              gap: 0.8rem;
            }
            .btn-primary,
            .btn-secondary {
              width: 100%;
              max-width: 250px;
              justify-content: center;
            }
            .portrait-container {
              width: 200px;
              height: 260px;
            }
          }
          
          @media (max-width: 480px) {
            .hero-container {
              padding: 1rem;
            }
            .hero-heading {
              font-size: 1.8rem;
            }
            .hero-description {
              font-size: 0.95rem;
            }
            .portrait-container {
              width: 180px;
              height: 240px;
            }
            .testimonial-name {
              font-size: 1.1rem;
            }
            .testimonial-title {
              font-size: 0.9rem;
            }
            .testimonial-description {
              font-size: 0.8rem;
            }
          }
        `}
      </style>

      <div className="hero-diagonal-lines" />
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-heading">
            Powering the world's top learning businesses
          </h1>
          <p className="hero-description">
            Transform your expertise into courses, communities, and other high-quality learning experiences. Our platform is designed to drive revenue growth for businesses like yours.
          </p>
          <div className="hero-buttons">
            <a href="/contact" className="btn-primary">
              Talk to sales
              <ArrowUpRight size={16} strokeWidth={2} />
            </a>
            <a href="/trial" className="btn-secondary">
              Start free trial
            </a>
          </div>
        </div>
        <div className="hero-right">
          <div className="portrait-container">
            <div className="portrait-placeholder">
              <div className="portrait-icon">👤</div>
            </div>
          </div>
          <div className="testimonial-text">
            <div className="testimonial-name">Jacques Wong</div>
            <div className="testimonial-title">Founder, PNC Learning</div>
            <div className="testimonial-description">Made millions offering online insurance courses on Thinkific</div>
          </div>
        </div>
      </div>
    </section>
  );
}