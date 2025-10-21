import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Target, Lightbulb, CheckCircle, Star, BookOpen, Zap, ArrowUpRight, Play, Award, TrendingUp, Clock, Shield, Globe, X, Brain, Monitor, Users2, Gamepad2, BarChart3, Rocket, Eye, Heart, DollarSign, Workflow, Search, Palette, Code, Upload, BarChart, ChevronLeft, ChevronRight, FileText, Calendar, Send, ExternalLink } from 'lucide-react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';

const InstructionalDesign = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    organization: '',
    email: '',
    projectSummary: ''
  });

  const services = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "Instructional Design Strategy & Needs Analysis",
      description: "Comprehensive analysis of learning objectives, audience needs, and organizational goals to create strategic learning solutions.",
      benefits: [
        "Deep audience analysis and learning gap identification",
        "Strategic learning roadmap development",
        "ROI-focused learning objectives alignment",
        "Competency mapping and skill assessment frameworks",
        "Learning analytics and measurement strategy"
      ]
    },
    {
      icon: <Monitor className="w-8 h-8 text-green-600" />,
      title: "Custom E-Learning & Course Development",
      description: "Bespoke e-learning solutions designed to engage learners and deliver measurable business outcomes.",
      benefits: [
        "Interactive multimedia content development",
        "SCORM-compliant course creation",
        "Mobile-responsive learning experiences",
        "Accessibility-compliant design (WCAG 2.1)",
        "Multi-language content localization"
      ]
    },
    {
      icon: <Users2 className="w-8 h-8 text-purple-600" />,
      title: "LMS Integration & Platform Support",
      description: "Seamless integration with existing learning management systems and comprehensive platform support.",
      benefits: [
        "LMS migration and data transfer",
        "API integration and custom connectors",
        "Single sign-on (SSO) implementation",
        "Platform optimization and performance tuning",
        "24/7 technical support and maintenance"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Live & Virtual Instructor-Led Training",
      description: "Engaging live training sessions that combine traditional instruction with modern virtual delivery methods.",
      benefits: [
        "Virtual classroom setup and management",
        "Interactive training session design",
        "Train-the-trainer programs",
        "Hybrid learning model implementation",
        "Real-time engagement and assessment tools"
      ]
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-indigo-600" />,
      title: "Assessment, Gamification & Micro-Learning",
      description: "Innovative learning approaches that boost engagement through gamification and bite-sized learning modules.",
      benefits: [
        "Gamified learning experiences and leaderboards",
        "Micro-learning module development",
        "Adaptive assessment and personalized learning paths",
        "Badge and certification systems",
        "Learning analytics and progress tracking"
      ]
    }
  ];

  const whyAthena = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "Deep Domain Expertise",
      subtitle: "Corporate & Non-Profit",
      description: "Our team brings decades of experience across corporate training, non-profit education, and government sectors, ensuring solutions that work in real-world environments."
    },
    {
      icon: <Workflow className="w-8 h-8 text-green-600" />,
      title: "End-to-End Delivery",
      subtitle: "Strategy → Analytics",
      description: "From initial strategy and needs analysis through implementation and performance analytics, we handle every aspect of your learning solution."
    },
    {
      icon: <Rocket className="w-8 h-8 text-purple-600" />,
      title: "AI-Enabled, VR-Ready Solutions",
      subtitle: "Future-Proof Technology",
      description: "We leverage cutting-edge AI tools and prepare solutions for emerging technologies like VR/AR to keep your training ahead of the curve."
    },
    {
      icon: <Eye className="w-8 h-8 text-orange-600" />,
      title: "Learner-Centric Design",
      subtitle: "Behavioral Science Grounded",
      description: "Our designs are rooted in cognitive science and behavioral psychology, ensuring learning experiences that truly engage and transform learners."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-indigo-600" />,
      title: "Transparent Pricing & Agile Workflow",
      subtitle: "No Hidden Costs",
      description: "Clear, upfront pricing with flexible payment options and agile development processes that adapt to your changing needs and timelines."
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Discover",
      icon: <Search className="w-8 h-8 text-blue-600" />,
      description: "Deep dive into your learning needs, audience analysis, and business objectives to create a strategic foundation.",
      benefit: "Comprehensive needs assessment ensures alignment with business goals"
    },
    {
      step: "02", 
      title: "Design",
      icon: <Palette className="w-8 h-8 text-green-600" />,
      description: "Create learning objectives, content structure, and engagement strategies tailored to your audience.",
      benefit: "Evidence-based design principles maximize learning effectiveness"
    },
    {
      step: "03",
      title: "Develop", 
      icon: <Code className="w-8 h-8 text-purple-600" />,
      description: "Build interactive content, assessments, and multimedia elements using cutting-edge tools and methodologies.",
      benefit: "Modern technology stack ensures scalable and engaging experiences"
    },
    {
      step: "04",
      title: "Deploy",
      icon: <Upload className="w-8 h-8 text-orange-600" />,
      description: "Seamless implementation with comprehensive testing, feedback integration, and launch support.",
      benefit: "Smooth deployment with minimal disruption to existing workflows"
    },
    {
      step: "05",
      title: "Measure & Iterate",
      icon: <BarChart className="w-8 h-8 text-indigo-600" />,
      description: "Continuous monitoring, analytics, and optimization to ensure ongoing success and improvement.",
      benefit: "Data-driven insights enable continuous improvement and ROI optimization"
    }
  ];

  const caseStudies = [
    {
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      title: "Global Retail Brand",
      result: "Reduced onboarding time by 40%",
      description: "Streamlined employee training program with interactive modules and gamified learning paths.",
      category: "Corporate Training"
    },
    {
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
      title: "Non-Profit Organization",
      result: "Improved compliance pass rate to 98%",
      description: "Comprehensive compliance training program with adaptive assessments and progress tracking.",
      category: "Compliance Training"
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      title: "Healthcare System",
      result: "Increased knowledge retention by 60%",
      description: "Medical training platform with VR simulations and micro-learning modules for healthcare professionals.",
      category: "Healthcare Education"
    }
  ];

  const clients = [
    { name: "Walmart", logo: "https://logos-world.net/wp-content/uploads/2020/09/Walmart-Logo.png" },
    { name: "Disney", logo: "https://logos-world.net/wp-content/uploads/2020/09/Disney-Logo.png" },
    { name: "Microsoft", logo: "https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png" },
    { name: "Amazon", logo: "https://logos-world.net/wp-content/uploads/2020/09/Amazon-Logo.png" },
    { name: "Google", logo: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png" },
    { name: "Apple", logo: "https://logos-world.net/wp-content/uploads/2020/09/Apple-Logo.png" },
    { name: "Tesla", logo: "https://logos-world.net/wp-content/uploads/2020/09/Tesla-Logo.png" },
    { name: "Netflix", logo: "https://logos-world.net/wp-content/uploads/2020/09/Netflix-Logo.png" }
  ];

  const tools = [
    { name: "Articulate 360", logo: "https://logos-world.net/wp-content/uploads/2020/09/Articulate-Logo.png", category: "Authoring" },
    { name: "Adobe Captivate", logo: "https://logos-world.net/wp-content/uploads/2020/09/Adobe-Logo.png", category: "Authoring" },
    { name: "Canvas LMS", logo: "https://logos-world.net/wp-content/uploads/2020/09/Canvas-Logo.png", category: "LMS" },
    { name: "Unity", logo: "https://logos-world.net/wp-content/uploads/2020/09/Unity-Logo.png", category: "VR/AR" },
    { name: "Moodle", logo: "https://logos-world.net/wp-content/uploads/2020/09/Moodle-Logo.png", category: "LMS" },
    { name: "Lectora", logo: "https://logos-world.net/wp-content/uploads/2020/09/Lectora-Logo.png", category: "Authoring" },
    { name: "Camtasia", logo: "https://logos-world.net/wp-content/uploads/2020/09/TechSmith-Logo.png", category: "Video" },
    { name: "AI Avatars", logo: "https://logos-world.net/wp-content/uploads/2020/09/OpenAI-Logo.png", category: "AI" }
  ];

  const resources = [
    {
      title: "The Future of Corporate Learning: AI-Driven Instructional Design",
      excerpt: "Explore how artificial intelligence is revolutionizing corporate training and what it means for your organization's learning strategy.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
      category: "Whitepaper",
      readTime: "8 min read",
      date: "2024-01-15"
    },
    {
      title: "5 Essential Elements of Effective E-Learning Design",
      excerpt: "Discover the key principles that make e-learning courses engaging, effective, and memorable for your learners.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      category: "Blog Post",
      readTime: "5 min read",
      date: "2024-01-10"
    },
    {
      title: "VR in Training: Case Studies from Healthcare to Manufacturing",
      excerpt: "Real-world examples of how virtual reality is transforming training programs across different industries.",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=250&fit=crop",
      category: "Case Study",
      readTime: "12 min read",
      date: "2024-01-05"
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      organization: '',
      email: '',
      projectSummary: ''
    });
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Learner-Centered Design",
      description: "Create content that resonates with your audience's learning preferences and goals.",
      benefit: "40% higher engagement rates"
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Learning Objectives",
      description: "Define clear, measurable outcomes that drive engagement and success.",
      benefit: "2x faster learning outcomes"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-600" />,
      title: "Interactive Content",
      description: "Build engaging experiences with multimedia, simulations, and hands-on activities.",
      benefit: "85% completion rates"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Curriculum Development",
      description: "Structure comprehensive learning paths that build knowledge progressively.",
      benefit: "60% better retention"
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: "Rapid Prototyping",
      description: "Quickly iterate and test learning solutions before full deployment.",
      benefit: "50% faster development"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "Assessment Design",
      description: "Create meaningful evaluations that measure real learning outcomes.",
      benefit: "90% accuracy in measurement"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Training Director",
      company: "TechCorp",
      content: "Athena's instructional design approach transformed our corporate training. Engagement increased by 40% and completion rates doubled.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Educational Consultant",
      company: "EduSolutions",
      content: "The systematic approach to learning design helped us create more effective courses. Our learners love the interactive elements.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Learning Experience Designer",
      company: "InnovateLearn",
      content: "Athena's tools made it easy to apply instructional design principles. The results speak for themselves - better learning outcomes.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const stats = [
    { number: "150+", label: "Courses Built", icon: <BookOpen className="w-6 h-6" />, suffix: "+" },
    { number: "30", label: "Faster Training", icon: <TrendingUp className="w-6 h-6" />, suffix: "%" },
    { number: "50+", label: "Global Enterprise Clients", icon: <Globe className="w-6 h-6" />, suffix: "+" },
    { number: "25+", label: "Non-Profit Partners", icon: <Award className="w-6 h-6" />, suffix: "+" }
  ];


  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Athena Instructional Design - Custom E-Learning Development Services</title>
        <meta name="description" content="Transform learning with expert instructional design services. Custom e-learning development, LMS integration, and training solutions for organizations worldwide." />
        <meta name="keywords" content="instructional design, e-learning development, corporate training, LMS integration, learning management system, custom training solutions" />
        <meta property="og:title" content="Athena Instructional Design - Custom E-Learning Development Services" />
        <meta property="og:description" content="Transform learning with expert instructional design services. Custom e-learning development, LMS integration, and training solutions for organizations worldwide." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Athena Instructional Design - Custom E-Learning Development Services" />
        <meta name="twitter:description" content="Transform learning with expert instructional design services. Custom e-learning development, LMS integration, and training solutions for organizations worldwide." />
        <link rel="canonical" href="/instructional-design" />
      </head>
      
      <Navbar />
      <main className="min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="hero-section">
          <style>
            {`
              body, html {
                overflow-x: hidden;
                max-width: 100%;
              }
              
              .hero-section {
                position: relative;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                overflow: hidden;
                margin-top: 0;
                padding-top: 0;
                background: 
                  linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.95) 50%, rgba(96, 165, 250, 0.95) 100%),
                  url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&crop=faces') center/cover;
                margin-left: calc(50% - 50vw);
                margin-right: calc(50% - 50vw);
              }
              
              .hero-diagonal-lines {
                position: absolute;
                top: 0;
                left: 0;
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
                max-width: 100%;
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
                border: none;
                cursor: pointer;
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
                cursor: pointer;
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
              
              .hero-video-container {
                position: relative;
                width: 100%;
                max-width: 500px;
                aspect-ratio: 16/9;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
              }
              
              .hero-video-placeholder {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.9) 50%, rgba(96, 165, 250, 0.9) 100%),
                            url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=faces') center/cover;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              }
              
              .sticky-cta {
                position: relative;
                z-index: 10;
                box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
                animation: pulse-glow 2s infinite;
              }
              
              @keyframes pulse-glow {
                0%, 100% {
                  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
                }
                50% {
                  box-shadow: 0 8px 35px rgba(251, 191, 36, 0.6);
                }
              }
              
              .play-button {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
              }
              
              .play-button:hover {
                transform: scale(1.1);
                background: rgba(255, 255, 255, 1);
              }
              
              /* Responsive Design */
              @media (max-width: 1200px) {
                .hero-container {
                  padding: 0 2.5rem;
                  gap: 3rem;
                }
                .hero-heading {
                  font-size: 3rem;
                }
              }
              
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
              }
              
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
              }
            `}
          </style>

          <div className="hero-diagonal-lines" />
          <div className="hero-container">
            <div className="hero-left">
              <motion.h1 
                className="hero-heading"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Transform Learning. <span style={{ color: '#fbbf24' }}>Drive Performance.</span>
              </motion.h1>
              <motion.p 
                className="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Custom instructional design & e-learning development for organisations that want results.
              </motion.p>
              <motion.div 
                className="hero-buttons"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <button className="btn-primary sticky-cta">
                  Book a Consultation
                  <ArrowUpRight size={16} strokeWidth={2} />
                </button>
                <button className="btn-secondary">
                  <Play size={16} strokeWidth={2} />
                  Watch Demo
                </button>
              </motion.div>
            </div>
            <div className="hero-right">
              <motion.div 
                className="hero-video-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="hero-video-placeholder">
                  <div className="play-button">
                    <Play size={32} color="#1e40af" fill="#1e40af" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Value Proposition - Animated Stats */}
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Proven Results for Organizations Worldwide
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                Our instructional design expertise delivers measurable outcomes for enterprise and non-profit clients globally.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div 
                    className="flex justify-center mb-6"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    viewport={{ once: true }}
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full text-blue-600 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                      {stat.icon}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ 
                      duration: 1, 
                      delay: index * 0.15 + 0.5
                    }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600">{stat.number}</span>
                    <span className="text-yellow-500">{stat.suffix}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="text-sm text-gray-600 font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.15 + 0.7
                    }}
                    viewport={{ once: true }}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            {/* Additional Trust Indicators */}
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Enterprise-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Global Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">Award-Winning Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                Comprehensive instructional design solutions tailored to your organization's unique learning needs and business objectives.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Athena Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Why Choose Athena Instructional Designers?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Arial, sans-serif' }}>
                We combine deep expertise, cutting-edge technology, and proven methodologies to deliver learning solutions that drive real business results.
              </p>
              
              {/* Founder Quote */}
              <motion.div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-l-4 border-blue-600 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <blockquote className="text-lg text-gray-700 italic mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  "Our mission is to transform how organizations learn and grow. Every learning solution we create is designed not just to educate, but to inspire, engage, and drive measurable performance improvements."
                </blockquote>
                <cite className="text-sm text-blue-600 font-semibold">
                  — Athena Instructional Design Team
                </cite>
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyAthena.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full text-blue-600 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 w-fit">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-blue-600 font-semibold mb-4">
                    {item.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Our Process
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                A proven 5-step methodology that ensures your learning solution is effective, engaging, and aligned with your business objectives.
              </p>
            </motion.div>

            {/* Desktop Timeline */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 via-orange-200 to-indigo-200"></div>
                
                <div className="grid grid-cols-5 gap-8">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="text-center relative"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {/* Step Circle */}
                      <div className="relative z-10 mb-6">
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center mx-auto group hover:scale-105 transition-transform duration-300">
                          <div className="text-center">
                            {step.icon}
                            <div className="text-xs font-bold text-gray-500 mt-1">{step.step}</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {step.benefit}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="lg:hidden">
              <div className="space-y-8">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-6"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {/* Step Circle */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center">
                        <div className="text-center">
                          {step.icon}
                          <div className="text-xs font-bold text-gray-500">{step.step}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full inline-block">
                        {step.benefit}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Arial, sans-serif' }}>
                Real results from organizations that have transformed their learning with our instructional design expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {caseStudies.map((caseStudy, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={caseStudy.image}
                      alt={caseStudy.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {caseStudy.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {caseStudy.title}
                    </h3>
                    <div className="text-2xl font-bold text-green-600 mb-3">
                      {caseStudy.result}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {caseStudy.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                View All Case Studies
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Trusted By
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                Leading organizations worldwide trust Athena for their instructional design and e-learning development needs.
              </p>
            </motion.div>

            {/* Desktop Carousel */}
            <div className="hidden md:block">
              <div className="relative overflow-hidden">
                <motion.div
                  className="flex gap-12 items-center"
                  animate={{
                    x: -currentClientIndex * (200 + 48) // 200px width + 48px gap
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {[...clients, ...clients].map((client, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-48 h-24 bg-white rounded-lg shadow-md border border-gray-100 flex items-center justify-center p-4 hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="max-h-12 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentClientIndex((prev) => (prev - 1 + clients.length) % clients.length)}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentClientIndex((prev) => (prev + 1) % clients.length)}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-6">
                {clients.slice(0, 6).map((client, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-lg shadow-md border border-gray-100 flex items-center justify-center p-4 h-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-8 max-w-full object-contain filter grayscale"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tools & Platforms Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Tools & Platforms We Use
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                We leverage best-in-class tools so your learning is future-ready.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {tools.map((tool, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300 h-32 flex flex-col items-center justify-center">
                    <img
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 mb-2"
                    />
                    <div className="text-xs text-gray-500 font-medium">
                      {tool.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Insights & Resources Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Insights & Resources
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                Stay ahead with the latest insights on instructional design, e-learning trends, and learning technology.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <motion.article
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {resource.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {resource.readTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {resource.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(resource.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <button className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                        <span>Read more</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Our Instructional Design Expertise
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                We combine proven methodologies with cutting-edge technology to create learning experiences that deliver measurable results.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    {feature.benefit}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                Our Proven Design Process
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                A systematic approach that ensures your learning content is effective, engaging, and aligned with your business goals.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <div className="text-sm text-blue-600 font-semibold">
                    {step.duration}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 transform translate-x-4"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                See how our instructional design expertise has transformed learning experiences across industries.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20" style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)"
        }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - CTA Content */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  Ready to Elevate Your Learning?
                </h2>
                <p className="text-xl text-blue-100 mb-8" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Book a free 30-minute consultation to explore your project.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Free 30-minute consultation</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Custom project roadmap</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>No obligation, expert advice</span>
                  </div>
                </div>

                <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2 text-lg mx-auto lg:mx-0">
                  <Calendar className="w-5 h-5" />
                  Schedule Your Consultation
                </button>
              </motion.div>

              {/* Right Side - Contact Form */}
              <motion.div
                className="bg-white rounded-xl shadow-2xl p-8"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Get Started Today
                </h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={contactForm.organization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your company or organization"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your.email@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="projectSummary" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Summary
                    </label>
                    <textarea
                      id="projectSummary"
                      name="projectSummary"
                      value={contactForm.projectSummary}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us about your learning project, goals, and timeline..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-4">
                  We'll respond within 24 hours to schedule your consultation.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {selectedService.icon}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedService.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {selectedService.description}
                </p>
                
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    What's Included:
                  </h4>
                  <ul className="space-y-3">
                    {selectedService.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </>
  );
};

export default InstructionalDesign;
