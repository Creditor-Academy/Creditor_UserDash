{
  /* Instructional Design Section */
}
import React from 'react';

const Instructional = () => {
  return (
    <div>
      {/* Instructional Design Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Instructional Design Excellence
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our platform combines cutting-edge AI with proven instructional
              design principles
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-white shadow-xl border-l-4 border-gray-300">
                    <div className="flex items-start">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mr-5 flex-shrink-0 text-2xl text-gray-600">
                        🧠
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">
                          Smart Content Generation
                        </h4>
                        <p className="text-gray-600">
                          Create lessons from any input with AI assistance
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gray-50 border-l-4 border-gray-200">
                    <div className="flex items-start">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mr-5 flex-shrink-0 text-2xl text-gray-600">
                        🎯
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">
                          Adaptive Learning Paths
                        </h4>
                        <p className="text-gray-600">
                          Personalize experiences based on learner needs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gray-50 border-l-4 border-gray-200">
                    <div className="flex items-start">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mr-5 flex-shrink-0 text-2xl text-gray-600">
                        🎮
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">
                          Interactive Elements
                        </h4>
                        <p className="text-gray-600">
                          Engage learners with dynamic content types
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    Performance Metrics
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">
                          Content Creation
                        </span>
                        <span className="text-gray-800 font-bold">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-500"
                          style={{ width: '98%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">
                          Engagement Rate
                        </span>
                        <span className="text-gray-800 font-bold">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-600"
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">
                          Retention Rate
                        </span>
                        <span className="text-gray-800 font-bold">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-700"
                          style={{ width: '87%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">
                          Completion Rate
                        </span>
                        <span className="text-gray-800 font-bold">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-800"
                          style={{ width: '91%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Instructional;
