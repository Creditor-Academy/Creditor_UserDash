import React from 'react';
import { ArrowRight, Calendar, MessageCircle, Phone } from 'lucide-react';

const CTA = () => {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main CTA Content */}
          <div className="mb-12">
            <h2
              className="text-4xl md:text-6xl font-normal text-white mb-6 leading-tight"
              style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
            >
              Ready to Transform Your Learning?
            </h2>
            <p
              className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Let's discuss how we can create impactful learning experiences
              that drive real results for your organization.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="tel:+91 9811773207"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </a>
          </div>

          {/* Contact Methods - Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Email Card */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-2 overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Icon with animated ring */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="absolute w-20 h-20 bg-yellow-400/20 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle
                      className="w-8 h-8 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Email Us
                </h3>

                <p
                  className="text-gray-600 text-sm mb-4 leading-relaxed"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Get a detailed proposal tailored to your needs within 24 hours
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="mailto:admin@lmsathena.com"
                    className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors text-sm font-semibold group/link"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    admin@lmsathena.com
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2 overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Icon with animated ring */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="absolute w-20 h-20 bg-green-400/20 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Call Us
                </h3>

                <p
                  className="text-gray-600 text-sm mb-4 leading-relaxed"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Speak directly with our instructional design experts today
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="tel:+91 9811773207"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm font-semibold group/link"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    +91 9811773207
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Consultation Card */}
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-2 overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Icon with animated ring */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="absolute w-20 h-20 bg-purple-400/20 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar
                      className="w-8 h-8 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Free Consultation
                </h3>

                <p
                  className="text-gray-600 text-sm mb-4 leading-relaxed"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  30-minute strategy session to explore your learning goals
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors text-sm font-semibold group/link"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    Book Your Slot
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p
              className="text-blue-100 text-sm mb-4"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Trusted by 500+ organizations worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="text-white font-semibold">
                ✓ Free Discovery Call
              </div>
              <div className="text-white font-semibold">✓ Custom Proposal</div>
              <div className="text-white font-semibold">✓ No Obligation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
