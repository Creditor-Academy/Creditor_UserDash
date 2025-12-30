import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CreditCard,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Users,
  FileText,
  Target,
  TrendingUp,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Scorm from '../../assets/analytics.webp';
import Course from '../../assets/instruct.jpg';
import Dashboard from '../../assets/chris.jpg';

const Buildfeature = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState(0);
  const sectionRefs = [useRef(null), useRef(null), useRef(null)];

  const features = [
    {
      id: 0,
      title: 'Build Exceptional Learning Experiences',
      description:
        "Create immersive, branded, and high-performing learning environments with Athena LMS. Whether you're teaching a single class or scaling an entire academy, you'll have every tool to craft transformative experiences—without writing a single line of code.",
      items: [
        {
          text: 'Drag-and-Drop Course Builder – Design stunning courses, quizzes, and multimedia lessons in minutes.',
          icon: BookOpen,
        },
        {
          text: 'Adaptive Learning Paths – Automatically guide learners based on progress, goals, and performance.',
          icon: Target,
        },
        {
          text: 'Interactive Communities – Build forums and discussion spaces that keep students connected and engaged.',
          icon: Users,
        },
        {
          text: 'Gamification & Rewards – Motivate learners with badges, points, and progress milestones.',
          icon: TrendingUp,
        },
        {
          text: 'Integrated Video & Live Streaming – Host lectures, webinars, and interactive sessions directly inside the LMS.',
          icon: Globe,
        },
        {
          text: 'AI-Assisted Course Design – Generate outlines, quizzes, and learning materials tailored to your content style.',
          icon: Zap,
        },
      ],
      image: Course, // Feature 1 image
    },
    {
      id: 1,
      title: 'Sell Smarter. Scale Faster.',
      description:
        'Athena LMS turns your course catalog into a high-performing sales engine — blending education with automation. From effortless payments to AI-driven analytics, every feature is built to help you convert, retain, and grow.',
      items: [
        {
          text: 'Instant Course Storefronts – Launch a professional sales page for each course in minutes, no coding required.',
          icon: Globe,
        },
        {
          text: 'Dynamic Pricing Engine – Create limited-time offers, seasonal discounts, and tiered pricing to boost urgency.',
          icon: CreditCard,
        },
        {
          text: 'Affiliate & Partner Tracking – Reward your ambassadors with automated commission tracking and payouts.',
          icon: Users,
        },
        {
          text: 'AI-Driven Sales Insights – Predict buyer behavior, identify best-selling content, and refine your pricing strategy.',
          icon: BarChart3,
        },
        {
          text: 'Global Checkout Experience – Accept worldwide payments with built-in tax, currency, and compliance support.',
          icon: Shield,
        },
        {
          text: 'Recurring Revenue Tools – Build memberships, subscriptions, and bundles for predictable monthly income.',
          icon: TrendingUp,
        },
      ],
      image: Dashboard, // Feature 2 image (add another image for this section)
    },
    {
      id: 2,
      title: 'Analytics: Insights That Drive Impact',
      description:
        'Athena LMS puts data to work for you. Go beyond surface metrics with deep analytics that connect learning outcomes, engagement trends, and business growth—all in one visual command center. Turn every course, campaign, and student interaction into a measurable advantage.',
      items: [
        {
          text: 'Real-Time Performance Tracking – Monitor enrollment, completion, and engagement rates across all courses instantly.',
          icon: BarChart3,
        },
        {
          text: 'Revenue & ROI Analytics – See exactly which programs and campaigns generate the most profit.',
          icon: TrendingUp,
        },
        {
          text: 'AI-Powered Learner Insights – Identify high-performing students, at-risk learners, and growth opportunities automatically.',
          icon: Zap,
        },
        {
          text: 'Marketing Funnel Tracking – Measure ad-to-enrollment conversion and optimize every lead source.',
          icon: Target,
        },
        {
          text: 'Custom KPI Dashboards – Build visual dashboards for teams, departments, or enterprise clients with full control.',
          icon: Settings,
        },
        {
          text: 'Automated Report Delivery – Send scheduled summaries to stakeholders with key insights that matter most.',
          icon: FileText,
        },
      ],
      image: Scorm, // Feature 3 image
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
          // backgroundImage: 'url("/winter-landscape-with-deer-snow.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Light overlay to brighten the background */}
          <div className="absolute inset-0 bg-white/50"></div>
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
              Athena's stand-out suite of features
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
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg max-w-lg">
                      <p
                        className="text-base text-gray-700 leading-relaxed"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {feature.description}
                      </p>
                    </div>

                    {/* Feature List */}
                    <div className="space-y-3 mt-6 pt-2">
                      {feature.items.map((item, idx) => {
                        const IconComponent = item.icon;
                        // Different background shades for each feature section to match image containers
                        const backgroundShades = [
                          'bg-gradient-to-br from-cyan-100 via-cyan-100 to-cyan-200', // Build section - cyan theme
                          'bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200', // Selling section - blue theme
                          'bg-gradient-to-br from-violet-100 via-violet-100 to-violet-200', // Analytics section - violet theme
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
                    'bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100', // Build section - cyan theme
                    'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Selling section - blue theme
                    'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100', // Analytics section - violet theme
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
          <div className="lg:hidden">
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
                          <div className="bg-white bg-opacity-60 p-4 rounded-lg mb-6">
                            <p
                              className="text-base text-gray-700 leading-relaxed"
                              style={{ fontFamily: 'Arial, sans-serif' }}
                            >
                              {feature.description}
                            </p>
                          </div>

                          {/* Feature List */}
                          <div className="space-y-3">
                            {feature.items.map((item, idx) => {
                              const IconComponent = item.icon;
                              // Different background shades for each feature section
                              const backgroundShades = [
                                'bg-gradient-to-br from-cyan-100 via-cyan-100 to-cyan-200', // Build section - cyan theme
                                'bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200', // Selling section - blue theme
                                'bg-gradient-to-br from-violet-100 via-violet-100 to-violet-200', // Analytics section - violet theme
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
                                      'bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100', // Build section - cyan theme
                                      'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Selling section - blue theme
                                      'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100', // Analytics section - violet theme
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
                                      'bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100', // Build section - cyan theme
                                      'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100', // Selling section - blue theme
                                      'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100', // Analytics section - violet theme
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
      <section
        className="relative py-16"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        }}
      >
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
                1500+
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
                400K+
              </div>
              <div className="text-slate-400 text-sm uppercase tracking-wide">
                Enterprise User Scale
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
                $500M
              </div>
              <div className="text-slate-400 text-sm uppercase tracking-wide">
                Scalable Finance
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Buildfeature;
