import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

import {
  FileText,
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
  TrendingUp,
  Target,
  Mail,
  Check,
} from 'lucide-react';
import Scorm from '../../../assets/analytics.webp';
import Course from '../../../assets/Course.png';
import Dashboard from '../../../assets/Dashboard.png';

const AnalyticsSuceed = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState(0);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const features = [
    {
      id: 0,
      title: 'Custom reports',
      description:
        'Create custom reports tailored to your unique needs. Filter and segment your data to focus on the metrics that matter most to you and your business.',
      items: [
        {
          text: 'Design personalized dashboards to display the key metrics you need at a glance',
          icon: Check,
        },
        {
          text: 'Develop tailored reports for each of your partners and effortlessly distribute them via email when you want',
          icon: Check,
        },
        {
          text: 'Build a more complete picture of your learners with advanced survey and engagement data',
          icon: Check,
        },
      ],
      image: Course,
    },
    {
      id: 1,
      title: 'Marketing dashboards',
      description:
        'Know where to switch up your marketing efforts with insights on visitor activity and conversion. Learn which marketing channels drive the most traffic and conversions so you can better prioritize where to invest your time.',
      items: [
        { text: 'See how your marketing content is performing', icon: Check },
        {
          text: 'Monitor website and landing page visitor trends',
          icon: Check,
        },
        { text: 'Upsell tools like coupons and order bumps', icon: Check },
        {
          text: 'Measure the effectiveness of lead-generating content',
          icon: Check,
        },
        { text: 'Dive deeper into checkout performance', icon: Check },
      ],
      image: Dashboard,
    },
    {
      id: 2,
      title: 'Course enrollments dashboard',
      description:
        "Monitor your enrollment trends to understand the growth of your student base. See who's enrolling in your courses and identify patterns over time.",
      items: [
        { text: 'See how your enrollments change over time', icon: Check },
        { text: 'Assess the health of your membership base', icon: Check },
        {
          text: 'Identify which courses attract the most enrollments',
          icon: Check,
        },
      ],
      image: Scorm,
    },
    {
      id: 3,
      title: 'Orders dashboard',
      description:
        'Track every order, spot sales trends, and understand your peak selling periods — all from one powerful dashboard. Make smarter marketing decisions by understanding exactly when and how your digital products sell best.',
      items: [
        { text: 'View the total number of orders and sales', icon: Check },
        {
          text: 'Access detailed information about purchasers (such as referral sources)',
          icon: Check,
        },
      ],
      image: Scorm,
    },
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

  const toggleMobileSection = index => {
    setExpandedMobile(expandedMobile === index ? -1 : index);
  };

  return (
    <>
      {/* Features Section */}
      <section
        className="relative py-12"
        style={{
          background:
            'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
        }}
      >
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
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              Powerful analytics dashboards and reports
            </h1>
          </div>

          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
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
                    viewport={{ once: false, margin: '-150px' }}
                    className="space-y-4 ml-8 lg:ml-12"
                  >
                    {/* Title */}
                    <h2
                      className="text-3xl lg:text-4xl font-normal text-gray-900 leading-tight"
                      style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
                    >
                      {feature.title}
                    </h2>

                    {/* Description */}
                    <p
                      className="text-base text-gray-700 leading-relaxed max-w-lg"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {feature.description}
                    </p>

                    {/* Feature List */}
                    <div className="space-y-3 mt-6 pt-2">
                      {feature.items.map((item, idx) => {
                        const IconComponent = item.icon;
                        // Different background shades for each feature section to match image containers
                        const backgroundShades = [
                          'bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200', // Custom reports - blue theme
                          'bg-gradient-to-br from-purple-100 via-purple-100 to-purple-200', // Marketing dashboards - purple theme
                          'bg-gradient-to-br from-green-100 via-green-100 to-green-200', // Course enrollments - green theme
                          'bg-gradient-to-br from-orange-100 via-orange-100 to-orange-200', // Orders dashboard - orange theme
                        ];

                        return (
                          <div
                            key={idx}
                            className={`${backgroundShades[feature.id]} rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200`}
                          >
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
                    'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Custom reports - blue theme
                    'bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100', // Marketing dashboards - purple theme
                    'bg-gradient-to-br from-green-50 via-green-50 to-green-100', // Course enrollments - green theme
                    'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100', // Orders dashboard - orange theme
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
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 w-full h-full"
                    >
                      {feature.image ? (
                        <div
                          className={`w-full h-full flex items-center justify-center p-4 ${backgroundShades[index]}`}
                        >
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${backgroundShades[index]}`}
                        >
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

          {/* Mobile Dropdown Layout */}
          <div className="lg:hidden max-w-7xl mx-auto relative z-10">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {/* Dropdown Header */}
                  <button
                    onClick={() => toggleMobileSection(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200 hover:bg-gray-50"
                  >
                    <h3
                      className="text-lg font-normal text-gray-900 leading-tight pr-4"
                      style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
                    >
                      {feature.title}
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedMobile === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {expandedMobile === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          {/* Description */}
                          <p
                            className="text-base text-gray-700 leading-relaxed mb-6"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                          >
                            {feature.description}
                          </p>

                          {/* Feature List */}
                          <div className="space-y-3">
                            {feature.items.map((item, idx) => {
                              const IconComponent = item.icon;
                              // Different background shades for each feature section
                              const backgroundShades = [
                                'bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200', // Custom reports - blue theme
                                'bg-gradient-to-br from-purple-100 via-purple-100 to-purple-200', // Marketing dashboards - purple theme
                                'bg-gradient-to-br from-green-100 via-green-100 to-green-200', // Course enrollments - green theme
                                'bg-gradient-to-br from-orange-100 via-orange-100 to-orange-200', // Orders dashboard - orange theme
                              ];

                              return (
                                <div
                                  key={idx}
                                  className={`${backgroundShades[feature.id]} rounded-lg p-4 shadow-sm border border-gray-100`}
                                >
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

                          {/* Image Section */}
                          <div className="mt-6">
                            <div className="relative w-full aspect-[16/10] rounded-lg shadow-lg overflow-hidden">
                              {feature.image ? (
                                <div
                                  className={`w-full h-full flex items-center justify-center p-4 ${
                                    [
                                      'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Custom reports - blue theme
                                      'bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100', // Marketing dashboards - purple theme
                                      'bg-gradient-to-br from-green-50 via-green-50 to-green-100', // Course enrollments - green theme
                                      'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100', // Orders dashboard - orange theme
                                    ][feature.id]
                                  }`}
                                >
                                  <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`w-full h-full flex items-center justify-center ${
                                    [
                                      'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Custom reports - blue theme
                                      'bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100', // Marketing dashboards - purple theme
                                      'bg-gradient-to-br from-green-50 via-green-50 to-green-100', // Course enrollments - green theme
                                      'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100', // Orders dashboard - orange theme
                                    ][feature.id]
                                  }`}
                                >
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
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
    </>
  );
};

export default AnalyticsSuceed;
