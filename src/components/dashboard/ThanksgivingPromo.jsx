import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_URL =
  'https://lesson-banners.s3.us-east-1.amazonaws.com/Upcoming_Courses_Banner/thanks+giving.png';

export default function ThanksgivingPromo({ onExtendMembership }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload the image before showing the modal
  useEffect(() => {
    const img = new Image();
    let timer;

    const handleLoad = () => {
      setImageLoaded(true);
      // Delay after image loads before showing modal (2.5 seconds)
      timer = setTimeout(() => setIsOpen(true), 1000);
    };

    const handleError = () => {
      // If image fails to load, still show after a delay
      setImageLoaded(true);
      timer = setTimeout(() => setIsOpen(true), 1000);
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

  const handleExtendMembership = () => {
    const membershipUrl =
      'https://quickclick.com/r/ylju71tqiulsto3pqq6w9mq9tbrnmn';
    window.open(membershipUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && imageLoaded && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal container with animation - smaller size with proper spacing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              type="button"
              className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 rounded-full bg-white/95 hover:bg-white p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              onClick={() => setIsOpen(false)}
              aria-label="Close announcement"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Banner image */}
            <div className="relative">
              <img
                src={BANNER_URL}
                alt="Thanksgiving Mega Offer – Join our 1-year masterclass membership"
                className="block w-full h-auto object-cover"
              />

              {/* Gradient overlay for better button visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* CTA Button Section */}
            <div className="bg-gradient-to-br from-red-600 via-red-500 to-red-600 p-4 sm:p-5 md:p-6">
              <button
                onClick={handleExtendMembership}
                className="w-full group relative overflow-hidden bg-white text-red-600 font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-100 transition-all duration-300 hover:bg-red-50"
              >
                {/* Sparkle icon */}
                <Sparkles className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-red-600 group-hover:animate-spin transition-transform duration-300" />

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
              <p className="text-white/90 text-xs sm:text-sm text-center mt-3 sm:mt-4 font-medium">
                Get 2000 Credit Points + Exclusive Benefits
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
