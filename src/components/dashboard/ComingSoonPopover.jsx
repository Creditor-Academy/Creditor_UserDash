import React, { useEffect, useState } from "react";

function ComingSoonPopover() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      // Show after scrolling 30% of the page height
      if (scrolled > document.documentElement.scrollHeight * 0.3) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Trigger once in case page already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  if (dismissed) return null;

  return (
    <div
      className={
        "fixed right-4 md:right-6 bottom-6 z-50 transition-all duration-500 " +
        (visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none")
      }
      role="dialog"
      aria-live="polite"
      aria-label="Coming soon notification"
    >
      <div className="w-[300px] rounded-2xl shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="relative h-28">
          <img
            src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Notifications.jpeg"
            alt="Notifications preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/70 text-white border border-white/30 shadow backdrop-blur-sm">
            Coming Soon
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-medium text-white">
            <span className="inline-block w-2 h-2 bg-emerald-300 rounded-full animate-pulse" /> Live Preview
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Notifications</h3>
          <p className="text-sm text-gray-600 mb-3">
            Real-time alerts for courses, tickets, and classes.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">Courses</span>
            <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-100">Tickets</span>
            <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-100">Classes</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPopover;