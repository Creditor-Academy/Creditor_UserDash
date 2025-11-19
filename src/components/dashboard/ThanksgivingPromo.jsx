import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BANNER_URL =
  'https://lesson-banners.s3.us-east-1.amazonaws.com/Upcoming_Courses_Banner/Thanks+giving+offer.png';
const STORAGE_KEY = 'thanksgivingPromoClosed';

export default function ThanksgivingPromo({ onExtendMembership }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 480, height: 640 });
  const [scale, setScale] = useState(1);

  const CTA_HEIGHT = 160; // design height for CTA block
  const navigate = useNavigate();

  // Listen for login event and clear storage to show banner on new login
  useEffect(() => {
    const handleUserLoggedIn = () => {
      // Clear storage when user logs in so banner shows once per login session
      sessionStorage.removeItem(STORAGE_KEY);
      setIsCollapsed(false);
      setIsOpen(false);

      // If image is already loaded, show the banner after a delay
      if (imageLoaded) {
        setTimeout(() => {
          setIsOpen(true);
        }, 2500);
      }
    };

    // Listen for login event
    window.addEventListener('userLoggedIn', handleUserLoggedIn);

    // Check if banner has been closed in current session
    const hasBeenClosed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    if (hasBeenClosed) {
      setIsCollapsed(true);
    }

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, [imageLoaded]);

  // Preload the image before showing the modal
  useEffect(() => {
    const img = new Image();
    let timer;

    const handleLoad = () => {
      setNaturalSize({
        width: img.width || 480,
        height: img.height || 640,
      });
      setImageLoaded(true);

      // Only auto-open if it hasn't been closed in this session
      const hasBeenClosed = sessionStorage.getItem(STORAGE_KEY) === 'true';
      if (!hasBeenClosed) {
        // Delay after image loads before showing modal
        timer = setTimeout(() => {
          setIsOpen(true);
        }, 2500); // 2.5 seconds delay
      }
    };

    const handleError = () => {
      // If image fails to load, still show after a delay
      setImageLoaded(true);
      const hasBeenClosed = sessionStorage.getItem(STORAGE_KEY) === 'true';
      if (!hasBeenClosed) {
        timer = setTimeout(() => {
          setIsOpen(true);
        }, 2500);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = BANNER_URL;

    return () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Compute a scale factor so the whole creative always fits within the viewport
  useEffect(() => {
    const updateScale = () => {
      if (typeof window === 'undefined') return;
      const vw = window.innerWidth * 0.9;
      const vh = window.innerHeight * 0.9;

      const bannerWidth = naturalSize.width;
      const bannerHeight = naturalSize.height + CTA_HEIGHT;

      const widthScale = vw / bannerWidth;
      const heightScale = vh / bannerHeight;

      const nextScale = Math.min(widthScale, heightScale, 1); // never upscale beyond 100%
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [naturalSize]);

  const handleClose = () => {
    // Mark as closed in current session (sessionStorage resets on new login)
    sessionStorage.setItem(STORAGE_KEY, 'true');
    // Smooth collapse: close modal first, then show emoji
    setIsOpen(false);
    // Show collapsed emoji button after modal exit animation completes
    setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
  };

  const handleExpand = () => {
    // Smooth expand: hide emoji first, then show modal
    setIsCollapsed(false);
    // Small delay before opening to allow emoji collapse animation to complete
    setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };

  const handleExtendMembership = () => {
    setIsOpen(false);
    onExtendMembership?.();
    navigate('/dashboard/membership/enroll');
    // Mark as closed in current session
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => {
      setIsCollapsed(true);
    }, 300);
  };

  return (
    <>
      {/* Collapsed Gift Emoji Button */}
      <AnimatePresence>
        {isCollapsed && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            onClick={handleExpand}
            className="fixed bottom-6 right-6 z-[60] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-2xl hover:shadow-orange-500/70 flex items-center justify-center text-3xl sm:text-4xl border-[3px] border-white/50 backdrop-blur-sm cursor-pointer ring-4 ring-orange-400/30 hover:ring-orange-400/50 transition-all duration-300"
            style={{
              boxShadow:
                '0 10px 40px rgba(249, 115, 22, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
            }}
            aria-label="View Thanksgiving Offer"
          >
            🎁
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full Modal */}
      <AnimatePresence>
        {isOpen && imageLoaded && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            {/* Blurred backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Modal container with animation - scales to fit viewport, no scrollbars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              style={{
                width: naturalSize.width,
                height: naturalSize.height + CTA_HEIGHT,
                transformOrigin: 'center center',
              }}
              className="relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/10"
            >
              {/* Close button */}
              <button
                type="button"
                className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 rounded-full bg-white/95 hover:bg-white p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                onClick={handleClose}
                aria-label="Close announcement"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Banner image - full view, keeps aspect ratio */}
              <div
                className="relative overflow-hidden bg-white"
                style={{ height: naturalSize.height }}
              >
                <img
                  src={BANNER_URL}
                  alt="Thanksgiving Mega Offer – Join our 1-year masterclass membership"
                  className="block w-full h-full object-contain"
                />

                {/* Gradient overlay for better button visibility */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
              </div>

              {/* CTA Button Section */}
              <div
                className="bg-gradient-to-br from-red-600 via-red-500 to-red-600 flex flex-col items-center justify-center gap-4 px-8"
                style={{ height: CTA_HEIGHT }}
              >
                <button
                  onClick={handleExtendMembership}
                  className="w-full group relative overflow-hidden bg-white text-red-600 font-semibold tracking-tight text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-100 transition-all duration-300 hover:bg-red-50"
                >
                  {/* Sparkle icon */}
                  <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600 group-hover:animate-spin transition-transform duration-300" />

                  {/* Button text */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-red-800 transition-all duration-300">
                      Extend Your Membership For 1 Year
                    </span>
                  </span>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </button>

                {/* Additional info text */}
                <p className="text-white/95 text-base text-center font-semibold tracking-wide">
                  Get 2000 Credit Points + Exclusive Benefits
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
