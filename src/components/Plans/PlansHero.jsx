import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Award, Rocket, TrendingUp, Users, ArrowRight, Check } from 'lucide-react';

const PlansHero = () => {
  const navigate = useNavigate();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToContact = () => {
    navigate('/contact');
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      position: "relative"
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-5 py-2 bg-white/10 backdrop-blur-md border border-sky-400/30 rounded-full text-sky-300 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2 text-sky-400" />
              Flexible Solutions for Every Need
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                Athena LMS
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Tailored Solutions & Plans
              </h2>
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-300 leading-relaxed"
            >
              Discover how Athena can transform learning experiences for your organization or institution, and choose the right plan for your needs.
            </motion.p>

            {/* Key Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-3"
            >
              {[
                "AI-powered course creation in minutes",
                "Supports 140+ languages",
                "Tailored for educators, corporates & institutions",
                "Real-time analytics & insights"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-slate-200">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPricing}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 inline-flex items-center cursor-pointer"
              >
                View Plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToContact}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer"
              >
                Book a Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span className="text-slate-300 text-sm">450+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-sky-400" />
                <span className="text-slate-300 text-sm">98% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-sky-400" />
                <span className="text-slate-300 text-sm">Launch in 24hrs</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Stats Container */}
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-600/10 rounded-3xl blur-2xl" />
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Zap, label: "AI-Powered", value: "100%", desc: "Automation" },
                    { icon: Award, label: "Success Rate", value: "98%", desc: "Client Satisfaction" },
                    { icon: Sparkles, label: "Languages", value: "140+", desc: "Global Reach" },
                    { icon: TrendingUp, label: "Growth", value: "3x", desc: "Faster Learning" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="group relative"
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-sky-400/30 transition-all duration-300">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-500/30 transition-colors">
                          <stat.icon className="w-6 h-6 text-sky-400" />
                        </div>
                        
                        {/* Value */}
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        
                        {/* Label */}
                        <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
                        
                        {/* Description */}
                        <div className="text-xs text-slate-500">{stat.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="mt-6 pt-6 border-t border-white/10 text-center"
                >
                  <p className="text-sky-300 text-sm font-medium">
                    ✨ Trusted by leading organizations worldwide
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-sky-500/10 rounded-2xl backdrop-blur-sm border border-sky-400/20 flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-sky-400" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-2xl backdrop-blur-sm border border-blue-400/20 flex items-center justify-center"
            >
              <Rocket className="w-12 h-12 text-blue-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlansHero;

