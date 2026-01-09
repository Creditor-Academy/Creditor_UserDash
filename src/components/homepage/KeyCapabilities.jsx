import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  CreditCard,
  Layers,
  BarChart3,
  Brain,
  Puzzle,
} from "lucide-react";

const features = [
  {
    title: "E-Commerce Marketplace",
    description:
      "Shop like Amazon with intelligent search, curated categories, demos, reviews, ratings, and side-by-side comparisons.",
    icon: ShoppingCart,
  },
  {
    title: "Flexible Purchasing Options",
    description:
      "Freemium trials, subscriptions, one-time purchases, AI credits, and bundled plans — all in one checkout flow.",
    icon: CreditCard,
  },
  {
    title: "8 Modular Flagship Products",
    description:
      "Choose exactly what you need. Each product integrates seamlessly into the Athena ecosystem.",
    icon: Layers,
  },
  {
    title: "Centralized Dashboard",
    description:
      "Deploy tools, track usage, monitor learner progress, analyze performance, and measure ROI in one place.",
    icon: BarChart3,
  },
  {
    title: "AI-Powered Automation",
    description:
      "Eliminate repetitive work across authoring, design, delivery, and management with intelligent automation.",
    icon: Brain,
  },
  {
    title: "Scalability & Integration",
    description:
      "Built for solo creators to global enterprises with SCORM compliance and seamless LMS exports.",
    icon: Puzzle,
  },
];

const AthenaPlatformOffers = () => {
  return (
    <section className="relative py-28 px-4 overflow-hidden">
      {/* 🌤 Light blue creative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-sky-50" />
      <div className="absolute top-24 left-24 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-24 right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="max-w-3xl mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm uppercase tracking-widest text-slate-500 mb-4">
            What Athena Platform Offers
          </p>

          <h2 className="text-4xl md:text-5xl font-normal text-slate-900 leading-tight mb-6">
            A complete learning ecosystem,
            <br />
            <span className="text-sky-600">built for modern education</span>
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed">
            Athena is more than software — it’s a unified platform that brings
            together commerce, creation, delivery, and analytics into a single,
            intuitive experience.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="
                  group flex gap-6 items-start
                  p-4 -m-4 rounded-xl
                  transition-all duration-300
                  hover:bg-white/70 hover:shadow-lg
                "
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="
                    w-12 h-12 rounded-xl
                    border border-slate-200
                    bg-white
                    flex items-center justify-center
                    text-sky-600
                    transition
                  "
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* subtle underline on hover */}
                  <div className="mt-3 h-px w-0 bg-sky-400 group-hover:w-16 transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing Statement */}
        <motion.div
          className="mt-24 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xl text-slate-700 leading-relaxed">
            Athena eliminates fragmentation and puts professional-grade edtech
            within reach of every budget — from individual creators to global
            enterprises.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AthenaPlatformOffers;
