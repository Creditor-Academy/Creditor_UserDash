import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    icon: BookOpen,
    title: "IntelyCare trained over 500,000 nursing facility professionals",
    quote:
      "We've had several hundred facilities sign up for our platform following the course launch.",
    author: "Christopher Caulfield, RN, NP-C – Co-Founder and Chief Nursing Officer at IntelyCare",
    bgColor: "bg-blue-400",
    hoverColor: "hover:bg-blue-500",
    hasImage: true,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&crop=faces",
  },
  {
    id: 2,
    icon: BookOpen,
    title: "How Chef Amanda Schonberg helps bakers make $1,000 per day",
    quote:
      "Fast forward now and I'm blessed to have two, six-figure businesses.",
    author: "Amanda Schoenberg, Baking for Business",
    bgColor: "bg-[#2d1b2e]",
    hoverColor: "hover:bg-[#3d2b3e]",
    hasImage: true,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop&crop=faces",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "How Flashpoint Educated 3,000+ Users And Enhanced Product Adoption",
    quote:
      "Teams that are utilizing the online course have much better buy-in from the get-go. They're able to get more out of the product.",
    author: "Grace Tilmont, Director of Education Services, Flashpoint.Io",
    bgColor: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    hasImage: true,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=faces",
  },
];

const bottomCaseStudy = {
  id: 4,
  icon: BookOpen,
  title: "How Anita Canada helps retailers drive business growth with Athena Plus",
  quote:
    "We have the control we need, but we're subcontracting all the work out to Athena Plus. It was effortless on our part.",
  author: "Mark Caskenette, Managing Director, Anita Canada",
  bgColor: "bg-gray-100",
  textColor: "text-gray-900",
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

export default function RevenueSucceed() {
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-8 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              Revenue generation case studies
            </h2>
            
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5">
              See all case studies
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:pt-2">
            <p className="text-base text-gray-700 leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
              Explore the countless ways Athena's learning commerce platform helps other businesses with revenue generation.
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
                  className={`${study.bgColor} ${study.hoverColor} rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300`}
                >
                  <div className="p-8 flex flex-col flex-grow">
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

                  {/* Image at bottom (only for third card) */}
                  {study.hasImage && study.image && (
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={study.image}
                        alt={study.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Row - Large Card with Circular Phone Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl"
        >
          {/* Left - Light Gray Card with Text */}
          <div className="bg-gray-100 p-8 lg:p-12 flex flex-col justify-center">
            {/* Icon */}
            <div className="mb-6">
              <BookOpen className="w-10 h-10 text-gray-900" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {bottomCaseStudy.title}
            </h3>

            {/* Quote */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              "{bottomCaseStudy.quote}"
            </p>

            {/* Author */}
            <p className="text-sm text-gray-700 font-normal mb-6">
              {bottomCaseStudy.author}
            </p>

            {/* Learn More Link */}
            <button className="inline-flex items-center gap-2 text-gray-900 font-semibold text-sm hover:gap-3 transition-all duration-300">
              Learn more
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right - Circular Image on Light Background */}
          <div className="relative h-64 lg:h-auto min-h-[400px] bg-gray-200 flex items-center justify-center">
            {/* Circular Image Container */}
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden bg-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop&crop=center"
                alt="Mobile phone with app"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

