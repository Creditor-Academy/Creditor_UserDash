import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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
        "Unlimited courses and digital downloads",
        "Unlimited websites, landing pages, and custom domains",
        "AI-powered content creation",
        "SCORM-compliant LMS",
        "Customized learning paths"
      ],
      image: Course // Feature 1 image
    },
    {
      id: 1,
      title: "Selling tools: Sell more with ease",
      description: "Earn more revenue with smart selling features on Athena LMS, our built-in selling and payment solution designed for maximum conversion. Athena LMS users sell up to 31% more!",
      items: [
        "B2B selling features like Group Orders and Invoicing",
        "Multiple payment options",
        "Upsell tools like coupons and order bumps",
        "Sale recovery features like failed payment and abandoned cart emails",
        "Automatic tax collection and remittance for U.S. and Canadian sales",
        "Simplified tax management for your sales in the EU and UK"
      ],
      image: Dashboard // Feature 2 image (add another image for this section)
    },
    {
      id: 2,
      title: "Analytics: Measure performance that matters",
      description: "Our advanced analytics tools underpin your learning business, surfacing important, actionable insights that allow you and your customers to drive more meaningful results. Track learner value, marketing strategies, and revenue growth to see where you can deliver more relevant offerings.",
      items: [
        "Advanced analytics",
        "Custom dashboards to track student engagement and revenue",
        "Automatically scheduled reports to stakeholders",
        "Unlimited roles and permissions"
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
      <section className="relative bg-gradient-to-b from-blue-50 via-sky-50 to-blue-50 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
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
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h2>

                  {/* Description */}
                  <p className="text-base text-gray-600 leading-relaxed max-w-lg">
                    {feature.description}
                  </p>

                  {/* Feature List */}
                  <ul className="space-y-3 mt-6 pt-2">
                    {feature.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right Side - Sticky Image Panel */}
          <div className="lg:sticky lg:top-32 hidden lg:block">
            <div className="relative w-full aspect-[16/10] bg-blue-50 rounded-lg shadow-2xl overflow-hidden">
              {/* Image Container with Smooth Transitions */}
              {features.map((feature, index) => (
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
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
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
              ))}
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

