import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Video, Zap, BarChart3, CheckCircle } from 'lucide-react';
import Payment from '../../../assets/Payment.png';
import Joinclass from '../../../assets/Joinclass.png';
import Courseanalytics from '../../../assets/Courseanalytics.png';

const features = [
  {
    id: 1,
    title: 'Commerce',
    description:
      "Boost order value and reduce manual work with Athena's suite of payment tools, optimized checkout, automated billing, and more.",
    icon: ShoppingCart,
    mockupBg: 'bg-gradient-to-br from-orange-100 to-orange-50',
    accentColor: 'orange',
    bottomColor: '#f59e0b', // orange
  },
  {
    id: 2,
    title: 'Coaching and webinars',
    description:
      'Host live one-on-one or group sessions to earn more, build trust, and grow your audience with integrated scheduling and video tools.',
    icon: Video,
    mockupBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
    accentColor: 'blue',
    bottomColor: '#3b82f6', // blue
  },
  {
    id: 3,
    title: 'Integrations',
    description:
      'Connect seamlessly with tools like HubSpot, Salesforce, and MailChimp to sync data and streamline your entire workflow.',
    icon: Zap,
    mockupBg: 'bg-gradient-to-br from-purple-100 to-purple-50',
    accentColor: 'purple',
    bottomColor: '#8b5cf6', // purple
    showLogos: true,
  },
  {
    id: 4,
    title: 'Athena Analytics',
    description:
      'Access comprehensive insights to better understand learner behavior, improve content quality, and grow your revenue.',
    icon: BarChart3,
    mockupBg: 'bg-gradient-to-br from-green-100 to-green-50',
    accentColor: 'green',
    bottomColor: '#10b981', // green
    showChart: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export default function AcademicFeature() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight">
            Powerful features for academies
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Scale your training business or academy with features and tools
            designed to help manage high volumes of learners, maximize revenue,
            and integrate seamlessly.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="group"
              >
                <div
                  className="relative h-full bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl border border-gray-200 transition-all duration-300 flex flex-col"
                  onMouseEnter={() => setHoveredIndex(feature.id - 1)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Mockup Area */}
                  <div
                    className={`${feature.mockupBg} h-48 flex items-center justify-center p-0 relative flex-shrink-0 overflow-hidden`}
                  >
                    {/* Commerce Mockup */}
                    {feature.id === 1 && (
                      <img
                        src={Payment}
                        alt="Payment Interface"
                        className="w-full h-full object-cover object-left"
                      />
                    )}

                    {/* Coaching Mockup */}
                    {feature.id === 2 && (
                      <img
                        src={Joinclass}
                        alt="Join Class Interface"
                        className="w-full h-full object-cover object-left"
                      />
                    )}

                    {/* Integrations Mockup */}
                    {feature.showLogos && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-24">
                          <div className="text-blue-600 font-bold text-lg">
                            Salesforce
                          </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-24">
                          <div className="text-orange-600 font-bold text-lg">
                            HubSpot
                          </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-24">
                          <div className="text-yellow-600 font-bold text-lg">
                            Mailchimp
                          </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-24">
                          <div className="text-orange-500 font-bold text-lg">
                            Zapier
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analytics Chart */}
                    {feature.showChart && (
                      <img
                        src={Courseanalytics}
                        alt="Course Analytics Dashboard"
                        className="w-full h-full object-cover object-left"
                      />
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="relative p-6 flex flex-col flex-grow overflow-hidden">
                    {/* Hover Fill Animation */}
                    <div
                      className="absolute inset-0 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: feature.bottomColor,
                        transform:
                          hoveredIndex === feature.id - 1
                            ? 'translateY(0)'
                            : 'translateY(100%)',
                        opacity: hoveredIndex === feature.id - 1 ? 0.2 : 0,
                      }}
                    />

                    {/* Content with higher z-index */}
                    <div className="relative z-10 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Color Line - Static */}
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div
                      style={{
                        backgroundColor: feature.bottomColor,
                        height: '100%',
                      }}
                    />
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
