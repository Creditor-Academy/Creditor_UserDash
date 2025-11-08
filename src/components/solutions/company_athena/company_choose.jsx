import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Monitor, DollarSign, Headphones } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: Rocket,
    title: 'Easy-to-use',
    description:
      'Advanced course customization, site design enhancements, learner engagement, learning paths, and recommendations.',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    id: 2,
    icon: Monitor,
    title: 'Built for scaling companies',
    description:
      'Complex workflows, larger teams, extended user roles, and customized reports using Advanced Analytics.',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    id: 3,
    icon: DollarSign,
    title: 'Powerful selling tools',
    description:
      'Increase revenue with TCommerce, advanced sales and payment tools, larger transaction sizes, bulk selling, gifting, and B2B invoicing.',
    gradient: 'from-amber-400 to-orange-400',
  },
  {
    id: 4,
    icon: Headphones,
    title: 'Exceptional customer support',
    description:
      'Support, a dedicated Customer Success Team, Plus Priority Support, a 99% SLA, and a Launch Specialist for migration and implementation.',
    gradient: 'from-emerald-400 to-teal-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CompanyChoose() {
  return (
    <section className="relative overflow-hidden bg-[#1e3a5f] py-20 sm:py-24 lg:py-32">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white mb-4 leading-tight">
            Why companies choose{' '}
            <span className="text-blue-400 font-semibold">Athena</span>
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto">
            Empower your business with a comprehensive platform designed for
            growth and success
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="group"
              >
                <div className="relative h-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>

                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-blue-100 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
