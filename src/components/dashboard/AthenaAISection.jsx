import React, { useState, useEffect } from 'react';
import {
  FaBolt,
  FaLock,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaPlayCircle,
} from 'react-icons/fa';
import { useCredits } from '@/contexts/CreditsContext';
import athenaVideo from '@/assets/Athenaai.mp4';

const ATHENA_AI_UNLOCKED_KEY = 'athena_ai_unlocked';

/**
 * AthenaAISection Component
 *
 * Simple section about Athena AI with single unlock button.
 * Once unlocked, redirects to Athena AI.
 */
export function AthenaAISection() {
  const { balance } = useCredits();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Load unlock status from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ATHENA_AI_UNLOCKED_KEY);
      if (stored === 'true') {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error('Failed to load unlock status:', error);
    }
  }, []);

  // Save unlock status to localStorage
  const saveUnlockStatus = unlocked => {
    try {
      localStorage.setItem(ATHENA_AI_UNLOCKED_KEY, String(unlocked));
      setIsUnlocked(unlocked);
    } catch (error) {
      console.error('Failed to save unlock status:', error);
    }
  };

  const features = [
    'Generate brand logos and visual identities',
    'Create product and marketing imagery',
    'Build a cohesive brand kit in minutes',
    'Draft landing pages, ads, and emails',
  ];

  const UNLOCK_COST = 100; // Total cost to unlock Athena AI

  const handleUnlock = async () => {
    // Check if already unlocked
    if (isUnlocked) {
      redirectToAthenaAI();
      return;
    }

    // Check if user has enough credits
    if (balance < UNLOCK_COST) {
      alert(
        `You need ${UNLOCK_COST} credits to unlock Athena AI. You have ${balance} credits.`
      );
      return;
    }

    setIsUnlocking(true);

    try {
      // TODO: Add API call here later
      // await unlockContent('athena_ai', 'athena_ai', UNLOCK_COST);

      // For now, just mark as unlocked locally
      saveUnlockStatus(true);

      // Redirect to Athena AI after successful unlock
      setTimeout(() => {
        redirectToAthenaAI();
      }, 500);
    } catch (error) {
      console.error('Failed to unlock Athena AI:', error);
      alert('Failed to unlock Athena AI. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const redirectToAthenaAI = () => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
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
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-white to-blue-50/50" />

        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.05fr_1fr] items-start">
            {/* Video Preview */}
            <div className="relative w-full h-full min-h-[340px] overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-gray-900">
              <video
                src={athenaVideo}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <div className="absolute left-4 bottom-4 flex flex-wrap items-center gap-3 text-white">
                <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <FaPlayCircle className="h-4 w-4" />
                  <span>Preview (muted)</span>
                </div>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  Athena AI experience
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 h-full flex flex-col gap-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-100">
                    Premium Access
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Athena AI
                    </h2>
                    {isUnlocked && (
                      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        <FaCheckCircle className="h-4 w-4" />
                        <span>Unlocked</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 max-w-xl">
                    Unlock the full Athena AI studio to create logos, imagery,
                    and content with a single, secure token sign-on.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/90 px-4 py-4 shadow-sm hover:shadow-md transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <FaCheckCircle className="h-4 w-4" />
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-200 pt-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isUnlocked ? 'Athena AI is ready' : 'Unlock Athena AI'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isUnlocked
                      ? 'Open Athena AI in a new tab and start creating instantly.'
                      : `One-time unlock for ${UNLOCK_COST} credits.`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!isUnlocked && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                      {UNLOCK_COST} credits
                    </div>
                  )}
                  <button
                    onClick={handleUnlock}
                    disabled={
                      isUnlocking || (!isUnlocked && balance < UNLOCK_COST)
                    }
                    className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 min-w-[180px] justify-center ${
                      isUnlocking
                        ? 'bg-blue-500 text-white opacity-90 cursor-wait shadow-md'
                        : isUnlocked || balance >= UNLOCK_COST
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                          : 'bg-blue-100 text-blue-300 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Unlocking...</span>
                      </>
                    ) : isUnlocked ? (
                      <>
                        <span>Open Athena AI</span>
                        <FaExternalLinkAlt className="h-4 w-4" />
                      </>
                    ) : balance >= UNLOCK_COST ? (
                      <>
                        <FaLock className="h-5 w-5" />
                        <span>Unlock Athena AI</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="h-5 w-5" />
                        <span>Need {UNLOCK_COST} credits</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AthenaAISection;
