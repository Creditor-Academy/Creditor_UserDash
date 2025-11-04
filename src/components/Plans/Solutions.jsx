import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, School, Palette, ArrowRight, CheckCircle } from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      icon: GraduationCap,
      title: "Educators & Coaches",
      description: "Create personalized learning experiences with AI-powered tools. Design courses, track progress, and engage learners effectively.",
      features: ["AI Course Generation", "Progress Tracking", "Interactive Assessments"]
    },
    {
      icon: Building2,
      title: "Corporates",
      description: "AI-based compliance training, employee onboarding, and skill development programs tailored for your organization.",
      features: ["Compliance Training", "Onboarding Automation", "Skill Tracking"]
    },
    {
      icon: School,
      title: "Institutions",
      description: "Centralized course design, student management, and comprehensive analytics for educational institutions of all sizes.",
      features: ["Course Management", "Student Analytics", "Multi-Department Support"]
    },
    {
      icon: Palette,
      title: "Learning Designers",
      description: "Professional-grade AI co-pilot for instructional designers. Create stunning, pedagogically sound content faster.",
      features: ["Design Templates", "AI Co-Pilot", "Content Library"]
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-sky-200 rounded-full text-sky-700 text-sm font-semibold mb-6 shadow-sm">
            <Building2 className="w-4 h-4 mr-2" />
            Tailored Solutions
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Built for Your Unique Needs
          </h2>
          
          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "150px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent mx-auto mb-6"
          />
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Whether you're an educator, enterprise, or institution, Athena adapts to your specific requirements
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white border-2 border-sky-100 rounded-2xl p-8 hover:border-sky-300 hover:shadow-2xl transition-all duration-300 h-full shadow-md">
                {/* Icon and Title */}
                <div className="flex items-center space-x-4 mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-sky-200 group-hover:to-blue-200 transition-colors shadow-sm">
                    <solution.icon className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">
                    {solution.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {solution.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-sky-600" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6 text-lg">Not sure which solution fits you best?</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
          >
            Schedule a Consultation
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;

