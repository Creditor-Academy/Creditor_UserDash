import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Clock, Zap, BookOpen } from "lucide-react";

const UPCOMING_COURSES = [
  {
    id: "become-private-acts-of-expatriation",
    title: "Acts of Expatriation (Multiple Name Variants)",
    course: "Become Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/become-private/Lesson+8.png",
  },
  {
    id: "sovereignty-101-commerce-banking-control",
    title: "Commerce, Banking, and Control",
    course: "Sovereignty 101",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/SOV/Lesson+5.png",
  },
  {
    id: "operate-private-business-trust-expenses-b",
    title: "Business Trust Expenses - Part B",
    course: "Operate Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Operate-Private/Lesson+7.png",
  },
  {
    id: "business-credit-ecredable-business-lift",
    title: "ECREDABLE Business Lift: Sign Up Here",
    course: "Business Credit",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Business-credit/Lesson+6.png",
  },
  {
    id: "iwrn-collections-chargeoffs-negative",
    title: "Collections, Charge-Offs, and Negative Accounts",
    course: "I Want Remedy Now",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/I-want-remedy/Lesson+6.png",
  },
];

function UpcomingCourses() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className="mb-16 relative max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming This Week</h2>
          <p className="text-gray-500">New content launching soon</p>
        </div>
      </div>

      {/* Scroll Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all border border-white/20 hover:shadow-xl hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all border border-white/20 hover:shadow-xl hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-6 px-1"
      >
        {UPCOMING_COURSES.map((item, index) => (
          <div
            key={item.id}
            className={`flex-shrink-0 w-80 rounded-xl border border-white/20 overflow-hidden snap-start 
              transition-all duration-500 group hover:opacity-100
              ${index > 1 ? 'opacity-80' : 'opacity-100'} 
              hover:shadow-2xl hover:-translate-y-2 hover:z-10 hover:border-blue-300/50`}
            style={{
              background: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Image with frosted glass overlay */}
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              
              {/* Animated Coming Soon badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 text-blue-600 backdrop-blur-sm flex items-center gap-1 shadow-sm animate-shimmer">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-gray-900 mb-1 text-base leading-snug line-clamp-2 group-hover:text-gray-800 transition-colors">
                {item.title}
              </h3>
              
              {/* Course category */}
              <div className="mb-3">
                <span className="inline-flex items-center text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                  <BookOpen className="h-3 w-3 mr-1.5 text-gray-500 group-hover:text-gray-600 transition-colors" />
                  {item.course}
                </span>
              </div>
              
              {/* Status row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100/50 pt-2 group-hover:text-gray-600 transition-colors">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Upcoming
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
                  New Content
                </span>
              </div>
            </div>
            
            {/* Hover effect elements */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full bg-blue-400/10 blur-[60px]"></div>
              <div className="absolute top-0 left-0 w-28 h-28 rounded-full bg-purple-400/10 blur-[60px]"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes shimmer {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default UpcomingCourses;