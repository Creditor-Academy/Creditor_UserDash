import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CreditCard, BarChart3, Globe, Zap, Shield, Users, FileText, Target, TrendingUp, Clock, Settings } from 'lucide-react';
import Scorm from '../../assets/Scorm.png';
import Course from '../../assets/Course.png';
import Dashboard from '../../assets/Dashboard.png';

const Buildfeature = () => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = [useRef(null), useRef(null), useRef(null)];

  const features = [
    {
      id: 0,
      title: "Build high-quality learning experiences",
      description: "From online communities to engaging courses, you have the tools and support you need to customize and deliver powerful learning experiences exactly the way you want — no developer experience needed.",
      items: [
        { text: "Unlimited courses and digital downloads", icon: BookOpen },
        { text: "Unlimited websites, landing pages, and custom domains", icon: Globe },
        { text: "AI-powered content creation", icon: Zap },
        { text: "SCORM-compliant LMS", icon: Shield },
        { text: "Customized learning paths", icon: Target }
      ],
      image: Course // Feature 1 image
    },
    {
      id: 1,
      title: "Selling tools: Sell more with ease",
      description: "Earn more revenue with smart selling features on Athena LMS, our built-in selling and payment solution designed for maximum conversion. Athena LMS users sell up to 31% more!",
      items: [
        { text: "B2B selling features like Group Orders and Invoicing", icon: Users },
        { text: "Multiple payment options", icon: CreditCard },
        { text: "Upsell tools like coupons and order bumps", icon: TrendingUp },
        { text: "Sale recovery features like failed payment and abandoned cart emails", icon: Clock },
        { text: "Automatic tax collection and remittance for U.S. and Canadian sales", icon: FileText },
        { text: "Simplified tax management for your sales in the EU and UK", icon: Settings }
      ],
      image: Dashboard // Feature 2 image (add another image for this section)
    },
    {
      id: 2,
      title: "Analytics: Measure performance that matters",
      description: "Our advanced analytics tools underpin your learning business, surfacing important, actionable insights that allow you and your customers to drive more meaningful results. Track learner value, marketing strategies, and revenue growth to see where you can deliver more relevant offerings.",
      items: [
        { text: "Advanced analytics", icon: BarChart3 },
        { text: "Custom dashboards to track student engagement and revenue", icon: TrendingUp },
        { text: "Automatically scheduled reports to stakeholders", icon: FileText },
        { text: "Unlimited roles and permissions", icon: Settings }
      ],
      image: Scorm // Feature 3 image
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      sectionRefs.forEach((ref, index) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial check with a small delay
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Features Section */}
      <section className="relative py-12" style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)"
      }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Section Heading */}
          <div className="text-center mb-16 pt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              Athena's stand-out suite of features
            </h1>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Scrollable Content */}
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                ref={sectionRefs[index]}
                className="min-h-[450px] lg:min-h-[450px] flex items-center py-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: false, margin: "-150px" }}
                  className="space-y-4 ml-8 lg:ml-12"
                >
                  {/* Title */}
                  <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                    {feature.title}
                  </h2>

                  {/* Description */}
                  <p className="text-base text-gray-700 leading-relaxed max-w-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {feature.description}
                  </p>

                  {/* Feature List */}
                  <div className="space-y-3 mt-6 pt-2">
                    {feature.items.map((item, idx) => {
                      const IconComponent = item.icon;
                      // Different background shades for each feature section to match image containers
                      const backgroundShades = [
                        "bg-gradient-to-br from-cyan-100 via-cyan-100 to-cyan-200", // Build section - cyan theme
                        "bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200", // Selling section - blue theme
                        "bg-gradient-to-br from-violet-100 via-violet-100 to-violet-200" // Analytics section - violet theme
                      ];
                      
                      return (
                        <div key={idx} className={`${backgroundShades[feature.id]} rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <IconComponent className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-black text-sm leading-relaxed">
                              {item.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right Side - Sticky Image Panel */}
          <div className="lg:sticky lg:top-32 hidden lg:block">
            <div className="relative w-full aspect-[16/10] rounded-lg shadow-2xl overflow-hidden">
              {/* Image Container with Smooth Transitions */}
              {features.map((feature, index) => {
                // Different background shades for each image
                const backgroundShades = [
                  "bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100", // Build section - cyan theme
                  "bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100", // Selling section - blue theme
                  "bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100" // Analytics section - violet theme
                ];
                
                return (
                  <motion.div
                    key={feature.id}
                    initial={false}
                    animate={{
                      opacity: activeSection === index ? 1 : 0,
                      zIndex: activeSection === index ? 10 : 1,
                    }}
                    transition={{ 
                      duration: 0.5, 
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {feature.image ? (
                      <div className={`w-full h-full flex items-center justify-center p-4 ${backgroundShades[index]}`}>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${backgroundShades[index]}`}>
                        <div className="text-center p-6">
                          <div className="text-gray-400 text-lg font-semibold mb-2">
                            {feature.title.split(':')[0]}
                          </div>
                          <p className="text-gray-500 text-sm">
                            Add screenshot image here
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* Stats Section */}
    <section className="relative py-16" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              50+
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Courses Ready
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              400+
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Active Users
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              24/7
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Support Available
            </div>
          </motion.div>

          {/* Stat 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              100%
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Success Rate
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Buildfeature;

