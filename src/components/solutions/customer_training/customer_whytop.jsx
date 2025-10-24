import React from 'react';
import { Clock, Users, Brain, Plug } from 'lucide-react';

const CustomerWhyTop = () => {
  const features = [
    {
      icon: <Clock className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      title: "Fast implementation",
      description: "Launch customer training programs quickly so your customers can start getting value from your product immediately."
    },
    {
      icon: <Users className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      title: "Engaging experiences",
      description: "Create interactive learning paths that keep customers engaged and help them master your product features."
    },
    {
      icon: <Brain className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      title: "AI-powered content",
      description: "Leverage AI to create personalized training content that adapts to each customer's learning style and pace."
    },
    {
      icon: <Plug className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
      title: "Seamless integration",
      description: "Integrate training seamlessly into your customer journey, from onboarding to advanced feature adoption."
    }
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)" }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            Why leading companies use <span className="text-blue-600">Athena</span> for customer training
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
            Empower your customers with comprehensive training that drives product adoption and long-term success
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 overflow-hidden"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon and Title in same line */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${feature.iconBg} rounded-xl p-3 w-fit shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex-shrink-0`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerWhyTop;

