import React from 'react';

const RevenueGrowth = () => {
  const stats = [
    { value: "3x", label: "Average Revenue Growth" },
    { value: "45%", label: "Increase in Customer LTV" },
    { value: "60%", label: "Faster Sales Cycles" },
    { value: "25%", label: "Reduction in Churn" }
  ];

  const caseStudies = [
    {
      company: "TechStartup Inc.",
      industry: "SaaS",
      result: "Increased MRR by 250% in 6 months",
      description: "Implemented pricing optimization and customer expansion strategies"
    },
    {
      company: "E-Commerce Pro",
      industry: "Retail",
      result: "Boosted conversion rate by 40%",
      description: "Optimized sales funnel and personalized customer journeys"
    },
    {
      company: "B2B Solutions Ltd.",
      industry: "Enterprise",
      result: "Reduced churn by 35%",
      description: "Developed retention programs and customer success initiatives"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Proven Results
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real metrics from real businesses
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-sm text-blue-600 font-semibold mb-2">
                {study.industry}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {study.company}
              </h3>
              <div className="text-2xl font-semibold text-green-600 mb-4">
                {study.result}
              </div>
              <p className="text-gray-600">
                {study.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RevenueGrowth;

