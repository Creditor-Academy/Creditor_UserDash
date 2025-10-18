import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Start",
      target: "Unlock features to drive customer engagement and grow revenue, for those ready to scale up.",
      price: isAnnual ? "$74" : "$99",
      originalPrice: isAnnual ? "$99" : "$99",
      savings: isAnnual ? "Save $300" : "",
      period: "/mo",
      billingNote: "by billing annually",
      features: [
        { text: "Unlimited Live Lessons", info: true },
        { text: "Unlimited Memberships", info: true },
        { text: "Unlimited Digital Downloads", info: true },
        { text: "Unlimited Coaching & Webinar sessions", info: true },
        { text: "Edit HTML & CSS", info: false },
        { text: "Sell Bundles and Add-ons", info: true }
      ],
      sectionHeader: "Start Includes:",
      cta: "Start your free trial",
      popular: true,
      featured: "Most Popular!",
      buttonStyle: "yellow"
    },
    {
      name: "Grow",
      target: "Level up your learning business with more support, pro-level limits, and advanced commerce features to help you sell more.",
      price: isAnnual ? "$149" : "$189",
      originalPrice: isAnnual ? "$189" : "$189",
      savings: isAnnual ? "Save $600" : "",
      period: "/mo",
      billingNote: "by billing annually",
      features: [
        { text: "3 communities", info: true },
        { text: "Remove Thinkific branding", info: false },
        { text: "Thinkific Analytics", info: true },
        { text: "Group Orders", info: false },
        { text: "Invoicing", info: false },
        { text: "Gifting", info: true },
        { text: "API Access", info: false }
      ],
      sectionHeader: "Everything in Start, plus:",
      cta: "Start your free trial",
      popular: false,
      buttonStyle: "white"
    },
    {
      name: "ATHENA LMS",
      nameHighlight: "PLUS",
      target: "Pro-level features and premium services, designed for high-growth businesses and teams. Schedule a call with our team to explore our platform, and receive a custom quote that unlocks enterprise-level features, advanced integrations, and tailored support to scale your online learning business.",
      isPlusCard: true,
      features: [
        { text: "Unlimited Everything", info: false },
        { text: "CRM Integrations (Hubspot, Salesforce)", info: false },
        { text: "Single Sign On (SSO)", info: false },
        { text: "SCORM Compliant", info: false },
        { text: "Custom Reports", info: false },
        { text: "Student Learning Paths", info: false },
        { text: "Dedicated Onboarding and Customer Support", info: false }
      ],
      sectionHeader: "Everything in Grow, plus:",
      cta: "Talk to sales",
      popular: false,
      buttonStyle: "white",
      bgGray: true
    }
  ];

  return (
    <section id="pricing-section" className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
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
            ease: "easeInOut"
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
            ease: "easeInOut",
            delay: 1
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Scalable solutions to drive business growth
          </h2>
          
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Athena LMS plans give experts, academies, and companies the tools and features they need to grow their business end-to-end.
          </p>

          {/* Billing Toggle */}
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
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual <span className="text-sky-400">(Save 25%)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="relative group"
            >
              {/* Card */}
              <div className={`overflow-hidden h-full flex flex-col transition-all duration-300 ${
                plan.popular 
                  ? 'border-4 border-orange-600 shadow-2xl' 
                  : 'border border-gray-300 shadow-lg group-hover:shadow-2xl'
              } ${plan.bgGray ? 'bg-gray-100' : 'bg-white'}`}>
                
                {/* Popular Header - Only on featured plan */}
                {plan.popular && plan.featured && (
                  <div className="bg-orange-600 text-white py-4 px-6 text-center font-bold text-lg">
                    {plan.featured}
                  </div>
                )}

                {/* Alignment Spacer for non-popular cards */}
                {!plan.popular && (
                  <div className="h-14" />
                )}

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Plan Name - Fixed Height */}
                  <div className="mb-4 min-h-[110px]">
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
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
                    <div className="mb-4 min-h-[105px]">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-5xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-700 text-xl">
                          {plan.period}
                        </span>
                      </div>
                      {isAnnual && plan.originalPrice && (
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
                      )}
                      <p className="text-sm text-gray-600">
                        {plan.billingNote}
                      </p>
                    </div>
                  )}
                  
                  {plan.isPlusCard && (
                    <div className="mb-4" style={{ height: '75px' }} />
                  )}

                  {/* CTA Button */}
                  <div className="mb-6">
                    <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2 ${
                      plan.buttonStyle === 'yellow'
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                        : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'
                    }`}>
                      {plan.cta} →
                    </button>
                  </div>

                  {/* Features Section */}
                  <div className={`pt-6 border-t ${plan.bgGray ? 'border-gray-300' : 'border-gray-200'}`}>
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

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-4"
        >
          <p className="text-xs text-slate-400">
            All prices are in USD and charged per site with applicable taxes added at checkout.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;