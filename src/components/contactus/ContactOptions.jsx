import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  ShoppingCart, 
  MessageCircle, 
  Users,
  Mail,
  Phone,
  ArrowRight,
  Clock,
  ChevronDown
} from 'lucide-react';

const ContactOptions = () => {
  const [selectedCategory, setSelectedCategory] = useState('demo');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const contactOptions = [
    {
      id: 'demo',
      icon: Video,
      title: 'Request a Demo',
      shortTitle: 'Demo',
      description: 'See Athena LMS in action with a personalized walkthrough',
      estimatedTime: '30 minutes',
      benefits: [
        'Live product walkthrough',
        'Q&A with experts',
        'Custom use cases',
        'No commitment'
      ]
    },
    {
      id: 'sales',
      icon: ShoppingCart,
      title: 'Sales Inquiry',
      shortTitle: 'Sales',
      description: 'Discuss pricing, plans, and custom solutions',
      estimatedTime: '24hr response',
      benefits: [
        'Pricing consultation',
        'Enterprise solutions',
        'Volume discounts',
        'Custom integrations'
      ]
    },
    {
      id: 'support',
      icon: MessageCircle,
      title: 'Get Support',
      shortTitle: 'Support',
      description: 'Technical assistance and account help',
      estimatedTime: 'Instant',
      benefits: [
        '24/7 chat support',
        'Technical help',
        'Account assistance',
        'Feature guidance'
      ]
    },
    {
      id: 'community',
      icon: Users,
      title: 'Join Community',
      shortTitle: 'Community',
      description: 'Connect with other educators and learners',
      estimatedTime: 'Free',
      benefits: [
        'Community forums',
        'Best practices',
        'Feature requests',
        'Success stories'
      ]
    }
  ];

  const selectedOption = contactOptions.find(opt => opt.id === selectedCategory);

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full text-sky-300 text-sm font-medium">
              Get In Touch
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{
            fontFamily: "'Founders Grotesk', Arial, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: "1.1"
          }}>
            How Can We Help You?
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto" style={{
            fontFamily: "'Neue Montreal', Arial, sans-serif",
            lineHeight: "1.6"
          }}>
            Select a category to get started with the right team
          </p>
        </motion.div>

        {/* Category Selection + Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          {/* Category Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedCategory(option.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center gap-3 ${
                    selectedCategory === option.id
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/30'
                      : 'bg-white/5 text-slate-200 border-2 border-white/10 hover:border-sky-400/30 hover:bg-white/10 backdrop-blur-sm'
                  }`}
                  style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedCategory === option.id 
                      ? 'bg-white/20' 
                      : 'bg-sky-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      selectedCategory === option.id 
                        ? 'text-white' 
                        : 'text-sky-400'
                    }`} />
                  </div>
                  <span className="text-sm font-semibold">{option.shortTitle}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Content Card */}
          <AnimatePresence mode="wait">
            {selectedOption && (
              <motion.div
                key={selectedOption.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-2xl border-2 border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-600/10 rounded-3xl" />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
                    <div className="flex items-center gap-5">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/30"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <selectedOption.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2" style={{
                          fontFamily: "'Founders Grotesk', Arial, sans-serif",
                          letterSpacing: "-0.02em"
                        }}>
                          {selectedOption.title}
                        </h3>
                        <div className="flex items-center text-sky-300 text-sm" style={{
                          fontFamily: "'Neue Montreal', Arial, sans-serif"
                        }}>
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="font-medium">{selectedOption.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-200 text-lg mb-8 leading-relaxed" style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}>
                    {selectedOption.description}
                  </p>

                  {/* Benefits Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {selectedOption.benefits.map((benefit, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
                        <span className="text-slate-300 font-medium" style={{
                          fontFamily: "'Neue Montreal', Arial, sans-serif"
                        }}>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-sky-500/30"
                    style={{
                      fontFamily: "'Neue Montreal', Arial, sans-serif"
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Contact Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-lg border-2 border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6 text-center" style={{
              fontFamily: "'Founders Grotesk', Arial, sans-serif"
            }}>
              Or reach us directly
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <motion.a
                href="mailto:info@athenalms.com"
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-sky-400/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1" style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}>Email Us</div>
                  <div className="text-white font-semibold group-hover:text-sky-300 transition-colors" style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}>
                    info@athenalms.com
                  </div>
                </div>
              </motion.a>

              {/* Phone */}
              <motion.a
                href="tel:+1234567890"
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-sky-400/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1" style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}>Call Us</div>
                  <div className="text-white font-semibold group-hover:text-sky-300 transition-colors" style={{
                    fontFamily: "'Neue Montreal', Arial, sans-serif"
                  }}>
                    +1 (234) 567-890
                  </div>
                </div>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactOptions;

