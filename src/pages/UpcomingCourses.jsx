import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Clock, Zap, BookOpen } from 'lucide-react';

const UPCOMING_COURSES = [
  // SOV 101
  {
    id: 'sov-101-the-shift-post-civil-war-legal-reconstruction',
    title: 'The Shift — Post-Civil War Legal Reconstruction',
    course: 'SOV 101',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(SOV)The+Shift+%E2%80%94+Post-Civil+War+Legal+Reconstruction.png',
  },
  {
    id: 'sov-101-understanding-legal-identity-public-administration',
    title: 'Understanding Legal Identity and Public Administration',
    course: 'SOV 101',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(SOV)Understanding+Legal+Identity+and+Public+Administration.png',
  },
  {
    id: 'sov-101-commerce-banking-control',
    title: 'Commerce, Banking, and Control',
    course: 'SOV 101',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(SOV)Commerce%2C+Banking%2C+and+Control.png',
  },

  // Become Private
  {
    id: 'become-private-act-of-expatriation-oath-of-allegiance',
    title: 'ACT OF EXPATRIATION AND OATH OF ALLEGIANCE',
    course: 'Become Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BP)ACT+OF+EXPATRIATION+AND+OATH+OF+ALLEGIANCE.png',
  },
  {
    id: 'become-private-declaration-of-copyright',
    title: 'Declaration of Copyright',
    course: 'Become Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BP)Declaration+of+Copyright.png',
  },
  {
    id: 'become-private-power-of-attorney-in-fact',
    title: 'POWER OF ATTORNEY IN FACT',
    course: 'Become Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BP)POWER+OF+ATTORNEY+IN+FACT.png',
  },
  {
    id: 'become-private-cancellation-all-prior-powers-of-attorney',
    title: 'Cancellation of All Prior Powers of Attorney',
    course: 'Become Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BP)Cancellation+of+All+Prior+Powers+of+Attorney.png',
  },

  // Business Credit
  {
    id: 'business-credit-tier-3-credit-unions-community-banks',
    title: 'Tier 3 – Credit Unions and Community Banks',
    course: 'Business Credit',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BC)Tier+3+%E2%80%93+Credit+Unions+and+Community+Banks.png',
  },
  {
    id: 'business-credit-tier-4-high-limit-non-pg-revolving-cards',
    title: 'Tier 4 – High-Limit Non-PG Revolving Store Cards & Fleet Cards',
    course: 'Business Credit',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BC)Tier+4+%E2%80%93+High-Limit+Non-PG+Revolving+Store+Cards+%26+Fleet+Cards.png',
  },
  {
    id: 'business-credit-tier-5-cash-flow-revenue-based-financing',
    title:
      'Tier 5 – True Cash-Flow & Revenue-Based Financing (No Collateral, No PG)',
    course: 'Business Credit',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(BC)Tier+5+%E2%80%93+True+Cash-Flow+%26+Revenue-Based+Financing+(No+Collateral%2C+No+PG).png',
  },

  // Operate Private
  {
    id: 'operate-private-advantages-business-trust',
    title: 'Advantages of the Business Trust',
    course: 'Operate Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(OP)Advantages+of+the+Business+Trust.png',
  },
  {
    id: 'operate-private-business-trust-structure-governance',
    title: 'The Business Trust – Structure & Governance',
    course: 'Operate Private',
    image:
      'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/(OP)The+Business+Trust+%E2%80%93+Structure+%26+Governance.png',
  },
];

function UpcomingCourses() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('All');

  const courseFilters = [
    'All',
    'SOV 101',
    ...Array.from(
      new Set(UPCOMING_COURSES.map(c => c.course).filter(c => c !== 'SOV 101'))
    ),
  ];

  const visibleCourses =
    selectedCourse === 'All'
      ? UPCOMING_COURSES
      : UPCOMING_COURSES.filter(c => c.course === selectedCourse);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

  const scroll = direction => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
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
      <div className="mb-8 px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Upcoming This Week
          </h2>
          <p className="text-gray-500">New content launching soon</p>
        </div>
        {/* Course filters placed below header */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          {courseFilters.map(course => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#6164ec] 
                ${
                  selectedCourse === course
                    ? 'bg-[#6164ec] text-white border-transparent shadow-md ring-1 ring-[#6164ec]/40 hover:shadow-lg hover:brightness-105'
                    : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:text-gray-900 hover:border-[#6164ec]/40 shadow-sm backdrop-blur supports-backdrop:backdrop-blur-md hover:shadow-md'
                }
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
          onClick={() => scroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all border border-white/20 hover:shadow-xl hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
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
        {visibleCourses.map(item => (
          <div
            key={item.id}
            className="flex-shrink-0 w-80 rounded-xl border border-white/40 overflow-hidden snap-start 
              transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2 hover:z-10 bg-white"
            style={{
              boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
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
