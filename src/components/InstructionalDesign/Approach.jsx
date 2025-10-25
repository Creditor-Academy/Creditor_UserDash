import React from 'react';
import { Search, Lightbulb, Code, Rocket, TrendingUp } from 'lucide-react';

const Approach = () => {
  const steps = [
    {
      number: "01",
      title: "Discover",
      icon: Search,
      description: "Needs analysis, stakeholder interviews",
      benefit: "Deep understanding of your learning objectives and audience",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02",
      title: "Design",
      icon: Lightbulb,
      description: "Storyboarding, prototype development",
      benefit: "Clear roadmap with validated learning strategies",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      number: "03",
      title: "Develop",
      icon: Code,
      description: "Course build, review cycles",
      benefit: "High-quality content with iterative refinement",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "04",
      title: "Deploy",
      icon: Rocket,
      description: "LMS integration, launch",
      benefit: "Seamless rollout with full technical support",
      color: "from-pink-500 to-pink-600"
    },
    {
      number: "05",
      title: "Measure & Iterate",
      icon: TrendingUp,
      description: "Analytics, ROI tracking, maintenance",
      benefit: "Continuous improvement driven by real data",
      color: "from-rose-500 to-rose-600"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)"
    }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-normal text-white mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            Our Process
          </h2>
          <p className="text-lg font-normal text-blue-100 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
            A proven methodology that transforms your vision into impactful learning experiences
          </p>
        </div>

        {/* Desktop Timeline - Horizontal */}
        <div className="hidden lg:block">
          {/* Steps */}
          <div className="grid grid-cols-5 gap-4 relative pt-16">
            {/* Connection Line - Aligned with circle dots center */}
            <div className="absolute top-4 left-0 w-full h-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40 z-0"></div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative z-10">
                  {/* Connecting Dot */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 h-[420px] flex flex-col">
                    {/* Number Badge */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} text-white font-bold text-lg mb-4 shadow-md`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-4">
                      <Icon className="w-8 h-8 text-gray-700" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-normal text-gray-900 mb-3" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-0" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {step.description}
                    </p>

                    {/* Benefit */}
                    <div className="pt-0 border-t border-gray-100 mt-auto flex-shrink-0">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Key Benefit
                      </p>
                      <p className="text-sm text-gray-700 font-normal leading-snug" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {step.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline - Vertical */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>
                )}

                <div className="flex gap-4">
                  {/* Left Side - Number & Icon */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg z-10`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Right Side - Content */}
                  <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border border-gray-100 min-h-[280px] flex flex-col">
                    {/* Icon */}
                    <div className="mb-3">
                      <Icon className="w-8 h-8 text-gray-700" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-normal text-gray-900 mb-2" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-0" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {step.description}
                    </p>

                    {/* Benefit */}
                    <div className="pt-0 border-t border-gray-100 mt-auto flex-shrink-0">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Key Benefit
                      </p>
                      <p className="text-sm text-gray-700 font-normal leading-snug" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {step.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Your Project
            </a>
            <a
              href="#case-studies"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg shadow-md hover:shadow-lg border-2 border-white hover:bg-white/10 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              View Case Studies
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;

