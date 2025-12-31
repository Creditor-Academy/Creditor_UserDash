import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import newYearImg from '../../assets/newyearr.png';

const NewYearPopup = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  /* ⏳ Countdown */
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const newYear = new Date(2026, 0, 1);
      const diff = newYear - now;

      setTimeLeft({
        days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
        minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
        seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  /* 🧠 Scroll detection */
  useEffect(() => {
    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 700);
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {isPopupOpen && !isScrolling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3"
          >
            <motion.div
              initial={{ scale: 0.96, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 30 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="relative w-full max-w-4xl rounded-2xl bg-[#020617] border border-white/10 shadow-xl overflow-hidden"
            >
              <div className="relative grid grid-cols-1 md:grid-cols-2">

                {/* │ GOLD DIVIDER (DESKTOP ONLY) */}
                <div className="hidden md:block absolute top-8 bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="h-full w-px bg-gradient-to-b from-transparent via-yellow-400/70 to-transparent"
                  />
                </div>

                {/* 🎆 LEFT SECTION */}
                <div className="relative z-10 overflow-hidden p-8 md:p-10 flex flex-col justify-center items-center text-center">
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1546274527-9327167dc1f4')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/85 to-black/95" />

                  <motion.div
                    animate={{ opacity: [0.2, 0.35, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.22),transparent_65%)]"
                  />

                  <div className="relative z-20 flex flex-col items-center">
                    <div className="mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] tracking-widest uppercase text-yellow-300">
                      Welcome to the New Year
                    </div>

                    <motion.img
                      src={newYearImg}
                      alt="Happy New Year 2026"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="w-48 sm:w-56 md:w-64 mb-5 drop-shadow-[0_30px_45px_rgba(255,215,0,0.4)]"
                    />

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                      Step Into
                      <span className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                        2026
                      </span>
                    </h2>

                    <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xs">
                      A fresh year. A smarter way to learn.
                    </p>
                  </div>
                </div>

                {/* 🧠 RIGHT SECTION */}
                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center text-white">

                  {/* Close */}
                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3">
                    Start 2026 with
                    <span className="text-sky-400"> Athena LMS</span>
                  </h3>

                  <p className="text-slate-300 mb-6 text-sm sm:text-base">
                    Build courses faster, teach smarter, and scale knowledge with AI-powered tools.
                  </p>

                  {/* Countdown */}
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div
                        key={unit}
                        className="rounded-lg bg-white/5 border border-white/10 py-2 sm:py-3 text-center"
                      >
                        <div className="text-xl sm:text-2xl font-bold text-sky-400">
                          {String(value).padStart(2, '0')}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">
                          {unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsPopupOpen(false)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 sm:px-8 py-3 rounded-full shadow-lg"
                  >
                    <Gift className="w-4 h-4" />
                    Enter the New Year
                  </motion.button>

                  <p className="mt-3 text-[10px] sm:text-[11px] text-slate-500 text-center">
                    Let’s make 2026 your smartest year 🚀
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FLOATING GIFT (ALWAYS VISIBLE) ================= */}
      <div className="fixed bottom-5 right-5 z-[60]">
        <motion.button
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPopupOpen(true)}
          className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-full shadow-2xl ring-1 ring-white/20"
        >
          <Gift className="w-7 h-7 text-white" />
        </motion.button>
      </div>
    </>
  );
};

export default NewYearPopup;
