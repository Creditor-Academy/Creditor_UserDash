import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AthenaAIButton Component
 *
 * A reusable button that redirects users to Athena AI while maintaining their login session.
 * Retrieves JWT token from localStorage and appends it as a query parameter.
 */
export function AthenaAIButton({ className = '' }) {
  const handleOpenAthenaAI = () => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Show alert if no token is found
      console.warn(
        '❌ Athena AI redirect failed: No authToken found in localStorage'
      );
      alert('Please log in first');
      return;
    }

    // Log token info (first 10 chars only for security)
    console.log('✅ Token retrieved from localStorage');
    console.log('   Token preview:', token.substring(0, 10) + '...');
    console.log('   Token length:', token.length, 'characters');

    // Encode token for URL safety
    const encodedToken = encodeURIComponent(token);

    // Build redirect URL
    const athenaURL = `http://localhost:5173/login?token=${encodedToken}`;

    // Log full redirect URL for debugging
    console.log('🚀 Redirecting to Athena AI...');
    console.log('   Full URL:', athenaURL);
    console.log(
      '   Encoded token preview:',
      encodedToken.substring(0, 10) + '...'
    );

    // Open Athena AI in new tab
    window.open(athenaURL, '_blank');
    console.log('✅ New tab opened successfully');
  };

  return (
    <button
      onClick={handleOpenAthenaAI}
      className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:text-purple-900 shadow-sm hover:shadow transition-all duration-200 ${className}`}
      aria-label="Open Athena AI"
      title="Open Athena AI in new tab"
    >
      <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
      <span className="text-sm font-semibold hidden sm:inline">
        Open Athena AI
      </span>
      <span className="text-sm font-semibold sm:hidden">Athena AI</span>
    </button>
  );
}

export default AthenaAIButton;
