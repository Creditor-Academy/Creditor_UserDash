import React from 'react';

const RevenuePricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$499",
      period: "per month",
      description: "Perfect for growing businesses",
      features: [
        "Revenue Analytics Dashboard",
        "Basic Pricing Optimization",
        "Email Support",
        "Monthly Strategy Review",
        "Up to 3 Team Members"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$1,299",
      period: "per month",
      description: "For established businesses",
      features: [
        "Everything in Starter",
        "Advanced Analytics & Forecasting",
        "A/B Testing Tools",
        "Priority Support",
        "Weekly Strategy Sessions",
        "Up to 10 Team Members",
        "Custom Integrations"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Dedicated Revenue Strategist",
        "Custom Solutions",
        "24/7 Support",
        "Unlimited Team Members",
        "White-Label Options",
        "API Access"
      ],
      highlighted: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Growth Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible pricing to match your business needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl p-8 ${
                plan.highlighted 
                  ? 'bg-blue-600 text-white shadow-2xl scale-105' 
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${
                plan.highlighted ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.name}
              </h3>
              <p className={`mb-4 ${
                plan.highlighted ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {' '}/{plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className={`mr-2 ${
                      plan.highlighted ? 'text-blue-200' : 'text-blue-600'
                    }`}>
                      ✓
                    </span>
                    <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                plan.highlighted 
                  ? 'bg-white text-blue-600 hover:bg-blue-50' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RevenuePricing;

