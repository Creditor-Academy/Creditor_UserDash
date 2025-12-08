import React from 'react';
import { Sparkles, ArrowRight, Brain, Zap, MessageSquare } from 'lucide-react';

/**
 * AthenaAISection Component
 *
 * A prominent dashboard section that promotes and provides access to Athena AI.
 * Displays features and a call-to-action button to open Athena AI.
 */
export function AthenaAISection() {
  const handleOpenAthenaAI = () => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Show alert if no token is found
      console.warn(
        'Athena AI redirect failed: No authToken found in localStorage'
      );
      alert('Please log in first');
      return;
    }

    // Log token info (first 10 chars only for security)
    console.log('Token retrieved from localStorage');
    console.log('   Token preview:', token.substring(0, 10) + '...');
    console.log('   Token length:', token.length, 'characters');

    // Encode token for URL safety
    const encodedToken = encodeURIComponent(token);

    // Build redirect URL
    const athenaURL = `http://localhost:5173/login?token=${encodedToken}`;

    // Log full redirect URL for debugging
    console.log(' Redirecting to Athena AI...');
    console.log('   Full URL:', athenaURL);
    console.log(
      '   Encoded token preview:',
      encodedToken.substring(0, 10) + '...'
    );

    // Open Athena AI in new tab
    window.open(athenaURL, '_blank');
    console.log('New tab opened successfully');
  };

  return (
    <div className="mb-8">
      <div className="rounded-2xl shadow-lg border border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="relative">
          <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-purple-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />

          <div className="relative z-10 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Athena AI Assistant
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Your intelligent learning companion
                  </p>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left: Description and Features */}
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Get instant help with your coursework, ask questions, and
                  receive personalized learning assistance powered by AI.
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Smart Learning
                      </h4>
                      <p className="text-xs text-gray-600">
                        AI-powered explanations tailored to your level
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        24/7 Assistance
                      </h4>
                      <p className="text-xs text-gray-600">
                        Get help anytime, anywhere with your studies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Instant Answers
                      </h4>
                      <p className="text-xs text-gray-600">
                        Quick responses to your course questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: CTA and Visual */}
              <div className="flex flex-col items-center justify-center text-center space-y-4 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Ready to Learn Smarter?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Launch Athena AI and start getting answers
                  </p>
                </div>

                <button
                  onClick={handleOpenAthenaAI}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                  <span>Open Athena AI</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-gray-500">
                  Opens in a new tab • Your session is preserved
                </p>
              </div>
            </div>

            {/* Bottom Stats/Info Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">24/7</p>
                <p className="text-xs text-gray-600">Availability</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">AI</p>
                <p className="text-xs text-gray-600">Powered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">∞</p>
                <p className="text-xs text-gray-600">Questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AthenaAISection;
