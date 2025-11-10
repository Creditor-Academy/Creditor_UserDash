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

          .hero-heading-wrapper {
            order: 1;
          }

          .hero-description-wrapper {
            order: 3;
          }

          .hero-buttons-wrapper {
            order: 4;
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
            width: 100%;
          }

          .hero-video-container {
            position: relative;
            width: 100%;
            max-width: 800px;
            aspect-ratio: 16 / 9;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            background: rgba(0, 0, 0, 0.2);
          }

          .hero-video-container iframe,
          .hero-video-container video {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 16px;
            object-fit: cover;
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
          }

          /* Tablet */
          @media (max-width: 900px) {
            .hero-container {
              grid-template-columns: 1fr;
              gap: 1rem; /* reduced spacing */
              padding: 1.5rem;
              text-align: center;
            }
            .hero-left {
              order: 2;
            }
            .hero-right {
              order: 1;
              margin-bottom: 1rem;
            }
            .hero-heading {
              font-size: 2.5rem;
            }
          }

          /* Mobile */
          @media (max-width: 768px) {
            .hero-container {
              display: flex;
              flex-direction: column;
              padding: 1rem;
              gap: 1.5rem;
              height: 100vh;
              justify-content: center;
              align-items: center;
              text-align: center;
            }
            .hero-left {
              display: contents;
            }
            .hero-right {
              display: contents;
            }
            .hero-heading-wrapper {
              order: 1;
              margin-bottom: 1.5rem;
              width: 100%;
            }
            .hero-video-container {
              order: 2;
              margin-bottom: 1.5rem;
              width: 100%;
              max-width: 100%;
            }
            .hero-description-wrapper {
              order: 3;
              margin-bottom: 1.5rem;
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .hero-buttons-wrapper {
              order: 4;
              width: 100%;
            }
            .hero-heading {
              font-size: 2.1rem;
            }
            .hero-description {
              font-size: 1rem;
              margin-left: auto;
              margin-right: auto;
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
          }

          @media (max-width: 480px) {
            .hero-container {
              padding: 0.8rem;
              gap: 1rem;
            }
            .hero-heading-wrapper {
              margin-bottom: 1rem;
            }
            .hero-video-container {
              margin-bottom: 1rem;
            }
            .hero-description-wrapper {
              margin-bottom: 1rem;
            }
            .hero-heading {
              font-size: 1.8rem;
            }
            .hero-description {
              font-size: 0.95rem;
            }
          }
        `}
      </style>

      <div className="hero-diagonal-lines" />
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-heading-wrapper">
            <h1 className="hero-heading">
              Reimagine Learning. Build, Design, and Deliver Courses with AI.
            </h1>
          </div>
          <div className="hero-description-wrapper">
            <p className="hero-description">
              LMS Athena is where Instructional Design meets Artificial Intelligence — a unified platform that helps you create engaging, research-backed courses in minutes.
            </p>
          </div>
          <div className="hero-buttons-wrapper">
            <div className="hero-buttons">
              <a href="/contact" className="btn-primary">
                Start Creating
                <ArrowUpRight size={16} strokeWidth={2} />
              </a>
              <a href="/login" className="btn-secondary">
                Book a Demo
              </a>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-video-container">
            <video
              src="https://websiteathena.s3.eu-north-1.amazonaws.com/Athena+LMS++website+video+2nd.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
