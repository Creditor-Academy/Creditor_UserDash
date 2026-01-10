import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Target,
  Gamepad2,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Content Builder",
    description: "Instantly turn ideas, documents, or text into structured learning content.",
    highlights: ["Auto outlines", "Multi-format output", "Instant translations"],
    popular: true,
  },
  {
    icon: Target,
    title: "Adaptive Learning",
    description: "Personalized learning paths that adapt to every learner’s needs.",
    highlights: ["Skill gap detection", "Custom pathways", "Progress insights"],
  },
  {
    icon: Gamepad2,
    title: "Interactive Learning",
    description: "Boost engagement with quizzes, simulations, and gamification.",
    highlights: ["Gamified flows", "Live feedback", "No-code builder"],
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    description: "Understand performance and prove impact with real-time analytics.",
    highlights: ["Smart dashboards", "ROI tracking", "Custom reports"],
  },
];

const Instructional = () => {
  const [active, setActive] = useState(0);
  const ActiveIcon = features[active].icon;

  return (
    <section className="relative py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white mb-5">
            <Sparkles size={14} />
            Instructional Design Suite
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Designed to build{" "}
            <span className="text-blue-600">better learning</span>
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Everything you need to create, personalize, and measure training—powered by AI.
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Feature Selector */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                onClick={() => setActive(index)}
                className={`w-full text-left rounded-2xl p-5 border transition-all
                  ${
                    active === index
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white border-slate-200 hover:border-blue-300"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {feature.title}
                  </h3>

                  {feature.popular && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium
                        ${
                          active === index
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-600"
                        }`}
                    >
                      Popular
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feature Details */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xl"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6"
                >
                  <ActiveIcon className="text-blue-600" size={28} />
                </motion.div>

                <h4 className="text-2xl font-bold text-slate-900 mb-3">
                  {features[active].title}
                </h4>

                <p className="text-slate-600 mb-6">
                  {features[active].description}
                </p>

                <ul className="space-y-3 mb-8">
                  {features[active].highlights.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
                >
                  Explore feature <ArrowRight size={16} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className=" flex gap-4">
          <Link
            to="/pricing"
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
          >
            View Pricing
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Instructional;
