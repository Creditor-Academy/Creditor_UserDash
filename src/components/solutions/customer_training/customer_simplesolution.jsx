import React from 'react';
import { motion } from 'framer-motion';

const solutions = [
  {
    id: 1,
    title: 'Customer success',
    description:
      'Reduce churn and increase customer lifetime value with comprehensive training programs. Help customers get maximum value from your product through structured learning paths, interactive tutorials, and personalized onboarding experiences.',
    imagePosition: 'right',
    imageBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=faces',
    placeholder: 'Customer Success Dashboard',
  },
  {
    id: 2,
    title: 'Product adoption',
    description:
      "Accelerate feature adoption and reduce support tickets with targeted training content. Create role-based learning paths, feature-specific tutorials, and certification programs that guide customers through your product's full potential.",
    imagePosition: 'left',
    imageBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop&crop=faces',
    placeholder: 'Training Analytics',
  },
  {
    id: 3,
    title: 'Onboarding automation',
    description:
      "Streamline customer onboarding with AI-powered training sequences that adapt to each customer's needs. Create interactive walkthroughs, automated email sequences, and progress tracking that ensures every customer gets the support they need.",
    imagePosition: 'right',
    imageBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=faces',
    placeholder: 'Onboarding Flow',
  },
  {
    id: 4,
    title: 'Customer engagement',
    description:
      'Build stronger relationships through continuous learning opportunities. Offer advanced training, webinars, user communities, and certification programs that keep customers engaged and invested in your platform long-term.',
    imagePosition: 'left',
    imageBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&crop=faces',
    placeholder: 'Engagement Metrics',
  },
];

export default function CustomerSimpleSolution() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating animated orbs */}
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, -80, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Animated grid lines */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Simple solutions to your biggest{' '}
            <span className="text-blue-400">customer training needs</span>
          </h2>
          <p
            className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Boost customer success with comprehensive training programs,
            automated onboarding, and engagement tools. When you're done, prove
            your impact with detailed analytics and customer satisfaction
            metrics.
          </p>
        </motion.div>

        {/* Solutions Sections */}
        <div className="space-y-20 lg:space-y-32">
          {solutions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                item.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content Side */}
              <div
                className={`${
                  item.imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'
                } flex flex-col justify-center`}
              >
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white mb-6 leading-tight"
                  style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 font-normal"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {item.description}
                </p>
                {/* Decorative underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full" />
              </div>

              {/* Image Side */}
              <div
                className={`${
                  item.imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-3xl shadow-2xl overflow-hidden h-full min-h-[300px] group`}
                >
                  {/* Background Image */}
                  <img
                    src={item.image}
                    alt={item.placeholder}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />

                  {/* Content overlay */}
                  <div className="relative z-10 h-full flex items-end p-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 transition-all duration-300 group-hover:bg-white group-hover:shadow-3xl">
                      <p className="text-lg font-bold text-gray-900">
                        {item.placeholder}
                      </p>
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-2"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
