{
  /* Why Training Section */
}
import React from 'react';
import { TrendingUp, Target, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyTraining = () => {
  return (
    <div>
      {/* Why Training Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold mb-4">
                Training Excellence
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Why Training Matters
              </h3>
              <p className="text-slate-600 text-xl max-w-3xl mx-auto">
                Transform your learning & development with AI-powered solutions
                that accelerate growth and drive results
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-b from-white to-slate-50 p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-white text-2xl" size={32} />
                </div>
                <h4 className="font-bold text-2xl text-slate-800 mb-4">
                  Increase Performance
                </h4>
                <p className="text-slate-600 mb-6 flex-grow">
                  Boost employee productivity and performance with personalized
                  learning paths
                </p>
                <div className="flex items-center text-blue-600 font-medium mt-auto">
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="group bg-gradient-to-b from-white to-slate-50 p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="text-white text-2xl" size={32} />
                </div>
                <h4 className="font-bold text-2xl text-slate-800 mb-4">
                  Targeted Skills
                </h4>
                <p className="text-slate-600 mb-6 flex-grow">
                  Focus on specific skills gaps with AI-driven content
                  recommendations
                </p>
                <div className="flex items-center text-purple-600 font-medium mt-auto">
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="group bg-gradient-to-b from-white to-slate-50 p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="text-white text-2xl" size={32} />
                </div>
                <h4 className="font-bold text-2xl text-slate-800 mb-4">
                  Business Impact
                </h4>
                <p className="text-slate-600 mb-6 flex-grow">
                  Measure real business outcomes from your learning investments
                </p>
                <div className="flex items-center text-cyan-600 font-medium mt-auto">
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyTraining;
