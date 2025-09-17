import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Clock, Zap, BookOpen } from "lucide-react";

const UPCOMING_COURSES = [
  {
    id: "iwrn-preparing-for-private-wealth-building",
    title: "Preparing for Private Wealth Building",
    course: "I Want Remedy Now",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/I-want-remedy/Lesson+14.png",
  },
  {
    id: "iwrn-booking-your-private-credit-session",
    title: "Booking Your Private Credit Session",
    course: "I Want Remedy Now",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/I-want-remedy/Lesson+15.png",
  },
  {
    id: "iwrn-full-credit-dispute-identity-theft-remedy-kit",
    title: "Full Credit Dispute & Identity Theft Remedy Kit",
    course: "I Want Remedy Now",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/I-want-remedy/Lesson+16.png",
  },
  {
    id: "become-private-part-11-common-carry-declaration",
    title: "Become Private - Part 11 ( Common Carry Declaration)",
    course: "Become Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Become-private-Recreated/LESSON+12.png",
  },
  {
    id: "become-private-part-12-public-proof-of-identification",
    title: "Become Private - Part 12 (Public Proof of Identification ( Patrick Devine Study))",
    course: "Become Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/become-private/Lesson+13.png",
  },
  {
    id: "become-private-part-13-overview-of-contract-law-implied-study",
    title: "Become Private - Part 13 (Overview of contract law  & Implied Study)",
    course: "Become Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/become-private/Lesson+14.png",
  },
  {
    id: "operate-private-business-trust-part-11-dont-of-the-business-trust",
    title: "Business Trust Part 11 ( Dont of the Business Trust)",
    course: "Operate Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Operate-Private/Lesson+11.png",
  },
  {
    id: "operate-private-business-trust-part-12-business-trust-sample-minutes",
    title: "Business Trust Part 12 ( Business Trust Sample Minutes)",
    course: "Operate Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Operate-Private/Lesson+12.png",
  },
  {
    id: "operate-private-business-trust-part-13-business-trust-terms-part-a",
    title: "Business Trust Part 13 ( Business Trust Terms - Part A)",
    course: "Operate Private",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Operate-Private/Lesson+13.png",
  },
  {
    id: "private-merchant-avoiding-chargebacks-and-censorship-in-private-systems",
    title: "Avoiding Chargebacks and Censorship in Private Systems",
    course: "Private Merchant",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Private-Merchant/Lesson+8.png",
  },
  {
    id: "private-merchant-understanding-irs-monitoring-of-public-merchant-accounts",
    title: "Understanding IRS Monitoring of Public Merchant Accounts",
    course: "Private Merchant",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Private-Merchant/Lesson+9.png",
  },
  {
    id: "private-merchant-exploring-private-payment-options",
    title: "Exploring Private Payment Options",
    course: "Private Merchant",
    image: "https://lesson-banners.s3.us-east-1.amazonaws.com/Private-Merchant/Lesson+10.png",
  },
];

function UpcomingCourses() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("All");

  const courseFilters = [
    "All",
    ...Array.from(new Set(UPCOMING_COURSES.map((c) => c.course))),
  ];

  const visibleCourses = selectedCourse === "All"
    ? UPCOMING_COURSES
    : UPCOMING_COURSES.filter((c) => c.course === selectedCourse);

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
      <div className="flex flex-wrap items-center justify-between mb-8 px-1 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming This Week</h2>
          <p className="text-gray-500">New content launching soon</p>
        </div>
        {/* Course filters (no layout change) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 mt-3 sm:mt-0 ml-0 sm:ml-6">
          {courseFilters.map((course) => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 
                ${selectedCourse === course
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md ring-1 ring-blue-500/40 hover:shadow-lg hover:brightness-105'
                  : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-blue-200 shadow-sm backdrop-blur supports-backdrop:backdrop-blur-md hover:shadow-md'}
              `}
              aria-pressed={selectedCourse === course}
            >
              {course}
            </button>
          ))}
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
        {visibleCourses.map((item, index) => (
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