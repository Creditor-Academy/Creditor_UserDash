import { TrendingUp, Target, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const trainingCards = [
  {
    icon: TrendingUp,
    title: "Increase Performance",
    description: "Boost employee productivity and performance with personalized learning paths powered by AI.",
    color: "blue",
  },
  {
    icon: Target,
    title: "Targeted Skills",
    description: "Focus on specific skills gaps with AI-driven content recommendations tailored to each learner.",
    color: "indigo",
  },
  {
    icon: Briefcase,
    title: "Business Impact",
    description: "Measure real business outcomes from your learning investments with advanced analytics.",
    color: "violet",
  },
];

const WhyTraining = () => {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-50 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-indigo-50 to-transparent opacity-50" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                Training Excellence
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight"
            >
              Why Training Matters
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Transform your learning & development with AI-powered solutions
              that accelerate growth and drive measurable results
            </motion.p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {trainingCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="group"
              >
                <div className="h-full rounded-2xl md:rounded-3xl bg-white border border-slate-200 p-6 md:p-8 flex flex-col shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-${card.color}-100 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={`text-${card.color}-600`} size={28} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-slate-600 mb-6 flex-grow leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* CTA */}
                  <div className={`flex items-center gap-2 text-sm font-medium text-${card.color}-600 cursor-pointer group/link`}>
                    <span>Learn more</span>
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyTraining;
