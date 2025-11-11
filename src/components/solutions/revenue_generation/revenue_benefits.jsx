import React from 'react';

const RevenueBenefits = () => {
  const benefits = [
    {
      title: 'Increase Conversion Rates',
      description:
        'Optimize your sales funnel and boost conversions with data-driven insights',
      icon: '📈',
    },
    {
      title: 'Maximize Customer Value',
      description:
        'Increase lifetime value through strategic upselling and cross-selling',
      icon: '💰',
    },
    {
      title: 'Reduce Churn',
      description:
        'Keep customers engaged with personalized retention strategies',
      icon: '🔄',
    },
    {
      title: 'Scale Efficiently',
      description: 'Grow revenue without proportionally increasing costs',
      icon: '📊',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Revenue Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Proven strategies that deliver measurable results for businesses of
            all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RevenueBenefits;
