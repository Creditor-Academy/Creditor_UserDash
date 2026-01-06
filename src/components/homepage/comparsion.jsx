import { motion } from 'framer-motion';
import { Check, X, Minus, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    name: 'E-Commerce Marketplace Experience',
    athena: { value: 'Shop, bundles, flexible pricing', isAdvantage: true },
    others: ['No', 'No', 'Subscription only', 'Basic plans', 'Enterprise licensing'],
  },
  {
    name: 'Number of Integrated Tools',
    athena: { value: '8 modular flagships', isAdvantage: true },
    others: ['LMS + limited add-ons', 'LMS + basic authoring', 'Authoring suite only', 'LMS only', 'Suite (complex)'],
  },
  {
    name: 'AI-Powered Course Authoring',
    athena: { value: 'Advanced AI generation', isAdvantage: true },
    others: ['Limited', 'Some', 'Limited', 'Basic', 'Some'],
  },
  {
    name: 'Built-In Visual Design Studio',
    athena: { value: 'Canva by Athena', isAdvantage: true },
    others: ['No', 'No', 'Basic templates', 'No', 'No'],
  },
  {
    name: 'Virtual Instructor-Led Training',
    athena: { value: 'Full AI-enhanced VILT', isAdvantage: true },
    others: ['Integrations', 'Integrations', 'No', 'Basic', 'Yes (extra cost)'],
  },
  {
    name: 'Interactive Digital Book Creator',
    athena: { value: 'Book SMART AI', isAdvantage: true },
    others: ['No', 'No', 'No', 'No', 'No'],
  },
  {
    name: 'Lifelike AI Avatars/Agents',
    athena: { value: 'Full support', isAdvantage: true },
    others: ['No', 'No', 'No', 'No', 'Limited'],
  },
  {
    name: 'Gamified LMS/LXP',
    athena: { value: 'Advanced AI personalization', isAdvantage: true },
    others: ['Yes', 'Yes', 'Exports only', 'Yes', 'Yes'],
  },
  {
    name: 'No-Code Website/LMS Builder',
    athena: { value: 'AI-generated sites', isAdvantage: true },
    others: ['No', 'No', 'No', 'Limited', 'No'],
  },
  {
    name: 'Cost/Time Savings',
    athena: { value: 'Up to 80% savings', isAdvantage: true },
    others: ['Varies', 'Varies', 'High subscription', 'Affordable', 'High enterprise cost'],
  },
];

const competitors = ['Docebo', 'Absorb LMS', 'Articulate 360', 'TalentLMS', 'Cornerstone'];

const getValueIcon = (value) => {
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'no') {
    return <X size={16} className="text-red-400" />;
  }
  if (lowerValue === 'yes') {
    return <Check size={16} className="text-green-500" />;
  }
  if (lowerValue.includes('limited') || lowerValue.includes('basic') || lowerValue.includes('some')) {
    return <Minus size={16} className="text-amber-400" />;
  }
  return null;
};

const ComparisonSection = () => {
  return (
    <section className="relative py-16 md:py-24 bg-[#050b1a] overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-blue-300 mb-4">
              <Crown size={14} className="text-amber-400" />
              Platform Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              See How Athena{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Outperforms
              </span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              Compare Athena's comprehensive feature set against leading platforms
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          >
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .comparison-table::-webkit-scrollbar { display: none; }
              `}</style>
              <table className="w-full min-w-[900px] comparison-table">
                <thead>
                  <tr>
                    <th className="py-5 px-6 text-left text-sm font-semibold text-white/70 bg-white/5 border-b border-white/10 w-[220px]">
                      Feature
                    </th>
                    {/* Athena Column Header - Highlighted */}
                    <th className="py-5 px-4 text-center bg-gradient-to-b from-blue-600/30 to-blue-600/10 border-b border-blue-500/30 min-w-[160px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-400" />
                          <span className="text-white font-bold text-base">Athena</span>
                        </div>
                        <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Recommended</span>
                      </div>
                    </th>
                    {competitors.map((name) => (
                      <th key={name} className="py-5 px-4 text-center text-sm font-medium text-white/50 bg-white/5 border-b border-white/10 min-w-[120px]">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr 
                      key={feature.name}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 border-b border-white/5 text-sm text-white/80 font-medium">
                        {feature.name}
                      </td>
                      {/* Athena Cell - Highlighted */}
                      <td className="py-4 px-4 text-center border-b border-blue-500/20 bg-gradient-to-b from-blue-600/20 to-blue-600/5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                          <Check size={14} className="text-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white whitespace-nowrap">
                            {feature.athena.value}
                          </span>
                        </div>
                      </td>
                      {feature.others.map((value, i) => (
                        <td key={i} className="py-4 px-4 text-center border-b border-white/5">
                          <div className="inline-flex items-center gap-1.5 text-sm text-white/50">
                            {getValueIcon(value)}
                            <span className="whitespace-nowrap">{value}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 md:mt-12 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Crown size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Ready to switch to Athena?</p>
                  <p className="text-white/50 text-sm">Start your free trial today</p>
                </div>
              </div>
                <Link 
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition whitespace-nowrap"
                >
                  Get Started
                </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
