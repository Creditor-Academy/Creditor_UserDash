import React from 'react';

const RevenueStrategies = () => {
  const strategies = [
    {
      title: 'Pricing Optimization',
      description:
        'Implement dynamic pricing strategies that maximize revenue while maintaining customer satisfaction',
      features: ['A/B Testing', 'Market Analysis', 'Value-Based Pricing'],
    },
    {
      title: 'Sales Enablement',
      description:
        'Equip your sales team with tools and insights to close deals faster and more effectively',
      features: ['CRM Integration', 'Lead Scoring', 'Sales Analytics'],
    },
    {
      title: 'Customer Expansion',
      description:
        'Identify and capture upsell and cross-sell opportunities within your existing customer base',
      features: [
        'Usage Analytics',
        'Product Recommendations',
        'Automated Workflows',
      ],
    },
    {
      title: 'New Revenue Streams',
      description:
        'Discover and develop innovative revenue channels to diversify your income sources',
      features: [
        'Market Research',
        'Product Development',
        'Partnership Strategies',
      ],
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Revenue Generation Strategies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive approaches to drive sustainable growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {strategies.map((strategy, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-8 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {strategy.title}
              </h3>
              <p className="text-gray-600 mb-6">{strategy.description}</p>
              <ul className="space-y-2">
                {strategy.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <span className="text-blue-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RevenueStrategies;
