import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    icon: BookOpen,
    title: "How Taylor Loren made $100,000 on LMS Athena",
    quote:
      "I knew that I had a lot of expertise that I wanted to share — and knew that courses were a really good way to scale my income.",
    author: "Taylor Loren, social media and content strategist",
    bgColor: "bg-blue-400",
    hoverColor: "hover:bg-blue-500",
  },
  {
    id: 2,
    icon: BookOpen,
    title: "How Dorie Clark built a 6-figure online course in five months",
    quote:
      "For years, I'd wanted to create an online course. I knew it was the way I could increase my impact, reach more people, and earn revenue without constantly jumping on airplanes.",
    author: "Dorie Clark, marketing strategist, author, and professional speaker",
    bgColor: "bg-[#2d1b2e]",
    hoverColor: "hover:bg-[#3d2b3e]",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "How 'Miss Excel' launched a six-figure online course business",
    quote:
      "I did two webinars in April, granting me my first six-figure month. 99% of the revenue was from core sales on LMS Athena.",
    author: "Kat Norton, Miss Excel",
    bgColor: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    hasProfileImage: true,
  },
];

const bottomCaseStudy = {
  id: 4,
  icon: BookOpen,
  title: "How the brand stylist is helping entrepreneurs create exceptional brands",
  quote:
    "I've got a beautiful, established brand, which really makes a difference. LMS Athena makes displaying all of that seamlessly possible.",
  author: "Fiona Humberstone, The Brand Stylist",
  bgColor: "bg-[#F8F7F4]",
  textColor: "text-gray-900",
  hasProfileImage: true,
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

export default function ExpertCase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

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
              Expert Case Studies
            </h2>
            
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
              See all case studies
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:pt-2">
            <p className="text-base text-gray-700 leading-relaxed">
              Explore the countless ways Athena's learning commerce platform helps thousands of subject matter experts maximize their revenue and impact.
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
          {caseStudies.map((study) => {
            const Icon = study.icon;
            return (
              <motion.div
                key={study.id}
                variants={itemVariants}
                className="group"
              >
                <div
                  className={`${study.bgColor} ${study.hoverColor} rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
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

                  {/* Profile Image for Miss Excel */}
                  {study.hasProfileImage && (
                    <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full overflow-hidden bg-white/20">
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-100 flex items-center justify-center">
                        <span className="text-orange-600 text-xs font-semibold">KN</span>
                      </div>
                    </div>
                  )}
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
                {/* Placeholder for Fiona's circular image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center px-4 text-sm">
                    [Fiona Humberstone]<br />
                    Circular Photo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Light Beige Card with Text and Profile Image */}
          <div className="lg:col-span-3 bg-[#F8F7F4] p-8 lg:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Icon */}
              <div className="mb-6">
                <BookOpen className="w-10 h-10 text-gray-700" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {bottomCaseStudy.title}
              </h3>

              {/* Quote */}
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                "{bottomCaseStudy.quote}"
              </p>

              {/* Author */}
              <p className="text-sm text-gray-600 font-normal mb-6">
                {bottomCaseStudy.author}
              </p>

              {/* Learn More Link */}
              <button className="inline-flex items-center gap-2 text-gray-900 font-semibold text-sm hover:gap-3 transition-all duration-300">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Image on Right */}
            <div className="w-full lg:w-56 h-64 lg:h-auto flex-shrink-0">
              <div className="w-full h-full rounded-lg overflow-hidden">
                {/* Placeholder for Fiona's rectangular image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                  <p className="text-white text-center px-4 text-sm">
                    [Fiona Humberstone]<br />
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
