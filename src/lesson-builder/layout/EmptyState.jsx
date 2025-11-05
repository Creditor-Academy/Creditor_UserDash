import React from 'react';

/**
 * Empty Lesson State Component
 * Shows when no content blocks are present
 * Extracts lines 4816-4938 from original LessonBuilder.jsx
 */
const EmptyState = () => {
  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Animated icon */}
            <div className="mb-4 relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
              <div
                className="absolute -bottom-1 -left-3 w-4 h-4 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
              Ready to Create Something Amazing?
            </h2>

            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Your lesson canvas is waiting! Start building engaging content by
              adding blocks from the sidebar.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Rich Content
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  Add text, images, videos & more
                </p>
              </div>

              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Interactive
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  Drag & drop to organize
                </p>
              </div>

              <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl border border-pink-100">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Fast & Easy
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  Build lessons in minutes
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-60"></div>
            <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
