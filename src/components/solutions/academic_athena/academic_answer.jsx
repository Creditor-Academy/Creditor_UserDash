import React from 'react';
import { motion } from 'framer-motion';
import Enrollment from '../../../assets/Enrollment.png';
import Payment from '../../../assets/Payment.png';
import Contentshare from '../../../assets/Contentshare.png';

const questions = [
  {
    id: 1,
    question: 'How can I manage growth without growing pains?',
    answer:
      "Struggling with managing high volumes of learners, products, and orders? Athena's scalable platform handles everything from bulk sales and group orders to automatic payment processing. Our centralized dashboard lets you manage multiple courses, cohorts, and certification programs without increasing administrative overhead or adding complexity.",
    imagePosition: 'right',
    bgColor: 'bg-gradient-to-br from-purple-100 to-blue-100',
  },
  {
    id: 2,
    question: 'How can I lower my customer acquisition costs?',
    answer:
      "Combat customer acquisition costs with Athena's built-in tools. Create customized landing pages that help your brand stand out as the best choice. Use our conversion-optimized checkout experiences to turn more visitors into paying customers and reduce churn with communities that increase engagement.",
    imagePosition: 'left',
    bgColor: 'bg-gradient-to-br from-blue-100 to-purple-100',
  },
  {
    id: 3,
    question: 'How can I migrate existing content?',
    answer:
      'Moving to Athena is simple. Our intuitive uploader lets you import existing materials with drag-and-drop organization. Plus, as a SCORM-compliant platform, we ensure secure content transfer between different learning management systems without compatibility issues. With Athena Enterprise, your dedicated Launch Specialist will guide you from setup to launch, providing strategic insights to help you achieve a successful migration and continued business growth.',
    imagePosition: 'right',
    bgColor: 'bg-gradient-to-br from-purple-100 to-indigo-100',
  },
];

export default function AcademicAnswer() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-6 leading-tight">
            The answers to your biggest{' '}
            <span className="text-blue-600">business questions</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Running a training company or academy comes with unique challenges
            and opportunities. Here are some ways Athena can help with your most
            pressing concerns.
          </p>
        </motion.div>

        {/* Q&A Sections */}
        <div className="space-y-20 lg:space-y-32">
          {questions.map((item, index) => (
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
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 mb-6 leading-tight">
                  {item.question}
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  {item.answer}
                </p>
                {/* Decorative underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" />
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
                  className={`relative rounded-3xl shadow-2xl overflow-hidden h-[400px] lg:h-[450px] flex items-center justify-center group ${item.bgColor}`}
                >
                  {/* Image Display */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    {item.id === 1 && (
                      <img
                        src={Enrollment}
                        alt="Enrollments Dashboard"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    )}
                    {item.id === 2 && (
                      <img
                        src={Payment}
                        alt="Purchase Interface"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    )}
                    {item.id === 3 && (
                      <img
                        src={Contentshare}
                        alt="Content Transfer"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    )}
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
