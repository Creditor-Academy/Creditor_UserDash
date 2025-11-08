import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const caseStudies = [
  {
    id: 1,
    icon: BookOpen,
    title:
      'How George Levy reached seven figure earnings with the help of Athena',
    quote:
      "Athena has been there every step of the way. It's a tool that has allowed me to amplify what I want to do.",
    author: 'George Levy, Blockchain Institute of Technology',
    bgColor: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'How Athena helped Tongue-Tied Academy raise money for charity',
    quote:
      "I don't even think about it because it's so easy,' he says. 'Athena payments takes care of everything for me, and the money just shows up in the bank account.",
    author: 'Dr. Richard Baxter, Dentist and founder of Tongue-Tied Academy',
    bgColor: 'bg-[#2d1b2e]',
    hoverColor: 'hover:bg-[#3d2b3e]',
  },
  {
    id: 3,
    icon: BookOpen,
    title: 'How this trainer generates $100K per year teaching 3,000+ learners',
    quote:
      "I'm constantly looking at the progress of each individual, which is an amazing feature that Athena lets you do; you can see how many videos members have completed and what percentage of the videos they've watched.",
    author: 'Phil Hynes, My Trainer Phil',
    bgColor: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
  },
];

const bottomCaseStudy = {
  id: 4,
  icon: BookOpen,
  title:
    '5 things Sean McCormick stopped doing to make $2 to $4K per month selling courses',
  quote:
    "Sean's journey also speaks to the power of incremental evolution. He shifted from a membership model to launching a six-week program. The results were transformative, catapulting his earnings to $6,000 months.",
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-900',
};

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

export default function AcademicSucceed() {
  return (
    <section className="relative overflow-hidden bg-blue-50 py-20 sm:py-24 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header with Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-8 leading-tight">
              How other academies succeed with Athena
            </h2>

            <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5">
              See all case studies
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:pt-2">
            <p className="text-base text-gray-700 leading-relaxed">
              Explore the countless ways Athena's learning commerce platform
              helps other training companies and academies transform to keep up
              with demand.
            </p>
          </div>
        </motion.div>

        {/* Top Row - 3 Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
        >
          {caseStudies.map(study => {
            const Icon = study.icon;
            return (
              <motion.div
                key={study.id}
                variants={itemVariants}
                className="group"
              >
                <div
                  className={`${study.bgColor} ${study.hoverColor} rounded-2xl p-8 h-full flex flex-col transition-all duration-300`}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 leading-tight">
                    {study.title}
                  </h3>

                  {/* Quote */}
                  <p className="text-sm text-white/90 leading-relaxed mb-4 flex-grow">
                    "{study.quote}"
                  </p>

                  {/* Author */}
                  {study.author && (
                    <p className="text-sm text-white/90 font-normal mb-6">
                      {study.author}
                    </p>
                  )}

                  {/* Learn More Link */}
                  <button className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Row - Large Card with Images */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden rounded-2xl"
        >
          {/* Left - Circular Image on Gray Background */}
          <div className="relative lg:col-span-2 h-64 lg:h-auto min-h-[400px] bg-gray-100">
            {/* Circular Image Container */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-white shadow-xl">
                {/* Placeholder for Sean's circular image */}
                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center px-4 text-sm">
                    [Sean McCormick]
                    <br />
                    Circular Photo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Orange Card with Text and Trainer Image */}
          <div className="lg:col-span-3 bg-orange-600 p-8 lg:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Icon */}
              <div className="mb-6">
                <BookOpen className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 leading-tight">
                {bottomCaseStudy.title}
              </h3>

              {/* Quote */}
              <p className="text-sm text-white/90 leading-relaxed mb-6">
                "{bottomCaseStudy.quote}"
              </p>

              {/* Learn More Link */}
              <button className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all duration-300">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trainer Image on Right */}
            <div className="w-full lg:w-56 h-64 lg:h-auto flex-shrink-0">
              <div className="w-full h-full rounded-lg overflow-hidden">
                {/* Placeholder for trainer rectangular image */}
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-300 flex items-center justify-center">
                  <p className="text-white text-center px-4 text-sm">
                    [Phil Trainer]
                    <br />
                    Rectangular Photo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
