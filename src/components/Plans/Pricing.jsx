import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Star, Crown, Users, Building, Zap } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Creator",
      icon: Users,
      target: "For individual educators",
      price: "$7",
      period: "/month",
      description: "Everything you need to get started",
      features: [
        "Up to 100 learners",
        "5 courses included",
        "Basic AI tools",
        "Standard support",
        "Mobile access"
      ],
      cta: "Buy Now",
      popular: false,
      gradient: "from-blue-400 to-cyan-500",
      borderColor: "border-blue-200"
    },
    {
      name: "Professional",
      icon: Building,
      target: "For academies and SMBs",
      price: "$99",
      period: "/month",
      description: "Advanced features for growing teams",
      features: [
        "Up to 500 learners",
        "Unlimited courses",
        "Advanced AI tools",
        "Priority support",
        "Custom branding",
        "Team collaboration"
      ],
      cta: "Buy Now",
      popular: true,
      gradient: "from-blue-500 to-blue-600",
      borderColor: "border-blue-300"
    },
    {
      name: "Enterprise",
      icon: Zap,
      target: "For organizations",
      price: "Custom",
      period: "",
      description: "Tailored solutions with integrations",
      features: [
        "Unlimited learners",
        "Full AI suite",
        "Custom integrations",
        "White-label solution",
        "Dedicated support",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-blue-600 to-indigo-600",
      borderColor: "border-blue-400"
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

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md border border-sky-400/30 rounded-full text-sky-300 text-sm font-semibold mb-6 shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Pricing Plans
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Transparent Plans, Powerful Learning
          </h2>
          
          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "150px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent mx-auto mb-6"
          />
          
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Get started today with instant access.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`bg-white/5 backdrop-blur-md border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${
                plan.popular ? 'border-sky-400/50 bg-white/10' : 'border-white/10'
              }`}>
                
                {/* Header */}
                <div className="p-6 text-center border-b border-white/10">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    {plan.target}
                  </p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-400 ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="p-6 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-sky-400" />
                        </div>
                        <span className="text-slate-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group ${
                    plan.popular 
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg shadow-md hover:scale-105`
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              All plans include instant access • Secure payment
            </h3>
            <div className="flex flex-wrap justify-center gap-8 text-slate-300">
              {['Cancel anytime', '24/7 Support', 'Money-back guarantee', 'Regular updates'].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;