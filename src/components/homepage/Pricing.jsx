import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const plans = [
    {
      name: 'Starter',
      target:
        'Best for: Solo creators, tutors, and small teams. Launch Mode — Start simple, grow fast.',
      price: '$7', // isAnnual ? "$74" : "$7",
      originalPrice: '$99', // isAnnual ? "$99" : "$99",
      savings: '', // isAnnual ? "Save $300" : "",
      period: ' per user/month',
      billingNote: 'monthly billing',
      features: [
        { text: '10GB of storage', info: false },
        { text: '100 AI credits per month', info: false },
        { text: 'Unlimited SCORM packages', info: false },
        { text: 'Immersive reader modules', info: false },
        { text: 'Access to AI-generated course assets', info: false },
        { text: 'Full LMS dashboard + analytics', info: false },
        {
          text: 'Perfect entry plan for testing your first courses',
          info: false,
        },
        { text: 'Add-on flexibility (extra GB or AI credits)', info: false },
      ],
      sectionHeader: 'Starter Includes:',
      cta: 'Join Now',
      link: 'https://quickclick.com/cart/cart.php?action=show_information&internal_key=79c1b77c136e0a31897a277a362267b7&internal_timestamp=1763572823&tid=2d9cc1ed67c1e58435c646acd5938ec8',
      popular: false,
      buttonStyle: 'white',
    },
    {
      name: 'Growth',
      target:
        'Best for: Growing academies and scaling organizations. Growth Mode — Build for scale, More tools, more reach, same simplicity.',
      price: '$14', // isAnnual ? "$149" : "$14",
      originalPrice: '$189', // isAnnual ? "$189" : "$189",
      savings: '', // isAnnual ? "Save $600" : "",
      period: ' per user/month',
      billingNote: 'monthly billing',
      features: [
        { text: '50GB of storage', info: false },
        { text: '300 AI credits per month', info: false },
        { text: 'Build dozens of SCORM modules with AI', info: false },
        { text: 'Hundreds of immersive reader texts', info: false },
        { text: 'Image-rich, AI-assisted course creation', info: false },
        { text: 'Better per-user value and bundled resources', info: false },
      ],
      sectionHeader: 'Growth Includes:',
      cta: 'Join Now',
      popular: true,
      link: 'https://quickclick.com/r/gf2xftvzaz3r3lzy0e966gjgeggcj2',
      featured: 'Most Popular!',
      buttonStyle: 'blue',
    },
    {
      name: 'ATHENA',
      nameHighlight: 'Enterprise',
      target:
        'Best for: Large organizations, universities, and corporate training networks. Enterprise Mode — Predictable scale, premium support.',
      isPlusCard: true,
      features: [
        {
          text: "Fully tailored learning infrastructure built around your organization's goals",
          info: false,
        },
        {
          text: 'Scalable user capacity for thousands of learners across departments',
          info: false,
        },
        {
          text: 'Pooled storage and AI credits designed to match enterprise-scale operations',
          info: false,
        },
        {
          text: 'Custom white-label branding with domain and identity integration',
          info: false,
        },
        { text: 'Advanced API, SSO, and automation capabilities', info: false },
        {
          text: 'Compliance-ready architecture with guaranteed uptime and dedicated support',
          info: false,
        },
        {
          text: 'Personalized onboarding, account management, and staff training',
          info: false,
        },
        {
          text: 'Volume pricing and partnership options for global teams',
          info: false,
        },
      ],
      sectionHeader: 'ATHENA Enterprise Includes:',
      cta: 'Contact Sales',
      popular: false,
      buttonStyle: 'white',
      bgGray: false,
    },
  ];

  // Slider functions for mobile
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % plans.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + plans.length) % plans.length);
  };

  const goToSlide = index => {
    setCurrentSlide(index);
  };

  return (
    <section
      id="pricing-section"
      className="py-20 px-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Scalable solutions to drive business growth
          </h2>

          <p
            className="text-lg text-white max-w-3xl mx-auto mb-8 font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Athena LMS plans give experts, academies, and companies the tools
            and features they need to grow their business end-to-end.
          </p>

          {/* Billing Toggle
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                isAnnual ? 'bg-sky-500' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors text-white`}>
              Annual <span style={{ color: '#fbbf24' }}>(Save 25%)</span>
            </span>
          </div> */}
        </motion.div>

        {/* Desktop Pricing Cards Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              className="relative group"
            >
              {/* Card */}
              <div
                className={`overflow-hidden h-full flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'border-4 border-yellow-400 shadow-2xl'
                    : 'border border-gray-300 shadow-lg group-hover:shadow-2xl'
                } ${plan.bgGray ? 'bg-gray-100' : 'bg-white'}`}
              >
                {/* Popular Header - Only on featured plan */}
                {plan.popular && plan.featured && (
                  <div
                    className="h-14 flex items-center justify-center px-6 text-center font-bold text-lg text-black"
                    style={{
                      background:
                        'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    }}
                  >
                    {plan.featured}
                  </div>
                )}

                {/* Alignment Spacer for non-popular cards */}
                {!plan.popular && <div className="h-14" />}

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Plan Name - Fixed Height */}
                  <div className="mb-1 h-[160px] overflow-hidden">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {plan.name}
                      {plan.nameHighlight && (
                        <span className="ml-2 inline-block px-3 py-1 bg-black text-white text-xl font-bold">
                          {plan.nameHighlight}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {plan.target}
                    </p>
                  </div>

                  {/* Pricing - Fixed Height for consistent alignment */}
                  {!plan.isPlusCard && (
                    <div className="mb-3 h-[80px]">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-5xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-700 text-xl">
                          {plan.period}
                        </span>
                      </div>
                      {/* Annual pricing display - commented out for weekly offer */}
                      {/* {isAnnual && plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-500 line-through text-base">
                            {plan.originalPrice}/mo
                          </span>
                        </div>
                      )}
                      {plan.savings && (
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1.5 bg-gray-900 text-white text-sm font-semibold">
                            {plan.savings}
                          </span>
                        </div>
                      )} */}
                      <p className="text-sm text-gray-600">
                        {plan.billingNote}
                      </p>
                    </div>
                  )}

                  {plan.isPlusCard && <div className="mb-3 h-[80px]" />}

                  {/* CTA Button */}
                  <div className="mb-6">
                    <a
                      href={plan.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2 text-center ${
                        plan.buttonStyle === 'yellow'
                          ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {plan.cta} →
                    </a>
                  </div>

                  {/* Features Section */}
                  <div
                    className={`pt-6 border-t ${plan.bgGray ? 'border-gray-300' : 'border-gray-200'}`}
                  >
                    <h4 className="font-bold text-gray-900 mb-4 text-base">
                      {plan.sectionHeader}
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-sm text-gray-800 flex items-center gap-2 flex-1">
                            {feature.text}
                          </span>
                          {feature.info && (
                            <Info className="w-4 h-4 text-gray-900 flex-shrink-0 cursor-pointer" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Slider Layout */}
        <div className="md:hidden mb-8 relative">
          {/* Navigation Arrows - Positioned at the sides */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity duration-200 z-10 -ml-12"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity duration-200 z-10 -mr-12"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Slider Container */}
          <div className="relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {plans.map((plan, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3, ease: 'easeOut' },
                    }}
                    className="relative group"
                  >
                    {/* Card */}
                    <div
                      className={`overflow-hidden h-full flex flex-col transition-all duration-300 ${
                        plan.popular
                          ? 'border-4 border-yellow-400 shadow-2xl'
                          : 'border border-gray-300 shadow-lg group-hover:shadow-2xl'
                      } ${plan.bgGray ? 'bg-gray-100' : 'bg-white'}`}
                    >
                      {/* Popular Header - Only on featured plan */}
                      {plan.popular && plan.featured && (
                        <div
                          className="h-14 flex items-center justify-center px-6 text-center font-bold text-lg text-black"
                          style={{
                            background:
                              'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          }}
                        >
                          {plan.featured}
                        </div>
                      )}

                      {/* Alignment Spacer for non-popular cards */}
                      {!plan.popular && <div className="h-14" />}

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Plan Name - Fixed Height */}
                        <div className="mb-1 h-[160px] overflow-hidden">
                          <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            {plan.name}
                            {plan.nameHighlight && (
                              <span className="ml-2 inline-block px-3 py-1 bg-black text-white text-xl font-bold">
                                {plan.nameHighlight}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {plan.target}
                          </p>
                        </div>

                        {/* Pricing - Fixed Height for consistent alignment */}
                        {!plan.isPlusCard && (
                          <div className="mb-3 h-[80px]">
                            <div className="flex items-baseline gap-1 mb-1">
                              <span className="text-5xl font-bold text-gray-900">
                                {plan.price}
                              </span>
                              <span className="text-gray-700 text-xl">
                                {plan.period}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {plan.billingNote}
                            </p>
                          </div>
                        )}

                        {plan.isPlusCard && <div className="mb-3 h-[80px]" />}

                        {/* CTA Button */}
                        <div className="mb-6">
                          <button
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2 ${
                              plan.buttonStyle === 'yellow'
                                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {plan.cta} →
                          </button>
                        </div>

                        {/* Features Section */}
                        <div
                          className={`pt-6 border-t ${plan.bgGray ? 'border-gray-300' : 'border-gray-200'}`}
                        >
                          <h4 className="font-bold text-gray-900 mb-4 text-base">
                            {plan.sectionHeader}
                          </h4>
                          <ul className="space-y-3">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-sm text-gray-800 flex items-center gap-2 flex-1">
                                  {feature.text}
                                </span>
                                {feature.info && (
                                  <Info className="w-4 h-4 text-gray-900 flex-shrink-0 cursor-pointer" />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-4"
        >
          <p className="text-base text-white">
            All prices are in USD and charged per site with applicable taxes
            added at checkout.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
