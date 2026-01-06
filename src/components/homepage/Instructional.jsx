import { motion } from 'framer-motion';
import { Brain, Target, Gamepad2, BarChart3, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Brain,
    title: "Smart Content Generation",
    description: "Create lessons from any input with AI assistance. Upload documents, paste text, or describe your topic.",
    highlights: ["Auto-generate outlines", "Multi-format support", "Instant translations"],
    popular: true,
  },
  {
    icon: Target,
    title: "Adaptive Learning Paths",
    description: "Personalize experiences based on learner needs with intelligent pathway recommendations.",
    highlights: ["Skill gap analysis", "Custom pathways", "Progress tracking"],
    popular: false,
  },
  {
    icon: Gamepad2,
    title: "Interactive Elements",
    description: "Engage learners with dynamic content types including quizzes, simulations, and gamification.",
    highlights: ["Drag & drop builder", "50+ interaction types", "Real-time feedback"],
    popular: false,
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance and measure learning outcomes with comprehensive reporting dashboards.",
    highlights: ["Learning analytics", "ROI measurement", "Custom reports"],
    popular: false,
  },
];

const Instructional = () => {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-blue-50 via-sky-50 to-white overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-sky-100/40 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white mb-4">
                <Sparkles size={14} />
                Instructional Design Suite
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Everything you need to create{" "}
                <span className="text-blue-600">world-class training</span>
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Our platform combines cutting-edge AI with proven instructional design principles to help you build engaging learning experiences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-3"
            >
              <Link 
                to="/pricing"
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                View Pricing
              </Link>
              <Link 
                to="/contact"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Feature Cards - E-commerce Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                className="group relative"
              >
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 flex flex-col hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                  
                  {/* Popular Badge */}
                  {feature.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-blue-600" size={24} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 flex-grow">
                    {feature.description}
                  </p>

                  {/* Feature Highlights */}
                  <ul className="space-y-2">
                    {feature.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check size={14} className="text-blue-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 md:mt-16"
          >
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <h3 className="text-xl md:text-2xl font-semibold text-white text-center md:text-left">
                  Ready to transform your training?
                </h3>
                <Link 
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Schedule Demo
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div> */}

        </div>
      </div>
    </section>
  );
};

export default Instructional;
