import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';

const Pricing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const plans = [
    {
      name: 'Starter',
      target:
        'Best for: Solo creators, tutors, and small teams. Launch Mode — Start simple, grow fast.',
      price: '$99',
      originalPrice: '$149',
      savings: 'Save $50',
      period: 'per user/month',
      billingNote: 'billed monthly',
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
      cta: 'Get Started',
      link: 'https://quickclick.com/r/0zx71t3oqnqkfdcmjd2gxuefe7it3i',
      popular: true,
      featured: 'Most Popular!',
      buttonStyle: 'blue',
    },
    // {
    //   name: "Growth",
    //   target:
    //     "Best for: Growing teams and established educators. Scale your impact with more resources.",
    //   price: "$199",
    //   originalPrice: "$299",
    //   savings: "Save $100",
    //   period: "per user/month",
    //   billingNote: "billed monthly",
    //   features: [
    //     { text: "50GB of storage", info: false },
    //     { text: "500 AI credits per month", info: false },
    //     { text: "Everything in Starter, plus:", info: false },
    //     { text: "Advanced analytics & reporting", info: false },
    //     { text: "Priority email support", info: false },
    //     { text: "Custom branding options", info: false },
    //     { text: "Team collaboration features", info: false },
    //     { text: "API access", info: false },
    //   ],
    //   sectionHeader: "Growth Includes:",
    //   cta: "Choose Growth",
    //   link: "#contact",
    //   popular: false,
    //   buttonStyle: "blue",
    // },
    {
      name: 'ATHENA',
      nameHighlight: 'Enterprise',
      target:
        'Best for: Large organizations, universities, and corporate training networks.',
      isPlusCard: true,
      features: [
        {
          text: "Fully tailored learning infrastructure built around your organization's goals",
          info: false,
        },
        {
          text: 'Scalable user capacity for thousands of learners',
          info: false,
        },
        {
          text: 'Pooled storage and AI credits for enterprise scale',
          info: false,
        },
        {
          text: 'Custom white-label branding + domain integration',
          info: false,
        },
        { text: 'Advanced API, SSO, automations', info: false },
        { text: 'Compliance-ready uptime + dedicated support', info: false },
        { text: 'Personalized onboarding & success manager', info: false },
        {
          text: 'Volume pricing and partnership options globally',
          info: false,
        },
      ],
      sectionHeader: 'ATHENA Enterprise Includes:',
      cta: 'Contact Sales',
      popular: false,
      buttonStyle: 'white',
    },
  ];

  // Mobile slider handlers
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % plans.length);
  const prevSlide = () =>
    setCurrentSlide(prev => (prev - 1 + plans.length) % plans.length);
  const goToSlide = index => setCurrentSlide(index);

  // Reusable Card UI (for both mobile + desktop)
  const PlanCard = ({ plan }) => {
    const isSpecialCard = plan.name === 'ATHENA' || plan.name === 'Starter';

    return (
      <div className="relative">
        {/* Hat Image Outside Top-Right Corner, Above Red Strip */}
        {plan.name === 'ATHENA' && (
          <div className="absolute -top-6 -right-4 w-28 h-28 sm:-top-8 sm:-right-6 sm:w-32 sm:h-32 md:-top-10 md:-right-8 md:w-40 md:h-40 lg:-top-12 lg:-right-10 lg:w-44 lg:h-44 z-20 hover:scale-105 transition-transform duration-300">
            <img
              src="/hat-removebg-preview.png"
              alt="Athena hat"
              className="w-full h-full object-contain drop-shadow-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                transform: 'rotate(15deg)',
              }}
            />
          </div>
        )}
        <div
          className={`overflow-hidden h-full flex flex-col border shadow-lg rounded-lg transition-all duration-300 ${
            plan.popular
              ? 'border-yellow-400 border-4 shadow-2xl'
              : 'border-gray-300'
          } ${isSpecialCard ? 'bg-cover bg-center' : 'bg-white'}`}
          style={
            isSpecialCard
              ? {
                  backgroundImage: 'url(/santa_in_the_sky_1212.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  backgroundAttachment: 'fixed',
                  backgroundBlendMode: 'normal',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
              : {}
          }
        >
          {isSpecialCard && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10" />
          )}
          <div className="relative z-10">
            {/* Amber-Red Strip for Athena Card */}
            {plan.name === 'ATHENA' && (
              <div className="h-5 bg-gradient-to-r from-amber-600 to-red-600 w-full relative z-10" />
            )}
            {/* Most Popular Label */}
            {plan.popular ? (
              <div
                className="h-14 flex items-center justify-center px-6 text-center font-bold text-lg text-black"
                style={{
                  background:
                    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                }}
              >
                {plan.featured}
              </div>
            ) : (
              <div className="h-8" />
            )}

            <div className="px-6 pb-6 pt-1 flex-1 flex flex-col relative">
              {/* Title + Target */}
              <div className="h-[130px] overflow-hidden">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {plan.name}{' '}
                  {plan.nameHighlight && (
                    <span className="ml-2 px-3 py-1 bg-black text-white text-lg font-bold rounded">
                      {plan.nameHighlight}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-700 pr-4">{plan.target}</p>
              </div>

              {/* Pricing */}
              {!plan.isPlusCard ? (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                    {plan.savings && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>
                  {plan.originalPrice && plan.originalPrice !== plan.price && (
                    <p className="text-sm text-gray-500 line-through">
                      {plan.originalPrice}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.billingNote}
                  </p>
                </div>
              ) : (
                <div className="h-24 mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-center">
                    Custom Pricing Available
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <a
                href={plan.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-6 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition text-center mb-6"
              >
                {plan.cta} →
              </a>

              {/* Features */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">
                  {plan.sectionHeader}
                </h4>

                <ul className="space-y-3">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-sm text-gray-800 flex-1">
                        {f.text}
                      </span>
                      {f.info && <Info className="w-4 h-4 text-gray-900" />}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      {/* Background Glow Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 leading-tight">
            Scalable solutions to drive business growth
          </h2>

          <p className="text-lg text-white max-w-3xl mx-auto mb-8">
            Athena LMS plans give experts, academies, and companies the tools
            and features they need to grow their business end-to-end.
          </p>
        </motion.div>

        {/* Mobile Slider (one card per slide) */}
        <div className="md:hidden relative mb-10">
          <div className="overflow-hidden" ref={sliderRef}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {plans.map((plan, index) => (
                <div key={index} className="w-full flex-shrink-0 px-1">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <PlanCard plan={plan} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Centered Cards */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 lg:gap-8 mb-8 px-4">
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
              className="relative group w-full max-w-sm flex-shrink-0"
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-white text-sm mt-6">
          All prices are in USD and charged per site with applicable taxes added
          at checkout.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
