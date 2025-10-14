import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Sparkles, Users, TrendingUp, Award, Shield, Zap, Clock } from 'lucide-react';

const ProductCTA = () => {
  const features = [
    { icon: Sparkles, title: "AI-Powered", desc: "Smart content generation" },
    { icon: Users, title: "Collaborative", desc: "Team-friendly platform" },
    { icon: Shield, title: "Secure", desc: "Enterprise-grade security" },
    { icon: Clock, title: "24/7 Support", desc: "Always here to help" },
  ];

  const benefits = [
    "No credit card required",
    "Cancel anytime",
    "14-day free trial",
    "Full feature access"
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sky-300 text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started Today
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Transform Your Learning Experience
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Join thousands of educators and institutions using Athena to create engaging, personalized learning experiences
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Features Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:shadow-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center mb-3">
                      <feature.icon className="w-5 h-5 text-sky-400" />
                    </div>
                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-300">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
              >
                <h4 className="text-sm font-semibold text-slate-300 mb-4 text-center">
                  Trusted by Industry Leaders
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Users, value: "450+", label: "Active Users" },
                    { icon: Award, value: "20+", label: "Courses" },
                    { icon: TrendingUp, value: "95%", label: "Satisfaction" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-slate-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-10 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Start Your Free Trial
                </h3>
                <p className="text-slate-300">
                  Experience the full power of Athena with no commitments
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-5 h-5 bg-sky-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span className="text-slate-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 inline-flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Schedule a Demo
                </motion.button>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <p className="text-xs text-slate-300">
                  🔒 Your data is secure and private
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCTA;
