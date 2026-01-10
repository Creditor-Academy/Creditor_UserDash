import { TrendingUp, Target, Briefcase, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const trainingCards = [
  {
    id: 1,
    icon: TrendingUp,
    title: "Increase Performance",
    description: "Boost employee productivity and performance with personalized learning paths powered by AI.",
    details: "Our AI analyzes current output vs. industry benchmarks to generate custom curriculum that cuts ramp-up time by 40%.",
    color: "blue",
    stats: "+25% Productivity"
  },
  {
    id: 2,
    icon: Target,
    title: "Targeted Skills",
    description: "Focus on specific skills gaps with AI-driven content recommendations tailored to each learner.",
    details: "Dynamic skill-mapping identifies 'hidden' talent gaps and automatically assigns modules to close them in real-time.",
    color: "indigo",
    stats: "90% Skill Mastery"
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Business Impact",
    description: "Measure real business outcomes from your learning investments with advanced analytics.",
    details: "Integrate directly with your CRM or ERP to see the direct correlation between training completion and revenue growth.",
    color: "violet",
    stats: "3.2x ROI"
  },
];

const WhyTraining = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 overflow-hidden min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(240,244,255,1)_0%,rgba(255,255,255,1)_100%)]" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-sm font-semibold text-blue-600"
            >
              Interactive Solutions
            </motion.span>
            <motion.h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900">
              Why Training Matters
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainingCards.map((card) => (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                onClick={() => setSelectedId(card)}
                className="relative cursor-pointer group"
                whileHover={{ y: -8 }}
              >
                <div className="h-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:border-blue-200 transition-all duration-300">
                  <motion.div 
                    layoutId={`icon-bg-${card.id}`}
                    className={`w-16 h-16 rounded-2xl bg-${card.color}-50 flex items-center justify-center mb-6`}
                  >
                    <card.icon className={`text-${card.color}-600`} size={32} />
                  </motion.div>
                  
                  <motion.h3 layoutId={`title-${card.id}`} className="text-2xl font-bold text-slate-900 mb-4">
                    {card.title}
                  </motion.h3>
                  
                  <p className="text-slate-600 mb-8">{card.description}</p>
                  
                  <div className="flex items-center text-blue-600 font-semibold">
                    View Details <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay Modal for Detail View */}
      <AnimatePresence>
        {selectedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              layoutId={`card-${selectedId.id}`}
              className="fixed inset-0 m-auto z-50 h-fit max-w-2xl w-[95%] bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedId(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <motion.div 
                  layoutId={`icon-bg-${selectedId.id}`}
                  className={`w-20 h-20 shrink-0 rounded-3xl bg-${selectedId.color}-100 flex items-center justify-center`}
                >
                  <selectedId.icon className={`text-${selectedId.color}-600`} size={40} />
                </motion.div>

                <div>
                  <motion.h3 layoutId={`title-${selectedId.id}`} className="text-3xl font-bold text-slate-900 mb-2">
                    {selectedId.title}
                  </motion.h3>
                  <span className={`inline-block mb-6 px-3 py-1 rounded-lg bg-${selectedId.color}-100 text-${selectedId.color}-700 font-bold text-sm`}>
                    {selectedId.stats}
                  </span>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {selectedId.description}
                  </p>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-2">How it works:</h4>
                    <p className="text-slate-600">{selectedId.details}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WhyTraining;