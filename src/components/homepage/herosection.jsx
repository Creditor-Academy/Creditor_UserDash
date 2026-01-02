// import { ArrowUpRight } from 'lucide-react';

// export default function Hero() {
//   return (
//     <section className="hero-section">
//       {/* Internal CSS Styles */}
//       <style>
//         {`
//           .hero-section {
//             position: relative;
//             width: 100%;
//             height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-sizing: border-box;
//             overflow: hidden;
//             margin-top: 0;
//             padding-top: 0;
//             background: linear-gradient(rgba(30, 64, 175, 0.7), rgba(30, 64, 175, 0.7)), url('/6553111.jpg') no-repeat center center/cover;
//           }

//           .tree-decoration {
//             position: absolute;
//             bottom: -40px;
//             right: -10px;
//             width: 200px;
//             height: auto;
//             z-index: 3;
//             opacity: 0.9;
//           }

//           .hero-diagonal-lines {
//             position: absolute;
//             top: 0;
//             right: 0;
//             width: 100%;
//             height: 100%;
//             background:
//               linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 30.5%, rgba(255,255,255,0.1) 31%, transparent 31.5%),
//               linear-gradient(50deg, transparent 35%, rgba(255,255,255,0.08) 35.5%, rgba(255,255,255,0.08) 36%, transparent 36.5%),
//               linear-gradient(55deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.06) 41%, transparent 41.5%);
//             background-size: 200px 200px, 250px 250px, 300px 300px;
//             background-position: 0 0, 50px 50px, 100px 100px;
//             z-index: 1;
//           }

//           .hero-container {
//             position: relative;
//             z-index: 2;
//             width: 100%;
//             max-width: 1400px;
//             margin: 0 auto;
//             padding: 0 3rem;
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 4rem;
//             align-items: center;
//             height: 100vh;
//             box-sizing: border-box;
//           }

//           .hero-left {
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//             height: 100%;
//           }

//           .hero-heading-wrapper {
//             order: 1;
//           }

//           .hero-description-wrapper {
//             order: 3;
//           }

//           .hero-buttons-wrapper {
//             order: 4;
//           }

//           .hero-heading {
//             font-family: 'Georgia', 'Times New Roman', serif;
//             font-size: 3.5rem;
//             font-weight: 400;
//             color: #fff;
//             line-height: 1.1;
//             letter-spacing: -1px;
//             margin-bottom: 1.5rem;
//             text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
//           }

//           .hero-description {
//             font-family: 'Arial', sans-serif;
//             font-size: 1.1rem;
//             color: #fff;
//             line-height: 1.6;
//             margin-bottom: 2.5rem;
//             opacity: 0.95;
//             max-width: 500px;
//           }

//           .hero-buttons {
//             display: flex;
//             gap: 1rem;
//             align-items: center;
//           }

//           .btn-primary {
//             background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
//             color: #000;
//             padding: 12px 24px;
//             border-radius: 8px;
//             font-size: 1rem;
//             font-weight: 600;
//             font-family: 'Arial', sans-serif;
//             text-decoration: none;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             transition: all 0.3s ease;
//             box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
//           }

//           .btn-primary:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
//           }

//           .btn-secondary {
//             background: transparent;
//             color: #fff;
//             padding: 12px 24px;
//             border: 1px solid #fff;
//             border-radius: 8px;
//             font-size: 1rem;
//             font-weight: 600;
//             font-family: 'Arial', sans-serif;
//             text-decoration: none;
//             transition: all 0.3s ease;
//           }

//           .btn-secondary:hover {
//             background: rgba(255, 255, 255, 0.1);
//             transform: translateY(-2px);
//           }

//           .hero-right {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             height: 100%;
//             position: relative;
//             width: 100%;
//           }

//           .hero-video-container {
//             position: relative;
//             width: 100%;
//             max-width: 800px;
//             aspect-ratio: 16 / 9;
//             border-radius: 16px;
//             overflow: hidden;
//             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
//             background: rgba(0, 0, 0, 0.2);
//           }

//           .hero-video-container iframe,
//           .hero-video-container video {
//             width: 100%;
//             height: 100%;
//             border: none;
//             border-radius: 16px;
//             object-fit: cover;
//           }

//           /* Large Desktop */
//           @media (min-width: 1400px) {
//             .hero-container {
//               max-width: 1600px;
//               padding: 0 4rem;
//             }
//             .hero-heading {
//               font-size: 4rem;
//             }
//           }

//           /* Desktop */
//           @media (max-width: 1200px) {
//             .hero-container {
//               padding: 0 2.5rem;
//               gap: 3rem;
//             }
//             .hero-heading {
//               font-size: 3rem;
//             }
//           }

//           /* Tablet */
//           @media (max-width: 900px) {
//             .hero-container {
//               grid-template-columns: 1fr;
//               gap: 1rem; /* reduced spacing */
//               padding: 1.5rem;
//               text-align: center;
//             }
//             .hero-left {
//               order: 2;
//             }
//             .hero-right {
//               order: 1;
//               margin-bottom: 1rem;
//             }
//             .hero-heading {
//               font-size: 2.5rem;
//             }
//           }

//           /* Mobile */
//           @media (max-width: 768px) {
//             .hero-container {
//               display: flex;
//               flex-direction: column;
//               padding: 1rem;
//               gap: 1.5rem;
//               height: 100vh;
//               justify-content: center;
//               align-items: center;
//               text-align: center;
//             }
//             .hero-left {
//               display: contents;
//             }
//             .hero-right {
//               display: contents;
//             }
//             .hero-heading-wrapper {
//               order: 1;
//               margin-bottom: 1.5rem;
//               width: 100%;
//             }
//             .hero-video-container {
//               order: 2;
//               margin-bottom: 1.5rem;
//               width: 100%;
//               max-width: 100%;
//             }
//             .hero-description-wrapper {
//               order: 3;
//               margin-bottom: 1.5rem;
//               width: 100%;
//               display: flex;
//               justify-content: center;
//             }
//             .hero-buttons-wrapper {
//               order: 4;
//               width: 100%;
//             }
//             .hero-heading {
//               font-size: 2.1rem;
//             }
//             .hero-description {
//               font-size: 1rem;
//               margin-left: auto;
//               margin-right: auto;
//             }
//             .hero-buttons {
//               flex-direction: column;
//               align-items: center;
//               gap: 0.8rem;
//             }
//             .btn-primary,
//             .btn-secondary {
//               width: 100%;
//               max-width: 250px;
//               justify-content: center;
//             }
//           }

//           @media (max-width: 480px) {
//             .hero-container {
//               padding: 0.8rem;
//               gap: 1rem;
//             }
//             .hero-heading-wrapper {
//               margin-bottom: 1rem;
//             }
//             .hero-video-container {
//               margin-bottom: 1rem;
//             }
//             .hero-description-wrapper {
//               margin-bottom: 1rem;
//             }
//             .hero-heading {
//               font-size: 1.8rem;
//             }
//             .hero-description {
//               font-size: 0.95rem;
//             }
//           }
//         `}
//       </style>

//       <div className="hero-diagonal-lines" />
//       {/* <img
//         src="/tree-removebg-preview.png"
//         alt="Decorative tree"
//         className="tree-decoration"
//       /> */}
//       <div className="hero-container">
//         <div className="hero-left">
//           <div className="hero-heading-wrapper">
//             <h1 className="hero-heading">
//               Reimagine Learning. Build, Design, and Deliver Courses with AI.
//             </h1>
//           </div>
//           <div className="hero-description-wrapper">
//             <p className="hero-description">
//               Athena LMS is where Instructional Design meets Artificial
//               Intelligence — a unified platform that helps you create engaging,
//               research-backed courses in minutes.
//             </p>
//           </div>
//           <div className="hero-buttons-wrapper">
//             <div className="hero-buttons">
//               <a href="/contact" className="btn-primary">
//                 Start Creating
//                 <ArrowUpRight size={16} strokeWidth={2} />
//               </a>
//               <a href="https://scheduler.zoom.us/prerna-mishra/website-requirement-meeting" className="btn-secondary">
//                 Book a Demo
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="hero-right">
//           <div className="hero-video-container">
//             <video
//               src="https://websiteathena.s3.eu-north-1.amazonaws.com/Athena+LMS++website+video+2nd.mp4"
//               // src="/LMS.mp4"
//               controls
//               autoPlay
//               muted
//               loop
//               playsInline
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 borderRadius: '12px',
//                 objectFit: 'cover',
//                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
//               }}
//             >
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isMarketplaceVisible, setIsMarketplaceVisible] = useState(false);
  const [isCTAVisible, setIsCTAVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsHeroVisible(true);
    }, 300);
    const timer2 = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);
    const timer3 = setTimeout(() => {
      setIsMarketplaceVisible(true);
    }, 700);
    const timer4 = setTimeout(() => {
      setIsCTAVisible(true);
    }, 900);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated blue nodes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-5 h-5 bg-indigo-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-sky-300 rounded-full animate-ping"></div>

        {/* Animated blue grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.05)_0%,rgba(30,64,175,0)_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Soft glowing light effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#6fa4f7]/95 backdrop-blur-md border-b border-blue-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-white font-bold text-2xl">Athena Software</div>
          </div>
          <div className="flex space-x-6">
            <button className="text-white/90 font-medium hover:text-white transition-colors">
              Products
            </button>
            <button className="text-white/90 font-medium hover:text-white transition-colors">
              Solutions
            </button>
            <button className="text-white/90 font-medium hover:text-white transition-colors">
              Pricing
            </button>
            <button className="px-4 py-2 text-white font-medium hover:text-blue-100 transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 w-full py-4 md:py-10 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Column - Headlines and CTAs */}
            <div className="lg:w-1/2">
              {/* Top Badge */}
              <div
                className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                  <span className="mr-2">🚀</span>
                  World’s First L&D E-Commerce Marketplace
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className={`text-4xl md:text-5xl font-bold mb-6 text-white transition-all duration-700 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Athena Software
                </span>
              </h1>

              <h2
                className={`text-2xl md:text-2xl font-bold mb-6 text-white transition-all duration-700 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                The world's first all-in-one E-commerce marketplace built
                exclusively for Instructional Designers, Training Teams, and
                Learning & Development professionals.
              </h2>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${isCTAVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <a
                  href="/contact"
                  className="px-6 py-3 bg-white text-[#3b82f6] font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-md shadow-white/20"
                >
                  Start Free Trial
                </a>
                <button className="px-6 py-3 bg-[#3b82f6]/80 text-white font-semibold rounded-lg hover:bg-[#3b82f6] transition-all">
                  Browse Marketplace
                </button>
                <a
                  href="https://scheduler.zoom.us/prerna-mishra/website-requirement-meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 text-white font-medium hover:text-blue-100 transition-colors"
                >
                  Book a Personalized Demo
                </a>
              </div>
            </div>

            {/* Right Column - AI Feature Flow / Timeline */}
            <div className="lg:w-1/2">
              <div
                className={`relative transition-all duration-700 ${isMarketplaceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="space-y-6">
                  {/* Feature 1 */}
                  <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white text-lg">📚</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">
                          SCORM Course Builders
                        </h4>
                        <p className="text-white/80 text-sm">
                          Compliant content creation tools
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-1 h-8 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Feature 2 */}
                  <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white text-lg">👨‍🏫</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">
                          Virtual Instructors
                        </h4>
                        <p className="text-white/80 text-sm">
                          Lifelike AI agents for engagement
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-1 h-8 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Feature 3 */}
                  <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">
                          Analytics Dashboard
                        </h4>
                        <p className="text-white/80 text-sm">
                          Performance insights & actionable data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Athena Exists Section */}
      <section className="py-16 bg-gradient-to-b from-[#f0f9ff] to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                The Athena Difference
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Transform your learning & development with AI-powered solutions
                that accelerate growth and drive results
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-[#1e293b] mb-8">
                  Imagine an Amazon-style digital superstore where you can
                  instantly shop for every AI-powered tool you need — from
                  SCORM-compliant course builders and stunning visual designers
                  to lifelike virtual instructors, interactive digital books,
                  gamified LMS, and 24/7 AI agents — all under one roof.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-[#3b82f6] text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-[#1e293b] mb-1">
                        No more juggling 10 different subscriptions
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-[#3b82f6] text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-[#1e293b] mb-1">
                        No more hiring expensive designers, developers, or
                        specialists
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-[#3b82f6] text-xl">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-[#1e293b] mb-1">
                        No more waiting months for content
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#dbeafe] rounded-full mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-bold text-xl text-[#1e293b]">
                    Instant Deployment
                  </h4>
                </div>
                <p className="text-gray-600 text-center mb-6">
                  With Athena, you browse, select, customize, and deploy
                  world-class learning experiences in minutes.
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#1e293b] font-semibold">
                      Cost Reduction
                    </span>
                    <span className="text-[#3b82f6] font-bold text-lg">
                      80%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#1e293b] font-semibold">
                      Time Acceleration
                    </span>
                    <span className="text-[#3b82f6] font-bold text-lg">
                      Hours vs Months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Training Section */}
      {/* <section className="py-16 bg-gradient-to-b from-white to-[#f0f9ff]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Why Training Matters</h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Transform your learning & development with AI-powered solutions that accelerate growth and drive results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-bold text-xl text-[#1e293b] mb-3 text-center md:text-left">Increase Performance</h4>
                <p className="text-gray-600 text-center md:text-left">Boost employee productivity and performance with personalized learning paths</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-bold text-xl text-[#1e293b] mb-3 text-center md:text-left">Targeted Skills</h4>
                <p className="text-gray-600 text-center md:text-left">Focus on specific skills gaps with AI-driven content recommendations</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-bold text-xl text-[#1e293b] mb-3 text-center md:text-left">Business Impact</h4>
                <p className="text-gray-600 text-center md:text-left">Measure real business outcomes from your learning investments</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Instructional Design Section */}
      {/* <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-4">Instructional Design Excellence</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines cutting-edge AI with proven instructional design principles</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/2">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e293b] mb-1">Smart Content Generation</h4>
                      <p className="text-gray-600 text-sm">Create lessons from any input with AI assistance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e293b] mb-1">Adaptive Learning Paths</h4>
                      <p className="text-gray-600 text-sm">Personalize experiences based on learner needs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e293b] mb-1">Interactive Elements</h4>
                      <p className="text-gray-600 text-sm">Engage learners with dynamic content types</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#1e293b] font-semibold">Content Creation</span>
                      <span className="text-[#3b82f6] font-bold text-lg">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#3b82f6] h-3 rounded-full" style={{width: '98%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#1e293b] font-semibold">Engagement Rate</span>
                      <span className="text-[#3b82f6] font-bold text-lg">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#3b82f6] h-3 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#1e293b] font-semibold">Retention Rate</span>
                      <span className="text-[#3b82f6] font-bold text-lg">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#3b82f6] h-3 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#1e293b] font-semibold">Completion Rate</span>
                      <span className="text-[#3b82f6] font-bold text-lg">91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#3b82f6] h-3 rounded-full" style={{width: '91%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Benefit Strip */}
      <section className="py-16 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-all duration-300 animate-pulse">
                5-10
              </div>
              <p className="text-white/90 group-hover:text-white transition-all duration-300">
                Replace tools with one ecosystem
              </p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-all duration-300 animate-pulse">
                80%
              </div>
              <p className="text-white/90 group-hover:text-white transition-all duration-300">
                Cut L&D costs by up to 80%
              </p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-all duration-300 animate-pulse">
                Hours
              </div>
              <p className="text-white/90 group-hover:text-white transition-all duration-300">
                Launch training in hours, not months
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
