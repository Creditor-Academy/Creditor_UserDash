import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    icon: Building2,
    title: "How Chargebee Empowers Customer Success Through Subscription Academy",
    quote:
      "Athena Enterprise has been instrumental in scaling our customer education. The platform's flexibility allows us to deliver comprehensive training that directly impacts customer success metrics.",
    author: "Guy Marion, Chief Marketing Officer",
    bgColor: "bg-blue-400",
    hoverColor: "hover:bg-blue-500",
    textColor: "text-gray-900",
  },
  {
    id: 2,
    icon: Building2,
    title: "How Keap reduced partner onboarding time by 30% by making the switch from a legacy LMS to Athena Enterprise",
    quote:
      "Athena Enterprise has revolutionized our partner education program. The intuitive interface and powerful analytics have significantly improved our partner onboarding process.",
    author: "Brian Anciaux, Partner Onboarding Manager",
    bgColor: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    textColor: "text-white",
  },
  {
    id: 3,
    icon: Building2,
    title: "How Hootsuite Uses Athena Enterprise to Educate Customers and Generate Revenue",
    quote:
      "Our customers are consuming Hootsuite Academy education content at unprecedented rates. Athena Enterprise has transformed how we deliver value to our user base.",
    author: "Sarah Whyte, Education Marketing Specialist, Hootsuite",
    bgColor: "bg-gray-800",
    hoverColor: "hover:bg-gray-900",
    textColor: "text-white",
  },
  {
    id: 4,
    icon: Building2,
    title: "IntelyCare trained over 500,000 nursing facility professionals with Athena",
    quote:
      "The interactive features and viral nature of our training content have been game-changing. Athena has enabled us to scale our impact across the healthcare industry.",
    author: "Christopher Caulfield, Co-Founder and Chief Nursing Officer",
    bgColor: "bg-gray-200",
    hoverColor: "hover:bg-gray-300",
    textColor: "text-gray-900",
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

export default function CompanyCase() {
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
              Company case studies
            </h2>
          </div>

          <div className="lg:pt-2">
            <p className="text-base text-gray-700 leading-relaxed mb-6">
              Explore the countless ways Athena's learning commerce platform helps thousands of companies simplify their operations while maximizing their profits.
            </p>
            
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
              See all case studies
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Case Studies Grid - 2x2 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                  className={`${study.bgColor} ${study.hoverColor} rounded-2xl p-8 h-full flex flex-col transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1`}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <Icon className={`w-10 h-10 ${study.textColor}`} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl lg:text-2xl font-bold ${study.textColor} mb-6 leading-tight`}>
                    {study.title}
                  </h3>

                  {/* Quote */}
                  <p className={`text-sm ${study.textColor} opacity-90 leading-relaxed mb-4 flex-grow italic`}>
                    "{study.quote}"
                  </p>

                  {/* Author */}
                  {study.author && (
                    <p className={`text-sm ${study.textColor} opacity-90 font-normal mb-6`}>
                      {study.author}
                    </p>
                  )}

                  {/* Learn More Link */}
                  <button className={`inline-flex items-center gap-2 ${study.textColor} font-semibold text-sm group-hover:gap-3 transition-all duration-300`}>
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
