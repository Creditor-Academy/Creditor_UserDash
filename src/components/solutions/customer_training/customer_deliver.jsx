import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const CustomerDeliver = () => {
  const features = [
    'Streamline customer onboarding',
    'Reduce support ticket volume',
    'Increase customer satisfaction',
    'Build long-term customer relationships',
  ];

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Animated Lines Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full border-t-2 border-white/20"
            style={{
              top: `${i * 5}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 pl-6 sm:pl-8 lg:pl-12 pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Breadcrumb */}
            <div className="text-purple-300 text-sm font-medium">
              Customer Training
            </div>

            {/* Headline */}
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              Deliver exceptional customer experiences at scale
            </h2>

            {/* Description */}
            <div className="space-y-4">
              <p
                className="text-lg text-white/95 leading-relaxed font-normal"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Fuel your customer success with a comprehensive training
                platform.
              </p>
              <p
                className="text-lg text-white/90 leading-relaxed font-normal"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Athena was built to help businesses like you maximize customer
                satisfaction and reduce churn.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-6 h-6 bg-transparent border-2 border-white rounded-sm flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span
                    className="text-white font-normal text-base"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-full text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Talk to sales
              </button>
              <button
                className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 border-2 border-white rounded-full text-base transition-all duration-300"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Join Now
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white shadow-2xl overflow-hidden">
              {/* Dashboard Image */}
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=faces"
                alt="Customer Training Dashboard"
                className="w-full h-auto object-cover"
              />

              {/* Overlay gradient for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900/10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CustomerDeliver;
