import React from 'react';

const HowAthenaWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create",
      description: "Generate your course using AI in seconds.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      ),
      gradient: "from-sky-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-50"
    },
    {
      number: "02",
      title: "Design",
      description: "Customize layouts, visuals, and narration effortlessly.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v.01"/>
        </svg>
      ),
      gradient: "from-blue-400 to-sky-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-sky-50"
    },
    {
      number: "03",
      title: "Deliver",
      description: "Host, track, and personalize every learner's journey.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
      ),
      gradient: "from-sky-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-100"
    }
  ];

  return (
    <section className="py-20 px-4" style={{
      background: "linear-gradient(135deg,#8fd6ff 0%,#f7faff 75%)"
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mb-4">
            How Athena Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into engaging learning experiences in three simple steps
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-12 left-8 w-1 h-80 bg-gradient-to-b from-sky-200 via-blue-200 to-sky-200 rounded-full z-0" />
            
            {/* Steps Container */}
            <div className="relative z-10 space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Step Card */}
                  <div className={`${step.bgColor} rounded-2xl p-6 relative overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-100 border border-blue-50`}>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-12 -mb-12 opacity-10" />
                    </div>

                    {/* Step Number */}
                    <div className={`absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-r ${step.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200/50 transform rotate-12 group-hover:rotate-0 transition-transform duration-300`}>
                      {step.number}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex items-center space-x-4 mt-2">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-300/50 group-hover:shadow-blue-400/50 transition-all duration-300 flex-shrink-0`}>
                        {step.icon}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-sky-700 mb-2 group-hover:text-blue-700 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sky-600 leading-relaxed group-hover:text-blue-600 transition-colors">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-3 rounded-2xl transition-opacity duration-300`} />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Demo Video */}
          <div className="relative flex items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/50 bg-gradient-to-br from-sky-50 to-blue-50 p-4 w-full">
              <video
                className="w-full h-auto rounded-xl"
                controls
                poster=""
                preload="metadata"
              >
                <source src="/src/assets/homevideo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Overlay Pattern */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-16 h-16 bg-blue-200 rounded-full opacity-10" />
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-sky-200 rounded-full opacity-10" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-300/50 hover:shadow-blue-400/50 transform hover:-translate-y-1 transition-all duration-300">
            Start Creating Today
          </button>
          <p className="text-sky-500 text-sm mt-4">
            No credit card required • Free 14-day trial
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default HowAthenaWorks;